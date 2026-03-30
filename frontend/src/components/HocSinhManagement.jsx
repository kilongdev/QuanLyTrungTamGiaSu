import { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye, Search, Plus, GraduationCap, Users, Calendar, X, User, Hash, BookUser, AlertTriangle, Mail, Phone } from 'lucide-react';
import { hocSinhAPI } from '@/api/hocSinhApi'; // Import API mới
import { phuHuynhAPI } from '@/api/phuHuynhApi'; // Import API phụ huynh
import { toast } from 'sonner';

export default function HocSinhManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');

  // State cho modal và form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({ ho_ten: '', ngay_sinh: '', khoi_lop: '', phu_huynh_id: '' });
  const [allParents, setAllParents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null, loading: false });
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, loading: false });

  // Gọi API lấy danh sách học sinh
  const fetchStudents = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await hocSinhAPI.getAll({ page, limit: 10, search: searchTerm });
      
      if (response.status === 'success') {
        setStudents(response.data);
        setPagination(response.pagination);
        setError(null);
      } else {
        setError(response.message || 'Lỗi khi tải dữ liệu học sinh');
      }
    } catch (err) {
      setError('Không thể kết nối đến server: ' + (err.message || 'Lỗi không xác định'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách tất cả phụ huynh cho dropdown
  const fetchAllParents = async () => {
    try {
      const response = await phuHuynhAPI.getAll({ limit: 1000 }); // Lấy nhiều để đủ cho dropdown
      if (response.status === 'success') {
        setAllParents(response.data);
      }
    } catch (err) {
      console.error("Không thể tải danh sách phụ huynh:", err);
      toast.error("Lỗi: Không thể tải danh sách phụ huynh.");
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchStudents(1, '');
    fetchAllParents();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchStudents(1, term);
  };

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage, search);
    }
  };
  
  // Các hàm xử lý thao tác (hiện tại chỉ là alert)
  const handleViewDetail = async (studentId) => {
    setDetailModal({ isOpen: true, data: null, loading: true });
    try {
      const response = await hocSinhAPI.getById(studentId);
      if (response.status === 'success') {
        setDetailModal({ isOpen: true, data: response.data, loading: false });
      } else {
        throw new Error(response.message || 'Không thể tải chi tiết học sinh.');
      }
    } catch (err) {
      toast.error(err.message);
      setDetailModal({ isOpen: false, data: null, loading: false });
    }
  };

  // Mở modal để sửa
  const handleEdit = (student) => {
    setModalMode('edit');
    setCurrentStudent(student);
    setFormData({
      ho_ten: student.ho_ten || '',
      ngay_sinh: student.ngay_sinh ? student.ngay_sinh.split(' ')[0] : '', // Format YYYY-MM-DD
      khoi_lop: student.khoi_lop || '',
      phu_huynh_id: student.phu_huynh_id || ''
    });
    setIsModalOpen(true);
  };

  // Mở modal để thêm
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentStudent(null);
    setFormData({ ho_ten: '', ngay_sinh: '', khoi_lop: '', phu_huynh_id: '' });
    setIsModalOpen(true);
  };

  // Xử lý submit form (Thêm/Sửa)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);

    try {
      if (modalMode === 'edit') {
        const response = await hocSinhAPI.update(currentStudent.hoc_sinh_id, formData);
        toast.success(response.message || 'Cập nhật học sinh thành công!');
      } else {
        const response = await hocSinhAPI.create(formData);
        toast.success(response.message || 'Thêm học sinh thành công!');
      }
      setIsModalOpen(false);
      fetchStudents(pagination.page, search);
    } catch (err) {
      const errorMessage = err.message || 'Đã có lỗi xảy ra.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  // Xử lý xóa
  const handleDelete = (student) => {
    setConfirmModal({ isOpen: true, student: student, loading: false });
  };

  // Thực thi xóa sau khi xác nhận
  const executeDelete = async () => {
    if (!confirmModal.student) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      const response = await hocSinhAPI.delete(confirmModal.student.hoc_sinh_id);
      toast.success(response.message || 'Xóa học sinh thành công!');
      // Nếu trang hiện tại trống sau khi xóa, lùi về trang trước
      const newPage = students.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      fetchStudents(newPage, search);
      setConfirmModal({ isOpen: false, student: null, loading: false });
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa học sinh.');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Helper để định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Helper tạo màu avatar ngẫu nhiên dựa trên ID
  const getAvatarColor = (id) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500'];
    return colors[id % colors.length];
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'HS';
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách học sinh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            Quản lý Học Sinh
          </h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý hồ sơ và thông tin học tập của học sinh</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-200 font-medium"
        >
          <Plus size={18} />
          Thêm học sinh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Tổng số học sinh</p>
            <p className="text-3xl font-bold">{pagination.total}</p>
          </div>
          <Users className="absolute right-4 bottom-4 text-white opacity-20" size={48} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
              <p className="text-gray-500 text-sm">Trang hiện tại</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.page} <span className="text-sm text-gray-400 font-normal">/ {pagination.totalPages}</span></p>
           </div>
           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <span className="font-bold">#</span>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên học sinh..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">⚠️ Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {students.length === 0 && !loading ? (
          <div className="p-16 text-center">
            <p className="text-gray-500 text-lg">📭 Không có dữ liệu học sinh</p>
            <p className="text-gray-400 text-sm mt-2">Hãy thêm học sinh mới hoặc thay đổi bộ lọc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học Sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày Sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khối Lớp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phụ Huynh</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => (
                  <tr key={student.hoc_sinh_id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-500">{(pagination.page - 1) * pagination.limit + index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">{student.ho_ten}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm">{formatDate(student.ngay_sinh)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Khối {student.khoi_lop || 'N/A'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.phu_huynh_ten ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{student.phu_huynh_ten}</span>
                          <span className="text-xs text-gray-500">{student.phu_huynh_sdt}</span>
                        </div>
                      ) : <span className="text-gray-400 italic text-sm">Chưa cập nhật</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleViewDetail(student.hoc_sinh_id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(student)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(student)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Trang <span className="font-semibold">{pagination.page}</span> / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Trước</button>
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Sau</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === 'edit' ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {/* Tên học sinh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User size={14} /> Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ho_ten}
                    onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.ngay_sinh}
                    onChange={(e) => setFormData({ ...formData, ngay_sinh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Khối lớp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Hash size={14} /> Khối lớp
                  </label>
                  <input
                    type="text"
                    value={formData.khoi_lop}
                    onChange={(e) => setFormData({ ...formData, khoi_lop: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: 6, 7, 8..."
                  />
                </div>

                {/* Chọn Phụ huynh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <BookUser size={14} /> Phụ huynh <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.phu_huynh_id}
                    onChange={(e) => setFormData({ ...formData, phu_huynh_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Chọn phụ huynh --</option>
                    {allParents.map((parent) => (
                      <option key={parent.phu_huynh_id} value={parent.phu_huynh_id}>
                        {parent.ho_ten}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {modalMode === 'edit' ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-0 text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Xác nhận xóa học sinh
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Bạn có chắc chắn muốn xóa học sinh <span className="font-bold">"{confirmModal.student?.ho_ten}"</span>?
                    </p>
                    <p className="text-sm text-red-600 mt-1">Hành động này không thể được hoàn tác.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, student: null, loading: false })}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                disabled={confirmModal.loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={confirmModal.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {confirmModal.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {detailModal.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : detailModal.data ? (
              <>
                {/* Modal Header */}
                <div className="bg-blue-800 text-white p-5 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{detailModal.data.ho_ten}</h3>
                    <p className="text-blue-100 text-sm">Khối: {detailModal.data.khoi_lop || 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => setDetailModal({ isOpen: false, data: null, loading: false })}
                    className="text-white/70 hover:bg-white/20 p-1 rounded-full transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                  {/* Parent Info */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Thông tin phụ huynh</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <User size={18} className="text-gray-500" />
                        <div>
                          <p className="text-gray-500">Họ tên</p>
                          <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_ten || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <Phone size={18} className="text-gray-500" />
                        <div>
                          <p className="text-gray-500">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_sdt || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg col-span-full">
                        <Mail size={18} className="text-gray-500" />
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_email || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registered Classes */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">📚 Lớp đã đăng ký</h4>
                    {detailModal.data.lop_hoc && detailModal.data.lop_hoc.length > 0 ? (
                      <div className="space-y-3">
                        {detailModal.data.lop_hoc.map((lop) => (
                          <div key={lop.lop_hoc_id} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="font-semibold text-gray-900">{lop.ten_lop || `Lớp ${lop.khoi_lop}`}</p>
                            <p className="text-sm text-gray-600">Gia sư: {lop.gia_su_ten || 'Chưa có'}</p>
                            <p className="text-sm text-gray-600">Trạng thái: <span className="font-medium">{lop.trang_thai}</span></p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <p className="text-yellow-800 text-sm">ℹ️ Học sinh này chưa đăng ký lớp học nào.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}