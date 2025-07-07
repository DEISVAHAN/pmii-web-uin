<?php
// app/middleware/LogActivityMiddleware.php

// Middleware ini bertanggung jawab untuk mencatat aktivitas penting pengguna
// ke dalam tabel `system_activity_logs`.

// Asumsi:
// 1. Ada mekanisme untuk mendapatkan data pengguna yang sudah diautentikasi (misalnya dari $_SERVER['user_data']).
// 2. Ada model SystemActivityLog yang bisa diakses untuk menyimpan log.
// 3. Ada cara untuk mendapatkan informasi request (misalnya URI, metode).

require_once __DIR__ . '/../models/SystemActivityLog.php'; // Sertakan model SystemActivityLog

class LogActivityMiddleware
{
    /**
     * Metode handle untuk middleware.
     * Mencatat aktivitas ke log setelah permintaan diproses.
     *
     * @param callable $next Fungsi callback untuk middleware/controller selanjutnya.
     * @param array $logConfig Konfigurasi log (mis. ['type' => 'API Access', 'description' => 'Accessed API endpoint']).
     * @return mixed Hasil dari middleware/controller selanjutnya.
     */
    public function handle(callable $next, array $logConfig = [])
    {
        // Panggil middleware/controller selanjutnya terlebih dahulu
        // Ini memastikan bahwa logika utama permintaan sudah dieksekusi
        // sebelum logging aktivitas dilakukan.
        $response = $next();

        // Dapatkan data pengguna dari request (diasumsikan diatur oleh AuthMiddleware)
        $userData = $_SERVER['user_data'] ?? null;
        $userId = $userData['user_id'] ?? null;
        $userName = $userData['user_name'] ?? 'Guest';
        $userRole = $userData['user_role'] ?? 'guest';

        // Dapatkan informasi request
        $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
        $requestUri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';

        // Tentukan tipe aktivitas dan deskripsi default
        $activityType = $logConfig['activity_type'] ?? 'General Access';
        $description = $logConfig['description'] ?? "{$requestMethod} request to {$requestUri}";

        // Detail tambahan untuk log (opsional)
        $details = [
            'method' => $requestMethod,
            'uri' => $requestUri,
            // Anda bisa menambahkan request body, response status, dll. di sini
            // Namun, berhati-hatilah dengan data sensitif.
        ];

        try {
            SystemActivityLog::create([
                'activity_type' => $activityType,
                'description' => $description,
                'user_id' => $userId,
                'user_name' => $userName,
                'user_role' => $userRole,
                'target_id' => $logConfig['target_id'] ?? null, // ID spesifik jika ada (mis. ID berita, ID user)
                'timestamp' => date('Y-m-d H:i:s'),
                'ip_address' => $ipAddress,
                'details' => $details,
            ]);
        } catch (Exception $e) {
            // Jika logging gagal, catat ke error log PHP agar tidak mengganggu alur aplikasi utama
            error_log("Failed to log activity: " . $e->getMessage());
        }

        return $response; // Kembalikan respons dari middleware/controller selanjutnya
    }
}
