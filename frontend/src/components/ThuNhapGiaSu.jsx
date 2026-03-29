import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, X, BookOpen, ArrowUpRight, ArrowDownRight, Banknote, CalendarDays } from 'lucide-react';
import { luongGiaSuAPI } from '@/api/luongGiaSuApi';
import { toast } from 'sonner';

export default function ThuNhapGiaSu({ user }) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' hoặc 'year'
  
  const [stats, setStats] = useState({
    tongThuNhap: 0,
    daThanhToan: 0,
    chuaThanhToan: 0,
    quaHan: 0
  });

  // State Modals
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [yearDetailModal, setYearDetailModal] = useState({ open: false, data: null });

  useEffect(() => {
    if (user && user.id) fetchSalaries();
  }, [user]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await luongGiaSuAPI.getByGiaSu(user.id);
      
      if (res.success && res.data) {
        const data = res.data;
        setSalaries(data);

        // Tính toán thống kê tổng quát
        let tong = 0, daTra = 0, chuaTra = 0, quaHan = 0;
        data.forEach(item => {
          const tien = parseFloat(item.tien_tra_gia_su) || 0;
          tong += tien;
          if (item.trang_thai_thanh_toan === 'da_thanh_toan') daTra += tien;
          else if (item.trang_thai_thanh_toan === 'chua_thanh_toan') chuaTra += tien;
          else if (item.trang_thai_thanh_toan === 'qua_han') { quaHan += tien; chuaTra += tien; } 
        });

        setStats({ tongThuNhap: tong, daThanhToan: daTra, chuaThanhToan: chuaTra, quaHan });
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu thu nhập: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMonthDetail = async (thang, nam) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await luongGiaSuAPI.getDetailByGroup(user.id, thang, nam);
      if (res.success) {
        setDetailModal({ open: true, data: res.data, loading: false });
      } else {
        toast.error(res.message || 'Không thể tải chi tiết');
        setDetailModal({ open: false, data: null, loading: false });
      }
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const openYearDetail = (yearData) => {
    const monthsArr = Object.values(yearData.months).sort((a, b) => b.thang - a.thang);
    setYearDetailModal({ open: true, data: { ...yearData, monthsArr } });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'da_thanh_toan': return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Đã thanh toán</span>;
      case 'qua_han': return <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Quá hạn</span>;
      default: return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Đang chờ</span>;
    }
  };

  // 1. Gom nhóm dữ liệu theo Tháng
  const groupedByMonth = salaries.reduce((acc, curr) => {
    const key = `${curr.thang}-${curr.nam}`;
    if (!acc[key]) {
      acc[key] = { thang: curr.thang, nam: curr.nam, tongTien: 0, soLop: 0, trangThai: 'da_thanh_toan' };
    }
    acc[key].tongTien += parseFloat(curr.tien_tra_gia_su) || 0;
    acc[key].soLop += 1;
    if (curr.trang_thai_thanh_toan === 'qua_han') acc[key].trangThai = 'qua_han';
    else if (curr.trang_thai_thanh_toan === 'chua_thanh_toan' && acc[key].trangThai !== 'qua_han') acc[key].trangThai = 'chua_thanh_toan';
    return acc;
  }, {});

  const monthlyList = Object.values(groupedByMonth).sort((a, b) => {
    if (a.nam !== b.nam) return b.nam - a.nam;
    return b.thang - a.thang;
  });

  // 2. Gom nhóm dữ liệu theo Năm
  const groupedByYear = salaries.reduce((acc, curr) => {
    const key = `${curr.nam}`;
    if (!acc[key]) {
      acc[key] = { nam: curr.nam, tongTien: 0, soLop: 0, trangThai: 'da_thanh_toan', months: {} };
    }
    acc[key].tongTien += parseFloat(curr.tien_tra_gia_su) || 0;
    acc[key].soLop += 1;
    if (curr.trang_thai_thanh_toan === 'qua_han') acc[key].trangThai = 'qua_han';
    else if (curr.trang_thai_thanh_toan === 'chua_thanh_toan' && acc[key].trangThai !== 'qua_han') acc[key].trangThai = 'chua_thanh_toan';
    
    // Lưu lại chi tiết từng tháng trong năm đó để hiển thị Popup
    if (!acc[key].months[curr.thang]) {
      acc[key].months[curr.thang] = { thang: curr.thang, tongTien: 0, soLop: 0 };
    }
    acc[key].months[curr.thang].tongTien += parseFloat(curr.tien_tra_gia_su) || 0;
    acc[key].months[curr.thang].soLop += 1;

    return acc;
  }, {});

  const yearlyList = Object.values(groupedByYear).sort((a, b) => b.nam - a.nam);

  // ==========================================
  // THUẬT TOÁN TÍNH TỶ LỆ TĂNG TRƯỞNG (TREND) LINH HOẠT
  // ==========================================
  let currentPeriodTien = 0;
  let currentPeriodLabel = "";
  let trendPercentage = 0;
  let hasTrend = false;
  let isTrendUp = true;

  const currentDataList = viewMode === 'month' ? monthlyList : yearlyList;

  if (currentDataList.length > 0) {
    currentPeriodTien = currentDataList[0].tongTien;
    currentPeriodLabel = viewMode === 'month' 
      ? `Tháng ${currentDataList[0].thang}/${currentDataList[0].nam}`
      : `Năm ${currentDataList[0].nam}`;
    
    // So sánh với kỳ trước đó
    if (currentDataList.length >= 2) {
      const prevTien = currentDataList[1].tongTien;
      hasTrend = true;
      if (prevTien === 0 && currentPeriodTien > 0) {
        trendPercentage = 100;
        isTrendUp = true;
      } else if (prevTien > 0) {
        trendPercentage = ((currentPeriodTien - prevTien) / prevTien) * 100;
        isTrendUp = trendPercentage >= 0;
      }
    }
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full pb-12 space-y-6">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="text-blue-600" size={28} /> Quản lý Thu nhập
          </h2>
          
          {/* Nút Toggle Tháng / Năm */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Theo Tháng
            </button>
            <button 
              onClick={() => setViewMode('year')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${viewMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Theo Năm
            </button>
          </div>
        </div>

        {/* 4 THẺ THỐNG KÊ (GRID 4 CỘT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: KỲ HIỆN TẠI + TREND */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <TrendingUp size={80} className="absolute -bottom-4 -right-4 text-white opacity-10" />
            <div>
              <p className="text-blue-100 text-sm font-medium flex items-center gap-2 mb-1"><CalendarDays size={16}/> Thu nhập {currentPeriodLabel}</p>
              <h3 className="text-2xl font-bold tracking-tight">{formatCurrency(currentPeriodTien)}</h3>
            </div>
            {hasTrend && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm ${isTrendUp ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isTrendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(trendPercentage).toFixed(1)}%
                </span>
                <span className="text-blue-100/90">so với {viewMode === 'month' ? 'tháng' : 'năm'} trước</span>
              </div>
            )}
            {!hasTrend && currentDataList.length > 0 && <div className="mt-3 text-xs text-blue-200/80 italic">Chưa có dữ liệu kỳ trước</div>}
          </div>

          {/* Card 2: TỔNG TÍCH LŨY */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <p className="text-sm text-gray-500 font-medium leading-tight">Tổng thu nhập<br/>tích lũy (All-time)</p>
            </div>
            <h3 className="text-xl font-bold text-gray-900 pl-13">{formatCurrency(stats.tongThuNhap)}</h3>
          </div>

          {/* Card 3: ĐÃ CHUYỂN KHOẢN (TRẢ LẠI THEO YÊU CẦU) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Banknote size={20} />
              </div>
              <p className="text-sm text-gray-500 font-medium leading-tight">Trung tâm đã<br/>chuyển khoản</p>
            </div>
            <h3 className="text-xl font-bold text-emerald-600 pl-13">{formatCurrency(stats.daThanhToan)}</h3>
          </div>

          {/* Card 4: CHƯA THANH TOÁN / NỢ */}
          <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-center gap-2 ${stats.quaHan > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stats.quaHan > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-500'}`}>
                {stats.quaHan > 0 ? <AlertCircle size={20} /> : <Clock size={20} />}
              </div>
              <p className="text-sm text-gray-500 font-medium leading-tight">Số dư đang chờ<br/>/ Quá hạn</p>
            </div>
            <div className="pl-13">
              <h3 className={`text-xl font-bold ${stats.quaHan > 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(stats.chuaThanhToan)}</h3>
              {stats.quaHan > 0 && <p className="text-[10px] text-red-500 font-bold mt-0.5">Trong đó {formatCurrency(stats.quaHan)} quá hạn!</p>}
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG LƯƠNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20}/> 
            Bảng kê thu nhập theo {viewMode === 'month' ? 'Tháng' : 'Năm'}
          </h3>
        </div>

        {currentDataList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Chưa có dữ liệu thu nhập nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Kỳ lương</th>
                  <th className="px-6 py-4 text-center">Số lớp tham gia</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentDataList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {viewMode === 'month' ? `Tháng ${item.thang} / ${item.nam}` : `Năm ${item.nam}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{item.soLop} lớp</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                      {formatCurrency(item.tongTien)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">{getStatusBadge(item.trangThai)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => viewMode === 'month' ? openMonthDetail(item.thang, item.nam) : openYearDetail(item)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors mx-auto flex justify-center items-center"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 1. POPUP CHI TIẾT THÁNG (Hiển thị danh sách Lớp) */}
      {/* ================================================== */}
      {detailModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><Calendar size={22}/> Chi tiết Lương theo Lớp</h3>
                {!detailModal.loading && detailModal.data && (
                  <p className="text-blue-100 text-sm mt-1">Tháng {detailModal.data.thang} / {detailModal.data.nam}</p>
                )}
              </div>
              <button onClick={() => setDetailModal({ open: false, data: null, loading: false })} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
              {detailModal.loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : detailModal.data ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><DollarSign size={24}/></div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Tổng thực nhận</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(detailModal.data.tong_luong)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Chi tiết theo lớp ({detailModal.data.so_lop})</h4>
                    {detailModal.data.danh_sach_lop.map((lop, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors shadow-sm relative overflow-hidden">
                        {lop.trang_thai_thanh_toan === 'da_thanh_toan' && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 rounded-bl-full -mr-8 -mt-8 z-0"></div>}
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <h5 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                              <BookOpen size={18} className="text-blue-500"/> {lop.ten_lop || `Lớp #${lop.lop_hoc_id}`}
                            </h5>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                              <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-xs">Mã HĐ: #{lop.luong_id}</span>
                              <span>Số buổi đã dạy: <strong className="text-gray-900">{lop.so_buoi_day}</strong></span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Hạn thanh toán: <strong className={lop.trang_thai_thanh_toan === 'qua_han' ? 'text-red-500' : 'text-gray-700'}>{new Date(lop.ngay_den_han).toLocaleDateString('vi-VN')}</strong>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-left md:text-right mb-2">
                              <p className="text-xs text-gray-500 mb-1">Thành tiền</p>
                              <p className="font-bold text-xl text-emerald-600">{formatCurrency(lop.tien_tra_gia_su)}</p>
                            </div>
                            {getStatusBadge(lop.trang_thai_thanh_toan)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Lỗi hiển thị dữ liệu</div>
              )}
            </div>
            
            <div className="bg-white p-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setDetailModal({ open: false, data: null, loading: false })} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. POPUP CHI TIẾT NĂM (Hiển thị danh sách Tháng) */}
      {/* ================================================== */}
      {yearDetailModal.open && yearDetailModal.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><CalendarDays size={22}/> Chi tiết Lương theo Tháng</h3>
                <p className="text-blue-100 text-sm mt-1">Tổng quan Năm {yearDetailModal.data.nam}</p>
              </div>
              <button onClick={() => setYearDetailModal({ open: false, data: null })} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <span className="font-bold text-gray-600 uppercase text-xs">Tổng thu nhập năm</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(yearDetailModal.data.tongTien)}</span>
                </div>

                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Thống kê từng tháng</h4>
                <div className="space-y-3">
                  {yearDetailModal.data.monthsArr.map((month, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                          T{month.thang}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Tháng {month.thang}</p>
                          <p className="text-xs text-gray-500">Tham gia {month.soLop} lớp</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-600">{formatCurrency(month.tongTien)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setYearDetailModal({ open: false, data: null })} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}