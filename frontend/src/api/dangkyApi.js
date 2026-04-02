const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw { status: 0, message: "Không thể kết nối đến server" };
  }
}

export const dangKyAPI = {
  create: (data) =>
    request("/dangkylop/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getByLop: (lopHocId) =>
    request(`/dangkylop/lop/${lopHocId}`, {
      method: "GET",
    }),

  updateStatus: (id, trang_thai) =>
    request(`/dangkylop/status/${id}`, {
      method: "PUT",
      body: JSON.stringify({ trang_thai }),
    }),
  getAll: () => request("/dangkylop/all", { method: "GET" }),
  getByPhuHuynh: (phuHuynhId) =>
    request(`/dangkylop/phuhuynh/${phuHuynhId}`, { method: "GET" }),
};
