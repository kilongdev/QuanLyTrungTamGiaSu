/**
 * API cho quản lý lớp học
 */

//const API_URL = "http://localhost:5001";
const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api';

/**
 * Gửi request đến API
 */
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        ...options.headers,
    };

    // Chỉ set Content-Type nếu không phải FormData
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
            signal: options.signal || undefined, // Support AbortSignal
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw { status: response.status, ...data };
        }
        
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error; // Rethrow AbortError as-is
        }
        if (error.status) throw error;
        throw { status: 0, message: 'Không thể kết nối đến server' };
    }
}

/**
 * Lớp học API
 */
export const lopHocAPI = {
    /**
     * Lấy danh sách tất cả lớp học
     */
    getAll: (params = {}) => {
        const query = new URLSearchParams()
        if (params.excludeDong) {
            query.set('exclude_dong', '1')
        }
        const suffix = query.toString() ? `?${query.toString()}` : ''
        return request(`/lophoc${suffix}`, {
            method: 'GET',
        })
    },

    /**
   * Lấy danh sách lớp học theo ID gia sư
   */
  getByGiaSu: (giaSuId) =>
    request(`/lophoc?gia_su_id=${giaSuId}`, {
      method: "GET",
    }),

  /**
   * Lấy chi tiết lớp học theo ID
   * @param {number} id - ID lớp học
   */
  getById: (id) =>
    request(`/lophoc/${id}`, {
      method: "GET",
    }),

    /**
     * Tạo lớp học mới
     * @param {Object} data - Dữ liệu lớp học
     * @param {number} data.mon_hoc_id - ID môn học (required)
     * @param {number} data.gia_su_id - ID giáo viên (optional)
     * @param {string} data.ten_lop - Tên lớp (optional)
     * @param {string} data.mo_ta - Mô tả (optional)
     * @param {string} data.lich_hoc - Lịch học (optional)
     * @param {number} data.hoc_phi - Học phí (optional)
     * @param {string} data.trang_thai - Trạng thái (optional)
     */
    create: (data, options = {}) => 
        request('/lophoc/create', {
            method: 'POST',
            body: JSON.stringify(data),
                    ...options,
        }),

    /**
     * Cập nhật lớp học
     * @param {number} id - ID lớp học
     * @param {Object} data - Dữ liệu cần cập nhật
     */
    update: (id, data, options = {}) => 
        request(`/lophoc/update/${id}`, {
            method: 'PUT',
                        ...options,
            body: JSON.stringify(data),
        }),

    updateStatus: (id, trang_thai) =>
        request(`/lophoc/status/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ trang_thai }),
        }),

    /**
     * Xóa lớp học
     * @param {number} id - ID lớp học
     */
    delete: (id) => 
        request(`/lophoc/delete/${id}`, {
            method: 'DELETE',
        }),

    /**
     * Lấy danh sách học sinh của một lớp học
     * @param {number} lopHocId - ID lớp học
     */
    getStudentsByClass: (lopHocId) => 
        request(`/lophoc/${lopHocId}/students`, {
            method: 'GET',
        }),

    /**
     * Thêm học sinh vào lớp học
     * @param {number} lopHocId - ID lớp học
     * @param {number} hocSinhId - ID học sinh
     */
    addStudent: (lopHocId, hocSinhId) => 
        request(`/lophoc/${lopHocId}/add-student`, {
            method: 'POST',
            body: JSON.stringify({ hoc_sinh_id: hocSinhId }),
        }),

    /**
     * Xóa học sinh khỏi lớp học
     * @param {number} lopHocId - ID lớp học
     * @param {number} hocSinhId - ID học sinh
     */
    removeStudent: (lopHocId, hocSinhId) => 
        request(`/lophoc/${lopHocId}/remove-student/${hocSinhId}`, {
            method: 'DELETE',
        }),
};
