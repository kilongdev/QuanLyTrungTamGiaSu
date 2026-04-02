const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const luongGiaSuAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/luonggiasu`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getByGiaSu: async (giaSuId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/giasu/${giaSuId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetail: async (luongId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/chitiet/${luongId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getDetailByGroup: async (giaSuId, thang, nam) => {
    const response = await fetch(`${API_BASE}/luonggiasu/group/${giaSuId}/${thang}/${nam}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE}/luonggiasu/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (luongId, data) => {
    const response = await fetch(`${API_BASE}/luonggiasu/update/${luongId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (luongId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/delete/${luongId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  checkOverdue: async () => {
    const response = await fetch(`${API_BASE}/luonggiasu/check-overdue`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
