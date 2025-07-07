-- database/seeds/users_seeder.sql

-- Data awal untuk tabel `users`
-- Password default untuk semua akun di sini adalah 'password' (setelah di-hash).
-- Pastikan Anda mengganti password ini di lingkungan produksi!

INSERT IGNORE INTO `users` (`id`, `name`, `nim_username`, `email`, `password`, `role`, `jabatan`, `rayon_id`, `klasifikasi`, `status_akun`, `created_at`) VALUES
('user_komisariat_1', 'Admin Komisariat Utama', 'admin_komisariat', 'komisariat@pmii.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'komisariat', 'Ketua Komisariat', NULL, NULL, 'aktif', NOW()),
('user_rayon_tarbiyah_1', 'Admin Rayon Tarbiyah', 'admin_tarbiyah', 'rayon.tarbiyah@pmii.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'rayon', 'Ketua Rayon', 'rayon_tarbiyah', NULL, 'aktif', NOW()),
('user_kader_1', 'Sahabat Mahbub', '1217050001', 'kader.mahbub@pmii.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kader', 'Anggota', 'rayon_ushuluddin', 'Kader Mujahid', 'aktif', NOW()),
('user_kader_2', 'Sahabati Fatimah', '1217050002', 'kader.fatimah@pmii.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kader', 'Anggota', 'rayon_tarbiyah', 'Kader Mu''taqid', 'aktif', NOW());

-- Catatan:
-- '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' adalah hash untuk string 'password'.
-- Anda dapat mengganti nilai `id` dan `nim_username` sesuai kebutuhan.
-- `INSERT IGNORE` akan mencegah error jika data sudah ada (misalnya saat menjalankan seeder berulang kali).
