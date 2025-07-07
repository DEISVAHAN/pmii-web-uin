-- database/seeds/site_settings_seeder.sql

-- Data awal untuk tabel `site_settings`

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `last_updated`) VALUES
('site_title', 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung', NOW()),
('site_description', 'Situs resmi Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Bandung. Wadah pengembangan intelektual, spiritual, dan sosial kader.', NOW()),
('contact_email', 'pmiikomisariatuinbandungkota@gmail.com', NOW()),
('contact_phone', '085320677948', NOW()),
('site_address', 'Jl. AH. Nasution No.105, Cipadung Wetan, Kec. Cibiru, Kota Bandung, Jawa Barat 40614', NOW());
