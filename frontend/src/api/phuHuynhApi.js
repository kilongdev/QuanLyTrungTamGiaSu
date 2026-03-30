/**
 * API cho quản lý Phụ Huynh
 */

const API_URL = "http://localhost:8080/QuanLyTrungTamGiaSu/backend/public";

/**
 * Gửi request đến API
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

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

/**
 * Phụ Huynh API
 */
export const phuHuynhAPI = {
  getAll: ({ page = 1, limit = 10, search = "" }) => {
    const query = new URLSearchParams({ page, limit, search }).toString();
    return request(`/phuhuynh?${query}`);
  },
  getById: (id) =>
    request(`/phuhuynh/${id}`, {
      method: "GET",
    }),
  create: (data) =>
    request("/phuhuynh/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/phuhuynh/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/phuhuynh/delete/${id}`, {
      method: "DELETE",
    }),
  getDashboardData: () =>
    request(`/phuhuynh/dashboard`, {
      method: "GET",
    }),
  getProfile: () =>
    request(`/phuhuynh/profile`, {
      method: "GET",
    }),
  getNotifications: () =>
    request(`/phuhuynh/notifications`, {
      method: "GET",
    }),
  getChildDetails: (id) =>
    request(`/phuhuynh/child/${id}`, {
      method: "GET",
    }),
  getMyStudents: () =>
    request(`/phuhuynh/my-students`, {
      method: "GET",
    }),
  getMyTutors: () =>
    request(`/phuhuynh/my-tutors`, {
      method: "GET",
    }),
};
