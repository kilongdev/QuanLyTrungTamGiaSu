import { useEffect, useMemo, useState } from 'react'
import { Edit2, Mail, Phone, Plus, ShieldCheck, Trash2, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'

import { adminAPI } from '@/api/adminApi'
import DataPagination from '@/components/ui/DataPagination'

const initialForm = {
  ho_ten: '',
  email: '',
  so_dien_thoai: '',
  mat_khau: '',
}

const safeMessage = (error, fallback) => {
  if (!error) return fallback
  return error.message || error?.raw || fallback
}

export default function AdminAccountManagement({ currentUser }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, data: null })
  const [formData, setFormData] = useState(initialForm)
  const [modalLoading, setModalLoading] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState({ open: false, data: null })

  const currentAdminId = useMemo(() => Number(currentUser?.id || 0), [currentUser?.id])

  const normalizeAdminsResponse = (payload) => {
    const list = payload?.data?.data || []
    const paging = payload?.data?.pagination || {}

    return {
      list,
      paging: {
        page: Number(paging.page || 1),
        limit: Number(paging.limit || pageSize),
        total: Number(paging.total || list.length || 0),
        totalPages: Number(paging.totalPages || 1),
      },
    }
  }

  const fetchAdmins = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllAdmins({ page, limit })

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể tải danh sách admin')
      }

      const normalized = normalizeAdminsResponse(response)
      setAdmins(normalized.list)
      setPagination(normalized.paging)
      setError('')
    } catch (err) {
      const msg = safeMessage(err, 'Không thể kết nối đến server')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins(1, pageSize)
  }, [])

  const openAddModal = () => {
    setFormData(initialForm)
    setAddModalOpen(true)
  }

  const openEditModal = (admin) => {
    setFormData({
      ho_ten: admin.ho_ten || '',
      email: admin.email || '',
      so_dien_thoai: admin.so_dien_thoai || '',
      mat_khau: '',
    })
    setEditModal({ open: true, data: admin })
  }

  const closeModals = () => {
    setAddModalOpen(false)
    setEditModal({ open: false, data: null })
    setConfirmDelete({ open: false, data: null })
    setFormData(initialForm)
  }

  const validateForm = (isCreate = false) => {
    if (!formData.ho_ten.trim()) return 'Họ tên không được để trống'
    if (!formData.email.trim()) return 'Email không được để trống'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) return 'Email không hợp lệ'

    if (formData.so_dien_thoai && !/^0\d{9,10}$/.test(formData.so_dien_thoai.trim())) {
      return 'Số điện thoại không hợp lệ (định dạng: 0123456789)'
    }

    if (isCreate && !formData.mat_khau.trim()) return 'Mật khẩu không được để trống'
    if (formData.mat_khau && formData.mat_khau.trim().length < 6) return 'Mật khẩu phải từ 6 ký tự'

    return null
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const validationMsg = validateForm(true)
    if (validationMsg) {
      toast.warning(validationMsg)
      return
    }

    try {
      setModalLoading(true)
      const payload = {
        ho_ten: formData.ho_ten.trim(),
        email: formData.email.trim(),
        so_dien_thoai: formData.so_dien_thoai.trim(),
        mat_khau: formData.mat_khau,
      }

      const response = await adminAPI.createAdmin(payload)
      if (!response?.success) {
        throw new Error(response?.message || 'Tạo tài khoản admin thất bại')
      }

      toast.success('Tạo tài khoản admin thành công')
      closeModals()
      fetchAdmins(1, pageSize)
    } catch (err) {
      toast.error(safeMessage(err, 'Không thể tạo tài khoản admin'))
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!editModal.data?.admin_id) return

    const validationMsg = validateForm(false)
    if (validationMsg) {
      toast.warning(validationMsg)
      return
    }

    try {
      setModalLoading(true)
      const payload = {
        ho_ten: formData.ho_ten.trim(),
        email: formData.email.trim(),
        so_dien_thoai: formData.so_dien_thoai.trim(),
      }

      if (formData.mat_khau.trim()) {
        payload.mat_khau = formData.mat_khau
      }

      const response = await adminAPI.updateAdmin(editModal.data.admin_id, payload)
      if (!response?.success) {
        throw new Error(response?.message || 'Cập nhật tài khoản admin thất bại')
      }

      toast.success('Cập nhật tài khoản admin thành công')
      closeModals()
      fetchAdmins(pagination.page, pageSize)
    } catch (err) {
      toast.error(safeMessage(err, 'Không thể cập nhật tài khoản admin'))
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete.data?.admin_id) return

    try {
      setModalLoading(true)
      const response = await adminAPI.deleteAdmin(confirmDelete.data.admin_id)
      if (!response?.success) {
        throw new Error(response?.message || 'Xóa tài khoản admin thất bại')
      }

      toast.success('Đã xóa tài khoản admin')
      closeModals()

      const nextPage = admins.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page
      fetchAdmins(nextPage, pageSize)
    } catch (err) {
      toast.error(safeMessage(err, 'Không thể xóa tài khoản admin'))
    } finally {
      setModalLoading(false)
    }
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return
    fetchAdmins(nextPage, pageSize)
  }

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize)
    fetchAdmins(1, nextSize)
  }

  const getInitial = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700" />
        <p className="text-gray-500 mt-4">Đang tải danh sách tài khoản admin...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý tài khoản admin</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo, cập nhật và quản lý tài khoản quản trị viên hệ thống</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Thêm admin
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Admin</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Số điện thoại</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-700">Vai trò</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Chưa có tài khoản admin nào</td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isCurrentAdmin = Number(admin.admin_id) === currentAdminId

                return (
                  <tr key={admin.admin_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold text-sm">
                          {getInitial(admin.ho_ten || 'A')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.ho_ten || 'Chưa cập nhật'}</p>
                          <p className="text-xs text-gray-500">ID: {admin.admin_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {admin.email || 'Chưa có'}
                      </div>
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {admin.so_dien_thoai || 'Chưa có'}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <ShieldCheck size={14} />
                        Quản trị viên
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="w-9 h-9 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => setConfirmDelete({ open: true, data: admin })}
                          disabled={isCurrentAdmin}
                          className="w-9 h-9 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                          title={isCurrentAdmin ? 'Không thể xóa tài khoản đang đăng nhập' : 'Xóa tài khoản'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <DataPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="admin"
      />

      {(addModalOpen || editModal.open) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {addModalOpen ? 'Thêm tài khoản admin' : 'Cập nhật tài khoản admin'}
              </h3>
              <button onClick={closeModals} className="p-2 rounded-lg hover:bg-gray-100" disabled={modalLoading}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addModalOpen ? handleCreate : handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên</label>
                <div className="relative">
                  <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.ho_ten}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ho_ten: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.so_dien_thoai}
                    onChange={(e) => setFormData((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    placeholder="0987654321"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {addModalOpen ? 'Mật khẩu' : 'Mật khẩu mới (để trống nếu không đổi)'}
                </label>
                <input
                  type="password"
                  value={formData.mat_khau}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mat_khau: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  placeholder={addModalOpen ? 'Tối thiểu 6 ký tự' : 'Nhập để đổi mật khẩu'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {modalLoading ? 'Đang xử lý...' : addModalOpen ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-5">
            <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa tài khoản</h3>
            <p className="text-sm text-gray-600 mt-2">
              Bạn có chắc muốn xóa tài khoản admin <strong>{confirmDelete.data?.ho_ten}</strong>?
            </p>
            <p className="text-xs text-red-600 mt-2">Hành động này không thể hoàn tác.</p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModals}
                disabled={modalLoading}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
              >
                {modalLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
