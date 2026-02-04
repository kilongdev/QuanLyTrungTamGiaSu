<?php
/**
 * Học Sinh Controller
 * Xử lý các request liên quan đến học sinh
 */

require_once __DIR__ . '/../models/HocSinh.php';

class HocSinhController
{
    /**
     * Danh sách học sinh
     * GET /hoc-sinh
     */
    public static function index(): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        $search = $_GET['search'] ?? '';

        $result = HocSinh::getAll($search, $limit, $offset);

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

    /**
     * Chi tiết học sinh
     * GET /hoc-sinh/{id}
     */
    public static function show(string $id): void
    {
        $hocSinh = HocSinh::findById($id);

        if (!$hocSinh) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Không tìm thấy học sinh'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $hocSinh['lop_hoc'] = HocSinh::getLopHoc($id);

        echo json_encode([
            'status' => 'success',
            'data' => $hocSinh
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Tạo học sinh mới
     * POST /hoc-sinh
     */
    public static function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['ho_ten'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Vui lòng điền tên học sinh'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $id = HocSinh::create($input);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Tạo học sinh thành công',
                'data' => ['hoc_sinh_id' => $id]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Cập nhật học sinh
     * PUT /hoc-sinh/{id}
     */
    public static function update(string $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $updated = HocSinh::update($id, $input);

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

    /**
     * Xóa học sinh
     * DELETE /hoc-sinh/{id}
     */
    public static function destroy(string $id): void
    {
        try {
            $affected = HocSinh::delete($id);
            
            if ($affected === 0) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không tìm thấy học sinh'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Xóa học sinh thành công'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Lấy học sinh của phụ huynh
     * GET /phu-huynh/{id}/hoc-sinh
     */
    public static function getByPhuHuynh(string $id): void
    {
        $hocSinh = HocSinh::getByPhuHuynhId($id);

        echo json_encode([
            'status' => 'success',
            'data' => $hocSinh
        ], JSON_UNESCAPED_UNICODE);
    }
}
