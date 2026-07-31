import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { ROUTES } from "utils/route";
import { saveAdminAuth, isAdminLoggedIn } from "utils/adminAuth";
import { useLoginAdminMutation } from "../../../api/homePage/queries";
import "./style.scss";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Gọi Hook Mutation
  const loginMutation = useLoginAdminMutation();

  const isLoggedIn = isAdminLoggedIn();
  if (isLoggedIn) {
    setTimeout(() => navigate(ROUTES.ADMIN.DASHBOARD), 0);
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Sử dụng mutate để gửi dữ liệu
    loginMutation.mutate(form, {
      onSuccess: (data) => {
        // 'data' ở đây là response.data trả về từ Laravel (token, user)
        saveAdminAuth(data.token, data.user);
        navigate(ROUTES.ADMIN.DASHBOARD);
      },
      onError: (error) => {
        const msg = error.response?.data?.message || "Đăng nhập thất bại";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-card">
          <h1 className="title">Admin Panel</h1>
          
          <form onSubmit={handleSubmit} className="login-form">
            {errorMessage && (
              <div className="alert alert-error"><span>{errorMessage}</span></div>
            )}

            <div className="form-group">
              <label>Email Admin</label>
              <div className="input-group">
                <FaUser className="icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-group">
                <FaLock className="icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={loginMutation.isPending} // Dùng trạng thái của mutation
            >
              {loginMutation.isPending ? "Đang xác thực..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default memo(LoginAdmin);