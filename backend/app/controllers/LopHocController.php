<?php
require_once __DIR__ . '/../models/LopHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LopHocController {

    private function checkTutorConflict($giaSuId, $lopHocId, $thuTrongTuanArr, $gioBatDau, $gioKetThuc, $ngayBatDau, $ngayKetThuc) {
        if (empty($giaSuId) || empty($thuTrongTuanArr)) return false;

        $sql = "SELECT ldk.thu_trong_tuan, ldk.gio_bat_dau, ldk.gio_ket_thuc, ldk.ngay_bat_dau, lh.ngay_ket_thuc, lh.ten_lop 
                FROM lich_dinh_ky ldk
                JOIN lop_hoc lh ON ldk.lop_hoc_id = lh.lop_hoc_id
                WHERE lh.gia_su_id = :gia_su_id 
                  AND lh.trang_thai IN ('dang_hoc', 'sap_mo')";
        
        $params = [':gia_su_id' => $giaSuId];
        if ($lopHocId) {
            $sql .= " AND lh.lop_hoc_id != :lop_hoc_id";
            $params[':lop_hoc_id'] = $lopHocId;
        }
        
        $existingSchedules = Database::query($sql, $params);
        
        if ($existingSchedules) {
            foreach ($existingSchedules as $es) {
                // Kiểm tra trùng Thứ
                if (in_array($es['thu_trong_tuan'], $thuTrongTuanArr)) {
                    // Kiểm tra trùng Giờ
                    if ($gioBatDau < $es['gio_ket_thuc'] && $gioKetThuc > $es['gio_bat_dau']) {
                        
                        // Kiểm tra trùng Khoảng thời gian (Tháng/Năm)
                        $start1 = !empty($es['ngay_bat_dau']) ? strtotime($es['ngay_bat_dau']) : strtotime('2000-01-01');
                        $end1   = !empty($es['ngay_ket_thuc']) ? strtotime($es['ngay_ket_thuc']) : strtotime('2099-12-31');
                        
                        $start2 = !empty($ngayBatDau) ? strtotime($ngayBatDau) : strtotime('2000-01-01');
                        $end2   = !empty($ngayKetThuc) ? strtotime($ngayKetThuc) : strtotime('2099-12-31');
                        
                        if ($start1 <= $end2 && $end1 >= $start2) {
                            return $es['ten_lop'] ? $es['ten_lop'] : "một lớp khác";
                        }
                    }
                }
            }
        }
        return false;
    }

    public function index() {
        $giaSuId = $_GET['gia_su_id'] ?? null;
        if ($giaSuId) {
            $lopHocs = LopHoc::getByGiaSuId($giaSuId);
        } else {
            $lopHocs = LopHoc::getAll();
            foreach ($lopHocs as &$lop) {
                if (empty($lop['gia_su_id'])) {
                    $yeuCau = Database::queryOne(
                        "SELECT yc.trang_thai, gs.ho_ten, gs.gia_su_id 
                         FROM yeu_cau yc JOIN gia_su gs ON yc.gia_su_id = gs.gia_su_id 
                         WHERE yc.lop_hoc_id = ? AND yc.phan_loai = 'mo_lop' ORDER BY yc.yeu_cau_id DESC LIMIT 1", 
                        [$lop['lop_hoc_id']]
                    );
                    if ($yeuCau) {
                        if ($yeuCau['trang_thai'] === 'dang_xu_ly') {
                            $lop['trang_thai'] = 'cho_gia_su_xac_nhan'; $lop['ten_gia_su'] = $yeuCau['ho_ten']; $lop['gia_su_id'] = $yeuCau['gia_su_id'];
                        } else if ($yeuCau['trang_thai'] === 'tu_choi') {
                            $lop['trang_thai'] = 'gia_su_tu_choi'; $lop['ten_gia_su'] = $yeuCau['ho_ten']; $lop['gia_su_id'] = $yeuCau['gia_su_id'];
                        }
                    }
                }
            }
        }
        echo json_encode(["status" => "success", "data" => $lopHocs]);
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['mon_hoc_id'])) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]); return;
        }

        $giaSuDuKien = $data['gia_su_id'] ?? null;

        // Chặn trùng lịch khi Tạo mới
        if (!empty($giaSuDuKien) && !empty($data['thoi_gian_du_kien'])) {
            $tg = $data['thoi_gian_du_kien'];
            $conflictClass = $this->checkTutorConflict(
                $giaSuDuKien, null, 
                $tg['ngay_trong_tuan'], $tg['gio_bat_dau'], $tg['gio_ket_thuc'],
                $tg['ngay_bat_dau'] ?? null, $tg['ngay_ket_thuc'] ?? null
            );
            
            if ($conflictClass) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Không thể chọn! Gia sư này bị kẹt lịch dạy lớp [$conflictClass] vào khung thời gian này."]); return;
            }
        }

        if (!empty($giaSuDuKien)) {
            $data['gia_su_id'] = null;
            $data['trang_thai'] = 'cho_gia_su_xac_nhan';
        } else {
            $data['trang_thai'] = 'sap_mo';
        }

        try {
            $result = LopHoc::create($data);
            if ($result) {
                $createdId = (int)Database::lastInsertId();
                $lopHoc = LopHoc::getById($createdId);
                $tenLop = $lopHoc ? $lopHoc['ten_lop'] : 'lớp học mới';
                
                ThongBaoModel::guiThongBao(1, 'admin', 'Lớp học mới được tạo', "Lớp {$tenLop} đã được tạo.", 'lop_hoc');
                
                if (!empty($giaSuDuKien)) {
                    ThongBaoModel::guiThongBao($giaSuDuKien, 'gia_su', 'Lời mời nhận lớp mới', "Trung tâm vừa gửi cho bạn một yêu cầu nhận lớp: {$tenLop}. Vui lòng vào mục Yêu cầu mới để xác nhận.", 'lop_hoc');
                    $sqlYeuCau = "INSERT INTO yeu_cau (nguoi_tao_id, loai_nguoi_tao, phan_loai, tieu_de, noi_dung, lop_hoc_id, gia_su_id, trang_thai) 
                                  VALUES (1, 'admin', 'mo_lop', 'Yêu cầu nhận lớp mới', :noi_dung, :lop_hoc_id, :gia_su_id, 'dang_xu_ly')";
                    Database::execute($sqlYeuCau, [':noi_dung' => "Trung tâm mời bạn giảng dạy lớp {$tenLop}. Bạn có muốn nhận lớp này không?", ':lop_hoc_id' => $createdId, ':gia_su_id' => $giaSuDuKien]);
                }
                http_response_code(201); echo json_encode(["status" => "success", "message" => "Tạo lớp học thành công!", "data" => ["lop_hoc_id" => $createdId, "ten_lop" => $tenLop]]);
            }
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]); }
    }

 public function update($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]); return; }
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $lopHocCu = LopHoc::getById($id);
            $giaSuCu = $lopHocCu ? $lopHocCu['gia_su_id'] : null;

            $yeuCauCu = Database::queryOne("SELECT gia_su_id, trang_thai FROM yeu_cau WHERE lop_hoc_id = ? AND phan_loai = 'mo_lop' ORDER BY yeu_cau_id DESC LIMIT 1", [$id]);
            $giaSuDangMoi = ($yeuCauCu && $yeuCauCu['trang_thai'] === 'dang_xu_ly') ? $yeuCauCu['gia_su_id'] : null;

            $giaSuMoi = $data['gia_su_id'] ?? null;
            $tenLop = $lopHocCu['ten_lop'] ?? "Lớp $id";
            $dangMoiGiaSu = false;

            $giaSuCheck = !empty($giaSuMoi) ? $giaSuMoi : $giaSuCu;

            // Chặn trùng lịch khi Chỉnh sửa
            if (!empty($data['thoi_gian_du_kien'])) {
                $tg = $data['thoi_gian_du_kien'];
                $conflictClass = $this->checkTutorConflict(
                    $giaSuCheck, $id, 
                    $tg['ngay_trong_tuan'], $tg['gio_bat_dau'], $tg['gio_ket_thuc'], 
                    $tg['ngay_bat_dau'], $data['ngay_ket_thuc'] ?? null
                );
                if ($conflictClass) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Gia sư này bị kẹt lịch dạy lớp [$conflictClass] trùng với lịch mới. Vui lòng đổi gia sư hoặc chỉnh lại giờ!"]); return;
                }
            } else if (!empty($giaSuMoi) && $giaSuMoi != $giaSuCu && $giaSuMoi != $giaSuDangMoi) {
                $lichHienTai = Database::query("SELECT thu_trong_tuan, gio_bat_dau, gio_ket_thuc, ngay_bat_dau FROM lich_dinh_ky WHERE lop_hoc_id = ?", [$id]);
                $ngayKetThucHienTai = $data['ngay_ket_thuc'] ?? $lopHocCu['ngay_ket_thuc'];
                if ($lichHienTai) {
                    foreach ($lichHienTai as $buoi) {
                        $conflictClass = $this->checkTutorConflict(
                            $giaSuMoi, $id, 
                            [$buoi['thu_trong_tuan']], $buoi['gio_bat_dau'], $buoi['gio_ket_thuc'], 
                            $buoi['ngay_bat_dau'], $ngayKetThucHienTai
                        );
                        if ($conflictClass) {
                            http_response_code(400);
                            echo json_encode(["status" => "error", "message" => "Gia sư mới đã kẹt lịch dạy lớp [$conflictClass] trùng với lịch của lớp này!"]); return;
                        }
                    }
                }
            }

            if (!empty($giaSuMoi)) {
                if ($giaSuMoi != $giaSuCu && $giaSuMoi != $giaSuDangMoi) {
                    $dangMoiGiaSu = true; $data['gia_su_id'] = $giaSuCu; 
                } else { $data['gia_su_id'] = $giaSuCu; }
            } else { $data['gia_su_id'] = null; }

            if (($data['trang_thai'] ?? null) === 'cho_gia_su') { $data['trang_thai'] = 'cho_gia_su_xac_nhan'; }
            if (($data['trang_thai'] ?? null) === 'tu_choi') { $data['trang_thai'] = 'gia_su_tu_choi'; }

            $result = LopHoc::update($id, $data);
            if ($result !== false) {
                if ($dangMoiGiaSu) {
                    Database::execute(
                        "DELETE FROM yeu_cau 
                         WHERE lop_hoc_id = ? AND phan_loai = 'mo_lop' AND trang_thai = 'dang_xu_ly'", 
                        [$id]
                    );

                    ThongBaoModel::guiThongBao($giaSuMoi, 'gia_su', 'Lời mời nhận lớp mới', "Trung tâm vừa gửi cho bạn một yêu cầu nhận lớp: {$tenLop}.", 'lop_hoc');
                    
                    $sqlYeuCau = "INSERT INTO yeu_cau (nguoi_tao_id, loai_nguoi_tao, phan_loai, tieu_de, noi_dung, lop_hoc_id, gia_su_id, trang_thai) 
                                  VALUES (1, 'admin', 'mo_lop', 'Yêu cầu nhận lớp mới', :noi_dung, :lop_hoc_id, :gia_su_id, 'dang_xu_ly')";
                    Database::execute($sqlYeuCau, [':noi_dung' => "Trung tâm mời bạn đảm nhiệm giảng dạy lớp {$tenLop}. Bạn có muốn nhận lớp này không?", ':lop_hoc_id' => $id, ':gia_su_id' => $giaSuMoi]);
                }
                echo json_encode(["status" => "success", "message" => "Cập nhật lớp học thành công!"]);
            }
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]); }
    }

    public function delete($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID"]); return; }
        try {
            $affected = LopHoc::delete($id);
            if ($affected === 0) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Không tìm thấy"]); return; }
            echo json_encode(["status" => "success", "message" => "Đã xóa lớp học thành công"]);
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi xóa lớp"]); }
    }

    public function updateStatus($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID"]); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        $trangThai = $data['trang_thai'] ?? '';
        if (!in_array($trangThai, ['sap_mo', 'dang_hoc', 'ket_thuc', 'dong'], true)) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Trạng thái không hợp lệ"]); return;
        }
        try {
            $affected = LopHoc::updateStatus($id, $trangThai);
            if ($affected === 0) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Lỗi cập nhật"]); return; }
            echo json_encode(["status" => "success", "message" => "Thành công"]);
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => "Lỗi server"]); }
    }

    public function show($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID"]); return; }
        $lopHoc = LopHoc::getById($id);
        if ($lopHoc) { echo json_encode(["status" => "success", "data" => $lopHoc]); } else { http_response_code(404); echo json_encode(["status" => "error", "message" => "Không tìm thấy"]); }
    }

    public function getStudentsByClass($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID"]); return; }
        try {
            require_once __DIR__ . '/../models/DangKyLop.php';
            echo json_encode(["status" => "success", "data" => DangKyLop::getHocSinhDaDuyetByLop($id)]);
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }

    public function addStudent($id) {
        if (empty($id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID lớp"]); return; }
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['hoc_sinh_id'])) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu ID học sinh"]); return; }
        try {
            require_once __DIR__ . '/../models/DangKyLop.php';
            $parentSql = "SELECT ph.trang_thai FROM hoc_sinh hs INNER JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id WHERE hs.hoc_sinh_id = :hs_id LIMIT 1";
            $parent = Database::query($parentSql, [':hs_id' => $data['hoc_sinh_id']]);
            if (!$parent) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Không tìm thấy"]); return; }
            if (($parent[0]['trang_thai'] ?? '') === 'khoa') { http_response_code(403); echo json_encode(["status" => "error", "message" => "Phụ huynh bị khóa"]); return; }
            
            $checkSql = "SELECT dang_ky_id, trang_thai FROM dang_ky_lop WHERE hoc_sinh_id = :hs_id AND lop_hoc_id = :lop_id";
            $exist = Database::query($checkSql, [':hs_id' => $data['hoc_sinh_id'], ':lop_id' => $id]);
            if ($exist && $exist[0]['trang_thai'] === 'da_duyet') { http_response_code(400); echo json_encode(["status" => "error", "message" => "Học sinh đã có trong lớp"]); return; }

            $checkCapacity = "SELECT so_luong_hien_tai, so_luong_toi_da FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
            $lop = Database::query($checkCapacity, [':lop_hoc_id' => $id]);
            if (!$lop) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Lớp không tồn tại"]); return; }
            if ($lop[0]['so_luong_hien_tai'] >= $lop[0]['so_luong_toi_da']) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Lớp đã đầy"]); return; }

            if ($exist) {
                Database::execute("UPDATE dang_ky_lop SET trang_thai = 'da_duyet_truc_tiep', ngay_duyet = CURRENT_TIMESTAMP WHERE dang_ky_id = :id", [':id' => $exist[0]['dang_ky_id']]);
            } else {
                Database::execute("INSERT INTO dang_ky_lop (hoc_sinh_id, lop_hoc_id, trang_thai, ngay_duyet) VALUES (:hoc_sinh_id, :lop_hoc_id, 'da_duyet_truc_tiep', CURRENT_TIMESTAMP)", [':hoc_sinh_id' => $data['hoc_sinh_id'], ':lop_hoc_id' => $id]);
            }
            Database::execute("UPDATE lop_hoc SET so_luong_hien_tai = so_luong_hien_tai + 1 WHERE lop_hoc_id = :lop_id", [':lop_id' => $id]);
            http_response_code(201); echo json_encode(["status" => "success", "message" => "Thêm học sinh thành công"]);
        } catch (Exception $e) { http_response_code(400); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }

    public function removeStudent($id, $studentId) {
        if (empty($id) || empty($studentId)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu"]); return; }
        try {
            require_once __DIR__ . '/../models/DangKyLop.php';
            $checkSql = "SELECT dang_ky_id, trang_thai FROM dang_ky_lop WHERE lop_hoc_id = :lop_id AND hoc_sinh_id = :hs_id";
            $record = Database::query($checkSql, [':lop_id' => $id, ':hs_id' => $studentId]);
            if (!$record) { http_response_code(404); echo json_encode(["status" => "error", "message" => "Không tìm thấy"]); return; }
            DangKyLop::updateStatus($record[0]['dang_ky_id'], 'da_huy');
            echo json_encode(["status" => "success", "message" => "Đã xóa"]);
        } catch (Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }
}