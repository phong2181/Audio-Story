/**
 * TTS Configuration for Bloger (React app)
 * Provides model URL resolution for Piper TTS models.
 */

/**
 * Get base URL for TTS model files.
 * In production, serves from API. In development, serves from /public/tts-model/.
 * @param {string} lang - Language code (e.g. 'vi', 'en', 'id')
 * @returns {string} Base URL ending with '/'
 */
export function getModelBaseUrl(lang = 'vi') {
  // React CRA uses PUBLIC_URL, not import.meta.env
  const publicUrl = process.env.PUBLIC_URL || '';
  return `${publicUrl}/tts-model/${lang}/`;
}

/**
 * Get API URL to list available models for a language.
 * @param {string} lang - Language code
 * @returns {string}
 */
export function getModelsListUrl(lang = 'vi') {
  return `/api/piper/${lang}/models`;
}

/** Default model name per language when API is unavailable. */
export const DEFAULT_MODEL = {
  vi: 'ngochuyen',
  en: 'en_US-libritts_r-medium',
};

/** localStorage key for saving the user-selected TTS voice. */
export const TTS_VOICE_STORAGE_KEY = 'tts-selected-voice';

/** localStorage key for saving the user-selected TTS speed. */
export const TTS_SPEED_STORAGE_KEY = 'tts-selected-speed';

/**
 * Full list of available Vietnamese TTS voices with metadata.
 * Mirrors the ONNX files in /public/tts-model/vi/.
 */
export const VI_VOICES = [
  { id: 'ngochuyen',       name: 'Ngọc Huyền',       gender: 'Nữ',  region: 'Miền Bắc', desc: 'Giọng đọc truyền cảm, phù hợp đọc truyện tự sự.' },
  { id: 'ngochuyennew',    name: 'Ngọc Huyền (Mới)',  gender: 'Nữ',  region: 'Miền Bắc', desc: 'Phiên bản cải tiến của Ngọc Huyền.' },
  { id: 'banmai',          name: 'Ban Mai',            gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng đọc ấm áp, trong trẻo.' },
  { id: 'maiphuong',       name: 'Mai Phương',         gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng ngọt ngào, diễn cảm tốt.' },
  { id: 'lacphi',          name: 'Lạc Phi',            gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng đọc lôi cuốn, trầm bổng.' },
  { id: 'thanhphuong2',    name: 'Thanh Phương',       gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng đọc thanh thoát, dịu dàng.' },
  { id: 'mytam2',          name: 'Mỹ Tâm 2',           gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng nữ miền Nam cuốn hút.' },
  { id: 'mytam2794',       name: 'Mỹ Tâm 2794',        gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng nữ biểu cảm cao.' },
  { id: 'calmwoman3688',   name: 'Calm Woman',         gender: 'Nữ',  region: 'Trung lập', desc: 'Giọng nữ bình thản, rõ ràng.' },
  { id: 'phuongtrang',     name: 'Phương Trang',       gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng đọc nhẹ nhàng, trong sáng.' },
  { id: 'thientam',        name: 'Thiên Tâm',          gender: 'Nữ',  region: 'Miền Bắc', desc: 'Giọng nữ trầm ấm, rõ ràng.' },
  { id: 'minhthu',         name: 'Minh Thu',           gender: 'Nữ',  region: 'Miền Bắc', desc: 'Giọng đọc chuyên nghiệp, mạch lạc.' },
  { id: 'chieuthanh',      name: 'Chiều Thanh',        gender: 'Nữ',  region: 'Miền Trung', desc: 'Giọng miền Trung nhẹ nhàng.' },
  { id: 'ngocngan3701',    name: 'Ngọc Ngân',          gender: 'Nữ',  region: 'Miền Nam', desc: 'Giọng nữ thanh cao, thu hút.' },
  { id: 'manhdung',        name: 'Mạnh Dũng',          gender: 'Nam', region: 'Miền Bắc', desc: 'Giọng nam trầm, đĩnh đạc.' },
  { id: 'vietthao3886',    name: 'Việt Thảo',          gender: 'Nam', region: 'Miền Nam', desc: 'Giọng Nam Bộ dí dỏm, hào sảng.' },
  { id: 'tranthanh3870',   name: 'Trấn Thành',         gender: 'Nam', region: 'Miền Nam', desc: 'Giọng đọc biểu cảm sinh động.' },
  { id: 'yannew',          name: 'Yan (Mới)',           gender: 'Nam', region: 'Miền Bắc', desc: 'Giọng nam trẻ trung, hiện đại.' },
  { id: 'adam1',           name: 'Adam',               gender: 'Nam', region: 'Miền Bắc', desc: 'Giọng nam khỏe khoắn, tự tin.' },
  { id: 'deepman3909',     name: 'Deep Man',           gender: 'Nam', region: 'Trung lập', desc: 'Giọng nam trầm sâu, uy lực.' },
  { id: 'minhkhang',       name: 'Minh Khang',         gender: 'Nam', region: 'Miền Bắc', desc: 'Giọng nam rõ ràng, chuyên nghiệp.' },
  { id: 'minhquang',       name: 'Minh Quang',         gender: 'Nam', region: 'Miền Bắc', desc: 'Giọng nam mạch lạc, thuyết phục.' },
  { id: 'mattheo',         name: 'Mattheo',            gender: 'Nam', region: 'Miền Nam', desc: 'Giọng nam trẻ, năng động.' },
  { id: 'mattheo1',        name: 'Mattheo 1',          gender: 'Nam', region: 'Miền Nam', desc: 'Phiên bản cải tiến của Mattheo.' },
  { id: 'taian2',          name: 'Tài An 2',           gender: 'Nam', region: 'Miền Nam', desc: 'Giọng nam ấm áp, thân thiện.' },
  { id: 'taian4',          name: 'Tài An 4',           gender: 'Nam', region: 'Miền Nam', desc: 'Phiên bản mới của Tài An.' },
  { id: 'duyoryx3175',     name: 'Duy Ory',            gender: 'Nam', region: 'Miền Nam', desc: 'Giọng nam sôi động, trẻ trung.' },
  { id: 'trumpviet',       name: 'Trump Việt',         gender: 'Nam', region: 'Trung lập', desc: 'Giọng đặc sắc, mạnh mẽ.' },
];
