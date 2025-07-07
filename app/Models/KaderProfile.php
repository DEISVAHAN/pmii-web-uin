<?php
// app/models/KaderProfile.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat

class KaderProfile // Jika menggunakan framework, ini mungkin extends suatu Base Model (mis. extends Illuminate\Database\Eloquent\Model)
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'kaders_profile';

    // Nama kolom primary key jika bukan 'id'
    protected $primaryKey = 'user_id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false;

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    // Pastikan semua kolom yang akan diisi melalui form atau API ada di sini
    protected $fillable = [
        'user_id',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat_lengkap',
        'provinsi',
        'kota_kabupaten',
        'kecamatan',
        'desa_kelurahan',
        'kampung_komplek_perumahan',
        'rt',
        'rw',
        'no_hp',
        'email_pribadi',
        'universitas',
        'fakultas',
        'jurusan',
        'tahun_masuk_kuliah',
        'status_mahasiswa',
        'ipk',
        'tahun_masuk_pmii',
        'riwayat_jabatan',
        'keahlian_minat',
        'media_sosial', // Ini adalah kolom JSON
        'karya_tulis_kontribusi',
        'profile_picture_url',
        'ipk_transcript_file_url',
        'ktp_file_url',
        'ktm_file_url',
        'sertifikat_kaderisasi_file_url',
        'last_updated' // Ini akan diupdate otomatis oleh database jika diatur
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'tanggal_lahir' => 'date',
    //     'media_sosial' => 'array', // Mengubah kolom JSON menjadi array/objek PHP
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah KaderProfile dimiliki oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function user()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'user_id', 'id');
        // Jika tidak menggunakan ORM, relasi ini akan dihandle di controller
        // dengan melakukan query terpisah.
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mencari profil kader berdasarkan user_id.
     *
     * @param string $userId ID pengguna
     * @return array|false Data profil kader atau false jika tidak ditemukan
     */
    public static function findByUserId($userId)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM kaders_profile WHERE user_id = :user_id";
        return $db->fetch($sql, ['user_id' => $userId]);
    }

    /**
     * Membuat profil kader baru.
     *
     * @param array $data Data profil kader yang akan disimpan
     * @return string|false user_id jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        // Pastikan semua field yang diisi ada di $data, gunakan nilai default jika tidak ada
        $params = [
            'user_id' => $data['user_id'],
            'nik' => $data['nik'] ?? null,
            'tempat_lahir' => $data['tempat_lahir'] ?? null,
            'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
            'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
            'alamat_lengkap' => $data['alamat_lengkap'] ?? null,
            'provinsi' => $data['provinsi'] ?? null,
            'kota_kabupaten' => $data['kota_kabupaten'] ?? null,
            'kecamatan' => $data['kecamatan'] ?? null,
            'desa_kelurahan' => $data['desa_kelurahan'] ?? null,
            'kampung_komplek_perumahan' => $data['kampung_komplek_perumahan'] ?? null,
            'rt' => $data['rt'] ?? null,
            'rw' => $data['rw'] ?? null,
            'no_hp' => $data['no_hp'] ?? null,
            'email_pribadi' => $data['email_pribadi'] ?? null,
            'universitas' => $data['universitas'] ?? null,
            'fakultas' => $data['fakultas'] ?? null,
            'jurusan' => $data['jurusan'] ?? null,
            'tahun_masuk_kuliah' => $data['tahun_masuk_kuliah'] ?? null,
            'status_mahasiswa' => $data['status_mahasiswa'] ?? null,
            'ipk' => $data['ipk'] ?? null,
            'tahun_masuk_pmii' => $data['tahun_masuk_pmii'] ?? null,
            'riwayat_jabatan' => $data['riwayat_jabatan'] ?? null,
            'keahlian_minat' => $data['keahlian_minat'] ?? null,
            'media_sosial' => isset($data['media_sosial']) ? json_encode($data['media_sosial']) : null,
            'karya_tulis_kontribusi' => $data['karya_tulis_kontribusi'] ?? null,
            'profile_picture_url' => $data['profile_picture_url'] ?? null,
            'ipk_transcript_file_url' => $data['ipk_transcript_file_url'] ?? null,
            'ktp_file_url' => $data['ktp_file_url'] ?? null,
            'ktm_file_url' => $data['ktm_file_url'] ?? null,
            'sertifikat_kaderisasi_file_url' => $data['sertifikat_kaderisasi_file_url'] ?? null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $sql = "INSERT INTO kaders_profile (user_id, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat_lengkap, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kampung_komplek_perumahan, rt, rw, no_hp, email_pribadi, universitas, fakultas, jurusan, tahun_masuk_kuliah, status_mahasiswa, ipk, tahun_masuk_pmii, riwayat_jabatan, keahlian_minat, media_sosial, karya_tulis_kontribusi, profile_picture_url, ipk_transcript_file_url, ktp_file_url, ktm_file_url, sertifikat_kaderisasi_file_url, last_updated)
                VALUES (:user_id, :nik, :tempat_lahir, :tanggal_lahir, :jenis_kelamin, :alamat_lengkap, :provinsi, :kota_kabupaten, :kecamatan, :desa_kelurahan, :kampung_komplek_perumahan, :rt, :rw, :no_hp, :email_pribadi, :universitas, :fakultas, :jurusan, :tahun_masuk_kuliah, :status_mahasiswa, :ipk, :tahun_masuk_pmii, :riwayat_jabatan, :keahlian_minat, :media_sosial, :karya_tulis_kontribusi, :profile_picture_url, :ipk_transcript_file_url, :ktp_file_url, :ktm_file_url, :sertifikat_kaderisasi_file_url, :last_updated)";
        
        try {
            $db->query($sql, $params);
            return $params['user_id'];
        } catch (PDOException $e) {
            error_log("Error creating kader profile: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui profil kader yang sudah ada.
     *
     * @param string $userId ID pengguna
     * @param array $data Data profil kader yang akan diperbarui
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($userId, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        // Bangun bagian SET dari query secara dinamis
        $setParts = [];
        $params = ['user_id' => $userId];

        foreach ($data as $key => $value) {
            // Hanya perbarui kolom yang ada di fillable dan bukan primary key
            if (in_array($key, (new self())->fillable) && $key !== 'user_id') {
                $setParts[] = "`{$key}` = :{$key}";
                // Encode JSON kolom jika diperlukan
                $params[$key] = ($key === 'media_sosial') ? json_encode($value) : $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE kaders_profile SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE user_id = :user_id";

        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0; // Mengembalikan true jika ada baris yang terpengaruh
        } catch (PDOException $e) {
            error_log("Error updating kader profile for user {$userId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus profil kader berdasarkan user_id.
     *
     * @param string $userId ID pengguna
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($userId)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM kaders_profile WHERE user_id = :user_id";
        try {
            $stmt = $db->query($sql, ['user_id' => $userId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting kader profile for user {$userId}: " . $e->getMessage());
            return false;
        }
    }
}
