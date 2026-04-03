import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { lopHocAPI } from '../api/lophocApi'
import { monHocAPI } from '../api/monhocApi'
import { giaSuAPI } from '../api/giaSuApi'
import { giaSuMonHocAPI } from '../api/giasumonhocApi'
import { hocSinhAPI } from '../api/hocSinhApi'
import { diemDanhAPI } from '../api/diemdanhApi'
import { lichHocAPI } from '../api/lichhocApi'
import { Plus, Settings, X, Search, Lock, Unlock, Edit2, BookOpen, Layers3, Users, Clock } from 'lucide-react'
import { validateClassForm } from '@/lib/validators'
import { normalizeNumberInputValue } from '@/lib/numberUtils'
import { toast } from 'sonner'
import { getAbortSignal } from '@/lib/requestUtils'

export default function LopHocManagement() {
  const navigate = useNavigate()
  const [lopHocs, setLopHocs] = useState([])
  const [monHocs, setMonHocs] = useState([])
  const [giaSus, setGiaSus] = useState([])
  const [tutorSubjectMap, setTutorSubjectMap] = useState({})
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
  const [lockConfirmModal, setLockConfirmModal] = useState({
    open: false,
    classId: null,
    className: '',
    action: 'lock'
  })
  const submitRef = useRef({ isSubmitting: false })
  
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

  const GRADE_OPTIONS = ['1','2','3','4','5','6','7','8','9','10','11','12']
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
    fetchGiaSuMonHocLinks()
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

  const fetchGiaSuMonHocLinks = async () => {
    try {
      const response = await giaSuMonHocAPI.getAll({ limit: 5000 })
      const rows = response?.data || []
      const nextMap = {}

      rows.forEach((row) => {
        const tutorId = String(row.gia_su_id || '')
        const subjectId = String(row.mon_hoc_id || '')
        if (!tutorId || !subjectId) return
        if (!nextMap[tutorId]) {
          nextMap[tutorId] = new Set()
        }
        nextMap[tutorId].add(subjectId)
      })

      setTutorSubjectMap(nextMap)
    } catch (error) {
      console.error('Lỗi khi tải liên kết gia sư - môn học:', error)
      setTutorSubjectMap({})
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
        // Ngăn double-submit
        if (submitRef.current.isSubmitting) {
          return
        }
        submitRef.current.isSubmitting = true
        const signal = getAbortSignal(`attendance-${editingId}`)
        setSavingAttendance(true)
        await diemDanhAPI.saveAttendanceForToday(editingId, danh_sach, { signal })
      toast.success('Đã lưu điểm danh cho hôm nay!')
      fetchAttendanceByClass(editingId)
      setAttendanceForToday({})
      setShowAttendanceHistory(true)
      } catch (error) {
        if (error.name !== 'AbortError') {
      console.error('Lỗi khi lưu điểm danh:', error)
      toast.error(error.message || 'Không thể lưu điểm danh')
        }
    } finally {
      setSavingAttendance(false)
        submitRef.current.isSubmitting = false
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

    if (submitRef.current.isSubmitting) return

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
    if (!editingId && createWithSchedule) {
      if (!scheduleForm.ngay_bat_dau || scheduleForm.ngay_trong_tuan.length === 0) {
        toast.warning('Vui lòng chọn ngày bắt đầu và ít nhất 1 ngày học trong tuần')
        return
      }
      if (!scheduleForm.gio_bat_dau || !scheduleForm.gio_ket_thuc || scheduleForm.gio_bat_dau >= scheduleForm.gio_ket_thuc) {
        toast.warning('Giờ bắt đầu/kết thúc của lịch học không hợp lệ')
        return
      }
      
      payload.thoi_gian_du_kien = {
        ngay_trong_tuan: scheduleForm.ngay_trong_tuan,
        gio_bat_dau: scheduleForm.gio_bat_dau,
        gio_ket_thuc: scheduleForm.gio_ket_thuc,
        ngay_bat_dau: scheduleForm.ngay_bat_dau,
        ngay_ket_thuc: formData.ngay_ket_thuc 
      }
    }

    const validationMessage = validateClassForm(payload)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    try {
      submitRef.current.isSubmitting = true
      const signal = getAbortSignal(`lop-hoc-${editingId || 'new'}`)

      if (editingId) {
        await lopHocAPI.update(editingId, payload, { signal })
        toast.success('Cập nhật lớp học thành công!')
      } else {
        const createResult = await lopHocAPI.create(payload, { signal })
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
          }, { signal })
        }
        toast.success('Thêm lớp học thành công!')
      }
      
      setShowModal(false)
      resetForm()
      fetchLopHocs()
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Lỗi khi lưu lớp học:', error)
        toast.error(error.message || 'Có lỗi xảy ra khi lưu lớp học')
      }
    } finally {
      submitRef.current.isSubmitting = false
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

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      'sap_mo': 'Sắp mở',
      'dang_hoc': 'Đang học',
      'ket_thuc': 'Kết thúc',
      'dong': 'Đóng',
        'cho_gia_su': 'Chờ gia sư xác nhận',
        'tu_choi': 'Gia sư từ chối',
        'cho_gia_su_xac_nhan': 'Chờ gia sư xác nhận',
        'gia_su_tu_choi': 'Gia sư từ chối',
        'da_duyet_truc_tiep': 'Đã duyệt trực tiếp'
    }
    return labels[trangThai] || trangThai
  }

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      'sap_mo': 'bg-blue-100 text-blue-700',
      'dang_hoc': 'bg-green-100 text-green-700',
      'ket_thuc': 'bg-gray-100 text-gray-700',
      'dong': 'bg-red-100 text-red-700',
        'cho_gia_su': 'bg-orange-100 text-orange-700 border border-orange-300',
        'tu_choi': 'bg-red-100 text-red-700 border border-red-400 font-bold shadow-sm',
        'cho_gia_su_xac_nhan': 'bg-orange-100 text-orange-700 border border-orange-300',
        'gia_su_tu_choi': 'bg-red-100 text-red-700 border border-red-400 font-bold shadow-sm',
        'da_duyet_truc_tiep': 'bg-purple-100 text-purple-700 border border-purple-300'
    }
    return colors[trangThai] || 'bg-gray-100 text-gray-700'
  }

  const handleDelete = async (id) => {
    try {
      await lopHocAPI.delete(id)
      toast.success('Khóa lớp học thành công!')
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi xóa lớp học:', error)
      toast.error(error.message || 'Không thể khóa lớp học này')
    }
  }

  const handleUnlock = async (id) => {
    try {
      await lopHocAPI.updateStatus(id, 'sap_mo')
      toast.success('Mở khóa lớp học thành công!')
      fetchLopHocs()
    } catch (error) {
      console.error('Lỗi khi mở khóa lớp học:', error)
      toast.error(error.message || 'Không thể mở khóa lớp học này')
    }
  }

  const openLockConfirmModal = (lopHoc) => {
    const isLocked = lopHoc?.trang_thai === 'dong'
    setLockConfirmModal({
      open: true,
      classId: lopHoc?.lop_hoc_id || null,
      className: lopHoc?.ten_lop || `Lớp ${lopHoc?.lop_hoc_id || ''}`,
      action: isLocked ? 'unlock' : 'lock'
    })
  }

  const closeLockConfirmModal = () => {
    setLockConfirmModal({ open: false, classId: null, className: '', action: 'lock' })
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

  const handleAutoFillTenLopIfEmpty = (nextFormData) => {
    const source = nextFormData || formData
    if (!source.mon_hoc_id || !source.khoi_lop) return
    if (source.ten_lop?.trim()) return
    const autoName = generateAutoClassName(source, editingId)
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

  const sortedGiaSuOptions = (() => {
    const selectedMonHocId = String(formData.mon_hoc_id || '').trim()
    const selectedKhoiLop = String(formData.khoi_lop || '').trim()

    const scored = giaSus.map((gs) => {
      const tutorId = String(gs.gia_su_id)
      const subjectSet = tutorSubjectMap[tutorId] || new Set()
      const matchSubject = selectedMonHocId ? subjectSet.has(selectedMonHocId) : false

      const matchGrade = selectedKhoiLop
        ? lopHocs.some((lop) => String(lop.gia_su_id) === tutorId && String(lop.khoi_lop || '') === selectedKhoiLop)
        : false

      const score = (matchSubject ? 2 : 0) + (matchGrade ? 1 : 0)
      return { ...gs, score, matchSubject, matchGrade }
    })

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return String(a.ho_ten || '').localeCompare(String(b.ho_ten || ''), 'vi')
    })

    return scored
  })()

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
                                {/* TRẢ LẠI NÚT NAVIGATE GỐC CỦA BẠN */}
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
                                    openLockConfirmModal(lopHoc)
                                    setShowSettings(null)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${lopHoc.trang_thai === 'dong' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                                >
                                  {lopHoc.trang_thai === 'dong' ? <Unlock size={12} /> : <Lock size={12} />}
                                  {lopHoc.trang_thai === 'dong' ? 'Mở khóa' : 'Khóa'}
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

      {/* Modal TẠO MỚI (Đã gỡ bỏ logic Edit) */}
      {showModal && currentViewTab !== 'attendance' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Thêm lớp học mới
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
            </div>

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
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tự động nếu để trống"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khối lớp
                      </label>
                      <select
                        value={formData.khoi_lop}
                        onChange={(e) => {
                          const nextFormData = { ...formData, khoi_lop: e.target.value }
                          setFormData(nextFormData)
                          handleAutoFillTenLopIfEmpty(nextFormData)
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn khối lớp (1-12)</option>
                        {GRADE_OPTIONS.map((grade) => (
                          <option key={grade} value={grade}>{`Lớp ${grade}`}</option>
                        ))}
                      </select>
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
                      {sortedGiaSuOptions.map((gs) => (
                        <option key={gs.gia_su_id} value={gs.gia_su_id}>
                          {gs.score > 0 ? 'Đề cử: ' : ''}{gs.ho_ten}
                          {gs.matchSubject && gs.matchGrade ? ' (phù hợp môn + khối)' : gs.matchSubject ? ' (phù hợp môn)' : gs.matchGrade ? ' (đã dạy khối này)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Danh sách ưu tiên gia sư phù hợp ở phía trên, nhưng bạn vẫn có thể chọn bất kỳ gia sư nào.</p>
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
                          min={formData.loai_chi_tra === 'phan_tram' ? '51' : '0'}
                          step={formData.loai_chi_tra === 'phan_tram' ? '1' : '1000'}
                          max={formData.loai_chi_tra === 'phan_tram' ? '99' : undefined}
                        />
                        {formData.loai_chi_tra === 'phan_tram' && (
                          <p className="text-xs text-gray-500 mt-1">Phần trăm phải lớn hơn 50 và nhỏ hơn 100.</p>
                        )}
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
                      Thêm mới
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {lockConfirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{lockConfirmModal.action === 'unlock' ? 'Xác nhận mở khóa lớp' : 'Xác nhận khóa lớp'}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {lockConfirmModal.action === 'unlock' ? (
                  <>
                    Bạn có chắc chắn muốn mở khóa lớp <span className="font-semibold text-gray-900">{lockConfirmModal.className}</span>? Lớp sẽ được phép đăng ký lại.
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn khóa lớp <span className="font-semibold text-gray-900">{lockConfirmModal.className}</span>? Lớp bị khóa sẽ không thể đăng ký ở phía phụ huynh và trang công khai.
                  </>
                )}
              </p>
            </div>
            <div className="p-5 flex gap-3">
              <button
                onClick={closeLockConfirmModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!lockConfirmModal.classId) return
                  if (lockConfirmModal.action === 'unlock') {
                    await handleUnlock(lockConfirmModal.classId)
                  } else {
                    await handleDelete(lockConfirmModal.classId)
                  }
                  closeLockConfirmModal()
                }}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition ${lockConfirmModal.action === 'unlock' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {lockConfirmModal.action === 'unlock' ? 'Mở khóa lớp' : 'Khóa lớp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance View Modal (Giữ nguyên của bạn) */}
      {showModal && currentViewTab === 'attendance' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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