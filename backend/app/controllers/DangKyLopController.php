<?php
require_once __DIR__ . '/../models/DangKyLop.php';

class DangKyLopController {

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['hoc_sinh_id']) || empty($data['lop_hoc_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID học sinh hoặc lớp học"]);
            return;
        }

        try {
            $result = DangKyLop::create($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Gửi yêu cầu đăng ký thành công, vui lòng chờ duyệt!"]);
            }
        } catch (Exception $e) {
            http_response_code(400); 
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['trang_thai'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp trạng thái mới (da_duyet, tu_choi, da_huy)"]);
            return;
        }

        try {
            $result = DangKyLop::updateStatus($id, $data['trang_thai']);
            if ($result) {
                echo json_encode(["status" => "success", "message" => "Đã cập nhật trạng thái đơn đăng ký!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    public function getByLop($lop_hoc_id) {
        $data = DangKyLop::getByLop($lop_hoc_id);
        echo json_encode(["status" => "success", "data" => $data]);
    }
}