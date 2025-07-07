<?php
// app/controllers/SocialMediaLinkController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\SocialMediaLink; // Sertakan model SocialMediaLink
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class SocialMediaLinkController
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
     * Mengambil semua tautan media sosial.
     * Endpoint: GET /api/social-media
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $onlyActive = isset($queryParams['active']) && filter_var($queryParams['active'], FILTER_VALIDATE_BOOLEAN);

            $socialMediaLinks = SocialMediaLink::all($onlyActive);
            if ($socialMediaLinks === false) {
                return $this->response->json(['message' => 'Failed to retrieve social media links.'], 500);
            }
            return $this->response->json($socialMediaLinks, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in SocialMediaLinkController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving social media links.'], 500);
        }
    }

    /**
     * Mengambil detail tautan media sosial berdasarkan platform.
     * Endpoint: GET /api/social-media/{platform}
     *
     * @param array $params Parameter dari URL (mis. ['platform' => 'instagram'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $platform = $params['platform'] ?? null;

        if (!$platform) {
            return $this->response->json(['message' => 'Platform not found.'], 400);
        }

        try {
            $socialMediaLink = SocialMediaLink::find($platform);

            if ($socialMediaLink) {
                return $this->response->json($socialMediaLink, 200);
            } else {
                return $this->response->json(['message' => 'Social media link not found.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SocialMediaLinkController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving social media link details.'], 500);
        }
    }

    /**
     * Membuat tautan media sosial baru.
     * Endpoint: POST /api/social-media
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
        $requiredFields = ['platform', 'url'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' is required."], 400);
            }
        }
        if (!filter_var($requestData['url'], FILTER_VALIDATE_URL)) {
            return $this->response->json(['message' => 'Invalid URL format.'], 400);
        }

        try {
            // Cek duplikasi platform
            $existingLink = SocialMediaLink::find($requestData['platform']);
            if ($existingLink) {
                return $this->response->json(['message' => 'Platform already exists.'], 409);
            }

            $dataToCreate = [
                'platform' => $requestData['platform'],
                'url' => $requestData['url'],
                'is_active' => $requestData['is_active'] ?? true,
            ];

            $newPlatform = SocialMediaLink::create($dataToCreate);

            if ($newPlatform) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create Social Media Link',
                //     'description' => 'New social media link created for platform: ' . $requestData['platform'] . '.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $requestData['platform'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Social media link successfully created!', 'platform' => $newPlatform], 201);
            } else {
                return $this->response->json(['message' => 'Failed to create social media link.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SocialMediaLinkController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while creating social media link.'], 500);
        }
    }

    /**
     * Memperbarui tautan media sosial yang sudah ada.
     * Endpoint: PUT /api/social-media/{platform}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (platform)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $platform = $params['platform'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$platform) {
            return $this->response->json(['message' => 'Platform not found.'], 400);
        }

        // Validasi input (minimal)
        if (isset($requestData['url']) && !filter_var($requestData['url'], FILTER_VALIDATE_URL)) {
            return $this->response->json(['message' => 'Invalid URL format.'], 400);
        }

        try {
            $socialMediaLink = SocialMediaLink::find($platform);
            if (!$socialMediaLink) {
                return $this->response->json(['message' => 'Social media link not found.'], 404);
            }

            $dataToUpdate = [
                'url' => $requestData['url'] ?? $socialMediaLink['url'],
                'is_active' => $requestData['is_active'] ?? $socialMediaLink['is_active'],
            ];

            $updated = SocialMediaLink::update($platform, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Social Media Link',
                //     'description' => 'Social media link for platform ' . $platform . ' updated.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $platform,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Social media link successfully updated.'], 200);
            } else {
                return $this->response->json(['message' => 'No data changes or failed to update social media link.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SocialMediaLinkController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating social media link.'], 500);
        }
    }

    /**
     * Menghapus tautan media sosial.
     * Endpoint: DELETE /api/social-media/{platform}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (platform)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $platform = $params['platform'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$platform) {
            return $this->response->json(['message' => 'Platform not found.'], 400);
        }

        try {
            $deleted = SocialMediaLink::delete($platform);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Social Media Link',
                //     'description' => 'Social media link for platform ' . $platform . ' deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $platform,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Social media link successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Social media link not found or failed to delete.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SocialMediaLinkController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting social media link.'], 500);
        }
    }
}
