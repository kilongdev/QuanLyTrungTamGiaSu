const API_BASE = 'http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const hocPhiAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}?route=/hocphi${queryString ? '&' + queryString : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByDangKy: async (dangKyId) => {
    const response = await fetch(`${API_BASE}?route=/hocphi/${dangKyId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE}?route=/hocphi/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateStatus: async (id, data) => {
    const response = await fetch(`${API_BASE}?route=/hocphi/update/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE}?route=/hocphi/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  checkQuaHan: async () => {
    const response = await fetch(`${API_BASE}?route=/hocphi/check-quahan`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetail: async (hocPhiId) => {
    const response = await fetch(`${API_BASE}?route=/hocphi/chitiet/${hocPhiId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
