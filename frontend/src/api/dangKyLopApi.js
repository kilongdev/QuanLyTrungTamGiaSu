const API_BASE = 'http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const dangKyLopAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}?route=/dangkylop/all${queryString ? '&' + queryString : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByLop: async (lopHocId) => {
    const response = await fetch(`${API_BASE}?route=/dangkylop/lop/${lopHocId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByPhuHuynh: async (phuHuynhId) => {
    const response = await fetch(`${API_BASE}?route=/dangkylop/phuhuynh/${phuHuynhId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE}?route=/dangkylop/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateStatus: async (id, trang_thai) => {
    const response = await fetch(`${API_BASE}?route=/dangkylop/status/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ trang_thai })
    });
    return response.json();
  }
};
