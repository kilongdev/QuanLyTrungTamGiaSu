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
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-xl"
          >
            ×
          </button>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
        <p className="text-gray-500 text-sm mb-5">Chào mừng bạn trở lại</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email hoặc Số điện thoại</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm text-gray-900 bg-white"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="text-right">
            <a href="#" className="text-red-600 hover:underline text-sm">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 text-sm"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-5">
          Chưa có tài khoản?{' '}
          <button onClick={onSwitchToRegister} className="text-red-600 font-medium hover:underline">
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  )
}
