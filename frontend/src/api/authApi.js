/**
 * Xử lý đăng nhập, đăng ký, JWT cho Admin, Gia Sư, Phụ Huynh
 */

const API_URL = 'http://localhost/QuanLyTrungTamGiaSu/backend/public';

/**
 * Gửi request đến API
 */
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw { status: response.status, ...data };
        }
        
        return data;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 0, message: 'Không thể kết nối đến server' };
    }
}

/**
 * Auth API
 */
export const authAPI = {
    /**
     * Đăng nhập bằng email hoặc số điện thoại
     * @param {Object} credentials - { email, password } hoặc { phone, password }
     */
    login: (credentials) => 
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
    
    /**
     * Đăng ký Phụ huynh hoặc Gia sư
     * @param {Object} data - { name, email, phone, password, role, student? }
     */
    register: (data) => 
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    
    /**
     * Lấy thông tin user hiện tại
     */
    getMe: () => request('/auth/me'),
    
    /**
     * Refresh token
     */
    refreshToken: () => 
        request('/auth/refresh', { method: 'POST' }),
    
    /**
     * Đăng xuất
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return request('/auth/logout', { method: 'POST' });
    },
    
    /**
     * Lưu token và user vào localStorage
     */
    saveAuth: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    /**
     * Lấy user từ localStorage
     */
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isLoggedIn: () => !!localStorage.getItem('token'),
    
    /**
     * Lấy token
     */
    getToken: () => localStorage.getItem('token'),
};

/**
 * OTP API - Gửi và xác minh OTP qua Email
 */
export const otpAPI = {
    /**
     * Gửi OTP qua Email
     * @param {string} email 
     * @param {string} phone 
     * @param {string} type - 'register' | 'login' | 'reset_password'
     */
    send: (email, phone, type = 'register') =>
        request('/otp/send', {
            method: 'POST',
            body: JSON.stringify({ email, phone, type }),
        }),

    /**
     * Xác minh OTP
     * @param {string} phone 
     * @param {string} otp 
     * @param {string} type 
     */
    verify: (phone, otp, type = 'register') =>
        request('/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone, otp, type }),
        }),
};

export default { auth: authAPI, otp: otpAPI };
