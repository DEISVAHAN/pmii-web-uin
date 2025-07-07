<?php
// app/config/database.php

// File ini berisi konfigurasi untuk semua koneksi database Anda.
// Anda dapat menentukan koneksi yang berbeda untuk lingkungan yang berbeda
// (misalnya, pengembangan, pengujian, produksi).

return [
    /*
    |--------------------------------------------------------------------------
    | Koneksi Database Default
    |--------------------------------------------------------------------------
    |
    | Opsi koneksi database default ini menentukan koneksi mana yang akan
    | digunakan saat melakukan operasi database. Anda dapat menggantinya
    | di runtime atau dalam konfigurasi spesifik.
    |
    */
    'default' => env('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Koneksi Database
    |--------------------------------------------------------------------------
    |
    | Di sini Anda dapat mengkonfigurasi setiap koneksi database yang digunakan
    | oleh aplikasi Anda.
    |
    */
    'connections' => [

        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'), // Host database, diambil dari .env
            'port' => env('DB_PORT', '3306'),     // Port database, diambil dari .env
            'database' => env('DB_DATABASE', 'pmii_uin_bandung'), // Nama database, diambil dari .env
            'username' => env('DB_USERNAME', 'root'), // Username database, diambil dari .env
            'password' => env('DB_PASSWORD', ''),   // Password database, diambil dari .env
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '', // Prefiks tabel (opsional)
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // Anda bisa menambahkan koneksi database lain di sini jika diperlukan
        // 'pgsql' => [ ... ],
        // 'sqlite' => [ ... ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migrasi
    |--------------------------------------------------------------------------
    |
    | Folder migrasi ini berisi semua migrasi database Anda.
    | Ini adalah tempat di mana Anda akan menemukan semua skrip SQL
    | untuk membuat dan memodifikasi tabel database Anda.
    |
    */
    'migrations' => 'database/migrations',
];
