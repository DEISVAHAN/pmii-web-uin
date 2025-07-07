<?php
// app/controllers/KepengurusanArchiveController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\KepengurusanArchive; // Sertakan model KepengurusanArchive
// use App\Models\User;                 // Jika perlu berinteraksi dengan model User
// use App\Models\Rayon;                // Jika perlu berinteraksi dengan model Rayon
// use App\Models\SystemActivityLog;     // Jika ada model untuk log aktivitas

class KepengurusanArchiveController
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
     * Mengambil daftar semua arsip kepengurusan.
     * Endpoint: GET /api/archives/kepengurusan
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        $filters = [
            'rayon_id' => $queryParams['rayon_id'] ?? null,
            'periode' => $queryParams['periode'] ?? null,
            'search' => $queryParams['search'] ?? null,
        ];

        // Jika user yang login adalah admin rayon, filter hanya rayon mereka
        // if ($loggedInUser && $loggedInUser['user_role'] === 'rayon' && !isset($filters['rayon_id'])) {
        //     $filters['rayon_id'] = $loggedInUser['rayon_id'];
        // }

        try {
            $archives = KepengurusanArchive::all($filters);
            if ($archives === false) {
                return $this->response->json(['message' => 'Failed to retrieve kepengurusan archives.'], 500);
            }

            // Dekode JSON 'other_files_json' jika ada
            foreach ($archives as &$archive) {
                if (isset($archive['other_files_json'])) {
                    $archive['other_files_json'] = json_decode($archive['other_files_json'], true);
                }
            }
            unset($archive); // Putuskan referensi terakhir

            return $this->response->json($archives, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in KepengurusanArchiveController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving kepengurusan archives.'], 500);
        }
    }

    /**
     * Mengambil detail arsip kepengurusan berdasarkan ID.
     * Endpoint: GET /api/archives/kepengurusan/{id}
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'komisariat_2023-2024_1'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Archive ID not found.'], 400);
        }

        try {
            $archive = KepengurusanArchive::find($id);

            if ($archive) {
                // Dekode JSON 'other_files_json' jika ada
                if (isset($archive['other_files_json'])) {
                    $archive['other_files_json'] = json_decode($archive['other_files_json'], true);
                }
                return $this->response->json($archive, 200);
            } else {
                return $this->response->json(['message' => 'Kepengurusan archive not found.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KepengurusanArchiveController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving archive details.'], 500);
        }
    }

    /**
     * Membuat arsip kepengurusan baru.
     * Endpoint: POST /api/archives/kepengurusan
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['id', 'rayon_id', 'nama_rayon', 'periode', 'ketua', 'sekretaris', 'bendahara'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' is required."], 400);
            }
        }

        // Otorisasi: Admin rayon hanya bisa mengunggah arsip untuk rayonnya sendiri
        // if ($loggedInUser && $loggedInUser['user_role'] === 'rayon' && $requestData['rayon_id'] !== $loggedInUser['rayon_id']) {
        //     return $this->response->json(['message' => 'You are not authorized to upload archives for other rayons.'], 403);
        // }

        try {
            // Cek duplikasi ID
            $existingArchive = KepengurusanArchive::find($requestData['id']);
            if ($existingArchive) {
                return $this->response->json(['message' => 'Archive ID already exists.'], 409);
            }

            $dataToCreate = [
                'id' => $requestData['id'], // ID harus unik, bisa kombinasi rayon_id, periode, timestamp
                'rayon_id' => $requestData['rayon_id'],
                'nama_rayon' => $requestData['nama_rayon'],
                'periode' => $requestData['periode'],
                'ketua' => $requestData['ketua'],
                'sekretaris' => $requestData['sekretaris'],
                'bendahara' => $requestData['bendahara'],
                'jumlah_kader' => $requestData['jumlah_kader'] ?? 0,
                'tanggal_berdiri_periode' => $requestData['tanggal_berdiri_periode'] ?? null,
                'uploaded_by_user_id' => $loggedInUser['user_id'] ?? null,
                'uploaded_date' => date('Y-m-d H:i:s'),
                'file_sk_url' => $requestData['file_sk_url'] ?? null,
                'other_files_json' => $requestData['other_files_json'] ?? null, // Asumsi ini sudah dalam bentuk array PHP
            ];

            $newArchiveId = KepengurusanArchive::create($dataToCreate);

            if ($newArchiveId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create Kepengurusan Archive',
                //     'description' => 'New kepengurusan archive "' . $requestData['periode'] . ' - ' . $requestData['nama_rayon'] . '" created (ID: ' . $newArchiveId . ').',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newArchiveId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                return $this->response->json(['message' => 'Kepengurusan archive successfully created!', 'id' => $newArchiveId], 201);
            } else {
                return $this->response->json(['message' => 'Failed to create kepengurusan archive.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KepengurusanArchiveController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while creating kepengurusan archive.'], 500);
        }
    }

    /**
     * Memperbarui arsip kepengurusan yang sudah ada.
     * Endpoint: PUT /api/archives/kepengurusan/{id}
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @param array $params Parameter dari URL (ID arsip)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Archive ID not found.'], 400);
        }

        // Validasi input (minimal)
        if (empty($requestData['periode']) || empty($requestData['ketua'])) {
            return $this->response->json(['message' => 'Periode and Ketua are required fields.'], 400);
        }

        try {
            $archive = KepengurusanArchive::find($id);
            if (!$archive) {
                return $this->response->json(['message' => 'Kepengurusan archive not found.'], 404);
            }

            // Otorisasi: Admin rayon hanya bisa mengedit arsip rayonnya sendiri
            // if ($loggedInUser && $loggedInUser['user_role'] === 'rayon' && $archive['rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'You are not authorized to edit this archive.'], 403);
            // }

            $dataToUpdate = [
                'periode' => $requestData['periode'],
                'ketua' => $requestData['ketua'],
                'sekretaris' => $requestData['sekretaris'] ?? $archive['sekretaris'],
                'bendahara' => $requestData['bendahara'] ?? $archive['bendahara'],
                'jumlah_kader' => $requestData['jumlah_kader'] ?? $archive['jumlah_kader'],
                'tanggal_berdiri_periode' => $requestData['tanggal_berdiri_periode'] ?? $archive['tanggal_berdiri_periode'],
                'file_sk_url' => $requestData['file_sk_url'] ?? $archive['file_sk_url'],
                'other_files_json' => $requestData['other_files_json'] ?? $archive['other_files_json'],
            ];

            $updated = KepengurusanArchive::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Kepengurusan Archive',
                //     'description' => 'Kepengurusan archive (ID: ' . $id . ') updated.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Kepengurusan archive successfully updated.'], 200);
            } else {
                return $this->response->json(['message' => 'No data changes or failed to update kepengurusan archive.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KepengurusanArchiveController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating kepengurusan archive.'], 500);
        }
    }

    /**
     * Menghapus arsip kepengurusan.
     * Endpoint: DELETE /api/archives/kepengurusan/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID arsip)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Archive ID not found.'], 400);
        }

        try {
            $deleted = KepengurusanArchive::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Kepengurusan Archive',
                //     'description' => 'Kepengurusan archive (ID: ' . $id . ') deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Kepengurusan archive successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Kepengurusan archive not found or failed to delete.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in KepengurusanArchiveController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting kepengurusan archive.'], 500);
        }
    }
}
