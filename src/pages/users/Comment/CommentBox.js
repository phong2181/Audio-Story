// components/CommentSection/index.jsx
import React, { useState } from "react";
import { FaThumbsUp, FaReply, FaEdit, FaTrash, FaCrown, FaFeatherAlt } from "react-icons/fa"; 
import {
    useGetComments,
    useAddComment,
    useUpdateComment,
    useDeleteComment,
    useLikeComment,
} from "api/homePage";
import { STORAGE_URL } from "config/config";

// Helper: lấy URL avatar đúng
const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `${STORAGE_URL}${avatar}`;
};

// Component Avatar dùng chung - Đã nâng cấp hỗ trợ vương miện phía trên cho VIP
const Avatar = ({ avatar, name, isVip, size = 36 }) => {
    const [imgError, setImgError] = useState(false);
    const avatarUrl = getAvatarUrl(avatar);

    return (
        <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
            {/* VƯƠNG MIỆN PHÍA TRÊN AVATAR NẾU LÀ USER VIP */}
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

// depth: 0 = gốc, 1 = cấp 2, 2 = cấp 3 (tối đa)
const CommentItem = ({ comment, chapterId, currentUserId, currentUserRole, storyAuthorId, depth = 0 }) => {
    const MAX_DEPTH = 2; // 3 cấp: 0, 1, 2

    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // TỐI ƯU TRẠNG THÁI LIKE: Đồng bộ dữ liệu Backend hoặc tự quản lý trạng thái bấm On/Off cục bộ
    const [localLiked, setLocalLiked] = useState(
        comment.is_liked || (comment.liked_by_users && comment.liked_by_users.includes(currentUserId)) || false
    );
    const [localLikesCount, setLocalLikesCount] = useState(comment.likes || 0);

    const addComment    = useAddComment();
    const updateComment = useUpdateComment();
    const deleteComment = useDeleteComment();
    const likeComment   = useLikeComment();

    // Kiểm tra các vai trò đặc biệt của CHỦ THỂ bình luận (Để hiển thị màu sắc/tag danh hiệu)
    const isUserVip = !!comment.user?.membership_plan_id; 
    const isCommentAuthor = storyAuthorId && comment.user_id?.toString() === storyAuthorId?.toString();
    const isCommentAdminOrStaff = ["admin", "staff"].includes(comment.user?.role);

    // 🎯 KIỂM TRA QUYỀN CỦA USER ĐANG ĐĂNG NHẬP (Để hiển thị nút hành động)
    const isCurrentPlayerAdminOrStaff = ["admin", "staff"].includes(currentUserRole);
    const isCurrentPlayerStoryAuthor = storyAuthorId && currentUserId?.toString() === storyAuthorId?.toString();

    // Hàm xử lý màu sắc tên dựa trên phân quyền ưu tiên: Admin/Staff -> Tác giả -> VIP -> Thường
    const getNameColor = () => {
        if (isCommentAdminOrStaff) return "#e74c3c"; 
        if (isCommentAuthor) return "#2ecc71";       
        if (isUserVip) return "#d4af37";      
        return "var(--text-title, #1e293b)";                     
    };

    // HÀM XỬ LÝ NHẤN LIKE & HUỶ LIKE NGAY LẬP TỨC TRÊN UI
    const handleLikeToggle = () => {
        if (!currentUserId) {
            alert("Vui lòng đăng nhập để thích bình luận!");
            return;
        }

        likeComment.mutate(comment.id, {
            onSuccess: (data) => {
                //console.log("LIKE SUCCESS:", data);
                setLocalLiked(data.liked);
                setLocalLikesCount(data.likes);
            }
        });
    };

    const handleReply = () => {
        if (!replyText.trim()) return;
        addComment.mutate({
            chapter_id: chapterId,
            content: replyText,
            parent_id: comment.id,
        });
        setReplyText("");
        setShowReply(false);
    };

    const handleEdit = () => {
        if (!editText.trim()) return;
        updateComment.mutate({ id: comment.id, content: editText, chapter_id: chapterId });
        setIsEditing(false);
    };

    const handleConfirmDelete = () => {
        deleteComment.mutate({ id: comment.id, chapter_id: chapterId });
        setShowDeleteConfirm(false);
    };

    const isMaxDepth = depth >= MAX_DEPTH;

    return (
        <div style={{
            marginBottom: "16px",
            paddingLeft: depth > 0 ? "24px" : "0",
            width: "100%",
            boxSizing: "border-box",
        }}>
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
                                {comment.user?.role === "admin" ? "quản trị viên" : "quản trị viên"}
                            </span>
                        )}

<span style={{ fontSize: "12px", color: "var(--text-muted, #999)" }}>
                            {new Date(comment.created_at).toLocaleDateString("vi-VN")}
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

                                {/* 🎯 NÚT XÓA ĐÃ NÂNG CẤP TOÀN DIỆN QUYỀN HẠN:
                                    Hiện ra nếu:
                                    1. Là chính chủ viết bình luận (currentUserId === comment.user_id)
                                    2. HOẶC Người xem hiện tại là TÁC GIẢ của bộ truyện này (isCurrentPlayerStoryAuthor)
                                    3. HOẶC Người xem hiện tại có Role quản trị Admin/Staff (isCurrentPlayerAdminOrStaff) */}
                                {(currentUserId === comment.user_id || isCurrentPlayerStoryAuthor || isCurrentPlayerAdminOrStaff) && (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{ ...actionBtn, color: "#e74c3c" }}>
                                        <FaTrash /> Xóa
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
                            chapterId={chapterId}
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

const CommentSection = ({ story_id, storyAuthorId }) => { // Correct prop is story_id
    const [newComment, setNewComment] = useState("");
    const { data, isLoading } = useGetComments(story_id);
    const addComment = useAddComment();

    const token = localStorage.getItem("ACCESS_TOKEN");
    const user = JSON.parse(localStorage.getItem("USER") || "null");

    const comments = data?.data?.data || data?.data || [];
    const isCurrentPlayerVip = !!user?.membership_plan_id;

    const handleSubmit = () => {
        if (!newComment.trim()) return;

        console.log("Payload:", {
            story_id: story_id,
            content: newComment
        });

        addComment.mutate({
            story_id: story_id, // Change this from storyId to story_id
            content: newComment
        });

        console.log("storyId:", story_id); // Change this from storyId to story_id
        console.log("storyAuthorId:", storyAuthorId);

        setNewComment("");
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
                            placeholder="Viết bình luận..."
                            style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 14px", borderRadius: "20px", border: "1px solid var(--border-color, #ddd)", background: "var(--bg-card, #fff)", color: "var(--text-color, #111827)", outline: "none", boxSizing: "border-box" }}
                        />
                        <button onClick={handleSubmit} disabled={addComment.isPending} style={btnStyle("#6c63ff")}> 
                            {addComment.isPending ? "..." : "Gửi"}
                        </button>
                    </div>
                </div>
            ) : (
                <p style={{ color: "var(--text-muted, #999)", marginBottom: "16px", fontSize: "14px" }}>
                    Vui lòng đăng nhập để bình luận.
                </p>
            )}

            {isLoading ? (
                <p style={{ color: "var(--text-muted, #999)" }}>Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
                <p style={{ color: "var(--text-muted, #999)", textAlign: "center" }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            ) : (
                comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        chapterId={story_id}
                        currentUserId={user?.id}
                        currentUserRole={user?.role} // 🎯 Truyền thêm role của user đang đăng nhập xuống Item
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