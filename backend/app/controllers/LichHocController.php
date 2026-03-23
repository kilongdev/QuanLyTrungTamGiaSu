<?php
require_once __DIR__ . '/../models/LichHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

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
                // Lấy thông tin lớp học (gia_su_id, ten_lop)
                $lopHoc = Database::queryOne(
                    "SELECT lh.gia_su_id, lh.ten_lop, gs.ho_ten as ten_gia_su 
                     FROM lop_hoc lh 
                     LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id 
                     WHERE lh.lop_hoc_id = ?",
                    [$data['lop_hoc_id']]
                );
                
                // Thông báo cho gia sư
                if ($lopHoc && !empty($lopHoc['gia_su_id'])) {
                    ThongBaoModel::guiThongBao(
                        $lopHoc['gia_su_id'],
                        'gia_su',
                        'Lịch học mới',
                        "Bạn có lịch dạy mới lớp {$lopHoc['ten_lop']} vào {$data['ngay_hoc']} từ {$data['gio_bat_dau']} đến {$data['gio_ket_thuc']}.",
                        'lich_hoc'
                    );
                }
                
                // Lấy danh sách học sinh đã duyệt trong lớp và thông báo cho phụ huynh
                $hocSinhs = Database::query(
                    "SELECT hs.hoc_sinh_id, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, ph.ho_ten as ten_phu_huynh
                     FROM dang_ky_lop dkl
                     JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                     LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
                     WHERE dkl.lop_hoc_id = ? AND dkl.trang_thai = 'da_duyet'",
                    [$data['lop_hoc_id']]
                );
                
                foreach ($hocSinhs as $hs) {
                    if (!empty($hs['phu_huynh_id'])) {
                        ThongBaoModel::guiThongBao(
                            $hs['phu_huynh_id'],
                            'phu_huynh',
                            'Lịch học mới',
                            "Học sinh {$hs['ten_hoc_sinh']} có lịch học mới lớp {$lopHoc['ten_lop']} vào {$data['ngay_hoc']} từ {$data['gio_bat_dau']} đến {$data['gio_ket_thuc']}.",
                            'lich_hoc'
                        );
                    }
                }
                
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
            
            // Lấy thông tin lớp học (gia_su_id, ten_lop)
            $lopHoc = Database::queryOne(
                "SELECT lh.gia_su_id, lh.ten_lop, gs.ho_ten as ten_gia_su 
                 FROM lop_hoc lh 
                 LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id 
                 WHERE lh.lop_hoc_id = ?",
                [$data['lop_hoc_id']]
            );
            
            // Thông báo cho gia sư
            if ($lopHoc && !empty($lopHoc['gia_su_id'])) {
                ThongBaoModel::guiThongBao(
                    $lopHoc['gia_su_id'],
                    'gia_su',
                    'Lịch học đã thay đổi',
                    "Lịch dạy lớp {$lopHoc['ten_lop']} đã được cập nhật thành {$data['ngay_hoc']} từ {$data['gio_bat_dau']} đến {$data['gio_ket_thuc']}.",
                    'lich_hoc'
                );
            }
            
            // Lấy danh sách học sinh đã duyệt trong lớp và thông báo cho phụ huynh
            $hocSinhs = Database::query(
                "SELECT hs.hoc_sinh_id, hs.ho_ten as ten_hoc_sinh, hs.phu_huynh_id, ph.ho_ten as ten_phu_huynh
                 FROM dang_ky_lop dkl
                 JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                 LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
                 WHERE dkl.lop_hoc_id = ? AND dkl.trang_thai = 'da_duyet'",
                [$data['lop_hoc_id']]
            );
            
            foreach ($hocSinhs as $hs) {
                if (!empty($hs['phu_huynh_id'])) {
                    ThongBaoModel::guiThongBao(
                        $hs['phu_huynh_id'],
                        'phu_huynh',
                        'Lịch học đã thay đổi',
                        "Lịch học của học sinh {$hs['ten_hoc_sinh']} lớp {$lopHoc['ten_lop']} đã được cập nhật thành {$data['ngay_hoc']} từ {$data['gio_bat_dau']} đến {$data['gio_ket_thuc']}.",
                        'lich_hoc'
                    );
                }
            }
            
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