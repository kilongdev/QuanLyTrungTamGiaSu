const API_URL = "http://localhost:8080/QuanLyTrungTamGiaSu/backend/public";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const hocPhiAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/hocphi${queryString ? "?" + queryString : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getByDangKy: async (dangKyId) => {
    const response = await fetch(`${API_URL}/hocphi/${dangKyId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/hocphi/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateStatus: async (id, data) => {
    const response = await fetch(`${API_URL}/hocphi/update/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/hocphi/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  checkQuaHan: async () => {
    const response = await fetch(`${API_URL}/hocphi/check-quahan`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getDetail: async (hocPhiId) => {
    const response = await fetch(
      `${API_URL}/hocphi/chitiet/${hocPhiId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    return response.json();
  },

  // API dành riêng cho phụ huynh xem học phí của con
  getByChild: async (hocSinhId) => {
    const response = await fetch(`${API_URL}/phuhuynh/child/${hocSinhId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
