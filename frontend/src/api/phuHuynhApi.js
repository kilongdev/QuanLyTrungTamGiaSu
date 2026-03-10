/**
 * API cho quản lý Phụ Huynh
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/QuanLyTrungTamGiaSu/backend/public';

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
 * Phụ Huynh API
 */
export const phuHuynhAPI = {
    getAll: ({ page = 1, limit = 10, search = '' }) => {
        const query = new URLSearchParams({ page, limit, search }).toString();
        return request(`/phuhuynh?${query}`);
    },
};