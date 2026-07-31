import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import './style.scss';

const AnnouncementModal = ({ data }) => { 
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!data) return;

    // 🎯 SỬA CHUẨN LẠI: 6 tiếng đổi ra milliseconds = 6 * 60 * 60 * 1000
    const SIX_HOURS = 6 * 60 * 60 * 1000; 
    
    const lastShow = localStorage.getItem(`announcement_${data.id}`);
    const now = Date.now();

    // Nếu chưa từng bấm đóng hoặc thời gian đóng đã trôi qua quá 6 tiếng thì mới hiện
    if (!lastShow || (now - parseInt(lastShow)) > SIX_HOURS) {
      setIsOpen(true);
    }
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (data?.id) {
      localStorage.setItem(`announcement_${data.id}`, Date.now().toString());
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="announcement-overlay">
      <div className="announcement-card">
        <div className="announcement-header">
          <div className="title-group">
            <div className="icon-circle">
              <FaBell className="bell-icon" />
            </div>
            <h3>{data.title || "Thông báo hệ thống"}</h3>
          </div>
          <button className="close-x" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="announcement-body">
          <div 
            className="html-content"
            dangerouslySetInnerHTML={{ __html: data.content }} 
          />
        </div>

        <div className="announcement-footer">
          <button className="btn-confirm" onClick={handleClose}>
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;