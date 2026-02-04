<?php
/**
 * Model Admin
 * Xử lý các truy vấn database liên quan đến admin
 */

class Admin
{
    /**
     * Tìm admin theo số điện thoại
     */
    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT admin_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'admin' as role 
             FROM admin WHERE so_dien_thoai = ?",
            [$phone]
        );
    }

    /**
     * Tìm admin theo email
     */
    public static function findByEmail(string $email): ?array
    {
        return Database::queryOne(
            "SELECT admin_id FROM admin WHERE email = ?",
            [$email]
        );
    }

    /**
     * Tìm admin theo email để đăng nhập (trả về đầy đủ thông tin)
     */
    public static function findByEmailForLogin(string $email): ?array
    {
        return Database::queryOne(
            "SELECT admin_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'admin' as role 
             FROM admin WHERE email = ?",
            [$email]
        );
    }

    /**
     * Lấy thông tin chi tiết admin
     */
    public static function getDetails(int $userId): ?array
    {
        return Database::queryOne(
            "SELECT admin_id, ho_ten, email FROM admin WHERE admin_id = ?",
            [$userId]
        );
    }
}
