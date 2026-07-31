import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";

import toast, { Toaster } from "react-hot-toast";
import {
  FaFileAlt, FaTags, FaUser, FaImage, FaSave,
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaLink, FaUpload, FaFont,
  FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaUndo, FaRedo, FaHighlighter, FaPaperPlane
} from "react-icons/fa";
import "./style.scss";
import ImageUploader from "../ThumbnailUploader";
import { useGetCategoriesAD, useGetUsersAD, useUptatePost, useGetPostDetail } from "api/homePage";

// ─── Table of Contents ───────────────────────────────────────────────────────
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
    <section className="sidebar-card">
      <div className="card-header">
        <span className="card-icon">📋</span>
        <h3>Mục lục</h3>
      </div>
      <div className="card-body">
        {headings.length === 0 ? (
          <p className="toc-empty">
            Thêm Heading vào bài viết để tạo mục lục tự động
          </p>
        ) : (
          <ul className="toc-list">
            {headings.map((heading, index) => (
              <li
                key={index}
                className={`toc-item toc-level-${heading.level}`}
                onClick={() => scrollToHeading(heading.id)}
                title={heading.text}
              >
                <span className="toc-bullet" />
                <span className="toc-text">{heading.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// ─── Link Modal ───────────────────────────────────────────────────────────────
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
    <div className="link-modal-overlay" onClick={onClose}>
      <div className="link-modal" onClick={(e) => e.stopPropagation()}>
        <div className="link-modal-header">
          <h4>
            <FaLink style={{ marginRight: 8 }} />
            Chèn liên kết
          </h4>
          <button type="button" className="link-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="link-modal-body">
          <label>URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="link-modal-input"
          />
        </div>
        <div className="link-modal-footer">
          <button type="button" className="link-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="link-btn-confirm"
            onClick={handleConfirm}
            disabled={!url.trim()}
          >
            <FaLink style={{ marginRight: 6 }} />
            Chèn link
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar ─────────────────────────────────────────────────────────────────
const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36"];

const MenuBar = ({ editor }) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState("");
  if (!editor) return null;

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("upload", file);
    const response = await fetch(
      "http://127.0.0.1:8000/api/admin/upload-image-editor",
      {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      }
    );
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
          loading: "Đang upload ảnh...",
          success: "Upload ảnh thành công!",
          error: "Upload ảnh thất bại, thử lại nhé!",
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
      <div className="tiptap-toolbar">
        <select
          className="toolbar-select"
          onChange={(e) =>
            editor.chain().focus().setFontSize(e.target.value + "px").run()
          }
          defaultValue=""
        >
          <option value="" disabled>Cỡ chữ</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        <select
          className="toolbar-select"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
          }}
          defaultValue=""
        >
          <option value="" disabled>Định dạng</option>
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="toolbar-divider" />

        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive("bold") ? "is-active" : ""}`}
          title="Bold">
          <FaBold />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive("italic") ? "is-active" : ""}`}
          title="Italic">
          <FaItalic />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive("underline") ? "is-active" : ""}`}
          title="Underline">
          <FaUnderline />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive("strike") ? "is-active" : ""}`}
          title="Strikethrough">
          <FaStrikethrough />
        </button>

        <div className="toolbar-divider" />

        <button type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
          title="Căn trái">
          <FaAlignLeft />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
          title="Căn giữa">
          <FaAlignCenter />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
          title="Căn phải">
          <FaAlignRight />
        </button>

        <div className="toolbar-divider" />

        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
          title="Danh sách">
          <FaListUl />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
          title="Danh sách số">
          <FaListOl />
        </button>

        <div className="toolbar-divider" />

        <label className="toolbar-btn color-picker-label" title="Màu chữ">
          <FaFont />
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
          />
        </label>

        <label className="toolbar-btn color-picker-label" title="Highlight">
          <FaHighlighter />
          <input
            type="color"
            onInput={(e) =>
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
            }
            style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
          />
        </label>

        <div className="toolbar-divider" />

        <button type="button"
          onClick={handleOpenLinkModal}
          className={`toolbar-btn ${editor.isActive("link") ? "is-active" : ""}`}
          title="Chèn link">
          <FaLink />
        </button>

        <button type="button"
          onClick={handleImageUpload}
          className="toolbar-btn"
          title="Upload ảnh">
          <FaUpload />
        </button>

        <div className="toolbar-divider" />

        <button type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="toolbar-btn"
          title="Undo">
          <FaUndo />
        </button>

        <button type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="toolbar-btn"
          title="Redo">
          <FaRedo />
        </button>
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

// ─── Main Component ───────────────────────────────────────────────────────────
const EditPosts = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    category_id: "",
    avatar_post: null, 
    preview_avatar: "", 
    author: "",
    authorType: "real",
  });

  const { data: postDetail, isLoading: isPostLoading } = useGetPostDetail(
    state?.post ? null : id
  );

  const { data: categories, isLoading: isCatLoading } = useGetCategoriesAD();
  const { data: authors, isLoading: isAuthLoading } = useGetUsersAD();
  const updatePostMutation = useUptatePost();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({
        controls: true,   
        nocookie: true,   
        width: 640,       
        height: 480,      
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setPost((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    let source = null;
    if (state?.post) {
      source = state.post;
    } else if (postDetail) {
      source = postDetail.data?.data || postDetail.data || postDetail;
    }

    if (!source || !editor) return;

    const authorType = source.author === "Ẩn danh" ? "anonymous" : "real";

    let initialPreview = "";
    if (source.avatar_post) {
      if (source.avatar_post.startsWith("http")) {
        initialPreview = source.avatar_post;
      } else {
        initialPreview = `http://127.0.0.1:8000/storage/${source.avatar_post}`;
      }
    }

    setPost({
      title:       source.title       || "",
      description: source.description || "",
      content:     source.content     || "",
      category_id: source.category_id || "",
      avatar_post: null, 
      preview_avatar: initialPreview, 
      author:      source.author      || "",
      authorType,
    });

    editor.commands.setContent(source.content || "");
  }, [state, postDetail, editor]);

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setPost((prev) => ({
        ...prev,
        avatar_post: selectedFile,
        preview_avatar: URL.createObjectURL(selectedFile) 
      }));
    }
  };

  // ── Thay đổi hàm xử lý lưu trữ bài viết ──
  const handleSavePost = async (status) => {
    // Nếu là xuất bản bài viết, yêu cầu nhập tiêu đề trước tiên
    if (status === "published" && !post.title.trim()) {
      toast.error("Vui lòng điền tiêu đề bài viết trước khi xuất bản!");
      return;
    }
    if (status === "draft" && !post.title.trim()) {
      toast.error("Vui lòng nhập ít nhất tiêu đề để lưu bản nháp!");
      return;
    }

    const formData = new FormData();
    formData.append("title",       post.title);
    formData.append("description", post.description);
    formData.append("content",     post.content);
    formData.append("category_id", post.category_id);
    formData.append("author",       post.author);
    formData.append("authorType",   post.authorType);
    formData.append("status",       status); // Đính kèm trạng thái 'published' hoặc 'draft' lên Laravel
    formData.append("_method",     "POST"); 

    if (post.avatar_post) {
      formData.append("avatar_post", post.avatar_post);
    }

    const loadingMessage = status === "published" ? "Đang xuất bản bài viết..." : "Đang lưu bản nháp...";
    const successMessage = status === "published" ? "Xuất bản bài viết thành công! 🎉" : "Lưu bản nháp thành công! 📝";

    toast.promise(
      updatePostMutation.mutateAsync({ id, data: formData }),
      {
        loading: loadingMessage,
        success: successMessage,
        error: "Có lỗi xảy ra, vui lòng kiểm tra lại!",
      },
      {
        style: { minWidth: "280px", fontSize: "14px" },
        success: { duration: 3000 },
        error: { duration: 4000 },
      }
    );

    try {
      await updatePostMutation.mutateAsync({ id, data: formData });
      setTimeout(() => {
        navigate("/admin/all/posts");
      }, 800);
    } catch (err) {
      console.error("Lỗi cập nhật bài viết:", err.response?.data?.errors);
    }
  };

  useEffect(() => {
    return () => {
      if (post.preview_avatar && post.preview_avatar.startsWith("blob:")) {
        URL.revokeObjectURL(post.preview_avatar);
      }
    };
  }, [post.preview_avatar]);

  if ((isPostLoading && !state?.post) || isCatLoading || isAuthLoading) {
    return (
      <div className="loading-state">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="add-post-page">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            fontSize: "14px",
          },
        }}
      />

      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaFileAlt className="title-icon" />
            Chỉnh sửa bài viết
          </h1>
          <p className="page-subtitle">
            Viết, chỉnh sửa và xuất bản nội dung chất lượng cao
          </p>
        </div>
      </div>

      {/* Bỏ onSubmit của tag form để xử lý độc lập qua onClick của button */}
      <form className="add-post-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-wrapper">

          {/* ── Main Content ── */}
          <div className="main-content">
            <section className="form-section">
              <div className="section-header">
                <h2>Tiêu đề bài viết</h2>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="title-input"
                />
              </div>
            </section>

            <section className="form-section">
              <div className="section-header">
                <h2>Mô tả ngắn</h2>
                <span className="section-hint">Tóm tắt nội dung bài viết</span>
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Nhập mô tả ngắn để hiển thị khi chia sẻ..."
                  value={post.description}
                  onChange={(e) =>
                    setPost({ ...post, description: e.target.value })
                  }
                  className="description-textarea"
                  rows="3"
                />
                <div className="char-count">
                  {post.description.length} / 200 ký tự
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-header">
                <h2>Nội dung chi tiết</h2>
                <span className="section-hint">Viết nội dung bài viết</span>
              </div>
              <div className="form-group">
                <div className="editor-wrapper">
                  <MenuBar editor={editor} />
                  <EditorContent editor={editor} className="tiptap-editor" />
                </div>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="addpost-sidebar">
            <section className="sidebar-card">
              <div className="card-header">
                <FaImage className="card-icon" />
                <h3>Ảnh đại diện</h3>
              </div>
              <div className="card-body">
                <ImageUploader value={post.preview_avatar} onFiles={handleFiles} />
              </div>
            </section>

            <section className="sidebar-card">
              <div className="card-header">
                <FaTags className="card-icon" />
                <h3>Danh mục</h3>
              </div>
              <div className="card-body">
                <select
                  value={post.category_id}
                  onChange={(e) =>
                    setPost({ ...post, category_id: e.target.value })
                  }
                  className="category-select"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories &&
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
            </section>

            <section className="sidebar-card">
              <div className="card-header">
                <FaUser className="card-icon" />
                <h3>Tác giả</h3>
              </div>
              <div className="card-body">
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="authorType"
                      value="real"
                      checked={post.authorType === "real"}
                      onChange={() =>
                        setPost({ ...post, authorType: "real", author: "" })
                      }
                    />
                    <span>Tác giả thực</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="authorType"
                      value="anonymous"
                      checked={post.authorType === "anonymous"}
                      onChange={() =>
                        setPost({
                          ...post,
                          authorType: "anonymous",
                          author: "Ẩn danh",
                        })
                      }
                    />
                    <span>Ẩn danh</span>
                  </label>
                </div>

                {post.authorType === "real" && (
                  <select
                    value={post.author}
                    onChange={(e) =>
                      setPost({ ...post, author: e.target.value })
                    }
                    className="author-select"
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {authors &&
                      authors.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                  </select>
                )}
              </div>
            </section>

            <TableOfContents editor={editor} />

            {/* ── Khu vực nút điều khiển lưu trữ ── */}
            <div className="action-buttons-group" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* Nút Xuất bản */}
              <button 
                type="button" 
                className="btn-submit btn-publish" 
                onClick={() => handleSavePost("published")}
                disabled={updatePostMutation.isPending}
                style={{ backgroundColor: "#2ecc71" }}
              >
                <FaPaperPlane className="btn-icon" />
                {updatePostMutation.isPending ? "Đang xử lý..." : "Xuất bản bài viết"}
              </button>

              {/* Nút Lưu bản nháp */}
              <button 
                type="button" 
                className="btn-submit btn-draft" 
                onClick={() => handleSavePost("draft")}
                disabled={updatePostMutation.isPending}
                style={{ backgroundColor: "#7f8c8d" }}
              >
                <FaSave className="btn-icon" />
                {updatePostMutation.isPending ? "Đang xử lý..." : "Lưu bản nháp"}
              </button>
              
            </div>

          </aside>
        </div>
      </form>
    </div>
  );
};

export default EditPosts;