-- database/seeds/homepage_sections_seeder.sql

-- Data awal untuk tabel `homepage_sections`

INSERT IGNORE INTO `homepage_sections` (`section_name`, `content_json`, `last_updated`) VALUES
('hero', '{
    "mainTitle": "Pengurus Komisariat<br>Pergerakan Mahasiswa Islam Indonesia<br>UIN Sunan Gunung Djati<br>Cabang Kota Bandung",
    "announcementText": "Pengumuman penting tentang kegiatan terbaru kami dapat dilihat <a href=\\"#kegiatan\\">di sini</a>."
}', NOW()),
('about', '{
    "p1": "Pergerakan Mahasiswa Islam Indonesia (PMII) Komisariat UIN Sunan Gunung Djati Bandung adalah organisasi kemahasiswaan Islam yang berlandaskan Ahlussunnah wal Jama''ah an-Nahdliyah. Kami berkomitmen untuk mencetak kader-kader Ulul Albab yang memiliki kedalaman spiritual, keluasan ilmu pengetahuan, dan kepedulian sosial yang tinggi."
}', NOW()),
('news_config', '{
    "display_count": 3,
    "filter_status": "approved"
}', NOW()),
('activities_config', '{
    "display_count": 2,
    "filter_status": "approved"
}', NOW()),
('gallery_config', '{
    "display_count": 4,
    "filter_status": "approved"
}', NOW());
