<?php
require_once __DIR__ . '/../models/LichHoc.php';

class LichHocController {

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['lop_hoc_id']) || empty($data['ngay_hoc']) || empty($data['gio_bat_dau']) || empty($data['gio_ket_thuc'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin ngày, giờ hoặc lớp học"]);
            return;
        }

        try {
            $result = LichHoc::create($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Đã lên lịch học thành công!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    public function getByLop($lop_hoc_id) {
        $data = LichHoc::getByLopHocId($lop_hoc_id);
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function delete($id) {
        try {
            LichHoc::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa lịch học"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi xóa dữ liệu"]);
        }
    }
}