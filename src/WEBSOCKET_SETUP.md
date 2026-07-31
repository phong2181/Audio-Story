# WebSocket Setup Guide

## Installation

Cần install socket.io-client:

```bash
npm install socket.io-client
```

## Backend Setup (Server)

Trong server Node.js, cần setup Socket.io:

```bash
npm install socket.io
```

### Express + Socket.io Example:

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});

module.exports = { io };
```

## Client Usage

### 1. Wrap app dengan SocketProvider (index.js)
```javascript
import { SocketProvider } from 'context/SocketContext';

root.render(
  <SocketProvider serverUrl="http://localhost:3001">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </QueryClientProvider>
  </SocketProvider>
);
```

### 2. Use WebSocket refetch in components
```javascript
import { useSocketRefetch } from 'hooks/useSocketRefetch';
import { SOCKET_EVENTS } from 'constants/socketEvents';

const HomePage = () => {
    const { data: stories } = useGetStoriesAPI();
    
    // Auto refetch when admin creates new story
    useSocketRefetch(SOCKET_EVENTS.STORY_CREATED, [['GetStoriesAPI']]);
    
    return (
        <div>
            {stories?.map(story => (
                <div key={story.id}>{story.title}</div>
            ))}
        </div>
    );
};
```

### 3. Manual event listening
```javascript
import { useSocketEvent } from 'hooks/useSocket';

const MyComponent = () => {
    useSocketEvent('story:created', (data) => {
        console.log('New story added:', data);
        // Do something when story is created
    });
    
    return <div>Listening for new stories...</div>;
};
```

## Backend - Emit Events

### When Admin Creates Story:
```javascript
// Controller function
exports.addStory = async (req, res) => {
    try {
        const newStory = await Story.create(req.body);
        
        // Emit to all connected clients
        io.emit('story:created', {
            id: newStory.id,
            title: newStory.title,
            image: newStory.image
        });
        
        res.json({ success: true, data: newStory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### When Admin Updates Story:
```javascript
io.emit('story:updated', {
    id: storyId,
    ...updatedData
});
```

### When Admin Deletes Story:
```javascript
io.emit('story:deleted', { id: storyId });
```

## Available Events

```javascript
const SOCKET_EVENTS = {
    STORY_CREATED: 'story:created',
    STORY_UPDATED: 'story:updated',
    STORY_DELETED: 'story:deleted',
    CHAPTER_CREATED: 'chapter:created',
    CHAPTER_UPDATED: 'chapter:updated',
    POST_CREATED: 'post:created',
    POST_UPDATED: 'post:updated',
    POST_DELETED: 'post:deleted',
};
```

## Environment Variables

Add to `.env`:
```
REACT_APP_API_URL=http://localhost:3001
```

## Testing

1. Open browser DevTools → Console
2. Admin thêm truyện mới ở admin panel
3. Trang user sẽ tự động update mà không cần reload
4. Check console để xem WebSocket events
