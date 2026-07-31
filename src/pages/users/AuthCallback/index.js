import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const user = urlParams.get('user');
        const error = urlParams.get('error');

        if (token && user) {
            try {
                const userData = JSON.parse(decodeURIComponent(user));
                localStorage.setItem("ACCESS_TOKEN", token);
                localStorage.setItem("USER", JSON.stringify(userData));
                // Redirect về trang chủ hoặc trang trước đó
                navigate('/');
            } catch (e) {
                console.error('Error parsing user data:', e);
                navigate('/login');
            }
        } else if (error) {
            console.error('Google login error:', decodeURIComponent(error));
            navigate('/login');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #4285F4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '16px', color: '#666' }}>Đang xử lý đăng nhập...</p>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AuthCallback;