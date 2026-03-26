const API_URL = 'http://localhost/QuanLyTrungTamGiaSu/backend/public';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
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

export const diemDanhAPI = {
    getByLich: (lichHocId) => request(`/diemdanh/lich/${lichHocId}`, {
        method: 'GET',
    }),

    /**
     * Lấy danh sách điểm danh theo ID lớp học
     * @param {number} lopHocId - ID lớp học
     */
    getByClass: (lopHocId) => request(`/diemdanh/lophoc/${lopHocId}`, {
        method: 'GET',
    }),

    saveDanhSach: (data) => request('/diemdanh/save', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /**
     * Save attendance for today - auto creates schedule if needed
     * @param {number} lop_hoc_id - Class ID
     * @param {array} danh_sach - Array of {hoc_sinh_id, tinh_trang}
     */
    saveAttendanceForToday: (lop_hoc_id, danh_sach) => request(`/diemdanh/lophoc/${lop_hoc_id}/save-today`, {
        method: 'POST',
        body: JSON.stringify({ lop_hoc_id, danh_sach }),
    }),
};