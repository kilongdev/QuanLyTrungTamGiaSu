const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/QuanLyTrungTamGiaSu/backend/public';

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

export const lichHocAPI = {
  create: (data) =>
    request("/lichhoc/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getByLopHoc: (lopHocId) =>
    request(`/lichhoc/lop/${lopHocId}`, {
      method: "GET",
    }),

  delete: (id) =>
    request(`/lichhoc/delete/${id}`, {
      method: "DELETE",
    }),

  getAll: () =>
    request("/lichhoc", {
      method: "GET",
    }),

  getByGiaSu: (giaSuId) =>
    request(`/lichhoc/giasu/${giaSuId}`, {
      method: "GET",
    }),

  getByPhuHuynh: (phuHuynhId) =>
    request(`/lichhoc/phuhuynh/${phuHuynhId}`, {
      method: "GET",
    }),

  updateStatus: (id, trang_thai) =>
    request(`/lichhoc/status/${id}`, {
      method: "PUT",
      body: JSON.stringify({ trang_thai }),
    }),

  update: (id, data) =>
    request(`/lichhoc/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getLopHocs: () => request("/lophoc", { method: "GET" }),
};
