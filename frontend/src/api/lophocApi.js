/**
 * API cho quản lý lớp học
 */

const API_URL = "http://localhost:5001/public";

/**
 * Gửi request đến API
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  // Chỉ set Content-Type nếu không phải FormData
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
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    console.log(error);

    throw { status: 0, message: "Không thể kết nối đến server" };
  }
}

/**
 * Lớp học API
 */
export const lopHocAPI = {
  /**
   * Lấy danh sách tất cả lớp học
   */
  getAll: () =>
    request("/lophoc", {
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
  create: (data) =>
    request("/lophoc/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Cập nhật lớp học
   * @param {number} id - ID lớp học
   * @param {Object} data - Dữ liệu cần cập nhật
   */
  update: (id, data) =>
    request(`/lophoc/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Xóa lớp học
   * @param {number} id - ID lớp học
   */
  delete: (id) =>
    request(`/lophoc/delete/${id}`, {
      method: "DELETE",
    }),
};
