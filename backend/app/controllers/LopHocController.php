<?php
require_once __DIR__ . '/../models/LopHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LopHocController {

    public function index() {
        $lopHocs = LopHoc::getAll();
        echo json_encode(["status" => "success", "data" => $lopHocs]);
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['mon_hoc_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng chọn môn học!"]);
            return;
        }

        try {
            $result = LopHoc::create($data);
            if ($result) {
                $createdId = (int)Database::lastInsertId();
                // Lấy tên lớp vừa tạo
                $lopHoc = LopHoc::getById($createdId);
                $tenLop = $lopHoc ? $lopHoc['ten_lop'] : 'lớp học mới';
                
                // Thông báo cho Admin về lớp học mới
                ThongBaoModel::guiThongBao(
                    1, // Admin ID
                    'admin',
                    'Lớp học mới được tạo',
                    "Lớp {$tenLop} đã được tạo. Vui lòng kiểm tra.",
                    'lop_hoc'
                );
                
                // Nếu có phân công gia sư, thông báo cho gia sư
                if (!empty($data['gia_su_id'])) {
                    ThongBaoModel::guiThongBao(
                        $data['gia_su_id'],
                        'gia_su',
                        'Được phân công dạy lớp mới',
                        "Bạn đã được phân công dạy lớp {$tenLop}. Vui lòng kiểm tra lịch dạy.",
                        'lop_hoc'
                    );
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
            $result = LopHoc::update($id, $data);
            if ($result !== false) {
                // Nếu có phân công gia sư, gửi thông báo cho gia sư
                if (!empty($data['gia_su_id'])) {
                    ThongBaoModel::guiThongBao(
                        $data['gia_su_id'],
                        'gia_su',
                        'Được phân công dạy lớp mới',
                        "Bạn đã được phân công dạy một lớp học mới. Vui lòng kiểm tra lịch dạy.",
                        'lop_hoc'
                    );
                }
                // Thông báo cho phụ huynh và học sinh khi lịch học thay đổi
                if (!empty($data['lich_hoc'])) {
                    $lopHoc = LopHoc::getById($id);
                    if ($lopHoc) {
                        ThongBaoModel::guiThongBao(
                            $lopHoc['phu_huynh_id'],
                            'phu_huynh',
                            'Lịch học đã thay đổi',
                            "Lịch học của lớp " . $lopHoc['ten_lop'] . " đã thay đổi. Vui lòng kiểm tra lại.",
                            'lop_hoc'
                        );
                        ThongBaoModel::guiThongBao(
                            $lopHoc['hoc_sinh_id'],
                            'hoc_sinh',
                            'Lịch học đã thay đổi',
                            "Lịch học của lớp " . $lopHoc['ten_lop'] . " đã thay đổi. Vui lòng kiểm tra lại.",
                            'lop_hoc'
                        );
                    }
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
            LopHoc::delete($id);
            echo json_encode(["status" => "success", "message" => "Đã xóa lớp học thành công"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Không thể xóa: Lớp học này đã có dữ liệu ràng buộc"]);
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
            
            // Check if already registered with approved status
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

            // Lấy thông tin lớp
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

            // Nếu đã có bản ghi với trạng thái không phải da_duyet, cập nhật thành da_duyet
            if ($exist) {
                $updateSql = "UPDATE dang_ky_lop SET trang_thai = 'da_duyet', ngay_duyet = CURRENT_TIMESTAMP 
                              WHERE dang_ky_id = :id";
                $result = Database::execute($updateSql, [':id' => $exist[0]['dang_ky_id']]);
            } else {
                // Tạo bản ghi mới với trạng thái da_duyet (tự động duyệt từ admin)
                $insertSql = "INSERT INTO dang_ky_lop (hoc_sinh_id, lop_hoc_id, trang_thai, ngay_duyet) 
                              VALUES (:hoc_sinh_id, :lop_hoc_id, 'da_duyet', CURRENT_TIMESTAMP)";
                $result = Database::execute($insertSql, [
                    ':hoc_sinh_id' => $data['hoc_sinh_id'],
                    ':lop_hoc_id' => $id
                ]);
            }
            
            if ($result) {
                // Cập nhật số lượng học sinh hiện tại của lớp
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

            // Get the registration record to get current status
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

            // Update status to da_huy instead of deleting
            DangKyLop::updateStatus($record[0]['dang_ky_id'], 'da_huy');

            echo json_encode(["status" => "success", "message" => "Đã xóa học sinh khỏi lớp"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}