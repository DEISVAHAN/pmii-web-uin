<?php
// app/controllers/NotificationController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Notification; // Sertakan model Notification
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Activity;         // Jika perlu berinteraksi dengan model Activity (untuk notifikasi otomatis)
// use App\Models\NewsArticle;      // Jika perlu berinteraksi dengan model NewsArticle (untuk notifikasi otomatis)
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class NotificationController
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
     * Mengambil daftar semua notifikasi yang dikirim (untuk admin).
     * Endpoint: GET /api/notifications/sent
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function sentNotifications()
    {
        $queryParams = $this->request->getQueryParams();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // if (!$loggedInUser) {
        //     return $this->response->json(['message' => 'Unauthorized.'], 401);
        // }

        $filters = [
            'type' => $queryParams['type'] ?? null,
            'target_role' => $queryParams['target_role'] ?? null,
            'search' => $queryParams['search'] ?? null,
        ];

        // Filter berdasarkan pengirim (hanya notifikasi yang dikirim oleh admin yang login)
        $filters['sender_user_id'] = $loggedInUser['user_id'];
        $filters['sender_role'] = $loggedInUser['user_role'];

        try {
            $notifications = Notification::all($filters);
            if ($notifications === false) {
                return $this->response->json(['message' => 'Failed to retrieve sent notifications.'], 500);
            }
            return $this->response->json($notifications, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in NotificationController@sentNotifications: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving sent notifications.'], 500);
        }
    }

    /**
     * Mengambil daftar notifikasi yang diterima oleh pengguna yang login.
     * Endpoint: GET /api/notifications/my
     * Memerlukan autentikasi (semua peran).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function myNotifications()
    {
        $queryParams = $this->request->getQueryParams();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // if (!$loggedInUser) {
        //     return $this->response->json(['message' => 'Unauthorized.'], 401);
        // }

        $filters = [
            // Notifikasi yang ditujukan langsung ke user ini
            'target_user_id' => $loggedInUser['user_id'],
            // Notifikasi yang ditujukan ke semua pengguna ('all')
            // Notifikasi yang ditujukan ke role spesifik
            // Notifikasi yang ditujukan ke rayon spesifik (jika user adalah admin rayon)
        ];

        // Logika untuk mengambil notifikasi 'all' atau 'role' atau 'rayon'
        // Ini bisa menjadi query yang lebih kompleks di model Notification
        // atau di service notifikasi.
        // Untuk sederhana, kita akan ambil yang target_user_id saja,
        // dan asumsikan notifikasi 'all' atau 'role' akan di-handle secara terpisah
        // atau diduplikasi ke setiap user saat dibuat.

        try {
            $notifications = Notification::all($filters);
            if ($notifications === false) {
                return $this->response->json(['message' => 'Failed to retrieve your notifications.'], 500);
            }
            return $this->response->json($notifications, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in NotificationController@myNotifications: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving your notifications.'], 500);
        }
    }


    /**
     * Mengirim notifikasi manual.
     * Endpoint: POST /api/notifications/send
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function sendManualNotification()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['title', 'content', 'recipient_value', 'type'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' is required."], 400);
            }
        }

        $recipientValue = $requestData['recipient_value'];
        $targetRole = null;
        $targetId = null;

        if (strpos($recipientValue, ':') !== false) {
            list($targetRole, $targetId) = explode(':', $recipientValue, 2);
        } else {
            $targetRole = $recipientValue;
        }

        // --- Logika Otorisasi Pengirim (Rayon Admin hanya bisa kirim ke kadernya) ---
        // if ($loggedInUser['user_role'] === 'rayon') {
        //     if ($targetRole === 'all' || $targetRole === 'komisariat' || ($targetRole === 'rayon' && $targetId !== $loggedInUser['rayon_id'])) {
        //         return $this->response->json(['message' => 'Rayon admin can only send notifications to their own members.'], 403);
        //     }
        //     // Jika target 'kader' tanpa targetId, atau targetId adalah kader di rayonnya
        //     if ($targetRole === 'kader' && $targetId) {
        //         $targetUser = \App\Models\User::find($targetId);
        //         if (!$targetUser || $targetUser['rayon_id'] !== $loggedInUser['rayon_id']) {
        //             return $this->response->json(['message' => 'You can only send notifications to members of your own rayon.'], 403);
        //         }
        //     }
        // }

        try {
            $dataToCreate = [
                'type' => $requestData['type'],
                'title' => $requestData['title'],
                'content' => $requestData['content'],
                'target_role' => $targetRole,
                'target_user_id' => $targetId, // Jika target_role adalah 'kader' atau 'admin_rayon' dengan ID spesifik
                'target_rayon_id' => ($targetRole === 'rayon' && $targetId) ? $targetId : null, // Jika target_role adalah 'rayon' dengan ID spesifik
                'sender_user_id' => $loggedInUser['user_id'] ?? 'system', // ID pengirim
                'sender_role' => $loggedInUser['user_role'] ?? 'system', // Peran pengirim
            ];

            $newNotificationId = Notification::create($dataToCreate);

            if ($newNotificationId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Send Notification',
                //     'description' => 'Notification "' . $requestData['title'] . '" sent to ' . $recipientValue . '.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newNotificationId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // --- Kirim notifikasi eksternal (Email/WhatsApp) ---
                // \App\Services\NotificationService::sendExternalNotification($dataToCreate); // Panggil service notifikasi

                return $this->response->json(['message' => 'Notification successfully sent!', 'id' => $newNotificationId], 201);
            } else {
                return $this->response->json(['message' => 'Failed to send notification.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NotificationController@sendManualNotification: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while sending notification.'], 500);
        }
    }

    /**
     * Menghapus notifikasi.
     * Endpoint: DELETE /api/notifications/{id}
     * Memerlukan autentikasi dan peran 'komisariat' atau 'rayon' (hanya notifikasi yang dikirimnya sendiri).
     *
     * @param array $params Parameter dari URL (ID notifikasi)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Notification ID not found.'], 400);
        }

        try {
            $notification = Notification::find($id);
            if (!$notification) {
                return $this->response->json(['message' => 'Notification not found.'], 404);
            }

            // Otorisasi: Hanya pengirim notifikasi atau admin komisariat yang bisa menghapus
            // if ($loggedInUser['user_role'] !== 'komisariat' && $notification['sender_user_id'] !== $loggedInUser['user_id']) {
            //     return $this->response->json(['message' => 'You are not authorized to delete this notification.'], 403);
            // }

            $deleted = Notification::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Notification',
                //     'description' => 'Notification (ID: ' . $id . ') deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Notification successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Failed to delete notification.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NotificationController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting notification.'], 500);
        }
    }

    /**
     * Memicu notifikasi otomatis berdasarkan data baru (misal: kegiatan/berita baru).
     * Endpoint: POST /api/notifications/trigger-auto
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function triggerAutomaticNotifications()
    {
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // if ($loggedInUser['user_role'] !== 'komisariat') {
        //     return $this->response->json(['message' => 'Unauthorized. Only Komisariat admin can trigger automatic notifications.'], 403);
        // }

        $notificationsSentCount = 0;
        try {
            // --- SIMULASI LOGIKA OTOMATIS ---
            // Di aplikasi nyata, ini akan memeriksa data baru di tabel lain (misal activities, news_articles)
            // yang belum diberitahukan.

            // Contoh: Cek kegiatan baru yang belum diberitahukan
            // $newActivities = \App\Models\Activity::all(['status' => 'approved', 'notified' => false]);
            // foreach ($newActivities as $activity) {
            //     $dataToCreate = [
            //         'type' => 'info',
            //         'title' => 'Kegiatan Baru: ' . $activity['title'],
            //         'content' => $activity['description'] . ' pada ' . $activity['activity_date'],
            //         'target_role' => 'all', // Kirim ke semua pengguna
            //         'sender_user_id' => 'system', // Atau ID admin komisariat
            //         'sender_role' => 'system',
            //     ];
            //     Notification::create($dataToCreate);
            //     // \App\Models\Activity::update($activity['id'], ['notified' => true]); // Tandai sudah diberitahu
            //     $notificationsSentCount++;
            // }

            // Contoh: Cek berita baru yang belum diberitahukan
            // $newNews = \App\Models\NewsArticle::all(['status' => 'approved', 'notified' => false]);
            // foreach ($newNews as $news) {
            //     $dataToCreate = [
            //         'type' => 'info',
            //         'title' => 'Berita Baru: ' . $news['title'],
            //         'content' => $news['description'],
            //         'target_role' => 'all',
            //         'sender_user_id' => 'system',
            //         'sender_role' => 'system',
            //     ];
            //     Notification::create($dataToCreate);
            //     // \App\Models\NewsArticle::update($news['id'], ['notified' => true]); // Tandai sudah diberitahu
            //     $notificationsSentCount++;
            // }

            // Catat aktivitas
            // SystemActivityLog::create([
            //     'activity_type' => 'Trigger Auto Notifications',
            //     'description' => $notificationsSentCount . ' automatic notifications triggered.',
            //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
            //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
            //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);

            if ($notificationsSentCount > 0) {
                return $this->response->json(['message' => "Successfully triggered {$notificationsSentCount} automatic notifications."], 200);
            } else {
                return $this->response->json(['message' => 'No new activities or news found to trigger automatic notifications.'], 200);
            }

        } catch (\PDOException $e) {
            error_log("Database Error in NotificationController@triggerAutomaticNotifications: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while triggering automatic notifications.'], 500);
        }
    }
}
