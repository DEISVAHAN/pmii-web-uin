<?php
// app/controllers/LogController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\SystemActivityLog; // Sertakan model SystemActivityLog
// use App\Models\User; // Jika perlu berinteraksi dengan model User

class LogController
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
     * Mengambil daftar semua log aktivitas sistem.
     * Endpoint: GET /api/logs/activities
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        try {
            $filters = [
                'activity_type' => $queryParams['activity_type'] ?? null,
                'user_id' => $queryParams['user_id'] ?? null,
                'user_role' => $queryParams['user_role'] ?? null,
                'target_id' => $queryParams['target_id'] ?? null,
                'start_date' => $queryParams['start_date'] ?? null,
                'end_date' => $queryParams['end_date'] ?? null,
            ];

            $activityLogs = SystemActivityLog::all($filters);
            if ($activityLogs === false) {
                return $this->response->json(['message' => 'Failed to retrieve system activity logs.'], 500);
            }
            // Dekode JSON 'details' untuk setiap log
            foreach ($activityLogs as &$log) {
                if (isset($log['details'])) {
                    $log['details'] = json_decode($log['details'], true);
                }
            }
            unset($log);

            return $this->response->json($activityLogs, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in LogController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving system activity logs.'], 500);
        }
    }

    /**
     * Mengambil detail log aktivitas berdasarkan ID.
     * Endpoint: GET /api/logs/activities/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Log ID not found.'], 400);
        }

        try {
            $activityLog = SystemActivityLog::find($id);

            if ($activityLog) {
                // Dekode JSON 'details' jika ada
                if (isset($activityLog['details'])) {
                    $activityLog['details'] = json_decode($activityLog['details'], true);
                }
                return $this->response->json($activityLog, 200);
            } else {
                return $this->response->json(['message' => 'Log not found.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in LogController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving log details.'], 500);
        }
    }

    /**
     * Menghapus log aktivitas berdasarkan ID.
     * Endpoint: DELETE /api/logs/activities/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID log)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Log ID not found.'], 400);
        }

        try {
            $deleted = SystemActivityLog::delete($id);

            if ($deleted) {
                // Catat aktivitas penghapusan log (ini mungkin perlu mekanisme log terpisah atau log ke file)
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Log',
                //     'description' => 'System activity log (ID: ' . $id . ') deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Log successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Log not found or failed to delete.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in LogController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting log.'], 500);
        }
    }

    /**
     * Mengambil log aktivitas berdasarkan user_id.
     * Endpoint: GET /api/logs/activities/{user_id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (user_id)
     * @return void Respons JSON akan dikirim langsung
     */
    public function userLogs($params)
    {
        $userId = $params['user_id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$userId) {
            return $this->response->json(['message' => 'User ID not found.'], 400);
        }

        try {
            $filters = ['user_id' => $userId];
            $userActivityLogs = SystemActivityLog::all($filters);

            if ($userActivityLogs === false) {
                return $this->response->json(['message' => 'Failed to retrieve user activity logs.'], 500);
            }

            // Dekode JSON 'details' untuk setiap log
            foreach ($userActivityLogs as &$log) {
                if (isset($log['details'])) {
                    $log['details'] = json_decode($log['details'], true);
                }
            }
            unset($log);

            return $this->response->json($userActivityLogs, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in LogController@userLogs: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving user activity logs.'], 500);
        }
    }
}
