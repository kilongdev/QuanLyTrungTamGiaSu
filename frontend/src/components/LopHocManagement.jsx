import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { lopHocAPI } from '../api/lophocApi'
import { monHocAPI } from '../api/monhocApi'
import { giaSuAPI } from '../api/giaSuApi'
import { hocSinhAPI } from '../api/hocSinhApi'
import { diemDanhAPI } from '../api/diemdanhApi'
import { lichHocAPI } from '../api/lichhocApi'
import { Plus, Settings, X, Search, Trash2, Edit2, BookOpen, Layers3, Users, Clock } from 'lucide-react'
import { validateClassForm } from '@/lib/validators'
import { normalizeNumberInputValue } from '@/lib/numberUtils'
import { toast } from 'sonner'

export default function LopHocManagement() {
  const navigate = useNavigate()
  const [lopHocs, setLopHocs] = useState([])
  const [monHocs, setMonHocs] = useState([])
  const [giaSus, setGiaSus] = useState([])
  const [allHocSinh, setAllHocSinh] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(null)
  const [currentViewTab, setCurrentViewTab] = useState(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [addStudentSearchTerm, setAddStudentSearchTerm] = useState('')
  const [classStudents, setClassStudents] = useState([])
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [attendance, setAttendance] = useState([])
  const [attendanceForToday, setAttendanceForToday] = useState({})
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false)
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [createWithSchedule, setCreateWithSchedule] = useState(true)
  const [scheduleForm, setScheduleForm] = useState({
    ngay_bat_dau: '',
    gio_bat_dau: '18:00',
    gio_ket_thuc: '19:30',
    ngay_trong_tuan: []
  })

  const WEEKDAY_OPTIONS = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 8, label: 'Chủ nhật' }
  ]
  const [formData, setFormData] = useState({
    mon_hoc_id: '',
    ten_lop: '',
    gia_su_id: '',
    khoi_lop: '',
    gia_toan_khoa: '',
    so_buoi_hoc: '',
    so_luong_toi_da: '1',
    loai_chi_tra: 'phan_tram',
    gia_tri_chi_tra: '',
    trang_thai: 'sap_mo',
    ngay_ket_thuc: ''
  })

  useEffect(() => {
    fetchLopHocs()
    fetchMonHocs()
    fetchGiaSus()
    fetchAllHocSinh()
  }, [])

  const fetchLopHocs = async () => {
    try {
      setLoading(true)
      const response = await lopHocAPI.getAll()
      setLopHocs(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học:', error)
      toast.error(error.message || 'Không thể tải danh sách lớp học')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonHocs = async () => {
    try {
      const response = await monHocAPI.getAll()
      setMonHocs(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách môn học:', error)
    }
  }

  const fetchGiaSus = async () => {
    try {
      const response = await giaSuAPI.getAll()
      setGiaSus(response.data || [])
    } catch (error) {
      console.error('Lỗi khi tải danh sách gia sư:', error)
    }
  }

  const fetchAllHocSinh = async () => {
    try {
      const response = await hocSinhAPI.getAll({ page: 1, limit: 1000 })
      const students = response.data || []
      setAllHocSinh(students
        .filter(hs => hs && hs.hoc_sinh_id)
        .map(hs => ({
          id: hs.hoc_sinh_id,
          code: `HS${hs.hoc_sinh_id}`,
          name: hs.ho_ten || 'N/A'
        })))
    } catch (error) {
      console.error('Lỗi khi tải danh sách học sinh:', error)
    }
  }

  const fetchAttendanceByClass = async (lopHocId) => {
    try {
      const response = await diemDanhAPI.getByClass(lopHocId)
      const data = response.data || []
      setAttendance(data)
    } catch (error) {
      console.error('Lỗi khi tải điểm danh:', error)
      setAttendance([])
    }
  }

  const addStudentToClass = async (lopHocId, hocSinhId) => {
    try {
      await lopHocAPI.addStudent(lopHocId, hocSinhId)
      const student = allHocSinh.find(s => s.id === hocSinhId)
      setClassStudents([...classStudents, student])
      toast.success('Thêm học sinh vào lớp thành công')
    } catch (error) {
      console.error('Lỗi khi thêm học sinh:', error)
      if (error.status === 404) {
        const student = allHocSinh.find(s => s.id === hocSinhId)
        if (student && !classStudents.find(s => s.id === hocSinhId)) {
          setClassStudents([...classStudents, student])
          toast.success('Thêm học sinh thành công')
        }
      } else {
        toast.error(error.message || 'Không thể thêm học sinh')
      }
    }
  }

  const removeStudentFromClass = async (lopHocId, studentId) => {
    const student = classStudents.find(s => s.id === studentId)
    const confirmDelete = confirm(
      `Bạn có chắc chắn muốn xóa học sinh "${student?.name || 'N/A'}" khỏi lớp này?`
    )

    if (!confirmDelete) return

    try {
      await lopHocAPI.removeStudent(lopHocId, studentId)
      setClassStudents(classStudents.filter(s => s.id !== studentId))
      toast.success('Xóa học sinh khỏi lớp thành công')
    } catch (error) {
      console.error('Lỗi khi xóa học sinh:', error)
      if (error.status === 404) {
        setClassStudents(classStudents.filter(s => s.id !== studentId))
        toast.success('Xóa học sinh thành công')
      } else {
        toast.error(error.message || 'Không thể xóa học sinh')
      }
    }
  }

  const initializeAttendanceForm = () => {
    const initialStatus = {}
    classStudents.forEach(student => {
      initialStatus[student.id] = 'co_mat'
    })
    setAttendanceForToday(initialStatus)
    setShowAttendanceHistory(false)
  }

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceForToday({
      ...attendanceForToday,
      [studentId]: status
    })
  }

  const handleSaveAttendanceForToday = async () => {
    if (!editingId) {
      toast.error('Lỗi: Không tìm thấy ID lớp học')
      return
    }

    const danh_sach = Object.entries(attendanceForToday).map(([hoc_sinh_id, tinh_trang]) => ({
      hoc_sinh_id: parseInt(hoc_sinh_id),
      tinh_trang: tinh_trang
    }))

    if (danh_sach.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một học sinh')
      return
    }

    try {
      setSavingAttendance(true)
      await diemDanhAPI.saveAttendanceForToday(editingId, danh_sach)
      toast.success('Đã lưu điểm danh cho hôm nay!')
      fetchAttendanceByClass(editingId)
      setAttendanceForToday({})
      setShowAttendanceHistory(true)
    } catch (error) {
      console.error('Lỗi khi lưu điểm danh:', error)
      toast.error(error.message || 'Không thể lưu điểm danh')
    } finally {
      setSavingAttendance(false)
    }
  }

  const calculatePricePerSession = (totalPrice, sessions, paymentType, paymentValue) => {
    if (!totalPrice || !sessions || sessions <= 0 || !paymentValue) return 0
    
    const total = parseInt(totalPrice) || 0
    const buois = parseInt(sessions) || 0
    
    if (paymentType === 'phan_tram') {
      const percent = parseInt(paymentValue) || 0
      return Math.round((total * percent / 100) / buois)
    } else if (paymentType === 'tien_cu_the') {
      const amount = parseInt(paymentValue) || 0
      return Math.round((total - amount) / buois)
    }
    return 0
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return parseInt(price).toLocaleString('vi-VN')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.mon_hoc_id) {
      toast.warning('Vui lòng chọn môn học')
      return
    }

    const payload = { ...formData }
    if (!payload.ten_lop?.trim()) {
      const autoName = generateAutoClassName(payload, editingId)
      payload.ten_lop = autoName
      setFormData((prev) => ({ ...prev, ten_lop: autoName }))
    }

    const validationMessage = validateClassForm(payload)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    try {
      if (editingId) {
        await lopHocAPI.update(editingId, payload)
        toast.success('Cập nhật lớp học thành công!')
      } else {
        if (createWithSchedule) {
          if (!scheduleForm.ngay_bat_dau || scheduleForm.ngay_trong_tuan.length === 0) {
            toast.warning('Vui lòng chọn ngày bắt đầu và ít nhất 1 ngày học trong tuần')
            return
          }
          if (!scheduleForm.gio_bat_dau || !scheduleForm.gio_ket_thuc || scheduleForm.gio_bat_dau >= scheduleForm.gio_ket_thuc) {
            toast.warning('Giờ bắt đầu/kết thúc của lịch học không hợp lệ')
            return
          }
        }

        const createResult = await lopHocAPI.create(payload)
        const createdClassId = createResult?.data?.lop_hoc_id

        if (createWithSchedule) {
          if (!createdClassId) {
            throw new Error('Không lấy được ID lớp vừa tạo để tạo lịch học')
          }
          const thoiGianTungNgay = {}
          scheduleForm.ngay_trong_tuan.forEach((thu) => {
            thoiGianTungNgay[thu] = {
              gio_bat_dau: scheduleForm.gio_bat_dau,
              gio_ket_thuc: scheduleForm.gio_ket_thuc
            }
          })
          await lichHocAPI.create({
            lop_hoc_id: createdClassId,
            tao_chu_ky: true,
            ngay_bat_dau: scheduleForm.ngay_bat_dau,
            ngay_trong_tuan: scheduleForm.ngay_trong_tuan,
            thoi_gian_tung_ngay: thoiGianTungNgay
          })
        }
        toast.success('Thêm lớp học thành công!')
      }
      
      setShowModal(false)
      resetForm()
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi lưu lớp học:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi lưu lớp học')
    }
  }

  const handleEdit = (lopHoc) => {
    setEditingId(lopHoc.lop_hoc_id)
    setFormData({
      mon_hoc_id: lopHoc.mon_hoc_id || '',
      ten_lop: lopHoc.ten_lop || '',
      gia_su_id: lopHoc.gia_su_id || '',
      khoi_lop: lopHoc.khoi_lop || '',
      gia_toan_khoa: normalizeNumberInputValue(lopHoc.gia_toan_khoa),
      so_buoi_hoc: normalizeNumberInputValue(lopHoc.so_buoi_hoc),
      so_luong_toi_da: normalizeNumberInputValue(lopHoc.so_luong_toi_da || '1'),
      loai_chi_tra: lopHoc.loai_chi_tra || 'phan_tram',
      gia_tri_chi_tra: normalizeNumberInputValue(lopHoc.gia_tri_chi_tra),
      trang_thai: lopHoc.trang_thai || 'sap_mo',
      ngay_ket_thuc: lopHoc.ngay_ket_thuc ? lopHoc.ngay_ket_thuc.split(' ')[0] : ''
    })
    fetchClassStudents(lopHoc.lop_hoc_id)
    fetchAttendanceByClass(lopHoc.lop_hoc_id)
    setCurrentViewTab('info')
    setShowModal(true)
  }

  const fetchClassStudents = async (lopHocId) => {
    try {
      const response = await lopHocAPI.getStudentsByClass(lopHocId)
      const students = response.data || []
      const mappedStudents = students
        .filter(item => item && item.hoc_sinh_id)
        .map(item => ({
          id: item.hoc_sinh_id,
          code: item.hoc_sinh_id ? `HS${item.hoc_sinh_id}` : 'N/A',
          name: item.ho_ten || 'N/A'
        }))
      setClassStudents(mappedStudents)
    } catch (error) {
      console.error('Lỗi khi tải danh sách học sinh lớp:', error)
      setClassStudents([])
    }
  }

  const resetForm = () => {
    setFormData({
      mon_hoc_id: '',
      ten_lop: '',
      gia_su_id: '',
      khoi_lop: '',
      gia_toan_khoa: '',
      so_buoi_hoc: '',
      loai_chi_tra: 'phan_tram',
      gia_tri_chi_tra: '',
      so_luong_toi_da: '1',
      trang_thai: 'sap_mo',
      ngay_ket_thuc: ''
    })
    setEditingId(null)
    setCurrentViewTab('info')
    setClassStudents([])
    setStudentSearchTerm('')
    setAddStudentSearchTerm('')
    setAttendance([])
    setCreateWithSchedule(true)
    setScheduleForm({
      ngay_bat_dau: '',
      gio_bat_dau: '18:00',
      gio_ket_thuc: '19:30',
      ngay_trong_tuan: []
    })
  }

  const handleOpenModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getMonHocName = (monHocId) => {
    const monHoc = monHocs.find(m => m.mon_hoc_id == monHocId)
    return monHoc ? monHoc.ten_mon_hoc : 'N/A'
  }

  const getGiaSuName = (giaSuId) => {
    const giaSu = giaSus.find(g => g.gia_su_id == giaSuId)
    return giaSu ? giaSu.ho_ten : 'N/A'
  }

  // =========================================
  // ĐÃ CẬP NHẬT TRẠNG THÁI 'cho_gia_su' Ở ĐÂY
  // =========================================
  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      'sap_mo': 'Sắp mở',
      'dang_hoc': 'Đang học',
      'ket_thuc': 'Kết thúc',
      'dong': 'Đóng',
      'cho_gia_su': '⏳ Đang chờ Gia sư',
      'tu_choi': '❌ Gia sư từ chối'
    }
    return labels[trangThai] || trangThai
  }

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      'sap_mo': 'bg-blue-100 text-blue-700',
      'dang_hoc': 'bg-green-100 text-green-700',
      'ket_thuc': 'bg-gray-100 text-gray-700',
      'dong': 'bg-red-100 text-red-700',
      'cho_gia_su': 'bg-orange-100 text-orange-700 border border-orange-300 animate-pulse',
      'tu_choi': 'bg-red-100 text-red-700 border border-red-400 font-bold shadow-sm'
    }
    return colors[trangThai] || 'bg-gray-100 text-gray-700'
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      return
    }

    try {
      await lopHocAPI.delete(id)
      toast.success('Xóa lớp học thành công!')
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi xóa lớp học:', error)
      toast.error(error.message || 'Không thể xóa lớp học này')
    }
  }

  const toAlphabetSuffix = (index) => {
    let n = Number(index)
    let result = ''
    do {
      result = String.fromCharCode(65 + (n % 26)) + result
      n = Math.floor(n / 26) - 1
    } while (n >= 0)
    return result
  }

  const generateAutoClassName = (sourceData, excludedId = null) => {
    const monHoc = monHocs.find((m) => String(m.mon_hoc_id) === String(sourceData.mon_hoc_id))
    const tenMonHoc = monHoc?.ten_mon_hoc?.trim() || 'Môn'
    const khoiLop = sourceData.khoi_lop?.toString().trim() || '...'
    const baseName = `${tenMonHoc} - Lớp ${khoiLop}`

    const usedSuffixes = new Set()
    const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`^${escapedBase} \\(([A-Z]+)\\)$`)

    lopHocs.forEach((lop) => {
      if (excludedId && String(lop.lop_hoc_id) === String(excludedId)) return
      const tenLop = lop.ten_lop || ''
      const match = tenLop.match(pattern)
      if (match?.[1]) {
        usedSuffixes.add(match[1])
      }
    })

    let index = 0
    while (true) {
      const suffix = toAlphabetSuffix(index)
      if (!usedSuffixes.has(suffix)) {
        return `${baseName} (${suffix})`
      }
      index += 1
    }
  }

  const handleAutoFillTenLopIfEmpty = () => {
    if (!formData.mon_hoc_id) return
    if (formData.ten_lop?.trim()) return
    const autoName = generateAutoClassName(formData, editingId)
    setFormData((prev) => ({ ...prev, ten_lop: autoName }))
  }

  const filteredLopHocs = lopHocs.filter(lh => 
    lh.khoi_lop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lh.ten_lop || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMonHocName(lh.mon_hoc_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    lh.lop_hoc_id?.toString().includes(searchTerm)
  )

  const groupedBySubject = filteredLopHocs.reduce((acc, lopHoc) => {
    const subjectName = getMonHocName(lopHoc.mon_hoc_id)
    if (!acc[subjectName]) {
      acc[subjectName] = []
    }
    acc[subjectName].push(lopHoc)
    return acc
  }, {})

  const subjectSections = Object.entries(groupedBySubject).sort(([subjectA], [subjectB]) =>
    subjectA.localeCompare(subjectB, 'vi')
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h2>
            <p className="text-gray-500 text-sm mt-1">Tổng số: {lopHocs.length} lớp học</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium"
          >
            <Plus size={18} />
            Thêm lớp học
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo khối lớp, môn học hoặc ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            />
          </div>
        </div>

        {/* Grouped Content */}
        <div className="p-5">
          {filteredLopHocs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {subjectSections.map(([subjectName, classes]) => (
                <section key={subjectName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{subjectName}</h3>
                        <p className="text-xs text-gray-500">{classes.length} lớp trong môn này</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <Layers3 size={14} />
                      Nhóm môn
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {classes.map((lopHoc, idx) => (
                      <div key={`${subjectName}-${lopHoc.lop_hoc_id}-${idx}`} className="rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow relative overflow-visible">
                        <div className="absolute top-2 right-2">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowSettings(showSettings === lopHoc.lop_hoc_id ? null : lopHoc.lop_hoc_id)
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cài đặt"
                            >
                              <Settings size={16} />
                            </button>

                            {showSettings === lopHoc.lop_hoc_id && (
                              <div className="absolute top-9 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                                <button
                                  onClick={() => {
                                    navigate(`/dashboard/lophoc/${lopHoc.lop_hoc_id}/edit`)
                                    setShowSettings(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
                                >
                                  <Edit2 size={12} />
                                  Chỉnh sửa
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/dashboard/lophoc/${lopHoc.lop_hoc_id}/attendance`)
                                    setShowSettings(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100"
                                >
                                  <Clock size={12} />
                                  Điểm danh
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(lopHoc.lop_hoc_id)
                                    setShowSettings(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={12} />
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="pr-8">
                            <h4 className="font-semibold text-gray-900 text-base line-clamp-2">
                              {lopHoc.ten_lop || `Lớp ${lopHoc.khoi_lop || 'N/A'} - ${subjectName}`}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">Khối lớp: {lopHoc.khoi_lop || 'Chưa cập nhật'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-gray-500 text-xs">Giáo viên</p>
                              <p className="text-gray-800 font-medium truncate">{getGiaSuName(lopHoc.gia_su_id)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-gray-500 text-xs">Số buổi</p>
                              <p className="text-gray-800 font-medium">{lopHoc.so_buoi_hoc || 0} buổi</p>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm">
                            <p className="text-gray-800 font-semibold">
                              {lopHoc.gia_toan_khoa
                                ? `${formatPrice(lopHoc.gia_toan_khoa)}đ/khóa`
                                : 'Chưa có học phí'}
                            </p>
                            <p className="text-gray-600">
                              {lopHoc.gia_toan_khoa && lopHoc.so_buoi_hoc
                                ? `${formatPrice(calculatePricePerSession(lopHoc.gia_toan_khoa, lopHoc.so_buoi_hoc, lopHoc.loai_chi_tra, lopHoc.gia_tri_chi_tra))}đ/buổi`
                                : 'Chưa có giá mỗi buổi'}
                            </p>
                            <p className="text-gray-600">Tối đa {lopHoc.so_luong_toi_da || 1} học sinh</p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex justify-end items-center">
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getTrangThaiColor(lopHoc.trang_thai)}`}>
                              {getTrangThaiLabel(lopHoc.trang_thai)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && currentViewTab !== 'attendance' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-200 px-5">
              <button
                onClick={() => setCurrentViewTab('info')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  currentViewTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Thông tin lớp
              </button>
              {editingId && (
                <button
                  onClick={() => setCurrentViewTab('students')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    currentViewTab === 'students'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users size={16} />
                  Học sinh
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {currentViewTab === 'info' && (
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Môn học <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.mon_hoc_id}
                      onChange={(e) => setFormData({ ...formData, mon_hoc_id: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Chọn môn học --</option>
                      {monHocs.map((mh) => (
                        <option key={mh.mon_hoc_id} value={mh.mon_hoc_id}>
                          {mh.ten_mon_hoc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên lớp
                      </label>
                      <input
                        type="text"
                        value={formData.ten_lop}
                        onChange={(e) => setFormData({ ...formData, ten_lop: e.target.value })}
                        onBlur={handleAutoFillTenLopIfEmpty}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tự động nếu để trống"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khối lớp
                      </label>
                      <input
                        type="text"
                        value={formData.khoi_lop}
                        onChange={(e) => setFormData({ ...formData, khoi_lop: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ví dụ: 6, 7, 8..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giáo viên (Gia sư)
                    </label>
                    <select
                      value={formData.gia_su_id}
                      onChange={(e) => setFormData({ ...formData, gia_su_id: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn giáo viên --</option>
                      {giaSus.map((gs) => (
                        <option key={gs.gia_su_id} value={gs.gia_su_id}>
                          {gs.ho_ten}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Học phí toàn khóa (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.gia_toan_khoa}
                        onChange={(e) => setFormData({ ...formData, gia_toan_khoa: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3000000"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sĩ số tối đa
                      </label>
                      <input
                        type="number"
                        value={formData.so_luong_toi_da}
                        onChange={(e) => setFormData({ ...formData, so_luong_toi_da: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số buổi học
                    </label>
                    <input
                      type="number"
                      value={formData.so_buoi_hoc}
                      onChange={(e) => setFormData({ ...formData, so_buoi_hoc: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20"
                      min="0"
                    />
                  </div>

                  {formData.gia_toan_khoa && formData.so_buoi_hoc && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 font-medium">Giá mỗi buổi (tính tự động):</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(calculatePricePerSession(formData.gia_toan_khoa, formData.so_buoi_hoc, formData.loai_chi_tra, formData.gia_tri_chi_tra))}đ
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Chia phí gia sư</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại chi trả
                        </label>
                        <select
                          value={formData.loai_chi_tra}
                          onChange={(e) => setFormData({ ...formData, loai_chi_tra: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="phan_tram">Phần trăm (%)</option>
                          <option value="tien_cu_the">Tiền cụ thể</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá trị {formData.loai_chi_tra === 'phan_tram' ? '(%)' : '(VNĐ)'}
                        </label>
                        <input
                          type="number"
                          value={formData.gia_tri_chi_tra}
                          onChange={(e) => setFormData({ ...formData, gia_tri_chi_tra: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={formData.loai_chi_tra === 'phan_tram' ? '70' : '1500000'}
                          min="0"
                          step={formData.loai_chi_tra === 'phan_tram' ? '1' : '1000'}
                          max={formData.loai_chi_tra === 'phan_tram' ? '100' : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={formData.trang_thai}
                        onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sap_mo">Sắp mở</option>
                        <option value="dang_hoc">Đang học</option>
                        <option value="ket_thuc">Kết thúc</option>
                        <option value="dong">Đóng</option>
                        <option value="cho_gia_su">Chờ gia sư xác nhận</option>
                        <option value="tu_choi">Gia sư từ chối</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc
                      </label>
                      <input
                        type="date"
                        value={formData.ngay_ket_thuc}
                        onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {!editingId && (
                    <div className="border-t border-gray-200 pt-3 mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800 text-sm">Lịch học khi tạo lớp</h4>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={createWithSchedule}
                            onChange={(e) => setCreateWithSchedule(e.target.checked)}
                          />
                          Tạo lịch học ngay
                        </label>
                      </div>

                      {createWithSchedule && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                              <input
                                type="date"
                                value={scheduleForm.ngay_bat_dau}
                                onChange={(e) => setScheduleForm((prev) => ({ ...prev, ngay_bat_dau: e.target.value }))}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                                <input
                                  type="time"
                                  value={scheduleForm.gio_bat_dau}
                                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, gio_bat_dau: e.target.value }))}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                                <input
                                  type="time"
                                  value={scheduleForm.gio_ket_thuc}
                                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, gio_ket_thuc: e.target.value }))}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học trong tuần</label>
                            <div className="grid grid-cols-3 gap-2">
                              {WEEKDAY_OPTIONS.map((day) => (
                                <label key={day.value} className="inline-flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={scheduleForm.ngay_trong_tuan.includes(day.value)}
                                    onChange={(e) => {
                                      const checked = e.target.checked
                                      setScheduleForm((prev) => ({
                                        ...prev,
                                        ngay_trong_tuan: checked
                                          ? [...prev.ngay_trong_tuan, day.value].sort((a, b) => a - b)
                                          : prev.ngay_trong_tuan.filter((v) => v !== day.value)
                                      }))
                                    }}
                                  />
                                  {day.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-gray-100 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              )}

              {currentViewTab === 'students' && (
                <div className="p-5 space-y-3">
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nút Thêm học sinh */}
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Thêm học sinh
                  </button>

                  {/* Danh sách học sinh */}
                  <div className="space-y-2">
                    {classStudents && classStudents.length > 0 ? (
                      classStudents
                        .filter(s => {
                          const name = (s.name || '').toString().toLowerCase()
                          const code = (s.code || '').toString().toLowerCase()
                          const search = studentSearchTerm.toLowerCase()
                          return name.includes(search) || code.includes(search)
                        })
                        .map((student, idx) => (
                          <div key={`${student.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{student.name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{student.code || 'N/A'}</p>
                            </div>
                            <button
                              onClick={() => removeStudentFromClass(editingId, student.id)}
                              className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-8">Chưa có học sinh nào</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Thêm học sinh */}
          {showAddStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Chọn học sinh để thêm</h4>
                  <button
                    onClick={() => {
                      setShowAddStudentModal(false)
                      setAddStudentSearchTerm('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search */}
                <div className="sticky top-12 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên hoặc mã..."
                      value={addStudentSearchTerm}
                      onChange={(e) => setAddStudentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-custom">
                  {allHocSinh && allHocSinh.length > 0 ? (
                    allHocSinh
                      .filter(student => {
                        if (classStudents && classStudents.find(s => s && s.id === student.id)) {
                          return false
                        }
                        const name = (student.name || '').toString().toLowerCase()
                        const code = (student.code || '').toString().toLowerCase()
                        const search = addStudentSearchTerm.toLowerCase()
                        return name.includes(search) || code.includes(search)
                      })
                      .map((student, idx) => (
                        <button
                          key={`add-${student.id}-${idx}`}
                          onClick={() => {
                            addStudentToClass(editingId, student.id)
                            setShowAddStudentModal(false)
                            setAddStudentSearchTerm('')
                          }}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                        >
                          <p className="text-sm font-medium text-gray-800">{student.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{student.code || 'N/A'}</p>
                        </button>
                      ))
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-8">Không có học sinh nào</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance View Modal */}
      {showModal && currentViewTab === 'attendance' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Điểm danh</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setCurrentViewTab('info')
                  resetForm()
                  setAttendanceForToday({})
                  setShowAttendanceHistory(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-200 px-5 bg-white sticky top-14">
              <button
                onClick={() => {
                  setShowAttendanceHistory(false)
                  if (Object.keys(attendanceForToday).length === 0) {
                    initializeAttendanceForm()
                  }
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  !showAttendanceHistory
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Điểm danh hôm nay
              </button>
              <button
                onClick={() => setShowAttendanceHistory(true)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  showAttendanceHistory
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Lịch sử
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!showAttendanceHistory ? (
                // Attendance Marking Form for Today
                <div className="space-y-4">
                  {classStudents && classStudents.length > 0 ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Ngày:</span> {new Date().toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {classStudents.map((student) => (
                          <div key={student.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.code}</p>
                              </div>
                            </div>

                            {/* Status buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'co_mat')}
                                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition ${
                                  attendanceForToday[student.id] === 'co_mat'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                Có mặt
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'vang')}
                                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition ${
                                  attendanceForToday[student.id] === 'vang'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                Vắng
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'vang_co_phep')}
                                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition ${
                                  attendanceForToday[student.id] === 'vang_co_phep'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                              >
                                Vắng có phép
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Save button */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200 mt-4">
                        <button
                          onClick={() => {
                            setShowModal(false)
                            setCurrentViewTab('info')
                            resetForm()
                            setAttendanceForToday({})
                            setShowAttendanceHistory(false)
                          }}
                          className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveAttendanceForToday}
                          disabled={savingAttendance}
                          className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {savingAttendance ? 'Đang lưu...' : 'Lưu điểm danh'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Chưa có học sinh nào trong lớp</p>
                  )}
                </div>
              ) : (
                // Attendance History View
                <div className="space-y-4">
                  {attendance.length > 0 ? (
                    <>
                      {Object.entries(
                        attendance.reduce((acc, record) => {
                          const dateKey = record.ngay_hoc || 'N/A'
                          if (!acc[dateKey]) {
                            acc[dateKey] = {
                              ngay_hoc: record.ngay_hoc,
                              gio_bat_dau: record.gio_bat_dau,
                              gio_ket_thuc: record.gio_ket_thuc,
                              students: []
                            }
                          }
                          acc[dateKey].students.push({
                            ten_hoc_sinh: record.ten_hoc_sinh,
                            tinh_trang: record.tinh_trang
                          })
                          return acc
                        }, {})
                      ).map(([dateKey, scheduleData]) => (
                        <div key={dateKey} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800">Buổi học ngày {scheduleData.ngay_hoc}</p>
                            <span className="text-xs text-gray-500">
                              {scheduleData.gio_bat_dau ? `${scheduleData.gio_bat_dau} - ${scheduleData.gio_ket_thuc}` : 'N/A'}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded p-3 space-y-1">
                            {scheduleData.students.map((student, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{student.ten_hoc_sinh}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  student.tinh_trang === 'co_mat' ? 'bg-green-100 text-green-700' :
                                  student.tinh_trang === 'vang' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {student.tinh_trang === 'co_mat' ? 'Có mặt' : 
                                   student.tinh_trang === 'vang' ? 'Vắng' : 'Vắng có phép'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Chưa có lịch sử điểm danh</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}