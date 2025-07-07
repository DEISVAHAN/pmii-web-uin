<?php
// public/dashboard/pengaturan-situs.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
// Muat autoloader Composer
require_once __DIR__ . '/../../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// setelah AuthMiddleware memverifikasi token.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Konversi data PHP ke JSON untuk dapat diakses oleh JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengaturan Situs - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/pengaturan-situs.css"> </head>
<body>

    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <div id="customConfirmModal" class="custom-confirm-modal-overlay">
        <div class="custom-confirm-modal-content">
            <h3 id="confirmModalTitle">Konfirmasi Aksi</h3>
            <p id="confirmModalMessage">Apakah Anda yakin ingin melanjutkan?</p>
            <div class="modal-actions">
                <button id="confirmCancelBtn" class="btn btn-secondary-pmii">Tidak</button>
                <button id="confirmYesBtn" class="btn btn-primary-pmii">Ya</button>
            </div>
        </div>
    </div>

    <nav id="navbar" class="text-white py-3.5 navbar-sticky">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5 transform hover:scale-105 transition-transform duration-300">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="header-title-text" class="text-[0.65rem] lg:text-xs font-semibold logo-text tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <div class="hidden lg:flex space-x-6 items-center">
                <a href="../index.php#beranda" class="nav-link text-sm">Beranda</a>
                <a href="../tentang-kami.php" class="nav-link text-sm">Tentang Kami</a>
                <a href="../berita-artikel.php" class="nav-link text-sm">Berita</a>
                <a href="../digilib.php" class="nav-link text-sm" target="_self">📚 Digilib</a>
                <a href="../agenda-kegiatan.php" class="nav-link text-sm">Kegiatan</a>
                <a href="../galeri-foto.php" class="nav-link text-sm">Galeri</a>
                <div id="desktop-kader-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Profil Kader <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="edit-profil-kader.php" id="edit-profil-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-edit"></i> Edit Profil</a>
                        <a href="pengaturan-akun-kader.php" id="pengaturan-akun-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cog"></i> Pengaturan Akun</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i> Jurnal Al Harokah</a>
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
                    </div>
                </div>
                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="manajemen-akun.php" id="manajemen-akun-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="manajemen-kader.php" id="manajemen-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="repository-ilmiah.php" id="repository-ilmiah-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="verifikasi-surat.php" id="verifikasi-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="admin-dashboard-rayon.php" id="dashboard-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="admin-dashboard-komisariat.php" id="admin-dashboard-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="edit-beranda.php" id="edit-beranda-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="verifikasi-konten-rayon.php" id="verifikasi-konten-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-double"></i>Verifikasi Konten Rayon</a>
                        <a href="rayon-tambah-berita.php" id="tambah-berita-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-newspaper"></i>Tambah Berita & Artikel</a>
                        <a href="rayon-tambah-kegiatan.php" id="tambah-kegiatan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-calendar-plus"></i>Tambah Kegiatan</a>
                        <a href="rayon-tambah-galeri.php" id="tambah-galeri-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-images"></i>Tambah Galeri Kegiatan</a>
                        <a href="edit-profil-rayon.php" id="edit-profil-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-building"></i>Edit Profil Rayon</a>
                        <a href="pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard-statistik.php" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="kelola-notifikasi.php" id="kelola-notifikasi-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="../generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <a href="arsiparis.php" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
                    </div>
                </div>
                <a href="../index.php#kontak" class="nav-link text-sm">Kontak</a>
                <a href="../login.php" id="auth-link-main" class="btn logged-out-styles text-sm" data-action="login">
                    Login
                </a>
            </div>
            <div class="lg:hidden">
                <button id="mobile-menu-button" class="menu-icon focus:outline-none p-2 -mr-2"><i class="fas fa-bars text-2xl"></i></button>
            </div>
        </div>
    </nav>

    <div id="mobile-menu-content" class="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-gradient-to-b from-pmii-blue to-pmii-darkblue text-white p-6 shadow-2xl z-40">
        <div class="flex justify-between items-center mb-10">
            <a href="../index.php" class="flex items-center space-x-2">
                <img src="../img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="mobile-header-title-text" class="text-[0.6rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <button id="close-mobile-menu-button" class="focus:outline-none p-2 -mr-2"><i class="fas fa-times text-2xl"></i></button>
        </div>
        <nav id="mobile-nav-links" class="flex flex-col space-y-3">
            </nav>
        <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 justify-center logged-out-styles" data-action="login">
            <i class="fas fa-sign-in-alt"></i><span>Login</span>
        </a>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="admin-dashboard-komisariat.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Dashboard
                </a>
            </div>

            <section id="pengaturan-situs-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Pengaturan Situs</h1>
                    <p class="text-md text-text-muted mt-2">Kelola pengaturan umum dan konten situs web.</p>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Pengaturan Umum Situs</h3>
                    <div id="general-settings-form-response" class="hidden form-message-container"></div>
                    <form id="generalSettingsForm" class="space-y-6">
                        <div>
                            <div class="input-group-modern">
                                <input type="text" id="siteTitle" name="siteTitle" class="form-input-modern" required value="PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung">
                                <label for="siteTitle" class="form-label-modern"><i class="fas fa-heading mr-2"></i>Judul Situs</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <textarea id="siteDescription" name="siteDescription" class="form-input-modern" rows="4" required>Situs resmi Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Bandung.</textarea>
                                <label for="siteDescription" class="form-label-modern"><i class="fas fa-file-alt mr-2"></i>Deskripsi Situs (Meta Description)</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div class="input-group-modern">
                                    <input type="email" id="contactEmail" name="contactEmail" class="form-input-modern" required value="pmiikomisariatuinbandungkota@gmail.com">
                                    <label for="contactEmail" class="form-label-modern"><i class="fas fa-envelope mr-2"></i>Email Kontak Utama</label>
                                    </div>
                            </div>
                            <div>
                                <div class="input-group-modern">
                                    <input type="text" id="contactPhone" name="contactPhone" class="form-input-modern" required value="085320677948">
                                    <label for="contactPhone" class="form-label-modern"><i class="fas fa-phone mr-2"></i>Nomor Telepon Kontak</label>
                                </div>
                            </div>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="siteAddress" name="siteAddress" class="form-input-modern" required value="Jl. AH. Nasution No.105, Cipadung Wetan, Kec. Cibiru, Kota Bandung, Jawa Barat 40614">
                            <label for="siteAddress" class="form-label-modern"><i class="fas fa-map-marker-alt mr-2"></i>Alamat Kantor/Sekretariat</label>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-save mr-2"></i>Simpan Pengaturan Umum
                        </button>
                    </form>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Pengumuman Situs (Homepage)</h3>
                    <div id="announcement-settings-form-response" class="hidden form-message-container"></div>
                    <form id="announcementSettingsForm" class="space-y-6">
                        <div>
                            <div class="input-group-modern">
                                <textarea id="announcementText" name="announcementText" class="form-input-modern" rows="3" placeholder="Kosongkan jika tidak ada pengumuman..."></textarea>
                                <label for="announcementText" class="form-label-modern"><i class="fas fa-bullhorn mr-2"></i>Teks Pengumuman</label>
                            </div>
                            <p class="text-xs text-text-muted mt-1">Pengumuman ini akan ditampilkan di bagian atas halaman beranda.</p>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-sync-alt mr-2"></i>Update Pengumuman
                        </button>
                    </form>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold mb-6">Integrasi Media Sosial</h3>
                     <div id="social-media-settings-form-response" class="hidden form-message-container"></div>
                    <form id="socialMediaSettingsForm" class="space-y-6">
                        <div class="input-group-modern">
                            <input type="url" id="instagramUrl" name="instagramUrl" class="form-input-modern" placeholder=" " value="https://instagram.com/pmii.uinsgd">
                            <label for="instagramUrl" class="form-label-modern"><i class="fab fa-instagram mr-2"></i>URL Instagram</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="url" id="facebookUrl" name="facebookUrl" class="form-input-modern" placeholder=" " value="#">
                            <label for="facebookUrl" class="form-label-modern"><i class="fab fa-facebook-f mr-2"></i>URL Facebook</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="url" id="twitterUrl" name="twitterUrl" class="form-input-modern" placeholder=" " value="#">
                            <label for="twitterUrl" class="form-label-modern"><i class="fab fa-twitter mr-2"></i>URL Twitter/X</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="url" id="youtubeUrl" name="youtubeUrl" class="form-input-modern" placeholder=" " value="#">
                            <label for="youtubeUrl" class="form-label-modern"><i class="fab fa-youtube mr-2"></i>URL YouTube</label>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-share-alt mr-2"></i>Simpan Tautan Sosial Media
                        </button>
                    </form>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>
    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
    </script>
    <script type="module" src="../js/pengaturan-situs.js"></script>
</body>
</html>