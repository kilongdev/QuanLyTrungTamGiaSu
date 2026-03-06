<?php
require_once __DIR__ . '/../models/TinNhanModel.php';

class TinNhanController {
    private $model;

    public function __construct() {
        $this->model = new TinNhanModel();
    }

    public function send() {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->create($data);
        $this->sendResponse(true, 'Đã gửi tin nhắn');
    }

    public function getConversation() {
        $u1Id = $_GET['u1_id'] ?? null;
        $u1Type = $_GET['u1_type'] ?? null;
        $u2Id = $_GET['u2_id'] ?? null;
        $u2Type = $_GET['u2_type'] ?? null;
        
        if (!$u1Id || !$u1Type || !$u2Id || !$u2Type) {
            $this->sendResponse(false, 'Thiếu thông tin tham số (u1_id, u1_type, u2_id, u2_type)', null, 400);
            return;
        }

        $data = $this->model->getConversation($u1Id, $u1Type, $u2Id, $u2Type);
        $this->sendResponse(true, 'Nội dung cuộc hội thoại', $data);
    }

    public function getIncoming() {
        $userId = $_GET['user_id'] ?? null;
        $userType = $_GET['user_type'] ?? null;

        if (!$userId || !$userType) {
            $this->sendResponse(false, 'Thiếu thông tin người nhận (user_id, user_type)', null, 400);
            return;
        }

        $data = $this->model->getMessagesByReceiver($userId, $userType);
        $this->sendResponse(true, 'Danh sách tin nhắn đến', $data);
    }

    public function getOutgoing() {
        $userId = $_GET['user_id'] ?? null;
        $userType = $_GET['user_type'] ?? null;

        if (!$userId || !$userType) {
            $this->sendResponse(false, 'Thiếu thông tin người gửi (user_id, user_type)', null, 400);
            return;
        }

        $data = $this->model->getMessagesBySender($userId, $userType);
        $this->sendResponse(true, 'Danh sách tin nhắn đã gửi', $data);
    }

    public function markRead($id) {
        $this->model->markAsRead($id);
        $this->sendResponse(true, 'Đã đánh dấu tin nhắn là đã đọc');
    }

    public function delete($id) {
        $result = $this->model->delete($id);
        if ($result) {
            $this->sendResponse(true, 'Đã xóa tin nhắn thành công');
        } else {
            $this->sendResponse(false, 'Không thể xóa tin nhắn', null, 500);
        }
    }

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
