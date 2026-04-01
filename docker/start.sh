#!/usr/bin/env bash
set -e

DB_NAME="${DB_NAME:-quanlytrungtamgiasu}"
SQL_DUMP="/var/www/html/QuanLyTrungTamGiaSu/database/quanlytrungtamgiasu.sql"

mkdir -p /run/mysqld /var/log/mysql /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/log/mysql /var/lib/mysql

if [ ! -d "/var/lib/mysql/mysql" ]; then
  mariadb-install-db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

mariadbd \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --socket=/run/mysqld/mysqld.sock \
  --pid-file=/run/mysqld/mysqld.pid \
  --skip-networking=0 \
  --bind-address=0.0.0.0 \
  --skip-grant-tables \
  --console \
  > /var/log/mysql/mysqld.log 2>&1 &

for i in $(seq 1 60); do
  if mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent >/dev/null 2>&1; then
  cat /var/log/mysql/mysqld.log || true
  echo "MariaDB failed to start"
  exit 1
fi

mysql -uroot -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

TABLE_COUNT=$(mysql -uroot -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';")
if [ "${TABLE_COUNT:-0}" = "0" ] && [ -f "$SQL_DUMP" ]; then
  mysql -uroot "$DB_NAME" < "$SQL_DUMP"
  echo "Imported database from $SQL_DUMP"
fi

if [ -f "/var/www/html/QuanLyTrungTamGiaSu/backend/composer.json" ] && [ ! -d "/var/www/html/QuanLyTrungTamGiaSu/backend/vendor" ]; then
  composer install --working-dir=/var/www/html/QuanLyTrungTamGiaSu/backend --no-interaction --prefer-dist || true
fi

exec apache2-foreground
