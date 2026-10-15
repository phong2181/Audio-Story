import React, { memo } from "react";
import { FaExternalLinkAlt, FaBullhorn } from "react-icons/fa";
import {
  useGetActiveAdvertisementsClient,
  useRecordAdClick
} from "api/homePage/queries";
import { STORAGE_URL } from "config/config";
import "./style.scss";

const BrandAdBanner = ({ position = "home_banner", className = "" }) => {
  const { data: rawAds, isLoading, isError } = useGetActiveAdvertisementsClient(position);
  const clickMutation = useRecordAdClick();

  if (isLoading || isError) return null;

  const ads = Array.isArray(rawAds) ? rawAds : (rawAds?.data || []);

  // QUY TẮC CỐT LÕI: Nếu không có quảng cáo từ brand thì ẩn hoàn toàn, không render khoảng trắng
  if (!ads || ads.length === 0) {
    return null;
  }

  // Lấy quảng cáo đầu tiên (hoặc ngẫu nhiên nếu có nhiều hơn 1)
  const ad = ads[0];

  const getImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${STORAGE_URL}/${url}`;
  };

  const handleClick = (e) => {
    if (ad.id) {
      clickMutation.mutate(ad.id);
    }
  };

  return (
    <aside className={`brand-ad-container ${className}`} aria-label="Quảng cáo tài trợ">
      <div className="brand-ad-badge-bar">
        <span className="sponsored-tag">
          <FaBullhorn /> TÀI TRỢ BỞI {ad.brand_name?.toUpperCase() || "ĐỐI TÁC"}
        </span>
        <span className="ad-notice">Quảng cáo</span>
      </div>

      <a
        href={ad.target_url || "#"}
        target={ad.target_url ? "_blank" : "_self"}
        rel="noopener noreferrer sponsored"
        className="brand-ad-link"
        onClick={handleClick}
        title={ad.title}
      >
        <div className="brand-ad-image-wrap">
          <img
            src={getImageSrc(ad.image_url)}
            alt={ad.title || "Quảng cáo"}
            loading="lazy"
          />
          <div className="brand-ad-overlay">
            <div className="ad-info">
              <span className="brand-title">{ad.title}</span>
              <span className="brand-sub">Khám phá ngay từ {ad.brand_name}</span>
            </div>
            {ad.target_url && (
              <span className="btn-visit">
                Xem chi tiết <FaExternalLinkAlt />
              </span>
            )}
          </div>
        </div>
      </a>
    </aside>
  );
};

export default memo(BrandAdBanner);
