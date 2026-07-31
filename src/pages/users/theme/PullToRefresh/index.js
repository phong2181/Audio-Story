import React, { useRef, useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import './style.scss';

const PullToRefresh = ({ children }) => {
    const pullableRef = useRef(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const REFRESH_THRESHOLD = 80; // pixels to trigger refresh

    // Only enable on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const handleTouchStart = (e) => {
        if (!isMobile || isRefreshing) return;
        
        // Only start pull if we're at the top
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (!isMobile || isRefreshing || startY === 0) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop !== 0) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY);

        if (distance > 0) {
            // Resistance effect: distance gets smaller as you pull more
            const resistance = 0.7;
            const resistedDistance = distance * resistance;
            setPullDistance(resistedDistance);
        }
    };

    const handleTouchEnd = () => {
        if (!isMobile || isRefreshing) return;

        if (pullDistance >= REFRESH_THRESHOLD) {
            setIsRefreshing(true);
            // Trigger reload after 1.2s
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } else {
            setPullDistance(0);
        }
        setStartY(0);
    };

    useEffect(() => {
        if (!isMobile) return;

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startY, pullDistance, isRefreshing]);

    const pullPercentage = Math.min(100, (pullDistance / REFRESH_THRESHOLD) * 100);
    const isReady = pullDistance >= REFRESH_THRESHOLD;

    return (
        <>
            {isMobile && (
                <div
                    className={`pull-to-refresh-indicator ${isReady ? 'ready' : ''} ${isRefreshing ? 'refreshing' : ''}`}
                    style={{
                        opacity: pullDistance > 0 ? 1 : 0,
                        transform: `translateY(${Math.min(pullDistance, 60)}px)`,
                        height: `${Math.max(20, pullDistance / 2)}px`,
                    }}
                >
                    <div className="pull-spinner">
                        <FaRedo
                            style={{
                                transform: `rotate(${isRefreshing ? 360 : pullPercentage * 3.6}deg)`,
                                transition: isRefreshing ? 'none' : 'transform 0.1s linear',
                            }}
                        />
                    </div>
                    <span className="pull-text">
                        {isRefreshing ? 'Đang tải...' : isReady ? 'Thả để làm mới' : 'Kéo để làm mới'}
                    </span>
                </div>
            )}
            <div ref={pullableRef}>
                {children}
            </div>
        </>
    );
};

export default PullToRefresh;
