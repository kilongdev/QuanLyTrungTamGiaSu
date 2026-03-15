/**
 * API cho quản lý gia sư
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/QuanLyTrungTamGiaSu/backend/public';

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
 * Gia sư API
 */
export const giaSuAPI = {
    /**
     * Lấy danh sách tất cả gia sư
     * @param {Object} params - Tham số phân trang và tìm kiếm
     */
    getAll: ({ page = 1, limit = 10, search = '' } = {}) => {
        const query = new URLSearchParams({ page, limit, search }).toString();
        return request(`/giasu?${query}`);
    },

    /**
     * Lấy chi tiết gia sư theo ID
     * @param {number} id - ID gia sư
     */
    getById: (id) => 
        request(`/giasu/${id}`, {
            method: 'GET',
        }),

    /**
     * Tạo gia sư mới
     * @param {Object} data - Dữ liệu gia sư
     */
    create: (data) => 
        request('/giasu/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Cập nhật gia sư
     * @param {number} id - ID gia sư
     * @param {Object} data - Dữ liệu cần cập nhật
     */
    update: (id, data) => 
        request(`/giasu/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    /**
     * Xóa gia sư
     * @param {number} id - ID gia sư
     */
    delete: (id) => 
        request(`/giasu/delete/${id}`, {
            method: 'DELETE',
        }),
};
