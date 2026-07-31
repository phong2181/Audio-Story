/**
 * Ví dụ sử dụng WebSocket trong home page hoặc story list
 * 
 * CÁCH DÙNG:
 * 
 * import { useSocketRefetch } from 'hooks/useSocketRefetch';
 * 
 * const HomePage = () => {
 *     // Khi admin thêm truyện mới, query này sẽ tự động refetch
 *     const { data: stories } = useGetStoriesAPI();
 *     
 *     // Lắng nghe event 'story:created' và invalidate cache
 *     useSocketRefetch('story:created', [['GetStoriesAPI']]);
 *     
 *     // Có thể lắng nghe nhiều event cùng lúc
 *     useSocketRefetch('story:updated', [['GetStoriesAPI']]);
 *     useSocketRefetch('story:deleted', [['GetStoriesAPI']]);
 *     
 *     return (
 *         <div>
 *             {stories?.map(story => (
 *                 <div key={story.id}>{story.title}</div>
 *             ))}
 *         </div>
 *     );
 * };
 */

/**
 * BACKEND - Emit event khi admin thêm truyện
 * 
 * Controller: src/controllers/StoryController.js (Backend)
 * 
 * exports.addStory = async (req, res, io) => {
 *     try {
 *         const newStory = await Story.create(req.body);
 *         
 *         // Emit event to all connected clients
 *         io.emit('story:created', {
 *             id: newStory.id,
 *             title: newStory.title,
 *             image: newStory.image,
 *             timestamp: new Date()
 *         });
 *         
 *         res.json({ success: true, data: newStory });
 *     } catch (error) {
 *         res.status(500).json({ error: error.message });
 *     }
 * };
 */

/**
 * EVENT NAMES TO USE:
 * 
 * - 'story:created'  -> Admin add new story
 * - 'story:updated'  -> Admin update story
 * - 'story:deleted'  -> Admin delete story
 * - 'chapter:created' -> Admin add new chapter
 * - 'chapter:updated' -> Admin update chapter
 * - 'post:created'   -> Admin add new post
 * - 'post:updated'   -> Admin update post
 * - 'post:deleted'   -> Admin delete post
 */

export const SOCKET_EVENTS = {
    STORY_CREATED: 'story:created',
    STORY_UPDATED: 'story:updated',
    STORY_DELETED: 'story:deleted',
    CHAPTER_CREATED: 'chapter:created',
    CHAPTER_UPDATED: 'chapter:updated',
    POST_CREATED: 'post:created',
    POST_UPDATED: 'post:updated',
    POST_DELETED: 'post:deleted',
};
