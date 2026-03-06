<?php
require_once __DIR__ . '/../models/LuongGiaSuModel.php';

class LuongGiaSuController {
    private $model;

    public function __construct() {
        $this->model = new LuongGiaSuModel();
    }

    public function getAll() {
        $data = $this->model->findAll();
        $this->sendResponse(true, 'Danh sách lương', $data);
    }

    public function getByGiaSu($id) {
        $data = $this->model->getByGiaSu($id);
        $this->sendResponse(true, 'Danh sách lương của gia sư', $data);
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        // Cần thêm validate dữ liệu ở đây
        $id = $this->model->create($data);
        $this->sendResponse(true, 'Tính lương thành công', ['id' => $id]);
    }

    private function sendResponse($success, $message, $data = null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
