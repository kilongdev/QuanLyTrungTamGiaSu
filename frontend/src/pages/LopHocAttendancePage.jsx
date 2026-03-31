import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, Clock3, Save } from 'lucide-react'
import { toast } from 'sonner'
import { diemDanhAPI } from '../api/diemdanhApi'

const STATUS_OPTIONS = [
  {
    value: 'co_mat',
    label: 'Có mặt',
    activeClass: 'bg-blue-600 text-white border border-blue-600',
    idleClass: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
  },
  {
    value: 'vang',
    label: 'Vắng',
    activeClass: 'bg-rose-800 text-white border border-rose-800',
    idleClass: 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
  },
  {
    value: 'vang_co_phep',
    label: 'Vắng có phép',
    activeClass: 'bg-rose-600 text-white border border-rose-600',
    idleClass: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
  }
]

const WEEKDAY_LABEL = {
  1: 'CN',
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7'
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const toLocalMidnightTs = (ymd) => {
  if (!ymd) return NaN
  const [year, month, day] = String(ymd).split('-').map(Number)
  if (!year || !month || !day) return NaN
  return new Date(year, month - 1, day).getTime()
}

const pickNearestSchedule = (schedules, referenceYmd) => {
  if (!Array.isArray(schedules) || schedules.length === 0) return null

  const exact = schedules.find((item) => item.ngay_hoc === referenceYmd)
  if (exact) return exact

  const refTs = toLocalMidnightTs(referenceYmd)
  if (Number.isNaN(refTs)) return schedules[0]

  return schedules.reduce((best, current) => {
    if (!best) return current

    const bestDelta = Math.round((toLocalMidnightTs(best.ngay_hoc) - refTs) / MS_PER_DAY)
    const currentDelta = Math.round((toLocalMidnightTs(current.ngay_hoc) - refTs) / MS_PER_DAY)

    const bestAbs = Math.abs(bestDelta)
    const currentAbs = Math.abs(currentDelta)
    if (currentAbs < bestAbs) return current
    if (currentAbs > bestAbs) return best

    // Khoang cach bang nhau: uu tien buoi sap toi (delta duong)
    if (bestDelta < 0 && currentDelta >= 0) return current
    return best
  }, null)
}

export default function LopHocAttendancePage({ classId }) {
  const id = classId
  const navigate = useNavigate()

  const goBackToClassManagement = () => {
    localStorage.setItem('admin_active_item', 'lophoc')
    navigate('/dashboard')
  }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [overview, setOverview] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedScheduleKey, setSelectedScheduleKey] = useState('')
  const [attendanceDraft, setAttendanceDraft] = useState({})
  const scheduleItemRefs = useRef({})

  const fetchOverview = async (preserveState = true) => {
    try {
      setLoading(true)
      const response = await diemDanhAPI.getClassOverview(id)
      const data = response?.data
      setOverview(data)

      if (!preserveState) {
        setSelectedDate('')
        setSelectedScheduleKey('')
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu điểm danh:', error)
      toast.error(error.message || 'Không thể tải dữ liệu điểm danh')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchOverview(false)
  }, [id])

  const recurring = overview?.lich_dinh_ky || []

  const scheduleOptions = useMemo(() => {
    const existing = (overview?.lich_hoc || []).map((item) => ({
      key: `existing-${item.lich_hoc_id}`,
      lich_hoc_id: item.lich_hoc_id,
      ngay_hoc: item.ngay_hoc,
      gio_bat_dau: item.gio_bat_dau,
      gio_ket_thuc: item.gio_ket_thuc,
      so_ban_ghi_diem_danh: Number(item.so_ban_ghi_diem_danh || 0),
      source: 'existing'
    }))

    const optionMap = new Map()
    existing.forEach((item) => optionMap.set(item.key, item))

    const today = new Date()
    recurring.forEach((r) => {
      const start = new Date(r.ngay_bat_dau)
      const end = r.ngay_ket_thuc ? new Date(r.ngay_ket_thuc) : new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
      const capEnd = new Date(start)
      capEnd.setDate(capEnd.getDate() + 120)
      const actualEnd = end > capEnd ? capEnd : end

      for (let d = new Date(start); d <= actualEnd; d.setDate(d.getDate() + 1)) {
        const jsWeekday = d.getDay()
        const vnWeekday = jsWeekday === 0 ? 1 : jsWeekday + 1
        if (vnWeekday !== Number(r.thu_trong_tuan)) continue

        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const ymd = `${y}-${m}-${day}`

        const duplicate = existing.find((ex) => ex.ngay_hoc === ymd && ex.gio_bat_dau === r.gio_bat_dau)
        if (duplicate) continue

        const key = `generated-${r.lich_dinh_ky_id}-${ymd}`
        if (!optionMap.has(key)) {
          optionMap.set(key, {
            key,
            lich_hoc_id: null,
            ngay_hoc: ymd,
            gio_bat_dau: r.gio_bat_dau,
            gio_ket_thuc: r.gio_ket_thuc,
            so_ban_ghi_diem_danh: 0,
            source: 'generated'
          })
        }
      }
    })

    return Array.from(optionMap.values()).sort((a, b) => {
      const dateCmp = String(a.ngay_hoc).localeCompare(String(b.ngay_hoc))
      if (dateCmp !== 0) return dateCmp
      return String(a.gio_bat_dau).localeCompare(String(b.gio_bat_dau))
    })
  }, [overview, recurring])

  useEffect(() => {
    if (scheduleOptions.length === 0) {
      setSelectedScheduleKey('')
      return
    }

    if (!selectedDate) {
      const todayYmd = new Date().toISOString().split('T')[0]
      const nearest = pickNearestSchedule(scheduleOptions, todayYmd)
      if (nearest) {
        setSelectedDate(nearest.ngay_hoc)
        setSelectedScheduleKey(nearest.key)
      }
      return
    }

    const candidate = scheduleOptions.find((item) => item.ngay_hoc === selectedDate)
    if (candidate) {
      setSelectedScheduleKey(candidate.key)
      return
    }

    const first = scheduleOptions[0]
    if (first) {
      setSelectedDate(first.ngay_hoc)
      setSelectedScheduleKey(first.key)
      return
    }

    setSelectedScheduleKey('')
  }, [scheduleOptions, selectedDate])

  useEffect(() => {
    if (!selectedScheduleKey) return
    const target = scheduleItemRefs.current[selectedScheduleKey]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedScheduleKey, scheduleOptions.length])

  const selectedSchedule = useMemo(() => {
    if (!selectedDate) return null
    const selected = scheduleOptions.find((item) => item.key === selectedScheduleKey)
    if (selected) return selected

    const defaultRecurring = recurring[0]
    return {
      key: `manual-${selectedDate}`,
      lich_hoc_id: null,
      ngay_hoc: selectedDate,
      gio_bat_dau: defaultRecurring?.gio_bat_dau || '18:00:00',
      gio_ket_thuc: defaultRecurring?.gio_ket_thuc || '19:30:00',
      so_ban_ghi_diem_danh: 0,
      source: 'manual'
    }
  }, [scheduleOptions, selectedScheduleKey, selectedDate, recurring])

  const students = overview?.hoc_sinh || []

  useEffect(() => {
    if (!selectedSchedule || students.length === 0) {
      setAttendanceDraft({})
      return
    }

    const mapForSchedule = selectedSchedule.lich_hoc_id
      ? (overview?.attendance_map?.[selectedSchedule.lich_hoc_id] || overview?.attendance_map?.[String(selectedSchedule.lich_hoc_id)] || {})
      : {}
    const initialDraft = {}

    students.forEach((student) => {
      const record = mapForSchedule[student.hoc_sinh_id] || mapForSchedule[String(student.hoc_sinh_id)]
      initialDraft[student.hoc_sinh_id] = {
        tinh_trang: record?.tinh_trang || 'co_mat',
        ghi_chu: record?.ghi_chu || ''
      }
    })

    setAttendanceDraft(initialDraft)
  }, [overview, selectedSchedule, students])

  const handleStatusChange = (hocSinhId, tinhTrang) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [hocSinhId]: {
        ...(prev[hocSinhId] || { ghi_chu: '' }),
        tinh_trang: tinhTrang
      }
    }))
  }

  const handleNoteChange = (hocSinhId, ghiChu) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [hocSinhId]: {
        ...(prev[hocSinhId] || { tinh_trang: 'co_mat' }),
        ghi_chu: ghiChu
      }
    }))
  }

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.warning('Lớp học chưa có học sinh đã duyệt')
      return
    }

    if (!selectedSchedule?.ngay_hoc) {
      toast.warning('Vui lòng chọn ngày cần điểm danh')
      return
    }

    const danhSach = students.map((student) => ({
      hoc_sinh_id: student.hoc_sinh_id,
      tinh_trang: attendanceDraft[student.hoc_sinh_id]?.tinh_trang || 'co_mat',
      ghi_chu: attendanceDraft[student.hoc_sinh_id]?.ghi_chu || ''
    }))

    try {
      setSaving(true)
      if (selectedSchedule.lich_hoc_id) {
        await diemDanhAPI.saveDanhSach({
          lich_hoc_id: selectedSchedule.lich_hoc_id,
          danh_sach: danhSach
        })
      } else {
        await diemDanhAPI.saveAttendanceByDate(id, selectedSchedule.ngay_hoc, danhSach)
      }

      toast.success('Lưu điểm danh thành công')
      await fetchOverview(true)
    } catch (error) {
      console.error('Lỗi khi lưu điểm danh:', error)
      toast.error(error.message || 'Không thể lưu điểm danh')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
        Đang tải dữ liệu điểm danh...
      </div>
    )
  }

  const schedules = scheduleOptions

  return (
    <div className="space-y-5 w-full">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Điểm danh theo ngày học</h2>
          <p className="text-sm text-gray-500 mt-1">
            {overview?.lop_hoc?.ten_lop || `Lớp #${id}`} - {overview?.lop_hoc?.ten_mon_hoc || 'Chưa có môn học'}
          </p>
        </div>
        <button
          onClick={goBackToClassManagement}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Danh sách buổi học</h3>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Chọn ngày điểm danh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Chưa có bản ghi trong lịch học cho lớp này. Vui lòng tạo lịch học trước khi điểm danh.
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {schedules.map((schedule) => {
                const active = String(selectedScheduleKey) === String(schedule.key)
                return (
                  <button
                    key={schedule.key}
                    ref={(el) => {
                      if (el) {
                        scheduleItemRefs.current[schedule.key] = el
                      }
                    }}
                    onClick={() => {
                      setSelectedDate(schedule.ngay_hoc)
                      setSelectedScheduleKey(schedule.key)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{schedule.ngay_hoc}</p>
                      {schedule.source !== 'existing' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Mới</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{schedule.gio_bat_dau} - {schedule.gio_ket_thuc}</p>
                    <p className="text-xs mt-1 text-gray-600">Đã điểm danh: {Number(schedule.so_ban_ghi_diem_danh || 0)} học sinh</p>
                  </button>
                )
              })}
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Lịch định kỳ</h4>
            {recurring.length === 0 ? (
              <p className="text-xs text-gray-500">Chưa cấu hình lịch định kỳ</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {recurring.map((item) => (
                  <div key={item.lich_dinh_ky_id} className="p-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-700">
                    <p className="font-medium">{WEEKDAY_LABEL[item.thu_trong_tuan] || `Thứ ${item.thu_trong_tuan}`}</p>
                    <p>{item.gio_bat_dau} - {item.gio_ket_thuc}</p>
                    <p className="text-gray-500">Từ {item.ngay_bat_dau}{item.ngay_ket_thuc ? ` đến ${item.ngay_ket_thuc}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Danh sách học sinh điểm danh</h3>
              {selectedSchedule ? (
                <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1">
                  <Clock3 size={14} />
                  {selectedSchedule.ngay_hoc} ({selectedSchedule.gio_bat_dau} - {selectedSchedule.gio_ket_thuc})
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Chọn một buổi học để điểm danh</p>
              )}
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving || !selectedDate || students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300"
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
            </button>
          </div>

          {!selectedSchedule ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
              Chưa có ngày điểm danh khả dụng.
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
              Lớp học chưa có học sinh đã duyệt.
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student, index) => {
                const current = attendanceDraft[student.hoc_sinh_id] || { tinh_trang: 'co_mat', ghi_chu: '' }
                return (
                  <div key={student.hoc_sinh_id} className="rounded-lg border border-gray-200 p-3.5 bg-gray-50">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {student.ho_ten}
                      </p>
                      {current.tinh_trang === 'co_mat' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-1">
                          <Check size={12} />
                          Đủ
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3 items-center">
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map((option) => {
                          const active = current.tinh_trang === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleStatusChange(student.hoc_sinh_id, option.value)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${active ? option.activeClass : option.idleClass}`}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>

                      <input
                        type="text"
                        value={current.ghi_chu}
                        onChange={(e) => handleNoteChange(student.hoc_sinh_id, e.target.value)}
                        placeholder="Ghi chú (tùy chọn)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
