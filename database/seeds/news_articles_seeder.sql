-- database/seeds/news_articles_seeder.sql

-- Data awal untuk tabel `news_articles`

INSERT IGNORE INTO `news_articles` (`id`, `title`, `category`, `image_url`, `description`, `publication_date`, `submitted_by_user_id`, `submitted_by_rayon_id`, `status`, `last_updated`) VALUES
(1, 'PMII Sukses Gelar Webinar Nasional Hukum Progresif', 'Kegiatan', 'https://placehold.co/600x400/005c97/FFFFFF?text=Webinar+Hukum', 'Webinar membahas implementasi hukum progresif di Indonesia, dihadiri akademisi dan praktisi hukum dari berbagai universitas terkemuka.', '2025-06-10', 'user_komisariat_1', NULL, 'approved', NOW()),
(2, 'Kader PMII Berpartisipasi dalam Aksi Bersih Lingkungan', 'Sosial', 'https://placehold.co/600x400/fdd835/004a7c?text=Aksi+Bersih', 'Puluhan kader PMII turun ke jalan membersihkan area sekitar kampus sebagai bentuk kepedulian lingkungan dan sosial.', '2025-06-05', 'user_rayon_tarbiyah_1', 'rayon_tarbiyah', 'approved', NOW()),
(3, 'Artikel: Tantangan Demokrasi di Era Digital menurut PMII', 'Artikel', 'https://placehold.co/600x400/004a7c/FFFFFF?text=Demokrasi+Digital', 'Analisis mendalam mengenai bagaimana platform digital mempengaruhi partisipasi dan kualitas demokrasi di Indonesia, serta peran PMII.', '2025-06-01', 'user_kader_1', 'rayon_ushuluddin', 'approved', NOW()),
(4, 'Pengumuman: Musyawarah Anggota Rayon Dakwah', 'Pengumuman', 'https://placehold.co/600x400/6b7280/FFFFFF?text=Musyawarah', 'Diberitahukan kepada seluruh anggota PMII Rayon Fakultas Dakwah dan Komunikasi untuk menghadiri Musyawarah Anggota.', '2025-05-28', 'user_rayon_tarbiyah_1', 'rayon_tarbiyah', 'pending', NOW());
