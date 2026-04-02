import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Eye, X, AlertTriangle } from 'lucide-react'
import DataPagination from '@/components/ui/DataPagination'
import { toast } from 'sonner'
import { luongGiaSuAPI } from '@/api/luongGiaSuApi'
import { doanhThuAPI } from '@/api/doanhThuApi'

const API_BASE = `${import.meta.env.VITE_API_URL || 'https://quanlytrungtamgiasu.onrender.com/api'}`

// Component hiển thị badge trạng thái thanh toán
function StatusBadge({ status, edited }) {
  const statusConfig = {
    da_thanh_toan: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã thanh toán' },
    qua_han: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Quá hạn' },
    chua_thanh_toan: { bg: 'bg-red-100', text: 'text-red-800', label: 'Chưa thanh toán' }
  }
  const config = statusConfig[status] || statusConfig.chua_thanh_toan
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
      {edited && <span className="ml-1">*</span>}
    </span>
  )
}

export default function LuongGiaSuManagement({ user }) {
  const [luongData, setLuongData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTutor, setSelectedTutor] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Data for dropdowns
  const [giaSuList, setGiaSuList] = useState([])
  const [lopHocList, setLopHocList] = useState([])
  const [selectedLopHoc, setSelectedLopHoc] = useState(null)

  // Modal states
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, loading: false })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    gia_su_id: '',
    lop_hoc_id: '',
    thang: '',
    nam: new Date().getFullYear(),
    ngay_den_han: ''
  })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, luong: null, loading: false })
  const [editGroupModal, setEditGroupModal] = useState({ isOpen: false, data: null, loading: false })
  const [editLopData, setEditLopData] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null, selectedIds: [], loading: false, confirmDelete: false })

  useEffect(() => {
    fetchLuongData()
    fetchGiaSuList()
    fetchLopHocList()
  }, [])

  const fetchGiaSuList = async () => {
    try {
      const response = await fetch(`${API_BASE}/giasu?limit=100`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.status === 'success') setGiaSuList(data.data || [])
    } catch (error) {
      console.error('Lỗi tải danh sách gia sư:', error)
    }
  }

  const fetchLopHocList = async () => {
    try {
      const response = await fetch(`${API_BASE}/lophoc`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.status === 'success') setLopHocList(data.data || [])
    } catch (error) {
      console.error('Lỗi tải danh sách lớp học:', error)
    }
  }

  const fetchLuongData = async (runOverdueCheck = true) => {
    try {
      setLoading(true)
      if (runOverdueCheck) {
        // Kiểm tra và cập nhật lương quá hạn trước
        try {
          await luongGiaSuAPI.checkOverdue()
        } catch (overdueError) {
          console.warn('Không thể kiểm tra lương quá hạn:', overdueError)
        }
      }

      // Sau đó lấy dữ liệu
      const response = await luongGiaSuAPI.getAll()
      if (response.success) {
        setLuongData(response.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu lương:', error)
      toast.error('Lỗi tải dữ liệu lương')
    } finally {
      setLoading(false)
    }
  }

  // Xem chi tiết
  const handleViewDetail = async (item) => {
    setDetailModal({ isOpen: true, data: null, loading: true })
    try {
      console.log('Fetching detail for:', item.gia_su_id, item.thang, item.nam)
      const response = await luongGiaSuAPI.getDetailByGroup(item.gia_su_id, item.thang, item.nam)
      console.log('Detail response:', response)
      if (response.success) {
        setDetailModal({ isOpen: true, data: response.data, loading: false })
      } else {
        toast.error(response.message || 'Không thể tải chi tiết')
        setDetailModal({ isOpen: false, data: null, loading: false })
      }
    } catch (error) {
      console.error('Detail error:', error)
      toast.error('Lỗi tải chi tiết')
      setDetailModal({ isOpen: false, data: null, loading: false })
    }
  }

  // Mở modal thêm
  const handleOpenAddModal = () => {
    setModalMode('add')
    setFormData({
      gia_su_id: '',
      lop_hoc_id: '',
      thang: new Date().getMonth() + 1,
      nam: new Date().getFullYear(),
      ngay_den_han: ''
    })
    setSelectedLopHoc(null)
    setIsModalOpen(true)
  }

  // Mở modal sửa - hiển thị danh sách lớp trong nhóm
  const handleEdit = async (item) => {
    setEditGroupModal({ isOpen: true, data: null, loading: true })
    try {
      const response = await luongGiaSuAPI.getDetailByGroup(item.gia_su_id, item.thang, item.nam)
      if (response.success) {
        setEditGroupModal({ isOpen: true, data: response.data, loading: false })
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu')
        setEditGroupModal({ isOpen: false, data: null, loading: false })
      }
    } catch (error) {
      toast.error('Lỗi tải dữ liệu')
      setEditGroupModal({ isOpen: false, data: null, loading: false })
    }
  }

  // Cập nhật trạng thái một lớp
  const handleUpdateLopStatus = async (luongId, newStatus) => {
    try {
      const response = await luongGiaSuAPI.update(luongId, { trang_thai_thanh_toan: newStatus })
      if (response.success) {
        toast.success('Cập nhật thành công!')
        // Refresh data
        if (editGroupModal.data) {
          const updatedList = editGroupModal.data.danh_sach_lop.map(lop => 
            lop.luong_id === luongId ? { ...lop, trang_thai_thanh_toan: newStatus } : lop
          )
          setEditGroupModal(prev => ({
            ...prev,
            data: { ...prev.data, danh_sach_lop: updatedList }
          }))
        }
        fetchLuongData()
      } else {
        toast.error(response.message || 'Lỗi cập nhật')
      }
    } catch (error) {
      toast.error('Lỗi cập nhật')
    }
  }

  // State cho việc chỉnh sửa số buổi và trạng thái thanh toán
  const [editedSoBuoi, setEditedSoBuoi] = useState({})
  const [editedTrangThai, setEditedTrangThai] = useState({})
  const [editedNgayDenHan, setEditedNgayDenHan] = useState({})

  // Cập nhật số buổi của một lớp
  const handleUpdateSoBuoi = (luongId, soBuoi) => {
    setEditedSoBuoi(prev => ({
      ...prev,
      [luongId]: soBuoi
    }))
  }

  // Cập nhật ngày đến hạn
  const handleUpdateNgayDenHan = (luongId, ngayDenHan) => {
    setEditedNgayDenHan(prev => ({
      ...prev,
      [luongId]: ngayDenHan
    }))
  }

  // Cập nhật trạng thái thanh toán local (chưa lưu vào DB)
  const handleToggleTrangThai = (luongId, currentStatus) => {
    // Nếu đã thanh toán → hoàn tác sang chưa thanh toán
    // Nếu chưa thanh toán hoặc quá hạn → thanh toán
    const newStatus = currentStatus === 'da_thanh_toan' ? 'chua_thanh_toan' : 'da_thanh_toan'
    setEditedTrangThai(prev => ({
      ...prev,
      [luongId]: newStatus
    }))
  }

  // Lưu tất cả thay đổi (số buổi + trạng thái thanh toán + ngày đến hạn)
  const handleSaveAllChanges = async () => {
    const soBuoiIds = Object.keys(editedSoBuoi)
    const trangThaiIds = Object.keys(editedTrangThai)
    const ngayDenHanIds = Object.keys(editedNgayDenHan)
    
    if (soBuoiIds.length === 0 && trangThaiIds.length === 0 && ngayDenHanIds.length === 0) {
      toast.info('Không có thay đổi để lưu')
      return
    }
    
    try {
      const promises = []
      
      // Lưu thay đổi số buổi
      soBuoiIds.forEach(luongId => {
        const trangThai = editedTrangThai[luongId] // có thể undefined
        const ngayDenHan = editedNgayDenHan[luongId] // có thể undefined
        const updateData = {
          so_buoi_day: editedSoBuoi[luongId],
          skip_revenue_sync: true,
          skip_notifications: true
        }
        if (trangThai) {
          updateData.trang_thai_thanh_toan = trangThai
        }
        if (ngayDenHan) {
          updateData.ngay_den_han = ngayDenHan
        }
        promises.push(luongGiaSuAPI.update(parseInt(luongId), updateData))
      })
      
      // Lưu thay đổi trạng thái (những cái chưa được lưu ở trên)
      trangThaiIds.forEach(luongId => {
        if (!soBuoiIds.includes(luongId)) {
          const ngayDenHan = editedNgayDenHan[luongId]
          const updateData = {
            trang_thai_thanh_toan: editedTrangThai[luongId],
            skip_revenue_sync: true,
            skip_notifications: true
          }
          if (ngayDenHan) {
            updateData.ngay_den_han = ngayDenHan
          }
          promises.push(luongGiaSuAPI.update(parseInt(luongId), updateData))
        }
      })
      
      // Lưu thay đổi ngày đến hạn (những cái chưa được lưu ở trên)
      ngayDenHanIds.forEach(luongId => {
        if (!soBuoiIds.includes(luongId) && !trangThaiIds.includes(luongId)) {
          promises.push(luongGiaSuAPI.update(parseInt(luongId), {
            ngay_den_han: editedNgayDenHan[luongId],
            skip_revenue_sync: true,
            skip_notifications: true
          }))
        }
      })
      
      await Promise.all(promises)

      // Đồng bộ doanh thu theo tháng một lần sau khi lưu hàng loạt
      if (editGroupModal.data?.danh_sach_lop?.length) {
        const targets = new Map()

        editGroupModal.data.danh_sach_lop.forEach((lop) => {
          const thang = parseInt(lop.thang)
          const nam = parseInt(lop.nam)

          if (!Number.isNaN(thang) && !Number.isNaN(nam) && thang > 0 && nam > 0) {
            targets.set(`${nam}-${thang}`, { thang, nam })
          }
        })

        if (targets.size > 0) {
          await Promise.all(
            Array.from(targets.values()).map((target) =>
              doanhThuAPI.processMonthly({ thang: target.thang, nam: target.nam })
            )
          )
        }
      }

      toast.success('Đã lưu tất cả thay đổi!')
      
      // Cập nhật UI
      if (editGroupModal.data) {
        const updatedList = editGroupModal.data.danh_sach_lop.map(lop => ({
          ...lop,
          so_buoi_day: editedSoBuoi[lop.luong_id] ?? lop.so_buoi_day,
          trang_thai_thanh_toan: editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan,
          ngay_den_han: editedNgayDenHan[lop.luong_id] ?? lop.ngay_den_han
        }))
        setEditGroupModal(prev => ({
          ...prev,
          data: { ...prev.data, danh_sach_lop: updatedList },
          loading: false
        }))
      }
      setEditedSoBuoi({})
      setEditedTrangThai({})
      setEditedNgayDenHan({})
      fetchLuongData(false)
    } catch (error) {
      toast.error('Lỗi lưu thay đổi')
    }
  }

  // Thanh toán tất cả các lớp trong nhóm (local)
  const handlePayAll = () => {
    if (!editGroupModal.data?.danh_sach_lop) return
    
    const newEditedTrangThai = {}
    editGroupModal.data.danh_sach_lop.forEach(lop => {
      const currentStatus = editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan
      if (currentStatus === 'chua_thanh_toan') {
        newEditedTrangThai[lop.luong_id] = 'da_thanh_toan'
      }
    })
    setEditedTrangThai(prev => ({ ...prev, ...newEditedTrangThai }))
  }

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Validate thang/nam
    if (!formData.thang || !formData.nam) {
      toast.error('Vui lòng nhập tháng và năm')
      return
    }
    
    setModalLoading(true)
    try {
      if (modalMode === 'add') {
        const response = await luongGiaSuAPI.create(formData)
        if (response.success) {
          toast.success('Thêm lương thành công!')
          setIsModalOpen(false)
          fetchLuongData()
        } else {
          toast.error(response.message || 'Lỗi thêm lương')
        }
      } else {
        const response = await luongGiaSuAPI.update(formData.luong_id, formData)
        if (response.success) {
          toast.success('Cập nhật lương thành công!')
          setIsModalOpen(false)
          fetchLuongData()
        } else {
          toast.error(response.message || 'Lỗi cập nhật')
        }
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi thao tác')
    } finally {
      setModalLoading(false)
    }
  }

  // Xóa - mở modal chọn lớp để xóa
  const handleDelete = async (item) => {
    setDeleteModal({ isOpen: true, data: null, selectedIds: [], loading: true })
    try {
      const response = await luongGiaSuAPI.getDetailByGroup(item.gia_su_id, item.thang, item.nam)
      if (response.success) {
        setDeleteModal({ 
          isOpen: true, 
          data: response.data, 
          selectedIds: [],
          loading: false 
        })
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu')
        setDeleteModal({ isOpen: false, data: null, selectedIds: [], loading: false })
      }
    } catch (error) {
      toast.error('Lỗi tải dữ liệu')
      setDeleteModal({ isOpen: false, data: null, selectedIds: [], loading: false })
    }
  }

  // Toggle chọn lớp để xóa
  const handleToggleDeleteId = (luongId) => {
    setDeleteModal(prev => {
      const newSelectedIds = prev.selectedIds.includes(luongId)
        ? prev.selectedIds.filter(id => id !== luongId)
        : [...prev.selectedIds, luongId]
      return { ...prev, selectedIds: newSelectedIds }
    })
  }

  // Chọn tất cả để xóa
  const handleSelectAllDelete = () => {
    if (!deleteModal.data?.danh_sach_lop) return
    const allIds = deleteModal.data.danh_sach_lop.map(lop => lop.luong_id)
    setDeleteModal(prev => ({ ...prev, selectedIds: allIds }))
  }

  // Bỏ chọn tất cả
  const handleDeselectAllDelete = () => {
    setDeleteModal(prev => ({ ...prev, selectedIds: [] }))
  }

  // Thực hiện xóa các lớp đã chọn
  const executeDelete = async () => {
    if (deleteModal.selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp để xóa')
      return
    }

    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      for (const id of deleteModal.selectedIds) {
        await luongGiaSuAPI.delete(id)
      }
      toast.success(`Đã xóa ${deleteModal.selectedIds.length} lương!`)
      fetchLuongData()
      setDeleteModal({ isOpen: false, data: null, selectedIds: [], loading: false, confirmDelete: false })
    } catch (error) {
      toast.error(error.message || 'Lỗi xóa')
      setDeleteModal(prev => ({ ...prev, loading: false, confirmDelete: false }))
    }
  }

  // Hiển thị xác nhận xóa
  const handleConfirmDelete = () => {
    if (deleteModal.selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp để xóa')
      return
    }
    setDeleteModal(prev => ({ ...prev, confirmDelete: true }))
  }

  // Hủy xác nhận xóa
  const handleCancelConfirm = () => {
    setDeleteModal(prev => ({ ...prev, confirmDelete: false }))
  }

  // Filter lop hoc by selected gia su
  const filteredLopHocList = formData.gia_su_id
    ? lopHocList.filter(lop => lop.gia_su_id == formData.gia_su_id)
    : lopHocList

  const handleGiaSuChange = (e) => {
    const giaSuId = e.target.value
    setFormData({ ...formData, gia_su_id: giaSuId, lop_hoc_id: '' })
    setSelectedLopHoc(null)
  }

  const handleLopHocChange = (e) => {
    const lopHocId = e.target.value
    const lop = lopHocList.find(l => l.lop_hoc_id == lopHocId)
    setSelectedLopHoc(lop)
    setFormData({ ...formData, lop_hoc_id: lopHocId })
  }

  const filteredLuongData = luongData.filter((item) => {
    const keyword = searchTerm.toLowerCase().trim()
    const tenGiaSu = String(item.ten_giasu || '').toLowerCase()
    const thangNam = item.thang_nam || `${String(item.thang || 1).padStart(2, '0')}/${item.nam}`

    const keywordMatch = !keyword || tenGiaSu.includes(keyword) || thangNam.includes(keyword)
    const monthMatch = selectedMonth === 'all' || thangNam === selectedMonth
    const tutorMatch = selectedTutor === 'all' || String(item.ten_giasu || '') === selectedTutor
    
    // Lọc theo trạng thái - chuyển sang số để so sánh
    const soLop = parseInt(item.so_lop) || 0
    const soLopQuaHan = parseInt(item.so_lop_qua_han) || 0
    const soLopChuaThanhToan = parseInt(item.so_lop_chua_thanh_toan) || 0
    const soLopDaThanhToan = parseInt(item.so_lop_da_thanh_toan) || 0
    
    let statusMatch = true
    if (selectedStatus === 'qua_han') {
      statusMatch = soLopQuaHan > 0
    } else if (selectedStatus === 'chua_thanh_toan') {
      // Chưa thanh toán: có lớp chưa thanh toán VÀ không có lớp quá hạn
      statusMatch = soLopChuaThanhToan > 0 && soLopQuaHan === 0
    } else if (selectedStatus === 'da_thanh_toan') {
      // Đã thanh toán: tất cả lớp đều đã thanh toán
      statusMatch = soLopDaThanhToan === soLop && soLop > 0
    }

    return keywordMatch && monthMatch && tutorMatch && statusMatch
  })

  const monthOptions = [...new Set(luongData.map((item) => item.thang_nam || `${String(item.thang || 1).padStart(2, '0')}/${item.nam}`).filter(Boolean))]
  const tutorOptions = [...new Set(luongData.map((item) => String(item.ten_giasu || '').trim()).filter(Boolean))]

  const totalPages = Math.max(1, Math.ceil(filteredLuongData.length / itemsPerPage))
  const paginatedLuongData = filteredLuongData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, selectedTutor, selectedStatus])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize)
    setCurrentPage(1)
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Lương Gia sư</h2>
            <p className="text-gray-500 text-sm mt-1">Theo dõi chi trả lương và trạng thái thanh toán gia sư</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium">
            <Plus className="w-5 h-5" />
            Thêm lương
          </button>
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo gia sư..."
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
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              className="md:w-64 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả gia sư</option>
              {tutorOptions.map((tutor) => (
                <option key={tutor} value={tutor}>{tutor}</option>
              ))}
            </select>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="md:w-48 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="qua_han">Quá hạn</option>
              <option value="chua_thanh_toan">Chưa thanh toán</option>
              <option value="da_thanh_toan">Đã thanh toán</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredLuongData.length === 0 ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu bảng lương</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc nâng cao</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gia sư</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số lớp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng lương</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tháng/Năm</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLuongData.map((item, idx) => (
                  <tr key={`${item.gia_su_id}-${item.thang}-${item.nam}`} className="hover:bg-red-50/40 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.ten_giasu || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.so_lop || 1} lớp</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{parseInt(item.tong_luong || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.thang_nam || `${String(item.thang || 1).padStart(2, '0')}/${item.nam}`}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.so_lop_qua_han > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Quá hạn ({item.so_lop_qua_han})
                        </span>
                      ) : item.so_lop_chua_thanh_toan > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Chưa thanh toán ({item.so_lop_chua_thanh_toan})
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Đã thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(item)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Chỉnh sửa">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Xóa">
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
          totalItems={filteredLuongData.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="bảng lương"
        />
      </div>

      {/* Detail Modal */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-gradient-to-r from-red-700 to-red-800">
              <h3 className="text-xl font-bold text-white">Chi tiết lương gia sư</h3>
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
                {/* Thông tin gia sư */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Thông tin gia sư</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Họ tên</p>
                      <p className="font-medium">{detailModal.data.ten_giasu || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{detailModal.data.so_dien_thoai || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{detailModal.data.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Tổng lương */}
                <div className="bg-red-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Tổng lương</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Tháng/Năm</p>
                      <p className="font-medium">{String(detailModal.data.thang || 1).padStart(2, '0')}/{detailModal.data.nam}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số lớp dạy</p>
                      <p className="font-medium">{detailModal.data.so_lop || 0} lớp</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tổng lương</p>
                      <p className="font-bold text-red-700 text-lg">{parseInt(detailModal.data.tong_luong || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                </div>

                {/* Danh sách lớp */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Chi tiết từng lớp</h4>
                  {detailModal.data.danh_sach_lop && detailModal.data.danh_sach_lop.length > 0 ? (
                    <div className="space-y-3">
                      {detailModal.data.danh_sach_lop.map((lop, idx) => (
                        <div key={lop.luong_id || idx} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{lop.ten_lop || `Lớp #${lop.lop_hoc_id}`}</p>
                              <p className="text-xs text-gray-500">{lop.ten_mon_hoc || 'N/A'}</p>
                            </div>
                            <p className="font-bold text-red-700">{parseInt(lop.tien_tra_gia_su || 0).toLocaleString('vi-VN')} đ</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-400">Số lượt dạy:</span> {lop.so_buoi_day || 0}
                            </div>
                            <div>
                              <span className="text-gray-400">Loại chi trả:</span> {lop.loai_chi_tra === 'phan_tram' ? `% (${lop.gia_tri_ap_dung}%)` : 'Cố định'}
                            </div>
                            <div>
                              <span className="text-gray-400">Đến hạn:</span> {lop.ngay_den_han || 'Chưa đặt'}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <StatusBadge status={lop.trang_thai_thanh_toan} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editGroupModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-gradient-to-r from-red-700 to-red-800">
              <h3 className="text-xl font-bold text-white">Cập nhật lương gia sư</h3>
              <button 
                onClick={() => setEditGroupModal({ isOpen: false, data: null, loading: false })} 
                className="text-white/80 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          
            {editGroupModal.loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : editGroupModal.data ? (
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Thông tin gia sư */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{editGroupModal.data.ten_giasu || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">Tháng {String(editGroupModal.data.thang || 1).padStart(2, '0')}/{editGroupModal.data.nam}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tổng lương</p>
                      <p className="font-bold text-red-700 text-lg">{parseInt(editGroupModal.data.tong_luong || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                </div>

                {/* Danh sách lớp với nút cập nhật */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">Danh sách lớp ({editGroupModal.data.so_lop || 0} lớp)</h4>
                  {editGroupModal.data.danh_sach_lop && editGroupModal.data.danh_sach_lop.length > 0 ? (
                    editGroupModal.data.danh_sach_lop.map((lop, idx) => (
                      <div key={lop.luong_id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{lop.ten_lop || `Lớp #${lop.lop_hoc_id}`}</p>
                            <p className="text-xs text-gray-500">{lop.ten_mon_hoc || 'N/A'}</p>
                          </div>
                          <p className="font-bold text-red-700">{parseInt(lop.tien_tra_gia_su || 0).toLocaleString('vi-VN')} đ</p>
                        </div>
                        
                        {/* Số lượt dạy (tự động từ điểm danh) */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                          <label className="text-sm text-gray-600">Số lượt dạy:</label>
                          <span className="font-medium text-gray-900">{lop.so_buoi_day || 0}</span>
                          <span className="text-xs text-gray-500">(tự động từ điểm danh)</span>
                        </div>
                        
                        {/* Ngày đến hạn */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                          <label className="text-sm text-gray-600">Ngày đến hạn:</label>
                          <input
                            type="date"
                            value={editedNgayDenHan[lop.luong_id] ?? lop.ngay_den_han ?? ''}
                            onChange={(e) => handleUpdateNgayDenHan(lop.luong_id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {editedNgayDenHan[lop.luong_id] !== undefined && editedNgayDenHan[lop.luong_id] !== lop.ngay_den_han && (
                            <span className="text-xs text-blue-600">(đã sửa)</span>
                          )}
                        </div>
                        
                        {/* Trạng thái thanh toán */}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                          <StatusBadge 
                            status={editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan} 
                            edited={editedTrangThai[lop.luong_id] && editedTrangThai[lop.luong_id] !== lop.trang_thai_thanh_toan}
                          />
                          <button
                            onClick={() => handleToggleTrangThai(lop.luong_id, editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              (editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan) === 'da_thanh_toan'
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {(editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan) === 'da_thanh_toan' ? 'Hoàn tác' : 'Thanh toán'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
                  )}
                </div>

                {/* Nút thanh toán tất cả */}
                {editGroupModal.data.danh_sach_lop?.some(lop => (editedTrangThai[lop.luong_id] ?? lop.trang_thai_thanh_toan) === 'chua_thanh_toan') && (
                  <div className="mt-4">
                    <button
                      onClick={handlePayAll}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition"
                    >
                      Thanh toán tất cả
                    </button>
                  </div>
                )}

                {/* Nút lưu thay đổi */}
                {(Object.keys(editedSoBuoi).length > 0 || Object.keys(editedTrangThai).length > 0 || Object.keys(editedNgayDenHan).length > 0) && (
                  <div className="mt-4">
                    <button
                      onClick={handleSaveAllChanges}
                      disabled={editGroupModal.loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {editGroupModal.loading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      Lưu thay đổi ({Object.keys(editedSoBuoi).length + Object.keys(editedTrangThai).length + Object.keys(editedNgayDenHan).length} mục)
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-gradient-to-r from-red-700 to-red-800">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'edit' ? 'Cập nhật lương' : 'Thêm lương mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {modalMode === 'add' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gia sư</label>
                      <select
                        value={formData.gia_su_id}
                        onChange={handleGiaSuChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="">-- Chọn gia sư --</option>
                        {giaSuList.map((gs) => (
                          <option key={gs.gia_su_id} value={gs.gia_su_id}>{gs.ho_ten}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
                      <select
                        value={formData.lop_hoc_id}
                        onChange={handleLopHocChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        disabled={!formData.gia_su_id}
                      >
                        <option value="">-- Chọn lớp học --</option>
                        {lopHocList.filter(lop => lop.gia_su_id == formData.gia_su_id).map((lop) => (
                          <option key={lop.lop_hoc_id} value={lop.lop_hoc_id}>
                            {lop.ten_lop || `Lớp #${lop.lop_hoc_id}`} - {lop.khoi_lop}
                          </option>
                        ))}
                      </select>
                      {!formData.gia_su_id && (
                        <p className="text-xs text-gray-500 mt-1">Vui lòng chọn gia sư trước</p>
                      )}
                    </div>
                    {selectedLopHoc && (
                      <div className="p-3 bg-blue-50 rounded-lg text-sm">
                        <p><b>Loại chi trả:</b> {selectedLopHoc.loai_chi_tra === 'phan_tram' ? 'Theo phần trăm' : 'Tiền cụ thể'}</p>
                        {selectedLopHoc.loai_chi_tra === 'phan_tram' ? (
                          <p><b>Công thức:</b> {selectedLopHoc.gia_tri_chi_tra}% × {((selectedLopHoc.gia_moi_buoi || 0)).toLocaleString('vi-VN')} đ/buổi</p>
                        ) : (
                          <p><b>Lương/buổi:</b> {((selectedLopHoc.gia_tri_chi_tra || 0)).toLocaleString('vi-VN')} đ</p>
                        )}
                      </div>
                    )}
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.thang}
                      onChange={(e) => setFormData({ ...formData, thang: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                    <input
                      type="number"
                      value={formData.nam}
                      onChange={(e) => setFormData({ ...formData, nam: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2026"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đến hạn thanh toán</label>
                  <input
                    type="date"
                    value={formData.ngay_den_han || ''}
                    onChange={(e) => setFormData({ ...formData, ngay_den_han: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nếu qua ngày này chưa thanh toán, lương sẽ tự động chuyển sang trạng thái "Quá hạn"</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <b>Lưu ý:</b> Lương sẽ được tính tự động dựa trên số lượt học sinh có mặt trong tháng (từ dữ liệu điểm danh).
                  </p>
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

      {/* Delete Modal - chọn lớp để xóa */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 flex justify-between items-center border-b bg-gradient-to-r from-red-700 to-red-800">
              <h3 className="text-xl font-bold text-white">Xóa lương gia sư</h3>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, data: null, selectedIds: [], loading: false, confirmDelete: false })} 
                className="text-white/80 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          
            {deleteModal.loading ? (
              <div className="p-8 text-center text-gray-500">Đang xóa...</div>
            ) : deleteModal.confirmDelete ? (
              /* Xác nhận xóa */
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Xác nhận xóa</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Bạn có chắc chắn muốn xóa <span className="font-bold text-red-600">{deleteModal.selectedIds.length}</span> lương đã chọn?
                    </p>
                    <p className="text-sm text-red-600 mt-2">Hành động này không thể hoàn tác!</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCancelConfirm}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            ) : deleteModal.data ? (
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Thông tin gia sư */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{deleteModal.data.ten_giasu || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">Tháng {String(deleteModal.data.thang || 1).padStart(2, '0')}/{deleteModal.data.nam}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tổng lương</p>
                      <p className="font-bold text-red-700">{parseInt(deleteModal.data.tong_luong || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                </div>

                {/* Chọn tất cả / Bỏ chọn tất cả */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSelectAllDelete}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={handleDeselectAllDelete}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Bỏ chọn tất cả
                  </button>
                  {deleteModal.selectedIds.length > 0 && (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                      Đã chọn: {deleteModal.selectedIds.length}
                    </span>
                  )}
                </div>

                {/* Danh sách lớp để chọn xóa */}
                <div className="space-y-2">
                  {deleteModal.data.danh_sach_lop && deleteModal.data.danh_sach_lop.length > 0 ? (
                    deleteModal.data.danh_sach_lop.map((lop, idx) => (
                      <div 
                        key={lop.luong_id || idx} 
                        onClick={() => handleToggleDeleteId(lop.luong_id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          deleteModal.selectedIds.includes(lop.luong_id)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              deleteModal.selectedIds.includes(lop.luong_id)
                                ? 'bg-red-500 border-red-500'
                                : 'border-gray-300'
                            }`}>
                              {deleteModal.selectedIds.includes(lop.luong_id) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{lop.ten_lop || `Lớp #${lop.lop_hoc_id}`}</p>
                              <p className="text-xs text-gray-500">{lop.ten_mon_hoc || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-700">{parseInt(lop.tien_tra_gia_su || 0).toLocaleString('vi-VN')} đ</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              lop.trang_thai_thanh_toan === 'da_thanh_toan' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {lop.trang_thai_thanh_toan === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
                  )}
                </div>

                {/* Cảnh báo */}
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Hành động xóa không thể hoàn tác!
                  </p>
                </div>
              </div>
            ) : null}

            {/* Footer - chỉ hiện khi chưa confirm */}
            {!deleteModal.confirmDelete && !deleteModal.loading && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, data: null, selectedIds: [], loading: false, confirmDelete: false })}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteModal.selectedIds.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa ({deleteModal.selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
