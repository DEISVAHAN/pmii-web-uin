<?php
// app/models/NewsArticle.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat
// use App\Models\Rayon; // Import model Rayon jika sudah dibuat

class NewsArticle // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'news_articles';

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
        'category',
        'image_url',
        'description',
        'publication_date',
        'submitted_by_user_id',
        'submitted_by_rayon_id',
        'status',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'publication_date' => 'date',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah berita/artikel diajukan oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedBy()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'submitted_by_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah berita/artikel dapat terkait dengan satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedByRayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'submitted_by_rayon_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua berita/artikel.
     *
     * @param string|null $status Filter berdasarkan status (mis. 'approved', 'pending')
     * @return array|false Daftar berita/artikel atau false jika gagal
     */
    public static function all($status = null)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM news_articles";
        $params = [];

        if ($status) {
            $sql .= " WHERE status = :status";
            $params['status'] = $status;
        }
        $sql .= " ORDER BY publication_date DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari berita/artikel berdasarkan ID.
     *
     * @param int $id ID berita/artikel
     * @return array|false Data berita/artikel atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM news_articles WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat berita/artikel baru.
     *
     * @param array $data Data berita/artikel yang akan disimpan
     * @return int|false ID berita/artikel baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'title' => $data['title'],
            'category' => $data['category'],
            'image_url' => $data['image_url'] ?? null,
            'description' => $data['description'],
            'publication_date' => $data['publication_date'] ?? date('Y-m-d'),
            'submitted_by_user_id' => $data['submitted_by_user_id'] ?? null,
            'submitted_by_rayon_id' => $data['submitted_by_rayon_id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO news_articles ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating news article: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui berita/artikel yang sudah ada.
     *
     * @param int $id ID berita/artikel
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

        $sql = "UPDATE news_articles SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating news article {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus berita/artikel berdasarkan ID.
     *
     * @param int $id ID berita/artikel
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM news_articles WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting news article {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui status berita/artikel.
     *
     * @param int $id ID berita/artikel
     * @param string $newStatus Status baru (approved, rejected, pending, draft)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateStatus($id, $newStatus)
    {
        $db = new Database();
        $sql = "UPDATE news_articles SET status = :status, last_updated = NOW() WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['status' => $newStatus, 'id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating status for news article {$id}: " . $e->getMessage());
            return false;
        }
    }
}
