<?php
require_once __DIR__ . '/../models/LopHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LopHocController {

    public function index() {
        $lopHocs = LopHoc::getAll();
        echo json_encode(["status" => "success", "data" => $lopHocs]);
    }

    public function getAvailable() {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $classes = LopHoc::getAvailableClasses();

            echo json_encode([
                'status' => 'success',
                'message' => 'Lấy danh sách lớp học thành công',
                'count' => count($classes),
                'data' => $classes
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi hệ thống khi lấy danh sách lớp: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
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
                // Lấy tên lớp vừa tạo
                $lopHoc = LopHoc::getById(Database::lastInsertId());
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
                echo json_encode(["status" => "success", "message" => "Tạo lớp học thành công!"]);
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

        // Chống xung đột route: Nếu ID là từ khóa 'available', chuyển sang hàm đúng
        if ($id === 'available') {
            $this->getAvailable();
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
}