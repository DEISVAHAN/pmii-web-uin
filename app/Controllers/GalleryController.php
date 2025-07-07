<?php
// app/controllers/GalleryController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\GalleryItem; // Sertakan model GalleryItem
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Rayon;            // Jika perlu berinteraksi dengan model Rayon
// use App\Models\Activity;         // Jika perlu berinteraksi dengan model Activity
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class GalleryController
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
     * Mengambil daftar semua item galeri yang disetujui (publik).
     * Endpoint: GET /api/gallery
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams(); // Ambil query params
        try {
            $galleryItems = GalleryItem::all('approved'); // Mengambil hanya yang berstatus 'approved'
            if ($galleryItems === false) {
                return $this->response->json(['message' => 'Gagal mengambil data galeri.'], 500);
            }
            return $this->response->json($galleryItems, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil galeri.'], 500);
        }
    }

    /**
     * Mengambil detail item galeri berdasarkan ID.
     * Endpoint: GET /api/gallery/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID item galeri tidak ditemukan.'], 400);
        }

        try {
            $galleryItem = GalleryItem::find($id);

            if ($galleryItem) {
                // Opsional: Gabungkan dengan nama pengaju/rayon/kegiatan terkait jika diperlukan
                // if ($galleryItem['submitted_by_user_id']) {
                //     $user = \App\Models\User::find($galleryItem['submitted_by_user_id']);
                //     if ($user) $galleryItem['submitted_by_user_name'] = $user['name'];
                // }
                // if ($galleryItem['submitted_by_rayon_id']) {
                //     $rayon = \App\Models\Rayon::find($galleryItem['submitted_by_rayon_id']);
                //     if ($rayon) $galleryItem['submitted_by_rayon_name'] = $rayon['name'];
                // }
                // if ($galleryItem['related_activity_id']) {
                //     $activity = \App\Models\Activity::find($galleryItem['related_activity_id']);
                //     if ($activity) $galleryItem['related_activity_title'] = $activity['title'];
                // }

                return $this->response->json($galleryItem, 200);
            } else {
                return $this->response->json(['message' => 'Item galeri tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail item galeri.'], 500);
        }
    }

    /**
     * Mengunggah item galeri baru.
     * Endpoint: POST /api/gallery
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
        $requiredFields = ['image_url']; // image_url adalah wajib
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        try {
            $dataToCreate = [
                'caption' => $requestData['caption'] ?? null,
                'image_url' => $requestData['image_url'],
                'upload_date' => $requestData['upload_date'] ?? date('Y-m-d'),
                'related_activity_id' => $requestData['related_activity_id'] ?? null,
                'submitted_by_user_id' => $loggedInUser['user_id'] ?? null, // ID pengguna yang mengajukan
                'submitted_by_rayon_id' => ($loggedInUser && $loggedInUser['user_role'] === 'rayon') ? ($loggedInUser['rayon_id'] ?? null) : null,
                'status' => 'pending', // Default status saat diunggah
            ];

            $newItemId = GalleryItem::create($dataToCreate);

            if ($newItemId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Upload Gallery Item',
                //     'description' => 'Item galeri baru (ID: ' . $newItemId . ') diunggah.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newItemId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat
                // \App\Services\NotificationService::sendNotification('Unggahan Galeri Baru', 'Item galeri baru diunggah oleh ' . ($loggedInUser['user_name'] ?? 'Rayon') . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Item galeri berhasil diunggah!', 'id' => $newItemId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mengunggah item galeri.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengunggah item galeri.'], 500);
        }
    }

    /**
     * Memperbarui item galeri yang sudah ada.
     * Endpoint: PUT /api/gallery/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID item galeri)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID item galeri tidak ditemukan.'], 400);
        }

        // Validasi input
        if (empty($requestData['image_url'])) { // image_url tetap wajib
            return $this->response->json(['message' => 'URL gambar wajib diisi.'], 400);
        }

        try {
            $galleryItem = GalleryItem::find($id);
            if (!$galleryItem) {
                return $this->response->json(['message' => 'Item galeri tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa mengedit
            // if ($loggedInUser['user_role'] === 'rayon' && $galleryItem['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan mengedit item galeri rayon lain.'], 403);
            // }

            $dataToUpdate = [
                'caption' => $requestData['caption'] ?? $galleryItem['caption'],
                'image_url' => $requestData['image_url'],
                'upload_date' => $requestData['upload_date'] ?? $galleryItem['upload_date'],
                'related_activity_id' => $requestData['related_activity_id'] ?? $galleryItem['related_activity_id'],
                'status' => $requestData['status'] ?? $galleryItem['status'], // Status juga bisa diupdate
            ];

            $updated = GalleryItem::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Gallery Item',
                //     'description' => 'Item galeri (ID: ' . $id . ') diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Item galeri berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui item galeri.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui item galeri.'], 500);
        }
    }

    /**
     * Menghapus item galeri.
     * Endpoint: DELETE /api/gallery/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID item galeri)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID item galeri tidak ditemukan.'], 400);
        }

        try {
            $galleryItem = GalleryItem::find($id);
            if (!$galleryItem) {
                return $this->response->json(['message' => 'Item galeri tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa menghapus
            // if ($loggedInUser['user_role'] === 'rayon' && $galleryItem['submitted_by_rayon_id'] !== $loggedInUser['rayon_id']) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan menghapus item galeri rayon lain.'], 403);
            // }

            $deleted = GalleryItem::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Gallery Item',
                //     'description' => 'Item galeri dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Item galeri berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menghapus item galeri.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus item galeri.'], 500);
        }
    }

    /**
     * Mengambil daftar item galeri yang berstatus 'pending' (untuk verifikasi).
     * Endpoint: GET /api/gallery/pending
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function pending()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $pendingItems = GalleryItem::all('pending');
            if ($pendingItems === false) {
                return $this->response->json(['message' => 'Gagal mengambil data galeri pending.'], 500);
            }
            return $this->response->json($pendingItems, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@pending: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil galeri pending.'], 500);
        }
    }

    /**
     * Menyetujui item galeri.
     * Endpoint: PUT /api/gallery/{id}/approve
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID item galeri)
     * @return void Respons JSON akan dikirim langsung
     */
    public function approve($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID item galeri tidak ditemukan.'], 400);
        }

        try {
            $updated = GalleryItem::updateStatus($id, 'approved');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Approve Gallery Item',
                //     'description' => 'Item galeri dengan ID ' . $id . ' disetujui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengunggah (jika ada)
                // $item = GalleryItem::find($id);
                // if ($item && $item['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Item Galeri Disetujui', 'Item galeri Anda (ID: ' . $id . ') telah disetujui dan dipublikasikan.', 'success', 'user', $item['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Item galeri berhasil disetujui.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menyetujui item galeri atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@approve: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menyetujui item galeri.'], 500);
        }
    }

    /**
     * Menolak item galeri.
     * Endpoint: PUT /api/gallery/{id}/reject
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID item galeri)
     * @return void Respons JSON akan dikirim langsung
     */
    public function reject($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID item galeri tidak ditemukan.'], 400);
        }

        try {
            $updated = GalleryItem::updateStatus($id, 'rejected');

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Reject Gallery Item',
                //     'description' => 'Item galeri dengan ID ' . $id . ' ditolak.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengunggah (jika ada)
                // $item = GalleryItem::find($id);
                // if ($item && $item['submitted_by_user_id']) {
                //     \App\Services\NotificationService::sendNotification('Item Galeri Ditolak', 'Item galeri Anda (ID: ' . $id . ') telah ditolak. Mohon periksa kembali item Anda.', 'error', 'user', $item['submitted_by_user_id']);
                // }

                return $this->response->json(['message' => 'Item galeri berhasil ditolak.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menolak item galeri atau tidak ada perubahan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in GalleryController@reject: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menolak item galeri.'], 500);
        }
    }
}
