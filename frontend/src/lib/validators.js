const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneVN: /^(0\d{9}|\+84\d{9})$/,
  fullName: /^[\p{L}][\p{L}\s'.-]{1,99}$/u,
  passwordStrong: /^(?=.*[A-Za-z])(?=.*\d).{6,100}$/,
  className: /^[\p{L}\p{N}\s()_.-]{2,100}$/u,
  grade: /^(?:[1-9]|1[0-2])$/,
  dateYMD: /^\d{4}-\d{2}-\d{2}$/,
  time24h: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  positiveNumber: /^(?:0|[1-9]\d*)(?:\.\d+)?$/,
  integerId: /^\d+$/
}

export function validateParentForm(data, { requirePassword = false } = {}) {
  if (!REGEX.fullName.test(String(data.ho_ten || '').trim())) {
    return 'Họ tên không hợp lệ (2-100 ký tự chữ).'
  }
  if (!REGEX.email.test(String(data.email || '').trim())) {
    return 'Email không đúng định dạng.'
  }
  if (!REGEX.phoneVN.test(String(data.so_dien_thoai || '').trim())) {
    return 'Số điện thoại không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx).'
  }
  const password = String(data.mat_khau || '')
  if (requirePassword && !REGEX.passwordStrong.test(password)) {
    return 'Mật khẩu tối thiểu 6 ký tự và phải có cả chữ lẫn số.'
  }
  if (!requirePassword && password && !REGEX.passwordStrong.test(password)) {
    return 'Mật khẩu tối thiểu 6 ký tự và phải có cả chữ lẫn số.'
  }
  if (String(data.dia_chi || '').trim().length < 5) {
    return 'Địa chỉ tối thiểu 5 ký tự.'
  }
  return ''
}

export function validateTutorForm(data, { requirePassword = false } = {}) {
  if (!REGEX.fullName.test(String(data.ho_ten || '').trim())) {
    return 'Họ tên không hợp lệ (2-100 ký tự chữ).'
  }
  if (!REGEX.email.test(String(data.email || '').trim())) {
    return 'Email không đúng định dạng.'
  }
  if (!REGEX.phoneVN.test(String(data.so_dien_thoai || '').trim())) {
    return 'Số điện thoại không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx).'
  }
  const password = String(data.mat_khau || '')
  if (requirePassword && !REGEX.passwordStrong.test(password)) {
    return 'Mật khẩu tối thiểu 6 ký tự và phải có cả chữ lẫn số.'
  }
  if (!requirePassword && password && !REGEX.passwordStrong.test(password)) {
    return 'Mật khẩu tối thiểu 6 ký tự và phải có cả chữ lẫn số.'
  }
  return ''
}

export function validateStudentForm(data) {
  if (!REGEX.fullName.test(String(data.ho_ten || '').trim())) {
    return 'Tên học sinh không hợp lệ.'
  }
  if (!REGEX.dateYMD.test(String(data.ngay_sinh || '').trim())) {
    return 'Ngày sinh không đúng định dạng YYYY-MM-DD.'
  }
  if (!REGEX.grade.test(String(data.khoi_lop || '').trim())) {
    return 'Khối lớp chỉ từ 1 đến 12.'
  }
  if (!REGEX.integerId.test(String(data.phu_huynh_id || '').trim())) {
    return 'Phụ huynh không hợp lệ.'
  }
  return ''
}

export function validateClassForm(data) {
  if (!REGEX.integerId.test(String(data.mon_hoc_id || '').trim())) {
    return 'Môn học không hợp lệ.'
  }
  const tenLop = String(data.ten_lop || '').trim()
  if (tenLop && !REGEX.className.test(tenLop)) {
    return 'Tên lớp không hợp lệ.'
  }
  if (!REGEX.grade.test(String(data.khoi_lop || '').trim())) {
    return 'Khối lớp chỉ từ 1 đến 12.'
  }

  const numericFields = ['gia_toan_khoa', 'so_buoi_hoc', 'gia_moi_buoi', 'so_luong_toi_da', 'gia_tri_chi_tra']
  for (const field of numericFields) {
    const val = String(data[field] ?? '').trim()
    if (val && !REGEX.positiveNumber.test(val)) {
      return `Giá trị ${field} không hợp lệ.`
    }
  }

  if (String(data.loai_chi_tra || '').trim() === 'phan_tram') {
    const percent = Number(String(data.gia_tri_chi_tra || '').trim())
    if (!Number.isFinite(percent) || percent <= 50 || percent >= 100) {
      return 'Phần trăm chia phí phải lớn hơn 50% và nhỏ hơn 100%.'
    }
  }

  if (String(data.gia_su_id || '').trim() && !REGEX.integerId.test(String(data.gia_su_id).trim())) {
    return 'Gia sư không hợp lệ.'
  }

  if (String(data.ngay_ket_thuc || '').trim() && !REGEX.dateYMD.test(String(data.ngay_ket_thuc).trim())) {
    return 'Ngày kết thúc không đúng định dạng YYYY-MM-DD.'
  }

  return ''
}

export function validateScheduleForm(data) {
  if (!REGEX.integerId.test(String(data.lop_hoc_id || '').trim())) {
    return 'Lớp học không hợp lệ.'
  }
  if (!REGEX.dateYMD.test(String(data.ngay_hoc || '').trim())) {
    return 'Ngày học không đúng định dạng YYYY-MM-DD.'
  }
  if (!REGEX.time24h.test(String(data.gio_bat_dau || '').trim()) || !REGEX.time24h.test(String(data.gio_ket_thuc || '').trim())) {
    return 'Giờ học không đúng định dạng HH:mm.'
  }
  return ''
}

export function validateRegistrationForm(data) {
  if (!REGEX.integerId.test(String(data.hoc_sinh_id || '').trim())) {
    return 'Học sinh không hợp lệ.'
  }
  if (!REGEX.integerId.test(String(data.lop_hoc_id || '').trim())) {
    return 'Lớp học không hợp lệ.'
  }
  return ''
}

export function validateRequestForm(data) {
  const title = String(data.tieu_de || '').trim()
  const content = String(data.noi_dung || '').trim()

  if (!/^[\p{L}\p{N}\s()_.!?:,-]{5,150}$/u.test(title)) {
    return 'Tiêu đề phải từ 5-150 ký tự hợp lệ.'
  }
  if (content.length < 10 || content.length > 2000) {
    return 'Nội dung yêu cầu phải từ 10-2000 ký tự.'
  }
  return ''
}
