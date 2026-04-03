import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Plus, Edit2, Trash2, MoreVertical, X, AlertTriangle, CheckCircle, UserCheck, Lock, ChevronLeft, ChevronRight, FileText, Eye, Search, Filter } from 'lucide-react';
import { lichHocAPI } from '../api/lichhocApi';
import { diemDanhAPI } from '../api/diemdanhApi';
import { getAbortSignal } from '../lib/requestUtils';
export default function LichHocManagement({ user }) {
    const [lichHocs, setLichHocs] = useState([]);
    const [lopHocs, setLopHocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false); 
    const submitRef = useRef({ isSubmitting: false });
    const [editingId, setEditingId] = useState(null);
    const [showSettings, setShowSettings] = useState(null);
    const [searchTermAdmin, setSearchTermAdmin] = useState("");
    const [statusFilterAdmin, setStatusFilterAdmin] = useState("all");
    const [detailModal, setDetailModal] = useState({ show: false, data: null });
    // CẬP NHẬT FORM DATA (Thêm thoi_gian_tung_ngay)
    const [formData, setFormData] = useState({ 
        lop_hoc_id: '', 
        ngay_hoc: '', 
        gio_bat_dau: '', 
        gio_ket_thuc: '',
        tao_chu_ky: false,
        ngay_bat_dau: '',
        ngay_trong_tuan: [],
        thoi_gian_tung_ngay: {} // Ví dụ: { 3: { gio_bat_dau: "18:00", gio_ket_thuc: "19:30" } }
    });

    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    const [showDiemDanhModal, setShowDiemDanhModal] = useState(false);
    const [selectedLichHocId, setSelectedLichHocId] = useState(null);
    const [diemDanhList, setDiemDanhList] = useState([]);
    const [loadingDiemDanh, setLoadingDiemDanh] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const todayString = new Date().toLocaleDateString('en-CA'); 

    const isReadOnly = user?.role !== 'admin' && user?.role !== 'gia_su';

    useEffect(() => {
        fetchLichHocs();
        if (user?.role === 'admin') {
            fetchLopHocs();
        }
    }, [user]);

    const fetchLopHocs = async () => {
        try {
            const res = await lichHocAPI.getLopHocs();
            setLopHocs(res?.data || []);
        } catch (error) {
            console.error("Lỗi tải danh sách lớp:", error);
        }
    }

    const fetchLichHocs = async () => {
        try {
            setLoading(true);
            let response;
            const userId = user?.id || user?.gia_su_id || user?.phu_huynh_id || user?.tai_khoan_id || '1';

            if (user?.role === 'admin') response = await lichHocAPI.getAll();
            else if (user?.role === 'gia_su') response = await lichHocAPI.getByGiaSu(userId);
            else response = await lichHocAPI.getByPhuHuynh(userId);

            setLichHocs(response?.data || []);
        } catch (error) {
            console.error('Lỗi khi tải lịch học:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkIsOverdue = (ngay_hoc, gio_ket_thuc) => {
        const now = new Date();
        const classEndDateTime = new Date(`${ngay_hoc}T${gio_ket_thuc}`);
        return now > classEndDateTime;
    };

    const checkCanChotCa = (ngay_hoc, gio_bat_dau) => {
        const now = new Date();
        const classStartDateTime = new Date(`${ngay_hoc}T${gio_bat_dau}`);
        return now >= classStartDateTime;
    };

    const getStatusInfo = (status, ngay_hoc, gio_ket_thuc, role) => {
        if (status === 'da_hoc') return { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-700' };
        if (status === 'da_huy') return { label: 'Đã hủy', color: 'bg-red-100 text-red-700' };
        
        if (ngay_hoc && gio_ket_thuc && checkIsOverdue(ngay_hoc, gio_ket_thuc)) {
            if (role === 'admin') return { label: 'Quá hạn chốt', color: 'bg-orange-100 text-orange-700 font-bold border border-orange-200' };
            if (role !== 'gia_su') return { label: 'Chờ gia sư chốt', color: 'bg-gray-100 text-gray-600' };
        }
        return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700' };
    };

    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const formatDateString = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [d.getFullYear(), month, day].join('-');
    };

    const weekStart = getMonday(currentDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const resetForm = () => {
        setFormData({ 
            lop_hoc_id: '', 
            ngay_hoc: '', 
            gio_bat_dau: '', 
            gio_ket_thuc: '',
            tao_chu_ky: false,
            ngay_bat_dau: '',
            ngay_trong_tuan: [],
            thoi_gian_tung_ngay: {}
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate dữ liệu theo từng trường hợp
        if (submitRef.current.isSubmitting) return;
        submitRef.current.isSubmitting = true;
        const signal = getAbortSignal(`lich-hoc-submit-${editingId || 'new'}`);

        // Validate dữ liệu theo từng trường hợp
        if (!formData.tao_chu_ky) {
            if (formData.gio_bat_dau >= formData.gio_ket_thuc) {
                setAlertModal({ show: true, message: 'Giờ kết thúc phải lớn hơn Giờ bắt đầu!', type: 'error' });
                submitRef.current.isSubmitting = false;
                return;
            }
        } else {
            if (formData.ngay_trong_tuan.length === 0) {
                setAlertModal({ show: true, message: 'Vui lòng chọn ít nhất 1 ngày trong tuần để xếp lịch định kỳ!', type: 'error' });
                submitRef.current.isSubmitting = false;
                return;
            }
            // Check giờ riêng của từng thứ
            for (let day of formData.ngay_trong_tuan) {
                const time = formData.thoi_gian_tung_ngay[day];
                if (!time || !time.gio_bat_dau || !time.gio_ket_thuc) {
                    setAlertModal({ show: true, message: 'Vui lòng nhập đầy đủ giờ học cho tất cả các Thứ đã chọn!', type: 'error' });
                    submitRef.current.isSubmitting = false;
                    return;
                }
                if (time.gio_bat_dau >= time.gio_ket_thuc) {
                    setAlertModal({ show: true, message: 'Giờ kết thúc phải lớn hơn Giờ bắt đầu ở tất cả các ngày!', type: 'error' });
                    submitRef.current.isSubmitting = false;
                    return;
                }
            }
        }

        try {
            if (editingId) {
                await lichHocAPI.update(editingId, formData, { signal });
                setAlertModal({ show: true, message: 'Cập nhật lịch học thành công!', type: 'success' });
            } else {
                await lichHocAPI.create(formData, { signal });
                setAlertModal({ show: true, message: formData.tao_chu_ky ? 'Hệ thống đã tự động tạo lịch chu kỳ thành công!' : 'Tạo lịch học mới thành công!', type: 'success' });
            }
            setShowModal(false);
            resetForm();
            fetchLichHocs();
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            setAlertModal({ show: true, message: error.message || 'Có lỗi xảy ra!', type: 'error' });
        } finally {
            submitRef.current.isSubmitting = false;
        }
    };

    const handleEdit = (lh) => {
        setFormData({ 
            lop_hoc_id: lh.lop_hoc_id, 
            ngay_hoc: lh.ngay_hoc, 
            gio_bat_dau: lh.gio_bat_dau, 
            gio_ket_thuc: lh.gio_ket_thuc,
            tao_chu_ky: false,
            ngay_bat_dau: '',
            ngay_trong_tuan: [],
            thoi_gian_tung_ngay: {}
        });
        setEditingId(lh.lich_hoc_id);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc chắn muốn xóa lịch học này không? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                try {
                    await lichHocAPI.delete(id);
                    fetchLichHocs();
                    setConfirmModal({ show: false, message: '', onConfirm: null });
                    setAlertModal({ show: true, message: 'Đã xóa lịch học thành công!', type: 'success' });
                } catch (error) {
                    setAlertModal({ show: true, message: 'Có lỗi xảy ra khi xóa!', type: 'error' });
                }
            }
        });
    };

    const handleChotCaClick = (id) => {
        setConfirmModal({
            show: true,
            message: 'Xác nhận hoàn thành ca dạy này? (Sau đó bạn có thể chuyển sang phần Điểm danh học sinh)',
            onConfirm: async () => {
                try {
                    await lichHocAPI.updateStatus(id, 'da_hoc');
                    fetchLichHocs();
                    setConfirmModal({ show: false, message: '', onConfirm: null });
                    handleOpenDiemDanh(id);
                } catch (error) {
                    setAlertModal({ show: true, message: 'Có lỗi xảy ra khi chốt ca!', type: 'error' });
                }
            }
        });
    };

    const handleOpenDiemDanh = async (lichHocId) => {
        setSelectedLichHocId(lichHocId);
        setShowDiemDanhModal(true);
        setLoadingDiemDanh(true);
        try {
            const res = await diemDanhAPI.getByLich(lichHocId);
            const data = res?.data || [];
            
            const formattedData = data.map(item => ({
                ...item,
                tinh_trang: item.tinh_trang || 'co_mat',
                ghi_chu: item.ghi_chu || ''
            }));
            
            setDiemDanhList(formattedData);
        } catch (error) {
            setAlertModal({ show: true, message: 'Lỗi tải danh sách học sinh!', type: 'error' });
            setShowDiemDanhModal(false);
        } finally {
            setLoadingDiemDanh(false);
        }
    };

    const updateDiemDanh = (hoc_sinh_id, field, value) => {
        if (isReadOnly) return; 
        setDiemDanhList(prevList => prevList.map(hs => 
            hs.hoc_sinh_id === hoc_sinh_id ? { ...hs, [field]: value } : hs
        ));
    };

    const handleSaveDiemDanh = async () => {
        if (submitRef.current.isSubmitting) return;
        submitRef.current.isSubmitting = true;
        const signal = getAbortSignal(`lich-hoc-diem-danh-${selectedLichHocId}`);

        try {
            const payload = {
                lich_hoc_id: selectedLichHocId,
                danh_sach: diemDanhList.map(item => ({
                    hoc_sinh_id: item.hoc_sinh_id,
                    tinh_trang: item.tinh_trang,
                    ghi_chu: item.ghi_chu
                }))
            };
            
            await diemDanhAPI.saveDanhSach(payload, { signal });
            setAlertModal({ show: true, message: 'Đã lưu Điểm danh thành công!', type: 'success' });
            setShowDiemDanhModal(false);
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            setAlertModal({ show: true, message: 'Có lỗi khi lưu Điểm danh!', type: 'error' });
        } finally {
            submitRef.current.isSubmitting = false;
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;

    // ==========================================
    // 2. GIAO DIỆN PHỤ HUYNH
    // ==========================================
    if (user?.role !== 'admin' && user?.role !== 'gia_su') {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Calendar className="text-blue-600"/> Lịch học của con
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        <button onClick={prevWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all">
                            <ChevronLeft size={20}/>
                        </button>
                        <button onClick={goToToday} className="px-4 py-1.5 text-sm font-medium hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all">
                            Tuần này
                        </button>
                        <button onClick={nextWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all">
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weekDays.map((dayDate, idx) => {
                        const dateStr = formatDateString(dayDate);
                        const displayDate = dayDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        const isToday = dateStr === todayString;
                        
                        const classesToday = lichHocs
                            .filter(lh => lh.ngay_hoc === dateStr)
                            .sort((a, b) => a.gio_bat_dau.localeCompare(b.gio_bat_dau));

                        return (
                            <div key={dateStr} className="text-center">
                                <div className={`mb-3 pb-2 border-b-2 ${isToday ? 'border-blue-500' : 'border-transparent'}`}>
                                    <p className={`font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{dayNames[idx]}</p>
                                    <p className={`text-xs ${isToday ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>{displayDate}</p>
                                </div>
                                
                                <div className={`min-h-[120px] rounded-xl border-2 ${classesToday.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-dashed border-gray-200'} p-2 flex flex-col gap-2`}>
                                    {classesToday.length === 0 && <span className="text-sm text-gray-400 mt-4">Trống</span>}
                                    {classesToday.map((lh, i) => {
                                        const currentStatus = lh.trang_thai || lh.trang_thai_buoi_hoc;
                                        const status = getStatusInfo(currentStatus, lh.ngay_hoc, lh.gio_ket_thuc, user?.role);

                                        return (
                                            <div key={i} className="bg-white p-2 rounded-lg shadow-sm text-left border border-blue-100 relative">
                                                <p className="text-xs font-bold text-blue-700 truncate">{lh.ten_lop || `Lớp #${lh.lop_hoc_id}`}</p>
                                                <p className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-1 truncate">
                                                    <User size={10}/> Bé {lh.ten_hoc_sinh}
                                                </p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                                    <Clock size={10}/> {lh.gio_bat_dau.substring(0,5)} - {lh.gio_ket_thuc.substring(0,5)}
                                                </p>
                                                
                                                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color} block text-center font-semibold`}>
                                                        {status.label}
                                                    </span>
                                                    
                                                    {currentStatus === 'da_hoc' && (
                                                        <button onClick={() => handleOpenDiemDanh(lh.lich_hoc_id)} className="w-full text-[10px] bg-emerald-50 text-emerald-700 py-1.5 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1 font-bold transition-colors">
                                                            <Eye size={12}/> Xem Điểm Danh
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {renderPopups()}
            </div>
        );
    }

    // ==========================================
    // 3. GIAO DIỆN ADMIN VÀ POPUPS
    // ==========================================
    function renderPopups() {
        const weekDaysOptions = [
            { value: 2, label: 'Thứ 2' },
            { value: 3, label: 'Thứ 3' },
            { value: 4, label: 'Thứ 4' },
            { value: 5, label: 'Thứ 5' },
            { value: 6, label: 'Thứ 6' },
            { value: 7, label: 'Thứ 7' },
            { value: 8, label: 'Chủ Nhật' },
        ];

        return (
            <>
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
                        <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
                            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-lg text-gray-900">{editingId ? 'Sửa lịch học' : 'Thêm lịch học'}</h3>
                                <button type="button" onClick={() => setShowModal(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                
                                {!editingId && (
                                    <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-md transition-colors ${!formData.tao_chu_ky ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-gray-600'}`}>
                                            <input type="radio" className="hidden" checked={!formData.tao_chu_ky} onChange={() => setFormData({...formData, tao_chu_ky: false})} />
                                            Tạo 1 buổi đơn
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-md transition-colors ${formData.tao_chu_ky ? 'bg-white shadow-sm font-bold text-emerald-600' : 'text-gray-600'}`}>
                                            <input type="radio" className="hidden" checked={formData.tao_chu_ky} onChange={() => setFormData({...formData, tao_chu_ky: true})} />
                                            Tạo định kỳ (Chu kỳ)
                                        </label>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Lớp học</label>
                                    <select value={formData.lop_hoc_id} onChange={e => setFormData({...formData, lop_hoc_id: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">-- Chọn lớp --</option>
                                        {lopHocs.map(lop => (
                                            <option key={lop.lop_hoc_id} value={lop.lop_hoc_id}>Lớp #{lop.lop_hoc_id} {lop.ten_lop ? `- ${lop.ten_lop}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* === CHẾ ĐỘ 1 BUỔI === */}
                                {!formData.tao_chu_ky ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học</label>
                                            <input type="date" min={todayString} value={formData.ngay_hoc} onChange={e => setFormData({...formData, ngay_hoc: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900" required={!formData.tao_chu_ky}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                                                <input type="time" value={formData.gio_bat_dau} onChange={e => setFormData({...formData, gio_bat_dau: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900" required={!formData.tao_chu_ky}/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                                                <input type="time" value={formData.gio_ket_thuc} onChange={e => setFormData({...formData, gio_ket_thuc: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900" required={!formData.tao_chu_ky}/>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* === CHẾ ĐỘ TẠO CHU KỲ (CẢI TIẾN) === */
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu áp dụng chu kỳ</label>
                                            <input type="date" min={todayString} value={formData.ngay_bat_dau} onChange={e => setFormData({...formData, ngay_bat_dau: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900" required={formData.tao_chu_ky}/>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Thứ trong tuần</label>
                                            <div className="flex flex-wrap gap-2">
                                                {weekDaysOptions.map(day => {
                                                    const isSelected = formData.ngay_trong_tuan.includes(day.value);
                                                    return (
                                                        <label key={day.value} className={`px-3 py-1.5 border rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                            <input 
                                                                type="checkbox" 
                                                                className="hidden"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    let newDays = [...formData.ngay_trong_tuan];
                                                                    let newTimes = { ...formData.thoi_gian_tung_ngay };
                                                                    
                                                                    if (checked) {
                                                                        newDays.push(day.value);
                                                                        newDays.sort((a,b) => a-b);
                                                                        newTimes[day.value] = { gio_bat_dau: '', gio_ket_thuc: '' };
                                                                    } else {
                                                                        newDays = newDays.filter(d => d !== day.value);
                                                                        delete newTimes[day.value];
                                                                    }
                                                                    
                                                                    setFormData({...formData, ngay_trong_tuan: newDays, thoi_gian_tung_ngay: newTimes});
                                                                }}
                                                            />
                                                            {day.label}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* BẢNG NHẬP GIỜ CHO TỪNG THỨ ĐÃ CHỌN */}
                                        {formData.ngay_trong_tuan.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-emerald-200 space-y-3">
                                                <p className="text-sm font-bold text-gray-800">Cài đặt giờ học riêng cho từng ngày:</p>
                                                {formData.ngay_trong_tuan.map(dayVal => {
                                                    const dayLabel = weekDaysOptions.find(opt => opt.value === dayVal)?.label;
                                                    const timeData = formData.thoi_gian_tung_ngay[dayVal] || { gio_bat_dau: '', gio_ket_thuc: '' };
                                                    
                                                    return (
                                                        <div key={dayVal} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                            <span className="w-20 font-bold text-emerald-700">{dayLabel}</span>
                                                            <div className="flex-1 flex gap-2 items-center">
                                                                <input 
                                                                    type="time" 
                                                                    required
                                                                    value={timeData.gio_bat_dau}
                                                                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                                                                    onChange={e => setFormData({
                                                                        ...formData, 
                                                                        thoi_gian_tung_ngay: {
                                                                            ...formData.thoi_gian_tung_ngay,
                                                                            [dayVal]: { ...timeData, gio_bat_dau: e.target.value }
                                                                        }
                                                                    })}
                                                                />
                                                                <span className="text-gray-400">-</span>
                                                                <input 
                                                                    type="time" 
                                                                    required
                                                                    value={timeData.gio_ket_thuc}
                                                                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                                                                    onChange={e => setFormData({
                                                                        ...formData, 
                                                                        thoi_gian_tung_ngay: {
                                                                            ...formData.thoi_gian_tung_ngay,
                                                                            [dayVal]: { ...timeData, gio_ket_thuc: e.target.value }
                                                                        }
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                <p className="text-xs text-gray-500 italic mt-2">*Hệ thống sẽ tự lặp lịch này với các khung giờ tương ứng cho đến khi đủ tổng số buổi của lớp.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-5 border-t mt-5 sticky bottom-0 bg-white">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Hủy</button>
                                    <button type="submit" className={`flex-1 py-2.5 font-medium rounded-lg text-white ${formData.tao_chu_ky ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        {editingId ? 'Lưu thay đổi' : (formData.tao_chu_ky ? 'Sinh lịch tự động' : 'Tạo 1 buổi')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showDiemDanhModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[55] px-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                        {isReadOnly ? <Eye className="text-blue-600" size={24}/> : <UserCheck className="text-emerald-600" size={24}/>} 
                                        {isReadOnly ? 'Xem kết quả điểm danh' : 'Điểm danh học sinh'}
                                    </h3>
                                </div>
                                <button onClick={() => setShowDiemDanhModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                                {loadingDiemDanh ? (
                                    <div className="text-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                    </div>
                                ) : diemDanhList.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <FileText className="mx-auto text-gray-300 mb-3" size={40}/>
                                        <p className="text-gray-500 font-medium">Lớp học này hiện chưa có học sinh nào đăng ký.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {diemDanhList.map((hs, index) => (
                                            <div key={hs.hoc_sinh_id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                                <p className="font-bold text-gray-800 mb-4 text-lg border-b pb-2 flex items-center gap-2">
                                                    <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full text-sm">{index + 1}</span> 
                                                    {hs.ten_hoc_sinh}
                                                </p>
                                                
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex flex-wrap gap-4 flex-shrink-0">
                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'co_mat' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="co_mat"
                                                                checked={hs.tinh_trang === 'co_mat'}
                                                                onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-4 h-4 text-emerald-600"
                                                            />
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'co_mat' ? 'text-emerald-700' : 'text-gray-600'}`}>Có mặt</span>
                                                        </label>

                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'vang' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang"
                                                                checked={hs.tinh_trang === 'vang'}
                                                                onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-4 h-4 text-red-600"
                                                            />
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'vang' ? 'text-red-700' : 'text-gray-600'}`}>Vắng</span>
                                                        </label>

                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'vang_co_phep' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang_co_phep"
                                                                checked={hs.tinh_trang === 'vang_co_phep'}
                                                                onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-4 h-4 text-orange-500"
                                                            />
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'vang_co_phep' ? 'text-orange-700' : 'text-gray-600'}`}>Vắng có phép</span>
                                                        </label>
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <input 
                                                            type="text" 
                                                            placeholder={isReadOnly ? "Không có ghi chú" : "Nhập ghi chú nhận xét (tùy chọn)..."}
                                                            value={hs.ghi_chu || ''}
                                                            onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'ghi_chu', e.target.value)}
                                                            readOnly={isReadOnly}
                                                            className={`w-full text-sm text-gray-900 p-3 border border-gray-300 rounded-lg outline-none transition-all ${isReadOnly ? 'bg-gray-100 text-gray-600' : 'focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 p-5 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                                <button onClick={() => setShowDiemDanhModal(false)} className={`py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors ${isReadOnly ? 'w-full' : 'flex-1'}`}>Đóng lại</button>
                                
                                {!isReadOnly && (
                                    <button onClick={handleSaveDiemDanh} disabled={loadingDiemDanh || diemDanhList.length === 0} className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:bg-emerald-300 shadow-lg shadow-emerald-200">
                                        Lưu Phiếu Điểm Danh
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {confirmModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-blue-600" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận</h3>
                            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Hủy bỏ</button>
                                <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Đồng ý</button>
                            </div>
                        </div>
                    </div>
                )}
                {alertModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${alertModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {alertModal.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{alertModal.type === 'success' ? 'Thành công' : 'Lỗi'}</h3>
                            <p className="text-sm text-gray-600 mb-6">{alertModal.message}</p>
                            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">Đóng</button>
                        </div>
                    </div>
                )}
            </>
        )
    }

// ==========================================
    // 3. GIAO DIỆN QUẢN LÝ CỦA ADMIN
    // ==========================================
    
    // Hàm phụ trợ lấy tên Thứ (Đưa lên trên để hàm filter dùng được)
    const getThuString = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDay();
        return day === 0 ? 'Chủ Nhật' : `Thứ ${day + 1}`;
    };

    const filteredAdminLichHocs = lichHocs.filter((lh) => {
        // 1. TÌM KIẾM ĐA NĂNG
        const searchLower = searchTermAdmin ? searchTermAdmin.toLowerCase() : "";
        const tenLop = lh.ten_lop ? lh.ten_lop.toLowerCase() : `lớp #${lh.lop_hoc_id}`;
        const ngayHoc = new Date(lh.ngay_hoc).toLocaleDateString('vi-VN');
        const thu = getThuString(lh.ngay_hoc).toLowerCase();
        const khungGio = `${lh.gio_bat_dau.substring(0,5)} - ${lh.gio_ket_thuc.substring(0,5)}`;
        const tenGiaSu = lh.ten_gia_su ? lh.ten_gia_su.toLowerCase() : "đang cập nhật";
        
        const statusObj = getStatusInfo(lh.trang_thai, lh.ngay_hoc, lh.gio_ket_thuc, user?.role);
        const statusText = statusObj.label.toLowerCase();

        const matchesSearch = 
            tenLop.includes(searchLower) || 
            ngayHoc.includes(searchLower) ||
            thu.includes(searchLower) ||
            khungGio.includes(searchLower) ||
            tenGiaSu.includes(searchLower) ||
            statusText.includes(searchLower);

        // 2. LỌC THEO TRẠNG THÁI
        let matchesStatus = true;
        const isOverdue = checkIsOverdue(lh.ngay_hoc, lh.gio_ket_thuc);
        
        if (statusFilterAdmin && statusFilterAdmin !== "all") {
            if (statusFilterAdmin === "da_hoc") {
                matchesStatus = lh.trang_thai === "da_hoc";
            } else if (statusFilterAdmin === "chua_hoc") {
                matchesStatus = lh.trang_thai === "chua_hoc" && !isOverdue;
            } else if (statusFilterAdmin === "qua_han") {
                matchesStatus = lh.trang_thai === "chua_hoc" && isOverdue;
            } else if (statusFilterAdmin === "da_huy") {
                matchesStatus = lh.trang_thai === "da_huy";
            }
        }

        return matchesSearch && matchesStatus;
    });

    function renderPopups() {
        const weekDaysOptions = [
            { value: 2, label: 'Thứ 2' },
            { value: 3, label: 'Thứ 3' },
            { value: 4, label: 'Thứ 4' },
            { value: 5, label: 'Thứ 5' },
            { value: 6, label: 'Thứ 6' },
            { value: 7, label: 'Thứ 7' },
            { value: 8, label: 'Chủ Nhật' },
        ];

        return (
            <>
                {/* 1. MODAL XEM CHI TIẾT LỊCH HỌC */}
                {detailModal.show && detailModal.data && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                    <Calendar size={20} /> Chi tiết buổi học
                                </h3>
                                <button onClick={() => setDetailModal({ show: false, data: null })} className="text-gray-400 hover:text-red-500 transition">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 text-sm">Mã lịch học:</span>
                                    <span className="font-bold text-gray-800">#{detailModal.data.lich_hoc_id}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 text-sm">Lớp học:</span>
                                    <span className="font-bold text-blue-600">{detailModal.data.ten_lop || `Lớp #${detailModal.data.lop_hoc_id}`}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 text-sm">Gia sư phụ trách:</span>
                                    <span className="font-medium text-gray-800 flex items-center gap-1">
                                        <User size={14} className="text-gray-400"/> {detailModal.data.ten_gia_su || "Đang cập nhật"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 text-sm">Thời gian:</span>
                                    <div className="text-right">
                                        <span className="font-bold text-emerald-600 block">
                                            {getThuString(detailModal.data.ngay_hoc)}, {new Date(detailModal.data.ngay_hoc).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="font-medium text-gray-700 flex items-center justify-end gap-1 mt-0.5">
                                            <Clock size={14} className="text-amber-500"/> 
                                            {detailModal.data.gio_bat_dau.substring(0,5)} - {detailModal.data.gio_ket_thuc.substring(0,5)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pb-1">
                                    <span className="text-gray-500 text-sm">Trạng thái:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusInfo(detailModal.data.trang_thai, detailModal.data.ngay_hoc, detailModal.data.gio_ket_thuc, user?.role).color}`}>
                                        {getStatusInfo(detailModal.data.trang_thai, detailModal.data.ngay_hoc, detailModal.data.gio_ket_thuc, user?.role).label}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button onClick={() => setDetailModal({ show: false, data: null })} className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition">Đóng</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MODAL THÊM/SỬA LỊCH HỌC */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
                        <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
                            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-lg text-gray-900">{editingId ? 'Sửa lịch học' : 'Thêm lịch học'}</h3>
                                <button type="button" onClick={() => setShowModal(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {!editingId && (
                                    <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-md transition-colors ${!formData.tao_chu_ky ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-gray-600'}`}>
                                            <input type="radio" className="hidden" checked={!formData.tao_chu_ky} onChange={() => setFormData({...formData, tao_chu_ky: false})} /> Tạo 1 buổi đơn
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-md transition-colors ${formData.tao_chu_ky ? 'bg-white shadow-sm font-bold text-emerald-600' : 'text-gray-600'}`}>
                                            <input type="radio" className="hidden" checked={formData.tao_chu_ky} onChange={() => setFormData({...formData, tao_chu_ky: true})} /> Tạo định kỳ
                                        </label>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Lớp học</label>
                                    <select value={formData.lop_hoc_id} onChange={e => setFormData({...formData, lop_hoc_id: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">-- Chọn lớp --</option>
                                        {lopHocs.map(lop => (
                                            <option key={lop.lop_hoc_id} value={lop.lop_hoc_id}>Lớp #{lop.lop_hoc_id} {lop.ten_lop ? `- ${lop.ten_lop}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {!formData.tao_chu_ky ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học</label>
                                            <input type="date" min={todayString} value={formData.ngay_hoc} onChange={e => setFormData({...formData, ngay_hoc: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white" required={!formData.tao_chu_ky}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                                                <input type="time" value={formData.gio_bat_dau} onChange={e => setFormData({...formData, gio_bat_dau: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white" required={!formData.tao_chu_ky}/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                                                <input type="time" value={formData.gio_ket_thuc} onChange={e => setFormData({...formData, gio_ket_thuc: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white" required={!formData.tao_chu_ky}/>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu áp dụng chu kỳ</label>
                                            <input type="date" min={todayString} value={formData.ngay_bat_dau} onChange={e => setFormData({...formData, ngay_bat_dau: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white" required={formData.tao_chu_ky}/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Thứ trong tuần</label>
                                            <div className="flex flex-wrap gap-2">
                                                {weekDaysOptions.map(day => {
                                                    const isSelected = formData.ngay_trong_tuan.includes(day.value);
                                                    return (
                                                        <label key={day.value} className={`px-3 py-1.5 border rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                            <input type="checkbox" className="hidden" checked={isSelected}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    let newDays = [...formData.ngay_trong_tuan];
                                                                    let newTimes = { ...formData.thoi_gian_tung_ngay };
                                                                    if (checked) {
                                                                        newDays.push(day.value);
                                                                        newDays.sort((a,b) => a-b);
                                                                        newTimes[day.value] = { gio_bat_dau: '', gio_ket_thuc: '' };
                                                                    } else {
                                                                        newDays = newDays.filter(d => d !== day.value);
                                                                        delete newTimes[day.value];
                                                                    }
                                                                    setFormData({...formData, ngay_trong_tuan: newDays, thoi_gian_tung_ngay: newTimes});
                                                                }}
                                                            />
                                                            {day.label}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        {formData.ngay_trong_tuan.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-emerald-200 space-y-3">
                                                <p className="text-sm font-bold text-gray-800">Cài đặt giờ học riêng cho từng ngày:</p>
                                                {formData.ngay_trong_tuan.map(dayVal => {
                                                    const dayLabel = weekDaysOptions.find(opt => opt.value === dayVal)?.label;
                                                    const timeData = formData.thoi_gian_tung_ngay[dayVal] || { gio_bat_dau: '', gio_ket_thuc: '' };
                                                    return (
                                                        <div key={dayVal} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                            <span className="w-20 font-bold text-emerald-700">{dayLabel}</span>
                                                            <div className="flex-1 flex gap-2 items-center">
                                                                <input type="time" required value={timeData.gio_bat_dau} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                                                                    onChange={e => setFormData({...formData, thoi_gian_tung_ngay: {...formData.thoi_gian_tung_ngay, [dayVal]: { ...timeData, gio_bat_dau: e.target.value }}})}/>
                                                                <span className="text-gray-400">-</span>
                                                                <input type="time" required value={timeData.gio_ket_thuc} className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                                                                    onChange={e => setFormData({...formData, thoi_gian_tung_ngay: {...formData.thoi_gian_tung_ngay, [dayVal]: { ...timeData, gio_ket_thuc: e.target.value }}})}/>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-3 pt-5 border-t mt-5 sticky bottom-0 bg-white">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Hủy</button>
                                    <button type="submit" className={`flex-1 py-2.5 font-medium rounded-lg text-white ${formData.tao_chu_ky ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        {editingId ? 'Lưu thay đổi' : (formData.tao_chu_ky ? 'Sinh lịch tự động' : 'Tạo 1 buổi')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. MODAL ĐIỂM DANH HỌC SINH */}
                {showDiemDanhModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[55] px-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                        {isReadOnly ? <Eye className="text-blue-600" size={24}/> : <UserCheck className="text-emerald-600" size={24}/>} 
                                        {isReadOnly ? 'Xem kết quả điểm danh' : 'Điểm danh học sinh'}
                                    </h3>
                                </div>
                                <button onClick={() => setShowDiemDanhModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                                {loadingDiemDanh ? (
                                    <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div><p className="text-gray-500 font-medium">Đang tải dữ liệu...</p></div>
                                ) : diemDanhList.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"><FileText className="mx-auto text-gray-300 mb-3" size={40}/><p className="text-gray-500 font-medium">Lớp học này hiện chưa có học sinh nào đăng ký.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {diemDanhList.map((hs, index) => (
                                            <div key={hs.hoc_sinh_id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                                <p className="font-bold text-gray-800 mb-4 text-lg border-b pb-2 flex items-center gap-2"><span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full text-sm">{index + 1}</span> {hs.ten_hoc_sinh}</p>
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex flex-wrap gap-4 flex-shrink-0">
                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'co_mat' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="co_mat" checked={hs.tinh_trang === 'co_mat'} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)} disabled={isReadOnly} className="w-4 h-4 text-emerald-600"/>
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'co_mat' ? 'text-emerald-700' : 'text-gray-600'}`}>Có mặt</span>
                                                        </label>
                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'vang' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang" checked={hs.tinh_trang === 'vang'} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)} disabled={isReadOnly} className="w-4 h-4 text-red-600"/>
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'vang' ? 'text-red-700' : 'text-gray-600'}`}>Vắng</span>
                                                        </label>
                                                        <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} p-2 rounded-lg border ${hs.tinh_trang === 'vang_co_phep' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                                                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang_co_phep" checked={hs.tinh_trang === 'vang_co_phep'} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'tinh_trang', e.target.value)} disabled={isReadOnly} className="w-4 h-4 text-orange-500"/>
                                                            <span className={`text-sm font-bold ${hs.tinh_trang === 'vang_co_phep' ? 'text-orange-700' : 'text-gray-600'}`}>Vắng có phép</span>
                                                        </label>
                                                    </div>
                                                    <div className="flex-1">
                                                        <input type="text" placeholder={isReadOnly ? "Không có ghi chú" : "Nhập ghi chú nhận xét (tùy chọn)..."} value={hs.ghi_chu || ''} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, 'ghi_chu', e.target.value)} readOnly={isReadOnly} className={`w-full text-sm text-gray-900 p-3 border border-gray-300 rounded-lg outline-none transition-all ${isReadOnly ? 'bg-gray-100 text-gray-600' : 'focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white'}`}/>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 p-5 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                                <button onClick={() => setShowDiemDanhModal(false)} className={`py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors ${isReadOnly ? 'w-full' : 'flex-1'}`}>Đóng lại</button>
                                {!isReadOnly && (
                                    <button onClick={handleSaveDiemDanh} disabled={loadingDiemDanh || diemDanhList.length === 0} className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:bg-emerald-300 shadow-lg shadow-emerald-200">Lưu Phiếu Điểm Danh</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. MODAL XÁC NHẬN (CONFIRM) */}
                {confirmModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-blue-600" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận</h3>
                            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Hủy bỏ</button>
                                <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Đồng ý</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. MODAL THÔNG BÁO (ALERT) */}
                {alertModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${alertModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {alertModal.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{alertModal.type === 'success' ? 'Thành công' : 'Lỗi'}</h3>
                            <p className="text-sm text-gray-600 mb-6">{alertModal.message}</p>
                            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">Đóng</button>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 relative">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b pb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 shrink-0">
                    <Calendar className="text-blue-600" /> Quản lý toàn bộ Lịch học
                </h3>
                
                <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* THANH TÌM KIẾM ĐA NĂNG */}
                    <div className="relative w-full md:w-72 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm lớp, gia sư, thứ, ngày, giờ..."
                            value={searchTermAdmin}
                            onChange={(e) => setSearchTermAdmin(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white shadow-sm"
                        />
                    </div>

                    {/* BỘ LỌC TRẠNG THÁI */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 w-full md:w-auto shrink-0 shadow-sm">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={statusFilterAdmin}
                            onChange={(e) => setStatusFilterAdmin(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none w-full"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="chua_hoc">Sắp diễn ra</option>
                            <option value="qua_han">Quá hạn chốt ca</option>
                            <option value="da_hoc">Đã hoàn thành</option>
                            <option value="da_huy">Đã hủy</option>
                        </select>
                    </div>
                    
                    {/* NÚT THÊM LỊCH HỌC */}
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 w-full md:w-auto justify-center font-medium shadow-md shrink-0">
                        <Plus size={18} /> Thêm lịch học
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-3 text-sm font-semibold text-gray-600">Lớp học</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Gia sư</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Ngày học</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Khung giờ</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Trạng thái</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdminLichHocs.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-500">Không tìm thấy lịch học nào phù hợp</td></tr>
                        ) : (
                            filteredAdminLichHocs.sort((a,b) => new Date(b.ngay_hoc) - new Date(a.ngay_hoc)).map((lh) => {
                                const status = getStatusInfo(lh.trang_thai, lh.ngay_hoc, lh.gio_ket_thuc, user?.role);
                                const isOverdue = checkIsOverdue(lh.ngay_hoc, lh.gio_ket_thuc); 
                                const thuString = getThuString(lh.ngay_hoc);
                                
                                return (
                                    <tr key={lh.lich_hoc_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm font-bold text-gray-800">{lh.ten_lop || `Lớp #${lh.lop_hoc_id}`}</td>
                                        <td className="p-3 text-sm font-medium text-blue-600">{lh.ten_gia_su || "Chưa có"}</td>
                                        <td className="p-3 text-sm font-medium text-gray-600">
                                            <span className="font-bold text-gray-800 mr-1">{thuString},</span>
                                            {new Date(lh.ngay_hoc).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600 flex items-center gap-1 mt-1"><Clock size={14} className="text-gray-400"/> {lh.gio_bat_dau.substring(0,5)} - {lh.gio_ket_thuc.substring(0,5)}</td>
                                        <td className="p-3"><span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap ${status.color}`}>{status.label}</span></td>
                                        <td className="p-3 text-center relative flex justify-center gap-2">
                                            {/* NÚT CHI TIẾT */}
                                            <button onClick={() => setDetailModal({ show: true, data: lh })} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm">
                                                <Eye size={14}/> Chi tiết
                                            </button>

                                            {lh.trang_thai === 'da_hoc' ? (
                                                <button onClick={() => handleOpenDiemDanh(lh.lich_hoc_id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 font-semibold text-xs border border-emerald-200">
                                                    <UserCheck size={14} /> Điểm danh
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {!isOverdue && (
                                                        <button onClick={() => handleEdit(lh)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors tooltip border border-blue-100" title="Sửa lịch">
                                                            <Edit2 size={16}/>
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteClick(lh.lich_hoc_id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors tooltip border border-red-100" title="Xóa lịch">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {renderPopups()}
        </div>
    );
}