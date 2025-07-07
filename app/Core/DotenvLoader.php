<?php
// app/core/DotenvLoader.php

// Kelas ini bertanggung jawab untuk memuat variabel lingkungan dari file .env.

namespace App\Core;

use Dotenv\Dotenv;

class DotenvLoader
{
    /**
     * Memuat variabel lingkungan dari file .env.
     * Harus dipanggil di awal aplikasi.
     */
    public static function load(): void
    {
        // Path ke direktori root proyek (tempat file .env berada)
        $rootPath = dirname(__DIR__, 2); // Dua level ke atas dari app/core

        // Periksa apakah file .env ada
        if (!file_exists($rootPath . '/.env')) {
            error_log(".env file not found at " . $rootPath);
            // Dalam produksi, Anda mungkin ingin menghentikan aplikasi atau menggunakan nilai default.
            return;
        }

        try {
            $dotenv = Dotenv::createImmutable($rootPath);
            $dotenv->load();
        } catch (\Exception $e) {
            error_log("Failed to load .env file: " . $e->getMessage());
            // Dalam produksi, ini bisa menjadi error fatal.
            die("Application configuration error.");
        }
    }
}
