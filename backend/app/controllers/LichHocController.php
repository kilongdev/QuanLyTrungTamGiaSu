<?php
require_once __DIR__ . '/../models/LichHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LichHocController {

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        $is_chu_ky = isset($data['tao_chu_ky']) && $data['tao_chu_ky'] === true;
        $lop_hoc_id = $data['lop_hoc_id'];

        // ==========================================
        // CHỐT CHẶN: KIỂM TRA SỐ LƯỢNG BUỔI CHO CẢ 2 CHẾ ĐỘ
        // ==========================================
        $lopHocInfo = Database::queryOne("SELECT so_buoi_hoc FROM lop_hoc WHERE lop_hoc_id = ?", [$lop_hoc_id]);
        if (!$lopHocInfo || empty($lopHocInfo['so_buoi_hoc'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Lớp học chưa được cấu hình tổng số buổi học."]);
            return;
        }
        $tong_so_buoi = (int)$lopHocInfo['so_buoi_hoc'];
        $da_tao = Database::queryOne("SELECT COUNT(*) as cnt FROM lich_hoc WHERE lop_hoc_id = ?", [$lop_hoc_id]);
        $so_buoi_da_tao = (int)$da_tao['cnt'];
        $so_buoi_can_tao = $tong_so_buoi - $so_buoi_da_tao;

        if (!$is_chu_ky) {
            // TẠO 1 BUỔI
            if (empty($data['ngay_hoc']) || empty($data['gio_bat_dau']) || empty($data['gio_ket_thuc'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thiếu thông tin ngày, giờ hoặc lớp học"]); return;
            }
            if ($so_buoi_can_tao <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Lớp này đã xếp đủ {$tong_so_buoi} buổi. Không thể tạo thêm!"]); return;
            }
            if (LichHoc::checkConflict($lop_hoc_id, $data['ngay_hoc'], $data['gio_bat_dau'], $data['gio_ket_thuc'])) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Trùng lịch! Khung giờ này gia sư bận hoặc lớp đã có lịch."]); return;
            }
            try {
                if (LichHoc::create($data)) {
                    $this->sendNotifications($lop_hoc_id, $data['ngay_hoc'], $data['gio_bat_dau'], $data['gio_ket_thuc'], false);
                    http_response_code(201);
                    echo json_encode(["status" => "success", "message" => "Đã lên lịch học 1 buổi thành công!"]);
                }
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
            }
        } else {
            // TẠO CHU KỲ
            if (empty($data['ngay_bat_dau']) || empty($data['ngay_trong_tuan']) || empty($data['thoi_gian_tung_ngay'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thiếu thông tin chu kỳ"]); return;
            }

            try {
                // Không xóa cứng để tránh vỡ FK từ lich_hoc -> lich_dinh_ky.
                // Luồng đúng: cập nhật bản ghi theo thứ trong tuần, ngày nào bỏ chọn thì chuyển sang 'dung'.
                $ngay_ket_thuc = !empty($data['ngay_ket_thuc']) ? $data['ngay_ket_thuc'] : null;
                $selectedDays = array_map('intval', $data['ngay_trong_tuan']);

                $existingRecurring = Database::query(
                    "SELECT lich_dinh_ky_id, thu_trong_tuan
                     FROM lich_dinh_ky
                     WHERE lop_hoc_id = ?
                     ORDER BY lich_dinh_ky_id ASC",
                    [$lop_hoc_id]
                );

                $existingByDay = [];
                foreach ($existingRecurring as $row) {
                    $thu = (int)$row['thu_trong_tuan'];
                    if (!isset($existingByDay[$thu])) {
                        $existingByDay[$thu] = (int)$row['lich_dinh_ky_id'];
                    }
                }

                foreach ($selectedDays as $thu) {
                    if (!isset($data['thoi_gian_tung_ngay'][$thu]['gio_bat_dau']) || !isset($data['thoi_gian_tung_ngay'][$thu]['gio_ket_thuc'])) {
                        continue;
                    }

                    $gio_bat_dau = $data['thoi_gian_tung_ngay'][$thu]['gio_bat_dau'];
                    $gio_ket_thuc = $data['thoi_gian_tung_ngay'][$thu]['gio_ket_thuc'];

                    if (isset($existingByDay[$thu])) {
                        Database::execute(
                            "UPDATE lich_dinh_ky
                             SET gio_bat_dau = ?,
                                 gio_ket_thuc = ?,
                                 ngay_bat_dau = ?,
                                 ngay_ket_thuc = ?,
                                 trang_thai = 'hoat_dong'
                             WHERE lich_dinh_ky_id = ?",
                            [$gio_bat_dau, $gio_ket_thuc, $data['ngay_bat_dau'], $ngay_ket_thuc, $existingByDay[$thu]]
                        );
                    } else {
                        Database::execute(
                            "INSERT INTO lich_dinh_ky (lop_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc, ngay_bat_dau, ngay_ket_thuc, trang_thai)
                             VALUES (?, ?, ?, ?, ?, ?, 'hoat_dong')",
                            [$lop_hoc_id, $thu, $gio_bat_dau, $gio_ket_thuc, $data['ngay_bat_dau'], $ngay_ket_thuc]
                        );
                    }
                }

                // Ngày không còn được chọn: chuyển trạng thái 'dung' để giữ toàn vẹn dữ liệu lịch sử.
                if (!empty($existingRecurring)) {
                    foreach ($existingRecurring as $row) {
                        $thu = (int)$row['thu_trong_tuan'];
                        if (!in_array($thu, $selectedDays, true)) {
                            Database::execute(
                                "UPDATE lich_dinh_ky
                                 SET trang_thai = 'dung', ngay_ket_thuc = COALESCE(ngay_ket_thuc, ?)
                                 WHERE lich_dinh_ky_id = ?",
                                [$ngay_ket_thuc ?: date('Y-m-d'), (int)$row['lich_dinh_ky_id']]
                            );
                        }
                    }
                }

                // Nếu đã đủ số buổi thì chỉ cập nhật mẫu lịch định kỳ, không tạo thêm buổi học mới
                if ($so_buoi_can_tao <= 0) {
                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "message" => "Đã cập nhật lịch định kỳ. Lớp đã đủ {$tong_so_buoi} buổi nên không tạo thêm lịch học mới."
                    ]);
                    return;
                }

                $current_date = $data['ngay_bat_dau'];
                $count_created = 0; $count_conflict = 0; $loop_guard = 0;
                $ngay_trong_tuan = $data['ngay_trong_tuan'];
                $thoi_gian_tung_ngay = $data['thoi_gian_tung_ngay'];

                while ($count_created < $so_buoi_can_tao && $loop_guard < 365) {
                    $loop_guard++;
                    $day_w = (int)date('w', strtotime($current_date));
                    $thu = ($day_w === 0) ? 8 : $day_w + 1; 

                    if (in_array($thu, $ngay_trong_tuan)) {
                        $gio_bat_dau = $thoi_gian_tung_ngay[$thu]['gio_bat_dau'];
                        $gio_ket_thuc = $thoi_gian_tung_ngay[$thu]['gio_ket_thuc'];

                        if (LichHoc::checkConflict($lop_hoc_id, $current_date, $gio_bat_dau, $gio_ket_thuc)) {
                            $count_conflict++;
                        } else {
                            LichHoc::create(['lop_hoc_id' => $lop_hoc_id, 'ngay_hoc' => $current_date, 'gio_bat_dau' => $gio_bat_dau, 'gio_ket_thuc' => $gio_ket_thuc, 'trang_thai' => 'chua_hoc']);
                            $count_created++;
                        }
                    }
                    $current_date = date('Y-m-d', strtotime($current_date . ' + 1 day'));
                }

                if ($count_created > 0) $this->sendNotifications($lop_hoc_id, "định kỳ", null, null, true);
                
                $msg = "Đã tạo thành công {$count_created} buổi học tự động.";
                if ($count_conflict > 0) $msg .= " Bỏ qua {$count_conflict} buổi do trùng lịch.";
                http_response_code(201); echo json_encode(["status" => "success", "message" => $msg]);

            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
            }
        }
    }

    private function sendNotifications($lop_hoc_id, $ngay_hoc, $gio_bat_dau, $gio_ket_thuc, $is_chu_ky) {
        $lopHoc = Database::queryOne(
            "SELECT lh.gia_su_id, lh.ten_lop, gs.ho_ten as ten_gia_su 
             FROM lop_hoc lh 
             LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id 
             WHERE lh.lop_hoc_id = ?", 
            [$lop_hoc_id]
        );
        
        // Cập nhật text thông báo cho chuẩn
        $thong_diep_gia_su = $is_chu_ky 
            ? "Bạn có lịch dạy mới định kỳ lớp {$lopHoc['ten_lop']}. Vui lòng kiểm tra lịch trình."
            : "Bạn có lịch dạy mới lớp {$lopHoc['ten_lop']} vào {$ngay_hoc} từ {$gio_bat_dau} đến {$gio_ket_thuc}.";

        if ($lopHoc && !empty($lopHoc['gia_su_id'])) {
            ThongBaoModel::guiThongBao(
                $lopHoc['gia_su_id'], 'gia_su', 'Lịch học mới', $thong_diep_gia_su, 'lich_hoc'
            );
        }
        
        $hocSinhs = Database::query(
            "SELECT hs.phu_huynh_id, hs.ho_ten as ten_hoc_sinh
             FROM dang_ky_lop dkl JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             WHERE dkl.lop_hoc_id = ? AND dkl.trang_thai = 'da_duyet'", 
            [$lop_hoc_id]
        );
        
        $thong_diep_ph = $is_chu_ky
            ? "Học sinh có lịch học định kỳ mới cho lớp {$lopHoc['ten_lop']}. Vui lòng kiểm tra lịch tuần."
            : "Học sinh có lịch học mới lớp {$lopHoc['ten_lop']} vào {$ngay_hoc} từ {$gio_bat_dau} đến {$gio_ket_thuc}.";

        foreach ($hocSinhs as $hs) {
            if (!empty($hs['phu_huynh_id'])) {
                ThongBaoModel::guiThongBao(
                    $hs['phu_huynh_id'], 'phu_huynh', 'Lịch học mới', 
                    str_replace("Học sinh", "Học sinh {$hs['ten_hoc_sinh']}", $thong_diep_ph), 
                    'lich_hoc'
                );
            }
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