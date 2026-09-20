import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import "./style.scss";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { 
    postLoginUserAPI,
    postRegisterAPI, 
    useForgotPasswordSendCode, 
    useForgotPasswordVerifyCode, 
    useForgotPasswordReset } from "api/homePage"; 

const AuthDialog = ({ onClose, isLogin: defaultIsLogin }) => {
    const [isLogin, setIsLogin] = useState(defaultIsLogin !== undefined ? defaultIsLogin : true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);

    const sendCodeMutation = useForgotPasswordSendCode();
    const verifyCodeMutation = useForgotPasswordVerifyCode();
    const resetPasswordMutation = useForgotPasswordReset();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleGoogleLogin = () => {
       window.location.href = 'http://127.0.0.1:8000/auth/google';
    };

    const loginMutation = useMutation({
        mutationFn: (data) => postLoginUserAPI(data),
        onSuccess: (response) => {
            localStorage.setItem("ACCESS_TOKEN", response.token);
            localStorage.setItem("USER", JSON.stringify(response.user));

            const userRole = response.user?.role || response.role;
            if (userRole === "admin" || userRole === "staff") {
                localStorage.setItem("ADMIN_TOKEN", response.token);
            } else {
                localStorage.removeItem("ADMIN_TOKEN");
            }

            toast.success(`Chào mừng bạn quay trở lại, ${response.user?.name || "Thành viên"}!`);
            setTimeout(() => {
                onClose();
                window.location.reload(); 
            }, 1000);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Email hoặc mật khẩu không chính xác.");
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data) => postRegisterAPI(data),
        onSuccess: () => {
            toast.success("Đăng ký tài khoản thành công! Hãy đăng nhập nhé.");
            setIsLogin(true); 
            setEmail(""); setPassword(""); setConfirmPassword("");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký.");
        },
    });

    const [forgotLoading, setForgotLoading] = useState(false);

    const handleSendCode = (e) => {
        e.preventDefault();
        sendCodeMutation.mutate(email, {
            onSuccess: () => {
                toast.success("Mã xác thực đã được gửi vào Email!");
                setForgotStep(2);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Email không tồn tại trên hệ thống.");
            }
        });
    };
    const handleVerifyCode = (e) => {
        e.preventDefault();
        verifyCodeMutation.mutate({ email, code }, {
            onSuccess: () => {
                toast.success("Mã xác thực chính xác!");
                setForgotStep(3);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Mã xác thực không đúng.");
            }
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.warning("Mật khẩu nhập lại không khớp.");
            return;
        }
        
        resetPasswordMutation.mutate({
            email, 
            code, 
            password: newPassword, 
            password_confirmation: confirmNewPassword
        }, {
            onSuccess: () => {
                toast.success("Đổi mật khẩu thành công!");
                setForgotStep(4);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Không thể đặt lại mật khẩu.");
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            loginMutation.mutate({ email, password });
        } else {
            if (password !== confirmPassword) {
                toast.warning("Mật khẩu nhập lại không khớp.");
                return;
            }
            registerMutation.mutate({ name: username, email, password, group: 'client' });
        }
    };

    return (
        <div className="auth-dialog-overlay">
            <ToastContainer position="top-right" autoClose={3000} closeOnClick theme="colored" />
            
            {/* Click vào vùng nền đen mờ bên ngoài để đóng */}
            <div className="overlay-back" onClick={onClose}></div>

            <div className="auth-glass-container open">
                {/* Nút X đóng dialog - đã được fix CSS nổi lên trên cùng */}
                <button type="button" className="close-btn" onClick={onClose} aria-label="Close dialog">✕</button>

                <div className="auth-logo-wrapper">
                    <img src={process.env.PUBLIC_URL + "/logoaudio.ico"} alt="BookAudio Logo" className="auth-logo-img" />
                    <span className="auth-logo-text">Audio <span className="auth-logo-sub">Sotry</span></span>
                </div>

                {isForgotPassword ? (
                    <div className="forgot-password-flow fade-in">
                        <div className="forgot-header-inline">
                            <h3>Khôi phục mật khẩu</h3>
                            <span className="step-badge">Bước {forgotStep}/3</span>
                        </div>

                        {forgotStep === 1 && (
                            <form onSubmit={handleSendCode}>
                                <p className="step-desc">Nhập email của bạn để nhận mã xác thực hệ thống.</p>
                                <div className="form-group">
                                    <label>Địa chỉ Email</label>
                                    <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <button type="submit" className="submit-btn" disabled={forgotLoading}>
                                    {forgotLoading ? "Đang gửi..." : "Tiếp tục"}
                                </button>
                            </form>
                        )}

                        {forgotStep === 2 && (
                            <form onSubmit={handleVerifyCode}>
                                <p className="step-desc">Nhập mã OTP 6 số đã gửi tới: <b>{email}</b></p>
                                <div className="form-group">
                                    <label>Mã xác thực</label>
                                    <input type="text" maxLength="6" placeholder="••••••" className="otp-center-input" value={code} onChange={(e) => setCode(e.target.value)} required />
                                </div>
                                <button type="submit" className="submit-btn" disabled={forgotLoading}>Xác nhận mã</button>
                                <button type="button" className="btn-inline-link" onClick={() => setForgotStep(1)}>Quay lại nhập email</button>
                            </form>
                        )}

                        {forgotStep === 3 && (
                            <form onSubmit={handleResetPassword}>
                                <p className="step-desc">Đặt lại mật khẩu mới bảo mật hơn cho tài khoản.</p>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input type="password" placeholder="Tối thiểu 6 ký tự" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input type="password" placeholder="Nhập lại mật khẩu mới" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="submit-btn" disabled={forgotLoading}>Cập nhật mật khẩu</button>
                            </form>
                        )}

                        {forgotStep === 4 && (
                            <div className="forgot-success-end text-center">
                                <div className="success-checkmark-icon">✓</div>
                                <h4>Đổi mật khẩu thành công!</h4>
                                <p>Bạn đã có thể sử dụng mật khẩu mới để đăng nhập.</p>
                                <button type="button" className="submit-btn" onClick={() => { setIsForgotPassword(false); setForgotStep(1); setIsLogin(true); }}>
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}

                        {forgotStep !== 4 && (
                            <p className="switch-text text-center">
                                <span onClick={() => { setIsForgotPassword(false); setForgotStep(1); }}> Quay lại Đăng nhập</span>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="fade-in">
                        <h2>{isLogin ? "Đăng nhập" : "Đăng ký"}</h2>

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="form-group">
                                    <label>Tên tài khoản</label>
                                    <input type="text" placeholder="Nhập tên tài khoản" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {!isLogin && (
                                <div className="form-group">
                                    <label>Nhập lại mật khẩu</label>
                                    <input type="password" placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={loginMutation.isPending || registerMutation.isPending}>
                                {isLogin
                                    ? (loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập")
                                    : (registerMutation.isPending ? "Đang xử lý..." : "Đăng ký")}
                            </button>

                            <div className="google-login-section">
                                <div className="divider-text"><span>hoặc</span></div>
                                <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                                    <svg className="google-icon" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Đăng nhập bằng Google
                                </button>
                            </div>
                        </form>

                        <span className="divider-notice"> 
                            {isLogin 
                                ? <span className="forgot-trigger-text" onClick={() => setIsForgotPassword(true)}>Quên mật khẩu?</span> 
                                : "Vui lòng điền đúng gmail nhé!"}    
                        </span>

                        <p className="switch-text">
                            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                            <span onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? "Đăng ký" : "Đăng nhập"}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthDialog;