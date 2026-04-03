import { useState, useEffect } from 'react'
import { Edit2, Eye, Search, Plus, X, Lock, Unlock, AlertTriangle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { giaSuAPI } from '@/api/giaSuApi'
import { lichHocAPI } from '@/api/lichhocApi'
import { validateTutorForm } from '@/lib/validators'
import DataPagination from '@/components/ui/DataPagination'
import { toast } from 'sonner'

const API_URL = (import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api').replace(/\/$/, '')

export default function GiaSuManagement() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false })
  const [tutorDetailWeekDate, setTutorDetailWeekDate] = useState(new Date())
  // State cho modal chỉnh sửa
  const [editModal, setEditModal] = useState({ open: false, data: null })
  const [editFormData, setEditFormData] = useState({ 
    ho_ten: '', 
    email: '', 
    so_dien_thoai: '', 
    bang_cap: '', 
    kinh_nghiem: '', 
    trang_thai: 'cho_duyet' 
  })
  const [modalLoading, setModalLoading] = useState(false)
  // State cho modal thêm mới
  const [addModal, setAddModal] = useState(false)
  const [addFormData, setAddFormData] = useState({ 
    ho_ten: '', 
    email: '', 
    mat_khau: '', 
    so_dien_thoai: '', 
    bang_cap: '', 
    kinh_nghiem: '' 
  })
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    confirmText: 'Đồng ý',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700',
    onConfirm: null
  })

  // Gọi API lấy danh sách gia sư
  const fetchTutors = async (page = 1, searchTerm = '', limit = pageSize) => {
    try {
      setLoading(true)
      const data = await giaSuAPI.getAll({ page, limit, search: searchTerm })

      if (data.status === 'success') {
        setTutors(data.data)
        setPagination(data.pagination)
        setError(null)
      } else {
        setError('Lỗi khi tải dữ liệu')
      }
    } catch (err) {
      setError('Không thể kết nối đến server: ' + err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Gọi API lấy chi tiết gia sư
  const fetchTutorDetail = async (tutorId) => {
    try {
      setDetailModal(prev => ({ ...prev, loading: true }))

      const data = await giaSuAPI.getById(tutorId)
      const lichHocRes = await lichHocAPI.getByGiaSu(tutorId)

      if (data.status === 'success') {
        setDetailModal({
          open: true,
          data: {
            ...data.data,
            lich_day: Array.isArray(lichHocRes?.data) ? lichHocRes.data : [],
          },
          loading: false
        })
        setTutorDetailWeekDate(new Date())
      } else {
        setError('Lỗi khi tải chi tiết gia sư')
      }
    } catch (err) {
      setError('Không thể kết nối đến server: ' + err.message)
      console.error('Fetch error:', err)
      setDetailModal(prev => ({ ...prev, loading: false }))
    }
  }

  // Xử lý submit form thêm mới
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const validationMessage = validateTutorForm(addFormData, { requirePassword: true })
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }
    setModalLoading(true)
    try {
      const result = await giaSuAPI.create(addFormData)
      if (result.status === 'success') {
        toast.success('Thêm gia sư thành công!')
        setAddModal(false)
        setAddFormData({ 
          ho_ten: '', 
          email: '', 
          mat_khau: '', 
          so_dien_thoai: '', 
          bang_cap: '', 
          kinh_nghiem: '' 
        })
        fetchTutors(1, search)
      } else { throw new Error(result.message || 'Thêm thất bại') }
    } catch (err) { toast.error('Lỗi khi thêm: ' + err.message) } finally { setModalLoading(false) }
  }

  // Xử lý click nút sửa
  const handleEdit = (tutor) => {
    setEditFormData({
      ho_ten: tutor.ho_ten,
      email: tutor.email,
      so_dien_thoai: tutor.so_dien_thoai || '',
      bang_cap: tutor.bang_cap || '',
      kinh_nghiem: tutor.kinh_nghiem || '',
      trang_thai: tutor.trang_thai || 'cho_duyet'
    })
    setEditModal({ open: true, data: tutor })
  }

  // Xử lý submit form cập nhật
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editModal.data) return

    const validationMessage = validateTutorForm(editFormData)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    setModalLoading(true)
    try {
      const result = await giaSuAPI.update(editModal.data.gia_su_id, editFormData)
      if (result.status === 'success') {
        toast.success('Cập nhật thành công!')
        setEditModal({ open: false, data: null })
        fetchTutors(pagination.page, search)
      } else { throw new Error(result.message || 'Cập nhật thất bại') }
    } catch (err) { toast.error('Lỗi khi cập nhật: ' + err.message) } finally { setModalLoading(false) }
  }

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchTutors(1, '', 10)
  }, [])

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value
    setSearch(term)
    fetchTutors(1, term, pageSize)
  }

  const effectiveTotalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || pageSize)))

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= effectiveTotalPages) {
      fetchTutors(newPage, search, pageSize)
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    fetchTutors(1, search, newSize)
  }

  // Xử lý view detail
  const handleViewDetail = (tutorId) => {
    fetchTutorDetail(tutorId)
  }

  const handleToggleTutorLock = async (tutor) => {
    const isLocked = tutor.trang_thai === 'khoa'
    const actionText = isLocked ? 'mở khóa' : 'khóa'
    setConfirmModal({
      show: true,
      title: isLocked ? 'Xác nhận mở khóa' : 'Xác nhận khóa',
      message: `Bạn có chắc muốn ${actionText} tài khoản gia sư "${tutor.ho_ten}"?`,
      confirmText: isLocked ? 'Mở khóa' : 'Khóa',
      confirmButtonClass: isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700',
      onConfirm: async () => {
        closeConfirmModal()

        try {
          const result = isLocked
            ? await giaSuAPI.unlock(tutor.gia_su_id)
            : await giaSuAPI.lock(tutor.gia_su_id)

          if (result.status === 'success') {
            toast.success(isLocked ? 'Đã mở khóa tài khoản gia sư' : 'Đã khóa tài khoản gia sư')
            fetchTutors(pagination.page, search)
          } else {
            throw new Error(result.message || `Không thể ${actionText} tài khoản`)
          }
        } catch (err) {
          toast.error(err.message || `Không thể ${actionText} tài khoản gia sư`)
        }
      }
    })
  }

  // Đóng modal
  const closeModal = () => {
    setDetailModal({ open: false, data: null, loading: false })
  }

  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      title: '',
      message: '',
      confirmText: 'Đồng ý',
      confirmButtonClass: 'bg-amber-600 hover:bg-amber-700',
      onConfirm: null
    })
  }

  // Tạo avatar từ tên
  const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Tạo màu avatar từ id
  const getAvatarColor = (id) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500']
    return colors[id % colors.length]
  }

  // Format trạng thái
  const getStatusBadge = (status) => {
    const statusMap = {
      'cho_duyet': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      'da_duyet': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      'tu_choi': { label: 'Từ chối', class: 'bg-red-100 text-red-800' },
      'khoa': { label: 'Bị khóa', class: 'bg-gray-200 text-gray-800' }
    }
    const s = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.class}`}>{s.label}</span>
  }

  const toAbsoluteMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  }

  const formatThuDate = (dateString) => {
    if (!dateString) return 'Chưa có'
    const date = new Date(dateString)
    const day = date.getDay()
    const thu = day === 0 ? 'Chủ Nhật' : `Thứ ${day + 1}`
    return `${thu}, ${date.toLocaleDateString('vi-VN')}`
  }

  const getMonday = (inputDate) => {
    const date = new Date(inputDate)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
  }

  const formatDateKey = (date) => {
    const d = new Date(date)
    const month = `${d.getMonth() + 1}`.padStart(2, '0')
    const day = `${d.getDate()}`.padStart(2, '0')
    return `${d.getFullYear()}-${month}-${day}`
  }

  const tutorWeekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(getMonday(tutorDetailWeekDate))
    d.setDate(d.getDate() + index)
    return d
  })

  const weekDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách gia sư...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Gia sư</h2>
          <button 
            onClick={() => setAddModal(true)}
            className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Thêm gia sư
          </button>
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">⚠️ Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {tutors.length === 0 ? (
          <div className="p-12 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu gia sư</p>
            <p className="text-gray-400 text-sm mt-2">Hãy thêm gia sư mới hoặc thay đổi bộ lọc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Gia sư</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Điện Thoại</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bằng cấp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tutors.map((tutor, index) => (
                  <tr key={tutor.gia_su_id} className="hover:bg-red-50/40 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{tutor.ho_ten}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 break-words">{tutor.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{tutor.so_dien_thoai || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{tutor.bang_cap || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tutor.trang_thai)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 tooltip"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(tutor.gia_su_id)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 tooltip"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(tutor)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors duration-200 tooltip ${tutor.trang_thai === 'khoa' ? 'text-green-700 hover:bg-green-50' : 'text-amber-700 hover:bg-amber-50'}`}
                          title={tutor.trang_thai === 'khoa' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          onClick={() => handleToggleTutorLock(tutor)}
                        >
                          {tutor.trang_thai === 'khoa' ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DataPagination
          page={pagination.page}
          totalPages={effectiveTotalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit || pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="gia sư"
        />
      </div>

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-200">
            {detailModal.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : detailModal.data ? (
              <>
                {/* Modal Header */}
                <div className="bg-blue-800 text-white p-5 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{detailModal.data.ho_ten}</h3>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="text-white hover:bg-white/20 p-1 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 space-y-4">
                  {detailModal.data.anh_dai_dien_url && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm mb-2">Ảnh đại diện</p>
                      <img
                        src={toAbsoluteMediaUrl(detailModal.data.anh_dai_dien_url)}
                        alt="Ảnh đại diện gia sư"
                        className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Điện thoại</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.so_dien_thoai || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Bằng cấp</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.bang_cap || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Kinh nghiệm</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.kinh_nghiem || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Ngày sinh</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.ngay_sinh ? detailModal.data.ngay_sinh.substring(0, 10) : 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Giới tính</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.gioi_tinh || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 sm:col-span-2">
                      <p className="text-gray-600 text-sm">Địa chỉ</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.dia_chi || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 sm:col-span-2">
                      <p className="text-gray-600 text-sm">Giới thiệu</p>
                      <p className="font-semibold text-gray-900 whitespace-pre-wrap">{detailModal.data.gioi_thieu || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 sm:col-span-2">
                      <p className="text-gray-600 text-sm">Số tài khoản ngân hàng</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.so_tai_khoan_ngan_hang || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Ngày đăng ký</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.ngay_dang_ky || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <p className="text-blue-700 text-sm">Đánh giá trung bình</p>
                      <p className="font-bold text-blue-900 text-xl">{detailModal.data.diem_danh_gia_trung_binh || '0.00'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-gray-600 text-sm">Trạng thái</p>
                      {getStatusBadge(detailModal.data.trang_thai)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-700 text-sm font-semibold mb-3">Chứng chỉ</p>
                    {Array.isArray(detailModal.data.chung_chi) && detailModal.data.chung_chi.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {detailModal.data.chung_chi.map((item, idx) => {
                          const imageUrl = toAbsoluteMediaUrl(item?.url || '')
                          return (
                            <a key={`${item?.file_name || 'cert'}-${idx}`} href={imageUrl} target="_blank" rel="noreferrer" className="group block">
                              <img src={imageUrl} alt={item?.original_name || `Chứng chỉ ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-red-300" />
                              <p className="text-xs text-gray-600 mt-1 truncate">{item?.original_name || `Chứng chỉ ${idx + 1}`}</p>
                            </a>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có chứng chỉ</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-700 text-sm font-semibold mb-3">Lịch dạy</p>
                    {Array.isArray(detailModal.data.lich_day) && detailModal.data.lich_day.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2 py-1 w-fit">
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Date(tutorDetailWeekDate)
                              next.setDate(next.getDate() - 7)
                              setTutorDetailWeekDate(next)
                            }}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-semibold text-gray-700">Tuần này</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Date(tutorDetailWeekDate)
                              next.setDate(next.getDate() + 7)
                              setTutorDetailWeekDate(next)
                            }}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          {tutorWeekDays.map((dayDate, idx) => {
                            const dayKey = formatDateKey(dayDate)
                            const schedules = (detailModal.data.lich_day || [])
                              .filter((item) => item.ngay_hoc === dayKey)
                              .sort((a, b) => (a.gio_bat_dau || '').localeCompare(b.gio_bat_dau || ''))

                            return (
                              <div key={dayKey} className="border border-gray-200 rounded-lg p-2 bg-white min-h-[120px]">
                                <p className="text-xs font-bold text-gray-700">{weekDayNames[idx]}</p>
                                <p className="text-[11px] text-gray-500 mb-2">{dayDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                                {schedules.length === 0 ? (
                                  <p className="text-[11px] text-gray-400">Trống</p>
                                ) : (
                                  <div className="space-y-1">
                                    {schedules.map((lh) => (
                                      <div key={lh.lich_hoc_id} className="bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                        <p className="text-[11px] font-medium text-gray-800 truncate">{lh.ten_lop || `Lớp #${lh.lop_hoc_id}`}</p>
                                        <p className="text-[11px] text-gray-600 flex items-center gap-1"><Clock size={10} />{lh.gio_bat_dau?.substring(0,5)} - {lh.gio_ket_thuc?.substring(0,5)}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có lịch dạy.</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={() => { closeModal(); handleEdit(detailModal.data); }}
                    className="px-4 py-2 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title || 'Xác nhận'}</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={closeConfirmModal}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                className={`flex-1 py-2.5 text-white font-medium rounded-lg ${confirmModal.confirmButtonClass}`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Thêm gia sư mới</h3>
              <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.ho_ten}
                    onChange={(e) => setAddFormData({ ...addFormData, ho_ten: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={addFormData.mat_khau}
                    onChange={(e) => setAddFormData({ ...addFormData, mat_khau: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={addFormData.so_dien_thoai}
                    onChange={(e) => setAddFormData({ ...addFormData, so_dien_thoai: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bằng cấp</label>
                  <input
                    type="text"
                    value={addFormData.bang_cap}
                    onChange={(e) => setAddFormData({ ...addFormData, bang_cap: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Cử nhân, Thạc sĩ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                  <input
                    type="text"
                    value={addFormData.kinh_nghiem}
                    onChange={(e) => setAddFormData({ ...addFormData, kinh_nghiem: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 3 năm"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-red-800 text-white rounded-xl font-medium hover:bg-red-900 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin gia sư</h3>
              <button onClick={() => setEditModal({ open: false, data: null })} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={editFormData.ho_ten}
                    onChange={(e) => setEditFormData({ ...editFormData, ho_ten: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editFormData.so_dien_thoai}
                    onChange={(e) => setEditFormData({ ...editFormData, so_dien_thoai: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bằng cấp</label>
                  <input
                    type="text"
                    value={editFormData.bang_cap}
                    onChange={(e) => setEditFormData({ ...editFormData, bang_cap: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                  <input
                    type="text"
                    value={editFormData.kinh_nghiem}
                    onChange={(e) => setEditFormData({ ...editFormData, kinh_nghiem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={editFormData.trang_thai}
                    onChange={(e) => setEditFormData({ ...editFormData, trang_thai: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cho_duyet">Chờ duyệt</option>
                    <option value="da_duyet">Đã duyệt</option>
                    <option value="tu_choi">Từ chối</option>
                    <option value="khoa">Bị khóa</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, data: null })}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-red-800 text-white rounded-xl font-medium hover:bg-red-900 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
