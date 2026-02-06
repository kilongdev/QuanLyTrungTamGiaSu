<?php
require_once __DIR__ . '/../models/HocPhiModel.php';

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
        $this->sendResponse(true, 'Tạo hóa đơn học phí thành công', ['id' => $id]);
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['trang_thai_thanh_toan'])) {
            $this->sendResponse(false, 'Thiếu trạng thái', null, 400);
            return;
        }
        $this->model->updateStatus($id, $data['trang_thai_thanh_toan']);
        $this->sendResponse(true, 'Cập nhật trạng thái thành công');
    }

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
