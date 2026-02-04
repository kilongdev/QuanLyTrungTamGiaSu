<?php
/**
 * Gia Sư Controller
 * Xử lý các request liên quan đến gia sư
 */

require_once __DIR__ . '/../models/GiaSu.php';

class GiaSuController
{
    /**
     * Danh sách gia sư
     * GET /gia-su
     */
    public static function index(): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        $search = $_GET['search'] ?? '';
        $trangThai = $_GET['trang_thai'] ?? '';

        $result = GiaSu::getAll($search, $trangThai, $limit, $offset);

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
     * Chi tiết gia sư
     * GET /gia-su/{id}
     */
    public static function show(string $id): void
    {
        $giaSu = GiaSu::findById($id);

        if (!$giaSu) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Không tìm thấy gia sư'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $giaSu['mon_hoc'] = GiaSu::getMonHoc($id);
        $giaSu['lop_hoc'] = GiaSu::getLopHoc($id);

        echo json_encode([
            'status' => 'success',
            'data' => $giaSu
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Tạo gia sư mới
     * POST /gia-su
     */
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
            $id = GiaSu::create($input);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Tạo gia sư thành công',
                'data' => ['gia_su_id' => $id]
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
     * Cập nhật gia sư
     * PUT /gia-su/{id}
     */
    public static function update(string $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $updated = GiaSu::update($id, $input);

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
     * Xóa gia sư
     * DELETE /gia-su/{id}
     */
    public static function destroy(string $id): void
    {
        try {
            $affected = GiaSu::delete($id);
            
            if ($affected === 0) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không tìm thấy gia sư'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Xóa gia sư thành công'
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
     * Duyệt gia sư
     * PUT /gia-su/{id}/duyet
     */
    public static function approve(string $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $trangThai = $input['trang_thai'] ?? 'da_duyet';

        try {
            GiaSu::updateStatus($id, $trangThai);

            echo json_encode([
                'status' => 'success',
                'message' => 'Cập nhật trạng thái thành công'
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
