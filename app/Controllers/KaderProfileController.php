<?php
// app/controllers/KaderProfileController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\KaderProfile; // Sertakan model KaderProfile
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class KaderProfileController
{
    private $request;
    private $response;
    private $db;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
    }

    /**
     * Mengambil detail profil kader berdasarkan user_id.
     * Endpoint: GET /api/kaders/profile/{user_id}
     * Memerlukan autentikasi.
     *
     * @param array $params Parameter dari URL (mis. ['user_id' => 'user_123'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $userId = $params['user_id'] ?? null;
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$userId) {
            return $this->response->json(['message' => 'User ID tidak ditemukan.'], 400);
        }

        // Otorisasi: Kader hanya bisa melihat profilnya sendiri, admin komisariat/rayon bisa melihat semua
        // if ($loggedInUser && $loggedInUser['user_role'] === 'kader' && $loggedInUser['user_id'] !== $userId) {
        //     return $this->response->json(['message' => 'Anda tidak diizinkan melihat profil kader lain.'], 403);
        // }

        try {
            $kaderProfile = KaderProfile::findByUserId($userId);

            if ($kaderProfile) {
                // Opsional: Gabungkan dengan data user utama jika diperlukan
                // $user = \App\Models\User::find($userId);
                // if ($user) {
                //     $kaderProfile['user_name'] = $user['name'];
                //     $kaderProfile['user_email'] = $user['email'];
                //     $kaderProfile['user_role'] = $user['role'];
                // }
                return $this->response->json($kaderProfile, 200);
            } else {
                return $this->response->json(['message' => 'Profil kader tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KaderProfileController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil profil kader.'], 500);
        }
    }

    /**
     * Memperbarui profil kader.
     * Endpoint: PUT /api/kaders/profile/{user_id}
     * Memerlukan autentikasi.
     *
     * @param array $params Parameter dari URL (user_id)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $userId = $params['user_id'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$userId) {
            return $this->response->json(['message' => 'User ID tidak ditemukan.'], 400);
        }

        // Otorisasi: Kader hanya bisa mengedit profilnya sendiri, admin komisariat/rayon bisa mengedit semua
        // if ($loggedInUser && $loggedInUser['user_role'] === 'kader' && $loggedInUser['user_id'] !== $userId) {
        //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit profil kader lain.'], 403);
        // }

        // Validasi input (minimal)
        if (empty($requestData['nama']) && empty($requestData['no_hp'])) { // Contoh validasi
            return $this->response->json(['message' => 'Setidaknya nama atau nomor HP wajib diisi.'], 400);
        }

        try {
            $kaderProfile = KaderProfile::findByUserId($userId);
            $isNewProfile = false;
            if (!$kaderProfile) {
                // Jika profil belum ada, buat baru (opsional, tergantung alur aplikasi)
                $requestData['user_id'] = $userId; // Pastikan user_id ada di data untuk create
                $created = KaderProfile::create($requestData);
                if ($created) {
                    $isNewProfile = true;
                } else {
                    return $this->response->json(['message' => 'Gagal membuat profil kader baru.'], 500);
                }
            }

            if (!$isNewProfile) {
                $updated = KaderProfile::update($userId, $requestData);
            } else {
                $updated = true; // Sudah dibuat, anggap sukses update awal
            }


            if ($updated) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Update Kader Profile',
                //     'description' => 'Profil kader (User ID: ' . $userId . ') diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $userId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Profil kader berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui profil kader.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KaderProfileController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui profil kader.'], 500);
        }
    }
}
