import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, Clock, CheckCircle, AlertCircle, ChevronRight, User } from "lucide-react";
import { phuHuynhAPI } from "../api/phuHuynhApi";
import { hocPhiAPI } from "../api/hocPhiApi";
import { cn } from "@/lib/utils";

export default function HocPhiPhuHuynh() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tuitionData, setTuitionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await phuHuynhAPI.getMyStudents();
      setStudents(res.data || []);
      if (res.data && res.data.length > 0) {
        handleSelectStudent(res.data[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách học sinh:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const res = await hocPhiAPI.getByChild(student.hoc_sinh_id);
      setTuitionData(res.data?.hoc_phi_lich_su || []);
    } catch (error) {
      console.error("Lỗi lấy học phí:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "da_thanh_toan":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cho_xac_nhan":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "qua_han":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    if (status === "da_thanh_toan") return "Đã thanh toán";
    if (status === "cho_xac_nhan") return "Chờ xác nhận";
    if (status === "qua_han") return "Quá hạn";
    return "Chưa thanh toán";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Quản lý Học phí
          </h1>
          <p className="text-gray-500 text-sm">Theo dõi và thanh toán học phí cho các con</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Danh sách con */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-gray-700 px-1">Danh sách con</h3>
          {students.map((hs) => (
            <button
              key={hs.hoc_sinh_id}
              onClick={() => handleSelectStudent(hs)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                selectedStudent?.hoc_sinh_id === hs.hoc_sinh_id
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", selectedStudent?.hoc_sinh_id === hs.hoc_sinh_id ? "bg-blue-500" : "bg-gray-100")}>
                  <User size={18} />
                </div>
                <span className="font-medium text-sm">{hs.ho_ten}</span>
              </div>
              <ChevronRight size={16} opacity={0.5} />
            </button>
          ))}
        </div>

        {/* Nội dung học phí */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">
                Học phí của bé: <span className="text-blue-600">{selectedStudent?.ho_ten}</span>
              </h3>
            </div>

            {loading ? (
              <div className="p-20 text-center text-gray-400">Đang tải dữ liệu...</div>
            ) : tuitionData.length === 0 ? (
              <div className="p-20 text-center space-y-3">
                <CreditCard size={48} className="mx-auto text-gray-200" />
                <p className="text-gray-500">Bé hiện chưa có thông tin học phí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 font-bold border-b border-gray-100">
                      <th className="px-6 py-4">Lớp học</th>
                      <th className="px-6 py-4 text-right">Số tiền</th>
                      <th className="px-6 py-4">Hạn đóng</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tuitionData.map((hp) => (
                      <tr key={hp.hoc_phi_id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800">{hp.ten_lop}</div>
                          <div className="text-xs text-gray-500">{hp.ten_mon_hoc}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-red-600">
                            {Number(hp.so_tien).toLocaleString("vi-VN")} đ
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            {hp.ngay_den_han ? new Date(hp.ngay_den_han).toLocaleDateString("vi-VN") : "---"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusStyle(hp.trang_thai_thanh_toan))}>
                            {getStatusText(hp.trang_thai_thanh_toan)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {hp.trang_thai_thanh_toan !== "da_thanh_toan" && (
                            <button className="text-xs font-bold text-blue-600 hover:underline">
                              Thanh toán ngay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gợi ý chuyển khoản */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Hướng dẫn thanh toán</h4>
              <p className="text-sm text-blue-700 mt-1">
                Phụ huynh vui lòng chuyển khoản qua ngân hàng với nội dung: 
                <span className="font-bold"> [MaHocPhi] [TenHocSinh]</span>. 
                Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật trạng thái sau khi Admin xác nhận.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}