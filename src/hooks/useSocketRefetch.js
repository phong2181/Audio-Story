import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from '../hooks/useSocket';

/**
 * Hook to invalidate React Query cache when WebSocket event fires
 * @param {string} eventName - WebSocket event name
 * @param {array} queryKeys - React Query keys to invalidate
 */
export const useSocketRefetch = (eventName, queryKeys = []) => {
    const queryClient = useQueryClient();

    useSocketEvent(eventName, () => {
        console.log(`📡 Event received: ${eventName}, invalidating queries:`, queryKeys);
        
        // Invalidate all specified queries
        queryKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
        });
    }, [queryClient, queryKeys]);
};

/**
 * Example event names for consistency:
 * - 'story:created' - khi admin thêm truyện mới
 * - 'story:updated' - khi admin sửa truyện
 * - 'story:deleted' - khi admin xóa truyện
 * - 'chapter:created' - khi thêm chương mới
 * - 'post:created' - khi thêm bài viết mới
 */
