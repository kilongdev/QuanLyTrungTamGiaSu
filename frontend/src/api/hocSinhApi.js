/**
 * API cho quản lý Học Sinh
 */

// Sử dụng biến môi trường từ Vite hoặc fallback về localhost
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/QuanLyTrungTamGiaSu/backend/public';
const API_URL = "http://localhost:5001/public";

/**
 * Gửi request đến API
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

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
    throw { status: 0, message: "Không thể kết nối đến server" };
  }
}

/**
 * Học Sinh API
 */
export const hocSinhAPI = {
  /**
   * Lấy danh sách tất cả học sinh
   * @param {object} params - { page, limit, search }
   */
  getAll: ({ page = 1, limit = 10, search = "" }) => {
    const query = new URLSearchParams({ page, limit, search }).toString();
    return request(`/hocsinh?${query}`, {
      method: "GET",
    });
  },

  /**
   * Lấy chi tiết học sinh theo ID
   * @param {number|string} id - ID học sinh
   */
  getById: (id) =>
    request(`/hocsinh/${id}`, {
      method: "GET",
    }),

  /**
   * Tạo học sinh mới
   * @param {Object} data - Dữ liệu học sinh
   */
  create: (data) =>
    request("/hocsinh/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Cập nhật học sinh
   * @param {number|string} id - ID học sinh
   * @param {Object} data - Dữ liệu cần cập nhật
   */
  update: (id, data) =>
    request(`/hocsinh/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Xóa học sinh
   * @param {number|string} id - ID học sinh
   */
  delete: (id) =>
    request(`/hocsinh/delete/${id}`, {
      method: "DELETE",
    }),

  /**
   * Lấy danh sách học sinh (con) theo ID Phụ huynh
   * @param {number|string} phuHuynhId - ID phụ huynh
   */
  getByPhuHuynh: (phuHuynhId) =>
    request(`/hocsinh/phuhuynh/${phuHuynhId}`, {
      method: "GET",
    }),
};
