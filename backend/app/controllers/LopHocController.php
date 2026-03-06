<?php
require_once __DIR__ . '/../models/LopHoc.php';

class LopHocController {

    public function index() {
        $lopHocs = LopHoc::getAll();
        echo json_encode(["status" => "success", "data" => $lopHocs]);
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['mon_hoc_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]);
            return;
        }

        try {
            $result = LopHoc::create($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Tạo lớp học thành công!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học cần sửa"]);
            return;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['mon_hoc_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]);
            return;
        }

        try {
            $result = LopHoc::update($id, $data);
            if ($result !== false) {
                echo json_encode(["status" => "success", "message" => "Cập nhật lớp học thành công!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
        }
    }

    public function delete($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học cần xóa"]);
            return;
        }

        try {
            LopHoc::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa lớp học thành công"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Không thể xóa: Lớp học này đã có dữ liệu ràng buộc"]);
        }
    }

    public function show($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }
        $lopHoc = LopHoc::getById($id);
        if ($lopHoc) {
            echo json_encode(["status" => "success", "data" => $lopHoc]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy lớp học"]);
        }
    }
}