import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import DataPagination from '@/components/ui/DataPagination'

export default function HocPhiManagement({ user }) {
  const [hocPhiData, setHocPhiData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchHocPhiData()
  }, [])

  const fetchHocPhiData = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php?route=/hocphi', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setHocPhiData(data.data || [])
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu học phí:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHocPhiData = hocPhiData.filter((item) => {
    const keyword = searchTerm.toLowerCase().trim()
    const tenHocSinh = String(item.ten_hocsinh || '').toLowerCase()
    const thang = String(item.thang || '').toLowerCase()
    const trangThai = String(item.trang_thai || '').toLowerCase()

    const keywordMatch = !keyword || tenHocSinh.includes(keyword) || thang.includes(keyword) || trangThai.includes(keyword)
    const monthMatch = selectedMonth === 'all' || String(item.thang || '') === selectedMonth
    const statusMatch = selectedStatus === 'all' || String(item.trang_thai || '') === selectedStatus

    return keywordMatch && monthMatch && statusMatch
  })

  const monthOptions = [...new Set(hocPhiData.map((item) => String(item.thang || '').trim()).filter(Boolean))]
  const statusOptions = [...new Set(hocPhiData.map((item) => String(item.trang_thai || '').trim()).filter(Boolean))]

  const totalPages = Math.max(1, Math.ceil(filteredHocPhiData.length / itemsPerPage))
  const paginatedHocPhiData = filteredHocPhiData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, selectedStatus])

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
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Học phí</h2>
            <p className="text-gray-500 text-sm mt-1">Theo dõi học phí theo học sinh, tháng và trạng thái thanh toán</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2 rounded-xl transition">
            <Plus className="w-5 h-5" />
            Thêm học phí
          </button>
        </div>

        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo học sinh..."
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="md:w-64 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status === 'da_thanh_toan' ? 'Đã thanh toán' : status === 'chua_thanh_toan' ? 'Chưa thanh toán' : status}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredHocPhiData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có dữ liệu học phí</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHocPhiData.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-red-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.ten_hocsinh || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.so_tien?.toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.thang || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.trang_thai === 'da_thanh_toan' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
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
          totalItems={filteredHocPhiData.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="học phí"
        />
      </div>
    </div>
  )
}
