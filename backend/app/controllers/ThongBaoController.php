<?php
require_once __DIR__ . '/../models/ThongBaoModel.php';

class ThongBaoController {
    private $model;

    public function __construct() {
        $this->model = new ThongBaoModel();
    }

    public function getMyNotifications() {
        $userId = $_GET['user_id'] ?? null;
        $userType = $_GET['user_type'] ?? null; // admin, gia_su, phu_huynh
        
        if (!$userId || !$userType) {
             $this->sendResponse(false, 'Thiếu thông tin user_id hoặc user_type', null, 400);
             return;
        }

        $data = $this->model->getByReceiver($userId, $userType);
        $this->sendResponse(true, 'Danh sách thông báo', $data);
    }

    public function send() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['nguoi_nhan_id']) || !isset($data['tieu_de'])) {
             $this->sendResponse(false, 'Thiếu thông tin bắt buộc', null, 400);
             return;
        }
        
        $this->model->create($data);
        $this->sendResponse(true, 'Đã gửi thông báo');
    }

    public function markRead($id) {
        $this->model->markAsRead($id);
        $this->sendResponse(true, 'Đã đánh dấu đã đọc');
    }

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>