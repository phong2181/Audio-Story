// components/CommentSection/index.jsx
import React, { useState } from "react";
import { 
    FaThumbsUp, 
    FaReply, 
    FaEdit, 
    FaTrash, 
    FaCrown, 
    FaFeatherAlt,
    FaFlag,
    FaTimes
} from "react-icons/fa"; 
import {
    useGetComments,
    useAddComment,
    useUpdateComment,
    useDeleteComment,
    useLikeComment,
    useReportComment,
} from "api/homePage";
import { STORAGE_URL } from "config/config";
import Swal from "sweetalert2";

// Helper: lấy URL avatar đúng
const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `${STORAGE_URL}${avatar}`;
};

// Component Avatar dùng chung - Hỗ trợ vương miện phía trên cho VIP
const Avatar = ({ avatar, name, isVip, size = 36 }) => {
    const [imgError, setImgError] = useState(false);
    const avatarUrl = getAvatarUrl(avatar);

    return (
        <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
            {isVip && (
                <div style={{
                    position: "absolute",
                    top: "-11px",
                    left: "50%",
                    transform: "translateX(-50%) rotate(-5deg)",
                    zIndex: 2,
                    color: "#f1c40f",
                    fontSize: `${size * 0.45}px`,
                    filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    animation: "vipCrownFloat 2s ease-in-out infinite"
                }}>
                    <FaCrown />
                </div>
            )}
            
            <div style={{
                width: size, height: size, borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: isVip ? "#f39c12" : "#6c63ff", 
                display: "flex", alignItems: "center", justifyContent: "center",
                border: isVip ? "2px solid #f1c40f" : "none", 
                boxShadow: isVip ? "0 0 6px rgba(241, 196, 15, 0.5)" : "none"
            }}>
                {avatarUrl && !imgError ? (
                    <img
                        src={avatarUrl}
                        alt={name || "avatar"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span style={{ color: "#fff", fontWeight: "bold", fontSize: size * 0.4 }}>
                        {name?.[0]?.toUpperCase() || "U"}
                    </span>
                )}
            </div>
        </div>
    );
};

// Danh sách các lý do vi phạm chuẩn theo yêu cầu
const REPORT_REASONS = [
    { key: "spam", label: "Nội dung spam / Quảng cáo rác" },
    { key: "provocation", label: "Hành vi khiêu khích" },
    { key: "cyberbullying", label: "Bạo lực mạng" },
    { key: "incitement", label: "Kích động gây hấn" },
    { key: "profanity", label: "Sử dụng lời nói thô tục" },
    { key: "other", label: "Khác (Cho phép nhập nội dung chi tiết)" },
];

// WordPress-style Modal Báo cáo Bình luận vi phạm
const ReportCommentModal = ({ isOpen, onClose, comment }) => {
    const [selectedReason, setSelectedReason] = useState("spam");
    const [details, setDetails] = useState("");
    const reportCommentMutation = useReportComment();

    if (!isOpen || !comment) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedReason === "other" && !details.trim()) {
            Swal.fire({
                title: "Thông báo",
                text: "Vui lòng nhập nội dung mô tả chi tiết khi chọn lý do 'Khác'.",
                icon: "warning",
                confirmButtonColor: "#2271b1"
            });
            return;
        }

        try {
            const res = await reportCommentMutation.mutateAsync({
                commentId: comment.id,
                data: {
                    reason: selectedReason,
                    details: details.trim() || null
                }
            });

            Swal.fire({
                title: "✅ Gửi tố cáo thành công",
                text: res.message || "Cảm ơn bạn đã báo cáo vi phạm! Ban quản trị sẽ sớm xem xét xử lý theo tiêu chuẩn cộng đồng.",
                icon: "success",
                confirmButtonColor: "#2271b1"
            });

            onClose();
            setDetails("");
            setSelectedReason("spam");
        } catch (error) {
            const msg = error.response?.data?.message || "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau!";
            Swal.fire({
                title: "Không thể gửi tố cáo",
                text: msg,
                icon: "error",
                confirmButtonColor: "#d63638"
            });
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "16px",
            backdropFilter: "blur(2px)"
        }}>
            <div style={{
                background: "var(--bg-card, #ffffff)",
                color: "var(--text-color, #1e293b)",
                width: "100%",
                maxWidth: "500px",
                borderRadius: "8px",
                border: "1px solid var(--border-color, #c3c4c7)",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
                {/* Header phong cách WordPress */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-color, #e2e8f0)",
                    backgroundColor: "var(--bg-header, #f8fafc)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaFlag style={{ color: "#e11d48", fontSize: "16px" }} />
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text-title, #0f172a)" }}>
                            Báo cáo bình luận vi phạm
                        </h4>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "18px 20px" }}>
                    {/* Trích dẫn bình luận bị tố cáo */}
                    <div style={{
                        marginBottom: "16px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-surface, #f1f5f9)",
                        borderLeft: "4px solid #f97316",
                        fontSize: "13px"
                    }}>
                        <div style={{ fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                            Bình luận của: <span style={{ color: "#0f172a" }}>{comment.user?.name || "Người dùng"}</span>
                        </div>
                        <div style={{
                            color: "var(--text-color, #334155)",
                            fontStyle: "italic",
                            overflowWrap: "anywhere",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                        }}>
                            "{comment.content}"
                        </div>
                    </div>

                    {/* Danh sách lý do */}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--text-title, #1e293b)" }}>
                            Chọn lý do bạn muốn tố cáo bình luận này:
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {REPORT_REASONS.map((r) => (
                                <label
                                    key={r.key}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 10px",
                                        borderRadius: "6px",
                                        border: `1px solid ${selectedReason === r.key ? "#2271b1" : "var(--border-color, #e2e8f0)"}`,
                                        backgroundColor: selectedReason === r.key ? "rgba(34, 113, 177, 0.06)" : "transparent",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="report_reason"
                                        value={r.key}
                                        checked={selectedReason === r.key}
                                        onChange={() => setSelectedReason(r.key)}
                                        style={{ accentColor: "#2271b1", cursor: "pointer" }}
                                    />
                                    <span style={{ fontWeight: selectedReason === r.key ? "600" : "400" }}>{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Textarea nhập nội dung chi tiết */}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-title, #1e293b)" }}>
                            Mô tả chi tiết {selectedReason === "other" && <span style={{ color: "#e11d48" }}>*</span>}:
                        </label>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder={selectedReason === "other" 
                                ? "Vui lòng mô tả cụ thể hành vi vi phạm của bình luận này..." 
                                : "Nhập thêm thông tin dẫn chứng hoặc lý do vi phạm nếu có (tùy chọn)..."
                            }
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--border-color, #c3c4c7)",
                                background: "var(--bg-card, #ffffff)",
                                color: "var(--text-color, #0f172a)",
                                fontSize: "13px",
                                outline: "none",
                                resize: "vertical",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={reportCommentMutation.isPending}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "4px",
                                border: "1px solid var(--border-color, #c3c4c7)",
                                background: "var(--bg-surface, #f8fafc)",
                                color: "#475569",
                                fontSize: "13px",
                                fontWeight: "500",
                                cursor: "pointer"
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={reportCommentMutation.isPending}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "4px",
                                border: "1px solid #2271b1",
                                background: "#2271b1",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: reportCommentMutation.isPending ? "not-allowed" : "pointer",
                                opacity: reportCommentMutation.isPending ? 0.7 : 1,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            {reportCommentMutation.isPending ? "Đang gửi..." : "Gửi tố cáo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// depth: 0 = gốc, 1 = cấp 2, 2 = cấp 3 (tối đa)
const CommentItem = ({ 
    comment, 
    storyId, 
    postId, 
    currentUserId, 
    currentUserRole, 
    storyAuthorId, 
    depth = 0 
}) => {
    const MAX_DEPTH = 2; // 3 cấp: 0, 1, 2

    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Trạng thái Like
    const [localLiked, setLocalLiked] = useState(
        comment.is_liked || (comment.liked_by_users && comment.liked_by_users.includes(currentUserId)) || false
    );
    const [localLikesCount, setLocalLikesCount] = useState(comment.likes || 0);

    const addComment    = useAddComment();
    const updateComment = useUpdateComment();
    const deleteComment = useDeleteComment();
    const likeComment   = useLikeComment();

    // Kiểm tra vai trò
    const isUserVip = !!comment.user?.membership_plan_id; 
    const isCommentAuthor = storyAuthorId && comment.user_id?.toString() === storyAuthorId?.toString();
    const isCommentAdminOrStaff = ["admin", "staff"].includes(comment.user?.role);

    const isCurrentPlayerAdminOrStaff = ["admin", "staff"].includes(currentUserRole);
    const isCurrentPlayerStoryAuthor = storyAuthorId && currentUserId?.toString() === storyAuthorId?.toString();

    const getNameColor = () => {
        if (isCommentAdminOrStaff) return "#e74c3c"; 
        if (isCommentAuthor) return "#2ecc71";       
        if (isUserVip) return "#d4af37";      
        return "var(--text-title, #1e293b)";                     
    };

    const handleLikeToggle = () => {
        if (!currentUserId) {
            Swal.fire({
                title: "Thông báo",
                text: "Vui lòng đăng nhập để thích bình luận!",
                icon: "info",
                confirmButtonColor: "#2271b1"
            });
            return;
        }

        likeComment.mutate(comment.id, {
            onSuccess: (data) => {
                setLocalLiked(data.liked);
                setLocalLikesCount(data.likes);
            }
        });
    };

    const handleReply = () => {
        if (!replyText.trim()) return;
        addComment.mutate({
            story_id: storyId,
            post_id: postId,
            content: replyText,
            parent_id: comment.id,
        }, {
            onSuccess: () => {
                setReplyText("");
                setShowReply(false);
            },
            onError: (err) => {
                const msg = err.response?.data?.message || "Không thể gửi phản hồi.";
                Swal.fire({
                    title: "Thông báo",
                    text: msg,
                    icon: "warning",
                    confirmButtonColor: "#6c63ff"
                });
            }
        });
    };

    const handleEdit = () => {
        if (!editText.trim()) return;
        updateComment.mutate({ id: comment.id, content: editText });
        setIsEditing(false);
    };

    const handleConfirmDelete = () => {
        deleteComment.mutate({ id: comment.id });
        setShowDeleteConfirm(false);
    };

    const handleReportClick = () => {
        if (!currentUserId) {
            Swal.fire({
                title: "Yêu cầu đăng nhập",
                text: "Vui lòng đăng nhập để gửi báo cáo vi phạm nội dung.",
                icon: "warning",
                confirmButtonColor: "#2271b1"
            });
            return;
        }
        setShowReportModal(true);
    };

    const isMaxDepth = depth >= MAX_DEPTH;

    return (
        <div style={{
            marginBottom: "16px",
            paddingLeft: depth > 0 ? "24px" : "0",
            width: "100%",
            boxSizing: "border-box",
        }}>
            {/* Modal Tố cáo */}
            <ReportCommentModal 
                isOpen={showReportModal} 
                onClose={() => setShowReportModal(false)} 
                comment={comment} 
            />

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap", minWidth: 0 }}>
                <Avatar avatar={comment.user?.avatar} name={comment.user?.name} isVip={isUserVip} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong style={{ 
                            fontSize: "14px", 
                            color: getNameColor(), 
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: (isUserVip || isCommentAuthor || isCommentAdminOrStaff) ? "700" : "600",
                            textShadow: isUserVip ? "0px 0px 1px rgba(212,175,55,0.2)" : "none"
                        }}>
                            {comment.user?.name || "Ẩn danh"}
                            
                            {isUserVip && (
                                <FaCrown style={{ color: "#f1c40f", fontSize: "12px", marginLeft: "2px" }} title="Thành viên VIP" />
                            )}
                        </strong> 

                        {isCommentAuthor && (
                            <span style={{
                                backgroundColor: "#2ecc71", color: "#fff", fontSize: "10px",
                                padding: "2px 6px", borderRadius: "4px", fontWeight: "bold",
                                display: "inline-flex", alignItems: "center", gap: "3px"
                            }}>
                                <FaFeatherAlt style={{ fontSize: "9px" }} /> Tác giả
                            </span>
                        )}

                        {isCommentAdminOrStaff && (
                            <span style={{
                                backgroundColor: "#e74c3c", color: "#fff", fontSize: "10px",
                                padding: "2px 6px", borderRadius: "4px", fontWeight: "bold",
                                textTransform: "uppercase"
                            }}>
                                {comment.user?.role === "admin" ? "quản trị viên" : "nhân viên"}
                            </span>
                        )}

                        <span style={{ fontSize: "12px", color: "var(--text-muted, #999)" }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString("vi-VN") : "---"}
                        </span>
                    </div>

                    {isEditing ? (
                        <div style={{ marginTop: "6px" }}>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid var(--border-color, #ddd)", background: "var(--bg-card, #fff)", color: "var(--text-color, #111827)" }}
                            />
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <button onClick={handleEdit} style={btnStyle("#6c63ff")}>Lưu</button>
                                <button onClick={() => setIsEditing(false)} style={btnStyle("#999")}>Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "var(--text-color, #334155)", overflowWrap: "anywhere", wordBreak: "break-word" }}>{comment.content}</p>
                    )}

                    {/* Khu vực Actions */}
                    <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap", alignItems: "center" }}>
                        {!showDeleteConfirm && (
                            <>
                                {/* NÚT LIKE */}
                                <button 
                                    onClick={handleLikeToggle} 
                                    style={{
                                        ...actionBtn,
                                        color: localLiked ? "#6c63ff" : "#666", 
                                        fontWeight: localLiked ? "700" : "400"
                                    }}
                                >
                                    <FaThumbsUp style={{ color: localLiked ? "#6c63ff" : "#666" }} /> 
                                    <span>Thích {localLikesCount > 0 && `(${localLikesCount})`}</span>
                                </button>

                                {currentUserId && !isMaxDepth && (
                                    <button onClick={() => setShowReply(!showReply)} style={actionBtn}>
                                        <FaReply /> Trả lời
                                    </button>
                                )}

                                {/* Nút Sửa: Chỉ chính chủ viết bình luận mới có quyền Sửa */}
                                {currentUserId === comment.user_id && (
                                    <button onClick={() => setIsEditing(true)} style={actionBtn}>
                                        <FaEdit /> Sửa
                                    </button>
                                )}

                                {/* Nút Xóa: Chính chủ, Tác giả hoặc Admin/Staff */}
                                {(currentUserId === comment.user_id || isCurrentPlayerStoryAuthor || isCurrentPlayerAdminOrStaff) && (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{ ...actionBtn, color: "#e74c3c" }}>
                                        <FaTrash /> Xóa
                                    </button>
                                )}

                                {/* 🚩 NÚT BÁO CÁO VI PHẠM (Chỉ hiện khi KHÔNG PHẢI chính chủ và KHÔNG PHẢI bình luận của Quản trị viên) */}
                                {currentUserId !== comment.user_id && !isCommentAdminOrStaff && (
                                    <button 
                                        onClick={handleReportClick} 
                                        style={{ ...actionBtn, color: "var(--text-muted, #94a3b8)" }}
                                        title="Báo cáo bình luận vi phạm này"
                                    >
                                        <FaFlag style={{ fontSize: "11px", color: "#f59e0b" }} /> 
                                        <span style={{ fontSize: "12px" }}>Báo cáo</span>
                                    </button>
                                )}
                            </>
                        )}

                        {showDeleteConfirm && (
                            <div style={{ 
                                display: "flex", alignItems: "center", gap: "8px", 
                                background: "rgba(239, 68, 68, 0.08)", padding: "4px 10px", borderRadius: "6px",
                                border: "1px solid rgba(239, 68, 68, 0.2)"
                            }}>
                                <span style={{ fontSize: "13px", color: "#e74c3c", fontWeight: "500" }}>
                                    {currentUserId !== comment.user_id ? "Xóa bình luận này với tư cách Quản trị/Tác giả?" : "Bạn chắc chắn muốn xóa?"}
                                </span>
                                <button onClick={handleConfirmDelete} style={confirmBtnStyle("#e74c3c")}>Xóa</button>
                                <button onClick={() => setShowDeleteConfirm(false)} style={confirmBtnStyle("#6b7280")}>Hủy</button>
                            </div>
                        )}
                    </div>

                    {currentUserId && (isMaxDepth || showReply) && !showDeleteConfirm && (
                        <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                                placeholder={isMaxDepth ? "Viết bình luận..." : "Viết trả lời..."}
                                style={{ flex: 1, minWidth: 0, width: "100%", padding: "6px 10px", borderRadius: "20px", border: "1px solid var(--border-color, #ddd)", background: "var(--bg-card, #fff)", color: "var(--text-color, #111827)", outline: "none", boxSizing: "border-box" }}
                            />
                            <button onClick={handleReply} disabled={addComment.isPending} style={btnStyle("#6c63ff")}>
                                {addComment.isPending ? "..." : "Gửi"}
                            </button>
                            {!isMaxDepth && (
                                <button onClick={() => { setShowReply(false); setReplyText(""); }} style={btnStyle("#999")}>
                                    Hủy
                                </button>
                            )}
                        </div>
                    )}

                    {comment.replies?.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            storyId={storyId}
                            postId={postId}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            storyAuthorId={storyAuthorId} 
                            depth={Math.min(depth + 1, MAX_DEPTH)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Component bình luận áp dụng cho cả Bộ truyện (story_id) và Bài viết (postId / post_id)
const CommentSection = ({ story_id, postId, post_id, storyAuthorId }) => {
    const effectiveStoryId = story_id || null;
    const effectivePostId = postId || post_id || null;
    const isPost = !!effectivePostId && !effectiveStoryId;
    const targetId = effectivePostId || effectiveStoryId;

    const [newComment, setNewComment] = useState("");
    const { data, isLoading } = useGetComments(targetId, isPost);
    const addComment = useAddComment();

    const token = localStorage.getItem("ACCESS_TOKEN");
    const user = JSON.parse(localStorage.getItem("USER") || "null");

    const comments = data?.data?.data || data?.data || [];
    const isCurrentPlayerVip = !!user?.membership_plan_id;

    const handleSubmit = () => {
        if (!newComment.trim()) return;

        addComment.mutate({
            story_id: effectiveStoryId,
            post_id: effectivePostId,
            content: newComment
        }, {
            onSuccess: () => {
                setNewComment("");
            },
            onError: (err) => {
                const msg = err.response?.data?.message || "Không thể gửi bình luận.";
                Swal.fire({
                    title: "Thông báo",
                    text: msg,
                    icon: "warning",
                    confirmButtonColor: "#6c63ff"
                });
            }
        });
    };

    return (
        <div className="comment-section-wrapper" style={{ marginTop: "32px", padding: "20px", background: "var(--bg-card, #fff)", borderRadius: "12px", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))", width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "18px", color: "var(--text-title, #1e293b)" }}>
                💬 Bình luận ({comments.length})
            </h3>

            {token ? (
                <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
                    <Avatar avatar={user?.avatar} name={user?.name} isVip={isCurrentPlayerVip} />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Viết bình luận văn minh và lịch sự..."
                            style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 14px", borderRadius: "20px", border: "1px solid var(--border-color, #ddd)", background: "var(--bg-card, #fff)", color: "var(--text-color, #111827)", outline: "none", boxSizing: "border-box" }}
                        />
                        <button onClick={handleSubmit} disabled={addComment.isPending} style={btnStyle("#6c63ff")}> 
                            {addComment.isPending ? "..." : "Gửi"}
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ color: "var(--text-muted, #999)", marginBottom: "16px", fontSize: "14px" }}>
                    Vui lòng đăng nhập để tham gia bình luận.
                </p>
            )}

            {isLoading ? (
                <p style={{ color: "var(--text-muted, #999)" }}>Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
                <p style={{ color: "var(--text-muted, #999)", textAlign: "center" }}>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
            ) : (
                comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        storyId={effectiveStoryId}
                        postId={effectivePostId}
                        currentUserId={user?.id}
                        currentUserRole={user?.role}
                        storyAuthorId={storyAuthorId} 
                        depth={0}
                    />
                ))
            )}
        </div>
    );
};

// --- STYLES ---
const btnStyle = (bg) => ({
    padding: "6px 14px", borderRadius: "20px", border: "none",
    backgroundColor: bg, color: "#fff", cursor: "pointer", fontSize: "13px"
});

const confirmBtnStyle = (bg) => ({
    padding: "3px 10px", borderRadius: "4px", border: "none",
    backgroundColor: bg, color: "#fff", cursor: "pointer", fontSize: "12px",
    fontWeight: "500"
});

const actionBtn = {
    background: "none", border: "none", cursor: "pointer",
    fontSize: "13px", color: "var(--text-muted, #666)", display: "flex", alignItems: "center", gap: "4px"
};

export default CommentSection;