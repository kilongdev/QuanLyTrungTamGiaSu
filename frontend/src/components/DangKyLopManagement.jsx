import React, { useState, useEffect } from 'react';
import { BookOpen, UserCheck, XCircle, CheckCircle, Clock, AlertTriangle, FileText, X, User, Search, GraduationCap, Users, Filter } from 'lucide-react';
import { dangKyAPI } from '../api/dangkyApi';
import { lichHocAPI } from '../api/lichhocApi';
import { hocSinhAPI } from '../api/hocSinhApi';

export default function DangKyLopManagement({ user }) {
    const [dangKys, setDangKys] = useState([]);
    const [lopHocs, setLopHocs] = useState([]);
    const [hocSinhs, setHocSinhs] = useState([]); 
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('tim_lop'); 
    const [showDangKyModal, setShowDangKyModal] = useState(false);
    const [selectedLop, setSelectedLop] = useState(null);
    const [selectedHocSinhId, setSelectedHocSinhId] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState('all'); 

    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    useEffect(() => {
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user?.role === 'admin') {
                const res = await dangKyAPI.getAll();
                setDangKys(res?.data || []);
            } else if (user?.role !== 'gia_su') {
                const phuHuynhId = user?.id || user?.phu_huynh_id || user?.tai_khoan_id || '1';
                
                if (activeTab === 'lich_su') {
                    const res = await dangKyAPI.getByPhuHuynh(phuHuynhId);
                    setDangKys(res?.data || []);
                } else {
                    const resLop = await lichHocAPI.getLopHocs();
                    const availableClasses = (resLop?.data || []).filter(l => 
                        (l.trang_thai === 'sap_mo' || l.trang_thai === 'dang_hoc') && 
                        l.so_luong_hien_tai < l.so_luong_toi_da
                    );
                    setLopHocs(availableClasses);

                    const resHs = await hocSinhAPI.getByPhuHuynh(phuHuynhId);
                    setHocSinhs(resHs?.data || []);
                }
            }
        } catch (error) {
            console.error('Lỗi tải dữ liệu đăng ký:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (id, trang_thai_moi) => {
        const actionName = trang_thai_moi === 'da_duyet' ? 'Duyệt' : trang_thai_moi === 'tu_choi' ? 'Từ chối' : 'Hủy';
        setConfirmModal({
            show: true,
            message: `Bạn có chắc chắn muốn ${actionName} đơn đăng ký này?`,
            onConfirm: async () => {
                try {
                    await dangKyAPI.updateStatus(id, trang_thai_moi);
                    setConfirmModal({ show: false, message: '', onConfirm: null });
                    setAlertModal({ show: true, message: `Đã ${actionName} đơn thành công!`, type: 'success' });
                    fetchData(); 
                } catch (error) {
                    setAlertModal({ show: true, message: error.message || 'Có lỗi xảy ra!', type: 'error' });
                }
            }
        });
    };

    const handleDangKySubmit = async (e) => {
        e.preventDefault();
        if (!selectedHocSinhId) {
            setAlertModal({ show: true, message: 'Vui lòng chọn học sinh để đăng ký!', type: 'error' });
            return;
        }

        try {
            await dangKyAPI.create({
                hoc_sinh_id: selectedHocSinhId,
                lop_hoc_id: selectedLop.lop_hoc_id
            });
            setShowDangKyModal(false);
            setAlertModal({ show: true, message: 'Đăng ký thành công! Vui lòng chờ trung tâm duyệt đơn.', type: 'success' });
            setSelectedHocSinhId('');
            setActiveTab('lich_su'); 
        } catch (error) {
            setAlertModal({ show: true, message: error.message || 'Lỗi đăng ký!', type: 'error' });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'cho_duyet': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-max"><Clock size={12}/> Chờ duyệt</span>;
            case 'da_duyet': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle size={12}/> Đã duyệt</span>;
            case 'tu_choi': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-max"><XCircle size={12}/> Từ chối</span>;
            case 'da_huy': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 flex items-center gap-1 w-max"><AlertTriangle size={12}/> Đã hủy</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    // LOGIC TÌM KIẾM DÙNG TRỰC TIẾP DỮ LIỆU TỪ BACKEND
    const filteredLopHocs = lopHocs.filter(lop => {
        const searchLower = searchTerm.toLowerCase();
        const tenLop = lop.ten_lop ? lop.ten_lop.toLowerCase() : '';
        const monHoc = lop.ten_mon_hoc ? lop.ten_mon_hoc.toLowerCase() : ''; // Lấy trực tiếp ten_mon_hoc từ API
        const tenGiaSu = lop.ten_gia_su ? lop.ten_gia_su.toLowerCase() : '';
        
        return tenLop.includes(searchLower) || monHoc.includes(searchLower) || tenGiaSu.includes(searchLower) || String(lop.lop_hoc_id).includes(searchLower);
    });

    if (user?.role === 'gia_su') {
        return <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow-sm">Gia sư không có quyền thao tác trên module này. Vui lòng xem ở Danh sách lớp.</div>;
    }

    function renderPopups() {
        return (
            <>
                {confirmModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-amber-600" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thao tác</h3>
                            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Hủy</button>
                                <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700">Đồng ý</button>
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

    // 1. GIAO DIỆN QUẢN LÝ CHO ADMIN
  
    if (user?.role === 'admin') {
        const stats = {
            total: dangKys.length,
            pending: dangKys.filter(dk => dk.trang_thai === 'cho_duyet').length,
            approved: dangKys.filter(dk => dk.trang_thai === 'da_duyet').length,
            cancelled: dangKys.filter(dk => dk.trang_thai === 'tu_choi' || dk.trang_thai === 'da_huy').length,
        };

        const filteredAdminDangKys = dangKys.filter(dk => {
            if (adminFilter === 'all') return true;
            if (adminFilter === 'cancelled') return dk.trang_thai === 'tu_choi' || dk.trang_thai === 'da_huy';
            return dk.trang_thai === adminFilter;
        });

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAdminFilter('all')}>
                        <p className="text-gray-500 text-sm font-medium">Tổng số đơn</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 shadow-sm border border-amber-200 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAdminFilter('cho_duyet')}>
                        <p className="text-amber-700 text-sm font-bold">Chờ duyệt (Cần xử lý)</p>
                        <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAdminFilter('da_duyet')}>
                        <p className="text-emerald-600 text-sm font-medium">Đã duyệt</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAdminFilter('cancelled')}>
                        <p className="text-gray-500 text-sm font-medium">Từ chối / Hủy</p>
                        <p className="text-3xl font-bold text-gray-500 mt-1">{stats.cancelled}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <FileText className="text-blue-600"/> Danh Sách Đơn Đăng Ký
                        </h3>
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <Filter size={16} className="text-gray-400 ml-2"/>
                            <select 
                                value={adminFilter} 
                                onChange={(e) => setAdminFilter(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none pl-1 pr-6 py-1"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="cho_duyet">Đang chờ duyệt</option>
                                <option value="da_duyet">Đã duyệt thành công</option>
                                <option value="cancelled">Đã bị từ chối/hủy</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading ? <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="p-3 text-sm font-semibold text-gray-600">Mã đơn</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Học sinh</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Đăng ký vào Lớp</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Ngày gửi</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Trạng thái</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdminDangKys.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">Không có đơn đăng ký nào trong mục này.</td></tr>
                                    ) : filteredAdminDangKys.map((dk) => (
                                        <tr key={dk.dang_ky_id} className={`border-b border-gray-100 hover:bg-gray-50 ${dk.trang_thai === 'cho_duyet' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="p-3 text-sm font-bold text-gray-700">#{dk.dang_ky_id}</td>
                                            <td className="p-3 text-sm font-medium text-gray-800 flex items-center gap-2"><User size={14} className="text-blue-500"/>{dk.ten_hoc_sinh}</td>
                                            <td className="p-3 text-sm text-blue-600 font-medium">
                                                {dk.ten_lop || `Lớp #${dk.lop_hoc_id}`}
                                                {/* Backend sẽ truyền mh.ten_mon_hoc vào đây */}
                                                {dk.ten_mon_hoc && <span className="block text-xs text-gray-500 font-normal mt-0.5">{dk.ten_mon_hoc}</span>}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">{new Date(dk.ngay_dang_ky).toLocaleString('vi-VN')}</td>
                                            <td className="p-3">{getStatusBadge(dk.trang_thai)}</td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                {dk.trang_thai === 'cho_duyet' && (
                                                    <>
                                                        <button onClick={() => handleUpdateStatus(dk.dang_ky_id, 'da_duyet')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors shadow-sm">Duyệt</button>
                                                        <button onClick={() => handleUpdateStatus(dk.dang_ky_id, 'tu_choi')} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200 transition-colors">Từ chối</button>
                                                    </>
                                                )}
                                                {dk.trang_thai === 'da_duyet' && (
                                                    <button onClick={() => handleUpdateStatus(dk.dang_ky_id, 'da_huy')} className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 text-xs font-bold rounded border border-gray-200 hover:border-red-300 transition-colors" title="Hủy đơn này để hoàn trả 1 sĩ số cho lớp">
                                                        Hủy đơn
                                                    </button>
                                                )}
                                                {(dk.trang_thai === 'tu_choi' || dk.trang_thai === 'da_huy') && (
                                                    <span className="text-xs text-gray-400 italic">Đã đóng</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {renderPopups()}
                </div>
            </div>
        );
    }

    // 2. GIAO DIỆN PHỤ HUYNH
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 relative min-h-[500px]">
            <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button 
                    onClick={() => setActiveTab('tim_lop')}
                    className={`pb-3 font-bold text-lg px-2 transition-colors ${activeTab === 'tim_lop' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    🔍 Tìm & Đăng ký lớp
                </button>
                <button 
                    onClick={() => setActiveTab('lich_su')}
                    className={`pb-3 font-bold text-lg px-2 transition-colors ${activeTab === 'lich_su' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    🕒 Lịch sử đăng ký
                </button>
            </div>

            {loading ? <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div> : (
                <>
                    {/* TAB 1: TÌM KIẾM VÀ ĐĂNG KÝ */}
                    {activeTab === 'tim_lop' && (
                        <div>
                            <div className="mb-6 relative max-w-xl mx-auto md:mx-0">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm môn học (Toán, Lý...), tên gia sư hoặc tên lớp..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLopHocs.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-lg">Không tìm thấy lớp học nào phù hợp.</p>
                                    </div>
                                ) : null}
                                
                                {filteredLopHocs.map(lop => (
                                    <div key={lop.lop_hoc_id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col bg-white group hover:-translate-y-1">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-xl text-blue-900 group-hover:text-blue-700 transition-colors">{lop.ten_lop || `Lớp #${lop.lop_hoc_id}`}</h4>
                                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Khối {lop.khoi_lop}</span>
                                            </div>
                                            
                                            {/* HIỂN THỊ TRỰC TIẾP MÔN HỌC TỪ DB (Không dùng SUBJECT_MAP nữa) */}
                                            <p className="text-sm font-bold text-blue-700 flex items-center gap-1.5 mt-3">
                                                <GraduationCap size={16}/> Môn: {lop.ten_mon_hoc || 'Đang cập nhật'}
                                            </p>
                                            
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mt-1.5">
                                                <User size={16}/> Gia sư: {lop.ten_gia_su || 'Chưa xếp gia sư'}
                                            </p>
                                        </div>
                                        
                                        <div className="p-5 flex-1 flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Lịch học</div>
                                                <span className="font-semibold text-gray-800">{lop.lich_hoc_du_kien || 'Chưa có lịch'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2"><Users size={16} className="text-blue-500"/> Sĩ số hiện tại</div>
                                                <span className="font-semibold text-gray-800">{lop.so_luong_hien_tai} / {lop.so_luong_toi_da}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2"><BookOpen size={16} className="text-emerald-500"/> Thời lượng</div>
                                                <span className="font-semibold text-gray-800">{lop.so_buoi_hoc} buổi</span>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 flex items-center justify-between border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Học phí toàn khóa</p>
                                                    <p className="font-bold text-lg text-emerald-600">{Number(lop.gia_toan_khoa).toLocaleString('vi-VN')} đ</p>
                                                </div>
                                                <button 
                                                    onClick={() => { setSelectedLop(lop); setShowDangKyModal(true); }}
                                                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform"
                                                >
                                                    Đăng ký
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: LỊCH SỬ ĐĂNG KÝ */}
                    {activeTab === 'lich_su' && (
                        <div className="space-y-4">
                            {dangKys.length === 0 ? <p className="text-center py-8 text-gray-500">Bạn chưa gửi yêu cầu đăng ký nào.</p> : null}
                            {dangKys.map(dk => (
                                <div key={dk.dang_ky_id} className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-4">
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg mb-1">{dk.ten_lop || `Lớp #${dk.lop_hoc_id}`}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <User size={14} className="text-blue-500"/> Bé {dk.ten_hoc_sinh} • <Clock size={14}/> {new Date(dk.ngay_dang_ky).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(dk.trang_thai)}
                                        {dk.trang_thai === 'cho_duyet' && (
                                            <button onClick={() => handleUpdateStatus(dk.dang_ky_id, 'da_huy')} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                                                Hủy đơn nhanh
                                            </button>
                                        )}
                                        {dk.trang_thai === 'da_duyet' && (
                                            <button onClick={() => setAlertModal({ show: true, message: 'Lớp này đã được duyệt. Vui lòng sang mục "Yêu Cầu Hỗ Trợ" để gửi đơn xin rút lớp!', type: 'success' })} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                                                Xin rút lớp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MODAL ĐIỀN FORM ĐĂNG KÝ */}
            {showDangKyModal && selectedLop && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2"><BookOpen className="text-blue-600"/> Xác nhận đăng ký</h3>
                            <button onClick={() => setShowDangKyModal(false)}><X size={24} className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        <form onSubmit={handleDangKySubmit} className="p-6 space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-800 mb-1">Bạn đang đăng ký vào:</p>
                                <p className="font-bold text-lg text-blue-900">{selectedLop.ten_lop || `Lớp #${selectedLop.lop_hoc_id}`}</p>
                                <p className="text-sm font-bold text-emerald-600 mt-2">Học phí: {Number(selectedLop.gia_toan_khoa).toLocaleString('vi-VN')} đ</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn học sinh tham gia học</label>
                                <select 
                                    value={selectedHocSinhId} 
                                    onChange={e => setSelectedHocSinhId(e.target.value)} 
                                    className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    required
                                >
                                    <option value="">-- Click để chọn con của bạn --</option>
                                    {hocSinhs.length === 0 ? (
                                        <option value="" disabled>Bạn chưa thêm hồ sơ học sinh nào!</option>
                                    ) : (
                                        hocSinhs.map(hs => (
                                            <option key={hs.hoc_sinh_id} value={hs.hoc_sinh_id}>
                                                {hs.ho_ten} (Mã HS: {hs.hoc_sinh_id})
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-2 italic">*Hệ thống sẽ kiểm tra và từ chối nếu bé đã có trong lớp.</p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowDangKyModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Đóng lại</button>
                                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Gửi Đơn Đăng Ký</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {renderPopups()}
        </div>
    );
}