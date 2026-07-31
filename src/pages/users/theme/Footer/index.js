import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
    FaFacebook, 
    FaYoutube,
    FaTiktok,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";
import "./style.scss";

// Danh sách ảnh chạy slider (Bạn thay đổi đường dẫn ảnh thực tế tại đây)
const SLIDER_IMAGES = [
    { id: 1, url: "https://picsum.photos/400/250?random=1", title: "Thế giới Audio phong phú" },
    { id: 2, url: "https://picsum.photos/400/250?random=2", title: "Cộng đồng nghe truyện văn minh" },
    { id: 3, url: "https://picsum.photos/400/250?random=3", title: "Cập nhật chương mới mỗi ngày" },
    { id: 4, url: "https://picsum.photos/400/250?random=4", title: "Trải nghiệm âm thanh sống động" }
];

const Footer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    // Hàm dọn dẹp bộ nhớ đệm timeout
    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // Tạo hiệu ứng tự động chạy slide sau mỗi 3 giây
    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () =>
                setCurrentIndex((prevIndex) =>
                    prevIndex === SLIDER_IMAGES.length - 1 ? 0 : prevIndex + 1
                ),
            3000 // 3 giây chuyển ảnh một lần
        );

        return () => {
            resetTimeout();
        };
    }, [currentIndex]);

    // Điều hướng thủ công sang ảnh trước đó
    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? SLIDER_IMAGES.length - 1 : prevIndex - 1
        );
    };

    // Điều hướng thủ công sang ảnh kế tiếp
    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === SLIDER_IMAGES.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <footer className="site-footer">
            <div className="footer-container">
                {/* Cột 1: Thông tin thương hiệu */}
                <div className="footer-col brand-col">
                    <div className="footer-logo">
                        <div className="logo-icon">
                            <img src={process.env.PUBLIC_URL + "/logoaudio.ico"} alt="BookAudio Logo" className="footer-brand-img" />
                        </div>
                        <span className="logo-text">Audio <span className="logo-sub">Sotry</span></span>
                    </div>
                    <p className="footer-desc">
                        Nền tảng nghe truyện audio chất lượng cao. Đem lại những giây phút thư giãn tuyệt vời cho thính giả mọi lúc mọi nơi.
                    </p>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                            <FaYoutube />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <FaTiktok />
                        </a>
                    </div>
                </div>

                {/* Cột 2: Danh mục điều hướng */}
                <div className="footer-col links-col">
                    <h3>Menu</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/truyen">Danh sách truyện</Link></li>
                        <li><Link to="/bai-viet">Bài viết</Link></li>
                    </ul>
                </div>

                {/* Cột 3: Slider trình chiếu ảnh tự động */}
                <div className="footer-col slider-col">
                    <h3>Khám phá BlogerAudio</h3>
                    <div className="footer-slider-wrapper">
                        
                        {/* Khung chứa ảnh chuyển cảnh */}
                        <div className="footer-slider">
                            <div 
                                className="slider-track" 
                                style={{ transform: `translateX(${-currentIndex * 100}%)` }}
                            >
                                {SLIDER_IMAGES.map((img) => (
                                    <div className="slide-item" key={img.id}>
                                        <img src={img.url} alt={img.title} />
                                        <div className="slide-caption">{img.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nút điều hướng thủ công */}
                        <button className="slider-btn btn-prev" onClick={handlePrev} aria-label="Slide trước">
                            <FaChevronLeft size={12} />
                        </button>
                        <button className="slider-btn btn-next" onClick={handleNext} aria-label="Slide tiếp theo">
                            <FaChevronRight size={12} />
                        </button>

                        {/* Các dấu chấm chỉ số trang (Dots) */}
                        <div className="slider-dots">
                            {SLIDER_IMAGES.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`dot ${currentIndex === idx ? "active" : ""}`}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Đi tới slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} BlogerAudio. Designed & Developed with ❤️ by Phong Nguyễn.</p>
            </div>
        </footer>
    );
};

export default Footer;