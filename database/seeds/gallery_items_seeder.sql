-- database/seeds/gallery_items_seeder.sql

-- Data awal untuk tabel `gallery_items`

INSERT IGNORE INTO `gallery_items` (`id`, `caption`, `image_url`, `upload_date`, `related_activity_id`, `submitted_by_user_id`, `submitted_by_rayon_id`, `status`, `last_updated`) VALUES
(1, 'Momen Kebersamaan PKD Raya 2024', 'https://placehold.co/800x600/005c97/FFFFFF?text=PKD+Raya', '2024-11-01', 2, 'user_komisariat_1', NULL, 'approved', NOW()),
(2, 'Diskusi Mingguan di Basecamp', 'https://placehold.co/800x600/fdd835/004a7c?text=Diskusi+Mingguan', '2024-10-15', 1, 'user_rayon_tarbiyah_1', 'rayon_tarbiyah', 'approved', NOW()),
(3, 'Bakti Sosial Ramadhan 1445H', 'https://placehold.co/800x600/004a7c/FFFFFF?text=Bakti+Sosial', '2024-03-20', 3, 'user_rayon_tarbiyah_1', 'rayon_tarbiyah', 'approved', NOW()),
(4, 'Delegasi Konferensi Cabang', 'https://placehold.co/800x600/6A0DAD/FFFFFF?text=Konfercab', '2024-02-10', NULL, 'user_komisariat_1', NULL, 'approved', NOW()),
(5, 'Suasana Seminar Nasional Demokrasi Digital', 'https://placehold.co/800x600/005c97/FFFFFF?text=Seminar+Demokrasi', '2025-09-02', 4, 'user_komisariat_1', NULL, 'pending', NOW());
