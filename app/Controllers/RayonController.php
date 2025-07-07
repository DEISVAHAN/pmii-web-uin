<?php
// app/controllers/RayonController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Rayon;   // Sertakan model Rayon
// use App\Models\User;    // Jika perlu berinteraksi dengan model User
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class RayonController
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
     * Mengambil daftar semua rayon.
     * Endpoint: GET /api/rayons
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            $rayons = Rayon::all(); // Mengambil semua rayon menggunakan Model Rayon
            if ($rayons === false) {
                return $this->response->json(['message' => 'Gagal mengambil data rayon.'], 500);
            }
            return $this->response->json($rayons, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in RayonController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil data rayon.'], 500);
        }
    }

    /**
     * Mengambil detail rayon berdasarkan ID.
     * Endpoint: GET /api/rayons/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'rayon_ushuluddin'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID rayon tidak ditemukan.'], 400);
        }

        try {
            $rayon = Rayon::find($id); // Mencari rayon berdasarkan ID menggunakan Model Rayon

            if ($rayon) {
                return $this->response->json($rayon, 200);
            } else {
                return $this->response->json(['message' => 'Rayon tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in RayonController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail rayon.'], 500);
        }
    }

    /**
     * Memperbarui profil rayon yang sudah ada.
     * Endpoint: PUT /api/rayons/{id}
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'rayon_ushuluddin'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses dari middleware autentikasi
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID rayon tidak ditemukan.'], 400);
        }

        // Validasi input (minimal)
        if (empty($requestData['name']) || empty($requestData['description'])) {
            return $this->response->json(['message' => 'Nama dan deskripsi rayon wajib diisi.'], 400);
        }

        // --- Logika Otorisasi (Contoh) ---
        // Jika user yang login adalah admin rayon, pastikan hanya bisa mengedit rayonnya sendiri
        // if ($loggedInUser && $loggedInUser['user_role'] === 'rayon' && $loggedInUser['rayon_id'] !== $id) {
        //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit rayon lain.'], 403);
        // }
        // Middleware 'RoleMiddleware:komisariat,rayon' sudah membantu, tapi validasi ID spesifik ini penting.

        try {
            $updated = Rayon::update($id, $requestData); // Memperbarui rayon menggunakan Model Rayon

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Rayon Profile',
                //     'description' => 'Profil rayon ' . $id . ' diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Profil rayon berhasil diperbarui.'], 200);
            } else {
                // Ini bisa berarti rayon tidak ditemukan atau tidak ada perubahan data
                $rayonExists = Rayon::find($id);
                if (!$rayonExists) {
                    return $this->response->json(['message' => 'Rayon tidak ditemukan.'], 404);
                }
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui profil rayon.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in RayonController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui profil rayon.'], 500);
        }
    }

    /**
     * Membuat rayon baru.
     * Endpoint: POST /api/rayons (Jika diizinkan oleh rute, biasanya hanya komisariat)
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        if (empty($requestData['id']) || empty($requestData['name']) || empty($requestData['description'])) {
            return $this->response->json(['message' => 'ID, nama, dan deskripsi rayon wajib diisi.'], 400);
        }

        try {
            // Cek duplikasi ID
            $existingRayon = Rayon::find($requestData['id']);
            if ($existingRayon) {
                return $this->response->json(['message' => 'ID rayon sudah ada.'], 409);
            }

            $newRayonId = Rayon::create($requestData); // Membuat rayon baru menggunakan Model Rayon

            if ($newRayonId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create Rayon',
                //     'description' => 'Rayon baru ' . $requestData['name'] . ' (ID: ' . $newRayonId . ') ditambahkan.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Rayon berhasil ditambahkan!', 'id' => $newRayonId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal menambahkan rayon.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in RayonController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menambahkan rayon.'], 500);
        }
    }

    /**
     * Menghapus rayon.
     * Endpoint: DELETE /api/rayons/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'rayon_ushuluddin'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID rayon tidak ditemukan.'], 400);
        }

        try {
            $deleted = Rayon::delete($id); // Menghapus rayon menggunakan Model Rayon

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Rayon',
                //     'description' => 'Rayon dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Rayon berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Rayon tidak ditemukan atau gagal menghapus.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in RayonController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus rayon.'], 500);
        }
    }
}
