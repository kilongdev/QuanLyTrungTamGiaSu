import { useState, useEffect } from 'react'
import { authAPI } from '../api/authApi'

export default function Login({ onSwitchToRegister, onLoginSuccess, onClose }) {
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('loginForm')
    return saved ? JSON.parse(saved) : { identifier: '', password: '' }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    sessionStorage.setItem('loginForm', JSON.stringify(formData))
  }, [formData])

  const clearFormData = () => sessionStorage.removeItem('loginForm')

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const isPhone = (value) => /^(0|\+84)[0-9]{9,10}$/.test(value.replace(/\s/g, ''))

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const identifier = formData.identifier.trim()
    
    if (!isEmail(identifier) && !isPhone(identifier)) {
      setError('Vui lòng nhập email hoặc số điện thoại hợp lệ')
      setLoading(false)
      return
    }

    const loginData = { password: formData.password }
    if (isEmail(identifier)) {
      loginData.email = identifier
    } else {
      loginData.phone = identifier.replace(/\s/g, '')
    }

    try {
      const data = await authAPI.login(loginData)
      if (data.status === 'success') {
        clearFormData()
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onLoginSuccess?.(data.data)
      } else {
        setError(data.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full text-2xl font-bold"
          >
            ×
          </button>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Đăng nhập</h2>
        <p className="text-gray-500 mb-6">Chào mừng bạn trở lại</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1.5">Email hoặc Số điện thoại</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="text-right">
            <a href="#" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 text-base"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Chưa có tài khoản?{' '}
          <button onClick={onSwitchToRegister} className="text-blue-600 font-medium hover:underline">
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  )
}
