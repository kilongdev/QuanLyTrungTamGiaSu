<?php
require_once __DIR__ . '/../models/LopHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LopHocController {

    public function index() {
        $giaSuId = $_GET['gia_su_id'] ?? null;
        
        if ($giaSuId) {
            $lopHocs = LopHoc::getByGiaSuId($giaSuId);
        } else {
            $lopHocs = LopHoc::getAll();
            
            // =========================================================
            // PHÉP THUẬT "TRẠNG THÁI ẢO" - ĐÁNH TRÁO DỮ LIỆU TRƯỚC KHI GỬI
            // =========================================================
            foreach ($lopHocs as &$lop) {
                // Nếu lớp chưa chốt gia sư (gia_su_id bị NULL)
                if (empty($lop['gia_su_id'])) {
                    // Chạy sang bảng yeu_cau tìm xem có đang mời ai không
                    $yeuCau = Database::queryOne(
                        "SELECT yc.trang_thai, gs.ho_ten, gs.gia_su_id 
                         FROM yeu_cau yc 
                         JOIN gia_su gs ON yc.gia_su_id = gs.gia_su_id 
                         WHERE yc.lop_hoc_id = ? AND yc.phan_loai = 'mo_lop' 
                         ORDER BY yc.yeu_cau_id DESC LIMIT 1", 
                        [$lop['lop_hoc_id']]
                    );
                    
                    if ($yeuCau) {
                        if ($yeuCau['trang_thai'] === 'dang_xu_ly') {
                            $lop['trang_thai'] = 'cho_gia_su'; // Trạng thái ảo hiển thị màu Cam
                            $lop['ten_gia_su'] = $yeuCau['ho_ten']; // Hiện tên để Admin biết đang mời ai
                            $lop['gia_su_id'] = $yeuCau['gia_su_id']; // Hỗ trợ Modal Edit
                        } else if ($yeuCau['trang_thai'] === 'tu_choi') {
                            $lop['trang_thai'] = 'tu_choi'; // Trạng thái ảo hiển thị màu Đỏ
                            $lop['ten_gia_su'] = $yeuCau['ho_ten'];
                            $lop['gia_su_id'] = $yeuCau['gia_su_id'];
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
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]);
            return;
        }

        // ==========================================
        // KHÓA TRẠNG THÁI NẾU CÓ MỜI GIA SƯ
        // ==========================================
        $giaSuDuKien = $data['gia_su_id'] ?? null;
        if (!empty($giaSuDuKien)) {
            $data['gia_su_id'] = null; // Ép thành NULL để chưa chốt cứng vào DB
        }
        // Luôn ép lưu 'sap_mo' xuống DB để không vi phạm ENUM
        $data['trang_thai'] = 'sap_mo'; 

        try {
            $result = LopHoc::create($data);
            if ($result) {
                $createdId = (int)Database::lastInsertId();
                $lopHoc = LopHoc::getById($createdId);
                $tenLop = $lopHoc ? $lopHoc['ten_lop'] : 'lớp học mới';
                
                // 1. Thông báo cho Admin
                ThongBaoModel::guiThongBao(
                    1, 'admin', 'Lớp học mới được tạo',
                    "Lớp {$tenLop} đã được tạo. Vui lòng kiểm tra.", 'lop_hoc'
                );
                
                // 2. TẠO YÊU CẦU ĐẾN GIA SƯ (Nếu có chọn)
                if (!empty($giaSuDuKien)) {
                    ThongBaoModel::guiThongBao(
                        $giaSuDuKien, 'gia_su', 'Lời mời nhận lớp mới',
                        "Trung tâm vừa gửi cho bạn một yêu cầu nhận lớp: {$tenLop}. Vui lòng vào mục Yêu cầu mới để xác nhận.", 'lop_hoc'
                    );

                    // Dùng phan_loai là 'mo_lop' để báo đây là yêu cầu giao lớp
                    $sqlYeuCau = "INSERT INTO yeu_cau 
                        (nguoi_tao_id, loai_nguoi_tao, phan_loai, tieu_de, noi_dung, lop_hoc_id, gia_su_id, trang_thai) 
                        VALUES (1, 'admin', 'mo_lop', 'Yêu cầu nhận lớp mới', :noi_dung, :lop_hoc_id, :gia_su_id, 'dang_xu_ly')";
                    Database::execute($sqlYeuCau, [
                        ':noi_dung' => "Trung tâm mời bạn giảng dạy lớp {$tenLop}. Bạn có muốn nhận lớp này không?",
                        ':lop_hoc_id' => $createdId,
                        ':gia_su_id' => $giaSuDuKien
                    ]);
                }
                
                http_response_code(201);
                echo json_encode([
                    "status" => "success",
                    "message" => "Tạo lớp học thành công!",
                    "data" => [
                        "lop_hoc_id" => $createdId,
                        "ten_lop" => $tenLop
                    ]
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
        }
    }

    public function update($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học cần sửa"]);
            return;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['mon_hoc_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]);
            return;
        }

        try {
            // Lấy thông tin lớp học cũ để xem có thay đổi gia sư không
            $lopHocCu = LopHoc::getById($id);
            $giaSuCu = $lopHocCu ? $lopHocCu['gia_su_id'] : null;

            // Lấy yêu cầu mời gần nhất (nếu có) để biết lớp này đang kẹt với ai
            $yeuCauCu = Database::queryOne("SELECT gia_su_id, trang_thai FROM yeu_cau WHERE lop_hoc_id = ? AND phan_loai = 'mo_lop' ORDER BY yeu_cau_id DESC LIMIT 1", [$id]);
            $giaSuDangMoi = ($yeuCauCu && $yeuCauCu['trang_thai'] === 'dang_xu_ly') ? $yeuCauCu['gia_su_id'] : null;

            $giaSuMoi = $data['gia_su_id'] ?? null;
            $tenLop = $lopHocCu['ten_lop'] ?? "Lớp $id";

            $dangMoiGiaSu = false;

            // NẾU ADMIN GÁN LỚP CHO MỘT GIA SƯ MỚI HOÀN TOÀN
            if (!empty($giaSuMoi)) {
                if ($giaSuMoi != $giaSuCu && $giaSuMoi != $giaSuDangMoi) {
                    $dangMoiGiaSu = true;
                    $data['gia_su_id'] = $giaSuCu; // Giữ nguyên gia sư cũ của DB (hoặc NULL) khoan hãy cập nhật DB
                } else {
                    $data['gia_su_id'] = $giaSuCu; // Chống ghi đè sai
                }
            } else {
                $data['gia_su_id'] = null; // Hủy gia sư
            }

            // Lọc trạng thái ảo bị tuồn xuống
            if (in_array($data['trang_thai'], ['cho_gia_su', 'tu_choi'])) {
                $data['trang_thai'] = 'sap_mo'; 
            }

            $result = LopHoc::update($id, $data);
            if ($result !== false) {
                
                if ($dangMoiGiaSu) {
                    ThongBaoModel::guiThongBao(
                        $giaSuMoi, 'gia_su', 'Lời mời nhận lớp mới',
                        "Trung tâm vừa gửi cho bạn một yêu cầu nhận lớp: {$tenLop}. Vui lòng vào mục Yêu cầu mới để xác nhận.", 'lop_hoc'
                    );

                    // Tự động sinh ra phiếu yêu cầu mới
                    $sqlYeuCau = "INSERT INTO yeu_cau 
                        (nguoi_tao_id, loai_nguoi_tao, phan_loai, tieu_de, noi_dung, lop_hoc_id, gia_su_id, trang_thai) 
                        VALUES (1, 'admin', 'mo_lop', 'Yêu cầu nhận lớp mới', :noi_dung, :lop_hoc_id, :gia_su_id, 'dang_xu_ly')";
                    Database::execute($sqlYeuCau, [
                        ':noi_dung' => "Trung tâm mời bạn đảm nhiệm giảng dạy lớp {$tenLop}. Bạn có muốn nhận lớp này không?",
                        ':lop_hoc_id' => $id,
                        ':gia_su_id' => $giaSuMoi
                    ]);
                }

                // Thông báo cho phụ huynh và học sinh khi lịch học thay đổi
                if (!empty($data['lich_hoc']) && $lopHocCu) {
                    ThongBaoModel::guiThongBao($lopHocCu['phu_huynh_id'], 'phu_huynh', 'Lịch học đã thay đổi', "Lịch học của lớp " . $lopHocCu['ten_lop'] . " đã thay đổi. Vui lòng kiểm tra lại.", 'lop_hoc');
                    ThongBaoModel::guiThongBao($lopHocCu['hoc_sinh_id'], 'hoc_sinh', 'Lịch học đã thay đổi', "Lịch học của lớp " . $lopHocCu['ten_lop'] . " đã thay đổi. Vui lòng kiểm tra lại.", 'lop_hoc');
                }
                echo json_encode(["status" => "success", "message" => "Cập nhật lớp học thành công!"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
        }
    }

    public function delete($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học cần xóa"]);
            return;
        }

        try {
            // ==========================================
            // DỌN RÁC RÀNG BUỘC TRƯỚC KHI XÓA LỚP
            // ==========================================
            Database::execute("DELETE FROM yeu_cau WHERE lop_hoc_id = :id", [':id' => $id]);
            Database::execute("DELETE FROM lich_hoc WHERE lop_hoc_id = :id", [':id' => $id]);
            Database::execute("DELETE FROM dang_ky_lop WHERE lop_hoc_id = :id", [':id' => $id]);

            LopHoc::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa lớp học thành công"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Không thể xóa: " . $e->getMessage()]);
        }
    }

    public function show($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }
        $lopHoc = LopHoc::getById($id);
        if ($lopHoc) {
            echo json_encode(["status" => "success", "data" => $lopHoc]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy lớp học"]);
        }
    }

    public function getStudentsByClass($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }

        try {
            require_once __DIR__ . '/../models/DangKyLop.php';
            $students = DangKyLop::getHocSinhDaDuyetByLop($id);
            echo json_encode(["status" => "success", "data" => $students]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function addStudent($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['hoc_sinh_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID học sinh"]);
            return;
        }

        try {
            require_once __DIR__ . '/../models/DangKyLop.php';
            
            $checkSql = "SELECT dang_ky_id, trang_thai FROM dang_ky_lop WHERE hoc_sinh_id = :hs_id AND lop_hoc_id = :lop_id";
            $exist = Database::query($checkSql, [
                ':hs_id' => $data['hoc_sinh_id'],
                ':lop_id' => $id
            ]);

            if ($exist && $exist[0]['trang_thai'] === 'da_duyet') {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Học sinh này đã được thêm vào lớp"]);
                return;
            }

            $checkCapacity = "SELECT so_luong_hien_tai, so_luong_toi_da FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
            $lop = Database::query($checkCapacity, [':lop_hoc_id' => $id]);
            
            if (!$lop) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Không tìm thấy lớp học này"]);
                return;
            }
            
            if ($lop[0]['so_luong_hien_tai'] >= $lop[0]['so_luong_toi_da']) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Lớp học này đã đủ số lượng tối đa học sinh"]);
                return;
            }

            if ($exist) {
                $updateSql = "UPDATE dang_ky_lop SET trang_thai = 'da_duyet', ngay_duyet = CURRENT_TIMESTAMP 
                              WHERE dang_ky_id = :id";
                $result = Database::execute($updateSql, [':id' => $exist[0]['dang_ky_id']]);
            } else {
                $insertSql = "INSERT INTO dang_ky_lop (hoc_sinh_id, lop_hoc_id, trang_thai, ngay_duyet) 
                              VALUES (:hoc_sinh_id, :lop_hoc_id, 'da_duyet', CURRENT_TIMESTAMP)";
                $result = Database::execute($insertSql, [
                    ':hoc_sinh_id' => $data['hoc_sinh_id'],
                    ':lop_hoc_id' => $id
                ]);
            }
            
            if ($result) {
                Database::execute(
                    "UPDATE lop_hoc SET so_luong_hien_tai = so_luong_hien_tai + 1 WHERE lop_hoc_id = :lop_id",
                    [':lop_id' => $id]
                );
                
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "Thêm học sinh vào lớp thành công"]);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function removeStudent($id, $studentId) {
        if (empty($id) || empty($studentId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học hoặc ID học sinh"]);
            return;
        }

        try {
            require_once __DIR__ . '/../models/DangKyLop.php';

            $checkSql = "SELECT dang_ky_id, trang_thai FROM dang_ky_lop WHERE lop_hoc_id = :lop_id AND hoc_sinh_id = :hs_id";
            $record = Database::query($checkSql, [
                ':lop_id' => $id,
                ':hs_id' => $studentId
            ]);

            if (!$record) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Không tìm thấy đăng ký này"]);
                return;
            }

            DangKyLop::updateStatus($record[0]['dang_ky_id'], 'da_huy');

            echo json_encode(["status" => "success", "message" => "Đã xóa học sinh khỏi lớp"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}