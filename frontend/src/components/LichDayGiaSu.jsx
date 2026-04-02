import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, UserCheck, CheckCircle, AlertTriangle, X, FileText, Info } from "lucide-react";
import { lichHocAPI } from "@/api/lichhocApi"; 
import { diemDanhAPI } from "@/api/diemdanhApi"; 
import { toast } from "sonner";

export default function LichDayGiaSu({ user }) {
  const [lichHocs, setLichHocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Tháng/Năm đang xem
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayString = new Date().toLocaleDateString("en-CA");

  // State Modal Thao tác Ca dạy
  const [selectedSession, setSelectedSession] = useState(null);

  // State Điểm danh
  const [showDiemDanhModal, setShowDiemDanhModal] = useState(false);
  const [selectedLichHocId, setSelectedLichHocId] = useState(null);
  const [diemDanhList, setDiemDanhList] = useState([]);
  const [loadingDiemDanh, setLoadingDiemDanh] = useState(false);
  
  // State Chốt ca
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", onConfirm: null });

  useEffect(() => {
    if (user && user.id) fetchLichHocs();
  }, [user]);

  const fetchLichHocs = async () => {
    try {
      setLoading(true);
      const response = await lichHocAPI.getByGiaSu(user.id);
      setLichHocs(response?.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải lịch học: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁC HÀM XỬ LÝ LỊCH THÁNG ---
  const formatDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Điều chỉnh để Thứ 2 (Monday) là ngày đầu tuần (0)
    const startingDayOfWeek = firstDayOfMonth.getDay(); 
    const startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Ngày của tháng trước (Padding lùi)
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    // Ngày của tháng hiện tại
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Ngày của tháng sau (Padding tiến để lấp đầy grid)
    const remainingDays = 42 - days.length; // Luôn hiển thị 6 dòng (42 ô) cho lịch chuẩn
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const daysGrid = getDaysInMonthGrid(currentDate);
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // --- LOGIC TRẠNG THÁI ---
  const checkIsOverdue = (ngay_hoc, gio_ket_thuc) => {
    const now = new Date();
    return now > new Date(`${ngay_hoc}T${gio_ket_thuc}`);
  };

  const checkCanChotCa = (ngay_hoc, gio_bat_dau) => {
    const now = new Date();
    return now >= new Date(`${ngay_hoc}T${gio_bat_dau}`);
  };

  // --- LOGIC CHỐT CA VÀ ĐIỂM DANH ---
  const handleChotCaClick = (id) => {
    setConfirmModal({
      show: true,
      message: "Xác nhận hoàn thành ca dạy này? (Sau đó bạn có thể chuyển sang phần Điểm danh học sinh)",
      onConfirm: async () => {
        try {
          await lichHocAPI.updateStatus(id, "da_hoc");
          toast.success("Đã chốt ca thành công!");
          fetchLichHocs();
          setConfirmModal({ show: false, message: "", onConfirm: null });
          setSelectedSession(null); // Đóng popup chi tiết
          handleOpenDiemDanh(id); // Mở luôn form điểm danh
        } catch (error) {
          toast.error("Có lỗi xảy ra khi chốt ca!");
        }
      },
    });
  };

  const handleOpenDiemDanh = async (lichHocId) => {
    setSelectedSession(null); // Đóng popup chi tiết nếu đang mở
    setSelectedLichHocId(lichHocId);
    setShowDiemDanhModal(true);
    setLoadingDiemDanh(true);
    try {
      const res = await diemDanhAPI.getByLich(lichHocId);
      const data = res?.data || [];
      const formattedData = data.map((item) => ({
        ...item,
        tinh_trang: item.tinh_trang || "co_mat",
        ghi_chu: item.ghi_chu || "",
      }));
      setDiemDanhList(formattedData);
    } catch (error) {
      toast.error("Lỗi tải danh sách học sinh!");
      setShowDiemDanhModal(false);
    } finally {
      setLoadingDiemDanh(false);
    }
  };

  const updateDiemDanh = (hoc_sinh_id, field, value) => {
    setDiemDanhList((prev) => prev.map((hs) => hs.hoc_sinh_id === hoc_sinh_id ? { ...hs, [field]: value } : hs));
  };

  const handleSaveDiemDanh = async () => {
    try {
      await diemDanhAPI.saveDanhSach({
        lich_hoc_id: selectedLichHocId,
        danh_sach: diemDanhList.map((item) => ({
          hoc_sinh_id: item.hoc_sinh_id,
          tinh_trang: item.tinh_trang,
          ghi_chu: item.ghi_chu,
        })),
      });
      toast.success("Đã lưu Điểm danh thành công!");
      setShowDiemDanhModal(false);
    } catch (error) {
      toast.error("Có lỗi khi lưu Điểm danh!");
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="w-full pb-12">
      {/* HEADER & THANH ĐIỀU HƯỚNG THÁNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={28} /> Lịch dạy của tôi
          </h2>
        </div>
        
        {/* Nút chuyển Tháng */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto justify-center">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-5 py-2 text-base font-bold text-blue-800 hover:bg-white hover:shadow-sm rounded-lg transition-all min-w-[160px]">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* KHUNG LỊCH THÁNG (Monthly Calendar Grid) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Ngày trong tuần */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-gray-600 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Lưới các ngày */}
        <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
          {daysGrid.map((dayObj, index) => {
            const dateStr = formatDateString(dayObj.date);
            const isToday = dateStr === todayString;
            const classesToday = lichHocs.filter((lh) => lh.ngay_hoc === dateStr).sort((a, b) => a.gio_bat_dau.localeCompare(b.gio_bat_dau));

            return (
              <div 
                key={index} 
                className={`min-h-[120px] bg-white p-2 flex flex-col transition-colors ${!dayObj.isCurrentMonth ? "bg-gray-50/50 text-gray-400" : ""} ${isToday ? "bg-blue-50/30" : ""}`}
              >
                {/* Số ngày */}
                <div className={`text-right mb-1 ${isToday ? "font-bold text-blue-600" : dayObj.isCurrentMonth ? "font-medium text-gray-700" : "text-gray-400"}`}>
                  <span className={`inline-block w-7 h-7 text-center leading-7 rounded-full ${isToday ? "bg-blue-600 text-white shadow-sm" : ""}`}>
                    {dayObj.date.getDate()}
                  </span>
                </div>

                {/* Các khối ca dạy (Pills) */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                  {classesToday.map((lh, i) => {
                    const isDone = lh.trang_thai_buoi_hoc === "da_hoc";
                    const isWarning = checkIsOverdue(lh.ngay_hoc, lh.gio_ket_thuc) && !isDone;
                    
                    // Style cho thẻ Pill
                    let pillStyle = "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
                    if (isDone) pillStyle = "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
                    else if (isWarning) pillStyle = "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";

                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedSession(lh)}
                        className={`text-left text-xs px-2 py-1.5 rounded-md border shadow-sm transition-all truncate font-semibold w-full ${pillStyle}`}
                        title={`${lh.gio_bat_dau.substring(0, 5)} - ${lh.ten_lop || `Lớp #${lh.lop_hoc_id}`}${lh.tuan_hoc_thu ? ` (Tuần ${lh.tuan_hoc_thu})` : ""}`}
                      >
                        {lh.gio_bat_dau.substring(0, 5)} - {lh.ten_lop?.split(' - ')[0] || `Lớp #${lh.lop_hoc_id}`} 
                        {/* HIỂN THỊ TUẦN HỌC TRÊN PILL */}
                        {lh.tuan_hoc_thu && <span className="ml-1 opacity-90">• Tuần {lh.tuan_hoc_thu}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CÁC MODAL --- */}
      
      {/* MODAL THAO TÁC CA DẠY (Bật lên khi bấm vào Pill trong lịch) */}
      {selectedSession && (() => {
        const isReady = checkCanChotCa(selectedSession.ngay_hoc, selectedSession.gio_bat_dau);
        const isOverdue = checkIsOverdue(selectedSession.ngay_hoc, selectedSession.gio_ket_thuc);
        const isDone = selectedSession.trang_thai_buoi_hoc === "da_hoc";
        const isWarning = isOverdue && !isDone;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
              <div className={`p-5 border-b flex justify-between items-center text-white ${isDone ? "bg-emerald-600" : isWarning ? "bg-orange-500" : "bg-blue-600"}`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Info size={20} /> Chi tiết ca dạy
                </h3>
                <button onClick={() => setSelectedSession(null)} className="hover:bg-black/20 p-1 rounded-lg transition"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lớp phụ trách</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedSession.ten_lop || `Lớp #${selectedSession.lop_hoc_id}`}</p>
                  </div>
                  {/* HIỂN THỊ BADGE TUẦN HỌC TRONG MODAL */}
                  {selectedSession.tuan_hoc_thu && (
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 flex-shrink-0 mt-1">
                      Tuần {selectedSession.tuan_hoc_thu}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Khung giờ</p>
                    <p className="font-bold text-gray-800">{selectedSession.gio_bat_dau.substring(0, 5)} - {selectedSession.gio_ket_thuc.substring(0, 5)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {!isDone ? (
                    isWarning ? (
                      <button onClick={() => handleChotCaClick(selectedSession.lich_hoc_id)} className="w-full bg-orange-100 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-200 transition-colors border border-orange-200 shadow-sm flex justify-center items-center gap-2">
                        <AlertTriangle size={18}/> Quá hạn - Chốt ca ngay
                      </button>
                    ) : isReady ? (
                      <button onClick={() => handleChotCaClick(selectedSession.lich_hoc_id)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                        Chốt ca dạy
                      </button>
                    ) : (
                      <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                        Chưa đến giờ dạy
                      </button>
                    )
                  ) : (
                    <button onClick={() => handleOpenDiemDanh(selectedSession.lich_hoc_id)} className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 font-bold border border-emerald-200 shadow-sm">
                      <UserCheck size={18} /> Mở Phiếu Điểm Danh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Xác nhận Chốt Ca */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chốt ca dạy</h3>
            <p className="text-sm text-gray-500 mb-6 px-2">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Điểm Danh */}
      {showDiemDanhModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[55] px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <UserCheck className="text-green-600" size={24} /> Điểm danh học sinh
                </h3>
                <p className="text-sm text-gray-500 mt-1">Ghi nhận sĩ số và nhận xét buổi học (Mã buổi: #{selectedLichHocId})</p>
              </div>
              <button onClick={() => setShowDiemDanhModal(false)} className="p-2 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {loadingDiemDanh ? (
                 <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
              ) : diemDanhList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 font-medium">Lớp học này hiện chưa có học sinh nào đăng ký.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diemDanhList.map((hs, index) => (
                    <div key={hs.hoc_sinh_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition-colors">
                      <p className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-100 pb-3 flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 w-7 h-7 flex items-center justify-center rounded-full text-sm">{index + 1}</span> 
                        {hs.ten_hoc_sinh}
                      </p>
                      
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex flex-wrap gap-3 shrink-0">
                          <label className={`flex items-center gap-2 cursor-pointer p-2.5 pr-4 rounded-xl border-2 transition-all ${hs.tinh_trang === "co_mat" ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-green-200"}`}>
                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="co_mat" checked={hs.tinh_trang === "co_mat"} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, "tinh_trang", e.target.value)} className="w-4 h-4 text-green-600 accent-green-600" />
                            <span className={`text-sm font-bold ${hs.tinh_trang === "co_mat" ? "text-green-700" : "text-gray-600"}`}>Có mặt</span>
                          </label>
                          <label className={`flex items-center gap-2 cursor-pointer p-2.5 pr-4 rounded-xl border-2 transition-all ${hs.tinh_trang === "vang" ? "border-red-500 bg-red-50" : "border-gray-100 hover:border-red-200"}`}>
                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang" checked={hs.tinh_trang === "vang"} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, "tinh_trang", e.target.value)} className="w-4 h-4 text-red-600 accent-red-600" />
                            <span className={`text-sm font-bold ${hs.tinh_trang === "vang" ? "text-red-700" : "text-gray-600"}`}>Vắng không phép</span>
                          </label>
                          <label className={`flex items-center gap-2 cursor-pointer p-2.5 pr-4 rounded-xl border-2 transition-all ${hs.tinh_trang === "vang_co_phep" ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200"}`}>
                            <input type="radio" name={`status_${hs.hoc_sinh_id}`} value="vang_co_phep" checked={hs.tinh_trang === "vang_co_phep"} onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, "tinh_trang", e.target.value)} className="w-4 h-4 text-orange-500 accent-orange-500" />
                            <span className={`text-sm font-bold ${hs.tinh_trang === "vang_co_phep" ? "text-orange-700" : "text-gray-600"}`}>Vắng có phép</span>
                          </label>
                        </div>
                        
                        <div className="w-full flex-1">
                          <input 
                            type="text" 
                            placeholder="Nhập ghi chú nhận xét về học sinh (tùy chọn)..." 
                            value={hs.ghi_chu || ""} 
                            onChange={(e) => updateDiemDanh(hs.hoc_sinh_id, "ghi_chu", e.target.value)} 
                            className="w-full text-sm text-gray-900 p-3.5 border border-gray-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 focus:bg-white" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3 justify-end">
              <button onClick={() => setShowDiemDanhModal(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-colors">Đóng lại</button>
              <button onClick={handleSaveDiemDanh} disabled={loadingDiemDanh || diemDanhList.length === 0} className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-200">Lưu Phiếu Điểm Danh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}