-- database/seeds/social_media_links_seeder.sql

-- Data awal untuk tabel `social_media_links`

INSERT IGNORE INTO `social_media_links` (`platform`, `url`, `is_active`, `last_updated`) VALUES
('instagram', 'https://instagram.com/pmii.uinsgd', 1, NOW()),
('facebook', 'https://facebook.com/pmii.uinsgd.bandung', 1, NOW()),
('twitter', 'https://twitter.com/pmii_uinsgd', 1, NOW()),
('youtube', 'https://www.youtube.com/@PMIIUINSGD', 1, NOW());
