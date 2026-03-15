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

        if (LichHoc::checkConflict($data['lop_hoc_id'], $data['ngay_hoc'], $data['gio_bat_dau'], $data['gio_ket_thuc'])) {
            http_response_code(409); // Báo lỗi 409 Conflict
            echo json_encode(["status" => "error", "message" => "Không thể tạo! Gia sư của lớp này đã có lịch dạy bị trùng vào khung giờ trên."]);
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

    public function getAll() {
        $data = LichHoc::getAll();
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function getByGiaSu($gia_su_id) {
        try {
            $data = LichHoc::getByGiaSuId($gia_su_id);
            echo json_encode(["status" => "success", "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi truy xuất dữ liệu: " . $e->getMessage()]);
        }
    }
    
    public function getByPhuHuynh($phu_huynh_id) {
        try {
            $data = LichHoc::getByPhuHuynhId($phu_huynh_id);
            echo json_encode(["status" => "success", "data" => $data]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi truy xuất dữ liệu: " . $e->getMessage()]);
        }
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['trang_thai'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp trạng thái mới"]);
            return;
        }

        try {
            LichHoc::updateStatus($id, $data['trang_thai']);
            echo json_encode(["status" => "success", "message" => "Đã cập nhật trạng thái buổi học!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['lop_hoc_id']) || empty($data['ngay_hoc']) || empty($data['gio_bat_dau'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập đủ Lớp, Ngày và Giờ học"]);
            return;
        }
        
        if (LichHoc::checkConflict($data['lop_hoc_id'], $data['ngay_hoc'], $data['gio_bat_dau'], $data['gio_ket_thuc'], $id)) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Không thể cập nhật! Gia sư của lớp này đã có lịch dạy bị trùng vào khung giờ trên."]);
            return;
        }

        try {
            LichHoc::update($id, $data);
            echo json_encode(["status" => "success", "message" => "Đã cập nhật lịch học thành công!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
        }
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