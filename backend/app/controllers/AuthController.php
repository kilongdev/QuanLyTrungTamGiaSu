<?php
require_once __DIR__ . '/../core/JWT.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../models/GiaSu.php';
require_once __DIR__ . '/../models/PhuHuynh.php';
require_once __DIR__ . '/../models/HocSinh.php';

class AuthController
{
    public static function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';

        if ((empty($email) && empty($phone)) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email/Số điện thoại và mật khẩu không được để trống'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $user = null;
        if (!empty($email)) {
            $user = self::findUserByEmailForLogin($email);
        }
        if (!$user && !empty($phone)) {
            $user = self::findUserByPhone($phone);
        }

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Tài khoản không tồn tại'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $passwordValid = password_verify($password, $user['password']) || $password === $user['password'];
        
        if (!$passwordValid) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Mật khẩu không đúng'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $token = JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Đăng nhập thành công',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'phu_huynh';
        $student = $input['student'] ?? null;

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Vui lòng điền đầy đủ thông tin'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (self::findUserByEmail($email)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email đã được sử dụng'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            Database::beginTransaction();

            $newUser = null;

            if ($role === 'phu_huynh') {
                $phuHuynhId = PhuHuynh::create([
                    'ho_ten' => $name,
                    'so_dien_thoai' => $phone,
                    'email' => $email,
                    'mat_khau' => $password
                ]);

                if ($student && !empty($student['name'])) {
                    HocSinh::create([
                        'phu_huynh_id' => $phuHuynhId,
                        'ho_ten' => $student['name'],
                        'ngay_sinh' => $student['birthday'] ?? null,
                        'khoi_lop' => $student['grade'] ?? 6
                    ]);
                }

                $newUser = [
                    'id' => $phuHuynhId,
                    'name' => $name,
                    'email' => $email,
                    'role' => 'phu_huynh'
                ];

            } elseif ($role === 'gia_su') {
                $giaSuId = GiaSu::create([
                    'ho_ten' => $name,
                    'email' => $email,
                    'mat_khau' => $password,
                    'so_dien_thoai' => $phone
                ]);

                $newUser = [
                    'id' => $giaSuId,
                    'name' => $name,
                    'email' => $email,
                    'role' => 'gia_su'
                ];
            }

            Database::commit();

            $token = JWT::encode([
                'user_id' => $newUser['id'],
                'email' => $newUser['email'],
                'role' => $newUser['role'],
                'name' => $newUser['name']
            ]);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Đăng ký thành công',
                'data' => [
                    'token' => $token,
                    'user' => $newUser
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            Database::rollback();
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi đăng ký: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function me(): void
    {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';

        $user = AuthMiddleware::authenticate();

        if (!$user) {
            return;
        }

        $details = self::getUserDetails($user['user_id'], $user['role']);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'user_id' => $user['user_id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
                'details' => $details
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function refresh(): void
    {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';

        $user = AuthMiddleware::authenticate();

        if (!$user) {
            return;
        }

        $newToken = JWT::encode([
            'user_id' => $user['user_id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Token refreshed',
            'data' => [
                'token' => $newToken
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function logout(): void
    {
        echo json_encode([
            'status' => 'success',
            'message' => 'Đăng xuất thành công'
        ], JSON_UNESCAPED_UNICODE);
    }

    private static function findUserByPhone(string $phone): ?array
    {
        $admin = Admin::findByPhone($phone);
        if ($admin) return $admin;

        $tutor = GiaSu::findByPhone($phone);
        if ($tutor) return $tutor;

        $parent = PhuHuynh::findByPhone($phone);
        if ($parent) return $parent;

        return null;
    }

    private static function findUserByEmailForLogin(string $email): ?array
    {
        $admin = Admin::findByEmailForLogin($email);
        if ($admin) return $admin;

        $tutor = GiaSu::findByEmailForLogin($email);
        if ($tutor) return $tutor;

        $parent = PhuHuynh::findByEmailForLogin($email);
        if ($parent) return $parent;

        return null;
    }

    private static function findUserByEmail(string $email): ?array
    {
        $admin = Admin::findByEmail($email);
        if ($admin) return $admin;

        $tutor = GiaSu::findByEmail($email);
        if ($tutor) return $tutor;

        $parent = PhuHuynh::findByEmail($email);
        if ($parent) return $parent;

        return null;
    }

    private static function getUserDetails(int $userId, string $role): ?array
    {
        switch ($role) {
            case 'admin':
                return Admin::getDetails($userId);

            case 'gia_su':
                return GiaSu::getDetails($userId);

            case 'phu_huynh':
                return PhuHuynh::getDetails($userId);

            default:
                return null;
        }
    }
}
