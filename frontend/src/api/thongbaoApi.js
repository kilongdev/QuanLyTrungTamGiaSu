/**
 * API cho quản lý Thông báo
 */

const API_URL = "http://localhost:8080/QuanLyTrungTamGiaSu/backend/public";

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
 * Thông báo API
 */
export const thongBaoAPI = {
    /**
     * Lấy danh sách thông báo của user
     * @param {number} userId - ID người dùng
     * @param {string} userType - Loại user (admin, gia_su, phu_huynh)
     */
    getMyNotifications: () => {
        // API này đã được định nghĩa trong PhuHuynhController và lấy ID từ token
        return request(`/phuhuynh/notifications`);
    },

    /**
     * Gửi thông báo mới
     * @param {Object} data - { nguoi_nhan_id, loai_nguoi_nhan, tieu_de, noi_dung }
     */
    send: (data) =>
        request('/thongbao/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Đánh dấu thông báo đã đọc
     * @param {number} id - ID thông báo
     */
    markAsRead: (id) =>
        request(`/thongbao/read/${id}`, {
            method: 'PUT',
        }),

    /**
     * Đánh dấu tất cả đã đọc
     * @param {number} userId - ID người dùng
     * @param {string} userType - Loại user
     */
    markAllAsRead: (userId, userType) =>
        request('/thongbao/read-all', {
            method: 'PUT',
            body: JSON.stringify({ user_id: userId, user_type: userType }),
        }),
};
