const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost/QuanLyTrungTamGiaSu/backend/public'}/api.php`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const luongGiaSuAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByGiaSu: async (giaSuId) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/giasu/${giaSuId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetail: async (luongId) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/chitiet/${luongId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetailByGroup: async (giaSuId, thang, nam) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/group/${giaSuId}/${thang}/${nam}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (luongId, data) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/update/${luongId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (luongId) => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/delete/${luongId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  checkOverdue: async () => {
    const response = await fetch(`${API_BASE}?route=/luonggiasu/check-overdue`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
