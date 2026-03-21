<?php
require_once __DIR__ . '/../models/ThongBaoModel.php';

class ThongBaoController {

    public static function getMyNotifications() {
        $userId = $_GET['user_id'] ?? null;
        $userType = $_GET['user_type'] ?? null;
        
        if (!$userId || !$userType) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Thiếu thông tin user_id hoặc user_type'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $model = new ThongBaoModel();
        $data = $model->getByReceiver($userId, $userType);
        
        // Transform data: đổi da_doc thành trang_thai
        $data = array_map(function($item) {
            $item['trang_thai'] = $item['da_doc'] ? 'da_doc' : 'chua_doc';
            return $item;
        }, $data);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Danh sách thông báo', 
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function send() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['nguoi_nhan_id']) || !isset($data['tieu_de'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Thiếu thông tin bắt buộc'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $model = new ThongBaoModel();
        $model->create($data);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Đã gửi thông báo'
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function markRead($id) {
        $model = new ThongBaoModel();
        $model->markAsRead($id);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Đã đánh dấu đã đọc'
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function markAllRead() {
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'] ?? null;
        $userType = $data['user_type'] ?? null;
        
        if (!$userId || !$userType) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Thiếu thông tin user_id hoặc user_type'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $model = new ThongBaoModel();
        $model->markAllAsRead($userId, $userType);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Đã đánh dấu tất cả đã đọc'
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>