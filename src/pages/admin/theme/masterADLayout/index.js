import { memo } from 'react';
import { ROUTES } from 'utils/route';
import { useLocation } from 'react-router-dom';
import HeaderAD from '../Header';
import Sidebar from '../Sidebar';
import { ToastContainer } from 'react-toastify';
import "./style.scss";


const MasterADLayout = ({ children, className = '', ...props }) => {

    const location = useLocation();
    const isLogin = location.pathname.startsWith(ROUTES.ADMIN.LOGIN);
    return (
        <div className={`admin-layout-root ${className}`.trim()} {...props}>
            {!isLogin && <HeaderAD />}
            <ToastContainer position="top-right" autoClose={3000} />
            {!isLogin && <Sidebar />}
            <div className='main-content'>
                {children}
            </div>
        </div>
    );
}

export default memo(MasterADLayout);