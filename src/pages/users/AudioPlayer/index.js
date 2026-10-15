import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    FaPause,
    FaPlay,
    FaTimes,
    FaRegClock,
    FaMoon,
    FaVolumeUp,
    FaVolumeMute,
    FaVolumeDown,
    FaRedo,
    FaUndo,
    FaCheck,
    FaHistory,
    FaBolt
} from "react-icons/fa";
import { TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from "react-icons/tb";
import { useSaveUserHistory } from "api/homePage";
import "./style.scss";

const SPEED_OPTIONS = ["0.75", "1.0", "1.25", "1.5", "1.75", "2.0"];

const SLEEP_OPTIONS = [
    { label: "Tắt hẹn giờ", value: null },
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
    { label: "45 phút", value: 45 },
    { label: "60 phút", value: 60 },
    { label: "Hết tập phát", value: "end" }
];

const AudioPlayer = ({ chapter, onPrev, onNext, onClose, cover }) => {
    const audioSrc = chapter?.audio_url || chapter?.audio_file || null;
    const coverImage = cover || chapter?.thumbnail || chapter?.image || chapter?.cover || "https://picsum.photos/140";
    const audioRef = useRef(null);
    const playerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [localTime, setLocalTime] = useState(0);

    // 1. Tốc độ phát (Playback Speed) - Lưu và khôi phục từ localStorage
    const [playbackSpeed, setPlaybackSpeed] = useState(() => {
        return localStorage.getItem("AUDIO_PLAYBACK_SPEED") || "1.0";
    });
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // 2. Hẹn giờ tắt (Sleep Timer)
    const [sleepTimerValue, setSleepTimerValue] = useState(null); // null, 15, 30, 45, 60, 'end'
    const [sleepSecondsLeft, setSleepSecondsLeft] = useState(null);
    const [showSleepMenu, setShowSleepMenu] = useState(false);

    // 3. Ghi nhớ vị trí nghe (Resume Progress)
    const [resumeNotice, setResumeNotice] = useState({ show: false, time: 0 });

    // 4. Âm lượng (Volume Control)
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem("AUDIO_VOLUME");
        return saved !== null ? parseFloat(saved) : 1.0;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    // Lịch sử người dùng từ backend
    const saveHistoryMutation = useSaveUserHistory();
    const { storyId, chapterId } = useParams();
    const chapterKey = chapter?.id || chapter?.chapter_id || chapterId;

    useEffect(() => {
        const storedUser = localStorage.getItem("USER");
        if (storedUser && (storyId || chapter?.story_id)) {
            saveHistoryMutation.mutate({
                story_id: storyId || chapter?.story_id,
                chapter_id: chapterKey || null
            });
        }
    }, [storyId, chapterKey]);

    // Đóng popup khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (playerRef.current && !playerRef.current.contains(e.target)) {
                setShowSpeedMenu(false);
                setShowSleepMenu(false);
                setShowVolumeSlider(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Khởi tạo audio khi nguồn phát thay đổi
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            audioRef.current.playbackRate = parseFloat(playbackSpeed);
            audioRef.current.volume = isMuted ? 0 : volume;
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setIsAudioLoading(true);
        }
    }, [audioSrc]);

    // Cập nhật tốc độ phát vào audioRef
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = parseFloat(playbackSpeed);
        }
    }, [playbackSpeed]);

    // Logic đếm ngược hẹn giờ tắt tự động (Sleep Timer Countdown)
    useEffect(() => {
        if (sleepSecondsLeft === null || !isPlaying) return;

        const timer = setInterval(() => {
            setSleepSecondsLeft((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                    setIsPlaying(false);
                    setSleepTimerValue(null);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sleepSecondsLeft, isPlaying]);

    // Lưu tiến trình phát định kỳ (Throttled Progress Saving)
    const saveProgress = useCallback((time, dur) => {
        if (!chapterKey || time < 3 || !dur) return;
        try {
            const key = `AUDIO_PROGRESS_${chapterKey}`;
            localStorage.setItem(
                key,
                JSON.stringify({
                    chapterId: chapterKey,
                    currentTime: Math.floor(time),
                    duration: Math.floor(dur),
                    title: chapter?.chapter_name || chapter?.title || "",
                    timestamp: Date.now()
                })
            );
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [chapterKey, chapter?.chapter_name, chapter?.title]);

    // Bật/tắt phát nhạc
    const togglePlayAudio = async () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            saveProgress(audioRef.current.currentTime, audioRef.current.duration);
        } else {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                console.error("Lỗi phát audio:", err);
            }
        }
    };

    // Cập nhật thời gian thực
    const handleTimeUpdate = () => {
        if (audioRef.current && !isSeeking) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);

            // Cứ mỗi 5 giây lưu tiến trình một lần
            if (Math.floor(cur) % 5 === 0) {
                saveProgress(cur, audioRef.current.duration);
            }
        }
    };

    // Khi audio đã tải xong metadata (Khôi phục vị trí đã nghe - Resume Playback)
    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        const dur = audioRef.current.duration;
        setDuration(dur);
        audioRef.current.playbackRate = parseFloat(playbackSpeed);
        audioRef.current.volume = isMuted ? 0 : volume;
        setIsAudioLoading(false);

        // Khôi phục vị trí tập đã nghe trước đó từ localStorage
        if (chapterKey) {
            try {
                const key = `AUDIO_PROGRESS_${chapterKey}`;
                const savedData = localStorage.getItem(key);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    // Nếu thời gian đã nghe > 5 giây và chưa hết chương (ít hơn tổng thời lượng 10s)
                    if (parsed.currentTime > 5 && parsed.currentTime < (dur - 10)) {
                        audioRef.current.currentTime = parsed.currentTime;
                        setCurrentTime(parsed.currentTime);
                        setResumeNotice({ show: true, time: parsed.currentTime });

                        // Tự động ẩn thông báo sau 6 giây
                        setTimeout(() => {
                            setResumeNotice({ show: false, time: 0 });
                        }, 6000);
                    }
                }
            } catch (e) {
                console.error("Lỗi khôi phục tiến trình:", e);
            }
        }
    };

    // Nghe lại từ đầu (00:00)
    const handleRestartBeginning = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
        setResumeNotice({ show: false, time: 0 });
        if (chapterKey) {
            localStorage.removeItem(`AUDIO_PROGRESS_${chapterKey}`);
        }
    };

    // Kéo thanh timeline
    const handleSeekChange = (e) => {
        const val = parseFloat(e.target.value);
        setIsSeeking(true);
        setLocalTime(val);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleSeekEnd = async (e) => {
        const val = parseFloat(e.target.value);
        setIsSeeking(false);
        if (audioRef.current) {
            try {
                audioRef.current.currentTime = val;
                if (isPlaying) {
                    await audioRef.current.play();
                }
            } catch (err) {
                console.error("Lỗi tua thời gian:", err);
            }
        }
        setCurrentTime(val);
        saveProgress(val, duration);
    };

    // Chọn tốc độ phát
    const handleSelectSpeed = (speed) => {
        setPlaybackSpeed(speed);
        localStorage.setItem("AUDIO_PLAYBACK_SPEED", speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = parseFloat(speed);
        }
        setShowSpeedMenu(false);
    };

    // Chọn hẹn giờ tắt
    const handleSelectSleepTimer = (value) => {
        setSleepTimerValue(value);
        if (value === null) {
            setSleepSecondsLeft(null);
        } else if (value === "end") {
            setSleepSecondsLeft(null); // Sẽ tắt khi onEnded kích hoạt
        } else {
            setSleepSecondsLeft(value * 60);
        }
        setShowSleepMenu(false);
    };

    // Tua lùi 10 giây
    const handleRewind10s = () => {
        if (audioRef.current) {
            const newTime = Math.max((audioRef.current.currentTime || 0) - 10, 0);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            saveProgress(newTime, duration);
        }
    };

    // Tua tiến 10 giây
    const handleForward10s = () => {
        if (audioRef.current) {
            const dur = audioRef.current.duration || duration || 0;
            const newTime = Math.min((audioRef.current.currentTime || 0) + 10, dur);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            saveProgress(newTime, dur);
        }
    };

    // Điều khiển âm lượng
    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
        localStorage.setItem("AUDIO_VOLUME", val.toString());
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            const unmutedVol = volume > 0 ? volume : 0.5;
            audioRef.current.volume = unmutedVol;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    // Kết thúc tập
    const handleEnded = () => {
        setIsPlaying(false);
        if (chapterKey) {
            localStorage.removeItem(`AUDIO_PROGRESS_${chapterKey}`);
        }
        if (sleepTimerValue === "end") {
            setSleepTimerValue(null);
            setSleepSecondsLeft(null);
        }
        if (typeof onNext === "function") {
            onNext();
        }
    };

    const handleClose = () => {
        if (audioRef.current) {
            saveProgress(audioRef.current.currentTime, audioRef.current.duration);
        }
        if (typeof onClose === "function") onClose();
    };

    const formatTime = (time) => {
        if (isNaN(time) || time === null) return "00:00";
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progressPercent = duration
        ? Math.min(100, Math.max(0, ((isSeeking ? localTime : currentTime) / duration) * 100))
        : 0;

    return (
        <div className={`wp-audio-player-bar ${isPlaying ? 'is-playing' : ''}`} ref={playerRef}>
            {/* Pill thông báo tự động khôi phục tiến trình đang nghe */}
            {resumeNotice.show && (
                <div className="resume-progress-pill">
                    <span className="pill-text">
                        <FaHistory /> Đang tiếp tục từ phút <strong>{formatTime(resumeNotice.time)}</strong>
                    </span>
                    <button className="btn-restart-start" onClick={handleRestartBeginning} title="Bắt đầu lại từ đầu">
                        <FaUndo /> Nghe từ đầu
                    </button>
                    <button className="btn-dismiss-pill" onClick={() => setResumeNotice({ show: false, time: 0 })}>
                        ✕
                    </button>
                </div>
            )}

            {audioSrc ? (
                <div className="player-bar-container">

                    {/* KHỐI 1: TRACK INFO (Bìa đĩa, tên chương, tác giả) */}
                    <div className="player-track-info">
                        <div className="vinyl-cover-wrapper">
                            <img
                                className="vinyl-cover-img"
                                src={coverImage}
                                alt={chapter.chapter_name || chapter.title || "Cover"}
                            />
                            <div className="vinyl-center-dot" />
                        </div>

                        <div className="track-text-meta">
                            <h4 className="track-title" title={chapter.chapter_name || chapter.title || "Tập phát"}>
                                {chapter.chapter_name || chapter.title || "Tập phát"}
                            </h4>
                            <span className="track-artist">
                                {chapter?.author_post || chapter?.author || "Audio Story Production"}
                            </span>
                        </div>
                    </div>

                    {/* KHỐI 2: TRUNG TÂM - ĐIỀU KHIỂN & TIMELINE */}
                    <div className="player-main-center">
                        {/* Hàng nút bấm Play, Pause, Tua 10s */}
                        <div className="transport-controls">
                            {typeof onPrev === "function" && (
                                <button className="btn-transport btn-prev-ch" onClick={onPrev} title="Chương trước">
                                    <TbPlayerTrackPrevFilled />
                                </button>
                            )}

                            <button className="btn-transport btn-skip" onClick={handleRewind10s} title="Tua lùi 10 giây">
                                <FaUndo className="skip-icon" />
                                <span className="skip-sec">10s</span>
                            </button>

                            <button
                                className="btn-play-pause-main"
                                onClick={togglePlayAudio}
                                disabled={isAudioLoading}
                                title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
                            >
                                {isAudioLoading ? (
                                    <span className="player-loader" />
                                ) : isPlaying ? (
                                    <FaPause className="main-icon" />
                                ) : (
                                    <FaPlay className="main-icon play-pad" />
                                )}
                            </button>

                            <button className="btn-transport btn-skip" onClick={handleForward10s} title="Tua tới 10 giây">
                                <FaRedo className="skip-icon" />
                                <span className="skip-sec">10s</span>
                            </button>

                            {typeof onNext === "function" && (
                                <button className="btn-transport btn-next-ch" onClick={onNext} title="Chương tiếp theo">
                                    <TbPlayerTrackNextFilled />
                                </button>
                            )}
                        </div>

                        {/* Thanh Timeline Seekbar */}
                        <div className="timeline-bar-wrapper">
                            <span className="time-stamp time-current">
                                {formatTime(isSeeking ? localTime : currentTime)}
                            </span>

                            <div className="slider-wrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    step="any"
                                    value={isSeeking ? localTime : currentTime}
                                    onChange={handleSeekChange}
                                    onMouseUp={handleSeekEnd}
                                    onTouchEnd={handleSeekEnd}
                                    className="timeline-range-slider"
                                    style={{
                                        background: `linear-gradient(90deg, #8b5cf6 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
                                    }}
                                />
                            </div>

                            <span className="time-stamp time-total">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* KHỐI 3: THANH TIỆN ÍCH (Hẹn giờ tắt, Tốc độ phát, Âm lượng, Đóng) */}
                    <div className="player-utilities">

                        {/* Tiện ích 1: Hẹn giờ tắt (Sleep Timer) */}
                        <div className="utility-popover-anchor">
                            <button
                                className={`btn-utility ${sleepTimerValue ? 'is-active-feature' : ''}`}
                                onClick={() => {
                                    setShowSleepMenu(!showSleepMenu);
                                    setShowSpeedMenu(false);
                                    setShowVolumeSlider(false);
                                }}
                                title="Hẹn giờ tắt tự động"
                            >
                                <FaMoon className="utility-icon" />
                                <span className="utility-label">
                                    {sleepSecondsLeft !== null
                                        ? formatTime(sleepSecondsLeft)
                                        : sleepTimerValue === "end"
                                        ? "Hết tập"
                                        : "Hẹn giờ"}
                                </span>
                            </button>

                            {showSleepMenu && (
                                <div className="utility-popover-menu sleep-popover">
                                    <div className="popover-title">
                                        <FaMoon /> Hẹn giờ tắt tự động
                                    </div>
                                    <div className="popover-options">
                                        {SLEEP_OPTIONS.map((opt) => (
                                            <button
                                                key={String(opt.value)}
                                                className={`popover-option-item ${sleepTimerValue === opt.value ? 'selected' : ''}`}
                                                onClick={() => handleSelectSleepTimer(opt.value)}
                                            >
                                                <span>{opt.label}</span>
                                                {sleepTimerValue === opt.value && <FaCheck className="check-mark" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tiện ích 2: Tốc độ phát (Speed) */}
                        <div className="utility-popover-anchor">
                            <button
                                className={`btn-utility ${playbackSpeed !== '1.0' ? 'is-active-feature' : ''}`}
                                onClick={() => {
                                    setShowSpeedMenu(!showSpeedMenu);
                                    setShowSleepMenu(false);
                                    setShowVolumeSlider(false);
                                }}
                                title="Tốc độ phát âm thanh"
                            >
                                <FaBolt className="utility-icon" />
                                <span className="utility-label">{playbackSpeed}x</span>
                            </button>

                            {showSpeedMenu && (
                                <div className="utility-popover-menu speed-popover">
                                    <div className="popover-title">
                                        <FaRegClock /> Tốc độ phát
                                    </div>
                                    <div className="speed-buttons-grid">
                                        {SPEED_OPTIONS.map((spd) => (
                                            <button
                                                key={spd}
                                                className={`speed-grid-btn ${playbackSpeed === spd ? 'selected' : ''}`}
                                                onClick={() => handleSelectSpeed(spd)}
                                            >
                                                {spd}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tiện ích 3: Âm lượng (Volume) */}
                        <div className="utility-popover-anchor volume-anchor">
                            <button
                                className="btn-utility btn-volume-toggle"
                                onClick={toggleMute}
                                onMouseEnter={() => setShowVolumeSlider(true)}
                                title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                            >
                                {isMuted || volume === 0 ? (
                                    <FaVolumeMute className="utility-icon mute-color" />
                                ) : volume < 0.5 ? (
                                    <FaVolumeDown className="utility-icon" />
                                ) : (
                                    <FaVolumeUp className="utility-icon" />
                                )}
                            </button>

                            <div className="volume-slider-box">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                    title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                                />
                            </div>
                        </div>

                        {/* Tiện ích 4: Nút Đóng Player */}
                        <button className="btn-utility btn-close-player" onClick={handleClose} title="Thu nhỏ / Đóng trình phát">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Audio Native element */}
                    <audio
                        ref={audioRef}
                        src={audioSrc ? encodeURI(audioSrc) : ""}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onWaiting={() => setIsAudioLoading(true)}
                        onCanPlay={() => setIsAudioLoading(false)}
                        onEnded={handleEnded}
                    />
                </div>
            ) : (
                <div className="player-empty-state">
                    <p>Chương này chưa có tập tin âm thanh để phát.</p>
                    <button className="btn-close-empty" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;