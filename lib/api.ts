import axios from "axios";

// Membuat instance axios global yang bisa di-reuse di seluruh aplikasi
const api = axios.create({
  // Menggunakan environment variable jika ada, jika tidak gunakan default localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor (Opsional tapi sangat berguna): 
// Otomatis menyisipkan Token JWT ke setiap request ke Backend jika user sudah login
api.interceptors.request.use(
  (config) => {
    // Pastikan berjalan di sisi client (browser) sebelum mengakses localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;