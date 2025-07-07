<?php
// app/models/DigilibItem.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User;           // Import model User jika sudah dibuat
// use App\Models\Rayon;          // Import model Rayon jika sudah dibuat
// use App\Models\DigilibCategory; // Import model DigilibCategory jika sudah dibuat

class DigilibItem // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'digilib_items';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'category_id',
        'title',
        'author',
        'abstract_description',
        'file_url',
        'file_name',
        'publication_year',
        'publisher',
        'isbn',
        'rayon_id',
        'period',
        'status',
        'uploaded_by_user_id',
        'upload_date',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'publication_year' => 'integer',
    //     'upload_date' => 'datetime',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'upload_date' dan 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah item digilib termasuk dalam satu Kategori Digilib.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function category()
    {
        // Asumsi DigilibCategory adalah model yang ada di App\Models\DigilibCategory
        // return $this->belongsTo(DigilibCategory::class, 'category_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah item digilib dapat terkait dengan satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function rayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'rayon_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah item digilib diunggah oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function uploader()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'uploaded_by_user_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua item digilib, dengan opsi filter.
     *
     * @param array $filters Array filter (mis. ['category_id' => 'makalah_kader', 'status' => 'approved'])
     * @return array|false Daftar item digilib atau false jika gagal
     */
    public static function all($filters = [])
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digilib_items";
        $params = [];
        $whereClauses = [];

        if (isset($filters['category_id'])) {
            $whereClauses[] = "category_id = :category_id";
            $params['category_id'] = $filters['category_id'];
        }
        if (isset($filters['status'])) {
            $whereClauses[] = "status = :status";
            $params['status'] = $filters['status'];
        }
        if (isset($filters['rayon_id'])) {
            $whereClauses[] = "rayon_id = :rayon_id";
            $params['rayon_id'] = $filters['rayon_id'];
        }
        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $whereClauses[] = "(title LIKE :search_term OR author LIKE :search_term OR abstract_description LIKE :search_term)";
            $params['search_term'] = $searchTerm;
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY upload_date DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari item digilib berdasarkan ID.
     *
     * @param int $id ID item digilib
     * @return array|false Data item digilib atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digilib_items WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat item digilib baru.
     *
     * @param array $data Data item digilib yang akan disimpan
     * @return int|false ID item digilib baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'author' => $data['author'],
            'abstract_description' => $data['abstract_description'] ?? null,
            'file_url' => $data['file_url'],
            'file_name' => $data['file_name'] ?? null,
            'publication_year' => $data['publication_year'] ?? null,
            'publisher' => $data['publisher'] ?? null,
            'isbn' => $data['isbn'] ?? null,
            'rayon_id' => $data['rayon_id'] ?? null,
            'period' => $data['period'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'uploaded_by_user_id' => $data['uploaded_by_user_id'] ?? null,
            'upload_date' => date('Y-m-d H:i:s'),
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO digilib_items ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating digilib item: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui item digilib yang sudah ada.
     *
     * @param int $id ID item digilib
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

        $sql = "UPDATE digilib_items SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating digilib item {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus item digilib berdasarkan ID.
     *
     * @param int $id ID item digilib
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM digilib_items WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting digilib item {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui status item digilib.
     *
     * @param int $id ID item digilib
     * @param string $newStatus Status baru (approved, rejected, pending)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateStatus($id, $newStatus)
    {
        $db = new Database();
        $sql = "UPDATE digilib_items SET status = :status, last_updated = NOW() WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['status' => $newStatus, 'id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating status for digilib item {$id}: " . $e->getMessage());
            return false;
        }
    }
}
