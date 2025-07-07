<?php
// app/controllers/NewsArticleController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\NewsArticle; // Sertakan model NewsArticle
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Rayon;            // Jika perlu berinteraksi dengan model Rayon
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class NewsArticleController
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
     * Mengambil daftar semua berita/artikel yang disetujui (publik).
     * Endpoint: GET /api/news
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams(); // Ambil query params
        try {
            $newsArticles = NewsArticle::all('approved'); // Mengambil hanya yang berstatus 'approved'
            if ($newsArticles === false) {
                return $this->response->json(['message' => 'Gagal mengambil data berita/artikel.'], 500);
            }
            return $this->response->json($newsArticles, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil berita/artikel.'], 500);
        }
    }

    /**
     * Mengambil detail berita/artikel berdasarkan ID.
     * Endpoint: GET /api/news/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID berita/artikel tidak ditemukan.'], 400);
        }

        try {
            $newsArticle = NewsArticle::find($id);

            if ($newsArticle) {
                // Opsional: Gabungkan dengan nama pengaju/rayon jika diperlukan
                // if ($newsArticle['submitted_by_user_id']) {
                //     $user = \App\Models\User::find($newsArticle['submitted_by_user_id']);
                //     if ($user) $newsArticle['submitted_by_user_name'] = $user['name'];
                // }
                // if ($newsArticle['submitted_by_rayon_id']) {
                //     $rayon = \App\Models\Rayon::find($newsArticle['submitted_by_rayon_id']);
                //     if ($rayon) $newsArticle['submitted_by_rayon_name'] = $rayon['name'];
                // }

                return $this->response->json($newsArticle, 200);
            } else {
                return $this->response->json(['message' => 'Berita/artikel tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail berita/artikel.'], 500);
        }
    }

    /**
     * Mengajukan berita/artikel baru.
     * Endpoint: POST /api/news
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
        $requiredFields = ['title', 'category', 'description'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        try {
            $dataToCreate = [
                'title' => $requestData['title'],
                'category' => $requestData['category'],
                'image_url' => $requestData['image_url'] ?? null,
                'description' => $requestData['description'],
                'publication_date' => $requestData['publication_date'] ?? date('Y-m-d'),
                'submitted_by_user_id' => $loggedInUser['user_id'] ?? null, // ID pengguna yang mengajukan
                'submitted_by_rayon_id' => ($loggedInUser && $loggedInUser['user_role'] === 'rayon') ? ($loggedInUser['rayon_id'] ?? null) : null,
                'status' => 'pending', // Default status saat diajukan
            ];

            $newArticleId = NewsArticle::create($dataToCreate);

            if ($newArticleId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Submit News/Article',
                //     'description' => 'Berita/artikel baru "' . $requestData['title'] . '" diajukan.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newArticleId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat
                // \App\Services\NotificationService::sendNotification('Pengajuan Berita/Artikel Baru', 'Berita/artikel baru diajukan oleh ' . ($loggedInUser['user_name'] ?? 'Rayon') . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Berita/artikel berhasil diajukan!', 'id' => $newArticleId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mengajukan berita/artikel.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengajukan berita/artikel.'], 500);
        }
    }

    /**
     * Memperbarui berita/artikel yang sudah ada.
     * Endpoint: PUT /api/news/{id}
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @param array $params Parameter dari URL (ID berita/artikel)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID berita/artikel tidak ditemukan.'], 400);
        }

        // Validasi input
        if (empty($requestData['title']) || empty($requestData['category']) || empty($requestData['description'])) {
            return $this->response->json(['message' => 'Judul, kategori, dan deskripsi wajib diisi.'], 400);
        }

        try {
            $newsArticle = NewsArticle::find($id);
            if (!$newsArticle) {
                return $this->response->json(['message' => 'Berita/artikel tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa mengedit
            // if ($loggedInUser['user_role'] === 'rayon' && $newsArticle['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit berita/artikel rayon lain.'], 403);
            // }

            $dataToUpdate = [
                'title' => $requestData['title'],
                'category' => $requestData['category'],
                'image_url' => $requestData['image_url'] ?? $newsArticle['image_url'], // Pertahankan yang lama jika tidak ada yang baru
                'description' => $requestData['description'],
                'publication_date' => $requestData['publication_date'] ?? $newsArticle['publication_date'],
                'status' => $requestData['status'] ?? $newsArticle['status'], // Status juga bisa diupdate
            ];

            $updated = NewsArticle::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update News/Article',
                //     'description' => 'Berita/artikel "' . $requestData['title'] . '" (ID: ' . $id . ') diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Berita/artikel berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui berita/artikel.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui berita/artikel.'], 500);
        }
    }

    /**
     * Menghapus berita/artikel.
     * Endpoint: DELETE /api/news/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID berita/artikel)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID berita/artikel tidak ditemukan.'], 400);
        }

        try {
            $newsArticle = NewsArticle::find($id);
            if (!$newsArticle) {
                return $this->response->json(['message' => 'Berita/artikel tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa menghapus
            // if ($loggedInUser['user_role'] === 'rayon' && $newsArticle['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan menghapus berita/artikel rayon lain.'], 403);
            // }

            $deleted = NewsArticle::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete News/Article',
                //     'description' => 'Berita/artikel dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Berita/artikel berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menghapus berita/artikel.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus berita/artikel.'], 500);
        }
    }

    /**
     * Mengambil daftar berita/artikel yang berstatus 'pending' (untuk verifikasi).
     * Endpoint: GET /api/news/pending
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function pending()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $pendingArticles = NewsArticle::all('pending');
            if ($pendingArticles === false) {
                return $this->response->json(['message' => 'Gagal mengambil data berita/artikel pending.'], 500);
            }
            return $this->response->json($pendingArticles, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@pending: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil berita/artikel pending.'], 500);
        }
    }

    /**
     * Menyetujui berita/artikel.
     * Endpoint: PUT /api/news/{id}/approve
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID berita/artikel)
     * @return void Respons JSON akan dikirim langsung
     */
    public function approve($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID berita/artikel tidak ditemukan.'], 400);
        }

        try {
            $updated = NewsArticle::updateStatus($id, 'approved');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Approve News/Article',
                //     'description' => 'Berita/artikel dengan ID ' . $id . ' disetujui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengaju (jika ada)
                // $article = NewsArticle::find($id);
                // if ($article && $article['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Berita/Artikel Disetujui', 'Berita/artikel Anda "' . $article['title'] . '" telah disetujui dan dipublikasikan.', 'success', 'user', $article['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Berita/artikel berhasil disetujui.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menyetujui berita/artikel atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@approve: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menyetujui berita/artikel.'], 500);
        }
    }

    /**
     * Menolak berita/artikel.
     * Endpoint: PUT /api/news/{id}/reject
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID berita/artikel)
     * @return void Respons JSON akan dikirim langsung
     */
    public function reject($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID berita/artikel tidak ditemukan.'], 400);
        }

        try {
            $updated = NewsArticle::updateStatus($id, 'rejected');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Reject News/Article',
                //     'description' => 'Berita/artikel dengan ID ' . $id . ' ditolak.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengaju (jika ada)
                // $article = NewsArticle::find($id);
                // if ($article && $article['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Berita/Artikel Ditolak', 'Berita/artikel Anda "' . $article['title'] . '" telah ditolak. Mohon periksa kembali konten Anda.', 'error', 'user', $article['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Berita/artikel berhasil ditolak.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menolak berita/artikel atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in NewsArticleController@reject: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menolak berita/artikel.'], 500);
        }
    }
}
