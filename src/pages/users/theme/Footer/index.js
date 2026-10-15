import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaTelegram,
  FaChevronLeft,
  FaChevronRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useGetPublicFooter, useGetPublicHeaderSettings } from "api/homePage/queries";
import { getStorageUrl } from "config/config";
import "./style.scss";

// Danh sách ảnh mặc định nếu chưa thiết lập trong admin
const DEFAULT_SLIDES = [
  { id: 1, imageUrl: "https://picsum.photos/400/250?random=1", title: "Thế giới Audio phong phú", linkUrl: "/truyen" },
  { id: 2, imageUrl: "https://picsum.photos/400/250?random=2", title: "Cộng đồng nghe truyện văn minh", linkUrl: "/membership" },
  { id: 3, imageUrl: "https://picsum.photos/400/250?random=3", title: "Cập nhật chương mới mỗi ngày", linkUrl: "/truyen" },
  { id: 4, imageUrl: "https://picsum.photos/400/250?random=4", title: "Trải nghiệm âm thanh sống động", linkUrl: "/truyen" },
];

// Danh sách liên kết mặc định
const DEFAULT_LINKS = [
  { id: 1, label: "Trang chủ", url: "/" },
  { id: 2, label: "Kho truyện audio", url: "/truyen" },
  { id: 3, label: "Bài viết & Tin tức", url: "/bai-viet" },
  { id: 4, label: "Gói thành viên VIP", url: "/membership" },
];

const SEASON_BADGES = {
  spring_tet: { icon: "🌸", label: "Tết Sum Vầy • Vạn Sự Như Ý" },
  summer: { icon: "☀️", label: "Hè Sôi Động • Thỏa Sức Nghe Truyện" },
  autumn: { icon: "🍁", label: "Thu Lãng Mạn • Lắng Đọng Cảm Xúc" },
  winter: { icon: "❄️", label: "Đông Ấm Áp • Gắn Kết Yêu Thương" },
};

const Footer = () => {
  const { data: footerRes } = useGetPublicFooter();
  const { data: headerSettingsRes } = useGetPublicHeaderSettings();

  const footerData = footerRes?.data || {};
  const headerSettings = headerSettingsRes?.data || {};

  const effectiveSeason = headerSettings?.effective_season || "spring_tet";
  const brand = footerData.brand || {};
  const copyright = footerData.copyright || {};

  const brandTitle = brand.title || headerSettings?.site_title || "Audio Story";
  const brandDesc =
    brand.desc ||
    "Nền tảng nghe truyện audio và chia sẻ kiến thức trực tuyến chất lượng cao, mang lại trải nghiệm âm thanh sống động mọi lúc mọi nơi.";

  const logoUrl = headerSettings?.logo_url
    ? getStorageUrl(headerSettings.logo_url)
    : process.env.PUBLIC_URL + "/logoaudio.ico";

  // Danh sách links
  const links =
    Array.isArray(footerData.links) && footerData.links.length > 0
      ? footerData.links
      : DEFAULT_LINKS;

  // Danh sách slides
  const slides =
    Array.isArray(footerData.slides) && footerData.slides.length > 0
      ? footerData.slides
      : DEFAULT_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => resetTimeout();
  }, [currentIndex, slides.length, isPaused]);

  // Đảm bảo currentIndex không bị vượt quá số lượng slide
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const seasonBadge = SEASON_BADGES[effectiveSeason] || SEASON_BADGES.spring_tet;

  return (
    <footer className={`site-footer season-${effectiveSeason}`}>
      {/* Ruy băng trang trí mùa lễ tết */}
      <div className="season-top-ribbon">
        <span className="season-ribbon-badge">
          {seasonBadge.icon} {seasonBadge.label}
        </span>
      </div>

      <div className="footer-container">
        {/* CỘT 1: THƯƠNG HIỆU, GIỚI THIỆU & MẠNG XÃ HỘI */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <div className="logo-icon">
              <img src={logoUrl} alt={brandTitle} className="footer-brand-img" />
            </div>
            <span className="logo-text">
              {brandTitle.split(" ")[0]}{" "}
              <span className="logo-sub">{brandTitle.split(" ").slice(1).join(" ") || "Audio"}</span>
            </span>
          </div>

          <p className="footer-desc">{brandDesc}</p>

          {/* Thông tin liên hệ nếu có */}
          {(brand.phone || brand.email || brand.address) && (
            <div className="footer-contact-info">
              {brand.phone && (
                <div className="contact-item">
                  <FaPhoneAlt className="contact-icon" />
                  <a href={`tel:${brand.phone}`}>{brand.phone}</a>
                </div>
              )}
              {brand.email && (
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>
                </div>
              )}
              {brand.address && (
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{brand.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Mạng xã hội */}
          <div className="social-links">
            {brand.facebook && (
              <a
                href={brand.facebook.startsWith("http") ? brand.facebook : `https://${brand.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
            )}
            {brand.youtube && (
              <a
                href={brand.youtube.startsWith("http") ? brand.youtube : `https://${brand.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
              >
                <FaYoutube />
              </a>
            )}
            {brand.tiktok && (
              <a
                href={brand.tiktok.startsWith("http") ? brand.tiktok : `https://${brand.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <FaTiktok />
              </a>
            )}
            {brand.telegram && (
              <a
                href={brand.telegram.startsWith("http") ? brand.telegram : `https://${brand.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegram />
              </a>
            )}
            {/* Fallback mạng xã hội nếu chưa cấu hình link nào */}
            {!brand.facebook && !brand.youtube && !brand.tiktok && !brand.telegram && (
              <>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                  <FaYoutube />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok />
                </a>
              </>
            )}
          </div>
        </div>

        {/* CỘT 2: DANH MỤC ĐIỀU HƯỚNG LIÊN KẾT */}
        <div className="footer-col links-col">
          <h3>Liên kết nhanh</h3>
          <ul className="footer-links">
            {links.map((link) => {
              const isExternal = link.url && (link.url.startsWith("http://") || link.url.startsWith("https://"));
              return (
                <li key={link.id || link.url}>
                  {isExternal ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label} <FaExternalLinkAlt className="ext-icon" />
                    </a>
                  ) : (
                    <Link to={link.url || "/"}>{link.label}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* CỘT 3: SLIDER TRÌNH CHIẾU KHÁM PHÁ */}
        <div className="footer-col slider-col">
          <h3>Khám phá {brandTitle}</h3>
          <div
            className="footer-slider-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="footer-slider">
              <div
                className="slider-track"
                style={{ transform: `translateX(${-currentIndex * 100}%)` }}
              >
                {slides.map((img, idx) => (
                  <div className="slide-item" key={img.id || idx}>
                    {img.linkUrl ? (
                      img.linkUrl.startsWith("http") ? (
                        <a href={img.linkUrl} target="_blank" rel="noopener noreferrer" className="slide-link">
                          <img src={img.imageUrl || img.url} alt={img.title} />
                          <div className="slide-caption">{img.title}</div>
                        </a>
                      ) : (
                        <Link to={img.linkUrl} className="slide-link">
                          <img src={img.imageUrl || img.url} alt={img.title} />
                          <div className="slide-caption">{img.title}</div>
                        </Link>
                      )
                    ) : (
                      <>
                        <img src={img.imageUrl || img.url} alt={img.title} />
                        <div className="slide-caption">{img.title}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nút lướt ảnh */}
            {slides.length > 1 && (
              <>
                <button className="slider-btn btn-prev" onClick={handlePrev} aria-label="Slide trước">
                  <FaChevronLeft size={12} />
                </button>
                <button className="slider-btn btn-next" onClick={handleNext} aria-label="Slide tiếp theo">
                  <FaChevronRight size={12} />
                </button>

                {/* Dấu chấm chuyển trang */}
                <div className="slider-dots">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`dot ${currentIndex === idx ? "active" : ""}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Đi tới slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN ĐÁY CHÂN TRANG */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            {copyright.text || (
              <>
                &copy; {new Date().getFullYear()} <strong>{brandTitle}</strong>.{" "}
                {copyright.author ? `Phát triển bởi ${copyright.author}.` : "Bản quyền đã được bảo hộ."}
              </>
            )}
          </p>

          {copyright.show_badge !== false && (
            <div className="copyright-badge">
              <FaShieldAlt className="badge-icon" />
              <span>Bảo vệ quyền tác giả & DMCA</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;