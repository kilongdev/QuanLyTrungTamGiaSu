<?php

declare(strict_types=1);

final class Database
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }

        $config = require __DIR__ . '/../../config/database.php';

        $host = $config['host'] ?? '127.0.0.1';
        $port = (int)($config['port'] ?? 3306);
        $db = $config['database'] ?? '';
        $charset = $config['charset'] ?? 'utf8mb4';
        $user = $config['username'] ?? '';
        $pass = $config['password'] ?? '';

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";

        self::$pdo = new \PDO($dsn, $user, $pass, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        return self::$pdo;
    }
}
