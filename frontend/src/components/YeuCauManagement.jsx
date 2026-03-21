import { useState, useEffect, Fragment } from 'react'
import { yeuCauAPI } from '../api/yeucauApi'
import { phuHuynhAPI } from '../api/phuHuynhApi'
import { giaSuAPI } from '../api/giaSuApi'
import { lopHocAPI } from '../api/lophocApi'
import { Plus, X, Search, Trash2 } from 'lucide-react'
import { validateRequestForm } from '@/lib/validators'
import { toast } from 'sonner'

const CATEGORY_TITLES = {
  mo_lop: 'Yêu cầu mở lớp',
  huy_lop: 'Yêu cầu hủy lớp',
  nghi_day: 'Yêu cầu nghỉ dạy',
  nghi_hoc: 'Yêu cầu nghỉ học',
  khac: 'Yêu cầu khác'
}

const getAutoTitleByCategory = (phanLoai) => CATEGORY_TITLES[phanLoai] || 'Yêu cầu'
const STATUS_ORDER = ['cho_duyet', 'dang_xu_ly', 'da_duyet', 'tu_choi', 'da_hoan_thanh']

export default function YeuCauManagement({ user }) {
  const [yeuCaus, setYeuCaus] = useState([])
  const [phuHuynhs, setPhuHuynhs] = useState([])
  const [giaSus, setGiaSus] = useState([])
  const [lopHocs, setLopHocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    requestId: null,
    nextStatus: '',
    note: '',
    loading: false
  })

  const currentUserId = user?.id || user?.gia_su_id || user?.phu_huynh_id || user?.tai_khoan_id || '1'
  const currentUserRole = user?.role === 'admin' ? 'phu_huynh' : (user?.role || 'phu_huynh')

  const [formData, setFormData] = useState({
    nguoi_tao_id: String(currentUserId),
    loai_nguoi_tao: currentUserRole,
    phan_loai: 'mo_lop',
    tieu_de: getAutoTitleByCategory('mo_lop'),
    noi_dung: '',
    lop_hoc_id: '',
    dang_ky_id: '',
    gia_su_id: currentUserRole === 'gia_su' ? String(currentUserId) : '',
    trang_thai: 'cho_duyet',
    nguoi_xu_ly_id: '1',
    ghi_chu_xu_ly: ''
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchYeuCaus(), fetchReferenceUsers(), fetchLopHocs()])
    } finally {
      setLoading(false)
    }
  }

  const fetchLopHocs = async () => {
    try {
      const response = await lopHocAPI.getAll()
      setLopHocs(response?.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học:', error)
    }
  }

  const fetchReferenceUsers = async () => {
    try {
      const [phRes, gsRes] = await Promise.all([
        phuHuynhAPI.getAll({ page: 1, limit: 1000, search: '' }),
        giaSuAPI.getAll({ page: 1, limit: 1000, search: '' })
      ])
      setPhuHuynhs(phRes?.data || [])
      setGiaSus(gsRes?.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách tham chiếu người dùng:', error)
    }
  }

  const fetchYeuCaus = async () => {
    try {
      let response
      if (user?.role === 'admin') {
        response = await yeuCauAPI.getAll()
      } else {
        const userId = user?.id || user?.gia_su_id || user?.phu_huynh_id || user?.tai_khoan_id
        response = await yeuCauAPI.getByNguoiTao(userId, user.role)
      }
      setYeuCaus(response?.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu cầu:', error)
      toast.error('Không thể tải danh sách yêu cầu')
    }
  }

  const shouldRequireDangKyId = (phanLoai) => phanLoai === 'huy_lop' || phanLoai === 'nghi_hoc'
  const shouldRequireGiaSuId = (phanLoai) => phanLoai === 'nghi_day'

  const normalizeConditionalFields = (data) => ({
    ...data,
    dang_ky_id: shouldRequireDangKyId(data.phan_loai) ? data.dang_ky_id : '',
    gia_su_id: shouldRequireGiaSuId(data.phan_loai) ? data.gia_su_id : ''
  })

  const resetForm = () => {
    const userId = user?.id || user?.gia_su_id || user?.phu_huynh_id || user?.tai_khoan_id || '1'
    setFormData({
      nguoi_tao_id: String(userId),
      loai_nguoi_tao: user?.role === 'admin' ? 'phu_huynh' : user?.role,
      phan_loai: 'mo_lop',
      tieu_de: getAutoTitleByCategory('mo_lop'),
      noi_dung: '',
      lop_hoc_id: '',
      dang_ky_id: '',
      gia_su_id: user?.role === 'gia_su' ? String(userId) : '',
      trang_thai: 'cho_duyet',
      nguoi_xu_ly_id: String(user?.id || '1'),
      ghi_chu_xu_ly: ''
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()

    const validationMessage = validateRequestForm(formData)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    if (!formData.noi_dung || !formData.lop_hoc_id) {
      toast.warning('Vui lòng nhập đủ nội dung và lớp học ID')
      return
    }

    if (shouldRequireDangKyId(formData.phan_loai) && !formData.dang_ky_id) {
      toast.warning('Phân loại này bắt buộc Đăng ký ID')
      return
    }

    if (shouldRequireGiaSuId(formData.phan_loai) && !formData.gia_su_id) {
      toast.warning('Phân loại này bắt buộc Gia sư ID')
      return
    }

    try {
      const payload = normalizeConditionalFields({
        ...formData,
        tieu_de: getAutoTitleByCategory(formData.phan_loai)
      })
      await yeuCauAPI.create(payload)
      toast.success('Gửi yêu cầu thành công!')
      setShowCreateModal(false)
      resetForm()
      await fetchYeuCaus()
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi lưu yêu cầu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return
    try {
      await yeuCauAPI.delete(id)
      toast.success('Xóa yêu cầu thành công!')
      await fetchYeuCaus()
    } catch (error) {
      toast.error(error.message || 'Không thể xóa yêu cầu này')
    }
  }

  const getPhanLoaiLabel = (phanLoai) => {
    const labels = {
      mo_lop: 'Mở lớp mới',
      huy_lop: 'Hủy lớp',
      nghi_day: 'Xin nghỉ dạy',
      nghi_hoc: 'Xin nghỉ học',
      khac: 'Yêu cầu khác'
    }
    return labels[phanLoai] || phanLoai
  }

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      cho_duyet: 'Chờ xử lý',
      dang_xu_ly: 'Đang xử lý',
      da_duyet: 'Đã duyệt',
      tu_choi: 'Từ chối',
      da_hoan_thanh: 'Đã hoàn thành'
    }
    return labels[trangThai] || trangThai
  }

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      cho_duyet: 'bg-yellow-100 text-yellow-700',
      dang_xu_ly: 'bg-blue-100 text-blue-700',
      da_duyet: 'bg-green-100 text-green-700',
      tu_choi: 'bg-red-100 text-red-700',
      da_hoan_thanh: 'bg-gray-200 text-gray-800'
    }
    return colors[trangThai] || 'bg-gray-100 text-gray-700'
  }

  const getStatusActionButtonClass = (trangThai) => {
    const classes = {
      cho_duyet: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      dang_xu_ly: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      da_duyet: 'bg-green-50 text-green-700 hover:bg-green-100',
      tu_choi: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
      da_hoan_thanh: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
    return classes[trangThai] || 'bg-slate-50 text-slate-700 hover:bg-slate-100'
  }

  const getAvailableNextStatuses = (currentStatus) => STATUS_ORDER.filter((s) => s !== currentStatus)

  const openStatusModal = (requestId, nextStatus) => {
    setStatusModal({
      isOpen: true,
      requestId,
      nextStatus,
      note: '',
      loading: false
    })
  }

  const handleConfirmStatusChange = async () => {
    if (!statusModal.requestId || !statusModal.nextStatus) return
    try {
      setStatusModal((prev) => ({ ...prev, loading: true }))
      await yeuCauAPI.updateStatus(statusModal.requestId, {
        trang_thai: statusModal.nextStatus,
        nguoi_xu_ly_id: String(user?.id || '1'),
        ghi_chu_xu_ly: statusModal.note
      })
      toast.success('Cập nhật trạng thái thành công!')
      setStatusModal({ isOpen: false, requestId: null, nextStatus: '', note: '', loading: false })
      await fetchYeuCaus()
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái')
      setStatusModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const resolveCreatorName = (yeuCau) => {
    if (yeuCau.nguoi_tao_ten) return yeuCau.nguoi_tao_ten
    if (yeuCau.loai_nguoi_tao === 'gia_su') {
      const tutor = giaSus.find(g => String(g.gia_su_id) === String(yeuCau.nguoi_tao_id))
      return tutor?.ho_ten || `Gia sư #${yeuCau.nguoi_tao_id}`
    }
    if (yeuCau.loai_nguoi_tao === 'phu_huynh') {
      const parent = phuHuynhs.find(p => String(p.phu_huynh_id) === String(yeuCau.nguoi_tao_id))
      return parent?.ho_ten || `Phụ huynh #${yeuCau.nguoi_tao_id}`
    }
    return `ID #${yeuCau.nguoi_tao_id || 'N/A'}`
  }

  const resolveHandlerName = (yeuCau) => {
    if (!yeuCau.nguoi_xu_ly_id) return 'Chưa xử lý'
    if (String(yeuCau.nguoi_xu_ly_id) === String(user?.id)) return user?.ho_ten || user?.name || 'Bạn'
    return `Admin #${yeuCau.nguoi_xu_ly_id}`
  }

  const resolveClassName = (lopHocId) => {
    const lopHoc = lopHocs.find((lop) => String(lop.lop_hoc_id) === String(lopHocId))
    return lopHoc?.ten_lop || `Lớp #${lopHocId || 'N/A'}`
  }

  const buildDynamicFields = (yeuCau) => {
    const fields = [{ label: 'Lớp học', value: resolveClassName(yeuCau.lop_hoc_id) }]

    if (shouldRequireDangKyId(yeuCau.phan_loai)) {
      fields.push({ label: 'Đăng ký ID', value: yeuCau.dang_ky_id || 'N/A' })
    }

    if (shouldRequireGiaSuId(yeuCau.phan_loai)) {
      fields.push({ label: 'Gia sư ID', value: yeuCau.gia_su_id || 'N/A' })
    }

    if (yeuCau.phan_loai === 'mo_lop' && yeuCau.gia_su_id) {
      fields.push({ label: 'Gia sư ID', value: yeuCau.gia_su_id })
    }

    return fields
  }

  const filteredYeuCaus = yeuCaus.filter((yc) => {
    const keyword = searchTerm.toLowerCase()
    return (
      (yc.noi_dung || '').toLowerCase().includes(keyword) ||
      (yc.phan_loai || '').toLowerCase().includes(keyword) ||
      resolveCreatorName(yc).toLowerCase().includes(keyword) ||
      resolveClassName(yc.lop_hoc_id).toLowerCase().includes(keyword)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        <p className="text-gray-500 mt-4">Đang tải dữ liệu yêu cầu...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Yêu cầu hỗ trợ</h2>
            <p className="text-gray-500 text-sm mt-1">Tổng số: {yeuCaus.length} yêu cầu</p>
          </div>
          {user?.role !== 'admin' && (
            <button
              onClick={() => { resetForm(); setShowCreateModal(true) }}
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium"
            >
              <Plus size={18} />
              Thêm yêu cầu mới
            </button>
          )}
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo phân loại, người tạo, tên lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {filteredYeuCaus.length === 0 ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu yêu cầu</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung yêu cầu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin liên quan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Xử lý</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredYeuCaus.map((yc, index) => (
                  <Fragment key={yc.yeu_cau_id}>
                    <tr className="hover:bg-red-50/40 transition-colors duration-200 align-top">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 min-w-[220px]">
                        <p className="font-semibold text-gray-900">{resolveCreatorName(yc)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {yc.loai_nguoi_tao === 'gia_su' ? 'Gia sư' : 'Phụ huynh'} • ID: {yc.nguoi_tao_id || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 min-w-[280px]">
                        <p className="font-semibold text-gray-900 line-clamp-1">{getPhanLoaiLabel(yc.phan_loai)}</p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{yc.noi_dung}</p>
                      </td>
                      <td className="px-6 py-4 min-w-[220px]">
                        <div className="space-y-1.5">
                          {buildDynamicFields(yc).map((field) => (
                            <div key={field.label} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-gray-500">{field.label}</span>
                              <span className="font-medium text-gray-800">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[220px]">
                        <p className="text-sm text-gray-800 font-medium">{resolveHandlerName(yc)}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{yc.ghi_chu_xu_ly || 'Chưa có ghi chú xử lý'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getTrangThaiColor(yc.trang_thai)}`}>
                          {getTrangThaiLabel(yc.trang_thai)}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">{yc.ngay_tao ? new Date(yc.ngay_tao).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      </td>
                    </tr>
                    <tr className="bg-gray-50/70">
                      <td colSpan={6} className="px-6 pb-4 pt-0">
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-end gap-2 whitespace-nowrap">
                          {user?.role === 'admin' && STATUS_ORDER.map((status) => {
                            const isCurrent = status === yc.trang_thai
                            return (
                              <button
                                key={status}
                                onClick={() => !isCurrent && openStatusModal(yc.yeu_cau_id, status)}
                                disabled={isCurrent}
                                className={`inline-flex min-w-[108px] justify-center px-2.5 py-1.5 text-xs rounded-md transition-colors ${getStatusActionButtonClass(status)} ${isCurrent ? 'opacity-60 cursor-not-allowed' : ''}`}
                                title={isCurrent ? 'Trạng thái hiện tại' : `Chuyển sang ${getTrangThaiLabel(status)}`}
                              >
                                {getTrangThaiLabel(status)}
                              </button>
                            )
                          })}

                          <button
                            onClick={() => handleDelete(yc.yeu_cau_id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Tạo yêu cầu mới</h3>
              <button onClick={() => { setShowCreateModal(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người tạo ID</label>
                  <input
                    type="text"
                    value={formData.nguoi_tao_id}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại người tạo</label>
                  <input
                    type="text"
                    value={formData.loai_nguoi_tao === 'gia_su' ? 'Gia sư' : 'Phụ huynh'}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại yêu cầu</label>
                  <select
                    value={formData.phan_loai}
                    onChange={(e) => {
                      const nextType = e.target.value
                      setFormData(normalizeConditionalFields({
                        ...formData,
                        phan_loai: nextType,
                        tieu_de: getAutoTitleByCategory(nextType)
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mo_lop">Mở lớp mới</option>
                    <option value="khac">Khác</option>
                    {formData.loai_nguoi_tao === 'phu_huynh' && (
                      <>
                        <option value="huy_lop">Hủy đăng ký lớp</option>
                        <option value="nghi_hoc">Xin nghỉ học</option>
                      </>
                    )}
                    {formData.loai_nguoi_tao === 'gia_su' && <option value="nghi_day">Xin nghỉ dạy</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học ID <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lop_hoc_id}
                    onChange={(e) => setFormData({ ...formData, lop_hoc_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập lop_hoc_id"
                    required
                  />
                </div>
              </div>

              {shouldRequireDangKyId(formData.phan_loai) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đăng ký ID <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dang_ky_id}
                    onChange={(e) => setFormData({ ...formData, dang_ky_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập dang_ky_id"
                    required
                  />
                </div>
              )}

              {shouldRequireGiaSuId(formData.phan_loai) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gia sư ID <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={formData.gia_su_id}
                    onChange={(e) => setFormData({ ...formData, gia_su_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập gia_su_id"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.noi_dung}
                  onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Mô tả chi tiết yêu cầu của bạn..."
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm() }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Chuyển trạng thái</h3>
              <button
                onClick={() => setStatusModal({ isOpen: false, requestId: null, nextStatus: '', note: '', loading: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-700">
                Trạng thái mới: <span className="font-semibold">{getTrangThaiLabel(statusModal.nextStatus)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú xử lý</label>
                <textarea
                  value={statusModal.note}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, note: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập ghi chú xử lý..."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusModal({ isOpen: false, requestId: null, nextStatus: '', note: '', loading: false })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={statusModal.loading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={statusModal.loading}
                >
                  {statusModal.loading ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
