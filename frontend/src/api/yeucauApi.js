const API_URL = 'http://localhost/QuanLyTrungTamGiaSu/backend/public';
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
        throw { status: 0, message: 'Không thể kết nối đến server' };
    }
}

export const yeuCauAPI = {
    getAll: () => request('/yeucau', { method: 'GET' }),
    
    getByNguoiTao: (id, loai) => request(`/yeucau/nguoitao/${id}/${loai}`, { method: 'GET' }),
    
    create: (data) => request('/yeucau/create', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    update: (id, data) => request(`/yeucau/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    updateStatus: (id, data) => request(`/yeucau/status/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    delete: (id) => request(`/yeucau/delete/${id}`, { method: 'DELETE' }),
};