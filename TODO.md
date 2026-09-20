# TODO: Sửa lỗi model TTS tiếng Việt (ghép từ, phát âm không tự nhiên)

## ✅ Đã hoàn thành
- [x] Sửa `espeak.voice` từ "en" → "vi" cho 3 model (mattheo1, mattheo, john)
- [x] Sửa code `vietnameseTextToApproxPhonemes()` trong `src/lib/piper-tts.js`:
  - Thay `VIET_IPA_MAP` bằng `VIET_IPA_BASE` (giữ nguyên âm + tách dấu thanh)
  - Thêm `applyConsonantClusters()` để map cụm phụ âm (th→θ, ng→ŋ, nh→ɲ, ch→ʃ, tr→ʈ, x→ʂ, c→k, q→k, y→i, gi→ji, qu→kw...)
  - **Đặt dấu thanh ở CUỐI ÂM TIẾT** (sau phụ âm cuối) theo đúng espeak-ng:
    `mạnh` → `maɲ̣`, `bạn` → `baṇ`, `đường` → `ɗɯɤŋ̀`, `cảm` → `kam̉`, `các` → `kaḱ`
  - Xử lý theo từng từ (word-by-word) để giữ dấu cách (khoảng trắng ID 3) giữa các từ
  - Sửa regex dấu ngoặc kép `[""]` → `[“”]`
- [x] Sửa `cleanTextForTTS()` trong `src/utils/text-cleaner.js`:
  - Thêm U+0300, U+0301, U+0303, U+0309, U+0323 vào regex giữ lại (đủ 5 dấu thanh)
- [x] Thêm dấu huyền (U+0300, ID 161), dấu sắc (U+0301, ID 162), dấu hỏi (U+0309, ID 163), dấu nặng (U+0323, ID 164) vào `phoneme_id_map` cho **TẤT CẢ 29 model config** trong `public/tts-model/vi/` (chạy `add-tone-ids.mjs`)
- [x] Sửa `PiperTTS` constructor + `from_pretrained()` để nhận `lang` parameter
- [x] Sửa `textToPhonemes()` dùng `this.lang` làm fallback khi `espeak.voice` sai
- [x] Sửa `tts-worker.js` và `tts-worker-i18n.js` truyền `lang` vào `from_pretrained()`

## ✅ Cải tiến phát âm nâng cao
- [x] Thêm `applyVowelDigraphs()` xử lý nguyên âm đôi/ba theo espeak-ng:
  - `iê → iə`, `uô → uə`, `ươ → ɯə`, `ươi → ɯəi`, `uê → uə`
  - `uyê → ujə`, `uya → uja`, `oa → wa`, `oe → wɛ`
- [x] Sửa cụm phụ âm chính xác hơn:
  - `b → ɓ`, `d → z`, `g → ɣ`, `s → ʂ`, `x → s` (sửa từ x→ʂ)
  - `ngh → ŋ` (h câm trong "nghiện" → /ŋiən/)
- [x] **Sửa lỗi "ngọng"** (theo espeak-ng chuẩn):
  - `th → tʰ` (t bật hơi) — SỬA từ sai `th → θ` (âm "th" tiếng Anh gây ngọng)
  - `ch → tʃ` (tắc-xát) — SỬA từ `ch → ʃ` (thiếu âm /t/)
  - `tr → ʈʂ` (tắc-xát) — SỬA từ `tr → ʈ` (thiếu âm /ʂ/)
  - `r → ʐ` (r vòm) — SỬA từ `r → z` (trùng "gi" gây ngọng)
- [x] Hỗ trợ **phương ngữ Bắc/Nam**:
  - `applyConsonantClusters(str, dialect)` nhận dialect
  - Nam (`vi-vn-x-south`): `gi→j`, `d→j`, `r→r`, `v→j`
  - Bắc (mặc định): `gi→z`, `d→z`, `r→ʐ`, `v→v`
  - `textToPhonemes()` tự nhận diện từ `espeak.voice` (`vi-vn-x-south` → south)
- [x] Xác nhận mọi IPA symbol dùng trong code (ɓ, ʐ, ɣ, j, w, ə, ɜ, ...) đều có trong `phoneme_id_map` của cả 29 model

## ✅ Kiểm thử
- [x] `test-pronunciation.mjs` — PASSED: dấu thanh cuối âm tiết, từ tách bằng ID 3, nguyên âm đôi, ngh→ŋ
- [x] Xác nhận 29/29 config JSON hợp lệ, đủ 5 dấu thanh (141, 161, 162, 163, 164)
- [x] Xác nhận IPA symbols (j, ʐ, v, z) có trong cả 6 model kiểm tra (kể cả 3 model Nam Bộ)

## ⚠️ Cần restart dev server
- Tắt npm start (Ctrl+C)
- Xoá cache IndexedDB trong trình duyệt (Application → IndexedDB → piper-tts-cache → Delete)
- Hard reload: Ctrl + Shift + R

## 📁 Scripts tạm (đã xoá)
- `add-tone-ids.mjs`, `apply-fix.mjs`, `check-configs.mjs`, `test-word-merge.mjs`, `test-pronunciation.mjs` — đã xoá sau khi hoàn thành

