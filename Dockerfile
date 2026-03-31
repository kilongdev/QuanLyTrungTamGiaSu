# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM php:8.2-apache

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    mariadb-server \
    mariadb-client \
    libzip-dev \
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

RUN chmod +x /usr/local/bin/start-app \
    && mkdir -p /run/mysqld /var/log/mysql /var/lib/mysql \
    && chown -R mysql:mysql /run/mysqld /var/log/mysql /var/lib/mysql \
    && composer install --working-dir=/var/www/html/QuanLyTrungTamGiaSu/backend --no-interaction --prefer-dist || true \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80 3306

CMD ["start-app"]
