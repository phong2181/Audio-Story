import { useSaveUserHistory } from "api/homePage";
import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { FaPause, FaPlay, FaRegClock, FaStepBackward, FaTimesCircle } from "react-icons/fa";
import { TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from "react-icons/tb";
import "./style.scss";

const AudioPlayer = ({ chapter, onPrev, onNext, onClose, cover }) => {
    const audioSrc = chapter?.audio_url || chapter?.audio_file || null;
    const coverImage = cover || chapter?.thumbnail || chapter?.image || chapter?.cover || "https://picsum.photos/140";
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const saveHistoryMutation = useSaveUserHistory();
    const { storyId, chapterId } = useParams();

    useEffect(() => {
        const storedUser = localStorage.getItem("USER");
        if (storedUser && storyId) {
            saveHistoryMutation.mutate({
                story_id: storyId,
                chapter_id: chapterId || null
            });
        }
    }, [storyId, chapterId]);
    
    const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
    const [isSeeking, setIsSeeking] = useState(false);
    const [localTime, setLocalTime] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            audioRef.current.playbackRate = parseFloat(playbackSpeed);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setIsAudioLoading(true);
        }
    }, [audioSrc]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = parseFloat(playbackSpeed);
        }
    }, [playbackSpeed]);

    const togglePlayAudio = async () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                console.error("Lỗi phát audio:", err);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && !isSeeking) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = parseFloat(playbackSpeed);
            setIsAudioLoading(false);
        }
    };

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
                console.error("Lỗi khi gán thời gian:", err);
            }
        }
        setCurrentTime(val);
    };

    const handleSpeedChange = (e) => {
        setPlaybackSpeed(e.target.value);
    };

    const handlePrev = () => {
        // If a parent handler is provided, call it. Otherwise seek -5s.
        if (typeof onPrev === 'function') {
            onPrev();
            return;
        }
        if (audioRef.current) {
            const newTime = Math.max((audioRef.current.currentTime || 0) - 5, 0);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleNext = () => {
        // If a parent handler is provided, call it. Otherwise seek +5s.
        if (typeof onNext === 'function') {
            onNext();
            return;
        }
        if (audioRef.current) {
            const dur = audioRef.current.duration || duration || 0;
            const newTime = Math.min((audioRef.current.currentTime || 0) + 5, dur);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleClose = () => {
        if (typeof onClose === 'function') onClose();
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progressPercent = duration ? Math.min(100, Math.max(0, ((isSeeking ? localTime : currentTime) / duration) * 100)) : 0;

return (
        <div className={`audio-player ${isPlaying ? 'playing' : ''}`}>
            {audioSrc ? (
                <>
                    <div className="audio-player-inner">
                        <div className="audio-player-row">
                            <div className="audio-player-left">
                                <div className="cover-wrapper">
                                    <img className="cover-image" src={coverImage} alt={chapter.chapter_name || chapter.title || 'Cover'} />
                                </div>
                                <div className="track-details">
                                    <span className="track-title" title={chapter.chapter_name || chapter.title || 'Chương'}>{chapter.chapter_name || chapter.title || 'Chương'}</span>
                                    {chapter?.author_post && (
                                        <span className="track-artist">{chapter.author_post}</span>
                                    )}
                                </div>
                            </div>

                            <div className="audio-player-actions">
                                <button className="control-btn prev" type="button" onClick={handlePrev} disabled={!audioSrc} title="Lùi 5s">
                                    <TbPlayerTrackPrevFilled />
                                </button>
                                <button className="play-btn" type="button" onClick={togglePlayAudio} disabled={isAudioLoading} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                                    <span className="play-icon">
                                        {isAudioLoading ? <span className="loader" /> : (isPlaying ? <FaPause /> : <FaPlay />)}
                                    </span>
                                </button>
                                <button className="control-btn next" type="button" onClick={handleNext} disabled={!audioSrc} title="Tua 5s">
                                    <TbPlayerTrackNextFilled />
                                </button>
                                <div className="speed-label">
                                    <FaRegClock className="speed-icon" />
                                    <span className="speed-text">Tốc độ</span>
                                    <select value={playbackSpeed} onChange={handleSpeedChange} className="speed-select">
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1.0">1.0x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="1.75">1.75x</option>
                                        <option value="2.0">2.0x</option>
                                    </select>
                                </div>
                                <button className="close-btn" type="button" onClick={handleClose} title="Đóng" aria-label="Đóng" disabled={!onClose}>
                                    <FaTimesCircle />
                                </button>
                            </div>
                        </div>

                        <div className="timeline-container">
                            <span className="time-display">{formatTime(isSeeking ? localTime : currentTime)}</span>
                            <input 
                                type="range" 
                                min="0" 
                                max={duration || 0} 
                                step="any"
                                value={isSeeking ? localTime : currentTime} 
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekEnd}
                                onTouchEnd={handleSeekEnd}
                                className="timeline-slider"
                                style={{ background: `linear-gradient(90deg, #f59e0b ${progressPercent}%, rgba(248,250,252,0.12) ${progressPercent}%)` }}
                            />
                            <span className="time-display">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <audio 
                        ref={audioRef} 
                        src={audioSrc ? encodeURI(audioSrc) : ''} 
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onWaiting={() => setIsAudioLoading(true)}
                        onCanPlay={() => setIsAudioLoading(false)}
                        onEnded={() => setIsPlaying(false)} 
                    />
                </>
            ) : (
                <p className="text-muted">Chương này không có file âm thanh để phát.</p>
            )}
        </div>
    );
};
export default AudioPlayer;