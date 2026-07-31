# TODO: Tích hợp Edge TTS + Web Speech API

## ✅ Hoàn thành
- [x] Phân tích codebase
- [x] Lên kế hoạch kiến trúc

## 📋 Các bước thực hiện

### Bước 1: Tạo Cloudflare Worker proxy cho Edge TTS
- [x] `function/api/edge-tts.ts` — Worker nhận request, gọi Edge TTS API, trả về audio MP3

### Bước 2: Tạo client-side service cho Edge TTS
- [x] `src/lib/edge-tts.js` — Service gọi worker, xử lý audio blob

### Bước 3: Tạo Web Speech API service cho preview
- [x] `src/lib/web-speech-tts.js` — Service dùng browser speech synthesis để preview nhanh

### Bước 4: Cập nhật config
- [x] `src/config.js` — Thêm EDGE_VOICES, TTS_ENGINES, TTS_MODE_STORAGE_KEY

### 🔧 GỠ BỎ: User yêu cầu xóa hoàn toàn Edge TTS
- [x] Xóa `function/api/edge-tts.ts` (Cloudflare Worker proxy)
- [x] Xóa `src/lib/edge-tts.js` (client service)
- [x] Xóa `src/lib/web-speech-tts.js` (Web Speech API service - không dùng nữa)
- [x] Revert `src/config.js` — xóa EDGE_VOICES, TTS_ENGINES, TTS_MODE_STORAGE_KEY
- [x] Revert `src/pages/admin/Audio/Addfileread/index.js` — khôi phục bản gốc chỉ có Piper TTS
- [x] Revert `src/pages/admin/Audio/Addfileread/style.scss` — khôi phục bản gốc

### ✅ KẾT QUẢ CUỐI CÙNG
- [x] Dự án đã trở về trạng thái ban đầu, chỉ dùng **Piper TTS** (chạy local, WASM, 20+ giọng Việt)

