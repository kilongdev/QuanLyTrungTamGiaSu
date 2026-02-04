import { useState, useEffect } from 'react'
import { authAPI, otpAPI } from '../api/authApi'

const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'phu_huynh',
  studentName: '',
  studentBirthday: '',
  studentGrade: '1'
}

export default function Register({ onSwitchToLogin, onRegisterSuccess, onClose }) {
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('registerStep')
    return saved ? parseInt(saved) : 1
  })
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('registerForm')
    return saved ? JSON.parse(saved) : defaultFormData
  })
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState(() => sessionStorage.getItem('otpToken') || '')
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    sessionStorage.setItem('registerForm', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    sessionStorage.setItem('registerStep', step.toString())
  }, [step])

  useEffect(() => {
    if (otpToken) sessionStorage.setItem('otpToken', otpToken)
  }, [otpToken])

  const clearFormData = () => {
    sessionStorage.removeItem('registerForm')
    sessionStorage.removeItem('registerStep')
    sessionStorage.removeItem('otpToken')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Vui lòng nhập email')
      return
    }
    setSendingOtp(true)
    setError('')

    try {
      const data = await otpAPI.send(formData.email)
      if (data.status === 'success') {
        setOtpToken(data.data.token)
        setStep(2)
        startCountdown()
        if (data.data.dev_otp) {
          setOtp(data.data.dev_otp)
        }
      } else {
        setError(data.message || 'Không thể gửi OTP')
      }
    } catch (err) {
      setError(err.message || 'Lỗi gửi OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    await handleSendOtp()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    if (step === 1) {
      setLoading(false)
      await handleSendOtp()
      return
    }

    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số')
      setLoading(false)
      return
    }

    try {
      const otpResult = await otpAPI.verify(otpToken, otp)
      if (otpResult.status !== 'success') {
        setError(otpResult.message || 'Mã OTP không đúng')
        setLoading(false)
        return
      }

      const data = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        student: formData.role === 'phu_huynh' ? {
          name: formData.studentName,
          birthday: formData.studentBirthday,
          grade: formData.studentGrade
        } : null
      })

      if (data.status === 'success') {
        clearFormData()
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onRegisterSuccess?.(data.data)
      } else {
        setError(data.message || 'Đăng ký thất bại')
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const grades = [
    { value: 'mam_non', label: 'Mầm non' },
    { value: '1', label: 'Lớp 1' },
    { value: '2', label: 'Lớp 2' },
    { value: '3', label: 'Lớp 3' },
    { value: '4', label: 'Lớp 4' },
    { value: '5', label: 'Lớp 5' },
    { value: '6', label: 'Lớp 6' },
    { value: '7', label: 'Lớp 7' },
    { value: '8', label: 'Lớp 8' },
    { value: '9', label: 'Lớp 9' },
    { value: '10', label: 'Lớp 10' },
    { value: '11', label: 'Lớp 11' },
    { value: '12', label: 'Lớp 12' },
    { value: 'dai_hoc', label: 'Đại học' },
    { value: 'khac', label: 'Khác' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 text-xl font-bold transition"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Đăng ký tài khoản' : 'Xác thực Email'}
          </h2>
          <p className="text-gray-500 mt-1">
            {step === 1 ? 'Tạo tài khoản để sử dụng dịch vụ' : `Nhập mã OTP đã gửi đến ${formData.email}`}
          </p>
        </div>

        {step === 2 ? (
          /* OTP Form */
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mã OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                placeholder="Nhập mã 6 số"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-blue-500 focus:ring-0 outline-none"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-gray-500">Gửi lại sau <span className="text-blue-600 font-semibold">{countdown}s</span></span>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={sendingOtp} className="text-blue-600 hover:underline font-medium">
                  {sendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError('') }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        ) : (
          /* Register Form - Horizontal Layout */
          <form onSubmit={handleSubmit}>
            <div className="flex gap-8">
              {/* Left Column - Account Info */}
              <div className="flex-1 space-y-4">
                <h3 className="font-semibold text-gray-700 text-lg border-b pb-2">Thông tin tài khoản</h3>
                
                {/* Role Selection */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Bạn là</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'phu_huynh' })}
                      className={`py-3 px-4 rounded-xl font-medium border-2 transition ${
                        formData.role === 'phu_huynh'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Phụ huynh
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'gia_su' })}
                      className={`py-3 px-4 rounded-xl font-medium border-2 transition ${
                        formData.role === 'gia_su'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Gia sư
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@gmail.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Right Column - Student Info (only for phu_huynh) */}
              {formData.role === 'phu_huynh' && (
                <div className="flex-1 space-y-4">
                  <h3 className="font-semibold text-gray-700 text-lg border-b pb-2">Thông tin học sinh</h3>
                  
                  {/* Student Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tên học sinh</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn B"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Student Birthday */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      name="studentBirthday"
                      value={formData.studentBirthday}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Student Grade */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Khối lớp</label>
                    <select
                      name="studentGrade"
                      value={formData.studentGrade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                    >
                      {grades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || sendingOtp}
              className="w-full py-4 mt-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition text-lg"
            >
              {loading || sendingOtp ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">
          Đã có tài khoản?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  )
}
