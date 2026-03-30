const API_BASE = 'http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const doanhThuAPI = {
  getOverview: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}?route=/doanhthu/overview${queryString ? `&${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  processMonthly: async (payload = {}) => {
    const response = await fetch(`${API_BASE}?route=/doanhthu/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  getReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}?route=/doanhthu${queryString ? `&${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getDetails: async (doanhThuId) => {
    const response = await fetch(`${API_BASE}?route=/doanhthu/${doanhThuId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

export default doanhThuAPI;
