import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { lopHocAPI } from '../api/lophocApi'
import { lichHocAPI } from '../api/lichhocApi'
import { diemDanhAPI } from '../api/diemdanhApi'
import { monHocAPI } from '../api/monhocApi'
import { giaSuAPI } from '../api/giaSuApi'
import { hocSinhAPI } from '../api/hocSinhApi'
import { validateClassForm } from '@/lib/validators'
import { normalizeNumberInputValue } from '@/lib/numberUtils'

const WEEKDAY_OPTIONS = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' }
]

export default function LopHocEditPage({ classId }) {
  const id = classId
  const navigate = useNavigate()

  const goBackToClassManagement = () => {
    localStorage.setItem('admin_active_item', 'lophoc')
    navigate('/dashboard')
  }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingStudent, setSavingStudent] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [addStudentSearchTerm, setAddStudentSearchTerm] = useState('')

  const [monHocs, setMonHocs] = useState([])
  const [giaSus, setGiaSus] = useState([])
  const [allHocSinh, setAllHocSinh] = useState([])
  const [classStudents, setClassStudents] = useState([])
  const [existingSchedules, setExistingSchedules] = useState([])
  const [existingRecurringSchedules, setExistingRecurringSchedules] = useState([])

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
  const [scheduleForm, setScheduleForm] = useState({
    enabled: false,
    ngay_bat_dau: '',
    gio_bat_dau: '18:00',
    gio_ket_thuc: '19:30',
    ngay_trong_tuan: []
  })

  const weekdayLabelMap = WEEKDAY_OPTIONS.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
  }, {})

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [lopHocRes, monHocRes, giaSuRes, hocSinhRes, classStudentsRes, classScheduleRes, classOverviewRes] = await Promise.all([
          lopHocAPI.getById(id),
          monHocAPI.getAll(),
          giaSuAPI.getAll(),
          hocSinhAPI.getAll({ page: 1, limit: 1000 }),
          lopHocAPI.getStudentsByClass(id),
          lichHocAPI.getByLopHoc(id),
          diemDanhAPI.getClassOverview(id)
        ])

        const lopHoc = lopHocRes?.data
        if (!lopHoc) {
          toast.error('Không tìm thấy lớp học')
          goBackToClassManagement()
          return
        }

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

        setMonHocs(monHocRes?.data || [])
        setGiaSus(giaSuRes?.data || [])

        const allStudents = (hocSinhRes?.data || [])
          .filter((hs) => hs && hs.hoc_sinh_id)
          .map((hs) => ({
            id: hs.hoc_sinh_id,
            code: `HS${hs.hoc_sinh_id}`,
            name: hs.ho_ten || 'N/A'
          }))

        setAllHocSinh(allStudents)

        const mappedClassStudents = (classStudentsRes?.data || [])
          .filter((item) => item && item.hoc_sinh_id)
          .map((item) => ({
            id: item.hoc_sinh_id,
            code: `HS${item.hoc_sinh_id}`,
            name: item.ho_ten || 'N/A'
          }))

        setClassStudents(mappedClassStudents)
        setExistingSchedules(classScheduleRes?.data || [])

        const recurringSchedules = classOverviewRes?.data?.lich_dinh_ky || []
        setExistingRecurringSchedules(recurringSchedules)

        if (recurringSchedules.length > 0) {
          const recurringSorted = [...recurringSchedules].sort((a, b) => {
            const da = String(a.ngay_bat_dau || '')
            const db = String(b.ngay_bat_dau || '')
            if (da !== db) return da.localeCompare(db)
            return Number(a.thu_trong_tuan || 0) - Number(b.thu_trong_tuan || 0)
          })

          const first = recurringSorted[0]
          const targetStartTime = String(first.gio_bat_dau || '').slice(0, 5)
          const targetEndTime = String(first.gio_ket_thuc || '').slice(0, 5)

          const sameTimeRecurring = recurringSorted.filter((item) => (
            String(item.gio_bat_dau || '').slice(0, 5) === targetStartTime &&
            String(item.gio_ket_thuc || '').slice(0, 5) === targetEndTime
          ))

          const recurringDays = [...new Set(sameTimeRecurring
            .map((item) => Number(item.thu_trong_tuan))
            .filter((day) => Number.isInteger(day) && day >= 2 && day <= 8)
          )].sort((a, b) => a - b)

          setScheduleForm({
            enabled: false,
            ngay_bat_dau: String(first.ngay_bat_dau || '').split(' ')[0],
            gio_bat_dau: targetStartTime || '18:00',
            gio_ket_thuc: targetEndTime || '19:30',
            ngay_trong_tuan: recurringDays
          })
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu lớp học:', error)
        toast.error(error.message || 'Không thể tải dữ liệu lớp học')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, navigate])

  const calculatePricePerSession = (totalPrice, sessions, paymentType, paymentValue) => {
    if (!totalPrice || !sessions || sessions <= 0 || !paymentValue) return 0

    const total = parseInt(totalPrice, 10) || 0
    const buois = parseInt(sessions, 10) || 0

    if (paymentType === 'phan_tram') {
      const percent = parseInt(paymentValue, 10) || 0
      return Math.round((total * percent / 100) / buois)
    }

    if (paymentType === 'tien_cu_the') {
      const amount = parseInt(paymentValue, 10) || 0
      return Math.round((total - amount) / buois)
    }

    return 0
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return parseInt(price, 10).toLocaleString('vi-VN')
  }

  const handleAutoFillTenLopIfEmpty = () => {
    if (formData.ten_lop?.trim()) return
    const monHoc = monHocs.find((m) => String(m.mon_hoc_id) === String(formData.mon_hoc_id))
    const tenMon = monHoc?.ten_mon_hoc || 'Môn'
    const khoi = formData.khoi_lop?.trim() || '...'
    setFormData((prev) => ({ ...prev, ten_lop: `${tenMon} - Lớp ${khoi}` }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.mon_hoc_id) {
      toast.warning('Vui lòng chọn môn học')
      return
    }

    const payload = { ...formData }
    if (!payload.ten_lop?.trim()) {
      handleAutoFillTenLopIfEmpty()
      payload.ten_lop = formData.ten_lop
    }

    const validationMessage = validateClassForm(payload)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    const shouldSaveRecurringSchedule = scheduleForm.enabled

    if (shouldSaveRecurringSchedule) {
      if (!scheduleForm.ngay_bat_dau || scheduleForm.ngay_trong_tuan.length === 0) {
        toast.warning('Vui lòng chọn ngày bắt đầu và ít nhất 1 ngày học trong tuần')
        return
      }

      if (!scheduleForm.gio_bat_dau || !scheduleForm.gio_ket_thuc || scheduleForm.gio_bat_dau >= scheduleForm.gio_ket_thuc) {
        toast.warning('Giờ bắt đầu/kết thúc của lịch định kỳ không hợp lệ')
        return
      }
    }

    try {
      setSaving(true)
      await lopHocAPI.update(id, payload)

      if (shouldSaveRecurringSchedule) {
        const thoiGianTungNgay = {}
        scheduleForm.ngay_trong_tuan.forEach((thu) => {
          thoiGianTungNgay[thu] = {
            gio_bat_dau: scheduleForm.gio_bat_dau,
            gio_ket_thuc: scheduleForm.gio_ket_thuc
          }
        })

        await lichHocAPI.create({
          lop_hoc_id: Number(id),
          tao_chu_ky: true,
          ngay_bat_dau: scheduleForm.ngay_bat_dau,
          ngay_ket_thuc: formData.ngay_ket_thuc || null,
          ngay_trong_tuan: scheduleForm.ngay_trong_tuan,
          thoi_gian_tung_ngay: thoiGianTungNgay
        })
      }

      const [classScheduleRes, classOverviewRes] = await Promise.all([
        lichHocAPI.getByLopHoc(id),
        diemDanhAPI.getClassOverview(id)
      ])

      setExistingSchedules(classScheduleRes?.data || [])
      setExistingRecurringSchedules(classOverviewRes?.data?.lich_dinh_ky || [])

      toast.success(shouldSaveRecurringSchedule ? 'Đã cập nhật lớp học và lịch định kỳ' : 'Cập nhật lớp học thành công')
    } catch (error) {
      console.error('Lỗi khi cập nhật lớp học:', error)
      toast.error(error.message || 'Không thể cập nhật lớp học')
    } finally {
      setSaving(false)
    }
  }

  const addStudentOptions = useMemo(() => {
    const existed = new Set(classStudents.map((s) => s.id))
    const keyword = addStudentSearchTerm.toLowerCase()

    return allHocSinh.filter((student) => {
      if (existed.has(student.id)) return false
      const name = (student.name || '').toLowerCase()
      const code = (student.code || '').toLowerCase()
      return name.includes(keyword) || code.includes(keyword)
    })
  }, [allHocSinh, classStudents, addStudentSearchTerm])

  const filteredClassStudents = useMemo(() => {
    const keyword = searchTerm.toLowerCase()
    return classStudents.filter((student) => {
      const name = (student.name || '').toLowerCase()
      const code = (student.code || '').toLowerCase()
      return name.includes(keyword) || code.includes(keyword)
    })
  }, [classStudents, searchTerm])

  const handleAddStudent = async (hocSinhId) => {
    try {
      setSavingStudent(true)
      await lopHocAPI.addStudent(id, hocSinhId)
      const addedStudent = allHocSinh.find((s) => s.id === hocSinhId)
      if (addedStudent) {
        setClassStudents((prev) => [...prev, addedStudent])
      }
      toast.success('Thêm học sinh vào lớp thành công')
    } catch (error) {
      console.error('Lỗi khi thêm học sinh:', error)
      toast.error(error.message || 'Không thể thêm học sinh')
    } finally {
      setSavingStudent(false)
    }
  }

  const handleRemoveStudent = async (hocSinhId) => {
    try {
      setSavingStudent(true)
      await lopHocAPI.removeStudent(id, hocSinhId)
      setClassStudents((prev) => prev.filter((s) => s.id !== hocSinhId))
      toast.success('Đã xóa học sinh khỏi lớp')
    } catch (error) {
      console.error('Lỗi khi xóa học sinh:', error)
      toast.error(error.message || 'Không thể xóa học sinh')
    } finally {
      setSavingStudent(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
        Đang tải dữ liệu lớp học...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Chỉnh sửa lớp học</h2>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin lớp và quản lý học sinh đã duyệt</p>
        </div>
        <button
          onClick={goBackToClassManagement}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
              <select
                value={formData.mon_hoc_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, mon_hoc_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                required
              >
                <option value="">-- Chọn môn học --</option>
                {monHocs.map((mh) => (
                  <option key={mh.mon_hoc_id} value={mh.mon_hoc_id}>{mh.ten_mon_hoc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khối lớp</label>
              <input
                type="text"
                value={formData.khoi_lop}
                onChange={(e) => setFormData((prev) => ({ ...prev, khoi_lop: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Ví dụ: 6, 7, 8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
            <input
              type="text"
              value={formData.ten_lop}
              onChange={(e) => setFormData((prev) => ({ ...prev, ten_lop: e.target.value }))}
              onBlur={handleAutoFillTenLopIfEmpty}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="Tự động nếu để trống"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên</label>
            <select
              value={formData.gia_su_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, gia_su_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="">-- Chọn giáo viên --</option>
              {giaSus.map((gs) => (
                <option key={gs.gia_su_id} value={gs.gia_su_id}>{gs.ho_ten}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học phí toàn khóa</label>
              <input
                type="number"
                min="0"
                value={formData.gia_toan_khoa}
                onChange={(e) => setFormData((prev) => ({ ...prev, gia_toan_khoa: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số buổi học</label>
              <input
                type="number"
                min="0"
                value={formData.so_buoi_hoc}
                onChange={(e) => setFormData((prev) => ({ ...prev, so_buoi_hoc: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {formData.gia_toan_khoa && formData.so_buoi_hoc && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Giá mỗi buổi (ước tính): {formatPrice(calculatePricePerSession(formData.gia_toan_khoa, formData.so_buoi_hoc, formData.loai_chi_tra, formData.gia_tri_chi_tra))}đ
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sĩ số tối đa</label>
              <input
                type="number"
                min="1"
                value={formData.so_luong_toi_da}
                onChange={(e) => setFormData((prev) => ({ ...prev, so_luong_toi_da: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.ngay_ket_thuc}
                onChange={(e) => setFormData((prev) => ({ ...prev, ngay_ket_thuc: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại chi trả</label>
              <select
                value={formData.loai_chi_tra}
                onChange={(e) => setFormData((prev) => ({ ...prev, loai_chi_tra: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="phan_tram">Phần trăm (%)</option>
                <option value="tien_cu_the">Tiền cụ thể</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị chi trả</label>
              <input
                type="number"
                min="0"
                value={formData.gia_tri_chi_tra}
                onChange={(e) => setFormData((prev) => ({ ...prev, gia_tri_chi_tra: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={formData.trang_thai}
              onChange={(e) => setFormData((prev) => ({ ...prev, trang_thai: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="sap_mo">Sắp mở</option>
              <option value="dang_hoc">Đang học</option>
              <option value="ket_thuc">Kết thúc</option>
              <option value="dong">Đóng</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800">Lịch học định kỳ</h4>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={scheduleForm.enabled}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                Thiết lập lịch định kỳ
              </label>
            </div>

            {existingSchedules.length > 0 && (
              <p className="text-xs text-gray-500">
                Đã có {existingSchedules.length} buổi học trong lớp. Bật mục này để thêm lịch định kỳ mới.
              </p>
            )}

            {existingRecurringSchedules.length > 0 && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">Lịch định kỳ hiện có</p>
                <div className="space-y-1.5">
                  {existingRecurringSchedules.map((item) => (
                    <p key={item.lich_dinh_ky_id} className="text-xs text-blue-900">
                      {weekdayLabelMap[Number(item.thu_trong_tuan)] || `Thứ ${item.thu_trong_tuan}`}: {String(item.gio_bat_dau || '').slice(0, 5)} - {String(item.gio_ket_thuc || '').slice(0, 5)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {scheduleForm.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={scheduleForm.ngay_bat_dau}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, ngay_bat_dau: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={scheduleForm.gio_bat_dau}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, gio_bat_dau: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={scheduleForm.gio_ket_thuc}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, gio_ket_thuc: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học trong tuần</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

          <div className="pt-2 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Học sinh trong lớp</h3>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm trong lớp..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredClassStudents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Chưa có học sinh nào trong lớp</p>
            ) : (
              filteredClassStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(student.id)}
                    disabled={savingStudent}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:text-red-300"
                    title="Xóa học sinh"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Thêm học sinh</label>
            <input
              type="text"
              value={addStudentSearchTerm}
              onChange={(e) => setAddStudentSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />

            <div className="max-h-44 overflow-y-auto space-y-2">
              {addStudentOptions.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">Không còn học sinh phù hợp</p>
              ) : (
                addStudentOptions.map((student) => (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => handleAddStudent(student.id)}
                    disabled={savingStudent}
                    className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.code}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                        <Plus size={12} />
                        Thêm
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
