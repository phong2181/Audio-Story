# Laravel WebSocket Setup Guide (Reverb)

## Installation

### 1. Install Laravel Reverb

```bash
composer require laravel/reverb
php artisan reverb:install
```

### 2. Configure `.env`

```env
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

# For React client
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 3. Start Reverb Server

```bash
php artisan reverb:start
# Or with queue
php artisan reverb:start --host=0.0.0.0 --port=8080
```

---

## Backend Setup (Laravel)

### 1. Create Broadcasting Event

```bash
php artisan make:event StoryCreated
```

#### `app/Events/StoryCreated.php`

```php
<?php

namespace App\Events;

use App\Models\Story;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StoryCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $story;

    public function __construct(Story $story)
    {
        $this->story = $story;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('stories'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'story.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->story->id,
            'title' => $this->story->title,
            'image' => $this->story->image,
            'author_id' => $this->story->author_id,
            'created_at' => $this->story->created_at,
        ];
    }
}
```

### 2. Create More Events

```bash
php artisan make:event StoryUpdated
php artisan make:event StoryDeleted
php artisan make:event ChapterCreated
php artisan make:event PostCreated
```

### 3. In Controller - Dispatch Events

#### `app/Http/Controllers/StoryController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Events\StoryCreated;
use App\Events\StoryUpdated;
use App\Events\StoryDeleted;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    // Create new story
    public function store(Request $request)
    {
        $story = Story::create($request->validated());
        
        // Broadcast to all connected clients
        broadcast(new StoryCreated($story));
        
        return response()->json([
            'success' => true,
            'data' => $story
        ]);
    }

    // Update story
    public function update(Request $request, Story $story)
    {
        $story->update($request->validated());
        
        // Broadcast update
        broadcast(new StoryUpdated($story));
        
        return response()->json([
            'success' => true,
            'data' => $story
        ]);
    }

    // Delete story
    public function destroy(Story $story)
    {
        $id = $story->id;
        $story->delete();
        
        // Broadcast delete
        broadcast(new StoryDeleted($id));
        
        return response()->json([
            'success' => true,
            'message' => 'Story deleted'
        ]);
    }
}
```

---

## Client Setup (React)

### 1. Install Laravel Echo

```bash
npm install laravel-echo
```

### 2. Setup Echo in `src/index.js`

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup Laravel Echo
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: 443,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### 3. Use in React Component

```javascript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const HomePage = () => {
    const queryClient = useQueryClient();
    const { data: stories } = useGetStoriesAPI();

    useEffect(() => {
        // Listen for story created event
        window.Echo.channel('stories').listen('story.created', (e) => {
            console.log('New story created:', e);
            // Invalidate cache to refetch
            queryClient.invalidateQueries({ queryKey: ['GetStoriesAPI'] });
        });

        // Listen for story updated
        window.Echo.channel('stories').listen('story.updated', (e) => {
            console.log('Story updated:', e);
            queryClient.invalidateQueries({ queryKey: ['GetStoriesAPI'] });
        });

        // Listen for story deleted
        window.Echo.channel('stories').listen('story.deleted', (e) => {
            console.log('Story deleted:', e);
            queryClient.invalidateQueries({ queryKey: ['GetStoriesAPI'] });
        });

        return () => {
            window.Echo.channel('stories').stopListening('story.created');
            window.Echo.channel('stories').stopListening('story.updated');
            window.Echo.channel('stories').stopListening('story.deleted');
        };
    }, [queryClient]);

    return (
        <div>
            {stories?.map(story => (
                <div key={story.id}>{story.title}</div>
            ))}
        </div>
    );
};

export default HomePage;
```

---

## Event List

### Create corresponding events:

```bash
php artisan make:event StoryCreated
php artisan make:event StoryUpdated
php artisan make:event StoryDeleted
php artisan make:event ChapterCreated
php artisan make:event ChapterUpdated
php artisan make:event PostCreated
php artisan make:event PostUpdated
php artisan make:event PostDeleted
```

---

## Testing

### 1. Start services
```bash
# Terminal 1: Laravel Reverb
php artisan reverb:start

# Terminal 2: React dev server
npm run dev

# Terminal 3: Laravel backend (if needed)
php artisan serve
```

### 2. Test flow
1. Open React app in browser
2. Admin thêm truyện mới ở admin panel
3. Trang user sẽ tự động update mà không cần reload
4. Check browser console để xem WebSocket events

---

## Performance Tips

### 1. Use presence channels (nếu cần track users online)

```php
// Event
public function broadcastOn(): array
{
    return [
        new PresenceChannel('stories'),
    ];
}
```

### 2. Use private channels (cho dữ liệu nhạy cảm)

```php
public function broadcastOn(): array
{
    return [
        new PrivateChannel('stories.'.$this->story->id),
    ];
}
```

### 3. Throttle events (nếu có quá nhiều updates)

```php
public function broadcastWith(): array
{
    // Only send important fields
    return [
        'id' => $this->story->id,
        'title' => $this->story->title,
        // Không gửi toàn bộ story data
    ];
}
```

---

## Troubleshooting

### Connection refused
- Kiểm tra Reverb server có chạy: `php artisan reverb:start`
- Kiểm tra port 8080 không bị block

### Events không được phát
- Kiểm tra `BROADCAST_DRIVER=reverb` trong `.env`
- Kiểm tra event class implement `ShouldBroadcast`

### Client không nhận event
- Kiểm tra Echo config có đúng không
- Kiểm tra CORS settings
- Open DevTools → Network → WS tab để xem connection

---

## Docs

- [Laravel Broadcasting](https://laravel.com/docs/broadcasting)
- [Laravel Reverb](https://laravel.com/docs/reverb)
- [Laravel Echo](https://laravel.com/docs/echo)
