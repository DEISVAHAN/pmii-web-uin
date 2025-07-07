<?php
// app/controllers/ScientificWorkController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\ScientificWork; // Sertakan model ScientificWork
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class ScientificWorkController
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
     * Mengambil semua karya ilmiah.
     * Endpoint: GET /api/scientific-works/all (untuk admin) atau /api/scientific-works (untuk publik yang disetujui)
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        $filters = [
            'type' => $queryParams['type'] ?? null,
            'status' => $queryParams['status'] ?? 'approved', // Default: hanya yang disetujui untuk publik
            'author_user_id' => $queryParams['author_user_id'] ?? null,
            'search' => $queryParams['search'] ?? null,
        ];

        // Jika yang mengakses adalah admin komisariat, mereka bisa melihat semua status
        // if ($loggedInUser && $loggedInUser['user_role'] === 'komisariat') {
        //     unset($filters['status']); // Hapus filter status default
        //     if (isset($queryParams['status'])) { // Tapi hormati filter status jika admin spesifik meminta
        //         $filters['status'] = $queryParams['status'];
        //     }
        // }

        try {
            $scientificWorks = ScientificWork::all($filters);
            if ($scientificWorks === false) {
                return $this->response->json(['message' => 'Gagal mengambil data karya ilmiah.'], 500);
            }

            // Opsional: Gabungkan dengan nama pengguna pengunggah
            // foreach ($scientificWorks as &$work) {
            //     if ($work['author_user_id']) {
            //         $user = \App\Models\User::find($work['author_user_id']);
            //         if ($user) $work['author_user_name'] = $user['name'];
            //     }
            // }
            // unset($work);

            return $this->response->json($scientificWorks, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil karya ilmiah.'], 500);
        }
    }

    /**
     * Mengambil daftar karya ilmiah yang diunggah oleh pengguna yang login.
     * Endpoint: GET /api/scientific-works/my
     * Memerlukan autentikasi (kader atau admin).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function myWorks()
    {
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // if (!$loggedInUser) {
        //     return $this->response->json(['message' => 'Unauthorized.'], 401);
        // }

        $queryParams = $this->request->getQueryParams();
        try {
            $filters = [
                'author_user_id' => $loggedInUser['user_id'],
                // Mungkin juga ingin melihat semua status (pending, approved, rejected)
                // unset($filters['status']); // Hapus filter status default
            ];
            $scientificWorks = ScientificWork::all($filters);
            if ($scientificWorks === false) {
                return $this->response->json(['message' => 'Gagal mengambil data karya ilmiah Anda.'], 500);
            }
            return $this->response->json($scientificWorks, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@myWorks: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil karya ilmiah Anda.'], 500);
        }
    }

    /**
     * Mengambil detail karya ilmiah berdasarkan ID.
     * Endpoint: GET /api/scientific-works/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID karya ilmiah tidak ditemukan.'], 400);
        }

        try {
            $scientificWork = ScientificWork::find($id);

            if ($scientificWork) {
                // Opsional: Gabungkan dengan nama pengguna pengunggah
                // if ($scientificWork['author_user_id']) {
                //     $user = \App\Models\User::find($scientificWork['author_user_id']);
                //     if ($user) $scientificWork['author_user_name'] = $user['name'];
                // }
                return $this->response->json($scientificWork, 200);
            } else {
                return $this->response->json(['message' => 'Karya ilmiah tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail karya ilmiah.'], 500);
        }
    }

    /**
     * Mengunggah karya ilmiah baru.
     * Endpoint: POST /api/scientific-works
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['title', 'author_name', 'type', 'file_url'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        try {
            $dataToCreate = [
                'title' => $requestData['title'],
                'author_name' => $requestData['author_name'],
                'author_user_id' => $loggedInUser['user_id'] ?? null, // ID pengguna yang mengajukan
                'type' => $requestData['type'],
                'abstract' => $requestData['abstract'] ?? null,
                'publication_year' => $requestData['publication_year'] ?? null,
                'publisher' => $requestData['publisher'] ?? null,
                'isbn' => $requestData['isbn'] ?? null,
                'file_url' => $requestData['file_url'],
                'upload_date' => $requestData['upload_date'] ?? date('Y-m-d'),
                'status' => 'pending', // Default status saat diunggah
            ];

            $newWorkId = ScientificWork::create($dataToCreate);

            if ($newWorkId) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Upload Scientific Work',
                //     'description' => 'Karya ilmiah baru "' . $requestData['title'] . '" (Tipe: ' . $requestData['type'] . ') diunggah.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newWorkId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat
                // \App\Services\NotificationService::sendNotification('Unggahan Karya Ilmiah Baru', 'Karya ilmiah baru diunggah oleh ' . ($loggedInUser['user_name'] ?? 'Pengguna') . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Karya ilmiah berhasil diunggah!', 'id' => $newWorkId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mengunggah karya ilmiah.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengunggah karya ilmiah.'], 500);
        }
    }

    /**
     * Memperbarui karya ilmiah yang sudah ada.
     * Endpoint: PUT /api/scientific-works/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID karya ilmiah)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID karya ilmiah tidak ditemukan.'], 400);
        }

        // Validasi input
        if (empty($requestData['title']) || empty($requestData['author_name']) || empty($requestData['type']) || empty($requestData['file_url'])) {
            return $this->response->json(['message' => 'Judul, penulis, tipe, dan URL file wajib diisi.'], 400);
        }

        try {
            $scientificWork = ScientificWork::find($id);
            if (!$scientificWork) {
                return $this->response->json(['message' => 'Karya ilmiah tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau pengunggah yang bisa mengedit
            // if ($loggedInUser['user_role'] !== 'komisariat' && $scientificWork['author_user_id'] !== $loggedInUser['user_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit karya ilmiah ini.'], 403);
            // }

            $dataToUpdate = [
                'title' => $requestData['title'],
                'author_name' => $requestData['author_name'],
                'type' => $requestData['type'],
                'abstract' => $requestData['abstract'] ?? $scientificWork['abstract'],
                'publication_year' => $requestData['publication_year'] ?? $scientificWork['publication_year'],
                'publisher' => $requestData['publisher'] ?? $scientificWork['publisher'],
                'isbn' => $requestData['isbn'] ?? $scientificWork['isbn'],
                'file_url' => $requestData['file_url'],
                'upload_date' => $requestData['upload_date'] ?? $scientificWork['upload_date'],
                'status' => $requestData['status'] ?? $scientificWork['status'], // Status juga bisa diupdate
            ];

            $updated = ScientificWork::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Update Scientific Work',
                //     'description' => 'Karya ilmiah "' . $requestData['title'] . '" (ID: ' . $id . ') diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Karya ilmiah berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui karya ilmiah.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui karya ilmiah.'], 500);
        }
    }

    /**
     * Menghapus karya ilmiah.
     * Endpoint: DELETE /api/scientific-works/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID karya ilmiah)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID karya ilmiah tidak ditemukan.'], 400);
        }

        try {
            $scientificWork = ScientificWork::find($id);
            if (!$scientificWork) {
                return $this->response->json(['message' => 'Karya ilmiah tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau pengunggah yang bisa menghapus
            // if ($loggedInUser['user_role'] !== 'komisariat' && $scientificWork['author_user_id'] !== $loggedInUser['user_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan menghapus karya ilmiah ini.'], 403);
            // }

            $deleted = ScientificWork::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Delete Scientific Work',
                //     'description' => 'Karya ilmiah dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Karya ilmiah berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menghapus karya ilmiah.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus karya ilmiah.'], 500);
        }
    }

    /**
     * Memperbarui status karya ilmiah (menyetujui/menolak).
     * Endpoint: PUT /api/scientific-works/{id}/approve atau /reject
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID karya ilmiah)
     * @param string $action 'approve' atau 'reject'
     * @return void Respons JSON akan dikirim langsung
     */
    public function updateStatus($params, $action)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID karya ilmiah tidak ditemukan.'], 400);
        }

        $newStatus = ($action === 'approve') ? 'approved' : 'rejected';

        try {
            $updated = ScientificWork::updateStatus($id, $newStatus);

            if ($updated) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => ucfirst($action) . ' Scientific Work',
                //     'description' => 'Status karya ilmiah dengan ID ' . $id . ' diubah menjadi ' . $newStatus . '.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengunggah (jika ada)
                // $work = ScientificWork::find($id);
                // if ($work && $work['author_user_id']) {
                //     $notifTitle = "Karya Ilmiah Anda " . ucfirst($newStatus);
                //     $notifContent = "Karya ilmiah Anda \"" . $work['title'] . "\" telah " . $newStatus . ".";
                //     \App\Services\NotificationService::sendNotification($notifTitle, $notifContent, $newStatus === 'approved' ? 'success' : 'error', 'user', $work['author_user_id']);
                // }

                return $this->response->json(['message' => 'Status karya ilmiah berhasil di' . $newStatus . '.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal memperbarui status karya ilmiah atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ScientificWorkController@updateStatus ({$action}): " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui status karya ilmiah.'], 500);
        }
    }
}
