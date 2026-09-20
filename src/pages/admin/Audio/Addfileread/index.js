import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    FaMicrophone,
    FaUserEdit,
    FaCrown,
    FaPlay,
    FaCloudUploadAlt,
    FaSpinner,
    FaStop,
    FaSearch,
    FaCheckCircle,
    FaVolumeUp,
    FaFilter,
    FaMale,
    FaFemale,
    FaMapMarkerAlt,
    FaHeadphones,
    FaRedo,
} from "react-icons/fa";
import { useGetStoriesAD, useGetChaptersByStoryAD, useAddChapterAD, useGetTTSVoicesAD, generateTTSAudioAPI, useGetBackgroundMusicsPublic } from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VI_VOICES, TTS_VOICE_STORAGE_KEY, TTS_SPEED_STORAGE_KEY } from "../../../../config.js";
import { FaMusic, FaVolumeDown } from "react-icons/fa";
import "./style.scss";

const DEMO_TEXT = "Chào mừng bạn đến với Audio Story. Tôi là giọng đọc AI tự động, mang đến những giờ phút thư giãn tuyệt vời.";

const AddFileRead = () => {
    const [chapterName, setChapterName] = useState("");
    const [content, setContent] = useState("");

    // Load voice từ localStorage (persistent selection)
    const [selectedVoice, setSelectedVoice] = useState(() => {
        return localStorage.getItem(TTS_VOICE_STORAGE_KEY) || "ngochuyen";
    });

    // Load speed từ localStorage
    const [speed, setSpeed] = useState(() => {
        const saved = localStorage.getItem(TTS_SPEED_STORAGE_KEY);
return saved ? parseFloat(saved) : 1.0;
    });

    const [volume, setVolume] = useState(70);
    const [isVip, setIsVip] = useState(0);
    const [selectedStoryId, setSelectedStoryId] = useState("");
    const [ttsStatus, setTtsStatus] = useState("idle"); // idle, generating, error
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [demoPlayingVoice, setDemoPlayingVoice] = useState(null);

    // Nhạc nền (background music) - tùy chọn
    const [selectedBgMusicId, setSelectedBgMusicId] = useState("");
    const [bgVolume, setBgVolume] = useState(15); // Mặc định 15% (thấp hơn giọng đọc)
    const [bgPreviewUrl, setBgPreviewUrl] = useState(null);

    // Voice filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterGender, setFilterGender] = useState("all"); // all, Nữ, Nam
    const [filterRegion, setFilterRegion] = useState("all"); // all, Miền Bắc, Miền Nam, Miền Trung, Trung lập

    const audioPlayerRef = useRef(null);
    const previewAudioRef = useRef(null);
    const bgAudioRef = useRef(null);

    // Lấy danh sách truyện từ API
    const { data: allStories } = useGetStoriesAD();

// Danh sách giọng đọc lấy từ backend (quét model trong storage/app/tts/models)
    const { data: backendVoices } = useGetTTSVoicesAD();

    // Danh sách nhạc nền (công khai - chỉ admin đăng lên được)
    const { data: publicBgMusics } = useGetBackgroundMusicsPublic();

    // Lấy danh sách chương dựa trên truyện được chọn
    const { data: chapters, isLoading: loadingChapters } = useGetChaptersByStoryAD(selectedStoryId);

    // Hook thêm mới chương
    const addMutation = useAddChapterAD();

    const updatingStories = allStories?.filter(story => story.status === "updating") || [];

    // Voice list: ưu tiên dữ liệu từ backend, fallback về metadata tĩnh (VI_VOICES)
    const voices = useMemo(() => {
        if (backendVoices && backendVoices.length > 0) {
            // Map backend voice (id, name, sample_rate, espeak_voice, ...) với metadata UI
            return backendVoices.map((v) => {
                const meta = VI_VOICES.find((m) => m.id === v.id) || {};
                return {
                    id: v.id,
                    name: v.name || meta.name || v.id,
                    gender: meta.gender || "Nữ",
                    region: meta.region || "Miền Bắc",
                    desc: meta.desc || "Giọng đọc AI",
                };
            });
        }
        return VI_VOICES;
    }, [backendVoices]);

    // Filtered voices based on search and filter
    const filteredVoices = useMemo(() => {
        return voices.filter(v => {
            const matchSearch = !searchQuery ||
                v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchGender = filterGender === "all" || v.gender === filterGender;
            const matchRegion = filterRegion === "all" || v.region === filterRegion;
            return matchSearch && matchGender && matchRegion;
        });
    }, [voices, searchQuery, filterGender, filterRegion]);

    // Get selected voice info
    const selectedVoiceInfo = voices.find(v => v.id === selectedVoice) || voices[0];

    useEffect(() => {
        document.title = "📚 Thêm chương mới (AI TTS)";
        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
            }
        };
    }, []);

// Điều chỉnh âm lượng thực tế của audio preview nhạc nền theo thời gian thực
    useEffect(() => {
        if (bgAudioRef.current) {
            bgAudioRef.current.volume = bgVolume / 100;
        }
    }, [bgVolume]);

    // Save selectedVoice to localStorage whenever it changes
    const handleVoiceSelect = (voiceId) => {
        setSelectedVoice(voiceId);
        localStorage.setItem(TTS_VOICE_STORAGE_KEY, voiceId);
        toast.success(`✅ Đã chọn giọng: ${voices.find(v => v.id === voiceId)?.name || voiceId}`);
    };

    // Save speed to localStorage
    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
        localStorage.setItem(TTS_SPEED_STORAGE_KEY, newSpeed.toString());
    };

// Gọi backend sinh audio (trả về Blob WAV)
    const generateAudio = async (text, isPreview) => {
        const blob = await generateTTSAudioAPI({
            text,
            model: selectedVoice,
            speed,
            isPreview: isPreview ? 1 : 0,
            background_music_id: selectedBgMusicId || null,
            bg_volume: bgVolume,
        });
        return blob;
    };

    // Xử lý chọn nhạc nền
    const handleBgMusicSelect = (e) => {
        const id = e.target.value;
        setSelectedBgMusicId(id);

        // Tạo URL preview cho nhạc nền được chọn
        if (bgPreviewUrl) {
            URL.revokeObjectURL(bgPreviewUrl);
            setBgPreviewUrl(null);
        }
        if (id && publicBgMusics) {
            const selected = publicBgMusics.find(m => String(m.id) === String(id));
            if (selected?.audio_url) {
                setBgPreviewUrl(selected.audio_url);
            }
        }
    };

    // Tạo bản nghe thử cho 300 ký tự đầu tiên
    const handlePreview = async () => {
        if (!content.trim()) {
            toast.warn("Vui lòng nhập nội dung tập để nghe thử!");
            return;
        }

        try {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
            }

            setTtsStatus("generating");

            const previewText = content.substring(0, 300);
            const blob = await generateAudio(previewText, true);

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioBlob(blob);
            setTtsStatus("idle");
            toast.success("🎵 Đã tạo nghe thử thành công!");

            const player = new Audio(url);
            player.volume = volume / 100;
            audioPlayerRef.current = player;
            player.play().catch(err => console.warn("Auto-play failed:", err));
        } catch (err) {
            console.error(err);
            // Khi responseType=blob, error response cũng là Blob → phải đọc text
            let errMsg = "Lỗi tạo giọng đọc nghe thử.";
            if (err?.response?.data instanceof Blob) {
                try {
                    const errText = await err.response.data.text();
                    const errJson = JSON.parse(errText);
                    errMsg = errJson.message || errMsg;
                } catch (_) {}
            } else if (err?.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            toast.error(errMsg);
            setTtsStatus("idle");
        }
    };

    // Phát thử giọng nói từ bảng danh sách
    const handlePlayDemoVoice = async (voiceId) => {
        try {
            // Stop current demo if same voice
            if (demoPlayingVoice === voiceId) {
                if (previewAudioRef.current) {
                    previewAudioRef.current.pause();
                    previewAudioRef.current = null;
                }
                setDemoPlayingVoice(null);
                return;
            }

            // Stop any existing preview
            if (previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current = null;
            }

            setDemoPlayingVoice(voiceId);
            setTtsStatus("generating");

            const voiceName = voices.find(v => v.id === voiceId)?.name || voiceId;
            const demoText = `Xin chào! Tôi là ${voiceName}. ${DEMO_TEXT}`;

            const blob = await generateTTSAudioAPI({
                text: demoText,
                model: voiceId,
                speed: 1.0,
                isPreview: 1,
            });

            setTtsStatus("idle");
            const url = URL.createObjectURL(blob);
            const player = new Audio(url);
            player.volume = volume / 100;
            previewAudioRef.current = player;

            player.onended = () => {
                setDemoPlayingVoice(null);
                URL.revokeObjectURL(url);
            };

            player.onerror = () => {
                setDemoPlayingVoice(null);
            };

            player.play().catch(err => {
                console.warn("Auto-play failed:", err);
                setDemoPlayingVoice(null);
                setTtsStatus("idle");
            });
        } catch (err) {
            console.error(err);
            // Khi responseType=blob, error response cũng là Blob → phải đọc text
            let errMsg = "Lỗi phát thử giọng.";
            if (err?.response?.data instanceof Blob) {
                try {
                    const errText = await err.response.data.text();
                    const errJson = JSON.parse(errText);
                    errMsg = errJson.message || errMsg;
                } catch (_) {}
            } else if (err?.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            toast.error(errMsg);
            setDemoPlayingVoice(null);
            setTtsStatus("idle");
        }
    };

    // Xử lý submit toàn bộ văn bản và upload lên server
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStoryId) {
            toast.warn("Vui lòng chọn một bộ truyện trước!");
            return;
        }
        if (!chapterName.trim()) {
            toast.warn("Vui lòng nhập tên tập!");
            return;
        }
        if (!content.trim()) {
            toast.warn("Vui lòng nhập nội dung tập!");
            return;
        }

        try {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }

            setTtsStatus("generating");

            const blob = await generateAudio(content, false);

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioBlob(blob);

            // Tiến hành tải lên file audio đã sinh ra
            uploadAudioFile(blob);
        } catch (err) {
            console.error(err);
            // Khi responseType=blob, error response cũng là Blob → phải đọc text
            let errMsg = "Lỗi tạo audio.";
            if (err?.response?.data instanceof Blob) {
                try {
                    const errText = await err.response.data.text();
                    const errJson = JSON.parse(errText);
                    errMsg = errJson.message || errMsg;
                } catch (_) {}
            } else if (err?.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            toast.error(errMsg);
            setTtsStatus("idle");
        }
    };

    const uploadAudioFile = (blob) => {
        const audioFile = new File([blob], `${chapterName}.wav`, { type: "audio/wav" });

        const data = new FormData();
        data.append("story_id", selectedStoryId);
        data.append("chapter_name", chapterName);
        data.append("audio_file", audioFile);
        data.append("is_vip", isVip);

        const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
        data.append("admin_name", adminInfo?.name || "Admin");

        addMutation.mutate(data, {
            onSuccess: () => {
                toast.success("🎉 Đăng tải chương truyện thành công!");
                setTtsStatus("idle");
                setChapterName("");
                setContent("");
                setAudioUrl(null);
                setAudioBlob(null);
            },
            onError: (err) => {
                const errorMsg = err.response?.data?.message || "Không thể đăng tải chương";
                toast.error(`Lỗi: ${errorMsg}`);
                setTtsStatus("idle");
            },
        });
    };

    // Get unique regions for filter
    const regions = ["all", ...new Set(voices.map(v => v.region))];

    return (
        <div className="addChapter">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            <div className="pageHeader">
                <h2>📚 Thêm chương mới</h2>
                <p>Thêm tập truyện mới với tính năng chuyển đổi văn bản thành giọng nói AI (Piper-TTS chạy tại máy chủ)</p>
            </div>

            {/* Current Voice Banner */}
            <div className="currentVoiceBanner">
                <div className="currentVoiceInfo">
                    <FaHeadphones className="bannerIcon" />
                    <div>
                        <span className="bannerLabel">Giọng đọc đang dùng:</span>
                        <span className="bannerVoiceName">
                            {selectedVoiceInfo?.gender === "Nữ" ? <FaFemale /> : <FaMale />}
                            {" "}{selectedVoiceInfo?.name}
                        </span>
                        <span className="bannerRegion">{selectedVoiceInfo?.region}</span>
                    </div>
                </div>
                <div className="bannerSpeed">
                    <FaVolumeUp />
                    <span>Tốc độ: {speed}x</span>
                </div>
            </div>

            <form className="chapterForm" onSubmit={handleSubmit}>
                {/* Chapter Info */}
                <div className="card">
                    <h3>Thông tin tập</h3>
                    <div className="grid">
                        <div className="formGroup">
                            <label>Chọn bộ truyện</label>
                            <select
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn bộ truyện --</option>
                                {updatingStories.map((story) => (
                                    <option key={story.id} value={story.id}>
                                        {story.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Tên tập</label>
                            <input
                                type="text"
                                placeholder="Nhập tên tập..."
                                value={chapterName}
                                onChange={(e) => setChapterName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="chapterTable">
                        <div className="tableHeader">
                            <h4>📚 Danh sách tập đã có</h4>
                            {chapters && chapters.length > 0 && (
                                <span>{chapters.length} tập</span>
                            )}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Tên tập</th>
                                    <th width="120">Trạng thái</th>
                                    <th width="140">Tác giả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!selectedStoryId ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            <div className="empty-state" style={{ padding: "20px", color: "#64748b" }}>
                                                <p>Vui lòng chọn một bộ truyện để hiển thị danh sách tập</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : loadingChapters ? (
                                    <tr>
                                        <td colSpan="3" className="text-center" style={{ padding: "20px" }}>
                                            Đang tải danh sách tập...
                                        </td>
                                    </tr>
                                ) : chapters && chapters.length > 0 ? (
                                    chapters.map((ch) => (
                                        <tr key={ch.id}>
                                            <td>{ch.chapter_name}</td>
                                            <td>
                                                {parseInt(ch.is_vip) === 1 ? (
                                                    <span className="badge vip">VIP</span>
                                                ) : (
                                                    <span className="badge free">FREE</span>
                                                )}
                                            </td>
                                            <td>{ch.author_post}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            <div className="empty-state" style={{ padding: "20px", color: "#64748b" }}>
                                                <p>Bộ truyện này hiện chưa có tập nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TTS Configuration */}
                <div className="card">
                    <h3>
                        <FaMicrophone />
                        Cấu hình giọng đọc AI
                    </h3>

                    <div className="grid">
                        <div className="formGroup">
                            <label>Giọng đọc đang chọn</label>
                            <div className="selectedVoiceDisplay">
                                <span className="voiceBadge">
                                    {selectedVoiceInfo?.gender === "Nữ" ? <FaFemale /> : <FaMale />}
                                    {" "}{selectedVoiceInfo?.name}
                                </span>
                                <span className="regionTag">{selectedVoiceInfo?.region}</span>
                                <p className="voiceDesc">{selectedVoiceInfo?.desc}</p>
                            </div>
                        </div>

                        <div className="formGroup">
                            <label>Tốc độ đọc</label>
                            <select value={speed} onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}>
                                <option value={0.7}>0.7x (Rất chậm)</option>
                                <option value={0.8}>0.8x (Chậm)</option>
                                <option value={0.9}>0.9x (Hơi chậm)</option>
                                <option value={1.0}>1.0x (Bình thường)</option>
                                <option value={1.1}>1.1x (Hơi nhanh)</option>
                                <option value={1.2}>1.2x (Nhanh)</option>
                                <option value={1.5}>1.5x (Rất nhanh)</option>
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Âm lượng nghe thử ({volume}%)</label>
                            <div className="volumeControl">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                />
                                <span>{volume}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Music - Nhạc nền */}
                <div className="card">
                    <h3>
                        <FaMusic />
                        Nhạc nền (Tùy chọn)
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "18px", marginTop: "-10px" }}>
                        Chọn nhạc nền để trộn vào giọng đọc. Âm lượng nhạc nền sẽ được đặt thấp hơn giọng đọc.
                        Bạn cần upload nhạc nền trước ở trang <strong>"Quản lý nhạc nền"</strong>.
                    </p>

                    <div className="grid">
                        <div className="formGroup">
                            <label>
                                <FaMusic /> Chọn nhạc nền
                            </label>
                            <select value={selectedBgMusicId} onChange={handleBgMusicSelect}>
                                <option value="">-- Không dùng nhạc nền --</option>
                                {publicBgMusics && publicBgMusics.length > 0 ? (
                                    publicBgMusics.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.title}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Chưa có nhạc nền nào</option>
                                )}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>
                                <FaVolumeDown /> Âm lượng nhạc nền ({bgVolume}%)
                            </label>
                            <div className="volumeControl">
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="1"
                                    value={bgVolume}
                                    onChange={(e) => setBgVolume(parseInt(e.target.value))}
                                />
                                <span>{bgVolume}%</span>
                            </div>
                            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                Giá trị thấp (0-50%) giúp nhạc nền không át giọng đọc.
                            </p>
                        </div>

{bgPreviewUrl && (
                            <div className="formGroup" style={{ gridColumn: "1 / -1" }}>
                                <label>Nghe thử nhạc nền (âm lượng thực tế: {bgVolume}%)</label>
                                <audio
                                    ref={bgAudioRef}
                                    controls
                                    src={bgPreviewUrl}
                                    style={{ width: "100%" }}
                                    onPlay={(e) => { e.currentTarget.volume = bgVolume / 100; }}
                                />
                                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                                    💡 Kéo thanh "Âm lượng nhạc nền" bên trên để nghe trước mức độ trộn thực tế trước khi tải lên.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Access Control */}
                <div className="card">
                    <h3>
                        <FaUserEdit />
                        Tuỳ chỉnh quyền truy cập
                    </h3>

                    <div className="grid">
                        <div className="formGroup">
                            <label>
                                <FaCrown />
                                <span> Quyền truy cập</span>
                            </label>
                            <select value={isVip} onChange={(e) => setIsVip(parseInt(e.target.value))}>
                                <option value={0}>FREE (Miễn phí)</option>
                                <option value={1}>VIP (Hội viên)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Generated Audio Player */}
                {audioUrl && (
                    <div className="card generatedAudioCard">
                        <h3>🎙 Âm thanh vừa sinh</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <audio controls src={audioUrl} style={{ flex: 1 }} />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="card">
                    <h3>Nội dung tập</h3>
                    <textarea
                        className="chapterContent"
                        rows="14"
                        placeholder="Nhập hoặc dán nội dung văn bản tập truyện vào đây..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <p className="contentHint">
                        {content.length} ký tự • Nghe thử sẽ đọc 300 ký tự đầu
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="actionButtons">
                    <button
                        className="preview"
                        type="button"
                        onClick={handlePreview}
                        disabled={ttsStatus !== "idle" || addMutation.isPending}
                    >
                        {ttsStatus === "generating" ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Đang chuyển đổi...
                            </>
                        ) : (
                            <>
                                <FaPlay />
                                Nghe thử AI
                            </>
                        )}
                    </button>

                    <button
                        className="publish"
                        type="submit"
                        disabled={ttsStatus !== "idle" || addMutation.isPending}
                    >
                        {addMutation.isPending ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Đang tải lên...
                            </>
                        ) : (
                            <>
                                <FaCloudUploadAlt />
                                Đăng tải audio
                            </>
                        )}
                    </button>
                </div>
            </form>

            <hr />

            {/* Voice Selector Panel */}
            <div className="voiceCard">
                <div className="voiceHeader">
                    <h3>🎙 Danh sách giọng đọc AI ({voices.length} giọng)</h3>
                    <p>Nhấn <strong>"Nghe thử"</strong> để xem trước, nhấn <strong>"Chọn giọng"</strong> để áp dụng.</p>
                </div>

                {/* Filters */}
                <div className="voiceFilters">
                    <div className="searchBox">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giọng đọc..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clearSearch" onClick={() => setSearchQuery("")}>×</button>
                        )}
                    </div>

                    <div className="filterGroup">
                        <FaFilter />
                        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                            <option value="all">Tất cả giới tính</option>
                            <option value="Nữ">Giọng Nữ</option>
                            <option value="Nam">Giọng Nam</option>
                        </select>

                        <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                            <option value="all">Tất cả vùng miền</option>
                            {regions.filter(r => r !== "all").map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>

                        {(searchQuery || filterGender !== "all" || filterRegion !== "all") && (
                            <button
                                className="resetFilters"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterGender("all");
                                    setFilterRegion("all");
                                }}
                            >
                                <FaRedo /> Đặt lại
                            </button>
                        )}
                    </div>

                    <span className="voiceCount">{filteredVoices.length} giọng</span>
                </div>

                {/* Voice Grid */}
                <div className="voiceGrid">
                    {filteredVoices.length === 0 ? (
                        <div className="noVoices">
                            <p>Không tìm thấy giọng nào phù hợp với bộ lọc.</p>
                        </div>
                    ) : (
                        filteredVoices.map((v) => (
                            <div
                                key={v.id}
                                className={`voiceItem ${selectedVoice === v.id ? "selected" : ""} ${demoPlayingVoice === v.id ? "playing" : ""}`}
                            >
                                <div className="voiceItemHeader">
                                    <div className="voiceNameGroup">
                                        <span className="voiceGenderIcon">
                                            {v.gender === "Nữ" ? <FaFemale /> : <FaMale />}
                                        </span>
                                        <div>
                                            <strong className="voiceItemName">{v.name}</strong>
                                            {selectedVoice === v.id && (
                                                <FaCheckCircle className="selectedIcon" title="Đang sử dụng" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="voiceTags">
                                        <span className={`genderTag ${v.gender === "Nữ" ? "female" : "male"}`}>
                                            {v.gender}
                                        </span>
                                        <span className="regionTagSmall">
                                            <FaMapMarkerAlt />
                                            {v.region}
                                        </span>
                                    </div>
                                </div>

                                <p className="voiceItemDesc">{v.desc}</p>

                                <div className="voiceItemActions">
                                    <button
                                        type="button"
                                        className={`btnDemo ${demoPlayingVoice === v.id ? "playing" : ""}`}
                                        onClick={() => handlePlayDemoVoice(v.id)}
                                        disabled={ttsStatus !== "idle" && demoPlayingVoice !== v.id}
                                        title="Nghe thử giọng này"
                                    >
                                        {demoPlayingVoice === v.id ? (
                                            <>
                                                <FaStop /> Dừng
                                            </>
                                        ) : (
                                            <>
                                                <FaPlay /> Nghe thử
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className={`btnSelect ${selectedVoice === v.id ? "active" : ""}`}
                                        onClick={() => handleVoiceSelect(v.id)}
                                        title={selectedVoice === v.id ? "Đang sử dụng" : "Chọn giọng này"}
                                    >
                                        {selectedVoice === v.id ? (
                                            <>
                                                <FaCheckCircle /> Đang dùng
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle /> Chọn giọng
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {ttsStatus !== "idle" && !demoPlayingVoice && (
                <div className="tts-loading-overlay">
                    <div className="tts-loading-content">
                        <FaSpinner className="spinner-icon" />
                        <p>Đang xử lý chuyển đổi văn bản sang âm thanh tại máy chủ...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFileRead;
