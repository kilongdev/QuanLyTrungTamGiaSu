<?php

/**
 * Environment Configuration Loader
 * Loads .env file and provides access to environment variables
 */
class Env
{
    private static $loaded = false;
    private static $vars = [];

    /**
     * Load .env file
     */
    public static function load(string $path = null): void
    {
        if (self::$loaded) {
            return;
        }

        if ($path === null) {
            $path = __DIR__ . '/../../.env';
        }

        if (!file_exists($path)) {
            error_log("Warning: .env file not found at {$path}");
            self::$loaded = true;
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments and empty lines
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                
                // Store in both $_ENV and class property
                $_ENV[$key] = $value;
                putenv("{$key}={$value}");
                self::$vars[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Get environment variable
     */
    public static function get(string $key, $default = null)
    {
        self::load();

        // Check in order: class vars, $_ENV, getenv()
        if (isset(self::$vars[$key])) {
            return self::$vars[$key];
        }

        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }

        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }

        return $default;
    }

    /**
     * Check if environment is production
     */
    public static function isProduction(): bool
    {
        return self::get('APP_ENV') === 'production';
    }

    /**
     * Check if environment is development
     */
    public static function isDevelopment(): bool
    {
        return self::get('APP_ENV') !== 'production';
    }
}

// Auto-load on require
Env::load();
