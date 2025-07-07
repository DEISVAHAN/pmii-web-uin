<?php
// app/models/ScientificWork.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat

class ScientificWork // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'scientific_works';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'title',
        'author_name',
        'author_user_id',
        'type',
        'abstract',
        'publication_year',
        'publisher',
        'isbn',
        'file_url',
        'upload_date',
        'status',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'publication_year' => 'integer',
    //     'upload_date' => 'date',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'upload_date' dan 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah karya ilmiah diunggah/ditulis oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function authorUser()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'author_user_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua karya ilmiah, dengan opsi filter.
     *
     * @param array $filters Array filter (mis. ['type' => 'Jurnal', 'status' => 'approved'])
     * @return array|false Daftar karya ilmiah atau false jika gagal
     */
    public static function all($filters = [])
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM scientific_works";
        $params = [];
        $whereClauses = [];

        if (isset($filters['type'])) {
            $whereClauses[] = "type = :type";
            $params['type'] = $filters['type'];
        }
        if (isset($filters['status'])) {
            $whereClauses[] = "status = :status";
            $params['status'] = $filters['status'];
        }
        if (isset($filters['author_user_id'])) {
            $whereClauses[] = "author_user_id = :author_user_id";
            $params['author_user_id'] = $filters['author_user_id'];
        }
        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $whereClauses[] = "(title LIKE :search_term OR author_name LIKE :search_term OR abstract LIKE :search_term)";
            $params['search_term'] = $searchTerm;
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY upload_date DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari karya ilmiah berdasarkan ID.
     *
     * @param int $id ID karya ilmiah
     * @return array|false Data karya ilmiah atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM scientific_works WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat karya ilmiah baru.
     *
     * @param array $data Data karya ilmiah yang akan disimpan
     * @return int|false ID karya ilmiah baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'title' => $data['title'],
            'author_name' => $data['author_name'],
            'author_user_id' => $data['author_user_id'] ?? null,
            'type' => $data['type'],
            'abstract' => $data['abstract'] ?? null,
            'publication_year' => $data['publication_year'] ?? null,
            'publisher' => $data['publisher'] ?? null,
            'isbn' => $data['isbn'] ?? null,
            'file_url' => $data['file_url'],
            'upload_date' => $data['upload_date'] ?? date('Y-m-d'),
            'status' => $data['status'] ?? 'pending',
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO scientific_works ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating scientific work: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui karya ilmiah yang sudah ada.
     *
     * @param int $id ID karya ilmiah
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

        $sql = "UPDATE scientific_works SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating scientific work {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus karya ilmiah berdasarkan ID.
     *
     * @param int $id ID karya ilmiah
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM scientific_works WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting scientific work {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui status karya ilmiah.
     *
     * @param int $id ID karya ilmiah
     * @param string $newStatus Status baru (approved, rejected, pending)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateStatus($id, $newStatus)
    {
        $db = new Database();
        $sql = "UPDATE scientific_works SET status = :status, last_updated = NOW() WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['status' => $newStatus, 'id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating status for scientific work {$id}: " . $e->getMessage());
            return false;
        }
    }
}
