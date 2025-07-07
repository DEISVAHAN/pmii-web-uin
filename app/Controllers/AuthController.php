<?php
// app/controllers/AuthController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class AuthController
{
    private $authService;
    private $request;
    private $response;

    public function __construct()
    {
        // Inisialisasi AuthService yang akan menangani logika bisnis autentikasi
        $this->authService = new AuthService();
        // Inisialisasi objek Request untuk mengambil data permintaan
        $this->request = new Request();
        // Inisialisasi objek Response untuk mengirim respons HTTP
        $this->response = new Response();
    }

    /**
     * Menangani permintaan login pengguna.
     * Endpoint: POST /api/auth/login
     *
     * Metode ini mengambil kredensial dari body permintaan, memverifikasinya
     * melalui AuthService, dan mengembalikan token autentikasi serta data pengguna.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function login()
    {
        $requestData = $this->request->getBody(); // Mengambil body JSON dari Request

        $email = $requestData['email'] ?? null;
        $password = $requestData['password'] ?? null;

        // Validasi input dasar
        if (!$email || !$password) {
            return $this->response->json(['message' => 'Email dan password wajib diisi.'], 400);
        }

        try {
            // Memverifikasi kredensial melalui AuthService
            $user = $this->authService->verifyCredentials($email, $password);

            if ($user) {
                // Jika verifikasi berhasil, generate token autentikasi
                $token = $this->authService->generateAuthToken($user);

                // Catat aktivitas login (uncomment jika SystemActivityLog diaktifkan)
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Login',
                //     'description' => 'Pengguna ' . $user['name'] . ' berhasil login.',
                //     'user_id' => $user['id'],
                //     'user_name' => $user['name'],
                //     'user_role' => $user['role'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Mengirim respons sukses dengan token dan data pengguna
                return $this->response->json([
                    'message' => 'Login berhasil!',
                    'token' => $token,
                    'user' => $user // Data pengguna (tanpa password hash) untuk disimpan di frontend
                ], 200);
            } else {
                // Mengirim respons error jika kredensial tidak valid
                return $this->response->json(['message' => 'Email atau password tidak valid.'], 401);
            }
        } catch (\Exception $e) {
            // Menangani error umum atau error dari AuthService
            error_log("Controller Error in login: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat login.'], 500);
        }
    }

    /**
     * Menangani pendaftaran kader baru.
     * Endpoint: POST /api/auth/register
     *
     * Metode ini mengambil data pendaftaran dari body permintaan,
     * memvalidasinya, dan memanggil AuthService untuk proses registrasi.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function register()
    {
        $requestData = $this->request->getBody(); // Mengambil body JSON dari Request

        // Validasi input yang wajib diisi
        $requiredFields = ['name', 'nim_username', 'email', 'password', 'rayon_id', 'klasifikasi'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }
        // Validasi format email
        if (!filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response->json(['message' => 'Format email tidak valid.'], 400);
        }
        // Validasi panjang password
        if (strlen($requestData['password']) < 6) {
            return $this->response->json(['message' => 'Password minimal 6 karakter.'], 400);
        }

        try {
            // Mempersiapkan data untuk model User
            $userData = [
                'name' => $requestData['name'],
                'nim_username' => $requestData['nim_username'],
                'email' => $requestData['email'],
                'password' => $requestData['password'], // Password akan di-hash di AuthService
                'role' => 'kader', // Peran default untuk pendaftaran ini
                'rayon_id' => $requestData['rayon_id'],
                'klasifikasi' => $requestData['klasifikasi'],
            ];
            // Mempersiapkan data untuk model KaderProfile (jika ada data tambahan dari form)
            $kaderProfileData = [
                'no_hp' => $requestData['no_hp'] ?? null,
                // Tambahkan field profil kader lainnya jika dikirim dari frontend
            ];

            // Memanggil AuthService untuk mendaftarkan pengguna baru
            $registeredUser = $this->authService->registerUser($userData, $kaderProfileData);

            // Mengirim respons sukses
            return $this->response->json(['message' => 'Pendaftaran kader berhasil!', 'user' => $registeredUser], 201);

        } catch (\Exception $e) {
            // Menangani error dari AuthService (misalnya duplikasi email/NIM)
            $statusCode = 500; // Default error server
            if ($e->getCode() === 409) { // Kode 409 untuk konflik (data duplikat)
                $statusCode = 409;
            }
            error_log("Controller Error in register: " . $e->getMessage());
            return $this->response->json(['message' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Menangani permintaan lupa password.
     * Endpoint: POST /api/auth/forgot-password
     *
     * Metode ini mengambil identifier (email/NIM/username) dari body permintaan,
     * dan memanggil AuthService untuk memproses permintaan reset password.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function forgotPassword()
    {
        $requestData = $this->request->getBody();

        $identifier = $requestData['identifier'] ?? null;
        $userType = $requestData['user_type'] ?? null;

        // Validasi input
        if (!$identifier) {
            return $this->response->json(['message' => 'Mohon masukkan identifier (email/username/NIM).'], 400);
        }

        try {
            // Memanggil AuthService untuk menangani lupa password
            $success = $this->authService->handleForgotPassword($identifier, $userType);
            // Untuk keamanan, selalu berikan pesan generik bahkan jika pengguna tidak ditemukan
            return $this->response->json(['message' => 'Jika akun Anda terdaftar, instruksi reset password telah dikirim ke email Anda.'], 200);
        } catch (\Exception $e) {
            error_log("Controller Error in forgotPassword: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memproses permintaan lupa password.'], 500);
        }
    }

    /**
     * Menangani proses reset password dari tautan email.
     * Endpoint: POST /api/auth/reset-password
     *
     * Metode ini mengambil token, email, dan password baru dari body permintaan,
     * dan memanggil AuthService untuk mereset password pengguna.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function resetPassword()
    {
        $requestData = $this->request->getBody();

        $token = $requestData['token'] ?? null;
        $email = $requestData['email'] ?? null;
        $newPassword = $requestData['new_password'] ?? null;

        // Validasi input
        if (!$token || !$email || strlen($newPassword) < 6) {
            return $this->response->json(['message' => 'Token, email, atau password baru tidak valid.'], 400);
        }

        try {
            // Memanggil AuthService untuk mereset password
            $success = $this->authService->resetPasswordWithToken($token, $email, $newPassword);
            return $this->response->json(['message' => 'Password berhasil direset. Silakan login dengan password baru Anda.'], 200);
        } catch (\Exception $e) {
            // Menangani error dari AuthService (misalnya token tidak valid/kedaluwarsa)
            $statusCode = 500;
            if ($e->getCode() === 400) { // Bad Request dari Service
                $statusCode = 400;
            }
            error_log("Controller Error in resetPassword: " . $e->getMessage());
            return $this->response->json(['message' => $e->getMessage()], $statusCode);
        }
    }
}
