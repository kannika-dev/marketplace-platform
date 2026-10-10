import axios from 'axios';

// ดึง VITE_API_URL มาใช้ ถ้านึกไม่ออกให้กลับไปใช้ localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marketplace-platform-xh1q.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to auto-inject token and handle FormData Content-Type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('craft_token') || localStorage.getItem('token');
    if (token) {
      if (typeof config.headers?.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // หากส่งข้อมูลเป็น FormData ให้ลบ Content-Type ออก เพื่อให้ Axios และเบราว์เซอร์
    // ตั้งค่า multipart/form-data พร้อม boundary ที่ถูกต้องโดยอัตโนมัติ
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clean up token if unauthorized
      localStorage.removeItem('craft_token');
    }
    return Promise.reject(error);
  }
);

export default api;