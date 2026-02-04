<?php
/**
 * OTP Service
 * Tạo và xác minh mã OTP
 */

class OTPService
{
    // Thời gian hết hạn OTP (5 phút)
    private static $expireMinutes = 5;
    
    // Độ dài OTP
    private static $otpLength = 6;

    /**
     * Tạo mã OTP mới
     * @param string $phone Số điện thoại
     * @param string $type Loại OTP: 'register', 'login', 'reset_password'
     * @return string Mã OTP
     */
    public static function generate(string $phone, string $type = 'register'): string
    {
        // Tạo mã OTP ngẫu nhiên
        $otp = str_pad(random_int(0, 999999), self::$otpLength, '0', STR_PAD_LEFT);
        
        // Thời gian hết hạn
        $expiresAt = date('Y-m-d H:i:s', strtotime('+' . self::$expireMinutes . ' minutes'));
        
        // Xóa OTP cũ của số điện thoại này
        Database::execute(
            "DELETE FROM otp WHERE so_dien_thoai = ? AND loai = ?",
            [$phone, $type]
        );
        
        // Lưu OTP mới
        Database::execute(
            "INSERT INTO otp (so_dien_thoai, ma_otp, loai, het_han, da_su_dung) 
             VALUES (?, ?, ?, ?, 0)",
            [$phone, $otp, $type, $expiresAt]
        );
        
        return $otp;
    }

    /**
     * Xác minh mã OTP
     * @param string $phone Số điện thoại
     * @param string $otp Mã OTP
     * @param string $type Loại OTP
     * @return bool
     */
    public static function verify(string $phone, string $otp, string $type = 'register'): bool
    {
        $record = Database::queryOne(
            "SELECT * FROM otp 
             WHERE so_dien_thoai = ? AND ma_otp = ? AND loai = ? 
             AND da_su_dung = 0 AND het_han > NOW()",
            [$phone, $otp, $type]
        );
        
        if (!$record) {
            return false;
        }
        
        // Đánh dấu đã sử dụng
        Database::execute(
            "UPDATE otp SET da_su_dung = 1 WHERE otp_id = ?",
            [$record['otp_id']]
        );
        
        return true;
    }

    /**
     * Xóa OTP đã hết hạn
     */
    public static function cleanup(): void
    {
        Database::execute("DELETE FROM otp WHERE het_han < NOW()");
    }
}
