// src/config.js
export const STORAGE_URL = process.env.VITE_STORAGE_URL || "http://bloger.test/storage/";
export const API_URI = process.env.VITE_API_URI || "http://bloger.test/api/";
export const API_TIMEOUT = parseInt(process.env.VITE_API_TIMEOUT, 20) || 20000;