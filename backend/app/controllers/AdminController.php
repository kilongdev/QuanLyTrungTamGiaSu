<?php
require_once __DIR__ . '/../models/AdminModel.php';

class AdminController {
    private $adminModel;

    public function __construct() {
        $this->adminModel = new AdminModel();
    }

    /**
     * Lấy tất cả admin
     * GET /api/admin
     */
    public function getAll() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

            $admins = $this->adminModel->paginate($page, $limit);
            $total = $this->adminModel->countAll();

            $this->sendResponse(true, 'Lấy danh sách admin thành công', [
                'data' => $admins,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Lấy admin theo ID
     * GET /api/admin/{id}
     */
    public function getById($id) {
        try {
            if (!$id || !is_numeric($id)) {
                $this->sendResponse(false, 'ID admin không hợp lệ', null, 400);
                return;
            }

            $admin = $this->adminModel->findById($id);

            if (!$admin) {
                $this->sendResponse(false, 'Không tìm thấy admin', null, 404);
                return;
            }

            $this->sendResponse(true, 'Lấy thông tin admin thành công', $admin);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Tạo admin mới
     * POST /api/admin
     */
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate dữ liệu
            if (!isset($data['email']) || !isset($data['mat_khau'])) {
                $this->sendResponse(false, 'Email và mật khẩu là bắt buộc', null, 400);
                return;
            }

            // Kiểm tra email đã tồn tại
            if ($this->adminModel->emailExists($data['email'])) {
                $this->sendResponse(false, 'Email đã tồn tại', null, 400);
                return;
            }

            // Validate email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $this->sendResponse(false, 'Email không hợp lệ', null, 400);
                return;
            }

            // Mã hóa mật khẩu
            $data['mat_khau'] = password_hash($data['mat_khau'], PASSWORD_DEFAULT);

            $id = $this->adminModel->create($data);

            if ($id) {
                $this->sendResponse(true, 'Tạo admin thành công', ['admin_id' => $id], 201);
            } else {
                $this->sendResponse(false, 'Không thể tạo admin', null, 500);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Cập nhật thông tin admin
     * PUT /api/admin/{id}
     */
    public function update($id) {
        try {
            if (!$id || !is_numeric($id)) {
                $this->sendResponse(false, 'ID admin không hợp lệ', null, 400);
                return;
            }

            // Kiểm tra admin tồn tại
            $admin = $this->adminModel->findById($id);
            if (!$admin) {
                $this->sendResponse(false, 'Không tìm thấy admin', null, 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            // Nếu cập nhật email, kiểm tra email mới không trùng
            if (isset($data['email']) && $data['email'] !== $admin['email']) {
                if ($this->adminModel->emailExists($data['email'])) {
                    $this->sendResponse(false, 'Email đã tồn tại', null, 400);
                    return;
                }

                if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    $this->sendResponse(false, 'Email không hợp lệ', null, 400);
                    return;
                }
            }

            // Nếu cập nhật mật khẩu
            if (isset($data['mat_khau'])) {
                $data['mat_khau'] = password_hash($data['mat_khau'], PASSWORD_DEFAULT);
            }

            $result = $this->adminModel->update($id, $data);

            if ($result) {
                $this->sendResponse(true, 'Cập nhật admin thành công', ['admin_id' => $id]);
            } else {
                $this->sendResponse(false, 'Không có dữ liệu để cập nhật', null, 400);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Xóa admin
     * DELETE /api/admin/{id}
     */
    public function delete($id) {
        try {
            if (!$id || !is_numeric($id)) {
                $this->sendResponse(false, 'ID admin không hợp lệ', null, 400);
                return;
            }

            // Kiểm tra admin tồn tại
            $admin = $this->adminModel->findById($id);
            if (!$admin) {
                $this->sendResponse(false, 'Không tìm thấy admin', null, 404);
                return;
            }

            $result = $this->adminModel->delete($id);

            if ($result) {
                $this->sendResponse(true, 'Xóa admin thành công');
            } else {
                $this->sendResponse(false, 'Không thể xóa admin', null, 500);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Đăng nhập admin
     * POST /api/admin/login
     */
    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['email']) || !isset($data['mat_khau'])) {
                $this->sendResponse(false, 'Email và mật khẩu là bắt buộc', null, 400);
                return;
            }

            $admin = $this->adminModel->findByEmail($data['email']);

            if (!$admin) {
                $this->sendResponse(false, 'Email hoặc mật khẩu không đúng', null, 401);
                return;
            }

            // Kiểm tra mật khẩu
            if (!password_verify($data['mat_khau'], $admin['mat_khau'])) {
                $this->sendResponse(false, 'Email hoặc mật khẩu không đúng', null, 401);
                return;
            }

            // Loại bỏ mật khẩu từ response
            unset($admin['mat_khau']);

            $this->sendResponse(true, 'Đăng nhập thành công', $admin);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Lấy thông tin cá nhân của admin hiện tại
     * GET /api/profile
     */
    public function getProfile() {
        try {
            // Lấy token từ header
            require_once __DIR__ . '/../core/JWT.php';
            $token = JWT::getTokenFromHeader();

            if (!$token) {
                $this->sendResponse(false, 'Không tìm thấy token', null, 401);
                return;
            }

            $decoded = JWT::decode($token);
            if (!$decoded) {
                $this->sendResponse(false, 'Token không hợp lệ', null, 401);
                return;
            }

            // Lấy user_id từ token
            $userId = $decoded['user_id'] ?? null;
            if (!$userId) {
                $this->sendResponse(false, 'Token không chứa user_id', null, 401);
                return;
            }

            // Lấy thông tin admin từ database
            $admin = $this->adminModel->findById($userId);
            if (!$admin) {
                $this->sendResponse(false, 'Không tìm thấy tài khoản admin', null, 404);
                return;
            }

            // Loại bỏ password từ response
            unset($admin['mat_khau']);

            $this->sendResponse(true, 'Lấy thông tin cá nhân thành công', $admin);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Cập nhật thông tin cá nhân của admin hiện tại
     * PUT /api/profile/update
     */
    public function updateProfile() {
        try {
            // Lấy token từ header
            require_once __DIR__ . '/../core/JWT.php';
            $token = JWT::getTokenFromHeader();

            if (!$token) {
                $this->sendResponse(false, 'Không tìm thấy token', null, 401);
                return;
            }

            $decoded = JWT::decode($token);
            if (!$decoded) {
                $this->sendResponse(false, 'Token không hợp lệ', null, 401);
                return;
            }

            // Lấy user_id từ token
            $userId = $decoded['user_id'] ?? null;
            if (!$userId) {
                $this->sendResponse(false, 'Token không chứa user_id', null, 401);
                return;
            }

            // Lấy dữ liệu từ request body
            $data = json_decode(file_get_contents('php://input'), true);

            // Kiểm tra dữ liệu
            if (empty($data)) {
                $this->sendResponse(false, 'Không có dữ liệu để cập nhật', null, 400);
                return;
            }

            // Chỉ cho phép cập nhật name, email, và phone
            $allowedFields = ['name', 'email', 'phone'];
            $updateData = [];

            foreach ($data as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    if ($key === 'name') {
                        $updateData['ho_ten'] = $value;
                    } elseif ($key === 'email') {
                        $updateData['email'] = $value;
                    } elseif ($key === 'phone') {
                        $updateData['so_dien_thoai'] = $value;
                    }
                }
            }

            if (empty($updateData)) {
                $this->sendResponse(false, 'Không có dữ liệu hợp lệ để cập nhật', null, 400);
                return;
            }

            // Validate email nếu cập nhật email
            if (isset($updateData['email'])) {
                if (!filter_var($updateData['email'], FILTER_VALIDATE_EMAIL)) {
                    $this->sendResponse(false, 'Email không hợp lệ', null, 400);
                    return;
                }

                // Kiểm tra email đã tồn tại (ngoại trừ email của user hiện tại)
                $existingAdmin = $this->adminModel->findByEmail($updateData['email']);
                if ($existingAdmin && $existingAdmin['admin_id'] != $userId) {
                    $this->sendResponse(false, 'Email đã tồn tại', null, 400);
                    return;
                }
            }

            // Validate phone nếu cập nhật phone
            if (isset($updateData['so_dien_thoai']) && !empty($updateData['so_dien_thoai'])) {
                // Vietnamese phone format: 0 followed by 9-10 digits
                if (!preg_match('/^0\d{9,10}$/', $updateData['so_dien_thoai'])) {
                    $this->sendResponse(false, 'Số điện thoại không hợp lệ (định dạng: 0123456789)', null, 400);
                    return;
                }
            }

            // Validate name
            if (isset($updateData['ho_ten']) && empty(trim($updateData['ho_ten']))) {
                $this->sendResponse(false, 'Họ tên không được để trống', null, 400);
                return;
            }

            // Cập nhật thông tin
            $result = $this->adminModel->update($userId, $updateData);

            if ($result) {
                $this->sendResponse(true, 'Cập nhật thông tin thành công');
            } else {
                $this->sendResponse(false, 'Lỗi khi cập nhật thông tin', null, 500);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Thay đổi mật khẩu của admin hiện tại
     * POST /api/profile/change-password
     */
    public function changePassword() {
        try {
            // Lấy token từ header
            require_once __DIR__ . '/../core/JWT.php';
            $token = JWT::getTokenFromHeader();

            if (!$token) {
                $this->sendResponse(false, 'Không tìm thấy token', null, 401);
                return;
            }

            $decoded = JWT::decode($token);
            if (!$decoded) {
                $this->sendResponse(false, 'Token không hợp lệ', null, 401);
                return;
            }

            // Lấy user_id từ token
            $userId = $decoded['user_id'] ?? null;
            if (!$userId) {
                $this->sendResponse(false, 'Token không chứa user_id', null, 401);
                return;
            }

            // Lấy dữ liệu từ request body
            $data = json_decode(file_get_contents('php://input'), true);

            // Kiểm tra dữ liệu
            if (!isset($data['oldPassword']) || !isset($data['newPassword'])) {
                $this->sendResponse(false, 'Vui lòng nhập mật khẩu cũ và mật khẩu mới', null, 400);
                return;
            }

            $oldPassword = trim($data['oldPassword']);
            $newPassword = trim($data['newPassword']);

            if (empty($oldPassword) || empty($newPassword)) {
                $this->sendResponse(false, 'Mật khẩu không được để trống', null, 400);
                return;
            }

            // Lấy admin từ database
            $admin = $this->adminModel->findById($userId);
            if (!$admin) {
                $this->sendResponse(false, 'Không tìm thấy tài khoản admin', null, 404);
                return;
            }

            // Kiểm tra mật khẩu cũ
            // Hỗ trợ cả plaintext (tương thích ngược) và bcrypt hash
            $passwordIsCorrect = false;
            
            // Thử xác minh với bcrypt hash trước
            if (password_verify($oldPassword, $admin['mat_khau'])) {
                $passwordIsCorrect = true;
            } elseif ($oldPassword === $admin['mat_khau']) {
                // Fallback: so sánh plaintext (tương thích với mật khẩu cũ)
                $passwordIsCorrect = true;
            }
            
            if (!$passwordIsCorrect) {
                $this->sendResponse(false, 'Mật khẩu cũ không đúng', null, 401);
                return;
            }

            // Validate mật khẩu mới
            if (strlen($newPassword) < 6) {
                $this->sendResponse(false, 'Mật khẩu mới phải có ít nhất 6 ký tự', null, 400);
                return;
            }

            // Mã hóa mật khẩu mới
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Cập nhật mật khẩu
            $result = $this->adminModel->update($userId, ['mat_khau' => $hashedPassword]);

            if ($result) {
                $this->sendResponse(true, 'Thay đổi mật khẩu thành công');
            } else {
                $this->sendResponse(false, 'Lỗi khi thay đổi mật khẩu', null, 500);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Hàm gửi response JSON
     */
    private function sendResponse($success, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => $success,
            'message' => $message
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
?>