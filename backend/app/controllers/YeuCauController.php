<?php
require_once __DIR__ . '/../models/YeuCau.php';

class YeuCauController {

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['nguoi_tao_id']) || empty($data['loai_nguoi_tao']) || empty($data['phan_loai']) || empty($data['tieu_de']) || empty($data['noi_dung'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc (người tạo, loại, phân loại, tiêu đề, nội dung)"]);
            return;
        }

        try {
            $result = YeuCau::create($data);
            if ($result) {
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Đã gửi yêu cầu thành công! Vui lòng chờ phản hồi."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
        }
    }

    public function getAll() {
        $data = YeuCau::getAll();
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function getByNguoiTao($nguoi_tao_id, $loai_nguoi_tao) {
        $data = YeuCau::getByNguoiTao($nguoi_tao_id, $loai_nguoi_tao);
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['trang_thai']) || empty($data['nguoi_xu_ly_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp trạng thái và ID người xử lý (Admin)"]);
            return;
        }

        try {
            YeuCau::updateStatus($id, $data);
            echo json_encode(["status" => "success", "message" => "Đã cập nhật trạng thái yêu cầu!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['phan_loai']) || empty($data['tieu_de']) || empty($data['noi_dung'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ phân loại, tiêu đề và nội dung!"]);
            return;
        }

        try {
            $result = YeuCau::update($id, $data);
            
            if ($result) {
                echo json_encode(["status" => "success", "message" => "Đã cập nhật nội dung yêu cầu thành công!"]);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Không thể cập nhật! Yêu cầu này không tồn tại hoặc đã được Admin xử lý."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
        }
    }

    public function delete($id) {
        try {
            YeuCau::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa yêu cầu thành công!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi xóa dữ liệu"]);
        }
    }
}