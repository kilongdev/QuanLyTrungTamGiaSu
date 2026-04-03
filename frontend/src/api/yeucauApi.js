/**
 * API cho quản lý yêu cầu (guest đăng ký lớp, gửi yêu cầu)
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api';

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
      signal: options.signal || undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    if (error.status) throw error;
    throw { status: 0, message: "Không thể kết nối đến server" };
  }
}

/**
 * Yêu cầu API
 */
export const yeuCauAPI = {
  /**
   * Guest gửi yêu cầu đăng ký lớp hoặc tìm gia sư
   */
  createGuest: (data) =>
    request("/yeucau/create-guest", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Admin tạo yêu cầu (nếu cần)
   */
  create: (data, options = {}) =>
    request("/yeucau/create", {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    }),

  /**
   * Lấy tất cả yêu cầu (admin)
   */
  getAll: () =>
    request("/yeucau", {
      method: "GET",
    }),

    /**
   * Lấy danh sách yêu cầu nhận lớp mới cho Gia sư
   */
  getYeuCauMoi: (giaSuId) =>
    request(`/yeucau?gia_su_id=${giaSuId}`, {
      method: "GET",
    }),
    
  /**
   * Lấy yêu cầu theo người tạo
   */
  getByNguoiTao: (id, loai) => 
    request(`/yeucau/nguoitao/${id}/${loai}`, {
      method: "GET",
    }),

  /**
   * Admin cập nhật trạng thái yêu cầu
   */
  updateStatus: (id, data, options = {}) =>
    request(`/yeucau/status/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),

    /**
   * Cập nhật thông tin yêu cầu
   */
  update: (id, data, options = {}) =>
    request(`/yeucau/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),

  /**
   * Xóa yêu cầu
   */
  delete: (id) =>
    request(`/yeucau/delete/${id}`, {
      method: "DELETE",
    }),
};
