<?php
// app/models/HomepageSection.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda

class HomepageSection // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'homepage_sections';

    // Nama kolom primary key
    protected $primaryKey = 'section_name';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena primary key adalah string (section_name)

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'section_name',
        'content_json',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'content_json' => 'array', // Mengubah kolom JSON menjadi array/objek PHP
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua bagian beranda.
     *
     * @return array|false Daftar bagian beranda atau false jika gagal
     */
    public static function all()
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM homepage_sections";
        return $db->fetchAll($sql);
    }

    /**
     * Mencari bagian beranda berdasarkan nama (section_name).
     *
     * @param string $sectionName Nama bagian beranda (mis. 'hero', 'about')
     * @return array|false Data bagian beranda atau false jika tidak ditemukan
     */
    public static function find($sectionName)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM homepage_sections WHERE section_name = :section_name";
        return $db->fetch($sql, ['section_name' => $sectionName]);
    }

    /**
     * Membuat bagian beranda baru.
     *
     * @param array $data Data bagian beranda yang akan disimpan (section_name, content_json)
     * @return string|false Nama bagian beranda baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'section_name' => $data['section_name'],
            'content_json' => isset($data['content_json']) ? json_encode($data['content_json']) : null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO homepage_sections ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['section_name'];
        } catch (PDOException $e) {
            error_log("Error creating homepage section: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui bagian beranda yang sudah ada.
     *
     * @param string $sectionName Nama bagian beranda
     * @param array $data Data yang akan diperbarui (content_json)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($sectionName, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $setParts = [];
        $params = ['section_name' => $sectionName];

        foreach ($data as $key => $value) {
            if (in_array($key, (new self())->fillable) && $key !== 'section_name') {
                $setParts[] = "`{$key}` = :{$key}";
                // Encode JSON kolom jika diperlukan
                $params[$key] = ($key === 'content_json') ? json_encode($value) : $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE homepage_sections SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE section_name = :section_name";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating homepage section {$sectionName}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus bagian beranda berdasarkan nama.
     *
     * @param string $sectionName Nama bagian beranda
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($sectionName)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM homepage_sections WHERE section_name = :section_name";
        try {
            $stmt = $db->query($sql, ['section_name' => $sectionName]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting homepage section {$sectionName}: " . $e->getMessage());
            return false;
        }
    }
}
