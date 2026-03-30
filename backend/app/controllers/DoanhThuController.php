<?php
require_once __DIR__ . '/../models/DoanhThuModel.php';

class DoanhThuController {
    private $model;

    public function __construct() {
        $this->model = new DoanhThuModel();
    }

    public function getReport() {
        $nam = $_GET['nam'] ?? date('Y');
        $data = $this->model->getBaoCaoNam($nam);
        $this->sendResponse(true, "Báo cáo doanh thu năm $nam", $data);
    }

    public function getOverview() {
        try {
            $latestYear = $this->model->getLatestYearWithData();
            $currentYear = (int)date('Y');
            $currentMonth = (int)date('n');

            $mode = $_GET['kieu_thong_ke'] ?? 'nam';
            if (!in_array($mode, ['nam', 'thang', 'khoang_ngay'], true)) {
                $mode = 'nam';
            }

            $requestedYear = isset($_GET['nam']) ? (int)$_GET['nam'] : null;
            $requestedMonth = isset($_GET['thang']) ? (int)$_GET['thang'] : null;

            $filter = ['mode' => 'year', 'year' => ($requestedYear ?: ($latestYear ?: $currentYear))];
            $responseFilter = [
                'kieu_thong_ke' => 'nam',
                'nam' => $filter['year'],
                'thang' => null,
                'tu_ngay' => null,
                'den_ngay' => null,
            ];

            if ($mode === 'thang') {
                $month = $requestedMonth ?: $currentMonth;
                if ($month < 1 || $month > 12) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Tháng không hợp lệ'
                    ]);
                    return;
                }

                $year = $requestedYear ?: $currentYear;
                $filter = [
                    'mode' => 'month',
                    'year' => $year,
                    'month' => $month,
                ];
                $responseFilter = [
                    'kieu_thong_ke' => 'thang',
                    'nam' => $year,
                    'thang' => $month,
                    'tu_ngay' => null,
                    'den_ngay' => null,
                ];
            }

            if ($mode === 'khoang_ngay') {
                $fromDate = $_GET['tu_ngay'] ?? null;
                $toDate = $_GET['den_ngay'] ?? null;

                if (empty($fromDate) || empty($toDate)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Vui lòng chọn đủ từ ngày và đến ngày'
                    ]);
                    return;
                }

                $fromTs = strtotime($fromDate);
                $toTs = strtotime($toDate);

                if ($fromTs === false || $toTs === false) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Định dạng ngày không hợp lệ'
                    ]);
                    return;
                }

                if ($fromTs > $toTs) {
                    $temp = $fromTs;
                    $fromTs = $toTs;
                    $toTs = $temp;
                }

                $normalizedFromDate = date('Y-m-d', $fromTs);
                $normalizedToDate = date('Y-m-d', $toTs);

                $filter = [
                    'mode' => 'range',
                    'fromYm' => (int)date('Ym', $fromTs),
                    'toYm' => (int)date('Ym', $toTs),
                ];
                $responseFilter = [
                    'kieu_thong_ke' => 'khoang_ngay',
                    'nam' => null,
                    'thang' => null,
                    'tu_ngay' => $normalizedFromDate,
                    'den_ngay' => $normalizedToDate,
                ];
            }

            $monthlyTrend = $this->model->getMonthlyTrendByFilter($filter);
            $yearSummary = $this->model->getSummaryByFilter($filter);
            $topClasses = $this->model->getClassRevenueDetailsByFilter($filter, 8);
            $subjectDistribution = $this->model->getSubjectRevenueDistributionByFilter($filter);

            echo json_encode([
                'success' => true,
                'data' => [
                    'year' => $responseFilter['nam'],
                    'filter' => $responseFilter,
                    'summary' => [
                        'totalRevenue' => (float)($yearSummary['tong_thu_hoc_phi'] ?? 0),
                        'totalExpense' => (float)($yearSummary['tong_tra_gia_su'] ?? 0),
                        'totalProfit' => (float)($yearSummary['loi_nhuan'] ?? 0),
                        'monthsWithData' => (int)($yearSummary['so_thang_co_du_lieu'] ?? 0),
                        'classTouches' => (int)($yearSummary['tong_luot_lop'] ?? 0),
                        'studentTouches' => (int)($yearSummary['tong_luot_hoc_sinh'] ?? 0)
                    ],
                    'monthlyTrend' => $monthlyTrend,
                    'topClasses' => $topClasses,
                    'subjectDistribution' => $subjectDistribution
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi lấy tổng quan doanh thu: ' . $e->getMessage()
            ]);
        }
    }

    public function processMonthly() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $thang = isset($input['thang']) ? (int)$input['thang'] : (int)date('n');
            $nam = isset($input['nam']) ? (int)$input['nam'] : (int)date('Y');

            if ($thang < 1 || $thang > 12) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Tháng không hợp lệ'
                ]);
                return;
            }

            $result = $this->model->processMonthlyRevenue($thang, $nam);

            echo json_encode([
                'success' => true,
                'message' => 'Đã xử lý doanh thu tháng thành công',
                'data' => $result
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Lỗi xử lý doanh thu tháng: ' . $e->getMessage()
            ]);
        }
    }

    public function getDetails($id) {
        $data = $this->model->getChiTietByDoanhThuId($id);
        $this->sendResponse(true, 'Chi tiết doanh thu', $data);
    }

    public function createReport() {
        $data = json_decode(file_get_contents('php://input'), true);
        // Logic tính toán tổng hợp nên được thực hiện ở Service layer hoặc tính trước khi gửi lên
        $id = $this->model->taoBaoCaoThang($data);
        
        // Nếu có chi tiết lớp học gửi kèm
        if (isset($data['chi_tiet']) && is_array($data['chi_tiet'])) {
            foreach ($data['chi_tiet'] as $item) {
                $item['doanh_thu_id'] = $id;
                $this->model->themChiTietLop($item);
            }
        }

        $this->sendResponse(true, 'Đã tạo báo cáo doanh thu', ['id' => $id]);
    }

    private function sendResponse($success, $message, $data = null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
