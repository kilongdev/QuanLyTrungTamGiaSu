import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, DollarSign, User, Calendar, Bell, Eye } from 'lucide-react'
import DataPagination from '@/components/ui/DataPagination'
import { hocPhiAPI } from '@/api/hocPhiApi'
import { dangKyAPI } from "@/api/dangkyApi";
import { toast } from 'sonner'
import { normalizeNumberInputValue } from '@/lib/numberUtils'
import { getAbortSignal } from '@/lib/requestUtils'

const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`

export default function HocPhiManagement({ user }) {
  const [hocPhiData, setHocPhiData] = useState([])
  const [loading, setLoading] = useState(false)
  const submitRef = useRef({ isSubmitting: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentHocPhi, setCurrentHocPhi] = useState(null)
  const [formData, setFormData] = useState({ 
    dang_ky_id: '', 
    so_tien: '', 
    so_buoi_da_hoc: 0, 
    trang_thai_thanh_toan: 'chua_thanh_toan',
    hoc_sinh_id: '',
    ngay_den_han: ''
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, hocPhi: null, loading: false })
  const [dangKyList, setDangKyList] = useState([])
  const [dangKySearch, setDangKySearch] = useState('')
  const [quaHanModal, setQuaHanModal] = useState({ isOpen: false, loading: false, count: 0 })
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, loading: false })
  
  // State cho việc chọn học sinh và lớp
  const [hocSinhList, setHocSinhList] = useState([])
  const [selectedHocSinh, setSelectedHocSinh] = useState(null)
  const [lopCuaHocSinh, setLopCuaHocSinh] = useState([])
  const [selectedLop, setSelectedLop] = useState(null)

  useEffect(() => {
    fetchHocPhiData(true)
    fetchDangKyList()
    fetchHocSinhList()
  }, [])
  
  // Fetch danh sách học sinh
  const fetchHocSinhList = async () => {
    try {
      const response = await fetch(`${API_BASE}/hocsinh?limit=500`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.status === 'success' || data.success) {
        setHocSinhList(data.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải danh sách học sinh:', error)
    }
  }

  // Mở modal xác nhận gửi thông báo quá hạn
  const handleOpenQuaHanModal = () => {
    setQuaHanModal({ isOpen: true, loading: false, count: 0 })
  }

  // Gửi thông báo quá hạn sau khi xác nhận
  const handleConfirmSendQuaHan = async () => {
    setQuaHanModal(prev => ({ ...prev, loading: true }))
    try {
      const result = await hocPhiAPI.sendOverdueNotifications()
      if (result.success) {
        setQuaHanModal({ isOpen: false, loading: false, count: result.data?.count || 0 })
        toast.success(result.message || 'Đã gửi thông báo học phí quá hạn!')
      } else {
        toast.error(result.message || 'Lỗi gửi thông báo')
        setQuaHanModal(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast.error('Lỗi khi gửi thông báo học phí quá hạn')
      setQuaHanModal(prev => ({ ...prev, loading: false }))
    }
  }

  // Xem chi tiết học phí
  const handleViewDetail = async (item) => {
    setDetailModal({ isOpen: true, data: null, loading: true })
    try {
      console.log('Fetching detail for hoc_phi_id:', item.hoc_phi_id)
      const response = await hocPhiAPI.getDetail(item.hoc_phi_id)
      console.log('Detail response:', response)
      if (response.success) {
        setDetailModal({ isOpen: true, data: response.data, loading: false })
      } else {
        toast.error(response.message || 'Không thể tải chi tiết học phí')
        setDetailModal({ isOpen: false, data: null, loading: false })
      }
    } catch (error) {
      console.error('Lỗi tải chi tiết:', error)
      toast.error('Lỗi tải chi tiết học phí: ' + (error.message || 'Unknown error'))
      setDetailModal({ isOpen: false, data: null, loading: false })
    }
  }

  const fetchDangKyList = async () => {
    try {
      const response = await dangKyAPI.getAll()
      if (response.status === 'success') {
        setDangKyList(response.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải danh sách đăng ký:', error)
    }
  }

  const fetchHocPhiData = async (runOverdueCheck = false) => {
    try {
      setLoading(true)
      // Chỉ kiểm tra quá hạn ở lần vào trang để tránh làm chậm các thao tác cập nhật.
      if (runOverdueCheck) {
        await hocPhiAPI.checkOverdue()
      }
      // Sau đó lấy dữ liệu
      const data = await hocPhiAPI.getAll()
      if (data.success) {
        setHocPhiData(data.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu học phí:', error)
      toast.error('Lỗi tải dữ liệu học phí')
    } finally {
      setLoading(false)
    }
  }

  const filteredHocPhiData = hocPhiData.filter((item) => {
    const keyword = searchTerm.toLowerCase().trim()
    const tenHocSinh = String(item.ten_hocsinh || '').toLowerCase()
    const thang = String(item.thang || '').toLowerCase()
    const trangThai = String(item.trang_thai || '').toLowerCase()

    const keywordMatch = !keyword || tenHocSinh.includes(keyword) || thang.includes(keyword) || trangThai.includes(keyword)
    const monthMatch = selectedMonth === 'all' || String(item.thang || '') === selectedMonth
    const statusMatch = selectedStatus === 'all' || String(item.trang_thai || '') === selectedStatus

    return keywordMatch && monthMatch && statusMatch
  })

  const monthOptions = [...new Set(hocPhiData.map((item) => String(item.thang || '').trim()).filter(Boolean))]
  const statusOptions = [...new Set(hocPhiData.map((item) => String(item.trang_thai || '').trim()).filter(Boolean))]

  const totalPages = Math.max(1, Math.ceil(filteredHocPhiData.length / itemsPerPage))
  const paginatedHocPhiData = filteredHocPhiData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, selectedStatus])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize)
    setCurrentPage(1)
  }

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add')
    setCurrentHocPhi(null)
    setFormData({ dang_ky_id: '', so_tien: '', so_buoi_da_hoc: 0, trang_thai_thanh_toan: 'chua_thanh_toan', hoc_sinh_id: '', ngay_den_han: '' })
    setSelectedHocSinh(null)
    setLopCuaHocSinh([])
    setSelectedLop(null)
    setIsModalOpen(true)
  }

  // Khi chọn học sinh, lọc các lớp đã duyệt của học sinh đó
  const handleHocSinhChange = (hocSinhId) => {
    const hs = hocSinhList.find(h => h.hoc_sinh_id == hocSinhId)
    setSelectedHocSinh(hs)
    setFormData({ ...formData, hoc_sinh_id: hocSinhId, dang_ky_id: '', so_tien: '' })
    setSelectedLop(null)
    
    // Lọc các đăng ký đã duyệt của học sinh này
    const lopList = dangKyList.filter(dk => dk.hoc_sinh_id == hocSinhId && dk.trang_thai === 'da_duyet')
    setLopCuaHocSinh(lopList)
  }

  // Khi chọn lớp, tự động điền số tiền theo khóa
  const handleLopChange = (dangKyId) => {
    const lop = lopCuaHocSinh.find(l => l.dang_ky_id == dangKyId)
    setSelectedLop(lop)
    // Tự động điền số tiền = gia_toan_khoa
    const soTien = normalizeNumberInputValue(lop?.gia_toan_khoa)
    setFormData({ ...formData, dang_ky_id: dangKyId, so_tien: soTien })
  }

  const handleEdit = (hocPhi) => {
    setModalMode('edit')
    setCurrentHocPhi(hocPhi)
    
    // Tìm thông tin đăng ký để lấy thông tin lớp
    const dk = dangKyList.find(d => d.dang_ky_id == hocPhi.dang_ky_id)
    setSelectedLop(dk || null)
    
    setFormData({
      dang_ky_id: hocPhi.dang_ky_id || '',
      so_tien: normalizeNumberInputValue(hocPhi.so_tien),
      so_buoi_da_hoc: hocPhi.so_buoi_da_hoc || 0,
      trang_thai_thanh_toan: hocPhi.trang_thai || 'chua_thanh_toan',
      ngay_den_han: hocPhi.ngay_den_han || ''
    })
    setIsModalOpen(true)
  }

  // Format số tiền khi hiển thị
  const formatSoTien = (value) => {
    if (!value) return ''
    return parseInt(value).toLocaleString('vi-VN')
  }

  // Parse số tiền từ input
  const parseSoTien = (value) => {
    return value.replace(/[^0-9]/g, '')
  }

  // Tính số tiền khi thay đổi số buổi (dùng cho cả add và edit)
  const handleSoBuoiChange = (soBuoi) => {
    if (selectedLop && selectedLop.gia_moi_buoi) {
      const soTien = parseInt(soBuoi || 0) * parseInt(selectedLop.gia_moi_buoi || 0)
      setFormData({ ...formData, so_buoi_da_hoc: soBuoi, so_tien: soTien })
    } else {
      setFormData({ ...formData, so_buoi_da_hoc: soBuoi })
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (submitRef.current.isSubmitting) return
    submitRef.current.isSubmitting = true
    const signal = getAbortSignal(`hoc-phi-submit-${modalMode}-${currentHocPhi?.hoc_phi_id || 'new'}`)

    if (!formData.dang_ky_id || !formData.so_tien) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      submitRef.current.isSubmitting = false
      return
    }

    setModalLoading(true)
    try {
      if (modalMode === 'edit') {
        const res = await hocPhiAPI.updateStatus(currentHocPhi.hoc_phi_id, {
          trang_thai_thanh_toan: formData.trang_thai_thanh_toan,
          ngay_den_han: formData.ngay_den_han
        }, { signal })
        if (res.success) {
          toast.success('Cập nhật học phí thành công!')
          setIsModalOpen(false)
          fetchHocPhiData()
        } else {
          toast.error(res.message || 'Lỗi cập nhật')
        }
      } else {
        const res = await hocPhiAPI.create(formData, { signal })
        if (res.success) {
          toast.success('Thêm học phí thành công!')
          setIsModalOpen(false)
          fetchHocPhiData()
        } else {
          toast.error(res.message || 'Lỗi thêm học phí')
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        submitRef.current.isSubmitting = false
        return
      }
      toast.error(error.message || 'Lỗi thao tác')
    } finally {
      setModalLoading(false)
      submitRef.current.isSubmitting = false
    }
  }

  const handleDelete = (hocPhi) => {
    setConfirmModal({ isOpen: true, hocPhi: hocPhi, loading: false })
  }

  const executeDelete = async () => {
    if (!confirmModal.hocPhi) return

    setConfirmModal(prev => ({ ...prev, loading: true }))
    try {
      await hocPhiAPI.delete(confirmModal.hocPhi.hoc_phi_id)
      toast.success('Xóa học phí thành công!')
      fetchHocPhiData()
      setConfirmModal({ isOpen: false, hocPhi: null, loading: false })
    } catch (error) {
      toast.error(error.message || 'Lỗi xóa học phí')
      setConfirmModal(prev => ({ ...prev, loading: false }))
    }
  }

  // Filter đăng ký list based on search
  const filteredDangKyList = dangKyList.filter((dk) => {
    const search = dangKySearch.toLowerCase().trim()
    if (!search) return true
    const tenHocSinh = String(dk.ten_hoc_sinh || '').toLowerCase()
    const tenLop = String(dk.ten_lop || '').toLowerCase()
    const tenMonHoc = String(dk.ten_mon_hoc || '').toLowerCase()
    return tenHocSinh.includes(search) || tenLop.includes(search) || tenMonHoc.includes(search)
  })

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Học phí</h2>
            <p className="text-gray-500 text-sm mt-1">Theo dõi học phí theo học sinh, tháng và trạng thái thanh toán</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenQuaHanModal}
              className="flex items-center gap-2 border border-yellow-500 text-yellow-700 hover:bg-yellow-50 px-4 py-2.5 rounded-2xl transition font-medium"
              title="Gửi thông báo học phí quá hạn"
            >
              <Bell className="w-5 h-5" />
              Thông báo quá hạn
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium">
              <Plus className="w-5 h-5" />
              Thêm học phí
            </button>
          </div>
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
              />
            </div>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="md:w-56 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả tháng</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="md:w-64 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'da_thanh_toan' ? 'Đã thanh toán' : 
                   status === 'qua_han' ? 'Quá hạn' : 'Chưa thanh toán'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredHocPhiData.length === 0 ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu học phí</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc nâng cao</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedHocPhiData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50/40 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.ten_hocsinh || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{parseInt(item.so_tien || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.thang || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.trang_thai === 'da_thanh_toan' 
                          ? 'bg-blue-100 text-blue-800' 
                          : item.trang_thai === 'qua_han'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.trang_thai === 'da_thanh_toan' 
                          ? 'Đã thanh toán' 
                          : item.trang_thai === 'qua_han'
                          ? 'Quá hạn'
                          : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.ngay_tao || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(item)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
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
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredHocPhiData.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="học phí"
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all overflow-hidden border border-gray-200">
            <div className="p-5 flex justify-between items-center border-b bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Cập nhật học phí' : 'Thêm học phí mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {modalMode === 'add' && (
                  <>
                    {/* Chọn học sinh */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <User size={14} /> Chọn học sinh <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.hoc_sinh_id}
                        onChange={(e) => handleHocSinhChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="">-- Chọn học sinh --</option>
                        {hocSinhList.map((hs) => (
                          <option key={hs.hoc_sinh_id} value={hs.hoc_sinh_id}>
                            {hs.ho_ten || `HS ID: ${hs.hoc_sinh_id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chọn lớp học */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar size={14} /> Chọn lớp học <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.dang_ky_id}
                        onChange={(e) => handleLopChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={!formData.hoc_sinh_id}
                      >
                        <option value="">-- Chọn lớp học --</option>
                        {lopCuaHocSinh.map((lop) => (
                          <option key={lop.dang_ky_id} value={lop.dang_ky_id}>
                            {lop.ten_lop} {lop.ten_mon_hoc ? `(${lop.ten_mon_hoc})` : ''} - Học phí: {parseInt(lop.gia_toan_khoa || 0).toLocaleString('vi-VN')} đ/khóa
                          </option>
                        ))}
                      </select>
                      {!formData.hoc_sinh_id && (
                        <p className="text-xs text-gray-500 mt-1">Vui lòng chọn học sinh trước</p>
                      )}
                      {formData.hoc_sinh_id && lopCuaHocSinh.length === 0 && (
                        <p className="text-xs text-yellow-600 mt-1">Học sinh này chưa có lớp nào được duyệt</p>
                      )}
                    </div>

                    {/* Hiển thị số tiền theo khóa */}
                    {selectedLop && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Thông tin học phí</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-700">
                            Số buổi khóa: <span className="font-bold">{selectedLop.so_buoi_hoc || 0} buổi</span>
                          </p>
                          <p className="text-blue-700">
                            Học phí khóa: <span className="font-bold">{parseInt(selectedLop.gia_toan_khoa || 0).toLocaleString('vi-VN')} đ</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hạn thanh toán */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar size={14} /> Hạn thanh toán
                      </label>
                      <input
                        type="date"
                        value={formData.ngay_den_han}
                        onChange={(e) => setFormData({ ...formData, ngay_den_han: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Để trống = 30 ngày sau"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mặc định: 30 ngày sau ngày tạo</p>
                    </div>
                  </>
                )}

                {modalMode === 'edit' && (
                  <>
                    {/* Thông tin học phí khóa */}
                    {selectedLop && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Thông tin học phí khóa</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-700">
                            Số buổi khóa: <span className="font-bold">{selectedLop.so_buoi_hoc || 0} buổi</span>
                          </p>
                          <p className="text-blue-700">
                            Học phí khóa: <span className="font-bold">{parseInt(selectedLop.gia_toan_khoa || 0).toLocaleString('vi-VN')} đ</span>
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Số tiền - chỉ hiển thị, không sửa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <DollarSign size={14} /> Số tiền học phí
                      </label>
                      <input
                        type="text"
                        value={formatSoTien(formData.so_tien)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>

                    {/* Hạn thanh toán */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar size={14} /> Hạn thanh toán
                      </label>
                      <input
                        type="date"
                        value={formData.ngay_den_han || ''}
                        onChange={(e) => setFormData({ ...formData, ngay_den_han: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                  <select
                    value={formData.trang_thai_thanh_toan}
                    onChange={(e) => setFormData({ ...formData, trang_thai_thanh_toan: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="chua_thanh_toan">Chưa thanh toán</option>
                    <option value="da_thanh_toan">Đã thanh toán</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {modalMode === 'edit' ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-0 text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Xác nhận xóa học phí
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Bạn có chắc chắn muốn xóa học phí của học sinh <span className="font-bold">"{confirmModal.hocPhi?.ten_hocsinh}"</span>?
                    </p>
                    <p className="text-sm text-red-600 mt-1">Hành động này không thể được hoàn tác.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, hocPhi: null, loading: false })}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                disabled={confirmModal.loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={confirmModal.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {confirmModal.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Send Overdue Notification Modal */}
      {quaHanModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Bell className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div className="mt-0 text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Gửi thông báo học phí quá hạn
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Hệ thống sẽ gửi thông báo đến <span className="font-bold text-yellow-600">phụ huynh</span> của các học sinh có học phí quá hạn.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Đồng thời thông báo cũng sẽ được gửi đến <span className="font-bold">admin</span>.
                    </p>
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      Bạn có chắc chắn muốn gửi thông báo?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setQuaHanModal({ isOpen: false, loading: false, count: 0 })}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                disabled={quaHanModal.loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSendQuaHan}
                disabled={quaHanModal.loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {quaHanModal.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-gradient-to-r from-red-700 to-red-800">
              <h3 className="text-xl font-bold text-white">Chi tiết học phí</h3>
              <button 
                onClick={() => setDetailModal({ isOpen: false, data: null, loading: false })} 
                className="text-white/80 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          
          {detailModal.loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : detailModal.data ? (
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Thông tin học phí */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Thông tin học phí</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Số tiền</p>
                      <p className="font-bold text-red-700">{parseInt(detailModal.data.so_tien || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Trạng thái</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        detailModal.data.trang_thai_thanh_toan === 'da_thanh_toan' 
                          ? 'bg-blue-100 text-blue-800' 
                          : detailModal.data.trang_thai_thanh_toan === 'qua_han'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {detailModal.data.trang_thai_thanh_toan === 'da_thanh_toan' 
                          ? 'Đã thanh toán' 
                          : detailModal.data.trang_thai_thanh_toan === 'qua_han'
                          ? 'Quá hạn'
                          : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày tạo</p>
                      <p className="font-medium">{detailModal.data.ngay_tao || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hạn thanh toán</p>
                      <p className="font-medium">{detailModal.data.ngay_den_han || 'N/A'}</p>
                    </div>
                    {detailModal.data.ngay_thanh_toan && (
                      <div>
                        <p className="text-xs text-gray-500">Ngày thanh toán</p>
                        <p className="font-medium">{detailModal.data.ngay_thanh_toan}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin học sinh và phụ huynh */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Thông tin học sinh</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="font-medium">{detailModal.data.ten_hoc_sinh || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lớp học</p>
                      <p className="font-medium">{detailModal.data.ten_lop || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Môn học</p>
                      <p className="font-medium">{detailModal.data.ten_mon_hoc || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phụ huynh</p>
                      <p className="font-medium">{detailModal.data.ten_phu_huynh || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
