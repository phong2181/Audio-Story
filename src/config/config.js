// src/config.js
export const STORAGE_URL =
  process.env.REACT_APP_STORAGE_URL || "http://bloger.test/storage/";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://bloger.test/api/";
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://bloger.test";
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 20000;

/**
 * Trả về URL đầy đủ của ảnh từ storage.
 * Nếu url đã là full URL (bắt đầu bằng http), trả về nguyên vẹn.
 * Nếu url là path tương đối, nối với STORAGE_URL.
 */
export const getStorageUrl = (url, fallback = "") => {
  if (!url) return fallback;
  if (typeof url === "string") {
    // Nếu chuỗi bị lặp tiền tố do lỗi nối chuỗi trước đó (vd: http://.../storage/http://...)
    const lastHttpIndex = url.lastIndexOf("http://");
    const lastHttpsIndex = url.lastIndexOf("https://");
    const lastIndex = Math.max(lastHttpIndex, lastHttpsIndex);
    if (lastIndex > 0) {
      url = url.substring(lastIndex);
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = STORAGE_URL.replace(/\/$/, "");
  const path = url.replace(/^\//, "");
  return `${base}/${path}`;
};


// Cloudflare Pages rebuild trigger
