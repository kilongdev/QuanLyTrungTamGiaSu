import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, Eye, Search, Plus, GraduationCap, Users, Calendar, X, User, Hash, BookUser, AlertTriangle, Mail, Phone, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { hocSinhAPI } from '@/api/hocSinhApi'; // Import API mới
import { phuHuynhAPI } from '@/api/phuHuynhApi'; // Import API phụ huynh
import { lichHocAPI } from '@/api/lichhocApi';
import { toast } from 'sonner';
import { validateStudentForm } from '@/lib/validators';
import DataPagination from '@/components/ui/DataPagination';
import { getAbortSignal } from '@/lib/requestUtils';

export default function HocSinhManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const submitRef = useRef({ isSubmitting: false });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedParent, setSelectedParent] = useState('all');

  // State cho modal và form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({ ho_ten: '', ngay_sinh: '', khoi_lop: '', phu_huynh_id: '' });
  const [allParents, setAllParents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null, loading: false });
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, loading: false });
  const [selectedDetailClassId, setSelectedDetailClassId] = useState(null);
  const [studentDetailWeekDate, setStudentDetailWeekDate] = useState(new Date());

  // Gọi API lấy danh sách học sinh
  const fetchStudents = async (page = 1, searchTerm = '', limit = pageSize) => {
    try {
      setLoading(true);
      const response = await hocSinhAPI.getAll({ page, limit, search: searchTerm });
      
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
    fetchStudents(1, '', 10);
    fetchAllParents();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchStudents(1, term, pageSize);
  };

  const gradeOptions = [...new Set(students.map((student) => String(student.khoi_lop || '').trim()).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  const filteredStudents = students.filter((student) => {
    const gradeMatch = selectedGrade === 'all' || String(student.khoi_lop || '') === selectedGrade;
    const parentMatch = selectedParent === 'all' || String(student.phu_huynh_id || '') === selectedParent;
    return gradeMatch && parentMatch;
  });

  const effectiveTotalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || pageSize)));

  // Xử lý đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= effectiveTotalPages) {
      fetchStudents(newPage, search);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchStudents(1, search, newSize);
  };
  
  // Các hàm xử lý thao tác (hiện tại chỉ là alert)
  const handleViewDetail = async (studentId) => {
    setDetailModal({ isOpen: true, data: null, loading: true });
    try {
      const response = await hocSinhAPI.getById(studentId);
      if (response.status === 'success') {
        const detailData = response.data || {};
        const lopHocList = Array.isArray(detailData.lop_hoc) ? detailData.lop_hoc : [];

        const lichHocByLop = await Promise.all(
          lopHocList.map(async (lop) => {
            try {
              const lichRes = await lichHocAPI.getByLopHoc(lop.lop_hoc_id);
              return {
                ...lop,
                lich_hoc: Array.isArray(lichRes?.data) ? lichRes.data : [],
              };
            } catch (_err) {
              return {
                ...lop,
                lich_hoc: [],
              };
            }
          })
        );

        setDetailModal({
          isOpen: true,
          data: {
            ...detailData,
            lop_hoc: lichHocByLop,
          },
          loading: false,
        });
        setSelectedDetailClassId(lichHocByLop[0]?.lop_hoc_id || null);
        setStudentDetailWeekDate(new Date());
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
    if (submitRef.current.isSubmitting) return;
    submitRef.current.isSubmitting = true;
    const signal = getAbortSignal(`hoc-sinh-submit-${modalMode}-${currentStudent?.hoc_sinh_id || 'new'}`);

    const validationMessage = validateStudentForm(formData);
    if (validationMessage) {
      toast.error(validationMessage);
      submitRef.current.isSubmitting = false;
      return;
    }

    setModalLoading(true);
    setError(null);

    try {
      if (modalMode === 'edit') {
        const response = await hocSinhAPI.update(currentStudent.hoc_sinh_id, formData, { signal });
        toast.success(response.message || 'Cập nhật học sinh thành công!');
      } else {
        const response = await hocSinhAPI.create(formData, { signal });
        toast.success(response.message || 'Thêm học sinh thành công!');
      }
      setIsModalOpen(false);
      fetchStudents(pagination.page, search, pageSize);
    } catch (err) {
      if (err.name === 'AbortError') {
        submitRef.current.isSubmitting = false;
        return;
      }
      const errorMessage = err.message || 'Đã có lỗi xảy ra.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
      submitRef.current.isSubmitting = false;
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
      fetchStudents(newPage, search, pageSize);
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

  const formatThuDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    const day = date.getDay();
    const thu = day === 0 ? 'Chủ Nhật' : `Thứ ${day + 1}`;
    return `${thu}, ${date.toLocaleDateString('vi-VN')}`;
  };

  const getMonday = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const formatDateKey = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(getMonday(studentDetailWeekDate));
    d.setDate(d.getDate() + index);
    return d;
  });

  const weekDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const selectedClassDetail = detailModal.data?.lop_hoc?.find(
    (lop) => Number(lop.lop_hoc_id) === Number(selectedDetailClassId)
  ) || detailModal.data?.lop_hoc?.[0] || null;

  if (loading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        <p className="text-gray-500 mt-4">Đang tải danh sách học sinh...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Học Sinh</h2>
            <p className="text-gray-500 text-sm mt-1">Quản lý hồ sơ và thông tin học tập của học sinh</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md font-medium"
          >
            <Plus size={18} />
            Thêm học sinh
          </button>
        </div>

        {/* Advanced Search - unified block */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none"
              />
            </div>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="md:w-56 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả khối lớp</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Khối {grade}</option>
              ))}
            </select>

            <div className="h-px md:h-10 md:w-px bg-gray-200" />

            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="md:w-64 px-4 py-2.5 bg-transparent focus:outline-none"
            >
              <option value="all">Tất cả phụ huynh</option>
              {allParents.map((parent) => (
                <option key={parent.phu_huynh_id} value={String(parent.phu_huynh_id)}>
                  {parent.ho_ten}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">⚠️ Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Table */}
        {filteredStudents.length === 0 && !loading ? (
          <div className="p-16 text-center border-b border-gray-200">
            <p className="text-gray-600 text-lg font-medium">Không có dữ liệu học sinh</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc nâng cao</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-200">
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
                {filteredStudents.map((student, index) => (
                  <tr key={student.hoc_sinh_id} className="hover:bg-red-50/40 transition-colors duration-200">
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
                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center justify-center bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Khối {student.khoi_lop || 'N/A'}</span></td>
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
                        <button onClick={() => handleViewDetail(student.hoc_sinh_id)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(student)} className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(student)} className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DataPagination
          page={pagination.page}
          totalPages={effectiveTotalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit || pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="học sinh"
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all overflow-hidden border border-gray-200">
            <div className="p-5 flex justify-between items-center border-b bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            {modalMode === 'add' && (
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Lưu ý:</strong> Học sinh phải thuộc về một phụ huynh sẵn có. Nếu cần thêm phụ huynh mới, vui lòng thêm ở mục Quản lý Phụ Huynh trước.
                </p>
              </div>
            )}
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-red-800 text-white rounded-xl font-medium hover:bg-red-900 transition disabled:opacity-50 flex items-center gap-2"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all overflow-hidden">
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
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            {detailModal.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
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
                    className="text-white/80 hover:bg-white/20 p-1 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 space-y-5 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-gray-500">Phụ huynh</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_ten || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-gray-500">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_sdt || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:col-span-2">
                      <p className="text-gray-500">Email phụ huynh</p>
                      <p className="font-semibold text-gray-900">{detailModal.data.phu_huynh_email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-3">Lớp đã đăng ký</h4>
                    {detailModal.data.lop_hoc && detailModal.data.lop_hoc.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {detailModal.data.lop_hoc.map((lop) => (
                            <button
                              key={lop.lop_hoc_id}
                              type="button"
                              onClick={() => setSelectedDetailClassId(lop.lop_hoc_id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${Number(selectedClassDetail?.lop_hoc_id) === Number(lop.lop_hoc_id)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {lop.ten_lop || `Lớp ${lop.khoi_lop}`}
                            </button>
                          ))}
                        </div>

                        {selectedClassDetail && (
                          <div className="border border-gray-200 rounded-xl p-3 bg-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <p className="text-xs text-gray-600">Gia sư: {selectedClassDetail.gia_su_ten || 'Chưa có'} • Trạng thái: {selectedClassDetail.trang_thai || 'N/A'}</p>
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-2 py-1 w-fit">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Date(studentDetailWeekDate);
                                    next.setDate(next.getDate() - 7);
                                    setStudentDetailWeekDate(next);
                                  }}
                                  className="p-1 rounded hover:bg-white"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-semibold text-gray-700">Tuần này</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Date(studentDetailWeekDate);
                                    next.setDate(next.getDate() + 7);
                                    setStudentDetailWeekDate(next);
                                  }}
                                  className="p-1 rounded hover:bg-white"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                              {weekDays.map((dayDate, idx) => {
                                const dayKey = formatDateKey(dayDate);
                                const schedules = (selectedClassDetail.lich_hoc || [])
                                  .filter((item) => item.ngay_hoc === dayKey)
                                  .sort((a, b) => (a.gio_bat_dau || '').localeCompare(b.gio_bat_dau || ''));

                                return (
                                  <div key={dayKey} className="border border-gray-200 rounded-lg p-2 bg-gray-50 min-h-[120px]">
                                    <p className="text-xs font-bold text-gray-700">{weekDayNames[idx]}</p>
                                    <p className="text-[11px] text-gray-500 mb-2">{dayDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                                    {schedules.length === 0 ? (
                                      <p className="text-[11px] text-gray-400">Trống</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {schedules.map((lh) => (
                                          <div key={lh.lich_hoc_id} className="bg-white border border-blue-100 rounded px-2 py-1">
                                            <p className="text-[11px] text-gray-700 flex items-center gap-1">
                                              <Clock size={10} /> {lh.gio_bat_dau?.substring(0,5)} - {lh.gio_ket_thuc?.substring(0,5)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-xl p-3 text-sm text-gray-500">Chưa có lớp học đăng ký.</div>
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