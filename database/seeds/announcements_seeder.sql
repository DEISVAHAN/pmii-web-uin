-- database/seeds/announcements_seeder.sql

-- Data awal untuk tabel `announcements`

INSERT IGNORE INTO `announcements` (`id`, `text_content`, `target_url`, `is_active`, `published_at`, `last_updated`) VALUES
(1, 'Akan ada rapat koordinasi rutin Komisariat pada tanggal 15 Juli 2025 pukul 10:00 WIB. Semua pengurus wajib hadir.', '#', 1, '2025-07-01 08:00:00', NOW()),
(2, 'Pendaftaran Pelatihan Kepemimpinan Dasar (PKD) Batch 3 akan dibuka pada 1 Agustus 2025. Persiapkan diri Anda!', 'agenda-kegiatan.html', 1, '2025-06-25 10:00:00', NOW()),
(3, 'Situs web sedang dalam tahap pengembangan dan pembaruan fitur. Mohon maaf atas ketidaknyamanan.', '#', 0, '2025-01-01 00:00:00', NOW());
