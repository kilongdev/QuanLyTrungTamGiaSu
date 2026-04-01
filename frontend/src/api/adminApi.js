/**
 * Admin Profile API
 * Quản lý thông tin cá nhân admin
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com';

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
        
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('JSON Parse Error:', parseErr, 'Response:', responseText);
            throw { 
                status: 500, 
                message: 'Lỗi: Server trả về dữ liệu không hợp lệ',
                raw: responseText 
            };
        }
        
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
 * Admin API
 */
export const adminAPI = {
    /**
     * Lấy thông tin profile của admin hiện tại
     */
    getProfile: () => 
        request('/profile', {
            method: 'GET'
        }),

    /**
     * Cập nhật thông tin cá nhân admin
     * @param {Object} profileData - { name, email, phone }
     */
    updateProfile: (profileData) => 
        request('/profile/update', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        }),

    /**
     * Thay đổi mật khẩu
     * @param {Object} passwordData - { oldPassword, newPassword }
     */
    changePassword: (passwordData) => 
        request('/profile/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        })
};

export default adminAPI;
