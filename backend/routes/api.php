<?php
Router::post('/auth/login', ['AuthController', 'login']);
Router::post('/auth/register', ['AuthController', 'register']);
Router::get('/auth/me', ['AuthController', 'me']);
Router::post('/auth/refresh', ['AuthController', 'refresh']);
Router::post('/auth/logout', ['AuthController', 'logout']);

Router::post('/otp/send', ['OTPController', 'sendEmail']);
Router::post('/otp/verify', ['OTPController', 'verify']);
