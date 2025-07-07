<?php
// app/middleware/RoleMiddleware.php

// Middleware ini bertanggung jawab untuk memverifikasi apakah pengguna yang sudah terautentikasi
// memiliki salah satu peran yang diizinkan untuk mengakses rute tertentu.

// Asumsi:
// 1. Ada mekanisme untuk mendapatkan data pengguna yang sudah diautentikasi (misalnya dari $_SERVER['user_data'] yang diatur oleh AuthMiddleware).
// 2. Ada kelas atau fungsi untuk mencatat log aktivitas (mis. SystemActivityLog).

require_once __DIR__ . '/../models/SystemActivityLog.php'; // Sertakan SystemActivityLog jika digunakan

class RoleMiddleware
{
    /**
     * Metode handle untuk middleware.
     * Memverifikasi peran pengguna yang diautentikasi.
     *
     * @param callable $next Fungsi callback untuk middleware/controller selanjutnya.
     * @param array $allowedRoles Array peran yang diizinkan (mis. ['komisariat', 'rayon']).
     * @return mixed Hasil dari middleware/controller selanjutnya atau respons error.
     */
    public function handle(callable $next, array $allowedRoles)
    {
        // Asumsi data pengguna yang diautentikasi tersedia dari AuthMiddleware
        $userData = $_SERVER['user_data'] ?? null; // Ambil data pengguna dari request/global

        if (!$userData || !isset($userData['user_role'])) {
            // Ini seharusnya tidak terjadi jika AuthMiddleware berjalan lebih dulu,
            // tetapi sebagai pengaman.
            return $this->jsonResponse(['message' => 'Unauthorized: User role not found.'], 401);
        }

        $userRole = $userData['user_role'];

        if (!in_array($userRole, $allowedRoles)) {
            // Catat aktivitas akses ditolak
            // SystemActivityLog::create([
            //     'activity_type' => 'Access Denied',
            //     'description' => 'User ' . $userData['user_name'] . ' (Role: ' . $userRole . ') attempted to access restricted resource. Required roles: ' . implode(', ', $allowedRoles) . '.',
            //     'user_id' => $userData['user_id'] ?? null,
            //     'user_name' => $userData['user_name'] ?? 'unknown',
            //     'user_role' => $userRole,
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);
            return $this->jsonResponse(['message' => 'Forbidden: Anda tidak memiliki izin untuk mengakses sumber daya ini.'], 403);
        }

        // Peran diizinkan, lanjutkan ke middleware/controller selanjutnya
        return $next();
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
