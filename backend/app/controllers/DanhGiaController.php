<?php
require_once __DIR__ . '/../models/DanhGia.php';

class DanhGiaController {

    public function save() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['phu_huynh_id']) || empty($data['gia_su_id']) || empty($data['diem_so'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp ID phụ huynh, ID gia sư và Điểm số"]);
            return;
        }

        if (!is_numeric($data['diem_so']) || $data['diem_so'] < 1 || $data['diem_so'] > 5) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Điểm số phải là số nguyên từ 1 đến 5"]);
            return;
        }

        try {
            DanhGia::save($data);
            echo json_encode(["status" => "success", "message" => "Đã lưu đánh giá thành công!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
        }
    }

    public function getByGiaSu($gia_su_id) {
        $data = DanhGia::getByGiaSu($gia_su_id);
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function getAverageScore($gia_su_id) {
        $data = DanhGia::getAverageScore($gia_su_id);
        if ($data['diem_trung_binh'] !== null) {
            $data['diem_trung_binh'] = round((float)$data['diem_trung_binh'], 1);
        } else {
            $data['diem_trung_binh'] = 0;
        }

        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function delete($id) {
        try {
            DanhGia::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa đánh giá thành công!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi xóa dữ liệu"]);
        }
    }
}