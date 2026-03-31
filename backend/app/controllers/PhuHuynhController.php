<?php
require_once __DIR__ . '/../models/PhuHuynh.php';
require_once __DIR__ . '/../models/HocSinh.php';
require_once __DIR__ . '/../models/DanhGia.php';
require_once __DIR__ . '/../models/HocPhiModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../core/Database.php';

class PhuHuynhController
{
    public function index(): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        $search = $_GET['search'] ?? '';

        $result = PhuHuynh::getAll($search, $limit, $offset);

        echo json_encode([
            'status' => 'success',
            'data' => $result['data'],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $result['total'],
                'total_pages' => ceil($result['total'] / $limit)
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    public function show($id): void
    {
        // Chống xung đột route: Nếu ID là các từ khóa đặc biệt, chuyển hướng sang hàm đúng
        if ($id === 'profile') {
            $this->getProfile();
            return;
        }
        if ($id === 'dashboard') {
            $this->getDashboardData();
            return;
        }
        // Điều hướng nếu gọi xem chi tiết con của phụ huynh
        if ($id === 'child') {
            $this->getChildDetails($_GET['id'] ?? null);
            return;
        }

        $phuHuynh = PhuHuynh::findById($id);

        if (!$phuHuynh) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Không tìm thấy phụ huynh'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $phuHuynh['hoc_sinh'] = HocSinh::getByPhuHuynhId($id);

        echo json_encode([
            'status' => 'success',
            'data' => $phuHuynh
        ], JSON_UNESCAPED_UNICODE);
    }

    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['ho_ten']) || empty($input['email']) || empty($input['mat_khau'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Vui lòng điền đầy đủ thông tin'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $id = PhuHuynh::create($input);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Tạo phụ huynh thành công',
                'data' => ['phu_huynh_id' => $id]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function update(string $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        // Kiểm tra email trùng lặp nếu có thay đổi
        if (isset($input['email'])) {
            $existing = PhuHuynh::findByEmail($input['email']);
            if ($existing && $existing['phu_huynh_id'] != $id) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Email đã được sử dụng bởi tài khoản khác'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
        }

        try {
            $updated = PhuHuynh::update($id, $input);

            if (!$updated) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không có dữ liệu để cập nhật'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Cập nhật thành công'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function destroy(string $id): void
    {
        try {
            // Kiểm tra xem phụ huynh có học sinh không trước khi xóa
            $children = HocSinh::getByPhuHuynhId($id);
            if (!empty($children)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không thể xóa phụ huynh vì đang có học sinh liên kết.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Kiểm tra xem phụ huynh có đánh giá nào không
            if (DanhGia::hasRatingsByPhuHuynh($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không thể xóa phụ huynh vì đã có đánh giá gia sư liên quan.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }


            $affected = PhuHuynh::delete($id);
            
            if ($affected === 0) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không tìm thấy phụ huynh'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Xóa phụ huynh thành công'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    // --- CÁC PHƯƠNG THỨC DÀNH CHO PHỤ HUYNH ĐANG ĐĂNG NHẬP ---

    /**
     * Lấy thông tin cá nhân của Phụ huynh đang đăng nhập
     * GET /phuhuynh/profile
     */
    public function getProfile(): void
    {
        $user = AuthMiddleware::authorize(['phu_huynh']);
        if (!$user) return;

        // Đảm bảo lấy đúng user_id từ payload JWT
        $phuHuynhId = isset($user['user_id']) ? (int)$user['user_id'] : (isset($user['id']) ? (int)$user['id'] : null);

        if (!$phuHuynhId) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error', 
                'message' => 'Không thể xác định ID người dùng từ Token. Payload nhận được: ' . json_encode($user)
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $data = PhuHuynh::getDetails((int)$phuHuynhId);

        if (!$data) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error', 
                'message' => "Không tìm thấy dữ liệu trong bảng phu_huynh cho ID: $phuHuynhId. Vui lòng kiểm tra lại database."
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
    }

    // Lấy danh sách học phí cần đóng của Phụ Huynh đang đăng nhập
    public function getHocPhiCuaToi(): void
    {
        // 1. Xác thực token và quyền (chỉ cho phép phụ huynh)
        $userPayload = AuthMiddleware::authorize(['phu_huynh']);
        if (!$userPayload) return;

        // 2. Lấy ID từ Payload JWT
        $phuHuynhId = $userPayload['user_id'] ?? $userPayload['id'] ?? null;

        try {
            $hocPhiModel = new HocPhiModel();
            $danhSachHocPhi = $hocPhiModel->getChuaThanhToanByPhuHuynh($phuHuynhId);
            
            // Tính tổng tiền cần đóng
            $tongTien = 0;
            foreach ($danhSachHocPhi as $hp) {
                $tongTien += (float)$hp['so_tien'];
            }

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'danh_sach' => $danhSachHocPhi,
                    'tong_tien_can_dong' => $tongTien
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    // Lấy toàn bộ lịch sử học phí (đã đóng & chưa đóng) của Phụ Huynh
    public function getLichSuHocPhi(): void
    {
        // Chỉ cho phép phụ huynh truy cập
        $userPayload = AuthMiddleware::authorize(['phu_huynh']);
        if (!$userPayload) return;

        $phuHuynhId = $userPayload['user_id'] ?? $userPayload['id'] ?? null;

        try {
            $hocPhiModel = new HocPhiModel();
            $danhSachHocPhi = $hocPhiModel->getAllByPhuHuynh($phuHuynhId);
            
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'danh_sach' => $danhSachHocPhi
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    // Lấy dữ liệu tổng quan cho dashboard của Phụ Huynh
    public function getDashboardData(): void
    {
        // 1. Xác thực token và quyền (chỉ cho phép phụ huynh)
        $userPayload = AuthMiddleware::authorize(['phu_huynh']);
        if (!$userPayload) {
            // AuthMiddleware đã gửi response lỗi, chỉ cần dừng lại.
            return;
        }

        // 2. Lấy ID phụ huynh
        $phuHuynhId = $userPayload['user_id'] ?? $userPayload['id'] ?? 0;
        $phuHuynhId = (int)$phuHuynhId;

        try {
            // 4. Lấy dữ liệu từ DB
            $children = HocSinh::getByPhuHuynhId((string)$phuHuynhId);
            $tutors = PhuHuynh::getCurrentTutors($phuHuynhId);
            $upcomingClasses = PhuHuynh::getUpcomingClasses($phuHuynhId, 5);
            
            // 5. Trả về response thành công
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'children' => $children,
                    'tutors' => $tutors,
                    'upcoming_classes' => $upcomingClasses
                ],
                // Thêm thông tin debug để bạn có thể kiểm tra trong tab Network của trình duyệt
                'debug_info' => [
                    'phu_huynh_id_found' => $phuHuynhId,
                    'children_count' => count($children),
                    'tutors_count' => count($tutors),
                    'upcoming_classes_count' => count($upcomingClasses)
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi server khi truy vấn dữ liệu dashboard: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Lấy danh sách thông báo dành riêng cho Phụ huynh đang đăng nhập
     * GET /phuhuynh/notifications
     */
    public function getNotifications(): void
    {
        // 1. Xác thực và lấy thông tin user từ Token
        $user = AuthMiddleware::authorize(['phu_huynh']);
        if (!$user) return;

        // 2. Lấy đúng user_id
        $phuHuynhId = $user['user_id'] ?? $user['id'] ?? null;

        try {
            // 3. Truy vấn bảng thong_bao lọc theo ID người nhận và Loại người nhận
            $sql = "SELECT * FROM thong_bao 
                    WHERE nguoi_nhan_id = ? AND loai_nguoi_nhan = 'phu_huynh' 
                    ORDER BY ngay_tao DESC";
            $notifications = Database::query($sql, [$phuHuynhId]);

            echo json_encode(['status' => 'success', 'data' => $notifications], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Lỗi: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Lấy chi tiết thông tin một học sinh cụ thể (con)
     * GET /phuhuynh/child/{id}
     */
    public function getChildDetails($hocSinhId): void
    {
        $user = AuthMiddleware::authorize(['phu_huynh']);
        if (!$user) return;
        $phuHuynhId = $user['user_id'] ?? $user['id'] ?? null;

        try {
            // 1. Lấy thông tin cơ bản và kiểm tra quyền sở hữu
            $student = HocSinh::findById($hocSinhId);
            if (!$student || $student['phu_huynh_id'] != $phuHuynhId) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Bạn không có quyền xem thông tin học sinh này'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // 2. Lấy danh sách lớp học đang tham gia (kèm môn học và gia sư)
            $student['lop_hoc'] = HocSinh::getLopHoc($hocSinhId);
            
            // 3. Lấy lịch sử điểm danh gần đây
            $student['diem_danh'] = Database::query(
                "SELECT dd.*, lh.ngay_hoc, lh.gio_bat_dau, mh.ten_mon_hoc
                 FROM diem_danh dd
                 JOIN lich_hoc lh ON dd.lich_hoc_id = lh.lich_hoc_id
                 JOIN lop_hoc l ON lh.lop_hoc_id = l.lop_hoc_id
                 JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
                 WHERE dd.hoc_sinh_id = ?
                 ORDER BY lh.ngay_hoc DESC LIMIT 15",
                [$hocSinhId]
            );

            // 4. Lấy lịch học sắp tới (upcoming schedule)
            $student['lich_hoc_sap_toi'] = Database::query(
                "SELECT lh.*, mh.ten_mon_hoc, l.ten_lop
                 FROM lich_hoc lh
                 JOIN lop_hoc l ON lh.lop_hoc_id = l.lop_hoc_id
                 JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
                 JOIN dang_ky_lop dkl ON l.lop_hoc_id = dkl.lop_hoc_id
                 WHERE dkl.hoc_sinh_id = ? 
                 AND dkl.trang_thai = 'da_duyet'
                 AND lh.ngay_hoc >= CURRENT_DATE
                 AND lh.trang_thai != 'huy'
                 ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC",
                [$hocSinhId]
            );

            // 5. Lấy danh sách học phí của riêng học sinh này
            $student['hoc_phi_lich_su'] = Database::query(
                "SELECT hp.*, lh.ten_lop, mh.ten_mon_hoc
                 FROM hoc_phi hp
                 JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE dkl.hoc_sinh_id = ?
                 ORDER BY hp.ngay_tao DESC",
                [$hocSinhId]
            );

            echo json_encode([
                'status' => 'success',
                'data' => $student
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Lỗi server: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Lấy danh sách học sinh của phụ huynh đang đăng nhập
     * GET /phuhuynh/my-students
     */
    public function getMyStudents(): void
    {
        $user = AuthMiddleware::authorize(['phu_huynh']);
        if (!$user) return;

        $phuHuynhId = isset($user['user_id']) ? (int)$user['user_id'] : (isset($user['id']) ? (int)$user['id'] : null);

        try {
            $students = HocSinh::getByPhuHuynhId((string)$phuHuynhId);
            echo json_encode(['status' => 'success', 'data' => $students], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Lỗi: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Lấy danh sách gia sư của các con đang theo học
     * GET /phuhuynh/my-tutors
     */
    public function getMyTutors(): void
    {
        $user = AuthMiddleware::authorize(['phu_huynh']);
        if (!$user) return;

        $phuHuynhId = isset($user['user_id']) ? (int)$user['user_id'] : (isset($user['id']) ? (int)$user['id'] : null);

        try {
            $sql = "SELECT DISTINCT 
                        gs.gia_su_id, gs.ho_ten, gs.diem_danh_gia_trung_binh, gs.kinh_nghiem,
                        mh.ten_mon_hoc, hs.ho_ten as ten_hoc_sinh, 
                        lh.gia_moi_buoi, lh.lop_hoc_id, lh.khoi_lop
                    FROM gia_su gs
                    JOIN lop_hoc lh ON gs.gia_su_id = lh.gia_su_id
                    JOIN dang_ky_lop dkl ON lh.lop_hoc_id = dkl.lop_hoc_id
                    JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                    JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                    WHERE hs.phu_huynh_id = ? 
                    AND dkl.trang_thai = 'da_duyet'
                    AND lh.trang_thai = 'dang_hoc'";
            
            $tutors = Database::query($sql, [$phuHuynhId]);
            echo json_encode(['status' => 'success', 'data' => $tutors], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Lỗi: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}
