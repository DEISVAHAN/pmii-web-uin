<?php
// app/controllers/ActivityController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Activity; // Sertakan model Activity
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Rayon;            // Jika perlu berinteraksi dengan model Rayon
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class ActivityController
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
     * Mengambil daftar semua kegiatan yang disetujui (publik).
     * Endpoint: GET /api/activities
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams(); // Ambil query params
        try {
            $activities = Activity::all('approved'); // Mengambil hanya yang berstatus 'approved'
            if ($activities === false) {
                return $this->response->json(['message' => 'Gagal mengambil data kegiatan.'], 500);
            }
            return $this->response->json($activities, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil kegiatan.'], 500);
        }
    }

    /**
     * Mengambil detail kegiatan berdasarkan ID.
     * Endpoint: GET /api/activities/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        try {
            $activity = Activity::find($id);

            if ($activity) {
                // Opsional: Gabungkan dengan nama pengaju/rayon jika diperlukan
                // if ($activity['submitted_by_user_id']) {
                //     $user = \App\Models\User::find($activity['submitted_by_user_id']);
                //     if ($user) $activity['submitted_by_user_name'] = $user['name'];
                // }
                // if ($activity['submitted_by_rayon_id']) {
                //     $rayon = \App\Models\Rayon::find($activity['submitted_by_rayon_id']);
                //     if ($rayon) $activity['submitted_by_rayon_name'] = $rayon['name'];
                // }

                return $this->response->json($activity, 200);
            } else {
                return $this->response->json(['message' => 'Kegiatan tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail kegiatan.'], 500);
        }
    }

    /**
     * Mengajukan kegiatan baru.
     * Endpoint: POST /api/activities
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
        $requiredFields = ['title', 'activity_date', 'location'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        try {
            $dataToCreate = [
                'title' => $requestData['title'],
                'activity_date' => $requestData['activity_date'],
                'activity_time' => $requestData['activity_time'] ?? null,
                'location' => $requestData['location'],
                'description' => $requestData['description'] ?? null,
                'image_url' => $requestData['image_url'] ?? null,
                'registration_enabled' => $requestData['registration_enabled'] ?? false,
                'submitted_by_user_id' => $loggedInUser['user_id'] ?? null, // ID pengguna yang mengajukan
                'submitted_by_rayon_id' => ($loggedInUser && $loggedInUser['user_role'] === 'rayon') ? ($loggedInUser['rayon_id'] ?? null) : null,
                'status' => 'pending', // Default status saat diajukan
                'external_link' => $requestData['external_link'] ?? null,
            ];

            $newActivityId = Activity::create($dataToCreate);

            if ($newActivityId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Submit Activity',
                //     'description' => 'Kegiatan baru "' . $requestData['title'] . '" diajukan.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newActivityId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat
                // \App\Services\NotificationService::sendNotification('Pengajuan Kegiatan Baru', 'Kegiatan baru diajukan oleh ' . ($loggedInUser['user_name'] ?? 'Rayon') . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Kegiatan berhasil diajukan!', 'id' => $newActivityId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mengajukan kegiatan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengajukan kegiatan.'], 500);
        }
    }

    /**
     * Memperbarui kegiatan yang sudah ada.
     * Endpoint: PUT /api/activities/{id}
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        // Validasi input
        if (empty($requestData['title']) || empty($requestData['activity_date']) || empty($requestData['location'])) {
            return $this->response->json(['message' => 'Judul, tanggal, dan lokasi wajib diisi.'], 400);
        }

        try {
            $activity = Activity::find($id);
            if (!$activity) {
                return $this->response->json(['message' => 'Kegiatan tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa mengedit
            // if ($loggedInUser['user_role'] === 'rayon' && $activity['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit kegiatan rayon lain.'], 403);
            // }

            $dataToUpdate = [
                'title' => $requestData['title'],
                'activity_date' => $requestData['activity_date'],
                'activity_time' => $requestData['activity_time'] ?? $activity['activity_time'],
                'location' => $requestData['location'],
                'description' => $requestData['description'] ?? $activity['description'],
                'image_url' => $requestData['image_url'] ?? $activity['image_url'],
                'registration_enabled' => $requestData['registration_enabled'] ?? $activity['registration_enabled'],
                'status' => $requestData['status'] ?? $activity['status'], // Status juga bisa diupdate
                'external_link' => $requestData['external_link'] ?? $activity['external_link'],
            ];

            $updated = Activity::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Activity',
                //     'description' => 'Kegiatan "' . $requestData['title'] . '" (ID: ' . $id . ') diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Kegiatan berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui kegiatan.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui kegiatan.'], 500);
        }
    }

    /**
     * Menghapus kegiatan.
     * Endpoint: DELETE /api/activities/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        try {
            $activity = Activity::find($id);
            if (!$activity) {
                return $this->response->json(['message' => 'Kegiatan tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa menghapus
            // if ($loggedInUser['user_role'] === 'rayon' && $activity['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan menghapus kegiatan rayon lain.'], 403);
            // }

            $deleted = Activity::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Activity',
                //     'description' => 'Kegiatan dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Kegiatan berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menghapus kegiatan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus kegiatan.'], 500);
        }
    }

    /**
     * Mengambil daftar kegiatan yang berstatus 'pending' (untuk verifikasi).
     * Endpoint: GET /api/activities/pending
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function pending()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $pendingActivities = Activity::all('pending');
            if ($pendingActivities === false) {
                return $this->response->json(['message' => 'Gagal mengambil data kegiatan pending.'], 500);
            }
            return $this->response->json($pendingActivities, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@pending: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil kegiatan pending.'], 500);
        }
    }

    /**
     * Menyetujui kegiatan.
     * Endpoint: PUT /api/activities/{id}/approve
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function approve($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        try {
            $updated = Activity::updateStatus($id, 'approved');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Approve Activity',
                //     'description' => 'Kegiatan dengan ID ' . $id . ' disetujui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengaju (jika ada)
                // $activity = Activity::find($id);
                // if ($activity && $activity['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Kegiatan Disetujui', 'Kegiatan Anda "' . $activity['title'] . '" telah disetujui dan dipublikasikan.', 'success', 'user', $activity['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Kegiatan berhasil disetujui.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menyetujui kegiatan atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@approve: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menyetujui kegiatan.'], 500);
        }
    }

    /**
     * Menolak kegiatan.
     * Endpoint: PUT /api/activities/{id}/reject
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function reject($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        try {
            $updated = Activity::updateStatus($id, 'rejected');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Reject Activity',
                //     'description' => 'Kegiatan dengan ID ' . $id . ' ditolak.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengaju (jika ada)
                // $activity = Activity::find($id);
                // if ($activity && $activity['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Kegiatan Ditolak', 'Kegiatan Anda "' . $activity['title'] . '" telah ditolak. Mohon periksa kembali detail kegiatan Anda.', 'error', 'user', $activity['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Kegiatan berhasil ditolak.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menolak kegiatan atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityController@reject: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menolak kegiatan.'], 500);
        }
    }
}
