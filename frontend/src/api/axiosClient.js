// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request: Gắn token vào header
axiosClient.interceptors.request.use(async (config) => {
    // Luôn lấy token mới nhất từ localStorage trước khi gọi API
    const token = localStorage.getItem('token');
    
    if (token) {
        // Đảm bảo token format: "Bearer <token>"
        config.headers.Authorization = `Bearer ${token}`; 
        
        // Debugging: Kiểm tra token trước khi gửi
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
            Authorization: `Bearer ${token.substring(0, 10)}...` // Log 1 phần token
        });
    } else {
        console.warn("[API Request] No token found in localStorage");
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor cho Response: Xử lý lỗi (ví dụ: 401 Unauthorized)
axiosClient.interceptors.response.use((response) => {
    // Trả về data trực tiếp để code gọn hơn (response.data)
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => {
    // Handle errors
    if (error.response) {
        // Lỗi từ server trả về (status code nằm ngoài dải 2xx)
        console.error('[API Error]', error.response.status, error.response.data);

        // 401 Unauthorized: Token hết hạn hoặc không hợp lệ
        if (error.response.status === 401) {
            console.warn("Token expired or invalid. Redirecting to Login...");
            
            // Xóa token cũ
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Chuyển hướng về trang login
            // Lưu ý: window.location.href sẽ reload trang, dùng navigate của React Router nếu có thể
            // Nhưng ở đây axios là file js thường nên dùng window.location là giải pháp đơn giản nhất
            if (window.location.pathname !== '/login') {
                 window.location.href = '/login';
            }
        }
    } else if (error.request) {
        // Không nhận được phản hồi từ server
        console.error('[API Error] No response received', error.request);
    } else {
        // Lỗi khi setup request
        console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
});

export default axiosClient;