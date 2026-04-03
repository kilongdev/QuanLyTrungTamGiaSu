<?php
require_once __DIR__ . '/../models/LuongGiaSuModel.php';
require_once __DIR__ . '/../models/DoanhThuModel.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LuongGiaSuController {
    private $model;

    public function __construct() {
        $this->model = new LuongGiaSuModel();
    }

    public function getAll() {
        try {
            $data = $this->model->findAll();
            $this->sendResponse(true, 'Danh sách lương', $data);
        } catch (Throwable $e) {
            $this->sendResponse(false, 'Lỗi tải danh sách lương: ' . $e->getMessage(), null, 500);
        }
    }

    public function getByGiaSu($id) {
        $data = $this->model->getByGiaSu($id);
        $this->sendResponse(true, 'Danh sách lương của gia sư', $data);
    }

    public function getDetail($id) {
        try {
            $luong = Database::queryOne(
                "SELECT lg.*, 
                        CONCAT(LPAD(lg.thang, 2, '0'), '/', lg.nam) as thang_nam,
                        gs.ho_ten as ten_giasu, gs.gia_su_id, gs.so_dien_thoai, gs.email,
                        lh.ten_lop, mh.ten_mon_hoc
                 FROM luong_gia_su lg
                 JOIN gia_su gs ON lg.gia_su_id = gs.gia_su_id
                 LEFT JOIN lop_hoc lh ON lg.lop_hoc_id = lh.lop_hoc_id
                 LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE lg.luong_id = ?",
                [$id]
            );
            
            if (!$luong) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            $this->sendResponse(true, 'Chi tiết lương', $luong);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    public function getDetailByGroup($giaSuId, $thang, $nam) {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $luongList = $this->model->getDetailByGiaSuMonthYear($giaSuId, $thang, $nam);
            
            if (empty($luongList)) {
                echo json_encode(['success' => false, 'message' => 'Không tìm thấy lương', 'data' => null], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $tongLuongTatCa = 0;
            $tongLuongDaThanhToan = 0;
            $tongLuongChuaThanhToan = 0;

            foreach ($luongList as $row) {
                $tien = (float)($row['tien_tra_gia_su'] ?? 0);
                $trangThai = (string)($row['trang_thai_thanh_toan'] ?? 'chua_thanh_toan');

                $tongLuongTatCa += $tien;
                if ($trangThai === 'da_thanh_toan') {
                    $tongLuongDaThanhToan += $tien;
                } else {
                    $tongLuongChuaThanhToan += $tien;
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Chi tiết lương theo nhóm',
                'data' => [
                    'gia_su_id' => $giaSuId,
                    'thang' => $thang,
                    'nam' => $nam,
                    'ten_giasu' => $luongList[0]['ten_giasu'] ?? '',
                    'so_dien_thoai' => $luongList[0]['so_dien_thoai'] ?? '',
                    'email' => $luongList[0]['email'] ?? '',
                    'tong_luong' => $tongLuongChuaThanhToan,
                    'tong_luong_chua_thanh_toan' => $tongLuongChuaThanhToan,
                    'tong_luong_da_thanh_toan' => $tongLuongDaThanhToan,
                    'tong_luong_tat_ca' => $tongLuongTatCa,
                    'so_lop' => count($luongList),
                    'danh_sach_lop' => $luongList
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage(), 'data' => null], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['gia_su_id']) || empty($data['lop_hoc_id'])) {
            $this->sendResponse(false, 'Thiếu thông tin bắt buộc', null, 400);
            return;
        }
        
        if (empty($data['thang']) || empty($data['nam'])) {
            $this->sendResponse(false, 'Vui lòng nhập tháng và năm', null, 400);
            return;
        }
        
        $lopHocId = (int)$data['lop_hoc_id'];
        $thang = (int)$data['thang'];
        $nam = (int)$data['nam'];
        
        // Kiểm tra đã có lương cho tháng này chưa
        $existingLuong = Database::queryOne(
            "SELECT luong_id FROM luong_gia_su WHERE lop_hoc_id = ? AND thang = ? AND nam = ?",
            [$lopHocId, $thang, $nam]
        );
        
        if ($existingLuong) {
            $this->sendResponse(false, 'Lương cho tháng này đã tồn tại', null, 400);
            return;
        }
        
        $lopHoc = Database::queryOne(
            "SELECT lop_hoc_id, ten_lop, gia_su_id, gia_toan_khoa, gia_moi_buoi, so_buoi_hoc, loai_chi_tra, gia_tri_chi_tra
             FROM lop_hoc WHERE lop_hoc_id = ?",
            [$lopHocId]
        );
        
        if (!$lopHoc) {
            $this->sendResponse(false, 'Không tìm thấy lớp học', null, 404);
            return;
        }
        
        // Tính so_buoi_day từ số lượt học sinh có mặt trong tháng
        $soBuoiDay = Database::queryOne(
            "SELECT COUNT(*) as count FROM diem_danh dd
             JOIN lich_hoc lh ON dd.lich_hoc_id = lh.lich_hoc_id
             WHERE lh.lop_hoc_id = ? AND dd.tinh_trang = 'co_mat'
             AND MONTH(lh.ngay_hoc) = ? AND YEAR(lh.ngay_hoc) = ?",
            [$lopHocId, $thang, $nam]
        );
        $soBuoiDay = (int)($soBuoiDay['count'] ?? 0);
        
        // Tính tong_tien_thu từ học phí đã thanh toán trong tháng
        $tongTienThu = Database::queryOne(
            "SELECT COALESCE(SUM(hp.so_tien), 0) as total FROM hoc_phi hp
             JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
             WHERE dkl.lop_hoc_id = ? AND hp.thang = ? AND hp.nam = ?
             AND hp.trang_thai_thanh_toan = 'da_thanh_toan'",
            [$lopHocId, $thang, $nam]
        );
        $tongTienThu = (float)($tongTienThu['total'] ?? 0);
        
        $tienTraGiaSu = 0;
        $loaiChiTra = $lopHoc['loai_chi_tra'] ?? 'tien_cu_the';
        $giaTriApDung = (float)($lopHoc['gia_tri_chi_tra'] ?? 0);
        $giaMoiBuoi = (float)($lopHoc['gia_moi_buoi'] ?? 0);
        if ($giaMoiBuoi <= 0) {
            $giaToanKhoa = (float)($lopHoc['gia_toan_khoa'] ?? 0);
            $soBuoiKhoaHoc = (int)($lopHoc['so_buoi_hoc'] ?? 0);
            if ($giaToanKhoa > 0 && $soBuoiKhoaHoc > 0) {
                $giaMoiBuoi = $giaToanKhoa / $soBuoiKhoaHoc;
            }
        }

        // Dong bo cong thuc voi UI "Gia moi buoi (uoc tinh)".
        $giaToanKhoa = (float)($lopHoc['gia_toan_khoa'] ?? 0);
        $soBuoiKhoaHoc = (int)($lopHoc['so_buoi_hoc'] ?? 0);
        $donGiaLuongMoiLuot = $giaMoiBuoi;

        if ($giaToanKhoa > 0 && $soBuoiKhoaHoc > 0 && $giaTriApDung > 0) {
            if ($loaiChiTra === 'phan_tram') {
                $donGiaLuongMoiLuot = ($giaToanKhoa * ($giaTriApDung / 100)) / $soBuoiKhoaHoc;
            } elseif ($loaiChiTra === 'tien_cu_the') {
                $donGiaLuongMoiLuot = ($giaToanKhoa - $giaTriApDung) / $soBuoiKhoaHoc;
            }
        }

        if ($donGiaLuongMoiLuot < 0) {
            $donGiaLuongMoiLuot = 0;
        }

        $tienTraGiaSu = $soBuoiDay * $donGiaLuongMoiLuot;
        
        // Nếu không có ngày đến hạn, mặc định là 30 ngày sau
        $ngayDenHan = $data['ngay_den_han'] ?? null;
        if (empty($ngayDenHan)) {
            $ngayDenHan = date('Y-m-d', strtotime('+30 days'));
        }
        
        $salaryData = [
            'gia_su_id' => $lopHoc['gia_su_id'],
            'lop_hoc_id' => $lopHocId,
            'thang' => $thang,
            'nam' => $nam,
            'so_buoi_day' => $soBuoiDay,
            'tong_tien_thu' => $tongTienThu,
            'tien_tra_gia_su' => $tienTraGiaSu,
            'loai_chi_tra' => $loaiChiTra,
            'gia_tri_ap_dung' => $giaTriApDung,
            'trang_thai_thanh_toan' => 'chua_thanh_toan',
            'ngay_den_han' => $ngayDenHan
        ];
        
        $id = $this->model->create($salaryData);
        
        // Gửi thông báo cho gia sư
        $giaSuInfo = Database::queryOne(
            "SELECT ho_ten FROM gia_su WHERE gia_su_id = ?",
            [$lopHoc['gia_su_id']]
        );
        
        if ($giaSuInfo) {
            ThongBaoModel::guiThongBao(
                $lopHoc['gia_su_id'],
                'gia_su',
                'Lương mới được tạo',
                "Bạn có lương {$this->formatCurrency($tienTraGiaSu)}đ cho lớp {$lopHoc['ten_lop']} - Tháng {$thang}/{$nam} ({$soBuoiDay} lượt dạy).",
                'khac'
            );
            
            // Thông báo cho admin
            ThongBaoModel::guiThongBao(
                1,
                'admin',
                'Lương gia sư mới được tạo',
                "Lương {$this->formatCurrency($tienTraGiaSu)}đ cho gia sư {$giaSuInfo['ho_ten']} - Lớp {$lopHoc['ten_lop']} - Tháng {$thang}/{$nam} ({$soBuoiDay} lượt dạy).",
                'khac'
            );
        }
        
        $this->sendResponse(true, 'Tính lương thành công', [
            'id' => $id,
            'so_buoi_day' => $soBuoiDay,
            'tien_tra_gia_su' => $tienTraGiaSu,
            'tong_tien_thu' => $tongTienThu,
            'loai_chi_tra' => $loaiChiTra,
            'gia_tri_ap_dung' => $giaTriApDung
        ]);
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $skipRevenueSync = !empty($data['skip_revenue_sync']);
        $skipNotifications = !empty($data['skip_notifications']);
        
        try {
            $existing = Database::queryOne("SELECT * FROM luong_gia_su WHERE luong_id = ?", [$id]);
            if (!$existing) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['tien_tra_gia_su'])) {
                $updateFields[] = "tien_tra_gia_su = ?";
                $params[] = $data['tien_tra_gia_su'];
            }
            if (isset($data['so_buoi_day'])) {
                $updateFields[] = "so_buoi_day = ?";
                $params[] = $data['so_buoi_day'];
            }
            if (isset($data['trang_thai_thanh_toan'])) {
                $updateFields[] = "trang_thai_thanh_toan = ?";
                $params[] = $data['trang_thai_thanh_toan'];

                if ($data['trang_thai_thanh_toan'] === 'da_thanh_toan') {
                    $updateFields[] = "ngay_thanh_toan = CURDATE()";
                } else {
                    $updateFields[] = "ngay_thanh_toan = NULL";
                }
                
                // Gửi thông báo khi thanh toán thành công
                if (!$skipNotifications && $data['trang_thai_thanh_toan'] === 'da_thanh_toan') {
                    $luongInfo = Database::queryOne(
                        "SELECT lg.*, gs.ho_ten as ten_giasu, gs.gia_su_id, lh.ten_lop
                         FROM luong_gia_su lg
                         JOIN gia_su gs ON lg.gia_su_id = gs.gia_su_id
                         LEFT JOIN lop_hoc lh ON lg.lop_hoc_id = lh.lop_hoc_id
                         WHERE lg.luong_id = ?",
                        [$id]
                    );
                    
                    if ($luongInfo) {
                        // Thông báo cho gia sư
                        ThongBaoModel::guiThongBao(
                            $luongInfo['gia_su_id'],
                            'gia_su',
                            'Đã nhận lương',
                            "Bạn đã nhận lương {$this->formatCurrency($luongInfo['tien_tra_gia_su'])}đ cho lớp {$luongInfo['ten_lop']} - Tháng {$luongInfo['thang']}/{$luongInfo['nam']}.",
                            'thanh_toan'
                        );
                        
                        // Thông báo cho admin
                        ThongBaoModel::guiThongBao(
                            1,
                            'admin',
                            'Đã thanh toán lương gia sư',
                            "Đã thanh toán lương {$this->formatCurrency($luongInfo['tien_tra_gia_su'])}đ cho gia sư {$luongInfo['ten_giasu']} - Lớp {$luongInfo['ten_lop']} - Tháng {$luongInfo['thang']}/{$luongInfo['nam']}.",
                            'thanh_toan'
                        );
                    }
                }
            }
            if (isset($data['ngay_den_han'])) {
                $updateFields[] = "ngay_den_han = ?";
                $params[] = $data['ngay_den_han'];
            }
            if (isset($data['thang'])) {
                $updateFields[] = "thang = ?";
                $params[] = $data['thang'];
            }
            if (isset($data['nam'])) {
                $updateFields[] = "nam = ?";
                $params[] = $data['nam'];
            }
            
            if (!empty($updateFields)) {
                $params[] = $id;
                $sql = "UPDATE luong_gia_su SET " . implode(', ', $updateFields) . " WHERE luong_id = ?";
                Database::execute($sql, $params);
            }

            $updatedLuong = Database::queryOne(
                "SELECT thang, nam, trang_thai_thanh_toan, tien_tra_gia_su, ngay_thanh_toan FROM luong_gia_su WHERE luong_id = ?",
                [$id]
            );

            $hasPaymentStatusChange = isset($data['trang_thai_thanh_toan']);

            if ($updatedLuong && (
                isset($data['trang_thai_thanh_toan']) ||
                isset($data['tien_tra_gia_su']) ||
                isset($data['thang']) ||
                isset($data['nam'])
            ) && (!$skipRevenueSync || $hasPaymentStatusChange)) {
                try {
                    $this->syncDoanhThuForLuongChanges($existing, $updatedLuong);
                } catch (Throwable $syncError) {
                    error_log('Luong sync doanh thu failed: ' . $syncError->getMessage());
                }
            }
            
            $this->sendResponse(true, 'Cập nhật lương thành công');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    public function delete($id) {
        try {
            $existing = Database::queryOne("SELECT * FROM luong_gia_su WHERE luong_id = ?", [$id]);
            if (!$existing) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            Database::execute("DELETE FROM luong_gia_su WHERE luong_id = ?", [$id]);
            $this->sendResponse(true, 'Xóa lương thành công');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Kiểm tra và cập nhật lương quá hạn
     * Gọi API này định kỳ (cron job) hoặc khi load trang
     */
    public function checkOverdue() {
        try {
            $today = date('Y-m-d');
            
            // Reset trạng thái: nếu đang "qua_han" nhưng hạn mới còn trong tương lai -> "chua_thanh_toan"
            Database::execute(
                "UPDATE luong_gia_su 
                 SET trang_thai_thanh_toan = 'chua_thanh_toan' 
                 WHERE trang_thai_thanh_toan = 'qua_han' 
                 AND ngay_den_han >= ?",
                [$today]
            );
            
            // Tìm các lương quá hạn (chưa thanh toán và đã qua ngày đáo hạn)
            $overdueSalaries = Database::query(
                "SELECT lg.*, gs.ho_ten as ten_giasu, gs.gia_su_id, lh.ten_lop
                 FROM luong_gia_su lg
                 JOIN gia_su gs ON lg.gia_su_id = gs.gia_su_id
                 LEFT JOIN lop_hoc lh ON lg.lop_hoc_id = lh.lop_hoc_id
                 WHERE lg.ngay_den_han < ? 
                 AND lg.trang_thai_thanh_toan = 'chua_thanh_toan'",
                [$today]
            );
            
            $updatedCount = 0;
            
            foreach ($overdueSalaries as $luong) {
                // Cập nhật trạng thái thành quá hạn
                Database::execute(
                    "UPDATE luong_gia_su SET trang_thai_thanh_toan = 'qua_han' WHERE luong_id = ?",
                    [$luong['luong_id']]
                );
                
                // Gửi thông báo cho gia sư
                ThongBaoModel::guiThongBao(
                    $luong['gia_su_id'],
                    'gia_su',
                    'Lương quá hạn thanh toán',
                    "Lương {$this->formatCurrency($luong['tien_tra_gia_su'])}đ cho lớp {$luong['ten_lop']} - Tháng {$luong['thang']}/{$luong['nam']} đã quá hạn thanh toán (hạn: {$luong['ngay_den_han']}).",
                    'khac'
                );
                
                // Gửi thông báo cho admin
                ThongBaoModel::guiThongBao(
                    1,
                    'admin',
                    'Lương gia sư quá hạn',
                    "Lương {$this->formatCurrency($luong['tien_tra_gia_su'])}đ cho gia sư {$luong['ten_giasu']} - Lớp {$luong['ten_lop']} - Tháng {$luong['thang']}/{$luong['nam']} đã quá hạn thanh toán.",
                    'khac'
                );
                
                $updatedCount++;
            }
            
            $this->sendResponse(true, "Đã kiểm tra và cập nhật {$updatedCount} lương quá hạn", [
                'updated_count' => $updatedCount,
                'today' => $today
            ]);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    private function syncDoanhThuForLuongChanges($oldLuong, $newLuong) {
        $targets = [];

        $this->collectRevenueTargetsFromPaymentRecord($oldLuong, $targets);
        $this->collectRevenueTargetsFromPaymentRecord($newLuong, $targets);

        if (empty($targets)) {
            return;
        }

        $doanhThuModel = new DoanhThuModel();
        foreach ($targets as $target) {
            [$month, $year] = $target;
            // Khi chỉ đổi trạng thái lương, chỉ cần refresh doanh thu; không tái đồng bộ bảng lương.
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

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function formatCurrency($amount) {
        return number_format((float)($amount ?? 0), 0, ',', '.');
    }
}
