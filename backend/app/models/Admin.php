<?php
class Admin
{
    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT admin_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'admin' as role 
             FROM admin WHERE so_dien_thoai = ?",
            [$phone]
        );
    }

    public static function findByEmail(string $email): ?array
    {
        return Database::queryOne(
            "SELECT admin_id FROM admin WHERE email = ?",
            [$email]
        );
    }

    public static function findByEmailForLogin(string $email): ?array
    {
        return Database::queryOne(
            "SELECT admin_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'admin' as role 
             FROM admin WHERE email = ?",
            [$email]
        );
    }

    public static function getDetails(int $userId): ?array
    {
        return Database::queryOne(
            "SELECT admin_id, ho_ten, email FROM admin WHERE admin_id = ?",
            [$userId]
        );
    }
}
