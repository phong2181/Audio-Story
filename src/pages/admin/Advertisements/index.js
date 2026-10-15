import React, { useState, useMemo } from "react";
import {
  FaAd,
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaExternalLinkAlt,
  FaEye,
  FaMousePointer,
  FaSearch,
  FaEdit,
  FaUndo,
  FaImage,
  FaBullhorn
} from "react-icons/fa";
import {
  useGetAdvertisementsAD,
  useAddAdvertisementAD,
  useUpdateAdvertisementAD,
  useDeleteAdvertisementAD
} from "api/homePage/queries";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { STORAGE_URL } from "config/config";
import { getAdminInfo } from "utils/adminAuth";
import "./style.scss";

const POSITIONS = [
  { value: "all", label: "Tất cả các trang (Global)" },
  { value: "home_banner", label: "Banner Trang Chủ" },
  { value: "story_list", label: "Banner Kho Truyện (/truyen)" },
  { value: "story_detail", label: "Banner Chi Tiết Truyện" },
  { value: "blog_page", label: "Banner Trang Bài Viết & Tin Tức" }
];

const AdvertisementsManager = () => {
  const adminInfo = getAdminInfo();

  const { data: rawAds = [], isLoading } = useGetAdvertisementsAD();
  const addMutation = useAddAdvertisementAD();
  const updateMutation = useUpdateAdvertisementAD();
  const deleteMutation = useDeleteAdvertisementAD();

  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("all"); // 'all', 'active', 'inactive'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [imageMode, setImageMode] = useState("upload"); // 'upload' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    brand_name: "",
    position: "home_banner",
    target_url: "",
    image_url: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  const adsList = useMemo(() => {
    return Array.isArray(rawAds) ? rawAds : (rawAds?.data || []);
  }, [rawAds]);

  // Thống kê
  const statistics = useMemo(() => {
    const total = adsList.length;
    const active = adsList.filter((a) => a.is_active).length;
    const inactive = total - active;
    const totalClicks = adsList.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    const totalViews = adsList.reduce((acc, curr) => acc + (curr.views || 0), 0);
    return { total, active, inactive, totalClicks, totalViews };
  }, [adsList]);

  // Lọc
  const filteredAds = useMemo(() => {
    return adsList.filter((ad) => {
      const matchesSearch =
        (ad.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.brand_name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPos = positionFilter === "all" || ad.position === positionFilter;

      let matchesStatus = true;
      if (statusTab === "active") matchesStatus = !!ad.is_active;
      else if (statusTab === "inactive") matchesStatus = !ad.is_active;

      return matchesSearch && matchesPos && matchesStatus;
    });
  }, [adsList, searchTerm, positionFilter, statusTab]);

  const handleOpenModal = (ad = null) => {
    if (ad) {
      setEditAd(ad);
      setFormData({
        title: ad.title || "",
        brand_name: ad.brand_name || "",
        position: ad.position || "home_banner",
        target_url: ad.target_url || "",
        image_url: ad.image_url || "",
        start_date: ad.start_date || "",
        end_date: ad.end_date || "",
        is_active: !!ad.is_active
      });
      setSelectedFile(null);
      setPreviewUrl(
        ad.image_url?.startsWith("http")
          ? ad.image_url
          : `${STORAGE_URL}/${ad.image_url}`
      );
      setImageMode(ad.image_url?.startsWith("http") ? "url" : "upload");
    } else {
      setEditAd(null);
      setFormData({
        title: "",
        brand_name: "",
        position: "home_banner",
        target_url: "",
        image_url: "",
        start_date: "",
        end_date: "",
        is_active: true
      });
      setSelectedFile(null);
      setPreviewUrl("");
      setImageMode("upload");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditAd(null);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("brand_name", formData.brand_name);
    data.append("position", formData.position);
    data.append("target_url", formData.target_url);
    data.append("is_active", formData.is_active ? 1 : 0);
    if (formData.start_date) data.append("start_date", formData.start_date);
    if (formData.end_date) data.append("end_date", formData.end_date);

    if (imageMode === "upload" && selectedFile) {
      data.append("image", selectedFile);
    } else if (imageMode === "url" && formData.image_url) {
      data.append("image_url", formData.image_url);
    }

    const toastId = toast.loading(editAd ? "Đang cập nhật..." : "Đang tạo quảng cáo...");

    if (editAd) {
      updateMutation.mutate(
        { id: editAd.id, data },
        {
          onSuccess: () => {
            toast.update(toastId, {
              render: "Cập nhật quảng cáo thành công! 🚀",
              type: "success",
              isLoading: false,
              autoClose: 2500
            });
            handleCloseModal();
          },
          onError: (err) => {
            toast.update(toastId, {
              render: "Lỗi: " + (err.response?.data?.message || "Không thể cập nhật"),
              type: "error",
              isLoading: false,
              autoClose: 3000
            });
          }
        }
      );
    } else {
      addMutation.mutate(data, {
        onSuccess: () => {
          toast.update(toastId, {
            render: "Đã thêm quảng cáo mới thành công! 🚀",
            type: "success",
            isLoading: false,
            autoClose: 2500
          });
          handleCloseModal();
        },
        onError: (err) => {
          toast.update(toastId, {
            render: "Lỗi: " + (err.response?.data?.message || "Không thể thêm quảng cáo"),
            type: "error",
            isLoading: false,
            autoClose: 3000
          });
        }
      });
    }
  };

  const handleToggleActive = (ad) => {
    const updated = !ad.is_active;
    updateMutation.mutate(
      {
        id: ad.id,
        data: { is_active: updated ? 1 : 0 }
      },
      {
        onSuccess: () => {
          toast.success(
            updated ? "Đã bật hiển thị quảng cáo!" : "Đã tạm ẩn quảng cáo!"
          );
        },
        onError: () => {
          toast.error("Không thể thay đổi trạng thái!");
        }
      }
    );
  };

  const handleDelete = (ad) => {
    Swal.fire({
      title: "Xác nhận xóa quảng cáo?",
      html: `Quảng cáo <strong>"${ad.title}"</strong> của Brand <strong>"${ad.brand_name}"</strong> sẽ bị xóa hoàn toàn khỏi hệ thống!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b32d2e",
      cancelButtonColor: "#2271b1",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(ad.id, {
          onSuccess: () => {
            toast.success("Đã xóa chiến dịch quảng cáo thành công!");
          },
          onError: () => {
            toast.error("Lỗi khi xóa quảng cáo.");
          }
        });
      }
    });
  };

  const getPositionLabel = (pos) => {
    const found = POSITIONS.find((p) => p.value === pos);
    return found ? found.label : pos;
  };

  const getImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${STORAGE_URL}/${url}`;
  };

  if (adminInfo?.role === "staff") {
    return (
      <div className="wp-ads-page">
        <div className="wp-permission-denied">
          <h2>🚫 Truy cập bị từ chối</h2>
          <p>Bạn không có quyền quản lý quảng cáo thương hiệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-ads-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* WordPress Page Header */}
      <div className="wp-page-header">
        <div className="wp-header-left">
          <h1 className="wp-page-title">
            <FaBullhorn className="title-icon" /> Quản Lý Quảng Cáo & Tài Trợ Brand
          </h1>
          <p className="wp-page-subtitle">
            Cấu hình các banner quảng cáo từ đối tác thương hiệu hiển thị linh hoạt trên trang chủ và trang đọc truyện
          </p>
        </div>
        <div className="wp-header-actions">
          <button
            type="button"
            className="wp-btn-action wp-btn-primary"
            onClick={() => handleOpenModal()}
          >
            <FaPlus /> Thêm Banner Quảng Cáo Mới
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="wp-metric-cards">
        <div className="wp-metric-card">
          <div className="metric-icon total">
            <FaAd />
          </div>
          <div className="metric-content">
            <span className="metric-label">Tổng chiến dịch</span>
            <h3 className="metric-value">{statistics.total}</h3>
            <span className="metric-hint">Đã khởi tạo</span>
          </div>
        </div>

        <div className="wp-metric-card">
          <div className="metric-icon active">
            <FaCheck />
          </div>
          <div className="metric-content">
            <span className="metric-label">Đang hiển thị</span>
            <h3 className="metric-value">{statistics.active}</h3>
            <span className="metric-badge active">Hoạt động</span>
          </div>
        </div>

        <div className="wp-metric-card">
          <div className="metric-icon inactive">
            <FaTimes />
          </div>
          <div className="metric-content">
            <span className="metric-label">Tạm dừng / Ẩn</span>
            <h3 className="metric-value">{statistics.inactive}</h3>
            <span className="metric-badge inactive">Tắt</span>
          </div>
        </div>

        <div className="wp-metric-card">
          <div className="metric-icon clicks">
            <FaMousePointer />
          </div>
          <div className="metric-content">
            <span className="metric-label">Tổng lượt click</span>
            <h3 className="metric-value">{statistics.totalClicks.toLocaleString()}</h3>
            <span className="metric-hint">{statistics.totalViews.toLocaleString()} lượt xem</span>
          </div>
        </div>
      </div>

      {/* Subsubsub Tabs */}
      <ul className="subsubsub">
        <li>
          <button
            type="button"
            className={statusTab === "all" ? "current" : ""}
            onClick={() => setStatusTab("all")}
          >
            Tất cả <span className="count">({statistics.total})</span>
          </button>{" "}
          |
        </li>
        <li>
          <button
            type="button"
            className={statusTab === "active" ? "current" : ""}
            onClick={() => setStatusTab("active")}
          >
            Đang hiển thị <span className="count">({statistics.active})</span>
          </button>{" "}
          |
        </li>
        <li>
          <button
            type="button"
            className={statusTab === "inactive" ? "current" : ""}
            onClick={() => setStatusTab("inactive")}
          >
            Đã tạm ẩn <span className="count">({statistics.inactive})</span>
          </button>
        </li>
      </ul>

      {/* Filter Bar */}
      <div className="wp-filter-bar">
        <div className="wp-search-box">
          <FaSearch className="search-icon" />
          <input
            type="search"
            placeholder="Tìm theo tên chiến dịch, tên brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="wp-filter-controls">
          <select
            className="wp-select"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            {POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>

          {(searchTerm || positionFilter !== "all" || statusTab !== "all") && (
            <button
              type="button"
              className="wp-button wp-button-secondary btn-reset"
              onClick={() => {
                setSearchTerm("");
                setPositionFilter("all");
                setStatusTab("all");
              }}
            >
              <FaUndo /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="wp-table-container">
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Banner Preview</th>
              <th style={{ width: "25%" }}>Chiến dịch & Brand</th>
              <th style={{ width: "20%" }}>Vị trí hiển thị</th>
              <th style={{ width: "15%" }}>Thống kê</th>
              <th style={{ width: "12%" }}>Trạng thái</th>
              <th style={{ width: "13%", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="no-items">
                  Đang tải danh sách quảng cáo...
                </td>
              </tr>
            ) : filteredAds.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-items">
                  Không có quảng cáo nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredAds.map((ad) => (
                <tr key={ad.id}>
                  {/* Banner Preview */}
                  <td>
                    <div className="ad-thumb-preview">
                      {ad.image_url ? (
                        <a
                          href={getImageSrc(ad.image_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Click xem ảnh gốc"
                        >
                          <img
                            src={getImageSrc(ad.image_url)}
                            alt={ad.title}
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' fill='%23cbd5e1'%3E%3Crect width='120' height='60'/%3E%3C/svg%3E";
                            }}
                          />
                        </a>
                      ) : (
                        <div className="no-img-box">
                          <FaImage />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td className="column-primary has-row-actions">
                    <strong className="ad-title-text">{ad.title}</strong>
                    <div className="ad-brand-tag">
                      Brand: <span>{ad.brand_name}</span>
                    </div>

                    {ad.target_url && (
                      <a
                        href={ad.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-target-link"
                      >
                        <FaExternalLinkAlt /> {ad.target_url}
                      </a>
                    )}

                    <div className="row-actions">
                      <span className="edit">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(ad)}
                          className="button-link"
                        >
                          Chỉnh sửa
                        </button>
                      </span>
                      {" | "}
                      <span className="trash">
                        <button
                          type="button"
                          onClick={() => handleDelete(ad)}
                          className="button-link delete-link"
                        >
                          Xóa bỏ
                        </button>
                      </span>
                    </div>
                  </td>

                  {/* Position */}
                  <td>
                    <span className={`position-badge pos-${ad.position}`}>
                      {getPositionLabel(ad.position)}
                    </span>
                  </td>

                  {/* Stats */}
                  <td>
                    <div className="ad-stat-box">
                      <span className="stat-line">
                        <FaEye /> {ad.views || 0} lượt xem
                      </span>
                      <span className="stat-line clicks">
                        <FaMousePointer /> {ad.clicks || 0} lượt click
                      </span>
                    </div>
                  </td>

                  {/* Toggle Active */}
                  <td>
                    <label className="wp-switch" title="Bật/Tắt quảng cáo">
                      <input
                        type="checkbox"
                        checked={!!ad.is_active}
                        onChange={() => handleToggleActive(ad)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className={`status-text ${ad.is_active ? "active" : "inactive"}`}>
                      {ad.is_active ? "Đang bật" : "Đã tắt"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "right" }}>
                    <div className="action-btns-wrap">
                      <button
                        type="button"
                        className="wp-button wp-button-secondary wp-button-small"
                        onClick={() => handleOpenModal(ad)}
                        title="Sửa"
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        type="button"
                        className="wp-button wp-button-small btn-del"
                        onClick={() => handleDelete(ad)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Chỉnh Sửa Quảng Cáo */}
      {isModalOpen && (
        <div className="wp-modal-backdrop" onClick={handleCloseModal}>
          <div className="wp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="wp-modal-header">
              <h3>
                <FaBullhorn /> {editAd ? "Chỉnh sửa Quảng cáo Brand" : "Thêm Quảng cáo Brand Mới"}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="wp-modal-body">
                <div className="form-field">
                  <label>Tên chiến dịch quảng cáo *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: Chiến dịch mùa hè Vinamilk, Khuyến mãi Shopee..."
                    className="wp-input"
                  />
                </div>

                <div className="form-field-row">
                  <div className="form-field">
                    <label>Tên Brand / Nhà tài trợ *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                      placeholder="Ví dụ: Shopee, Tiki, Apple..."
                      className="wp-input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Vị trí hiển thị *</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="wp-input"
                    >
                      <option value="home_banner">Banner Trang Chủ</option>
                      <option value="story_list">Banner Kho Truyện (/truyen)</option>
                      <option value="story_detail">Banner Chi Tiết Truyện</option>
                      <option value="all">Tất cả các trang (Global)</option>
                    </select>
                  </div>
                </div>

                {/* Banner Image Setting */}
                <div className="form-field">
                  <label>Hình ảnh Banner Quảng cáo *</label>
                  <div className="image-mode-tabs">
                    <button
                      type="button"
                      className={`mode-tab ${imageMode === "upload" ? "active" : ""}`}
                      onClick={() => setImageMode("upload")}
                    >
                      Tải lên file ảnh
                    </button>
                    <button
                      type="button"
                      className={`mode-tab ${imageMode === "url" ? "active" : ""}`}
                      onClick={() => setImageMode("url")}
                    >
                      Nhập đường dẫn URL ảnh
                    </button>
                  </div>

                  {imageMode === "upload" ? (
                    <div className="file-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <p className="upload-hint">Hỗ trợ JPG, PNG, WEBP, GIF (tối đa 10MB)</p>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/banner.jpg"
                      className="wp-input"
                    />
                  )}

                  {previewUrl && (
                    <div className="modal-banner-preview">
                      <p className="preview-label">Xem trước Banner:</p>
                      <img src={previewUrl} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>Link đích khi click (Target URL)</label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    placeholder="https://brand-website.com/promotion"
                    className="wp-input"
                  />
                  <p className="field-hint">Khi độc giả nhấp chuột vào banner sẽ mở trang này trong tab mới.</p>
                </div>

                <div className="form-field-row">
                  <div className="form-field">
                    <label>Ngày bắt đầu (Tùy chọn)</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="wp-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Ngày kết thúc (Tùy chọn)</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="wp-input"
                    />
                  </div>
                </div>

                <div className="form-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span>Kích hoạt hiển thị ngay sau khi lưu</span>
                  </label>
                </div>
              </div>

              <div className="wp-modal-footer">
                <button
                  type="button"
                  className="wp-button wp-button-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="wp-button wp-button-primary"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  <FaCheck /> {editAd ? "Lưu thay đổi" : "Xuất bản quảng cáo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementsManager;
