<?php
require_once __DIR__ . '/../models/HocPhiModel.php';
require_once __DIR__ . '/../models/DoanhThuModel.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class HocPhiController {
    private $model;

    public function __construct() {
        $this->model = new HocPhiModel();
    }

    public function getAll() {
        $data = $this->model->findAll();
        $this->sendResponse(true, 'Danh sách học phí', $data);
    }

    public function getByDangKy($id) {
        $data = $this->model->getByDangKy($id);
        $this->sendResponse(true, 'Lịch sử học phí của đăng ký ' . $id, $data);
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['dang_ky_id']) || !isset($data['so_tien'])) {
            $this->sendResponse(false, 'Thiếu thông tin bắt buộc', null, 400);
            return;
        }
        
        // Kiểm tra trùng lặp học phí (mỗi đăng ký lớp chỉ được tạo 1 lần)
        $existingHocPhi = Database::queryOne(
            "SELECT hoc_phi_id FROM hoc_phi WHERE dang_ky_id = ?",
            [$data['dang_ky_id']]
        );
        
        if ($existingHocPhi) {
            $this->sendResponse(false, 'Học phí cho học sinh ở lớp này đã tồn tại', null, 400);
            return;
        }
        
        // Nếu không có hạn thanh toán, mặc định 30 ngày sau
        $ngayDenHan = $data['ngay_den_han'] ?? null;
        if (empty($ngayDenHan)) {
            $ngayDenHan = date('Y-m-d', strtotime('+30 days'));
        }
        
        $data['ngay_den_han'] = $ngayDenHan;
        $id = $this->model->create($data);
        
        // Gửi thông báo cho phụ huynh
        $dangKy = Database::queryOne(
            "SELECT dkl.*, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, lh.ten_lop, ph.ho_ten as ten_phu_huynh
             FROM dang_ky_lop dkl
             JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
             LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
             WHERE dkl.dang_ky_id = ?",
            [$data['dang_ky_id']]
        );
        
        if ($dangKy && !empty($dangKy['phu_huynh_id'])) {
            ThongBaoModel::guiThongBao(
                $dangKy['phu_huynh_id'],
                'phu_huynh',
                'Học phí mới',
                "Học phí {$this->formatCurrency($data['so_tien'])}đ cho học sinh {$dangKy['ten_hoc_sinh']} - lớp {$dangKy['ten_lop']} đã được tạo. Vui lòng thanh toán.",
                'hoc_phi'
            );
        }
        
        // Thông báo cho admin
        ThongBaoModel::guiThongBao(
            1,
            'admin',
            'Học phí mới được tạo',
            "Học phí {$this->formatCurrency($data['so_tien'])}đ cho HS {$dangKy['ten_hoc_sinh']} - Lớp {$dangKy['ten_lop']} đã được tạo.",
            'hoc_phi'
        );
        
        $this->sendResponse(true, 'Tạo hóa đơn học phí thành công', ['id' => $id]);
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Lấy thông tin học phí trước khi cập nhật
        $hocPhi = Database::queryOne(
            "SELECT hp.*, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, lh.ten_lop
             FROM hoc_phi hp
             JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
             JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
             WHERE hp.hoc_phi_id = ?",
            [$id]
        );
        
        // Cập nhật trạng thái, số buổi và số tiền
        $updateData = [];
        $params = [':id' => $id];
        
        if (isset($data['trang_thai_thanh_toan'])) {
            $updateData[] = "trang_thai_thanh_toan = :trang_thai";
            $params[':trang_thai'] = $data['trang_thai_thanh_toan'];

            if ($data['trang_thai_thanh_toan'] === 'da_thanh_toan') {
                $updateData[] = "ngay_thanh_toan = CURDATE()";
            } else {
                $updateData[] = "ngay_thanh_toan = NULL";
            }
        }
        if (isset($data['so_buoi_da_hoc'])) {
            $updateData[] = "so_buoi_da_hoc = :so_buoi";
            $params[':so_buoi'] = $data['so_buoi_da_hoc'];
        }
        if (isset($data['so_tien'])) {
            $updateData[] = "so_tien = :so_tien";
            $params[':so_tien'] = $data['so_tien'];
        }
        if (isset($data['ngay_den_han'])) {
            $updateData[] = "ngay_den_han = :ngay_den_han";
            $params[':ngay_den_han'] = $data['ngay_den_han'];
        }
        
        if (!empty($updateData)) {
            $sql = "UPDATE hoc_phi SET " . implode(', ', $updateData) . " WHERE hoc_phi_id = :id";
            Database::execute($sql, $params);
        }

        // Tự động đồng bộ doanh thu tháng khi trạng thái/tiền học phí thay đổi
        $updatedHocPhi = Database::queryOne(
            "SELECT thang, nam, trang_thai_thanh_toan, so_tien, ngay_thanh_toan FROM hoc_phi WHERE hoc_phi_id = ?",
            [$id]
        );

        if ($updatedHocPhi && (isset($data['trang_thai_thanh_toan']) || isset($data['so_tien']))) {
            try {
                $this->syncDoanhThuForHocPhiChanges($hocPhi, $updatedHocPhi);
            } catch (Throwable $syncError) {
                error_log('HocPhi sync doanh thu failed: ' . $syncError->getMessage());
            }
        }
        
        // Gửi thông báo khi thanh toán thành công
        if (isset($data['trang_thai_thanh_toan']) && $data['trang_thai_thanh_toan'] === 'da_thanh_toan' && $hocPhi) {
            // Thông báo cho phụ huynh
            if (!empty($hocPhi['phu_huynh_id'])) {
                ThongBaoModel::guiThongBao(
                    $hocPhi['phu_huynh_id'],
                    'phu_huynh',
                    'Đã thanh toán học phí',
                    "Học phí {$this->formatCurrency($data['so_tien'] ?? $hocPhi['so_tien'])}đ cho học sinh {$hocPhi['ten_hoc_sinh']} - lớp {$hocPhi['ten_lop']} đã được thanh toán thành công.",
                    'thanh_toan'
                );
            }
            
            // Thông báo cho admin
            ThongBaoModel::guiThongBao(
                1,
                'admin',
                'Đã thanh toán học phí',
                "Học phí {$this->formatCurrency($data['so_tien'] ?? $hocPhi['so_tien'])}đ của HS {$hocPhi['ten_hoc_sinh']} - Lớp {$hocPhi['ten_lop']} đã được thanh toán thành công.",
                'thanh_toan'
            );
        }
        
        $this->sendResponse(true, 'Cập nhật thành công');
    }

    private function syncDoanhThuForHocPhiChanges($oldHocPhi, $newHocPhi) {
        $targets = [];

        $this->collectRevenueTargetsFromPaymentRecord($oldHocPhi, $targets);
        $this->collectRevenueTargetsFromPaymentRecord($newHocPhi, $targets);

        if (empty($targets)) {
            return;
        }

        $doanhThuModel = new DoanhThuModel();
        foreach ($targets as $target) {
            [$month, $year] = $target;
            $doanhThuModel->processMonthlyRevenue($month, $year, false);
        }
    }

    private function collectRevenueTargetsFromPaymentRecord($record, &$targets) {
        $billingMonth = (int)($record['thang'] ?? 0);
        $billingYear = (int)($record['nam'] ?? 0);

        if ($billingMonth > 0 && $billingYear > 0) {
            $targets["{$billingYear}-{$billingMonth}"] = [$billingMonth, $billingYear];
        }

        if (!empty($record['ngay_thanh_toan'])) {
            $ts = strtotime($record['ngay_thanh_toan']);
            if ($ts !== false) {
                $paidMonth = (int)date('n', $ts);
                $paidYear = (int)date('Y', $ts);
                $targets["{$paidYear}-{$paidMonth}"] = [$paidMonth, $paidYear];
            }
        }
    }

    public function delete($id) {
        try {
            $result = $this->model->delete($id);
            if ($result) {
                $this->sendResponse(true, 'Xóa học phí thành công');
            } else {
                $this->sendResponse(false, 'Không tìm thấy học phí', null, 404);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Kiểm tra và cập nhật học phí quá hạn
     * Gọi API này định kỳ (cron job) hoặc khi load trang
     */
    public function checkOverdue() {
        try {
            $today = date('Y-m-d');
            
            // Reset trạng thái: nếu đang "qua_han" nhưng hạn mới còn trong tương lai -> "chua_thanh_toan"
            Database::execute(
                "UPDATE hoc_phi 
                 SET trang_thai_thanh_toan = 'chua_thanh_toan' 
                 WHERE trang_thai_thanh_toan = 'qua_han' 
                 AND ngay_den_han >= ?",
                [$today]
            );
            
            // Tìm các học phí quá hạn (chưa thanh toán và đã qua ngày đáo hạn)
            $overduePayments = Database::query(
                "SELECT hp.*, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, lh.ten_lop
                 FROM hoc_phi hp
                 JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                 JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 WHERE hp.ngay_den_han < ? 
                 AND hp.trang_thai_thanh_toan = 'chua_thanh_toan'",
                [$today]
            );
            
            $updatedCount = 0;
            
            foreach ($overduePayments as $hocPhi) {
                // Cập nhật trạng thái thành quá hạn
                Database::execute(
                    "UPDATE hoc_phi SET trang_thai_thanh_toan = 'qua_han' WHERE hoc_phi_id = ?",
                    [$hocPhi['hoc_phi_id']]
                );
                $updatedCount++;
            }
            
            $this->sendResponse(true, "Đã kiểm tra và cập nhật {$updatedCount} học phí quá hạn", [
                'updated_count' => $updatedCount,
                'today' => $today
            ]);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Gửi thông báo nhắc nhở cho các học phí đã quá hạn
     */
    public function sendOverdueNotifications() {
        try {
            $today = date('Y-m-d');
            
            // Lấy danh sách học phí đã quá hạn
            $overduePayments = Database::query(
                "SELECT hp.*, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, lh.ten_lop
                 FROM hoc_phi hp
                 JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                 JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 WHERE hp.trang_thai_thanh_toan = 'qua_han'"
            );
            
            $count = 0;
            
            foreach ($overduePayments as $hocPhi) {
                // Thông báo cho phụ huynh
                if (!empty($hocPhi['phu_huynh_id'])) {
                    ThongBaoModel::guiThongBao(
                        $hocPhi['phu_huynh_id'],
                        'phu_huynh',
                        'Nhắc nhở: Học phí quá hạn thanh toán',
                        "Học phí {$this->formatCurrency($hocPhi['so_tien'])}đ cho học sinh {$hocPhi['ten_hoc_sinh']} - lớp {$hocPhi['ten_lop']} đã quá hạn thanh toán (hạn: {$hocPhi['ngay_den_han']}). Vui lòng thanh toán sớm.",
                        'hoc_phi'
                    );
                }
                
                // Thông báo cho admin
                ThongBaoModel::guiThongBao(
                    1,
                    'admin',
                    'Nhắc nhở: Học phí quá hạn',
                    "Học phí {$this->formatCurrency($hocPhi['so_tien'])}đ của HS {$hocPhi['ten_hoc_sinh']} - Lớp {$hocPhi['ten_lop']} đã quá hạn thanh toán (hạn: {$hocPhi['ngay_den_han']}).",
                    'hoc_phi'
                );
                
                $count++;
            }
            
            $this->sendResponse(true, "Đã gửi {$count} thông báo nhắc nhở học phí quá hạn", [
                'count' => $count,
                'today' => $today
            ]);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    public function getDetail($id) {
        // Debug log
        error_log("getDetail called with id: " . $id);
        
        try {
            // Lấy thông tin học phí chi tiết
            $hocPhi = Database::queryOne(
                "SELECT hp.*, hs.ho_ten as ten_hoc_sinh, hs.hoc_sinh_id, hs.phu_huynh_id, ph.ho_ten as ten_phu_huynh, lh.ten_lop, mh.ten_mon_hoc
                 FROM hoc_phi hp
                 JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                 JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                 LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE hp.hoc_phi_id = ?",
                [$id]
            );
            
            error_log("hocPhi result: " . json_encode($hocPhi));
            
            if (!$hocPhi) {
                $this->sendResponse(false, 'Không tìm thấy học phí', null, 404);
                return;
            }
            
            // Lấy danh sách các lớp học sinh đang học
            $lopHocList = Database::query(
                "SELECT dkl.dang_ky_id, lh.ten_lop, mh.ten_mon_hoc,
                        (SELECT COALESCE(SUM(hp2.so_tien), 0) FROM hoc_phi hp2 WHERE hp2.dang_ky_id = dkl.dang_ky_id) as tong_tien_lop,
                        (SELECT COUNT(*) FROM hoc_phi hp3 WHERE hp3.dang_ky_id = dkl.dang_ky_id AND hp3.trang_thai_thanh_toan = 'da_thanh_toan') as so_lan_da_thanh_toan,
                        (SELECT COUNT(*) FROM hoc_phi hp4 WHERE hp4.dang_ky_id = dkl.dang_ky_id AND hp4.trang_thai_thanh_toan != 'da_thanh_toan') as so_lan_chua_thanh_toan
                 FROM dang_ky_lop dkl
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE dkl.hoc_sinh_id = ? AND dkl.trang_thai = 'da_duyet'",
                [$hocPhi['hoc_sinh_id']]
            );
            
            $hocPhi['danh_sach_lop'] = $lopHocList;
            
            $this->sendResponse(true, 'Chi tiết học phí', $hocPhi);
        } catch (Exception $e) {
            error_log("getDetail error: " . $e->getMessage());
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function formatCurrency($amount) {
        return number_format($amount, 0, ',', '.');
    }
}
?>
