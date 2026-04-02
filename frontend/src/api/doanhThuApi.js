const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const doanhThuAPI = {
  getOverview: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/doanhthu/overview${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  processMonthly: async (payload = {}) => {
    const response = await fetch(`${API_BASE}/doanhthu/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  getReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/doanhthu${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getDetails: async (doanhThuId) => {
    const response = await fetch(`${API_BASE}/doanhthu/${doanhThuId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

export default doanhThuAPI;
