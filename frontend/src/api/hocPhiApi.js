const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const hocPhiAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/hocphi${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByDangKy: async (dangKyId) => {
    const response = await fetch(`${API_BASE}/hocphi/${dangKyId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data, options = {}) => {
    const response = await fetch(`${API_BASE}/hocphi/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      signal: options.signal || undefined,
    });
    return response.json();
  },

  updateStatus: async (id, data, options = {}) => {
    const response = await fetch(`${API_BASE}/hocphi/update/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      signal: options.signal || undefined,
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE}/hocphi/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  checkOverdue: async () => {
    const response = await fetch(`${API_BASE}/hocphi/check-overdue`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  sendOverdueNotifications: async () => {
    const response = await fetch(`${API_BASE}/hocphi/send-overdue-notifications`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetail: async (hocPhiId) => {
    const response = await fetch(`${API_BASE}/hocphi/chitiet/${hocPhiId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
