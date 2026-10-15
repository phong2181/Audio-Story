import React, { useState, useEffect, useRef, useMemo } from "react";
import { NavLink } from "react-router-dom";
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
    FaMusic,
    FaVolumeDown,
    FaArrowLeft,
    FaListUl,
    FaBook,
    FaTimes,
    FaUnlock,
    FaCheck,
    FaClock,
    FaFileAlt,
    FaSlidersH,
} from "react-icons/fa";
import { useGetStoriesAD, useGetChaptersByStoryAD, useAddChapterAD, useGetTTSVoicesAD, generateTTSAudioAPI, useGetBackgroundMusicsPublic } from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VI_VOICES, TTS_VOICE_STORAGE_KEY, TTS_SPEED_STORAGE_KEY } from "../../../../config.js";
import { STORAGE_URL } from "config/config";
import { ROUTES } from "utils/route";
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
    const [progress, setProgress] = useState(0);
    const progressTimerRef = useRef(null);

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

    const storiesList = useMemo(() => {
        if (!allStories) return [];
        if (Array.isArray(allStories)) return allStories;
        if (Array.isArray(allStories.data)) return allStories.data;
        return [];
    }, [allStories]);

    const currentStory = useMemo(() => {
        return storiesList.find((s) => String(s.id) === String(selectedStoryId));
    }, [storiesList, selectedStoryId]);

    const getThumbnailUrl = (thumbnail) => {
        if (!thumbnail) return "/placeholder.png";
        if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
            return thumbnail;
        }
        return `${STORAGE_URL}${thumbnail}`;
    };

    // Danh sách giọng đọc lấy từ backend (quét model trong storage/app/tts/models)
    const { data: backendVoices } = useGetTTSVoicesAD();

    // Danh sách nhạc nền (công khai - chỉ admin đăng lên được)
    const { data: publicBgMusics } = useGetBackgroundMusicsPublic();

    // Lấy danh sách chương dựa trên truyện được chọn
    const { data: chapters, isLoading: loadingChapters } = useGetChaptersByStoryAD(selectedStoryId);

    // Hook thêm mới chương
    const addMutation = useAddChapterAD();

    const updatingStories = storiesList;

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
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
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

    // Bắt đầu chạy tiến trình phần trăm giả lập thông minh
    const startProgress = (isShort = false, textLength = 0) => {
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
        }
        setProgress(5);

        // Ước tính thời lượng: nghe thử 3-4s, văn bản dài dựa theo số ký tự
        const length = isShort ? 300 : (textLength || content.length || 1000);
        const targetDuration = isShort 
            ? 3500 
            : Math.min(60000, Math.max(8000, (length / 200) * 1200));

        const stepInterval = 100;
        const totalSteps = targetDuration / stepInterval;

        let currentStep = 0;
        progressTimerRef.current = setInterval(() => {
            currentStep++;
            // Tăng mượt từ 5% đến tối đa 95% trong khi chờ backend phản hồi
            const calculatedPercent = Math.min(95, Math.round((currentStep / totalSteps) * 90) + 5);
            setProgress((prev) => (calculatedPercent > prev ? calculatedPercent : prev));
        }, stepInterval);
    };

    // Khi backend trả về kết quả thành công -> nhảy tới 100% rồi đóng modal
    const completeProgress = (onFinish) => {
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
        setProgress(100);
        setTimeout(() => {
            setTtsStatus("idle");
            setProgress(0);
            if (onFinish) onFinish();
        }, 350);
    };

    // Dừng tiến trình khi có lỗi
    const stopProgress = () => {
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
        setTtsStatus("idle");
        setProgress(0);
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
            startProgress(true, 300);

            const previewText = content.substring(0, 300);
            const blob = await generateAudio(previewText, true);

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioBlob(blob);

            completeProgress(() => {
                toast.success("🎵 Đã tạo nghe thử thành công!");
                const player = new Audio(url);
                player.volume = volume / 100;
                audioPlayerRef.current = player;
                player.play().catch(err => console.warn("Auto-play failed:", err));
            });
        } catch (err) {
            console.error(err);
            stopProgress();
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
            startProgress(false, content.length);

            const blob = await generateAudio(content, false);

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioBlob(blob);

            completeProgress(() => {
                // Tiến hành tải lên file audio đã sinh ra
                uploadAudioFile(blob);
            });
        } catch (err) {
            console.error(err);
            stopProgress();
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

    const wordCount = useMemo(() => {
        return content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    }, [content]);

    const estDuration = useMemo(() => {
        if (!content.trim()) return "0s";
        const seconds = Math.ceil((wordCount / (140 * speed)) * 60);
        if (seconds < 60) return `~${seconds} giây`;
        const mins = Math.floor(seconds / 60);
        const remSecs = seconds % 60;
        return `~${mins} phút ${remSecs > 0 ? remSecs + "s" : ""}`;
    }, [wordCount, speed, content]);

    return (
        <div className="wp-add-chapter-page">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            {/* Header kiểu WordPress Admin */}
            <div className="wp-page-header">
                <div className="wp-header-left">
                    <h1 className="wp-page-title">
                        <FaMicrophone className="title-icon" />
                        Thêm chương mới (AI Studio)
                    </h1>
                    <p className="wp-page-subtitle">
                        Chuyển đổi văn bản thành giọng đọc truyền cảm tự động bằng công nghệ AI chạy trực tiếp tại máy chủ
                    </p>
                </div>

                <div className="wp-header-actions">
                    <NavLink
                        to={ROUTES.ADMIN.AUDIO_ADD}
                        className="wp-btn-action"
                        title="Về trang danh sách quản lý chương"
                    >
                        <FaListUl /> Quản lý chương
                    </NavLink>
                    <NavLink
                        to={ROUTES.ADMIN.MANAGE_COMMENTS_AUDIO}
                        className="wp-btn-action"
                        title="Về trang danh sách bộ truyện"
                    >
                        <FaBook /> Danh sách bộ truyện
                    </NavLink>
                </div>
            </div>

            {/* Form & WordPress 2-Column Metabox Layout */}
            <form onSubmit={handleSubmit} className="wp-editor-form">
                <div className="wp-editor-columns">
                    {/* CỘT CHÍNH (BÊN TRÁI - 67%) */}
                    <div className="wp-main-column">
                        {/* Metabox 1: Thông tin bộ truyện & Tên chương */}
                        <div className="wp-metabox">
                            <div className="metabox-header">
                                <h3>
                                    <FaBook className="metabox-icon" /> Thông tin bộ truyện & Tên tập
                                </h3>
                            </div>
                            <div className="metabox-body">
                                <div className="wp-form-grid">
                                    <div className="wp-form-group">
                                        <label className="wp-label">
                                            Chọn bộ truyện <span className="req">*</span>
                                        </label>
                                        <select
                                            className="wp-select"
                                            value={selectedStoryId}
                                            onChange={(e) => setSelectedStoryId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Chọn bộ truyện --</option>
                                            {updatingStories.map((story) => (
                                                <option key={story.id} value={story.id}>
                                                    {story.title} {story.status === "updating" ? "(Đang cập nhật)" : "(Hoàn thành)"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="wp-form-group">
                                        <label className="wp-label">
                                            Tên chương truyện <span className="req">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="wp-input"
                                            placeholder="Ví dụ: Chương 1: Tiết tử / Chương 1: Khởi đầu..."
                                            value={chapterName}
                                            onChange={(e) => setChapterName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {currentStory && (
                                    <div className="wp-story-preview-card">
                                        <img
                                            src={getThumbnailUrl(currentStory.thumbnail)}
                                            alt={currentStory.title}
                                            className="story-mini-cover"
                                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                                        />
                                        <div className="story-mini-info">
                                            <h4 className="story-title">{currentStory.title}</h4>
                                            <div className="story-meta-tags">
                                                <span className="tag author">Tác giả: {currentStory.author || "Chưa rõ"}</span>
                                                <span className="tag category">{currentStory.category?.name || "Chưa phân loại"}</span>
                                                <span className="tag count">
                                                    <FaHeadphones /> {chapters?.length || 0} chương đã đăng
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metabox 2: Trình soạn thảo văn bản chương (Editor Box) */}
                        <div className="wp-metabox">
                            <div className="metabox-header flex-between">
                                <h3>
                                    <FaFileAlt className="metabox-icon" /> Nội dung văn bản tập truyện
                                </h3>
                                <div className="content-stats">
                                    <span className="stat-badge chars">{content.length} ký tự</span>
                                    <span className="stat-badge words">{wordCount} từ</span>
                                    <span className="stat-badge duration">
                                        <FaClock /> {estDuration}
                                    </span>
                                </div>
                            </div>

                            <div className="metabox-body">
                                <textarea
                                    className="wp-chapter-textarea"
                                    rows={13}
                                    placeholder="Dán hoặc nhập nội dung văn bản tập truyện vào đây. AI sẽ tự động đọc diễn cảm theo từng câu..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />

                                <div className="textarea-footer-hint">
                                    <span>💡 Bấm nút <strong>"Nghe thử AI"</strong> ở cột bên phải để kiểm tra trước 300 ký tự đầu.</span>
                                </div>

                                {/* Audio vừa sinh nếu có */}
                                {audioUrl && (
                                    <div className="wp-generated-audio-box">
                                        <div className="audio-box-header">
                                            <span className="audio-box-title">
                                                <FaHeadphones /> Âm thanh AI vừa sinh (Sẵn sàng xuất bản)
                                            </span>
                                            <span className="audio-box-badge">Tập tin WAV</span>
                                        </div>
                                        <audio controls src={audioUrl} className="wp-audio-player" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metabox 3: Phối nhạc nền (Tùy chọn) */}
                        <div className="wp-metabox">
                            <div className="metabox-header">
                                <h3>
                                    <FaMusic className="metabox-icon" /> Phối nhạc nền (Tùy chọn)
                                </h3>
                            </div>
                            <div className="metabox-body">
                                <p className="metabox-desc">
                                    Chọn bài nhạc nền nhẹ nhàng để tự động hòa âm cùng giọng đọc AI. Âm lượng nhạc nền nên để từ 10% - 20% để không át tiếng đọc.
                                </p>

                                <div className="wp-form-grid">
                                    <div className="wp-form-group">
                                        <label className="wp-label">Chọn nhạc nền</label>
                                        <select
                                            className="wp-select"
                                            value={selectedBgMusicId}
                                            onChange={handleBgMusicSelect}
                                        >
                                            <option value="">-- Không sử dụng nhạc nền --</option>
                                            {publicBgMusics && publicBgMusics.length > 0 ? (
                                                publicBgMusics.map((m) => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.title}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Chưa có nhạc nền trong thư viện</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="wp-form-group">
                                        <label className="wp-label">
                                            Âm lượng nhạc nền ({bgVolume}%)
                                        </label>
                                        <div className="wp-range-slider-wrap">
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                step="1"
                                                value={bgVolume}
                                                onChange={(e) => setBgVolume(parseInt(e.target.value))}
                                                className="wp-range"
                                            />
                                            <span className="range-val">{bgVolume}%</span>
                                        </div>
                                    </div>
                                </div>

                                {bgPreviewUrl && (
                                    <div className="wp-bg-preview-box">
                                        <label className="sub-label">Nghe thử nhạc nền (Âm lượng áp dụng: {bgVolume}%):</label>
                                        <audio
                                            ref={bgAudioRef}
                                            controls
                                            src={bgPreviewUrl}
                                            className="wp-audio-player mini"
                                            onPlay={(e) => { e.currentTarget.volume = bgVolume / 100; }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metabox 4: Danh sách các chương đã đăng */}
                        <div className="wp-metabox">
                            <div className="metabox-header flex-between">
                                <h3>
                                    <FaListUl className="metabox-icon" /> Danh sách các chương đã có của bộ truyện
                                </h3>
                                {chapters && chapters.length > 0 && (
                                    <span className="wp-count-pill">{chapters.length} chương</span>
                                )}
                            </div>

                            <div className="metabox-body nopadding">
                                <table className="wp-chapters-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên tập</th>
                                            <th width="120">Quyền truy cập</th>
                                            <th width="140">Người đăng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedStoryId ? (
                                            <tr>
                                                <td colSpan="4" className="empty-cell">
                                                    Vui lòng chọn một bộ truyện ở trên để xem các chương đã đăng.
                                                </td>
                                            </tr>
                                        ) : loadingChapters ? (
                                            <tr>
                                                <td colSpan="4" className="empty-cell">
                                                    Đang tải danh sách chương...
                                                </td>
                                            </tr>
                                        ) : chapters && chapters.length > 0 ? (
                                            chapters.map((ch, idx) => (
                                                <tr key={ch.id}>
                                                    <td className="num-cell">#{ch.chapter_number || idx + 1}</td>
                                                    <td className="title-cell">
                                                        <strong>{ch.chapter_name}</strong>
                                                    </td>
                                                    <td>
                                                        {parseInt(ch.is_vip) === 1 ? (
                                                            <span className="pill-vip"><FaCrown /> VIP</span>
                                                        ) : (
                                                            <span className="pill-free"><FaUnlock /> Miễn phí</span>
                                                        )}
                                                    </td>
                                                    <td className="author-cell">{ch.author_post || "Admin"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="empty-cell">
                                                    Bộ truyện này hiện chưa có chương nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHỤ (BÊN PHẢI - 33% - WordPress Sidebar Metaboxes) */}
                    <div className="wp-sidebar-column">
                        {/* Metabox 1: Đăng tải & Xuất bản (Publish Box) */}
                        <div className="wp-metabox publish-metabox">
                            <div className="metabox-header">
                                <h3>Xuất bản & Hành động</h3>
                            </div>
                            <div className="metabox-body">
                                <div className="publish-status-row">
                                    <span className="status-label">Trạng thái xử lý:</span>
                                    <span className={`status-badge ${ttsStatus === "generating" ? "processing" : "ready"}`}>
                                        {ttsStatus === "generating" ? (
                                            <>
                                                <FaSpinner className="spin" /> Đang tạo âm thanh...
                                            </>
                                        ) : (
                                            "Sẵn sàng xuất bản"
                                        )}
                                    </span>
                                </div>

                                <div className="publish-access-group">
                                    <label className="wp-label">Quyền truy cập của người nghe:</label>
                                    <div className="access-radio-options">
                                        <label className={`access-card ${isVip === 0 ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="is_vip"
                                                value="0"
                                                checked={isVip === 0}
                                                onChange={() => setIsVip(0)}
                                            />
                                            <div className="access-info">
                                                <span className="access-title"><FaUnlock /> Miễn phí (Free)</span>
                                                <span className="access-desc">Tất cả người nghe đều có thể thưởng thức</span>
                                            </div>
                                        </label>

                                        <label className={`access-card ${isVip === 1 ? "selected vip" : ""}`}>
                                            <input
                                                type="radio"
                                                name="is_vip"
                                                value="1"
                                                checked={isVip === 1}
                                                onChange={() => setIsVip(1)}
                                            />
                                            <div className="access-info">
                                                <span className="access-title"><FaCrown /> Gói Hội viên VIP</span>
                                                <span className="access-desc">Chỉ thính giả có gói VIP mới được nghe</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="metabox-footer">
                                <button
                                    type="button"
                                    className="wp-btn-preview"
                                    onClick={handlePreview}
                                    disabled={ttsStatus !== "idle" || addMutation.isPending}
                                    title="Nghe thử 300 ký tự đầu tiên"
                                >
                                    {ttsStatus === "generating" ? (
                                        <>
                                            <FaSpinner className="spin" /> Đang chuyển đổi...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlay /> Nghe thử AI
                                        </>
                                    )}
                                </button>

                                <button
                                    type="submit"
                                    className="wp-btn-publish"
                                    disabled={ttsStatus !== "idle" || addMutation.isPending}
                                >
                                    {addMutation.isPending ? (
                                        <>
                                            <FaSpinner className="spin" /> Đang đăng tải...
                                        </>
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt /> Đăng tải audio
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Metabox 2: Giọng đọc AI đang chọn (Active Voice Box) */}
                        <div className="wp-metabox">
                            <div className="metabox-header">
                                <h3>
                                    <FaHeadphones className="metabox-icon" /> Giọng đọc AI đang chọn
                                </h3>
                            </div>
                            <div className="metabox-body">
                                <div className="active-voice-card">
                                    <div className="active-voice-top">
                                        <div className="voice-icon-box">
                                            {selectedVoiceInfo?.gender === "Nữ" ? <FaFemale className="gender-fem" /> : <FaMale className="gender-mal" />}
                                        </div>
                                        <div className="voice-name-box">
                                            <h4 className="voice-name">{selectedVoiceInfo?.name}</h4>
                                            <span className="voice-region-tag">{selectedVoiceInfo?.region}</span>
                                        </div>
                                    </div>
                                    <p className="voice-desc-text">{selectedVoiceInfo?.desc}</p>
                                </div>

                                <div className="wp-sidebar-settings">
                                    <div className="setting-row">
                                        <label className="setting-label">Tốc độ đọc giọng AI:</label>
                                        <select
                                            className="wp-select"
                                            value={speed}
                                            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                                        >
                                            <option value={0.7}>0.7x (Rất chậm)</option>
                                            <option value={0.8}>0.8x (Chậm vừa)</option>
                                            <option value={0.9}>0.9x (Hơi chậm)</option>
                                            <option value={1.0}>1.0x (Tốc độ chuẩn)</option>
                                            <option value={1.1}>1.1x (Hơi nhanh)</option>
                                            <option value={1.2}>1.2x (Nhanh)</option>
                                            <option value={1.5}>1.5x (Rất nhanh)</option>
                                        </select>
                                    </div>

                                    <div className="setting-row">
                                        <label className="setting-label">Âm lượng nghe thử ({volume}%):</label>
                                        <div className="wp-range-slider-wrap">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volume}
                                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                                className="wp-range"
                                            />
                                            <span className="range-val">{volume}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metabox 3: Thư viện giọng đọc AI (Voice Library Box) */}
                        <div className="wp-metabox">
                            <div className="metabox-header flex-between">
                                <h3>
                                    <FaSlidersH className="metabox-icon" /> Thư viện giọng AI ({voices.length})
                                </h3>
                            </div>
                            <div className="metabox-body">
                                <div className="voice-search-bar">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="search"
                                        placeholder="Tìm tên hoặc mô tả giọng..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="wp-search-input"
                                    />
                                    {searchQuery && (
                                        <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>

                                <div className="voice-filters-row">
                                    <select
                                        className="wp-select mini"
                                        value={filterGender}
                                        onChange={(e) => setFilterGender(e.target.value)}
                                    >
                                        <option value="all">Tất cả giới tính</option>
                                        <option value="Nữ">Giọng Nữ</option>
                                        <option value="Nam">Giọng Nam</option>
                                    </select>

                                    <select
                                        className="wp-select mini"
                                        value={filterRegion}
                                        onChange={(e) => setFilterRegion(e.target.value)}
                                    >
                                        <option value="all">Tất cả vùng miền</option>
                                        {regions.filter(r => r !== "all").map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Danh sách cuộn các giọng đọc */}
                                <div className="wp-voices-scroll-list">
                                    {filteredVoices.length === 0 ? (
                                        <div className="empty-voices">
                                            Không có giọng nào phù hợp với bộ lọc.
                                        </div>
                                    ) : (
                                        filteredVoices.map((v) => {
                                            const isSelected = selectedVoice === v.id;
                                            const isDemoPlaying = demoPlayingVoice === v.id;

                                            return (
                                                <div
                                                    key={v.id}
                                                    className={`wp-voice-card-item ${isSelected ? "is-selected" : ""} ${isDemoPlaying ? "is-playing" : ""}`}
                                                >
                                                    <div className="voice-item-top">
                                                        <div className="voice-item-name-group">
                                                            <span className="gender-tag-icon">
                                                                {v.gender === "Nữ" ? <FaFemale className="fem" /> : <FaMale className="mal" />}
                                                            </span>
                                                            <strong className="item-name">{v.name}</strong>
                                                            {isSelected && (
                                                                <span className="badge-active-mark">
                                                                    <FaCheckCircle /> Đang chọn
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="item-region">{v.region}</span>
                                                    </div>

                                                    <p className="item-desc">{v.desc}</p>

                                                    <div className="voice-item-actions">
                                                        <button
                                                            type="button"
                                                            className={`wp-btn-demo ${isDemoPlaying ? "playing" : ""}`}
                                                            onClick={() => handlePlayDemoVoice(v.id)}
                                                            disabled={ttsStatus !== "idle" && !isDemoPlaying}
                                                            title="Nghe thử mẫu giọng này"
                                                        >
                                                            {isDemoPlaying ? (
                                                                <>
                                                                    <FaStop /> Dừng nghe
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaPlay /> Nghe thử
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`wp-btn-select ${isSelected ? "selected" : ""}`}
                                                            onClick={() => handleVoiceSelect(v.id)}
                                                        >
                                                            {isSelected ? (
                                                                <>
                                                                    <FaCheck /> Đang dùng
                                                                </>
                                                            ) : (
                                                                "Chọn giọng này"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Loading Overlay with % Progress */}
            {ttsStatus !== "idle" && !demoPlayingVoice && (
                <div className="wp-tts-loading-overlay">
                    <div className="wp-tts-loading-modal">
                        <div className="wp-loading-spinner" />
                        <h4 className="loading-title">
                            {progress >= 100
                                ? "Hoàn tất xử lý âm thanh!"
                                : "Đang chuyển đổi văn bản sang âm thanh AI..."}
                        </h4>

                        {/* Thanh tiến trình & % */}
                        <div className="tts-progress-container">
                            <div className="tts-progress-bar-wrap">
                                <div
                                    className="tts-progress-bar-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="tts-progress-percent">{progress}%</div>
                        </div>

                        <p className="loading-desc">
                            {progress < 25 && "Khởi động mô hình & phân tích cấu trúc câu..."}
                            {progress >= 25 && progress < 60 && "Mô hình Piper-TTS đang xử lý ngữ điệu và hòa âm..."}
                            {progress >= 60 && progress < 85 && "Đang kết xuất luồng âm thanh WAV chất lượng cao..."}
                            {progress >= 85 && progress < 100 && "Đang hoàn tất xử lý tại máy chủ..."}
                            {progress >= 100 && "Đã tạo âm thanh thành công! Đang tải audio..."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFileRead;

