<?php
// app/models/SocialMediaLink.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda

class SocialMediaLink // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'social_media_links';

    // Nama kolom primary key
    protected $primaryKey = 'platform';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena primary key adalah string (platform)

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'platform',
        'url',
        'is_active',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'is_active' => 'boolean',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua tautan media sosial, atau yang aktif saja.
     *
     * @param bool $onlyActive Mengambil hanya tautan yang aktif
     * @return array|false Daftar tautan media sosial atau false jika gagal
     */
    public static function all($onlyActive = false)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM social_media_links";
        $params = [];

        if ($onlyActive) {
            $sql .= " WHERE is_active = TRUE";
        }
        $sql .= " ORDER BY platform ASC"; // Urutkan berdasarkan platform

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari tautan media sosial berdasarkan platform.
     *
     * @param string $platform Nama platform (mis. 'instagram')
     * @return array|false Data tautan media sosial atau false jika tidak ditemukan
     */
    public static function find($platform)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM social_media_links WHERE platform = :platform";
        return $db->fetch($sql, ['platform' => $platform]);
    }

    /**
     * Membuat tautan media sosial baru.
     *
     * @param array $data Data tautan media sosial yang akan disimpan
     * @return string|false Nama platform baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'platform' => $data['platform'],
            'url' => $data['url'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO social_media_links ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['platform'];
        } catch (PDOException $e) {
            error_log("Error creating social media link: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui tautan media sosial yang sudah ada.
     *
     * @param string $platform Nama platform
     * @param array $data Data yang akan diperbarui
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($platform, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $setParts = [];
        $params = ['platform' => $platform];

        foreach ($data as $key => $value) {
            if (in_array($key, (new self())->fillable) && $key !== 'platform') {
                $setParts[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE social_media_links SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE platform = :platform";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating social media link {$platform}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus tautan media sosial berdasarkan platform.
     *
     * @param string $platform Nama platform
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($platform)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM social_media_links WHERE platform = :platform";
        try {
            $stmt = $db->query($sql, ['platform' => $platform]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting social media link {$platform}: " . $e->getMessage());
            return false;
        }
    }
}
