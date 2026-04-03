const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || undefined, // Support AbortSignal
    });

    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (_parseError) {
      if (!response.ok) {
        throw {
          status: response.status,
          message: `Server trả về dữ liệu không hợp lệ (HTTP ${response.status})`,
          raw,
        };
      }
      throw {
        status: 0,
        message: "Phản hồi từ server không phải JSON hợp lệ",
      };
    }

    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Rethrow AbortError as-is
    }
    if (error.status) throw error;
    throw { status: 0, message: "Không thể kết nối đến server" };
  }
}

export const diemDanhAPI = {
  getByLich: (lichHocId) =>
    request(`/diemdanh/lich/${lichHocId}`, {
      method: "GET",
    }),

  getClassOverview: (lopHocId) =>
    request(`/diemdanh/lophoc/${lopHocId}/overview`, {
      method: "GET",
    }),

    /**
     * Lấy danh sách điểm danh theo ID lớp học
     * @param {number} lopHocId - ID lớp học
     */
    getByClass: (lopHocId) => request(`/diemdanh/lophoc/${lopHocId}`, {
        method: 'GET',
    }),

    saveDanhSach: (data, options = {}) => request('/diemdanh/save', {
        method: 'POST',
        body: JSON.stringify(data),
      ...options,
    }),

    /**
     * Save attendance for today - auto creates schedule if needed
     * @param {number} lop_hoc_id - Class ID
     * @param {array} danh_sach - Array of {hoc_sinh_id, tinh_trang}
     */
    saveAttendanceForToday: (lop_hoc_id, danh_sach, options = {}) => request(`/diemdanh/lophoc/${lop_hoc_id}/save-today`, {
        method: 'POST',
        body: JSON.stringify({ lop_hoc_id, danh_sach }),
      ...options,
    }),

    saveAttendanceByDate: (lop_hoc_id, ngay_hoc, danh_sach) => request(`/diemdanh/lophoc/${lop_hoc_id}/save-by-date`, {
      method: 'POST',
      body: JSON.stringify({ lop_hoc_id, ngay_hoc, danh_sach }),
    }),
};
