<?php
// app/controllers/UserController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;    // Sertakan model User
// use App\Models\KaderProfile; // Jika perlu berinteraksi dengan model KaderProfile
// use App\Models\Rayon;       // Jika perlu berinteraksi dengan model Rayon
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class UserController
{
    private $request;
    private $response;
    private $db; // Instance Database, jika Model tidak sepenuhnya ORM

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
    }

    /**
     * Mengambil daftar semua pengguna.
     * Endpoint: GET /api/users
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            // Mengambil semua pengguna dari database
            $users = $this->db->fetchAll("SELECT id, name, nim_username, email, role, jabatan, rayon_id, klasifikasi, status_akun, last_login FROM users");

            // Jika perlu, gabungkan dengan data profil kader atau rayon
            foreach ($users as &$user) {
                if ($user['role'] === 'kader') {
                    // Ambil data profil kader dari tabel kaders_profile
                    $kaderProfile = $this->db->fetch("SELECT no_hp, profile_picture_url FROM kaders_profile WHERE user_id = :user_id", ['user_id' => $user['id']]);
                    if ($kaderProfile) {
                        $user = array_merge($user, $kaderProfile);
                    }
                }
                // Ubah rayon_id menjadi nama rayon jika ada
                if ($user['rayon_id']) {
                    $rayon = $this->db->fetch("SELECT name FROM rayons WHERE id = :id", ['id' => $user['rayon_id']]);
                    if ($rayon) {
                        $user['rayon_name'] = $rayon['name'];
                    }
                }
            }
            unset($user); // Putuskan referensi terakhir

            return $this->response->json($users, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil data pengguna.'], 500);
        }
    }

    /**
     * Menambahkan pengguna baru.
     * Endpoint: POST /api/users
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses dari middleware autentikasi
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['name', 'email', 'password', 'role'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }
        if (!filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response->json(['message' => 'Format email tidak valid.'], 400);
        }
        if (strlen($requestData['password']) < 6) {
            return $this->response->json(['message' => 'Password minimal 6 karakter.'], 400);
        }

        try {
            // Cek duplikasi email atau nim_username
            $existingUser = $this->db->fetch("SELECT id FROM users WHERE email = :email OR nim_username = :nim_username", [
                'email' => $requestData['email'],
                'nim_username' => $requestData['nim_username'] ?? null
            ]);
            if ($existingUser) {
                return $this->response->json(['message' => 'Email atau NIM/Username sudah terdaftar.'], 409);
            }

            $hashedPassword = password_hash($requestData['password'], PASSWORD_DEFAULT);
            $userId = uniqid('user_'); // ID unik

            $userData = [
                'id' => $userId,
                'name' => $requestData['name'],
                'nim_username' => $requestData['nim_username'] ?? null,
                'email' => $requestData['email'],
                'password' => $hashedPassword,
                'role' => $requestData['role'],
                'jabatan' => $requestData['jabatan'] ?? null,
                'rayon_id' => $requestData['rayon_id'] ?? null,
                'klasifikasi' => $requestData['klasifikasi'] ?? null,
                'status_akun' => $requestData['status_akun'] ?? 'aktif',
                'profile_visibility' => $requestData['profile_visibility'] ?? true,
                'notification_emails' => $requestData['notification_emails'] ?? true,
            ];

            // Panggil metode create dari Model User
            $newUserId = User::create($userData);

            if ($newUserId) {
                // Jika role adalah kader, buat juga entri di kaders_profile
                if ($requestData['role'] === 'kader') {
                    // Asumsi KaderProfile::create menerima user_id dan data lainnya
                    // Anda mungkin perlu memfilter data requestData agar sesuai dengan fillable KaderProfile
                    // $kaderProfileData = ['user_id' => $newUserId]; // Tambahkan data awal jika ada
                    // \App\Models\KaderProfile::create($kaderProfileData);
                }

                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create User',
                //     'description' => 'Pengguna baru ' . $requestData['name'] . ' (Role: ' . $requestData['role'] . ') ditambahkan.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown', // ID admin yang melakukan aksi
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Pengguna berhasil ditambahkan!', 'id' => $newUserId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal menambahkan pengguna.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menambahkan pengguna.'], 500);
        }
    }

    /**
     * Mengambil detail pengguna berdasarkan ID.
     * Endpoint: GET /api/users/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'user_123'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID pengguna tidak ditemukan.'], 400);
        }

        try {
            $user = $this->db->fetch("SELECT id, name, nim_username, email, role, jabatan, rayon_id, klasifikasi, status_akun, last_login, profile_visibility, notification_emails FROM users WHERE id = :id", ['id' => $id]);

            if ($user) {
                // Jika kader, gabungkan dengan data profil kader
                if ($user['role'] === 'kader') {
                    $kaderProfile = $this->db->fetch("SELECT * FROM kaders_profile WHERE user_id = :user_id", ['user_id' => $user['id']]);
                    if ($kaderProfile) {
                        $user = array_merge($user, $kaderProfile);
                        unset($user['user_id']); // Hapus duplikasi user_id
                    }
                }
                // Ubah rayon_id menjadi nama rayon jika ada
                if ($user['rayon_id']) {
                    $rayon = $this->db->fetch("SELECT name FROM rayons WHERE id = :id", ['id' => $user['rayon_id']]);
                    if ($rayon) {
                        $user['rayon_name'] = $rayon['name'];
                    }
                }

                return $this->response->json($user, 200);
            } else {
                return $this->response->json(['message' => 'Pengguna tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail pengguna.'], 500);
        }
    }

    /**
     * Memperbarui informasi pengguna.
     * Endpoint: PUT /api/users/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'user_123'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID pengguna tidak ditemukan.'], 400);
        }

        // Validasi input (minimal)
        if (empty($requestData['name']) || empty($requestData['email']) || empty($requestData['role'])) {
            return $this->response->json(['message' => 'Nama, email, dan peran wajib diisi.'], 400);
        }
        if (!filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response->json(['message' => 'Format email tidak valid.'], 400);
        }

        try {
            // Cek duplikasi email atau nim_username (kecuali untuk user itu sendiri)
            $existingUserWithEmailOrNim = $this->db->fetch("SELECT id FROM users WHERE (email = :email OR nim_username = :nim_username) AND id != :id", [
                'email' => $requestData['email'],
                'nim_username' => $requestData['nim_username'] ?? null,
                'id' => $id
            ]);
            if ($existingUserWithEmailOrNim) {
                return $this->response->json(['message' => 'Email atau NIM/Username sudah digunakan oleh pengguna lain.'], 409);
            }

            // Data untuk tabel users
            $userData = [
                'name' => $requestData['name'],
                'nim_username' => $requestData['nim_username'] ?? null,
                'email' => $requestData['email'],
                'role' => $requestData['role'],
                'jabatan' => $requestData['jabatan'] ?? null,
                'rayon_id' => $requestData['rayon_id'] ?? null,
                'klasifikasi' => $requestData['klasifikasi'] ?? null,
                'status_akun' => $requestData['status_akun'] ?? 'aktif',
                'profile_visibility' => $requestData['profile_visibility'] ?? true,
                'notification_emails' => $requestData['notification_emails'] ?? true,
            ];

            // Panggil metode update dari Model User
            $updated = User::update($id, $userData);

            if ($updated) {
                // Jika role adalah kader, perbarui juga entri di kaders_profile
                if ($requestData['role'] === 'kader') {
                    // Asumsi KaderProfile::update menerima user_id dan data
                    // Anda mungkin perlu memfilter data requestData agar sesuai dengan fillable KaderProfile
                    // $kaderProfileData = $requestData; // Gunakan requestData penuh atau filter
                    // \App\Models\KaderProfile::update($id, $kaderProfileData);
                }

                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update User',
                //     'description' => 'Pengguna dengan ID ' . $id . ' diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Informasi pengguna berhasil diperbarui.'], 200);
            } else {
                $userExists = User::find($id); // Cek apakah user memang ada
                if (!$userExists) {
                    return $this->response->json(['message' => 'Pengguna tidak ditemukan.'], 404);
                }
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui pengguna.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui pengguna.'], 500);
        }
    }

    /**
     * Menghapus pengguna.
     * Endpoint: DELETE /api/users/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'user_123'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID pengguna tidak ditemukan.'], 400);
        }

        // Pencegahan penghapusan diri sendiri (opsional)
        // if ($loggedInUser && $loggedInUser['user_id'] === $id) {
        //     return $this->response->json(['message' => 'Anda tidak dapat menghapus akun Anda sendiri melalui API ini.'], 403);
        // }

        try {
            // Hapus juga profil kader jika ada (pastikan foreign key di DB diatur CASCADE atau SET NULL)
            // \App\Models\KaderProfile::delete($id); // Asumsi KaderProfile memiliki metode delete by user_id

            $deleted = User::delete($id); // Menghapus pengguna menggunakan Model User

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete User',
                //     'description' => 'Pengguna dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Pengguna berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Pengguna tidak ditemukan atau gagal menghapus.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus pengguna.'], 500);
        }
    }

    /**
     * Mereset password pengguna lain (oleh admin).
     * Endpoint: POST /api/users/{id}/reset-password
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'user_123'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function resetPassword($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        $newPassword = $requestData['new_password'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id || strlen($newPassword) < 6) {
            return $this->response->json(['message' => 'ID pengguna atau password baru tidak valid.'], 400);
        }

        try {
            $user = User::find($id);
            if (!$user) {
                return $this->response->json(['message' => 'Pengguna tidak ditemukan.'], 404);
            }

            $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $updated = User::updatePasswordByEmail($user['email'], $hashedNewPassword); // Gunakan email untuk update

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Reset User Password',
                //     'description' => 'Password pengguna ' . $user['name'] . ' (ID: ' . $id . ') direset oleh admin.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Password pengguna berhasil direset.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal mereset password pengguna.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in UserController@resetPassword: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mereset password pengguna.'], 500);
        }
    }
}
