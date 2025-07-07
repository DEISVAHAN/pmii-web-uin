-- database/seeds/activities_seeder.sql

-- Data awal untuk tabel `activities`

INSERT IGNORE INTO `activities` (`id`, `title`, `activity_date`, `activity_time`, `location`, `description`, `image_url`, `registration_enabled`, `submitted_by_user_id`, `submitted_by_rayon_id`, `status`, `external_link`, `last_updated`) VALUES
(1, 'Diskusi Rutin Fiqh Kontemporer', '2025-07-20', '14:00 - 16:00 WIB', 'Sekretariat PMII', 'Kajian mendalam isu-isu fiqh terkini dengan pendekatan kontekstual dan relevansi sosial.', 'https://placehold.co/600x400/005c97/FFFFFF?text=Diskusi', 0, 'user_komisariat_1', NULL, 'approved', '#', NOW()),
(2, 'Pelatihan Kepemimpinan Dasar (PKD) Batch 3', '2025-08-10', '08:00 - Selesai', 'Villa Sejahtera, Lembang', 'Program pembentukan karakter dan kepemimpinan bagi calon kader muda PMII, fokus pada integritas dan militansi.', 'https://placehold.co/600x400/fdd835/004a7c?text=PKD', 1, 'user_komisariat_1', NULL, 'approved', 'https://forms.gle/pkd-batch3-reg', NOW()),
(3, 'Bakti Sosial Ramadhan 1446H', '2025-03-25', '09:00 - 15:00 WIB', 'Desa Cibaraja', 'Kegiatan amal pembagian sembako dan buka puasa bersama masyarakat kurang mampu di Desa Cibaraja.', 'https://placehold.co/600x400/004a7c/FFFFFF?text=Bakti+Sosial', 0, 'user_rayon_tarbiyah_1', 'rayon_tarbiyah', 'terlaksana', '#', NOW()),
(4, 'Seminar Nasional "Peran Pemuda dalam Demokrasi Digital"', '2025-09-01', '09:00 - 12:00 WIB', 'Auditorium UIN SGD', 'Seminar yang mengundang pakar demokrasi dan teknologi untuk membahas peran strategis pemuda di era digital.', 'https://placehold.co/600x400/6A0DAD/FFFFFF?text=Seminar+Nasional', 1, 'user_komisariat_1', NULL, 'pending', 'https://forms.gle/seminar-demokrasi', NOW());
