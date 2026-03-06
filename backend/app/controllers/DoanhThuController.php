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
