<?php
// app/models/SuratSubmission.php

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

class SuratSubmission // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'surat_submissions';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena ID bisa berupa nomor surat atau uniqid

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'type',
        'applicant_user_id',
        'applicant_name',
        'applicant_role',
        'applicant_rayon_id',
        'submission_date',
        'status',
        'admin_comment',
        'title',
        'content',
        'target_destination',
        'file_url',
        'file_database_pelantikan_url',
        'file_permohonan_rekomendasi_pelantikan_url',
        'file_lpj_kepengurusan_url',
        'file_berita_acara_rtar_url',
        'file_berita_acara_tim_formatur_url',
        'file_struktur_kepengurusan_url',
        'file_database_rtar_url',
        'file_permohonan_rekomendasi_rtar_url',
        'file_suket_mapaba_url',
        'file_hasil_screening_pkd_url',
        'file_rekomendasi_pkd_rayon_url',
        'verification_date',
        'verified_by_user_id',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'submission_date' => 'date',
    //     'verification_date' => 'datetime',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah pengajuan surat dimiliki oleh satu User (pengaju).
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function applicant()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'applicant_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah pengajuan surat dapat terkait dengan satu Rayon (pengaju).
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function applicantRayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'applicant_rayon_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah pengajuan surat dapat diverifikasi oleh satu User (admin).
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function verifier()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'verified_by_user_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua pengajuan surat.
     *
     * @return array|false Daftar pengajuan surat atau false jika gagal
     */
    public static function all()
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM surat_submissions";
        return $db->fetchAll($sql);
    }

    /**
     * Mencari pengajuan surat berdasarkan ID.
     *
     * @param string $id ID pengajuan surat
     * @return array|false Data pengajuan surat atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM surat_submissions WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat pengajuan surat baru.
     *
     * @param array $data Data pengajuan surat yang akan disimpan
     * @return string|false ID pengajuan surat baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'id' => $data['id'],
            'type' => $data['type'],
            'applicant_user_id' => $data['applicant_user_id'],
            'applicant_name' => $data['applicant_name'],
            'applicant_role' => $data['applicant_role'],
            'applicant_rayon_id' => $data['applicant_rayon_id'] ?? null,
            'submission_date' => $data['submission_date'],
            'status' => $data['status'] ?? 'pending',
            'admin_comment' => $data['admin_comment'] ?? null,
            'title' => $data['title'],
            'content' => $data['content'] ?? null,
            'target_destination' => $data['target_destination'] ?? null,
            'file_url' => $data['file_url'] ?? null,
            'file_database_pelantikan_url' => $data['file_database_pelantikan_url'] ?? null,
            'file_permohonan_rekomendasi_pelantikan_url' => $data['file_permohonan_rekomendasi_pelantikan_url'] ?? null,
            'file_lpj_kepengurusan_url' => $data['file_lpj_kepengurusan_url'] ?? null,
            'file_berita_acara_rtar_url' => $data['file_berita_acara_rtar_url'] ?? null,
            'file_berita_acara_tim_formatur_url' => $data['file_berita_acara_tim_formatur_url'] ?? null,
            'file_struktur_kepengurusan_url' => $data['file_struktur_kepengurusan_url'] ?? null,
            'file_database_rtar_url' => $data['file_database_rtar_url'] ?? null,
            'file_permohonan_rekomendasi_rtar_url' => $data['file_permohonan_rekomendasi_rtar_url'] ?? null,
            'file_suket_mapaba_url' => $data['file_suket_mapaba_url'] ?? null,
            'file_hasil_screening_pkd_url' => $data['file_hasil_screening_pkd_url'] ?? null,
            'file_rekomendasi_pkd_rayon_url' => $data['file_rekomendasi_pkd_rayon_url'] ?? null,
            'verification_date' => $data['verification_date'] ?? null,
            'verified_by_user_id' => $data['verified_by_user_id'] ?? null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        // Bangun query INSERT secara dinamis berdasarkan kolom yang ada di $params
        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO surat_submissions ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['id'];
        } catch (PDOException $e) {
            error_log("Error creating surat submission: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui pengajuan surat yang sudah ada.
     *
     * @param string $id ID pengajuan surat
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

        $sql = "UPDATE surat_submissions SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating surat submission {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus pengajuan surat berdasarkan ID.
     *
     * @param string $id ID pengajuan surat
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM surat_submissions WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting surat submission {$id}: " . $e->getMessage());
            return false;
        }
    }
}
