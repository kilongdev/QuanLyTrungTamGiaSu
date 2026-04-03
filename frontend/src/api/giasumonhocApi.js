/**
 * API cho liên kết gia sư - môn học
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw { status: response.status, ...data }
    }

    return data
  } catch (error) {
    if (error.status) throw error
    throw { status: 0, message: 'Không thể kết nối đến server' }
  }
}

export const giaSuMonHocAPI = {
  getAll: ({ page = 1, limit = 1000, gia_su_id, mon_hoc_id } = {}) => {
    const query = new URLSearchParams({ page, limit })
    if (gia_su_id) query.append('gia_su_id', gia_su_id)
    if (mon_hoc_id) query.append('mon_hoc_id', mon_hoc_id)
    return request(`/giasumonhoc?${query.toString()}`, { method: 'GET' })
  },

  create: (data) =>
    request('/giasumonhoc/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/giasumonhoc/delete/${id}`, {
      method: 'DELETE',
    }),
}
