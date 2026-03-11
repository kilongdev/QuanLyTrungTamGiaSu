/**
 * API cho quản lý môn học
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
 * Môn học API
 */
export const monHocAPI = {
    /**
     * Lấy danh sách tất cả môn học
     */
    getAll: () => 
        request('/monhoc', {
            method: 'GET',
        }),

    /**
     * Lấy chi tiết môn học theo ID
     * @param {number} id - ID môn học
     */
    getById: (id) => 
        request(`/monhoc/${id}`, {
            method: 'GET',
        }),

    /**
     * Tạo môn học mới
     * @param {Object} data - Dữ liệu môn học
     */
    create: (data) => 
        request('/monhoc/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Cập nhật môn học
     * @param {number} id - ID môn học
     * @param {Object} data - Dữ liệu cần cập nhật
     */
    update: (id, data) => 
        request(`/monhoc/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    /**
     * Xóa môn học
     * @param {number} id - ID môn học
     */
    delete: (id) => 
        request(`/monhoc/delete/${id}`, {
            method: 'DELETE',
        }),
};
