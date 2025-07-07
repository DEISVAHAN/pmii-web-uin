<?php
// app/models/DigitalSignature.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User;           // Import model User jika sudah dibuat
// use App\Models\SuratSubmission; // Import model SuratSubmission jika sudah dibuat

class DigitalSignature // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'digital_signatures';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena ID bisa berupa string unik atau nomor surat

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'qr_type',
        'document_ref_id',
        'nomor_surat',
        'signed_by_name',
        'signed_by_position',
        'signed_date',
        'perihal_surat',
        'link_url',
        'link_title',
        'link_description',
        'link_creator',
        'qr_code_value',
        'logo_url_in_qr',
        'generated_by_user_id',
        'generated_at',
        'is_valid'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'signed_date' => 'date',
    //     'generated_at' => 'datetime',
    //     'is_valid' => 'boolean',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'generated_at' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah tanda tangan digital diajukan oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function generatedBy()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'generated_by_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah tanda tangan digital dapat terkait dengan satu pengajuan surat.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function documentReference()
    {
        // Asumsi SuratSubmission adalah model yang ada di App\Models\SuratSubmission
        // return $this->belongsTo(SuratSubmission::class, 'document_ref_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua tanda tangan digital atau QR link.
     *
     * @param string|null $qrType Filter berdasarkan tipe QR (mis. 'ttdDigital', 'accessLink')
     * @return array|false Daftar item atau false jika gagal
     */
    public static function all($qrType = null)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digital_signatures";
        $params = [];

        if ($qrType) {
            $sql .= " WHERE qr_type = :qr_type";
            $params['qr_type'] = $qrType;
        }
        $sql .= " ORDER BY generated_at DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari tanda tangan digital atau QR link berdasarkan ID.
     *
     * @param string $id ID tanda tangan digital/QR link
     * @return array|false Data item atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM digital_signatures WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat entri tanda tangan digital atau QR link baru.
     *
     * @param array $data Data yang akan disimpan
     * @return string|false ID baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'id' => $data['id'] ?? uniqid('qr_'), // Gunakan ID dari request atau generate unik
            'qr_type' => $data['qr_type'],
            'document_ref_id' => $data['document_ref_id'] ?? null,
            'nomor_surat' => $data['nomor_surat'] ?? null,
            'signed_by_name' => $data['signed_by_name'] ?? null,
            'signed_by_position' => $data['signed_by_position'] ?? null,
            'signed_date' => $data['signed_date'] ?? null,
            'perihal_surat' => $data['perihal_surat'] ?? null,
            'link_url' => $data['link_url'] ?? null,
            'link_title' => $data['link_title'] ?? null,
            'link_description' => $data['link_description'] ?? null,
            'link_creator' => $data['link_creator'] ?? null,
            'qr_code_value' => $data['qr_code_value'], // Ini harus diisi dan unik
            'logo_url_in_qr' => $data['logo_url_in_qr'] ?? null,
            'generated_by_user_id' => $data['generated_by_user_id'] ?? null,
            'generated_at' => date('Y-m-d H:i:s'),
            'is_valid' => $data['is_valid'] ?? true,
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO digital_signatures ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['id'];
        } catch (PDOException $e) {
            // Log error, terutama untuk constraint UNIK pada qr_code_value
            error_log("Error creating digital signature: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui entri tanda tangan digital atau QR link yang sudah ada.
     *
     * @param string $id ID item
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

        $sql = "UPDATE digital_signatures SET " . implode(', ', $setParts) . " WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating digital signature {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus entri tanda tangan digital atau QR link berdasarkan ID.
     *
     * @param string $id ID item
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM digital_signatures WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting digital signature {$id}: " . $e->getMessage());
            return false;
        }
    }
}
