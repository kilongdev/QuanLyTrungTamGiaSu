import { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { hocSinhAPI } from "@/api/hocSinhApi";
import { phuHuynhAPI } from "@/api/phuHuynhApi";
import { giaSuAPI } from "@/api/giaSuApi";
import { lopHocAPI } from "@/api/lophocApi";
import { doanhThuAPI } from "@/api/doanhThuApi";

function StatCard({ icon, label, value, color, loading }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color.replace("border-", "bg-").replace("-500", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    tutors: 0,
    classes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingRevenue, setProcessingRevenue] = useState(false);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [subjectRevenueData, setSubjectRevenueData] = useState([]);
  const [classRevenueData, setClassRevenueData] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const overviewParams = { kieu_thong_ke: filterType };
      if (filterType === "thang") {
        overviewParams.nam = selectedYear;
        overviewParams.thang = selectedMonth;
      } else if (filterType === "khoang_ngay") {
        overviewParams.tu_ngay = dateFrom;
        overviewParams.den_ngay = dateTo;
      } else {
        overviewParams.nam = selectedYear;
      }

      const [studentRes, parentRes, tutorRes, classRes, revenueRes] =
        await Promise.all([
          hocSinhAPI.getAll({ limit: 1 }),
          phuHuynhAPI.getAll({ limit: 1 }),
          giaSuAPI.getAll(),
          lopHocAPI.getAll(),
          doanhThuAPI.getOverview(overviewParams),
        ]);

      const allClasses = classRes.data || [];
      const activeClasses = allClasses.filter(
        (c) => c.trang_thai === "dang_hoc",
      );

      const overview = revenueRes?.success ? revenueRes.data || {} : {};
      const summary = overview.summary || {};

      setStats({
        students: studentRes?.pagination?.total || 0,
        parents: parentRes?.pagination?.total || 0,
        tutors: tutorRes?.data?.length || 0,
        classes: allClasses.length,
        activeClasses: activeClasses.length,
        totalRevenue: Number(summary.totalRevenue || 0),
        totalExpense: Number(summary.totalExpense || 0),
        totalProfit: Number(summary.totalProfit || 0),
      });

      const trend = (overview.monthlyTrend || []).map((item) => ({
        month: item.month,
        revenue: Number(item.revenue || 0),
        profit: Number(item.profit || 0),
        students: Number(item.students || 0),
      }));
      setRevenueTrendData(trend);

      const subjects = (overview.subjectDistribution || []).map(
        (item, index) => ({
          name: item.subject,
          value: Number(item.revenue || 0),
          profit: Number(item.profit || 0),
          color: CHART_COLORS[index % CHART_COLORS.length],
        }),
      );
      setSubjectRevenueData(subjects);

      const classesRevenue = (overview.topClasses || []).map((item) => ({
        grade: item.ten_lop || `Lớp ${item.lop_hoc_id}`,
        total: Number(item.tong_thu || 0),
        active: Number(item.loi_nhuan || 0),
      }));
      setClassRevenueData(classesRevenue);
    } catch (error) {
      console.error("Không thể tải dữ liệu tổng quan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [studentRes, parentRes, tutorRes, classRes, monHocRes] =
          await Promise.all([
            hocSinhAPI.getAll({ limit: 1 }), // Chỉ cần tổng số từ pagination
            phuHuynhAPI.getAll({ limit: 1 }), // Chỉ cần tổng số từ pagination
            giaSuAPI.getAll(), // Tạm thời lấy tất cả để đếm
            lopHocAPI.getAll(), // Tạm thời lấy tất cả để đếm
            monHocAPI.getAll(),
          ]);

        setStats({
          students: studentRes.pagination.total,
          parents: parentRes.pagination.total,
          tutors: tutorRes.data.length,
          classes: classRes.data.length,
        });

        // Set data for helpers
        setMonHocs(monHocRes.data || []);
        setGiaSus(tutorRes.data || []);

        // Filter for ongoing classes
        const ongoing = (classRes.data || []).filter(
          (c) => c.trang_thai === "dang_hoc",
        );
        setOngoingClasses(ongoing);
      } catch (error) {
        console.error("Không thể tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filterType, selectedYear, selectedMonth, dateFrom, dateTo]);

  const handleProcessCurrentMonth = async () => {
    try {
      setProcessingRevenue(true);
      const now = new Date();
      const response = await doanhThuAPI.processMonthly({
        thang: now.getMonth() + 1,
        nam: now.getFullYear(),
      });

      if (!response?.success) {
        console.error(response?.message || "Xử lý doanh thu tháng thất bại");
        return;
      }

      if (selectedYear !== now.getFullYear()) {
        setSelectedYear(now.getFullYear());
      } else {
        await fetchStats();
      }
    } catch (error) {
      console.error("Không thể xử lý doanh thu tháng:", error);
    } finally {
      setProcessingRevenue(false);
    }
  };

  const filterLabel =
    filterType === "thang"
      ? `Tháng ${selectedMonth}/${selectedYear}`
      : filterType === "khoang_ngay"
        ? `${dateFrom} đến ${dateTo}`
        : `Năm ${selectedYear}`;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
        <p className="text-gray-500 text-sm mt-1">
          Các chỉ số quan trọng trong trung tâm.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Tổng số Học sinh"
          value={stats.students}
          icon={<GraduationCap className="text-blue-500" />}
          color="border-blue-500"
          loading={loading}
        />
        <StatCard
          label="Tổng số Phụ huynh"
          value={stats.parents}
          icon={<Users className="text-green-500" />}
          color="border-green-500"
          loading={loading}
        />
        <StatCard
          label="Tổng số Gia sư"
          value={stats.tutors}
          icon={<Briefcase className="text-purple-500" />}
          color="border-purple-500"
          loading={loading}
        />
        <StatCard
          label="Tổng số Lớp học"
          value={stats.classes}
          icon={<BookOpen className="text-orange-500" />}
          color="border-orange-500"
          loading={loading}
        />
      </div>

      {/* Ongoing Classes List */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">
            Lớp đang hoạt động
          </h3>
          <button
            onClick={() => onNavigate && onNavigate("lophoc")}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500 text-center py-8">
            Đang tải danh sách lớp...
          </p>
        ) : ongoingClasses.length > 0 ? (
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
            {ongoingClasses.map((lop) => (
              <div
                key={lop.lop_hoc_id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-lg">
                  {getMonHocName(lop.mon_hoc_id).charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    Lớp {lop.khoi_lop} - {getMonHocName(lop.mon_hoc_id)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    GV: {getGiaSuName(lop.gia_su_id)}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  ID: {lop.lop_hoc_id}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Không có lớp nào đang hoạt động.</p>
          </div>
        )}
      </div>
    </div>
  );
}
