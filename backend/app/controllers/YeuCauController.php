<?php
require_once __DIR__ . '/../models/YeuCau.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';

class YeuCauController
{

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['nguoi_tao_id']) || empty($data['loai_nguoi_tao']) || empty($data['phan_loai']) || empty($data['tieu_de']) || empty($data['noi_dung'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc (người tạo, loại, phân loại, tiêu đề, nội dung)"]);
            return;
        }

        try {
            $result = YeuCau::create($data);
            if ($result) {
                // Gửi thông báo cho Admin về yêu cầu mới
                ThongBaoModel::guiThongBao(
                    1, // Admin ID
                    'admin',
                    'Yêu cầu hỗ trợ mới',
                    "Có một yêu cầu hỗ trợ mới từ {$data['loai_nguoi_tao']}: {$data['tieu_de']}. Vui lòng kiểm tra và xử lý.",
                    'yeu_cau'
                );

                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Đã gửi yêu cầu thành công! Vui lòng chờ phản hồi."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
        }
    }

    // test if don't have account
    public function createGuest()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['ho_ten']) ||
            empty($data['so_dien_thoai']) ||
            empty($data['lop_hoc_id'])
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Thiếu thông tin bắt buộc"
            ]);
            return;
        }
        $ghiChu = $data['ghi_chu'] ?? '';

        $noiDung = "
            Họ tên: {$data['ho_ten']}
            SĐT: {$data['so_dien_thoai']}
            Email: {$data['email']}
            Ghi chú: {$ghiChu}
        ";
        $yeuCau = [
            "nguoi_tao_id" => 0,
            "loai_nguoi_tao" => "guest",
            "phan_loai" => "dang_ky_lop",
            "tieu_de" => "Yêu cầu đăng ký lớp",
            "noi_dung" => $noiDung,
            "lop_hoc_id" => $data['lop_hoc_id']
        ];

        try {
            YeuCau::create($yeuCau);

            echo json_encode([
                "status" => "success",
                "message" => "Đăng ký học thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    public function getAll()
    {
        $data = YeuCau::getAll();
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function getByNguoiTao($nguoi_tao_id, $loai_nguoi_tao)
    {
        $data = YeuCau::getByNguoiTao($nguoi_tao_id, $loai_nguoi_tao);
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function updateStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['trang_thai']) || empty($data['nguoi_xu_ly_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp trạng thái và ID người xử lý (Admin)"]);
            return;
        }

        try {
            // Lấy thông tin yêu cầu từ DB để biết người tạo
            $yeuCau = YeuCau::getById($id);

            YeuCau::updateStatus($id, $data);

            // Thông báo cho người tạo yêu cầu về kết quả xử lý
            if ($yeuCau && !empty($yeuCau['nguoi_tao_id']) && !empty($yeuCau['loai_nguoi_tao'])) {
                $statusMessages = [
                    'cho_duyet' => 'đang chờ duyệt',
                    'dang_xu_ly' => 'đang được xử lý',
                    'da_duyet' => 'đã được duyệt',
                    'tu_choi' => 'bị từ chối',
                    'da_hoan_thanh' => 'đã hoàn thành'
                ];
                $trangThaiText = $statusMessages[$data['trang_thai']] ?? $data['trang_thai'];
                ThongBaoModel::guiThongBao(
                    $yeuCau['nguoi_tao_id'],
                    $yeuCau['loai_nguoi_tao'],
                    'Cập nhật yêu cầu hỗ trợ',
                    "Yêu cầu hỗ trợ '{$yeuCau['tieu_de']}' của bạn {$trangThaiText}.",
                    'yeu_cau'
                );
            }

            echo json_encode(["status" => "success", "message" => "Đã cập nhật trạng thái yêu cầu!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật: " . $e->getMessage()]);
        }
    }

    public function update($id)
    {
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

    public function delete($id)
    {
        try {
            YeuCau::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa yêu cầu thành công!"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi xóa dữ liệu"]);
        }
    }
}
