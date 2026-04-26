/** أصل السيرفر بدون /api — يُستخدم لـ SignalR والملفات الثابتة */
export const API_ORIGIN =
  process.env.VUE_APP_API_ORIGIN || "http://localhost:5205";
