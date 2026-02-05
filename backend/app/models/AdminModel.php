<?php
require_once __DIR__ . '/base.php';

class AdminModel extends BaseModel {
    protected $table = 'admin';
    protected $primaryKey = 'admin_id';

    /**
     * Tạo admin mới
     * @param array $data - Dữ liệu admin (ho_ten, email, mat_khau, so_dien_thoai)
     * @return int - ID của admin vừa tạo
     */
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (ho_ten, email, mat_khau, so_dien_thoai) 
                VALUES (:ho_ten, :email, :mat_khau, :so_dien_thoai)";
        
        $stmt = $this->conn->prepare($sql);
        $result = $stmt->execute([
            ':ho_ten' => $data['ho_ten'] ?? null,
            ':email' => $data['email'],
            ':mat_khau' => $data['mat_khau'],
            ':so_dien_thoai' => $data['so_dien_thoai'] ?? null
        ]);
        
        return $result ? $this->conn->lastInsertId() : false;
    }

    /**
     * Cập nhật thông tin admin
     * @param int $id - ID admin
     * @param array $data - Dữ liệu cập nhật
     * @return bool
     */
    public function update($id, $data) {
        $allowedColumns = ['ho_ten', 'email', 'mat_khau', 'so_dien_thoai'];
        $updateData = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedColumns)) {
                $updateData[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        if (empty($updateData)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $updateData) . 
               " WHERE {$this->primaryKey} = :id";
        $params[':id'] = $id;

        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Tìm admin theo email
     * @param string $email
     * @return array|null
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Kiểm tra email đã tồn tại
     * @param string $email
     * @return bool
     */
    public function emailExists($email) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result['count'] > 0;
    }

    /**
     * Lấy tất cả admin (phân trang)
     * @param int $page - Trang hiện tại (mặc định 1)
     * @param int $limit - Số bản ghi mỗi trang (mặc định 10)
     * @return array
     */
    public function paginate($page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT * FROM {$this->table} ORDER BY ngay_tao DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Đếm tổng số admin
     * @return int
     */
    public function countAll() {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }

    /**
     * Cập nhật mật khẩu admin
     * @param int $id
     * @param string $new_password - Mật khẩu đã mã hóa
     * @return bool
     */
    public function updatePassword($id, $new_password) {
        $sql = "UPDATE {$this->table} SET mat_khau = ? WHERE {$this->primaryKey} = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$new_password, $id]);
    }
}
?>
