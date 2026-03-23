<?php
require_once __DIR__ . '/../models/TinNhanModel.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';

class TinNhanController {
    private $model;

    public function __construct() {
        $this->model = new TinNhanModel();
    }

    public function send() {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->create($data);
        
        // Lấy tên người gửi
        $tenNguoiGui = $this->getUserName($data['nguoi_gui_id'] ?? 0, $data['loai_nguoi_gui'] ?? 'system');
        $loaiNguoiGuiText = $this->getRoleName($data['loai_nguoi_gui'] ?? 'system');
        
        // Gửi thông báo cho người nhận tin nhắn
        if (!empty($data['nguoi_nhan_id']) && !empty($data['loai_nguoi_nhan'])) {
            ThongBaoModel::guiThongBao(
                $data['nguoi_nhan_id'],
                $data['loai_nguoi_nhan'],
                'Tin nhắn mới',
                "Bạn có tin nhắn mới từ {$loaiNguoiGuiText} {$tenNguoiGui}.",
                'tin_nhan',
                $data['nguoi_gui_id'] ?? 0,
                $data['loai_nguoi_gui'] ?? 'system'
            );
        }
        
        $this->sendResponse(true, 'Đã gửi tin nhắn');
    }

    private function getUserName($id, $type) {
        require_once __DIR__ . '/../core/Database.php';
        
        $tableMap = [
            'admin' => ['table' => 'admin', 'id_field' => 'admin_id', 'name_field' => 'ho_ten'],
            'gia_su' => ['table' => 'gia_su', 'id_field' => 'gia_su_id', 'name_field' => 'ho_ten'],
            'phu_huynh' => ['table' => 'phu_huynh', 'id_field' => 'phu_huynh_id', 'name_field' => 'ho_ten']
        ];
        
        if (!isset($tableMap[$type]) || empty($id)) {
            return 'Hệ thống';
        }
        
        $config = $tableMap[$type];
        $sql = "SELECT {$config['name_field']} FROM {$config['table']} WHERE {$config['id_field']} = ?";
        $result = Database::queryOne($sql, [$id]);
        
        return $result ? $result[$config['name_field']] : 'Hệ thống';
    }

    private function getRoleName($type) {
        $roleNames = [
            'admin' => 'Admin',
            'gia_su' => 'gia sư',
            'phu_huynh' => 'phụ huynh',
            'system' => 'Hệ thống'
        ];
        return $roleNames[$type] ?? 'Hệ thống';
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
