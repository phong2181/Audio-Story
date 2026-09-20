import React, { useState, useRef } from "react";
import {
    FaMusic,
    FaCloudUploadAlt,
    FaTrashAlt,
    FaSpinner,
    FaPlay,
    FaPause,
    FaLock,
    FaUserShield,
    FaFileAudio,
    FaInfoCircle,
} from "react-icons/fa";
import {
    useGetBackgroundMusicsAD,
    useAddBackgroundMusicAD,
    useDeleteBackgroundMusicAD,
} from "api/homePage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAdminInfo } from "utils/adminAuth";
import "./style.scss";

const ManageBackgroundMusic = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [audioFile, setAudioFile] = useState(null);
    const [status, setStatus] = useState(1);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(null);

    // Lấy danh sách nhạc nền
    const { data: musics, isLoading } = useGetBackgroundMusicsAD();

    // Mutation upload & xóa
    const addMutation = useAddBackgroundMusicAD();
    const deleteMutation = useDeleteBackgroundMusicAD();

    const adminInfo = getAdminInfo();
    const isAdmin = adminInfo?.role === "admin";

    // Nếu không phải Admin (ví dụ Staff), hiển thị cảnh báo không có quyền
    if (!isAdmin) {
        return (
            <div className="noPermission">
                <FaLock className="lockIcon" />
                <h2>Từ chối truy cập</h2>
                <p>
                    Chỉ tài khoản <strong>Admin</strong> mới có quyền upload và quản lý nhạc nền.
                    Tài khoản của bạn không có quyền thực hiện thao tác này.
                </p>
            </div>
        );
    }

    // Xử lý chọn file audio
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAudioFile(file);

        // Tạo URL preview
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Xử lý upload
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.warn("Vui lòng nhập tên nhạc nền!");
            return;
        }
        if (!audioFile) {
            toast.warn("Vui lòng chọn file audio!");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("audio_file", audioFile);
        formData.append("description", description);
        formData.append("status", status);

        addMutation.mutate(formData, {
            onSuccess: (res) => {
                toast.success(res?.message || "🎵 Upload nhạc nền thành công!");
                setTitle("");
                setDescription("");
                setAudioFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
                // Reset input file
                e.target.reset();
            },
            onError: (err) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.errors ||
                    "Upload thất bại!";
                toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
            },
        });
    };

    // Xử lý xóa
    const handleDelete = (id, musicTitle) => {
        if (window.confirm(`Bạn có chắc muốn xóa nhạc nền "${musicTitle}"?`)) {
            deleteMutation.mutate(id, {
                onSuccess: (res) => {
                    toast.success(res?.message || "Đã xóa nhạc nền!");
                },
                onError: (err) => {
                    toast.error(err?.response?.data?.message || "Xóa thất bại!");
                },
            });
        }
    };

    // Xử lý play/pause preview
    const handlePreview = (music) => {
        if (playingId === music.id) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setPlayingId(null);
            return;
        }

        // Dừng audio đang phát
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(music.audio_url);
        audioRef.current = audio;
        setPlayingId(music.id);

        audio.onended = () => setPlayingId(null);
        audio.onerror = () => {
            toast.error("Không thể phát nhạc nền này!");
            setPlayingId(null);
        };
        audio.play().catch((err) => {
            console.warn("Play failed:", err);
            setPlayingId(null);
        });
    };

    return (
        <div className="manageBgMusic">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />

            {/* Page Header */}
            <div className="pageHeader">
                <h2>🎵 Quản lý Nhạc Nền</h2>
                <p>
                    Chỉ <strong>Admin</strong> mới có quyền upload nhạc nền. Nhạc nền dùng để
                    phát nền cho các chương audio.
                </p>
            </div>

            {/* Admin Permission Banner */}
            <div className="adminBanner">
                <div className="adminBannerIcon">
                    <FaUserShield />
                </div>
                <div className="adminBannerInfo">
                    <span className="bannerLabel">Quyền truy cập</span>
                    <span className="bannerValue">
                        <FaLock /> Chỉ Admin mới được đăng nhạc nền
                    </span>
                </div>
                <div className="adminBannerUser">
                    {adminInfo?.name && (
                        <span>Đang đăng bởi: <strong>{adminInfo.name}</strong></span>
                    )}
                </div>
            </div>

            <div className="bgMusicLayout">
                {/* Upload Form */}
                <div className="uploadCard">
                    <h3>
                        <FaCloudUploadAlt />
                        Upload nhạc nền mới
                    </h3>

                    <form onSubmit={handleSubmit} className="uploadForm">
                        <div className="formGroup">
                            <label>
                                <FaMusic /> Tên nhạc nền
                            </label>
                            <input
                                type="text"
                                placeholder="VD: Nhạc nền nhẹ nhàng buổi sáng..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="formGroup">
                            <label>
                                <FaFileAudio /> Chọn file audio (mp3, wav, m4a, aac, ogg, flac - tối đa 50MB)
                            </label>
                            <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                                onChange={handleFileChange}
                                className="fileInput"
                            />
                        </div>

                        {previewUrl && (
                            <div className="previewAudio">
                                <audio controls src={previewUrl} />
                            </div>
                        )}

                        <div className="formGroup">
                            <label>
                                <FaInfoCircle /> Mô tả (tùy chọn)
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Mô tả ngắn về nhạc nền..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="formGroup">
                            <label>Trạng thái</label>
                            <select value={status} onChange={(e) => setStatus(parseInt(e.target.value))}>
                                <option value={1}>Hiển thị (Active)</option>
                                <option value={0}>Ẩn (Inactive)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="submitBtn"
                            disabled={addMutation.isPending}
                        >
                            {addMutation.isPending ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Đang tải lên...
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt />
                                    Upload nhạc nền
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="listCard">
                    <div className="listHeader">
                        <h3>🎶 Danh sách nhạc nền ({musics?.length || 0})</h3>
                    </div>

                    {isLoading ? (
                        <div className="loadingState">
                            <FaSpinner className="animate-spin" />
                            <p>Đang tải danh sách...</p>
                        </div>
                    ) : musics && musics.length > 0 ? (
                        <div className="musicList">
                            {musics.map((music) => (
                                <div className="musicItem" key={music.id}>
                                    <div className="musicPlayBtn" onClick={() => handlePreview(music)}>
                                        {playingId === music.id ? (
                                            <FaPause />
                                        ) : (
                                            <FaPlay />
                                        )}
                                    </div>

                                    <div className="musicInfo">
                                        <strong className="musicTitle">{music.title}</strong>
                                        {music.description && (
                                            <p className="musicDesc">{music.description}</p>
                                        )}
                                        <div className="musicMeta">
                                            <span className={`badge ${music.status ? "active" : "inactive"}`}>
                                                {music.status ? "Active" : "Inactive"}
                                            </span>
                                            <span>{music.size_formatted}</span>
                                            {music.uploader && (
                                                <span>👤 {music.uploader.name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <audio className="hiddenAudio" controls src={music.audio_url} />

                                    <button
                                        className="deleteBtn"
                                        onClick={() => handleDelete(music.id, music.title)}
                                        disabled={deleteMutation.isPending}
                                        title="Xóa nhạc nền"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="emptyState">
                            <FaMusic />
                            <p>Chưa có nhạc nền nào. Hãy upload nhạc nền đầu tiên!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBackgroundMusic;
