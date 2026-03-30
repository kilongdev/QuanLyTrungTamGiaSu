import { useState, useEffect } from 'react';
import { GraduationCap, Users, Briefcase, BookOpen, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { hocSinhAPI } from '@/api/hocSinhApi';
import { phuHuynhAPI } from '@/api/phuHuynhApi';
import { giaSuAPI } from '@/api/giaSuApi';
import { lopHocAPI } from '@/api/lophocApi';
import { doanhThuAPI } from '@/api/doanhThuApi';

function StatCard({ icon, label, value, color, loading, subtext }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow h-[140px] p-5 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          {loading ? (
            <div className="mt-3 h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-full flex-shrink-0 ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
      {subtext && !loading && <p className="text-xs text-gray-400 mt-auto">{subtext}</p>}
    </div>
  );
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#8B5CF6'];

const formatCurrencyCompact = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

export default function DashboardOverview() {
  const now = new Date();
  const [filterType, setFilterType] = useState('nam');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [dateFrom, setDateFrom] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [dateTo, setDateTo] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    tutors: 0,
    classes: 0,
    activeClasses: 0,
    totalRevenue: 0,
    totalExpense: 0,
    totalProfit: 0,
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
      if (filterType === 'thang') {
        overviewParams.nam = selectedYear;
        overviewParams.thang = selectedMonth;
      } else if (filterType === 'khoang_ngay') {
        overviewParams.tu_ngay = dateFrom;
        overviewParams.den_ngay = dateTo;
      } else {
        overviewParams.nam = selectedYear;
      }

      const [studentRes, parentRes, tutorRes, classRes, revenueRes] = await Promise.all([
        hocSinhAPI.getAll({ limit: 1 }),
        phuHuynhAPI.getAll({ limit: 1 }),
        giaSuAPI.getAll(),
        lopHocAPI.getAll(),
        doanhThuAPI.getOverview(overviewParams),
      ]);

      const allClasses = classRes.data || [];
      const activeClasses = allClasses.filter((c) => c.trang_thai === 'dang_hoc');

      const overview = revenueRes?.success ? (revenueRes.data || {}) : {};
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

      const subjects = (overview.subjectDistribution || []).map((item, index) => ({
        name: item.subject,
        value: Number(item.revenue || 0),
        profit: Number(item.profit || 0),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
      setSubjectRevenueData(subjects);

      const classesRevenue = (overview.topClasses || []).map((item) => ({
        grade: item.ten_lop || `Lớp ${item.lop_hoc_id}`,
        total: Number(item.tong_thu || 0),
        active: Number(item.loi_nhuan || 0),
      }));
      setClassRevenueData(classesRevenue);
    } catch (error) {
      console.error('Không thể tải dữ liệu tổng quan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        console.error(response?.message || 'Xử lý doanh thu tháng thất bại');
        return;
      }

      if (selectedYear !== now.getFullYear()) {
        setSelectedYear(now.getFullYear());
      } else {
        await fetchStats();
      }
    } catch (error) {
      console.error('Không thể xử lý doanh thu tháng:', error);
    } finally {
      setProcessingRevenue(false);
    }
  };

  const filterLabel =
    filterType === 'thang'
      ? `Tháng ${selectedMonth}/${selectedYear}`
      : filterType === 'khoang_ngay'
        ? `${dateFrom} đến ${dateTo}`
        : `Năm ${selectedYear}`;

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
          <p className="text-gray-500 text-sm mt-1">Các chỉ số quan trọng và thống kê hoạt động của trung tâm</p>
        </div>

        {/* Main Statistics Cards */}
        <div className="p-5 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard 
              label="Tổng Học sinh" 
              value={stats.students} 
              icon={<GraduationCap size={24} className="text-blue-500" />} 
              color="border-blue-500" 
              loading={loading}
              subtext="Kích hoạt"
            />
            <StatCard 
              label="Tổng Phụ huynh" 
              value={stats.parents} 
              icon={<Users size={24} className="text-green-500" />} 
              color="border-green-500" 
              loading={loading}
              subtext="Tham gia"
            />
            <StatCard 
              label="Tổng Gia sư" 
              value={stats.tutors} 
              icon={<Briefcase size={24} className="text-purple-500" />} 
              color="border-purple-500" 
              loading={loading}
              subtext="Hoạt động"
            />
            <StatCard 
              label="Tổng Lớp" 
              value={stats.classes} 
              icon={<BookOpen size={24} className="text-orange-500" />} 
              color="border-orange-500" 
              loading={loading}
              subtext="Tất cả"
            />
            <StatCard 
              label="Lớp đang hoạt động" 
              value={stats.activeClasses} 
              icon={<TrendingUp size={24} className="text-red-500" />} 
              color="border-red-500" 
              loading={loading}
              subtext="Hiện tại"
            />
            <StatCard 
              label="Doanh thu" 
              value={formatCurrencyCompact(stats.totalRevenue)} 
              icon={<Award size={24} className="text-yellow-500" />} 
              color="border-yellow-500" 
              loading={loading}
              subtext={`Lợi nhuận: ${formatCurrencyCompact(stats.totalProfit)}`}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="p-5 border-b border-gray-200">
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="w-full md:w-52">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kiểu thống kê</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="nam">Theo năm</option>
                  <option value="thang">Theo tháng</option>
                  <option value="khoang_ngay">Từ ngày đến ngày</option>
                </select>
              </div>

              {(filterType === 'nam' || filterType === 'thang') && (
                <div className="w-full md:w-40">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Năm</label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value || new Date().getFullYear()))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              )}

              {filterType === 'thang' && (
                <div className="w-full md:w-36">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tháng</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>Tháng {month}</option>
                    ))}
                  </select>
                </div>
              )}

              {filterType === 'khoang_ngay' && (
                <>
                  <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>

                  <div className="w-full md:w-44">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">Đang xem dữ liệu: {filterLabel}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Revenue Trend Chart */}
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Xu hướng doanh thu & học sinh
                </h3>
                <p className="text-gray-500 text-sm">Theo bộ lọc: {filterLabel}</p>
                </div>
                <button
                  onClick={handleProcessCurrentMonth}
                  disabled={processingRevenue}
                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {processingRevenue ? 'Đang xử lý...' : 'Xử lý doanh thu tháng này'}
                </button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      if (name === 'Doanh thu') return [new Intl.NumberFormat('vi-VN').format(value), name];
                      if (name === 'Lợi nhuận') return [new Intl.NumberFormat('vi-VN').format(value), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                    name="Doanh thu"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                    name="Lợi nhuận"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    name="Số học sinh"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Subjects Distribution Pie Chart */}
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" />
                  Phân bố theo môn học
                </h3>
                <p className="text-gray-500 text-sm">Tổng số lớp học</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={subjectRevenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrencyCompact(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classes by Grade Chart - Full Width */}
          <div className="pt-6 border-t border-gray-200">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <GraduationCap size={20} className="text-orange-600" />
                Chi tiết doanh thu theo lớp
              </h3>
              <p className="text-gray-500 text-sm">Top lớp theo doanh thu/lợi nhuận ({filterLabel})</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value, name) => [new Intl.NumberFormat('vi-VN').format(value), name]}
                />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Doanh thu lớp" radius={[8, 8, 0, 0]} />
                <Bar dataKey="active" fill="#10B981" name="Lợi nhuận lớp" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}