<?php
// app/middleware/AuthMiddleware.php

// Middleware ini bertanggung jawab untuk memverifikasi token autentikasi
// yang dikirimkan dengan setiap permintaan yang dilindungi.

// Asumsi:
// 1. Ada kelas AuthService yang menangani verifikasi token.
// 2. Ada kelas atau fungsi untuk mencatat log aktivitas (mis. SystemActivityLog).

require_once __DIR__ . '/../services/AuthService.php'; // Sertakan AuthService
// require_once __DIR__ . '/../models/SystemActivityLog.php'; // Jika ada model untuk log aktivitas
// require_once __DIR__ . '/../models/User.php'; // Jika perlu memuat data user ke request

class AuthMiddleware
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * Metode handle untuk middleware.
     * Mencegat permintaan dan memverifikasi token autentikasi.
     *
     * @param callable $next Fungsi callback untuk middleware/controller selanjutnya.
     * @return mixed Hasil dari middleware/controller selanjutnya atau respons error.
     */
    public function handle(callable $next)
    {
        // Mendapatkan header Authorization
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader) {
            return $this->jsonResponse(['message' => 'Token autentikasi tidak ditemukan.'], 401);
        }

        // Token biasanya dalam format "Bearer YOUR_TOKEN_HERE"
        list($type, $token) = explode(' ', $authHeader, 2);

        if (strtolower($type) !== 'bearer' || !$token) {
            return $this->jsonResponse(['message' => 'Format token tidak valid (harus Bearer Token).'], 401);
        }

        try {
            // Memverifikasi token menggunakan AuthService
            $decodedToken = $this->authService->verifyAuthToken($token);

            if ($decodedToken) {
                // Token valid. Anda bisa melampirkan data pengguna ke objek permintaan
                // atau menyimpannya di variabel global/sesi untuk diakses oleh controller.
                // Contoh: $_SERVER['user_data'] = $decodedToken;

                // Catat aktivitas (opsional, jika setiap permintaan yang diautentikasi perlu dicatat)
                // SystemActivityLog::create([
                //     'activity_type' => 'API Access',
                //     'description' => 'Authenticated API access.',
                //     'user_id' => $decodedToken['user_id'] ?? null,
                //     'user_name' => $decodedToken['user_name'] ?? 'unknown',
                //     'user_role' => $decodedToken['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Panggil middleware/controller selanjutnya
                return $next();
            } else {
                return $this->jsonResponse(['message' => 'Token autentikasi tidak valid atau kedaluwarsa.'], 401);
            }
        } catch (Exception $e) {
            error_log("AuthMiddleware Error: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan saat memverifikasi token.'], 500);
        }
    }

    /**
     * Fungsi pembantu untuk mengirim respons JSON dan menghentikan eksekusi.
     *
     * @param array $data Data yang akan dienkode ke JSON
     * @param int $statusCode Kode status HTTP
     * @return void
     */
    private function jsonResponse($data, $statusCode)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }
}
