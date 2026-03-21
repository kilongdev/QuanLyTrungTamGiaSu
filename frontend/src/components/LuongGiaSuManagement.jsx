import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import DataPagination from '@/components/ui/DataPagination'

export default function LuongGiaSuManagement({ user }) {
  const [luongData, setLuongData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTutor, setSelectedTutor] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchLuongData()
  }, [])

  const fetchLuongData = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php?route=/luonggiasu', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setLuongData(data.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu lương:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLuongData = luongData.filter((item) => {
    const keyword = searchTerm.toLowerCase().trim()
    const tenGiaSu = String(item.ten_giasu || '').toLowerCase()
    const thang = String(item.thang || '').toLowerCase()

    const keywordMatch = !keyword || tenGiaSu.includes(keyword) || thang.includes(keyword)
    const monthMatch = selectedMonth === 'all' || String(item.thang || '') === selectedMonth
    const tutorMatch = selectedTutor === 'all' || String(item.ten_giasu || '') === selectedTutor

    return keywordMatch && monthMatch && tutorMatch
  })

  const monthOptions = [...new Set(luongData.map((item) => String(item.thang || '').trim()).filter(Boolean))]
  const tutorOptions = [...new Set(luongData.map((item) => String(item.ten_giasu || '').trim()).filter(Boolean))]

  const totalPages = Math.max(1, Math.ceil(filteredLuongData.length / itemsPerPage))
  const paginatedLuongData = filteredLuongData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, selectedTutor])

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
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Lương Gia sư</h2>
            <p className="text-gray-500 text-sm mt-1">Theo dõi chi trả lương và trạng thái thanh toán gia sư</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2 rounded-xl transition">
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
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredLuongData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có dữ liệu lương</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gia sư</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLuongData.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-red-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.ten_giasu || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.so_tien?.toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.thang || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.ngay_tao || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
