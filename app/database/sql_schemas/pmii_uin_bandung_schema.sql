-- Skema Database MySQL untuk Sistem Internal PMII UIN Sunan Gunung Djati Cabang Kota Bandung

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS pmii_uin_bandung;

-- Gunakan database yang baru dibuat
USE pmii_uin_bandung;

-- --------------------------------------------------------
-- Struktur Tabel untuk `users` (Manajemen Akun Pengguna)
-- Mengelola informasi login dan peran pengguna dalam sistem.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(255) PRIMARY KEY COMMENT 'ID unik pengguna (mis. acc-1, NIM kader, username admin)',
    `name` VARCHAR(255) NOT NULL COMMENT 'Nama lengkap pengguna',
    `nim_username` VARCHAR(255) UNIQUE NULL COMMENT 'NIM untuk kader, username unik untuk admin/rayon',
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email pengguna, digunakan untuk login dan notifikasi',
    `password` VARCHAR(255) NOT NULL COMMENT 'Hash password pengguna',
    `role` ENUM('kader', 'rayon', 'komisariat') NOT NULL COMMENT 'Peran pengguna dalam organisasi',
    `jabatan` VARCHAR(255) NULL COMMENT 'Jabatan pengguna (mis. Ketua, Sekretaris, Anggota)',
    `rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika role adalah kader atau rayon',
    `klasifikasi` VARCHAR(255) NULL COMMENT 'Tingkat klasifikasi kader (mis. Kader Mujahid, Kader Mu''taqid)',
    `status_akun` ENUM('aktif', 'nonaktif', 'alumni') NOT NULL DEFAULT 'aktif' COMMENT 'Status keaktifan akun',
    `last_login` DATETIME NULL COMMENT 'Timestamp login terakhir pengguna',
    `profile_visibility` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status visibilitas profil untuk publik',
    `notification_emails` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Preferensi menerima email notifikasi',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp pembuatan akun'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk data akun pengguna';

-- --------------------------------------------------------
-- Struktur Tabel untuk `kaders_profile` (Profil Detail Kader)
-- Menyimpan informasi pribadi dan kepengkaderan yang lebih rinci untuk kader.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kaders_profile` (
    `user_id` VARCHAR(255) PRIMARY KEY COMMENT 'Foreign Key ke `users.id` (Primary Key di tabel ini)',
    `nik` VARCHAR(255) UNIQUE NULL COMMENT 'Nomor Induk Kependudukan',
    `tempat_lahir` VARCHAR(255) NULL COMMENT 'Tempat lahir kader',
    `tanggal_lahir` DATE NULL COMMENT 'Tanggal lahir kader',
    `jenis_kelamin` ENUM('Laki-laki', 'Perempuan') NULL COMMENT 'Jenis kelamin kader',
    `alamat_lengkap` TEXT NULL COMMENT 'Alamat lengkap domisili kader',
    `provinsi` VARCHAR(255) NULL COMMENT 'Provinsi domisili',
    `kota_kabupaten` VARCHAR(255) NULL COMMENT 'Kota atau Kabupaten domisili',
    `kecamatan` VARCHAR(255) NULL COMMENT 'Kecamatan domisili',
    `desa_kelurahan` VARCHAR(255) NULL COMMENT 'Desa atau Kelurahan domisili',
    `kampung_komplek_perumahan` VARCHAR(255) NULL COMMENT 'Nama Kampung/Komplek/Perumahan',
    `rt` VARCHAR(10) NULL COMMENT 'Nomor RT',
    `rw` VARCHAR(10) NULL COMMENT 'Nomor RW',
    `no_hp` VARCHAR(50) NULL COMMENT 'Nomor HP atau WhatsApp aktif',
    `email_pribadi` VARCHAR(255) NULL COMMENT 'Email pribadi kader (opsional)',
    `universitas` VARCHAR(255) NULL COMMENT 'Nama Universitas',
    `fakultas` VARCHAR(255) NULL COMMENT 'Nama Fakultas',
    `jurusan` VARCHAR(255) NULL COMMENT 'Nama Jurusan',
    `tahun_masuk_kuliah` INT NULL COMMENT 'Tahun pertama masuk kuliah',
    `status_mahasiswa` ENUM('Aktif', 'Lulus', 'Cuti', 'Nonaktif') NULL COMMENT 'Status mahasiswa',
    `ipk` DECIMAL(3,2) NULL COMMENT 'Indeks Prestasi Kumulatif terakhir',
    `tahun_masuk_pmii` INT NULL COMMENT 'Tahun pertama masuk PMII',
    `riwayat_jabatan` TEXT NULL COMMENT 'Riwayat jabatan dalam PMII atau organisasi lain',
    `keahlian_minat` TEXT NULL COMMENT 'Daftar keahlian atau minat',
    `media_sosial` JSON NULL COMMENT 'Tautan media sosial dalam format JSON array',
    `karya_tulis_kontribusi` TEXT NULL COMMENT 'Daftar karya tulis atau kontribusi kader',
    `profile_picture_url` TEXT NULL COMMENT 'URL atau Base64 foto profil kader',
    `ipk_transcript_file_url` TEXT NULL COMMENT 'URL atau Base64 file transkrip nilai/KHS',
    `ktp_file_url` TEXT NULL COMMENT 'URL atau Base64 file KTP',
    `ktm_file_url` TEXT NULL COMMENT 'URL atau Base64 file KTM',
    `sertifikat_kaderisasi_file_url` TEXT NULL COMMENT 'URL atau Base64 file sertifikat kaderisasi',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk data profil detail kader';

-- Tambahkan Foreign Key ke tabel users
ALTER TABLE `kaders_profile`
ADD CONSTRAINT `fk_kaders_profile_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- --------------------------------------------------------
-- Struktur Tabel untuk `rayons` (Data Profil Rayon)
-- Menyimpan informasi detail untuk setiap rayon.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rayons` (
    `id` VARCHAR(255) PRIMARY KEY COMMENT 'ID unik rayon (mis. rayon_ushuluddin)',
    `name` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Nama lengkap rayon',
    `chairman` VARCHAR(255) NULL COMMENT 'Nama Ketua Rayon',
    `chairman_photo_url` TEXT NULL COMMENT 'URL atau Base64 foto ketua rayon',
    `description` TEXT NULL COMMENT 'Deskripsi singkat atau sejarah rayon',
    `contact_phone` VARCHAR(50) NULL COMMENT 'Nomor telepon kontak rayon',
    `email` VARCHAR(255) NULL COMMENT 'Email kontak rayon',
    `address` TEXT NULL COMMENT 'Alamat sekretariat rayon',
    `instagram_url` TEXT NULL COMMENT 'URL akun Instagram rayon',
    `facebook_url` TEXT NULL COMMENT 'URL akun Facebook rayon',
    `twitter_url` TEXT NULL COMMENT 'URL akun Twitter/X rayon',
    `youtube_url` TEXT NULL COMMENT 'URL channel YouTube rayon',
    `logo_url` TEXT NULL COMMENT 'URL atau Base64 logo rayon',
    `cadre_count` INT DEFAULT 0 COMMENT 'Jumlah kader di rayon',
    `established_date` DATE NULL COMMENT 'Tanggal berdiri rayon',
    `vision` TEXT NULL COMMENT 'Visi rayon',
    `mission` TEXT NULL COMMENT 'Misi rayon',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk data profil rayon';

-- Tambahkan Foreign Key dari `users` ke `rayons`
ALTER TABLE `users`
ADD CONSTRAINT `fk_users_rayon_id` FOREIGN KEY (`rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `surat_submissions` (Pengajuan Surat dan Verifikasi)
-- Mencatat setiap pengajuan surat oleh kader atau rayon, serta status verifikasinya.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `surat_submissions` (
    `id` VARCHAR(255) PRIMARY KEY COMMENT 'Nomor surat atau ID unik pengajuan (mis. REQ-Timestamp)',
    `type` VARCHAR(255) NOT NULL COMMENT 'Jenis surat yang diajukan (mis. Surat Permohonan, Rekomendasi Pelantikan)',
    `applicant_user_id` VARCHAR(255) NOT NULL COMMENT 'Foreign Key ke `users.id` (pengaju surat)',
    `applicant_name` VARCHAR(255) NOT NULL COMMENT 'Nama pengaju surat',
    `applicant_role` ENUM('kader', 'rayon') NOT NULL COMMENT 'Peran pengaju surat',
    `applicant_rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika pengaju dari rayon',
    `submission_date` DATE NOT NULL COMMENT 'Tanggal pengajuan surat',
    `status` ENUM('pending', 'acc', 'revisi', 'ditolak') NOT NULL DEFAULT 'pending' COMMENT 'Status verifikasi surat',
    `admin_comment` TEXT NULL COMMENT 'Komentar dari admin verifikator',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul atau perihal surat',
    `content` TEXT NULL COMMENT 'Isi ringkas atau keperluan surat',
    `target_destination` VARCHAR(255) NULL COMMENT 'Tujuan pengajuan surat (mis. Komisariat, nama Rayon lain)',
    `file_url` TEXT NULL COMMENT 'URL atau Base64 file draft surat umum',
    `file_database_pelantikan_url` TEXT NULL COMMENT 'URL file database untuk rekomendasi pelantikan',
    `file_permohonan_rekomendasi_pelantikan_url` TEXT NULL COMMENT 'URL file permohonan rekomendasi pelantikan',
    `file_lpj_kepengurusan_url` TEXT NULL COMMENT 'URL file LPJ kepengurusan',
    `file_berita_acara_rtar_url` TEXT NULL COMMENT 'URL file berita acara RTAR',
    `file_berita_acara_tim_formatur_url` TEXT NULL COMMENT 'URL file berita acara TIM Formatur',
    `file_struktur_kepengurusan_url` TEXT NULL COMMENT 'URL file struktur kepengurusan',
    `file_database_rtar_url` TEXT NULL COMMENT 'URL file database untuk rekomendasi RTAR',
    `file_permohonan_rekomendasi_rtar_url` TEXT NULL COMMENT 'URL file permohonan rekomendasi RTAR',
    `file_suket_mapaba_url` TEXT NULL COMMENT 'URL file sertifikat/suket MAPABA',
    `file_hasil_screening_pkd_url` TEXT NULL COMMENT 'URL file hasil screening PKD',
    `file_rekomendasi_pkd_rayon_url` TEXT NULL COMMENT 'URL file rekomendasi PKD Rayon',
    `verification_date` DATETIME NULL COMMENT 'Tanggal dan waktu verifikasi oleh admin',
    `verified_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (admin yang memverifikasi)',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk pengajuan surat dan status verifikasi';

-- Tambahkan Foreign Keys ke tabel users dan rayons
ALTER TABLE `surat_submissions`
ADD CONSTRAINT `fk_surat_applicant_user_id` FOREIGN KEY (`applicant_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `fk_surat_applicant_rayon_id` FOREIGN KEY (`applicant_rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_surat_verified_by_user_id` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- --------------------------------------------------------
-- Struktur Tabel untuk `news_articles` (Berita & Artikel)
-- Menyimpan konten berita dan artikel yang diajukan oleh rayon atau admin.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_articles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik berita/artikel',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul berita atau artikel',
    `category` VARCHAR(50) NOT NULL COMMENT 'Kategori berita (mis. Kegiatan, Artikel, Pengumuman)',
    `image_url` TEXT NULL COMMENT 'URL atau Base64 gambar utama berita',
    `description` TEXT NOT NULL COMMENT 'Deskripsi singkat atau isi berita/artikel',
    `publication_date` DATE NOT NULL COMMENT 'Tanggal publikasi',
    `submitted_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengaju berita)',
    `submitted_by_rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika pengaju dari rayon',
    `status` ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Status verifikasi berita/artikel',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk berita dan artikel';

-- Tambahkan Foreign Keys
ALTER TABLE `news_articles`
ADD CONSTRAINT `fk_news_submitted_by_user` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_news_submitted_by_rayon` FOREIGN KEY (`submitted_by_rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `activities` (Agenda Kegiatan)
-- Mencatat detail setiap agenda kegiatan yang diajukan.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik kegiatan',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul kegiatan',
    `activity_date` DATE NOT NULL COMMENT 'Tanggal kegiatan',
    `activity_time` VARCHAR(50) NULL COMMENT 'Waktu kegiatan (mis. 08:00 - Selesai)',
    `location` VARCHAR(255) NOT NULL COMMENT 'Lokasi kegiatan',
    `description` TEXT NULL COMMENT 'Deskripsi kegiatan',
    `image_url` TEXT NULL COMMENT 'URL atau Base64 gambar kegiatan',
    `registration_enabled` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Status apakah pendaftaran dibuka untuk kegiatan ini',
    `submitted_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengaju kegiatan)',
    `submitted_by_rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika pengaju dari rayon',
    `status` ENUM('pending', 'approved', 'rejected', 'terlaksana', 'mendatang', 'dibatalkan') NOT NULL DEFAULT 'pending' COMMENT 'Status verifikasi dan pelaksanaan kegiatan',
    `external_link` TEXT NULL COMMENT 'Tautan eksternal untuk detail atau pendaftaran kegiatan',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk agenda kegiatan';

-- Tambahkan Foreign Keys
ALTER TABLE `activities`
ADD CONSTRAINT `fk_activities_submitted_by_user` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_activities_submitted_by_rayon` FOREIGN KEY (`submitted_by_rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `activity_registrations` (Pendaftar Kegiatan)
-- Menyimpan detail pendaftar untuk kegiatan yang mengaktifkan pendaftaran.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_registrations` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pendaftaran',
    `activity_id` INT NOT NULL COMMENT 'Foreign Key ke `activities.id`',
    `registrant_name` VARCHAR(255) NOT NULL COMMENT 'Nama pendaftar',
    `registrant_email` VARCHAR(255) NULL COMMENT 'Email pendaftar',
    `registrant_phone` VARCHAR(50) NULL COMMENT 'Nomor telepon pendaftar',
    `registrant_type` ENUM('Kader', 'Umum') NOT NULL COMMENT 'Jenis pendaftar (kader atau umum)',
    `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp pendaftaran',
    `registrant_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` jika pendaftar adalah kader'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk pendaftar kegiatan';

-- Tambahkan Foreign Keys
ALTER TABLE `activity_registrations`
ADD CONSTRAINT `fk_registrations_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_registrations_registrant_user_id` FOREIGN KEY (`registrant_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `gallery_items` (Galeri Kegiatan)
-- Menyimpan item-item galeri foto kegiatan.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery_items` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik item galeri',
    `caption` VARCHAR(255) NULL COMMENT 'Keterangan atau judul foto',
    `image_url` TEXT NOT NULL COMMENT 'URL atau Base64 gambar galeri',
    `upload_date` DATE NOT NULL COMMENT 'Tanggal unggah foto',
    `related_activity_id` INT NULL COMMENT 'Foreign Key ke `activities.id` jika foto terkait kegiatan tertentu',
    `submitted_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengaju foto)',
    `submitted_by_rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika pengaju dari rayon',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Status verifikasi foto',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk item galeri foto';

-- Tambahkan Foreign Keys
ALTER TABLE `gallery_items`
ADD CONSTRAINT `fk_gallery_related_activity_id` FOREIGN KEY (`related_activity_id`) REFERENCES `activities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_gallery_submitted_by_user` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_gallery_submitted_by_rayon` FOREIGN KEY (`submitted_by_rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `site_settings` (Pengaturan Situs Umum)
-- Menyimpan pengaturan umum situs seperti judul, deskripsi, kontak, dll.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
    `setting_key` VARCHAR(255) PRIMARY KEY COMMENT 'Kunci unik pengaturan (mis. site_title, contact_email)',
    `setting_value` TEXT NULL COMMENT 'Nilai pengaturan',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk pengaturan umum situs web';

-- --------------------------------------------------------
-- Struktur Tabel untuk `homepage_sections` (Konten Dinamis Beranda)
-- Menyimpan struktur dan konfigurasi konten dinamis per bagian beranda.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `homepage_sections` (
    `section_name` VARCHAR(50) PRIMARY KEY COMMENT 'Nama bagian beranda (mis. hero, about, news_config, activities_config, gallery_config)',
    `content_json` JSON NULL COMMENT 'Data konten dalam format JSON',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk konten dinamis setiap bagian beranda';

-- --------------------------------------------------------
-- Struktur Tabel untuk `announcements` (Pengumuman di Beranda)
-- Menyimpan pengumuman penting yang ditampilkan di halaman beranda.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pengumuman',
    `text_content` TEXT NOT NULL COMMENT 'Isi teks pengumuman',
    `target_url` TEXT NULL COMMENT 'URL terkait dengan pengumuman (jika ada)',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif/tidak aktif pengumuman',
    `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu publikasi pengumuman',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk pengumuman di halaman beranda';

-- --------------------------------------------------------
-- Struktur Tabel untuk `social_media_links` (Tautan Media Sosial)
-- Menyimpan tautan media sosial organisasi.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `social_media_links` (
    `platform` VARCHAR(50) PRIMARY KEY COMMENT 'Nama platform media sosial (mis. instagram, facebook)',
    `url` TEXT NULL COMMENT 'URL profil media sosial',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif/tidak aktif tautan',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk tautan media sosial organisasi';

-- --------------------------------------------------------
-- Struktur Tabel untuk `notifications` (Kelola Notifikasi)
-- Menyimpan notifikasi yang dikirim kepada pengguna atau kelompok pengguna.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik notifikasi',
    `type` VARCHAR(50) NOT NULL COMMENT 'Jenis notifikasi (info, success, warning, error, etc.)',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul notifikasi',
    `content` TEXT NOT NULL COMMENT 'Isi pesan notifikasi',
    `target_role` VARCHAR(50) NOT NULL COMMENT 'Peran target penerima (mis. all, kader, rayon, komisariat)',
    `target_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` jika target spesifik',
    `target_rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika target rayon spesifik',
    `sender_user_id` VARCHAR(255) NOT NULL COMMENT 'Foreign Key ke `users.id` (pengirim notifikasi)',
    `sender_role` VARCHAR(50) NOT NULL COMMENT 'Peran pengirim (mis. system, komisariat, rayon)',
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu pengiriman notifikasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk notifikasi sistem';

-- Tambahkan Foreign Keys
ALTER TABLE `notifications`
ADD CONSTRAINT `fk_notifications_target_user` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_notifications_target_rayon` FOREIGN KEY (`target_rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_notifications_sender_user` FOREIGN KEY (`sender_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `system_activity_logs` (Laporan & Analisis Aktivitas Sistem)
-- Mencatat setiap aktivitas penting dalam sistem untuk keperluan audit dan analisis.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_activity_logs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik log aktivitas',
    `activity_type` VARCHAR(255) NOT NULL COMMENT 'Jenis aktivitas (mis. Login, Edit Akun, Pengajuan Surat)',
    `description` TEXT NOT NULL COMMENT 'Deskripsi detail aktivitas',
    `user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengguna yang melakukan aktivitas)',
    `user_name` VARCHAR(255) NULL COMMENT 'Nama pengguna yang melakukan aktivitas',
    `user_role` VARCHAR(50) NULL COMMENT 'Peran pengguna yang melakukan aktivitas',
    `target_id` VARCHAR(255) NULL COMMENT 'ID item yang terpengaruh (mis. ID surat, ID kader)',
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu aktivitas',
    `ip_address` VARCHAR(45) NULL COMMENT 'Alamat IP pengguna (opsional)',
    `details` JSON NULL COMMENT 'Detail tambahan aktivitas dalam format JSON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk log aktivitas sistem';

-- Tambahkan Foreign Key
ALTER TABLE `system_activity_logs`
ADD CONSTRAINT `fk_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `digital_signatures` (TTD Digital dan QR Link)
-- Menyimpan data terkait QR Code TTD Digital dan QR Code akses link.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `digital_signatures` (
    `id` VARCHAR(255) PRIMARY KEY COMMENT 'ID unik QR Code',
    `qr_type` ENUM('ttdDigital', 'accessLink') NOT NULL COMMENT 'Tipe QR Code yang dibuat',
    `document_ref_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `surat_submissions.id` jika terkait surat',
    `nomor_surat` VARCHAR(255) NULL COMMENT 'Nomor surat (jika tipe TTD Digital)',
    `signed_by_name` VARCHAR(255) NULL COMMENT 'Nama penanda tangan (jika tipe TTD Digital)',
    `signed_by_position` VARCHAR(255) NULL COMMENT 'Jabatan penanda tangan (jika tipe TTD Digital)',
    `signed_date` DATE NULL COMMENT 'Tanggal surat ditandatangani (jika tipe TTD Digital)',
    `perihal_surat` TEXT NULL COMMENT 'Perihal surat (jika tipe TTD Digital)',
    `link_url` TEXT NULL COMMENT 'URL link (jika tipe Access Link)',
    `link_title` VARCHAR(255) NULL COMMENT 'Judul link (jika tipe Access Link)',
    `link_description` TEXT NULL COMMENT 'Deskripsi link (jika tipe Access Link)',
    `link_creator` VARCHAR(255) NULL COMMENT 'Nama pembuat QR (jika tipe Access Link)',
    `qr_code_value` TEXT NOT NULL UNIQUE COMMENT 'Data string yang dienkode dalam QR Code',
    `logo_url_in_qr` TEXT NULL COMMENT 'URL atau Base64 logo yang disematkan di QR',
    `generated_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengguna yang generate QR)',
    `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu QR dibuat',
    `is_valid` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status validasi TTD digital (true: sah, false: tidak sah)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk data TTD Digital dan QR Link';

-- Tambahkan Foreign Keys
ALTER TABLE `digital_signatures`
ADD CONSTRAINT `fk_digisign_document_ref` FOREIGN KEY (`document_ref_id`) REFERENCES `surat_submissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_digisign_generated_by_user` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `kepengurusan_archives` (Arsiparis Kepengurusan)
-- Menyimpan arsip data kepengurusan komisariat dan rayon.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kepengurusan_archives` (
    `id` VARCHAR(255) PRIMARY KEY COMMENT 'ID unik arsip kepengurusan',
    `rayon_id` VARCHAR(255) NOT NULL COMMENT 'Foreign Key ke `rayons.id` (atau nilai ''komisariat'' jika arsip komisariat)',
    `nama_rayon` VARCHAR(255) NOT NULL COMMENT 'Nama rayon atau ''Komisariat''',
    `periode` VARCHAR(50) NOT NULL COMMENT 'Periode kepengurusan (mis. 2023-2024)',
    `ketua` VARCHAR(255) NOT NULL COMMENT 'Nama Ketua',
    `sekretaris` VARCHAR(255) NOT NULL COMMENT 'Nama Sekretaris',
    `bendahara` VARCHAR(255) NOT NULL COMMENT 'Nama Bendahara',
    `jumlah_kader` INT DEFAULT 0 COMMENT 'Jumlah kader pada periode tersebut',
    `tanggal_berdiri_periode` DATE NULL COMMENT 'Tanggal mulai periode kepengurusan',
    `uploaded_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (admin yang mengunggah)',
    `uploaded_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu unggah arsip',
    `file_sk_url` TEXT NULL COMMENT 'URL atau Base64 file SK kepengurusan',
    `other_files_json` JSON NULL COMMENT 'JSON array dari objek file lainnya (nama, url, tipe)',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk arsip kepengurusan';

-- Tambahkan Foreign Key ke tabel users
ALTER TABLE `kepengurusan_archives`
ADD CONSTRAINT `fk_archives_uploaded_by_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `digilib_categories` (Kategori Perpustakaan Digital)
-- Kategori utama dokumen di perpustakaan digital.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `digilib_categories` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT 'ID unik kategori (mis. makalah_kader, buku_referensi)',
    `name` VARCHAR(255) NOT NULL COMMENT 'Nama kategori',
    `description` TEXT NULL COMMENT 'Deskripsi kategori',
    `icon_class` VARCHAR(255) NULL COMMENT 'Kelas ikon Font Awesome',
    `target_page_url` TEXT NULL COMMENT 'URL halaman detail kategori atau modul terkait',
    `is_external_link` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Apakah ini tautan eksternal',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif kategori'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk kategori perpustakaan digital';

-- --------------------------------------------------------
-- Struktur Tabel untuk `digilib_items` (Item-item dalam Perpustakaan Digital)
-- Menyimpan detail setiap dokumen dalam perpustakaan digital.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `digilib_items` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik item digilib',
    `category_id` VARCHAR(50) NOT NULL COMMENT 'Foreign Key ke `digilib_categories.id`',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul dokumen',
    `author` VARCHAR(255) NOT NULL COMMENT 'Penulis dokumen',
    `abstract_description` TEXT NULL COMMENT 'Abstrak atau deskripsi dokumen',
    `file_url` TEXT NOT NULL COMMENT 'URL file dokumen',
    `file_name` VARCHAR(255) NULL COMMENT 'Nama file dokumen',
    `publication_year` INT NULL COMMENT 'Tahun publikasi (untuk buku, prosiding)',
    `publisher` VARCHAR(255) NULL COMMENT 'Penerbit (untuk buku)',
    `isbn` VARCHAR(20) NULL COMMENT 'ISBN (untuk buku)',
    `rayon_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `rayons.id` jika terkait makalah kader atau rayon',
    `period` VARCHAR(100) NULL COMMENT 'Periode sejarah (untuk naskah sejarah, mis. 1960-an)',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Status verifikasi dokumen',
    `uploaded_by_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (pengguna yang mengunggah)',
    `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal dan waktu unggah dokumen',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk item-item di perpustakaan digital';

-- Tambahkan Foreign Keys
ALTER TABLE `digilib_items`
ADD CONSTRAINT `fk_digilib_category_id` FOREIGN KEY (`category_id`) REFERENCES `digilib_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `fk_digilib_rayon_id` FOREIGN KEY (`rayon_id`) REFERENCES `rayons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_digilib_uploaded_by_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `scientific_works` (Karya Ilmiah)
-- Menyimpan karya ilmiah seperti jurnal, skripsi, tesis yang diunggah.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `scientific_works` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik karya ilmiah',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul karya ilmiah',
    `author_name` VARCHAR(255) NOT NULL COMMENT 'Nama penulis karya ilmiah',
    `author_user_id` VARCHAR(255) NULL COMMENT 'Foreign Key ke `users.id` (penulis/pengunggah)',
    `type` VARCHAR(50) NOT NULL COMMENT 'Tipe karya (mis. Jurnal, Skripsi, Artikel, Tesis, Prosiding)',
    `abstract` TEXT NULL COMMENT 'Abstrak atau ringkasan karya',
    `publication_year` INT NULL COMMENT 'Tahun publikasi',
    `publisher` VARCHAR(255) NULL COMMENT 'Penerbit karya',
    `isbn` VARCHAR(20) NULL COMMENT 'ISBN (jika ada)',
    `file_url` TEXT NULL COMMENT 'URL file karya ilmiah (PDF/DOCX)',
    `upload_date` DATE NOT NULL COMMENT 'Tanggal unggah karya',
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Status verifikasi karya ilmiah',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk karya ilmiah (jurnal, skripsi, dll.)';

-- Tambahkan Foreign Key
ALTER TABLE `scientific_works`
ADD CONSTRAINT `fk_scientific_works_author_user` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- --------------------------------------------------------
-- Struktur Tabel untuk `ojs_access_settings` (Pengaturan Akses OJS)
-- Menyimpan detail konfigurasi untuk integrasi Open Journal Systems (OJS).
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ojs_access_settings` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik pengaturan OJS',
    `ojs_base_url` TEXT NOT NULL COMMENT 'URL dasar sistem OJS',
    `api_key` VARCHAR(255) NULL COMMENT 'API Key untuk otentikasi dengan OJS (jika ada)',
    `admin_username` VARCHAR(255) NULL COMMENT 'Username admin OJS untuk integrasi',
    `admin_password` VARCHAR(255) NULL COMMENT 'Password admin OJS (disimpan terenkripsi/hashed)',
    `last_synced_at` DATETIME NULL COMMENT 'Timestamp terakhir kali data disinkronkan dengan OJS',
    `active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif/tidak aktif integrasi OJS',
    `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp terakhir data diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk pengaturan akses Open Journal Systems (OJS)';

-- --------------------------------------------------------
-- Struktur Tabel Tambahan untuk Log Notifikasi yang sudah dibaca per Pengguna (Opsional, untuk skala lebih besar)
-- Jika Anda membutuhkan notifikasi yang menandai status 'terbaca' untuk setiap pengguna.
-- --------------------------------------------------------
/*
CREATE TABLE IF NOT EXISTS `user_notifications` (
    `user_id` VARCHAR(255) NOT NULL COMMENT 'Foreign Key ke `users.id`',
    `notification_id` INT NOT NULL COMMENT 'Foreign Key ke `notifications.id`',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Status notifikasi sudah dibaca atau belum',
    `read_at` DATETIME NULL COMMENT 'Timestamp kapan notifikasi dibaca',
    PRIMARY KEY (`user_id`, `notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk status notifikasi per pengguna';

ALTER TABLE `user_notifications`
ADD CONSTRAINT `fk_user_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_user_notifications_notif_id` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
*/
