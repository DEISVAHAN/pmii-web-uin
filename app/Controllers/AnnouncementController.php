<?php
// app/controllers/AnnouncementController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Announcement; // Sertakan model Announcement
// use App\Models\SystemActivityLog;     // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class AnnouncementController
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
     * Mengambil semua pengumuman.
     * Endpoint: GET /api/announcements
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $onlyActive = isset($queryParams['active']) && filter_var($queryParams['active'], FILTER_VALIDATE_BOOLEAN);

            $announcements = Announcement::all($onlyActive);
            if ($announcements === false) {
                return $this->response->json(['message' => 'Failed to retrieve announcements.'], 500);
            }
            return $this->response->json($announcements, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving announcements.'], 500);
        }
    }

    /**
     * Mengambil detail pengumuman berdasarkan ID.
     * Endpoint: GET /api/announcements/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Announcement ID not found.'], 400);
        }

        try {
            $announcement = Announcement::find($id);

            if ($announcement) {
                return $this->response->json($announcement, 200);
            } else {
                return $this->response->json(['message' => 'Announcement not found.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving announcement details.'], 500);
        }
    }

    /**
     * Membuat pengumuman baru.
     * Endpoint: POST /api/announcements
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
        if (empty($requestData['text_content'])) {
            return $this->response->json(['message' => 'Announcement content is required.'], 400);
        }

        try {
            $dataToCreate = [
                'text_content' => $requestData['text_content'],
                'target_url' => $requestData['target_url'] ?? null,
                'is_active' => $requestData['is_active'] ?? true,
                'published_at' => $requestData['published_at'] ?? date('Y-m-d H:i:s'),
            ];

            $newAnnouncementId = Announcement::create($dataToCreate);

            if ($newAnnouncementId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create Announcement',
                //     'description' => 'New announcement created (ID: ' . $newAnnouncementId . ').',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newAnnouncementId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi (opsional, misal ke semua pengguna aktif)
                // \App\Services\NotificationService::sendNotification('New Announcement', $requestData['text_content'], 'info', 'all');

                return $this->response->json(['message' => 'Announcement successfully created!', 'id' => $newAnnouncementId], 201);
            } else {
                return $this->response->json(['message' => 'Failed to create announcement.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while creating announcement.'], 500);
        }
    }

    /**
     * Memperbarui pengumuman yang sudah ada.
     * Endpoint: PUT /api/announcements/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID pengumuman)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Announcement ID not found.'], 400);
        }

        // Validasi input
        if (empty($requestData['text_content'])) {
            return $this->response->json(['message' => 'Announcement content is required.'], 400);
        }

        try {
            $announcement = Announcement::find($id);
            if (!$announcement) {
                return $this->response->json(['message' => 'Announcement not found.'], 404);
            }

            $dataToUpdate = [
                'text_content' => $requestData['text_content'],
                'target_url' => $requestData['target_url'] ?? $announcement['target_url'],
                'is_active' => $requestData['is_active'] ?? $announcement['is_active'],
                'published_at' => $requestData['published_at'] ?? $announcement['published_at'],
            ];

            $updated = Announcement::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Announcement',
                //     'description' => 'Announcement (ID: ' . $id . ') updated.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Announcement successfully updated.'], 200);
            } else {
                return $this->response->json(['message' => 'No data changes or failed to update announcement.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating announcement.'], 500);
        }
    }

    /**
     * Menghapus pengumuman.
     * Endpoint: DELETE /api/announcements/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID pengumuman)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Announcement ID not found.'], 400);
        }

        try {
            $deleted = Announcement::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Announcement',
                //     'description' => 'Announcement (ID: ' . $id . ') deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Announcement successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Announcement not found or failed to delete.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting announcement.'], 500);
        }
    }

    /**
     * Mengaktifkan pengumuman.
     * Endpoint: PUT /api/announcements/{id}/activate
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID pengumuman)
     * @return void Respons JSON akan dikirim langsung
     */
    public function activate($params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->response->json(['message' => 'Announcement ID not found.'], 400);
        }

        try {
            $updated = Announcement::update($id, ['is_active' => true]);
            if ($updated) {
                // SystemActivityLog::create([ ... ]);
                return $this->response->json(['message' => 'Announcement activated.'], 200);
            } else {
                return $this->response->json(['message' => 'Failed to activate announcement or no changes.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@activate: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while activating announcement.'], 500);
        }
    }

    /**
     * Menonaktifkan pengumuman.
     * Endpoint: PUT /api/announcements/{id}/deactivate
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID pengumuman)
     * @return void Respons JSON akan dikirim langsung
     */
    public function deactivate($params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->response->json(['message' => 'Announcement ID not found.'], 400);
        }

        try {
            $updated = Announcement::update($id, ['is_active' => false]);
            if ($updated) {
                // SystemActivityLog::create([ ... ]);
                return $this->response->json(['message' => 'Announcement deactivated.'], 200);
            } else {
                return $this->response->json(['message' => 'Failed to deactivate announcement or no changes.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in AnnouncementController@deactivate: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deactivating announcement.'], 500);
        }
    }
}
