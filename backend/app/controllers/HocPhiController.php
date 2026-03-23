<?php
require_once __DIR__ . '/../models/HocPhiModel.php';
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
        if (!isset($data['trang_thai_thanh_toan'])) {
            $this->sendResponse(false, 'Thiếu trạng thái', null, 400);
            return;
        }
        
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
        
        $this->model->updateStatus($id, $data['trang_thai_thanh_toan']);
        
        // Gửi thông báo khi thanh toán thành công
        if ($data['trang_thai_thanh_toan'] === 'da_thanh_toan' && $hocPhi && !empty($hocPhi['phu_huynh_id'])) {
            ThongBaoModel::guiThongBao(
                $hocPhi['phu_huynh_id'],
                'phu_huynh',
                'Đã thanh toán học phí',
                "Học phí {$this->formatCurrency($hocPhi['so_tien'])}đ cho học sinh {$hocPhi['ten_hoc_sinh']} - lớp {$hocPhi['ten_lop']} đã được thanh toán thành công.",
                'hoc_phi'
            );
        }
        
        $this->sendResponse(true, 'Cập nhật trạng thái thành công');
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

    public function checkQuaHan() {
        // Lấy danh sách học phí quá hạn (trạng thái đã tự động cập nhật bởi Model)
        $sql = "SELECT hp.*, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, lh.ten_lop
                FROM hoc_phi hp
                JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                WHERE hp.trang_thai_thanh_toan = 'qua_han'
                ORDER BY hp.ngay_tao ASC";
        
        $quaHanList = Database::query($sql);
        $count = 0;
        
        foreach ($quaHanList as $hocPhi) {
            $soNgayQuaHan = floor((strtotime('now') - strtotime($hocPhi['ngay_tao'])) / 86400) - 30;
            
            // Thông báo cho admin
            ThongBaoModel::guiThongBao(
                1,
                'admin',
                'Học phí quá hạn',
                "Học phí {$this->formatCurrency($hocPhi['so_tien'])}đ của HS {$hocPhi['ten_hoc_sinh']} - Lớp {$hocPhi['ten_lop']} đã quá hạn {$soNgayQuaHan} ngày. Vui lòng nhắc nhở phụ huynh.",
                'hoc_phi'
            );
            
            // Thông báo cho phụ huynh
            if (!empty($hocPhi['phu_huynh_id'])) {
                ThongBaoModel::guiThongBao(
                    $hocPhi['phu_huynh_id'],
                    'phu_huynh',
                    'Học phí quá hạn',
                    "Học phí {$this->formatCurrency($hocPhi['so_tien'])}đ cho học sinh {$hocPhi['ten_hoc_sinh']} - lớp {$hocPhi['ten_lop']} đã quá hạn {$soNgayQuaHan} ngày. Vui lòng thanh toán sớm để tránh ảnh hưởng đến việc học của con.",
                    'hoc_phi'
                );
            }
            $count++;
        }
        
        $this->sendResponse(true, "Đã gửi {$count} thông báo học phí quá hạn", ['count' => $count]);
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
