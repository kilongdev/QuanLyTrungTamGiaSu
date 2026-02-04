<?php
/**
 * Database Connection Class
 * Kết nối MySQL sử dụng PDO
 */

class Database
{
    // Thông tin kết nối - NÊN đặt trong file .env
    private static $host = 'localhost';
    private static $dbName = 'quanlytrungtamgiasu';
    private static $username = 'root';
    private static $password = ''; // XAMPP mặc định không có password
    private static $charset = 'utf8mb4';

    // Instance PDO
    private static $connection = null;

    /**
     * Lấy connection PDO (Singleton Pattern)
     * 
     * @return PDO
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . 
                       ";dbname=" . self::$dbName . 
                       ";charset=" . self::$charset;

                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ];

                self::$connection = new PDO(
                    $dsn,
                    self::$username,
                    self::$password,
                    $options
                );

            } catch (PDOException $e) {
                // Log error (không hiển thị chi tiết cho user)
                error_log("Database Connection Error: " . $e->getMessage());
                
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không thể kết nối database'
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }
        }

        return self::$connection;
    }

    /**
     * Thực thi query SELECT
     * 
     * @param string $sql Câu SQL
     * @param array $params Parameters cho prepared statement
     * @return array Kết quả
     */
    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Lấy một row
     * 
     * @param string $sql Câu SQL
     * @param array $params Parameters
     * @return array|null
     */
    public static function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Thực thi INSERT, UPDATE, DELETE
     * 
     * @param string $sql Câu SQL
     * @param array $params Parameters
     * @return int Số rows affected
     */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Lấy ID của row vừa insert
     * 
     * @return string
     */
    public static function lastInsertId(): string
    {
        return self::getConnection()->lastInsertId();
    }

    /**
     * Bắt đầu transaction
     */
    public static function beginTransaction(): void
    {
        self::getConnection()->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public static function commit(): void
    {
        self::getConnection()->commit();
    }

    /**
     * Rollback transaction
     */
    public static function rollback(): void
    {
        self::getConnection()->rollBack();
    }

    /**
     * Đóng connection
     */
    public static function close(): void
    {
        self::$connection = null;
    }
}
