import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FaFacebook, FaQrcode, FaBookOpen, FaFileAlt, FaTiktok, FaUserCheck, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { useGetPublicAuthorProfile } from "api/homePage";
import { STORAGE_URL } from "config/config";
import "./style.scss";

const AuthorProfile = () => {
  const { authorName } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const { data, isLoading, isError, error } = useGetPublicAuthorProfile(authorName);
  
  const authorData = data?.data || {};
  const profile = authorData?.profile || {};
  const posts = Array.isArray(authorData?.posts) ? authorData.posts : [];
  const stories = Array.isArray(authorData?.stories) ? authorData.stories : [];
  const [avatarError, setAvatarError] = useState(false);
  if (isLoading) return <AuthorProfileSkeleton />;
  if (isError) {
    return (
      <div className="profile-wrapper">
        <div className="container profile-container py-5 text-center">
          <h3>Không thể tải thông tin tác giả</h3>
          <p className="text-muted">Máy chủ đang gặp sự cố hoặc tác giả không tồn tại. Vui lòng thử lại sau.</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#7f1d1d' }}>
            {error?.message || 'Lỗi không xác định'}
          </pre>
        </div>
      </div>
    );
  }
  return (
    <div className="profile-wrapper">
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          backgroundImage: profile.cover_url ? `url(${STORAGE_URL}${profile.cover_url})` : "none",
          backgroundColor: profile.cover_url ? undefined : "#f1f5f9",
        }}
      >
        <div className="overlay"></div>
      </div>

      <div className="container profile-container">
        <div className="row">
          {/* Cột trái: Thông tin tác giả */}
          <div className="col-lg-4">
            <div className="card profile-card shadow-sm border-0 mb-4">
              <div className="card-body text-center">
                {profile.avatar ? (
                  <img
                      src={`${STORAGE_URL}${profile.avatar}`}
                      className="avatar-img mb-3"
                      alt={authorName}
                      onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                      }}
                  />
              ) : null}

              <div
                  className="avatar-fallback mb-3"
                  style={{
                      display: profile.avatar ? "none" : "flex"
                  }}
              >
                  {authorName?.charAt(0)?.toUpperCase() || "A"}
              </div>
                <h3 className="fw-bold">{authorName}</h3>
                <span className="badge bg-primary-subtle text-primary rounded-pill mb-3">
                  <FaUserCheck className="me-1" /> Tác giả
                </span>
                
                <div className="d-grid gap-2 text-start mt-4">
                  {profile.email && <div className="contact-item"><FaEnvelope className="text-muted" /> {profile.email}</div>}
                  {profile.facebook && <a href={profile.facebook} target="_blank" rel="noreferrer" className="contact-item"><FaFacebook className="text-primary" /> Facebook</a>}
                  {profile.tiktok && <a href={profile.tiktok} target="_blank" rel="noreferrer" className="contact-item"><FaTiktok className="text-dark" /> TikTok</a>}
                  {profile.zalo && <div className="contact-item"><SiZalo className="text-info" /> Zalo: {profile.zalo}</div>}
                </div>
              </div>
            </div>
            
            {profile.qr_url && (
              <div className="qr-container mb-4">
                <h6><FaQrcode /> Ủng hộ tác giả</h6>
                <img src={`${STORAGE_URL}${profile.qr_url}`} className="qr-code-img" alt="QR Code" />
              </div>
            )}
          </div>

          {/* Cột phải: Tabs và nội dung */}
          <div className="col-lg-8">
            <div className="nav nav-pills mb-4 gap-2">
              <button className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                <FaFileAlt className="me-2" /> Bài viết ({authorData?.total_posts || 0})
              </button>
              <button className={`nav-link ${activeTab === 'series' ? 'active' : ''}`} onClick={() => setActiveTab('series')}>
                <FaBookOpen className="me-2" /> Bộ truyện ({authorData?.total_stories || 0})
              </button>
            </div>

            <div className="tab-content">
              {(activeTab === 'posts' ? posts : stories).length > 0 ? (
                (activeTab === 'posts' ? posts : stories).map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="pe-3">
                      <h5 className="mb-1">{item.title}</h5>
                    </div>
                    <div className="text-end text-nowrap">
                      <small className="date-badge">
                        {activeTab === 'posts' 
                          ? new Date(item.created_at).toLocaleDateString('vi-VN') 
                          : `${item.views || 0} lượt nghe`}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">Chưa có nội dung nào tại đây.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthorProfileSkeleton = () => {
  return (
    <div className="profile-wrapper">
      {/* Hero skeleton */}
      <div className="hero-skeleton shimmer"></div>

      <div className="container profile-container">
        <div className="row">
          {/* LEFT */}
          <div className="col-lg-4">
            <div className="card profile-card shadow-sm border-0 mb-4">
              <div className="card-body text-center">
                <div className="avatar-skeleton shimmer"></div>
                <div className="line shimmer w-60 mx-auto mb-2"></div>
                <div className="badge-skeleton shimmer mx-auto"></div>

                <div className="contact-skeleton mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="line shimmer w-90 mb-2"></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="qr-skeleton shimmer"></div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-8">
            <div className="tabs-skeleton d-flex gap-2 mb-4">
              <div className="tab shimmer w-30"></div>
              <div className="tab shimmer w-30"></div>
            </div>

            <div className="list-skeleton">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="item-skeleton shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;