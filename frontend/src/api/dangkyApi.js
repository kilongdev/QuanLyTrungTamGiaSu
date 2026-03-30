import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/QuanLyTrungTamGiaSu/backend/public';

export const dangKyAPI = {
  /**
   * Gửi yêu cầu đăng ký lớp học mới
   * @param {Object} data - { hoc_sinh_id, lop_hoc_id }
   */
  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/dangkylop/create`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating registration:", error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to create registration");
    }
  },

  /**
   * Lấy tất cả các đơn đăng ký (dành cho Admin)
   */
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/dangkylop/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all registrations:", error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to fetch all registrations");
    }
  },

  /**
   * Lấy danh sách đăng ký của một phụ huynh
   */
  getByPhuHuynh: async (phuHuynhId) => {
    try {
      const response = await axios.get(`${API_URL}/dangkylop/phuhuynh/${phuHuynhId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching registrations for parent ${phuHuynhId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to fetch parent registrations");
    }
  },

  /**
   * Cập nhật trạng thái của một đơn đăng ký
   * @param {number} id - dang_ky_id
   * @param {string} status - trạng thái mới ('da_duyet', 'tu_choi', 'da_huy')
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/dangkylop/status/${id}`, { trang_thai: status });
      return response.data;
    } catch (error) {
      console.error(`Error updating registration status for ${id}:`, error.response?.data || error.message);
      throw error.response?.data || new Error("Failed to update registration status");
    }
  },
};