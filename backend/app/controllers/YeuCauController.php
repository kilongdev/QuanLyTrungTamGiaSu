<?php
require_once __DIR__ . '/../models/YeuCau.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';

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
        $email = $data['email'] ?? '';

        $noiDung = "
            Họ tên: {$data['ho_ten']}
            SĐT: {$data['so_dien_thoai']}
            Email: {$email}
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

    public function getAll() {
        $giaSuId = $_GET['gia_su_id'] ?? null;
        if ($giaSuId) {
            $data = YeuCau::getYeuCauMoiGiaSu($giaSuId);
            echo json_encode(["status" => "success", "data" => $data]);
            return;
        }
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
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu thông tin"]); return;
        }

        try {
            $yeuCau = YeuCau::getById($id);
            if (!$yeuCau) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Không tìm thấy yêu cầu"]); return; }

            // =================================================================
            // KIỂM TRA TRÙNG LỊCH TRƯỚC KHI CHO PHÉP NHẬN LỚP
            // =================================================================
            if ($yeuCau['phan_loai'] === 'mo_lop' && $data['trang_thai'] === 'da_duyet') {
                $giaSuId = $yeuCau['gia_su_id'];
                $newLopHocId = $yeuCau['lop_hoc_id'];

                // Truy vấn tìm xem có bất kỳ buổi học nào trùng ngày và giao nhau về thời gian không
                $checkConflictSql = "
                    SELECT lh1.ngay_hoc, lh1.gio_bat_dau, lh1.gio_ket_thuc, l1.ten_lop 
                    FROM lich_hoc lh1
                    JOIN lop_hoc l1 ON lh1.lop_hoc_id = l1.lop_hoc_id
                    JOIN lich_hoc lh2 ON lh1.ngay_hoc = lh2.ngay_hoc
                    WHERE l1.gia_su_id = :gia_su_id
                      AND l1.trang_thai IN ('dang_hoc', 'sap_mo')
                      AND lh2.lop_hoc_id = :new_lop_hoc_id
                      -- Thuật toán phát hiện trùng giờ (A bắt đầu trước khi B kết thúc VÀ A kết thúc sau khi B bắt đầu)
                      AND (lh1.gio_bat_dau < lh2.gio_ket_thuc AND lh1.gio_ket_thuc > lh2.gio_bat_dau)
                    LIMIT 1
                ";
                
                $conflict = Database::queryOne($checkConflictSql, [
                    ':gia_su_id' => $giaSuId,
                    ':new_lop_hoc_id' => $newLopHocId
                ]);

                if ($conflict) {
                    http_response_code(400);
                    echo json_encode([
                        "status" => "error", 
                        "message" => "Không thể nhận! Lớp này bị TRÙNG LỊCH với [{$conflict['ten_lop']}] vào ngày {$conflict['ngay_hoc']} ({$conflict['gio_bat_dau']} - {$conflict['gio_ket_thuc']})."
                    ]);
                    return;
                }
            }

            // Nếu an toàn, tiến hành cập nhật trạng thái
            YeuCau::updateStatus($id, $data);

            if ($yeuCau['phan_loai'] === 'mo_lop') {
                if ($data['trang_thai'] === 'da_duyet') {
                    Database::execute(
                        "UPDATE lop_hoc SET gia_su_id = :gia_su_id, trang_thai = 'sap_mo' WHERE lop_hoc_id = :lop_hoc_id", 
                        [':gia_su_id' => $yeuCau['gia_su_id'], ':lop_hoc_id' => $yeuCau['lop_hoc_id']]
                    );
                } 
                else if ($data['trang_thai'] === 'tu_choi') {
                    Database::execute(
                        "UPDATE lop_hoc SET gia_su_id = NULL WHERE lop_hoc_id = :lop_hoc_id", 
                        [':lop_hoc_id' => $yeuCau['lop_hoc_id']]
                    );
                }
            }

            // Gửi thông báo cho Admin
            if (!empty($yeuCau['nguoi_tao_id'])) {
                $statusMsg = ($data['trang_thai'] === 'da_duyet') ? 'đã ĐỒNG Ý' : 'đã TỪ CHỐI';
                $giaSu = Database::queryOne("SELECT ho_ten FROM gia_su WHERE gia_su_id = ?", [$yeuCau['gia_su_id']]);
                $tenGS = $giaSu ? $giaSu['ho_ten'] : "Gia sư";

                ThongBaoModel::guiThongBao($yeuCau['nguoi_tao_id'], $yeuCau['loai_nguoi_tao'], 'Phản hồi nhận lớp', "{$tenGS} {$statusMsg} yêu cầu nhận lớp: '{$yeuCau['tieu_de']}'.", 'yeu_cau');
            }

            echo json_encode(["status" => "success", "message" => "Đã phản hồi yêu cầu thành công!"]);
        } catch (Exception $e) {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi cập nhật: " . $e->getMessage()]);
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