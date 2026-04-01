<?php
require_once __DIR__ . '/../models/PhuHuynh.php';
require_once __DIR__ . '/../models/HocSinh.php';
require_once __DIR__ . '/../models/DanhGia.php';

class PhuHuynhController
{
    public static function index(): void
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

    public static function show(string $id): void
    {
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

    public static function store(): void
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

    public static function update(string $id): void
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

    public static function destroy(string $id): void
    {
        try {
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
                'message' => 'Đã khóa tài khoản phụ huynh'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
