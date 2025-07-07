<?php
// app/models/KepengurusanArchive.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User;  // Import model User jika sudah dibuat
// use App\Models\Rayon; // Import model Rayon jika sudah dibuat

class KepengurusanArchive // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'kepengurusan_archives';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena ID bisa berupa string unik

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'rayon_id',
        'nama_rayon',
        'periode',
        'ketua',
        'sekretaris',
        'bendahara',
        'jumlah_kader',
        'tanggal_berdiri_periode',
        'uploaded_by_user_id',
        'uploaded_date',
        'file_sk_url',
        'other_files_json', // Kolom JSON
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'tanggal_berdiri_periode' => 'date',
    //     'uploaded_date' => 'datetime',
    //     'other_files_json' => 'array', // Mengubah kolom JSON menjadi array/objek PHP
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah arsip kepengurusan diunggah oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function uploader()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'uploaded_by_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah arsip kepengurusan terkait dengan satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function rayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'rayon_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua arsip kepengurusan, dengan opsi filter.
     *
     * @param array $filters Array filter (mis. ['rayon_id' => 'rayon_ushuluddin'])
     * @return array|false Daftar arsip atau false jika gagal
     */
    public static function all($filters = [])
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM kepengurusan_archives";
        $params = [];
        $whereClauses = [];

        if (isset($filters['rayon_id'])) {
            $whereClauses[] = "rayon_id = :rayon_id";
            $params['rayon_id'] = $filters['rayon_id'];
        }
        if (isset($filters['periode'])) {
            $whereClauses[] = "periode = :periode";
            $params['periode'] = $filters['periode'];
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY tanggal_berdiri_periode DESC, periode DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari arsip kepengurusan berdasarkan ID.
     *
     * @param string $id ID arsip kepengurusan
     * @return array|false Data arsip atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM kepengurusan_archives WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat arsip kepengurusan baru.
     *
     * @param array $data Data arsip kepengurusan yang akan disimpan
     * @return string|false ID arsip baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'id' => $data['id'], // ID harus unik, bisa kombinasi rayon_id, periode, timestamp
            'rayon_id' => $data['rayon_id'],
            'nama_rayon' => $data['nama_rayon'],
            'periode' => $data['periode'],
            'ketua' => $data['ketua'],
            'sekretaris' => $data['sekretaris'],
            'bendahara' => $data['bendahara'],
            'jumlah_kader' => $data['jumlah_kader'] ?? 0,
            'tanggal_berdiri_periode' => $data['tanggal_berdiri_periode'] ?? null,
            'uploaded_by_user_id' => $data['uploaded_by_user_id'] ?? null,
            'uploaded_date' => date('Y-m-d H:i:s'),
            'file_sk_url' => $data['file_sk_url'] ?? null,
            'other_files_json' => isset($data['other_files_json']) ? json_encode($data['other_files_json']) : null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO kepengurusan_archives ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['id'];
        } catch (PDOException $e) {
            error_log("Error creating kepengurusan archive: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui arsip kepengurusan yang sudah ada.
     *
     * @param string $id ID arsip
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
                // Encode JSON kolom jika diperlukan
                $params[$key] = ($key === 'other_files_json') ? json_encode($value) : $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE kepengurusan_archives SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating kepengurusan archive {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus arsip kepengurusan berdasarkan ID.
     *
     * @param string $id ID arsip
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM kepengurusan_archives WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting kepengurusan archive {$id}: " . $e->getMessage());
            return false;
        }
    }
}
