const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const parseJsonResponse = async (response) => {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Luong API trả về không phải JSON hợp lệ (HTTP ${response.status}): ${responseText.slice(0, 200)}`);
  }
};

export const luongGiaSuAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/luonggiasu`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  },

  getByGiaSu: async (giaSuId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/giasu/${giaSuId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  },

  getDetail: async (luongId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/chitiet/${luongId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  },

  getDetailByGroup: async (giaSuId, thang, nam) => {
    const response = await fetch(`${API_BASE}/luonggiasu/group/${giaSuId}/${thang}/${nam}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  },

  create: async (data, options = {}) => {
    const response = await fetch(`${API_BASE}/luonggiasu/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      signal: options.signal || undefined,
    });
    return parseJsonResponse(response);
  },

  update: async (luongId, data, options = {}) => {
    const response = await fetch(`${API_BASE}/luonggiasu/update/${luongId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      signal: options.signal || undefined,
    });
    return parseJsonResponse(response);
  },

  delete: async (luongId) => {
    const response = await fetch(`${API_BASE}/luonggiasu/delete/${luongId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  },

  checkOverdue: async () => {
    const response = await fetch(`${API_BASE}/luonggiasu/check-overdue`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return parseJsonResponse(response);
  }
};
