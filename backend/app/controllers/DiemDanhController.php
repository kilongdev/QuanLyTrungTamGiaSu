<?php
require_once __DIR__ . '/../models/DiemDanh.php';
require_once __DIR__ . '/../core/Database.php';

class DiemDanhController {

    public function saveDanhSach() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['lich_hoc_id']) || empty($data['danh_sach'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lịch học hoặc danh sách điểm danh"]);
            return;
        }

        try {
            $lich_hoc_id = $data['lich_hoc_id'];
            foreach ($data['danh_sach'] as $hoc_sinh) {
                $hoc_sinh['lich_hoc_id'] = $lich_hoc_id; 
                DiemDanh::save($hoc_sinh);
            }

            Database::execute("UPDATE lich_hoc SET trang_thai = 'da_hoc' WHERE lich_hoc_id = :id", [':id' => $lich_hoc_id]);
            echo json_encode(["status" => "success", "message" => "Đã lưu điểm danh thành công!"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    public function getByLich($lich_hoc_id) {
        $result = DiemDanh::getByLichHoc($lich_hoc_id);
        echo json_encode(["status" => "success", "data" => $result]);
    }
}