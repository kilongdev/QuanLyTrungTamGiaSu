<?php
class Database
{
    private static $host = 'localhost';
    private static $dbName = 'quanlytrungtamgiasu';
    private static $username = 'root';
    private static $password = '';
    private static $charset = 'utf8mb4';
    private static $connection = null;

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

    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public static function lastInsertId(): string
    {
        return self::getConnection()->lastInsertId();
    }

    public static function beginTransaction(): void
    {
        self::getConnection()->beginTransaction();
    }

    public static function commit(): void
    {
        self::getConnection()->commit();
    }

    public static function rollback(): void
    {
        self::getConnection()->rollBack();
    }

    public static function close(): void
    {
        self::$connection = null;
    }
}
