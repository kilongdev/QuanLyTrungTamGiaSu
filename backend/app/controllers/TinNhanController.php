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
        echo json_encode(['success' => true, 'message' => 'Đã gửi tin nhắn'], JSON_UNESCAPED_UNICODE);
    }

    public function getConversation() {
        $u1Id = $_GET['u1_id'];
        $u1Type = $_GET['u1_type'];
        $u2Id = $_GET['u2_id'];
        $u2Type = $_GET['u2_type'];
        
        $data = $this->model->getConversation($u1Id, $u1Type, $u2Id, $u2Type);
        echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    }
}
?>
