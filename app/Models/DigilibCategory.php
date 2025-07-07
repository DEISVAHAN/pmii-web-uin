<?php
// app/models/DigilibCategory.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda

class DigilibCategory // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'digilib_categories';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena ID adalah string (mis. 'makalah_kader')

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'name',
        'description',
        'icon_class',
        'target_page_url',
        'is_external_link',
        'is_active'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'is_external_link' => 'boolean',
    //     'is_active' => 'boolean',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena tabel ini tidak memiliki kolom timestamps

    /**
     * Definisi relasi: Sebuah kategori digilib dapat memiliki banyak item digilib.
     *
     * @return object Relasi HasMany (contoh untuk Eloquent ORM)
     */
    public function items()
    {
        // Asumsi DigilibItem adalah model yang ada di App\Models\DigilibItem
        // return $this->hasMany(DigilibItem::class, 'category_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua kategori digilib, dengan opsi filter.
     *
     * @param bool $onlyActive Mengambil hanya kategori yang aktif
     * @return array|false Daftar kategori atau false jika gagal
     */
    public static function all($onlyActive = false)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digilib_categories";
        $params = [];

        if ($onlyActive) {
            $sql .= " WHERE is_active = TRUE";
        }
        $sql .= " ORDER BY name ASC"; // Urutkan berdasarkan nama

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari kategori digilib berdasarkan ID.
     *
     * @param string $id ID kategori
     * @return array|false Data kategori atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digilib_categories WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat kategori digilib baru.
     *
     * @param array $data Data kategori yang akan disimpan
     * @return string|false ID kategori baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'id' => $data['id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'icon_class' => $data['icon_class'] ?? null,
            'target_page_url' => $data['target_page_url'] ?? null,
            'is_external_link' => $data['is_external_link'] ?? false,
            'is_active' => $data['is_active'] ?? true,
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO digilib_categories ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['id'];
        } catch (PDOException $e) {
            error_log("Error creating digilib category: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui kategori digilib yang sudah ada.
     *
     * @param string $id ID kategori
     * @param array $data Data yang akan diperbarui
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($id, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $setParts = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, (new self())->fillable) && $key !== 'id') {
                $setParts[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE digilib_categories SET " . implode(', ', $setParts) . " WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating digilib category {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus kategori digilib berdasarkan ID.
     *
     * @param string $id ID kategori
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        // Perhatian: Jika ada item di digilib_items yang merujuk kategori ini,
        // Anda perlu menangani relasi (mis. set null, hapus cascade, atau tolak penghapusan).
        // Skema DB Anda menggunakan ON DELETE RESTRICT, jadi ini akan gagal jika ada item terkait.
        $sql = "DELETE FROM digilib_categories WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting digilib category {$id}: " . $e->getMessage());
            return false;
        }
    }
}
