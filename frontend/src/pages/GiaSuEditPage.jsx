import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { giaSuAPI } from '../api/giaSuApi'
import { monHocAPI } from '../api/monhocApi'
import { giaSuMonHocAPI } from '../api/giasumonhocApi'
import { validateTutorForm } from '@/lib/validators'

const STATUS_OPTIONS = [
  { value: 'cho_duyet', label: 'Chờ duyệt' },
  { value: 'da_duyet', label: 'Đã duyệt' },
  { value: 'tu_choi', label: 'Từ chối' },
  { value: 'khoa', label: 'Bị khóa' },
]

export default function GiaSuEditPage({ tutorId }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [existingLinks, setExistingLinks] = useState([])
  const submitRef = useRef({ isSubmitting: false })

  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    mat_khau: '',
    ngay_sinh: '',
    gioi_tinh: '',
    dia_chi: '',
    bang_cap: '',
    kinh_nghiem: '',
    gioi_thieu: '',
    so_tai_khoan_ngan_hang: '',
    ten_ngan_hang: '',
    trang_thai: 'cho_duyet',
  })

  const goBack = () => {
    localStorage.setItem('admin_active_item', 'giasu')
    navigate('/dashboard')
  }

  useEffect(() => {
    if (!tutorId) return

    const loadDetail = async () => {
      try {
        setLoading(true)
        const [response, subjectsRes, linksRes] = await Promise.all([
          giaSuAPI.getById(tutorId),
          monHocAPI.getAll(),
          giaSuMonHocAPI.getAll({ gia_su_id: tutorId, limit: 1000 }),
        ])

        if (response.status !== 'success' || !response.data) {
          toast.error('Không tìm thấy gia sư')
          goBack()
          return
        }

        const tutor = response.data
        setSubjects(subjectsRes?.data || [])

        const links = Array.isArray(linksRes?.data) ? linksRes.data : []
        setExistingLinks(links)

        const fromDetail = Array.isArray(tutor.mon_hoc) ? tutor.mon_hoc.map((item) => String(item.mon_hoc_id)) : []
        const fromLinks = links.map((item) => String(item.mon_hoc_id))
        setSelectedSubjectIds(fromDetail.length > 0 ? fromDetail : fromLinks)

        setFormData({
          ho_ten: tutor.ho_ten || '',
          email: tutor.email || '',
          so_dien_thoai: tutor.so_dien_thoai || '',
          mat_khau: '',
          ngay_sinh: tutor.ngay_sinh ? tutor.ngay_sinh.substring(0, 10) : '',
          gioi_tinh: tutor.gioi_tinh || '',
          dia_chi: tutor.dia_chi || '',
          bang_cap: tutor.bang_cap || '',
          kinh_nghiem: tutor.kinh_nghiem || '',
          gioi_thieu: tutor.gioi_thieu || '',
          so_tai_khoan_ngan_hang: tutor.so_tai_khoan_ngan_hang || '',
          ten_ngan_hang: tutor.ten_ngan_hang || '',
          trang_thai: tutor.trang_thai || 'cho_duyet',
        })
      } catch (error) {
        toast.error(error.message || 'Không thể tải thông tin gia sư')
        goBack()
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [tutorId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitRef.current.isSubmitting) return

    const validationMessage = validateTutorForm(formData)
    if (validationMessage) {
      toast.warning(validationMessage)
      return
    }

    try {
      submitRef.current.isSubmitting = true
      setSaving(true)

      const payload = { ...formData }
      if (!String(payload.mat_khau || '').trim()) {
        delete payload.mat_khau
      }

      const result = await giaSuAPI.update(tutorId, payload)
      if (result.status === 'success') {
        const selectedSet = new Set(selectedSubjectIds.map((item) => String(item)))
        const currentLinks = Array.isArray(existingLinks) ? existingLinks : []

        const toDelete = currentLinks.filter((link) => !selectedSet.has(String(link.mon_hoc_id)))
        const existingSubjectSet = new Set(currentLinks.map((link) => String(link.mon_hoc_id)))
        const toCreate = selectedSubjectIds
          .map((item) => String(item))
          .filter((subjectId) => !existingSubjectSet.has(subjectId))

        await Promise.all(toDelete.map((link) => giaSuMonHocAPI.delete(link.gia_su_mon_hoc_id)))
        await Promise.all(toCreate.map((subjectId) => giaSuMonHocAPI.create({
          gia_su_id: Number(tutorId),
          mon_hoc_id: Number(subjectId),
        })))

        toast.success('Cập nhật gia sư thành công')
        goBack()
      } else {
        throw new Error(result.message || 'Cập nhật thất bại')
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật gia sư')
    } finally {
      submitRef.current.isSubmitting = false
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='bg-white rounded-2xl border border-gray-200 p-10 text-center'>
        <div className='mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-red-700 border-t-transparent' />
        <p className='text-gray-500'>Đang tải thông tin gia sư...</p>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>Chỉnh sửa gia sư</h2>
          <p className='text-sm text-gray-500 mt-1'>Trang chỉnh sửa đầy đủ thông tin hồ sơ gia sư</p>
        </div>
        <button
          onClick={goBack}
          className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className='bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Họ và tên</label>
            <input
              type='text'
              value={formData.ho_ten}
              onChange={(e) => setFormData((prev) => ({ ...prev, ho_ten: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <input
              type='email'
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
            <input
              type='tel'
              value={formData.so_dien_thoai}
              onChange={(e) => setFormData((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu mới (tùy chọn)</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.mat_khau}
                onChange={(e) => setFormData((prev) => ({ ...prev, mat_khau: e.target.value }))}
                className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg'
                placeholder='Để trống nếu không đổi mật khẩu'
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Ngày sinh</label>
            <input
              type='date'
              value={formData.ngay_sinh}
              onChange={(e) => setFormData((prev) => ({ ...prev, ngay_sinh: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Giới tính</label>
            <select
              value={formData.gioi_tinh}
              onChange={(e) => setFormData((prev) => ({ ...prev, gioi_tinh: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            >
              <option value=''>Chọn giới tính</option>
              <option value='Nam'>Nam</option>
              <option value='Nữ'>Nữ</option>
              <option value='Khác'>Khác</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Trạng thái</label>
            <select
              value={formData.trang_thai}
              onChange={(e) => setFormData((prev) => ({ ...prev, trang_thai: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ</label>
            <input
              type='text'
              value={formData.dia_chi}
              onChange={(e) => setFormData((prev) => ({ ...prev, dia_chi: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Môn có thể dạy (chọn nhiều)</label>
            <div className='max-h-56 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 space-y-1'>
              {subjects.length === 0 ? (
                <p className='text-sm text-gray-500'>Chưa tải được danh sách môn học</p>
              ) : (
                subjects.map((subject) => {
                  const checked = selectedSubjectIds.includes(String(subject.mon_hoc_id))
                  return (
                    <label key={subject.mon_hoc_id} className='flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={(e) => {
                          const id = String(subject.mon_hoc_id)
                          if (e.target.checked) {
                            setSelectedSubjectIds((prev) => [...prev, id])
                          } else {
                            setSelectedSubjectIds((prev) => prev.filter((item) => item !== id))
                          }
                        }}
                      />
                      <span className='text-sm text-gray-800'>{subject.ten_mon_hoc}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Bằng cấp</label>
            <input
              type='text'
              value={formData.bang_cap}
              onChange={(e) => setFormData((prev) => ({ ...prev, bang_cap: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Kinh nghiệm</label>
            <input
              type='text'
              value={formData.kinh_nghiem}
              onChange={(e) => setFormData((prev) => ({ ...prev, kinh_nghiem: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Số tài khoản</label>
            <input
              type='text'
              value={formData.so_tai_khoan_ngan_hang}
              onChange={(e) => setFormData((prev) => ({ ...prev, so_tai_khoan_ngan_hang: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Ngân hàng</label>
            <input
              type='text'
              value={formData.ten_ngan_hang}
              onChange={(e) => setFormData((prev) => ({ ...prev, ten_ngan_hang: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Giới thiệu</label>
            <textarea
              value={formData.gioi_thieu}
              onChange={(e) => setFormData((prev) => ({ ...prev, gioi_thieu: e.target.value }))}
              rows={5}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>
        </div>

        <div className='pt-3 border-t border-gray-200 flex justify-end gap-3'>
          <button
            type='button'
            onClick={goBack}
            className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
          >
            Hủy
          </button>
          <button
            type='submit'
            disabled={saving}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300'
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
