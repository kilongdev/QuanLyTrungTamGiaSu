# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM php:8.2-apache

ENV DEBIAN_FRONTEND=noninteractive
ENV APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2

RUN apt-get update && apt-get install -y \
    mariadb-server \
    mariadb-client \
    default-mysql-client \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_mysql mysqli zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html/QuanLyTrungTamGiaSu
COPY . /var/www/html/QuanLyTrungTamGiaSu
COPY --from=frontend-builder /app/frontend/dist /var/www/html/
COPY docker/web/api/ /var/www/html/api/
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/start.sh /usr/local/bin/start-app

# Keep backend routing compatible with front-controller pattern.
RUN printf '%s\n' \
    '<Directory /var/www/html/QuanLyTrungTamGiaSu/backend>' \
    '    Options Indexes FollowSymLinks' \
    '    AllowOverride All' \
    '    Require all granted' \
    '    RewriteEngine On' \
    '    RewriteCond %{REQUEST_FILENAME} !-f' \
    '    RewriteCond %{REQUEST_FILENAME} !-d' \
    '    RewriteRule ^ public/index.php [QSA,L]' \
    '</Directory>' \
    > /etc/apache2/conf-available/app.conf \
    && a2enconf app

RUN chmod +x /usr/local/bin/start-app \
    && mkdir -p /run/mysqld /var/log/mysql /var/lib/mysql \
    && chown -R mysql:mysql /run/mysqld /var/log/mysql /var/lib/mysql \
    && composer install --working-dir=/var/www/html/QuanLyTrungTamGiaSu/backend --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80 3306

CMD ["start-app"]
