import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "tiptap-extension-font-size";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import toast, { Toaster } from "react-hot-toast";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaLink, FaUpload, FaFont,
  FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaUndo, FaRedo, FaHighlighter, FaChevronDown,
  FaChevronUp, FaImage, FaTimes, FaPaperPlane,
  FaRegSave, FaExternalLinkAlt, FaArrowLeft,
  FaClock, FaFileAlt, FaCheck, FaTrashAlt,
  FaUserCheck, FaUserSecret, FaLayerGroup,
  FaBookOpen, FaHeading
} from "react-icons/fa";
import { MdFormatQuote, MdCode } from "react-icons/md";
import "./style.scss";
import { useGetAddNewPostAD, useGetCategoriesAD, useGetUsersAD } from "api/homePage";

// ── Link Modal ────────────────────────────────────────────────────────────────
const LinkModal = ({ isOpen, onClose, onConfirm, defaultValue = "" }) => {
  const [url, setUrl] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) setUrl(defaultValue);
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (url.trim()) {
      onConfirm(url.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="wp-link-overlay" onClick={onClose}>
      <div className="wp-link-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wp-link-modal__header">
          <h4><FaLink style={{ marginRight: 8 }} />Chèn liên kết URL</h4>
          <button type="button" className="wp-link-modal__close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="wp-link-modal__body">
          <label>Đường dẫn liên kết (URL)</label>
          <div className="wp-link-modal__input-wrap">
            <FaExternalLinkAlt className="wp-link-modal__input-icon" />
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        <div className="wp-link-modal__footer">
          <button type="button" className="wp-link-modal__cancel" onClick={onClose}>Hủy</button>
          <button
            type="button"
            className="wp-link-modal__confirm"
            onClick={handleConfirm}
            disabled={!url.trim()}
          >
            Chèn liên kết
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toolbar Constants & Component ─────────────────────────────────────────────
const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36"];

const MenuBar = ({ editor }) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState("");

  if (!editor) return null;

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("upload", file);
    const response = await fetch("http://127.0.0.1:8000/api/admin/upload-image-editor", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
    const result = await response.json();
    if (result.url) {
      editor.chain().focus().setImage({ src: result.url }).run();
    } else {
      throw new Error("Upload thất bại");
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        toast.promise(uploadImageToServer(file), {
          loading: "Đang tải ảnh lên máy chủ...",
          success: "Tải ảnh thành công!",
          error: "Tải ảnh thất bại!",
        });
      }
    };
    input.click();
  };

  const handleOpenLinkModal = () => {
    const existing = editor.getAttributes("link").href || "";
    setCurrentLink(existing);
    setLinkModalOpen(true);
  };

  const handleConfirmLink = (url) => {
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <>
      <div className="wp-toolbar">
        {/* Paragraph & Headings */}
        <div className="wp-toolbar__group">
          <select
            className="wp-toolbar__select"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
            }}
            defaultValue=""
          >
            <option value="" disabled>Định dạng chữ</option>
            <option value="p">Đoạn văn (Paragraph)</option>
            <option value="1">Tiêu đề 1 (H1)</option>
            <option value="2">Tiêu đề 2 (H2)</option>
            <option value="3">Tiêu đề 3 (H3)</option>
          </select>

          <select
            className="wp-toolbar__select wp-toolbar__select--sm"
            onChange={(e) =>
              editor.chain().focus().setFontSize(e.target.value + "px").run()
            }
            defaultValue=""
          >
            <option value="" disabled>Cỡ</option>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Text styling */}
        <div className="wp-toolbar__group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`wp-toolbar__btn ${editor.isActive("bold") ? "is-active" : ""}`}
            title="In đậm (Ctrl+B)">
            <FaBold />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`wp-toolbar__btn ${editor.isActive("italic") ? "is-active" : ""}`}
            title="In nghiêng (Ctrl+I)">
            <FaItalic />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`wp-toolbar__btn ${editor.isActive("underline") ? "is-active" : ""}`}
            title="Gạch chân (Ctrl+U)">
            <FaUnderline />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`wp-toolbar__btn ${editor.isActive("strike") ? "is-active" : ""}`}
            title="Gạch ngang">
            <FaStrikethrough />
          </button>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Alignment */}
        <div className="wp-toolbar__group">
          <button type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`wp-toolbar__btn ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
            title="Căn trái">
            <FaAlignLeft />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`wp-toolbar__btn ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
            title="Căn giữa">
            <FaAlignCenter />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`wp-toolbar__btn ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
            title="Căn phải">
            <FaAlignRight />
          </button>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Lists & Quotes */}
        <div className="wp-toolbar__group">
          <button type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`wp-toolbar__btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
            title="Danh sách dấu chấm">
            <FaListUl />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`wp-toolbar__btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
            title="Danh sách đánh số">
            <FaListOl />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`wp-toolbar__btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
            title="Khối trích dẫn">
            <MdFormatQuote />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`wp-toolbar__btn ${editor.isActive("code") ? "is-active" : ""}`}
            title="Khối code">
            <MdCode />
          </button>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Color & Highlight */}
        <div className="wp-toolbar__group">
          <label className="wp-toolbar__btn wp-toolbar__color-label" title="Chọn màu chữ">
            <FaFont />
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
              style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
            />
          </label>
          <label className="wp-toolbar__btn wp-toolbar__color-label" title="Đánh dấu màu nổi bật (Highlight)">
            <FaHighlighter />
            <input
              type="color"
              onInput={(e) =>
                editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
              }
              style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
            />
          </label>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Media & Links */}
        <div className="wp-toolbar__group">
          <button type="button"
            onClick={handleOpenLinkModal}
            className={`wp-toolbar__btn ${editor.isActive("link") ? "is-active" : ""}`}
            title="Chèn liên kết">
            <FaLink />
          </button>
          <button type="button"
            onClick={handleImageUpload}
            className="wp-toolbar__btn"
            title="Tải ảnh vào nội dung bài">
            <FaUpload />
          </button>
        </div>

        <div className="wp-toolbar__separator" />

        {/* Undo / Redo */}
        <div className="wp-toolbar__group">
          <button type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="wp-toolbar__btn"
            title="Hoàn tác (Ctrl+Z)">
            <FaUndo />
          </button>
          <button type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="wp-toolbar__btn"
            title="Làm lại (Ctrl+Y)">
            <FaRedo />
          </button>
        </div>
      </div>

      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handleConfirmLink}
        defaultValue={currentLink}
      />
    </>
  );
};

// ── Sidebar Inspector Panel (Collapsible) ─────────────────────────────────────
const SidebarPanel = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="wp-panel">
      <div className="wp-panel__header" onClick={() => setIsOpen((v) => !v)}>
        <div className="wp-panel__title">
          {icon && <span className="wp-panel__icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <button type="button" className="wp-panel__toggle">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {isOpen && <div className="wp-panel__body">{children}</div>}
    </div>
  );
};

// ── Featured Image Panel ──────────────────────────────────────────────────────
const FeaturedImagePanel = ({ onFiles }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (onFiles) onFiles([f]);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onFiles) onFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <SidebarPanel title="Ảnh đại diện (Thumbnail)" icon={<FaImage />}>
      <div className="wp-featured-image">
        {preview ? (
          <div className="wp-featured-image__preview">
            <div className="wp-featured-image__frame">
              <img src={preview} alt="Ảnh đại diện bài viết" />
            </div>
            <div className="wp-featured-image__actions">
              <button
                type="button"
                className="wp-featured-image__btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload /> Đổi ảnh
              </button>
              <button
                type="button"
                className="wp-featured-image__btn wp-featured-image__btn--remove"
                onClick={handleRemove}
              >
                <FaTrashAlt /> Xóa
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="wp-featured-image__placeholder"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="placeholder-icon-circle">
              <FaImage className="wp-featured-image__placeholder-icon" />
            </div>
            <strong>Tải lên ảnh bìa bài viết</strong>
            <small>Tỉ lệ khuyến nghị 16:9 (1200x675px) • Hỗ trợ PNG, JPG, WEBP</small>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </SidebarPanel>
  );
};

// ── Table of Contents (Auto generated from H1, H2, H3) ────────────────────────
const TableOfContents = ({ editor }) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!editor) return;
    const updateHeadings = () => {
      const items = [];
      editor.state.doc.forEach((node) => {
        if (node.type.name === "heading") {
          items.push({
            level: node.attrs.level,
            text: node.textContent,
            id: node.textContent
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, ""),
          });
        }
      });
      setHeadings(items);
    };
    updateHeadings();
    editor.on("update", updateHeadings);
    return () => editor.off("update", updateHeadings);
  }, [editor]);

  const scrollToHeading = (id) => {
    const editorEl = document.querySelector(".ProseMirror");
    if (!editorEl) return;
    const allHeadings = editorEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
    for (const el of allHeadings) {
      if (
        el.textContent
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") === id
      ) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  return (
    <SidebarPanel title="Mục lục bài viết" icon={<FaHeading />} defaultOpen={false}>
      {headings.length === 0 ? (
        <p className="wp-toc__empty">
          Thêm các tiêu đề (Heading H1, H2, H3) vào nội dung để tự động tạo cấu trúc mục lục.
        </p>
      ) : (
        <ul className="wp-toc__list">
          {headings.map((heading, index) => (
            <li
              key={index}
              className={`wp-toc__item wp-toc__item--level${heading.level}`}
              onClick={() => scrollToHeading(heading.id)}
              title={heading.text}
            >
              <span className="wp-toc__bullet" />
              <span className="wp-toc__text">{heading.text}</span>
            </li>
          ))}
        </ul>
      )}
    </SidebarPanel>
  );
};

// ── Main Add Post Component ───────────────────────────────────────────────────
const AddPost = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng bài viết mới ‹ Quản trị";
  }, []);

  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    category_id: "",
    avatar_post: null,
    author: "",
    authorType: "real",
  });

  const { data: categories, isLoading } = useGetCategoriesAD();
  const addPostMutation = useGetAddNewPostAD();
  const { data: authors, isLoading: isAuthLoading } = useGetUsersAD();

  const filteredAuthors = authors?.filter(
    (user) => user.role === "admin" || user.role === "staff"
  ) || [];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setPost((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  if (isLoading || isAuthLoading) {
    return (
      <div className="wp-loading">
        <div className="wp-loading__spinner" />
        <p>Đang chuẩn bị không gian soạn thảo...</p>
      </div>
    );
  }

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      setPost((prev) => ({ ...prev, avatar_post: files[0] }));
    } else {
      setPost((prev) => ({ ...prev, avatar_post: null }));
    }
  };

  const handleSavePost = async (status) => {
    if (!post.title || !post.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }
    if (!post.description || !post.description.trim()) {
      toast.error("Vui lòng nhập mô tả ngắn tóm tắt bài viết!");
      return;
    }
    if (!editor || editor.getText().trim() === "") {
      toast.error("Vui lòng nhập nội dung chi tiết bài viết!");
      return;
    }

    if (status === "published") {
      if (!post.category_id) {
        toast.error("Vui lòng chọn chuyên mục cho bài viết!");
        return;
      }
      if (post.authorType === "real" && !post.author) {
        toast.error("Vui lòng chọn tác giả bài viết!");
        return;
      }
      if (!post.avatar_post) {
        toast.error("Vui lòng tải lên ảnh đại diện bài viết!");
        return;
      }
    }

    const formData = new FormData();
    formData.append("status", status);
    formData.append("title", post.title);
    formData.append("description", post.description);
    formData.append("content", post.content);
    formData.append("category_id", post.category_id);
    formData.append("author", post.author);
    formData.append("authorType", post.authorType);
    if (post.avatar_post) {
      formData.append("avatar_post", post.avatar_post);
    }

    const loadingMsg = status === "draft" ? "Đang lưu bản nháp..." : "Đang xuất bản bài viết...";

    await toast.promise(
      addPostMutation.mutateAsync(formData),
      {
        loading: loadingMsg,
        success: () => {
          editor.commands.clearContent();
          setPost({
            title: "",
            description: "",
            content: "",
            category_id: "",
            avatar_post: null,
            author: "",
            authorType: "real",
          });
          return status === "draft" ? "Đã lưu bản nháp thành công! 📝" : "Xuất bản bài viết thành công! 🎉";
        },
        error: (err) => {
          console.error("Lỗi:", err.response?.data?.errors);
          return "Có lỗi xảy ra khi lưu bài viết, vui lòng thử lại!";
        },
      },
      {
        style: { minWidth: "300px", fontSize: "14px" },
        success: { duration: 4000, iconTheme: { primary: "#4f46e5", secondary: "#fff" } },
        error: { duration: 4000 },
      }
    );
  };

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="wp-add-post">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", background: "#1e293b", color: "#f1f5f9", fontSize: "14px" },
        }}
      />

      {/* Top Bar with Navigation & Quick Actions */}
      <div className="wp-topbar">
        <div className="wp-topbar__left">
          <Link to="/admin/all-posts" className="wp-topbar__back-btn" title="Quay lại danh sách bài viết">
            <FaArrowLeft />
            <span>Tất cả bài viết</span>
          </Link>
          <div className="wp-topbar__divider" />
          <span className="wp-topbar__label">Đăng bài viết mới</span>
          <div className="wp-topbar__metrics">
            <span className="metric-pill">
              <FaFileAlt /> {wordCount} từ
            </span>
            <span className="metric-pill">
              <FaClock /> ~{readingTime} phút đọc
            </span>
          </div>
        </div>

        <div className="wp-topbar__right">
          <button
            type="button"
            className="wp-topbar__btn wp-topbar__btn--draft"
            disabled={addPostMutation.isPending}
            onClick={() => handleSavePost("draft")}
          >
            <FaRegSave />
            <span>{addPostMutation.isPending ? "Đang xử lý..." : "Lưu nháp"}</span>
          </button>
          <button
            type="button"
            className="wp-topbar__btn wp-topbar__btn--publish"
            disabled={addPostMutation.isPending}
            onClick={() => handleSavePost("published")}
          >
            <FaPaperPlane />
            <span>{addPostMutation.isPending ? "Đang xử lý..." : "Xuất bản bài viết"}</span>
          </button>
        </div>
      </div>

      {/* Body: Two-column Gutenberg Style Workspace */}
      <form onSubmit={(e) => e.preventDefault()} className="wp-body">
        {/* Main Editor Column */}
        <div className="wp-editor-column">
          {/* Post Title Card */}
          <div className="wp-title-card">
            <textarea
              className="wp-title-input"
              placeholder="Nhập tiêu đề bài viết tại đây..."
              value={post.title}
              rows={1}
              onChange={(e) => {
                setPost({ ...post, title: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>

          {/* Excerpt / Sapo (Short description) */}
          <div className="wp-description-card">
            <div className="description-card-header">
              <label className="wp-field-label">
                Mô tả ngắn (Sapo / Tóm tắt) <span className="wp-field-required">*</span>
              </label>
              <span className={`wp-char-count ${post.description.length > 200 ? "limit" : ""}`}>
                {post.description.length} / 200 ký tự
              </span>
            </div>
            <textarea
              className="wp-description-input"
              placeholder="Tóm tắt ngắn gọn nội dung bài viết để hiển thị trên danh sách bài đăng và chia sẻ mạng xã hội (Facebook, Zalo)..."
              value={post.description}
              onChange={(e) => setPost({ ...post, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Rich Text Editor Frame */}
          <div className="wp-editor-card">
            <div className="wp-editor-toolbar-sticky">
              <MenuBar editor={editor} />
            </div>
            <div className="wp-editor-canvas">
              <EditorContent editor={editor} className="wp-editor-content" />
            </div>
            <div className="wp-editor-footer">
              <div className="footer-stats">
                <span>Tổng số: <strong>{wordCount}</strong> từ</span>
                <span>•</span>
                <span>Thời gian đọc: <strong>~{readingTime}</strong> phút</span>
              </div>
              <span className="footer-status-hint">💡 Soạn thảo trực quan theo chuẩn WordPress 6.x</span>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="wp-sidebar">
          {/* 1. Publish Status Card */}
          <SidebarPanel title="Xuất bản & Lịch trình" icon="🚀">
            <div className="wp-publish-panel">
              <div className="wp-publish-panel__info">
                <div className="wp-publish-panel__row">
                  <span>Trạng thái:</span>
                  <span className="status-badge-draft">Bản nháp</span>
                </div>
                <div className="wp-publish-panel__row">
                  <span>Khả năng hiển thị:</span>
                  <strong>Công khai (Mọi người)</strong>
                </div>
                <div className="wp-publish-panel__row">
                  <span>Định dạng:</span>
                  <strong>Bài viết chuẩn</strong>
                </div>
              </div>
              <div className="wp-publish-panel__actions">
                <button
                  type="button"
                  className="wp-btn wp-btn--draft"
                  disabled={addPostMutation.isPending}
                  onClick={() => handleSavePost("draft")}
                >
                  <FaRegSave />
                  {addPostMutation.isPending ? "Đang xử lý..." : "Lưu bản nháp"}
                </button>
                <button
                  type="button"
                  className="wp-btn wp-btn--publish"
                  disabled={addPostMutation.isPending}
                  onClick={() => handleSavePost("published")}
                >
                  <FaPaperPlane />
                  {addPostMutation.isPending ? "Đang xử lý..." : "Xuất bản ngay"}
                </button>
              </div>
            </div>
          </SidebarPanel>

          {/* 2. Featured Image (Avatar) */}
          <FeaturedImagePanel onFiles={handleFiles} />

          {/* 3. Category Panel */}
          <SidebarPanel title="Chuyên mục bài viết" icon={<FaLayerGroup />}>
            <div className="wp-panel-field">
              <select
                value={post.category_id}
                onChange={(e) => setPost({ ...post, category_id: e.target.value })}
                className="wp-select"
              >
                <option value="">— Chọn chuyên mục —</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <span className="field-hint-text">Chọn chuyên mục phân loại phù hợp nhất với bài viết.</span>
            </div>
          </SidebarPanel>

          {/* 4. Author Panel */}
          <SidebarPanel title="Tác giả bài viết" icon={<FaUserCheck />}>
            <div className="wp-panel-field">
              <div className="wp-author-radios">
                <label className={`wp-author-radio ${post.authorType === "real" ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="authorType"
                    value="real"
                    checked={post.authorType === "real"}
                    onChange={() => setPost({ ...post, authorType: "real", author: "" })}
                  />
                  <div className="radio-content">
                    <FaUserCheck className="radio-icon" />
                    <span>Tác giả thực tế</span>
                  </div>
                </label>
                <label className={`wp-author-radio ${post.authorType === "anonymous" ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="authorType"
                    value="anonymous"
                    checked={post.authorType === "anonymous"}
                    onChange={() => setPost({ ...post, authorType: "anonymous", author: "Ẩn danh" })}
                  />
                  <div className="radio-content">
                    <FaUserSecret className="radio-icon" />
                    <span>Bút danh ẩn danh</span>
                  </div>
                </label>
              </div>

              {post.authorType === "real" && (
                <div className="author-select-box">
                  <label className="inner-label">Chọn thành viên biên tập:</label>
                  <select
                    value={post.author}
                    onChange={(e) => setPost({ ...post, author: e.target.value })}
                    className="wp-select"
                  >
                    <option value="">— Chọn tác giả biên tập —</option>
                    {filteredAuthors.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </SidebarPanel>

          {/* 5. Smart Table of Contents */}
          <TableOfContents editor={editor} />
        </aside>
      </form>
    </div>
  );
};

export default AddPost;