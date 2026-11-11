<?php
require_once __DIR__ . '/../core/Env.php';

class EmailService
{
    private static function getConfig()
    {
        return [
            'apiKey' => trim((string)Env::get('BREVO_API_KEY', '')),
            'fromEmail' => trim((string)Env::get('BREVO_FROM_EMAIL', '')),
            'fromName' => Env::get('BREVO_FROM_NAME', 'Trung Tâm Gia Sư'),
        ];
    }

    public static function sendOTP(string $toEmail, string $otp, string $type = 'register'): bool
    {
        $subject = self::getSubject($type);
        $body = self::getOTPTemplate($otp, $type);
        
        return self::send($toEmail, $subject, $body);
    }

    public static function send(string $to, string $subject, string $body): bool
    {
        $config = self::getConfig();
        if ($config['apiKey'] === '' || $config['fromEmail'] === '') {
            error_log('Brevo email configuration is missing BREVO_API_KEY or BREVO_FROM_EMAIL');
            return false;
        }

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            error_log('Brevo rejected invalid recipient email address');
            return false;
        }

        $payload = json_encode([
            'sender' => [
                'name' => $config['fromName'],
                'email' => $config['fromEmail'],
            ],
            'to' => [
                ['email' => $to],
            ],
            'subject' => $subject,
            'htmlContent' => $body,
        ], JSON_UNESCAPED_UNICODE);

        if ($payload === false) {
            error_log('Unable to encode Brevo email payload');
            return false;
        }

        $curl = curl_init('https://api.brevo.com/v3/smtp/email');
        if ($curl === false) {
            error_log('Unable to initialize cURL for Brevo');
            return false;
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'accept: application/json',
                'api-key: ' . $config['apiKey'],
                'content-type: application/json',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 20,
        ]);

        $response = curl_exec($curl);
        $curlError = curl_error($curl);
        $httpCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($response === false) {
            error_log('Brevo request failed: ' . $curlError);
            return false;
        }

        if ($httpCode < 200 || $httpCode >= 300) {
            error_log('Brevo API rejected email with HTTP ' . $httpCode . ': ' . $response);
            return false;
        }

        return true;
    }

    private static function getSubject(string $type): string
    {
        switch ($type) {
            case 'register':
                return 'Mã xác nhận đăng ký - Trung Tâm Gia Sư';
            case 'login':
                return 'Mã xác nhận đăng nhập - Trung Tâm Gia Sư';
            case 'reset_password':
                return 'Mã đặt lại mật khẩu - Trung Tâm Gia Sư';
            default:
                return 'Mã xác nhận - Trung Tâm Gia Sư';
        }
    }

    private static function getOTPTemplate(string $otp, string $type): string
    {
        $typeText = match($type) {
            'register' => 'đăng ký tài khoản',
            'login' => 'đăng nhập',
            'reset_password' => 'đặt lại mật khẩu',
            default => 'xác minh'
        };

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">
            Trung Tâm Gia Sư
        </h2>
        
        <p style="color: #333; font-size: 16px;">Xin chào,</p>
        
        <p style="color: #333; font-size: 16px;">
            Mã OTP để {$typeText} của bạn là:
        </p>
        
        <div style="background: #3b82f6; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            {$otp}
        </div>
        
        <p style="color: #666; font-size: 14px;">
            ⏰ Mã này có hiệu lực trong <strong>5 phút</strong>.
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </p>
    </div>
</body>
</html>
HTML;
    }
}
