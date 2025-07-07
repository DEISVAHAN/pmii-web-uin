<?php
// public/dashboard/edit-profil-rayon.php

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

// Dapatkan ID rayon dari parameter URL, jika ada (untuk Admin Komisariat)
// Jika tidak ada, diasumsikan admin rayon yang login dan akan menggunakan ID dari session/token
$rayonIdFromUrl = $_GET['id'] ?? null;
$rayonIdFromUrlJson = json_encode($rayonIdFromUrl);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profil Rayon - Sistem Internal PMII</title>
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/edit-profil-rayon.css"> </head>
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

    <div class="main-content-wrapper">
        <nav id="navbar" class="text-white py-3.5 navbar-sticky">
            <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
                <a href="../index.php" class="flex items-center space-x-2.5 transform hover:scale-105 transition-transform duration-300">
                    <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-auto shadow-md" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
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
                            <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
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
                    <img src="../img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9 w-auto" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
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
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="max-w-4xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-3xl lg:text-4xl page-title font-extrabold text-pmii-darkblue">Edit Profil Rayon</h1>
                    <p class="text-md text-text-muted mt-2">Perbarui informasi publik yang akan ditampilkan untuk rayon Anda.</p>
                </div>

                <form id="profile-form">
                    <div class="space-y-8">
                        <div class="form-section">
                            <h2 class="text-xl font-bold mb-6 text-text-primary">Informasi Utama</h2>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="md:col-span-1 flex flex-col items-center">
                                    <label for="logo-upload" class="form-label mb-2 block">Logo Rayon</label>
                                    <div class="image-upload-wrapper">
                                        <img id="logo-preview" src="https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo" alt="Pratinjau Logo" class="image-preview w-40 h-40">
                                        <label for="logo-upload" class="upload-label-btn">
                                            Ganti Logo
                                            <input id="logo-upload" name="logo-upload" type="file" class="sr-only" accept="image/png, image/jpeg">
                                        </label>
                                    </div>
                                    
                                    <label for="chairman-photo-upload" class="form-label mb-2 block mt-4">Foto Profil Ketua Rayon</label>
                                    <div class="image-upload-wrapper">
                                        <img id="chairman-photo-preview" src="https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua" alt="Pratinjau Foto Ketua" class="image-preview w-32 h-32">
                                        <label for="chairman-photo-upload" class="upload-label-btn">
                                            Ganti Foto Ketua
                                            <input id="chairman-photo-upload" name="chairman-photo-upload" type="file" class="sr-only" accept="image/png, image/jpeg">
                                        </label>
                                    </div>
                                </div>
                                <div class="md:col-span-2 space-y-4">
                                    <div id="rayon-select-container">
                                        <label for="rayon-select" class="form-label">Pilih Rayon (Untuk Admin Komisariat)</label>
                                        <select id="rayon-select" class="form-input mt-1">
                                            <option value="">Pilih Rayon...</option>
                                            </select>
                                    </div>
                                    <div>
                                        <label for="rayon-name" class="form-label"><i class="fas fa-building mr-2"></i>Nama Rayon</label>
                                        <input type="text" id="rayon-name" class="form-input mt-1">
                                    </div>
                                    <div>
                                        <label for="rayon-chairman" class="form-label"><i class="fas fa-user mr-2"></i>Nama Ketua Rayon</label>
                                        <input type="text" id="rayon-chairman" class="form-input mt-1">
                                    </div>
                                    <div>
                                        <label for="cadre-count" class="form-label"><i class="fas fa-users mr-2"></i>Jumlah Kader</label>
                                        <input type="number" id="cadre-count" class="form-input mt-1" min="0">
                                    </div>
                                    <div>
                                        <label for="established-date" class="form-label"><i class="fas fa-calendar-alt mr-2"></i>Tanggal Berdiri</label>
                                        <input type="date" id="established-date" class="form-input mt-1">
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <label for="rayon-description" class="form-label"><i class="fas fa-info-circle mr-2"></i>Deskripsi / Sejarah Singkat</label>
                                <textarea id="rayon-description" rows="5" class="form-input mt-1"></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2 class="text-xl font-bold mb-6 text-text-primary">Visi & Misi</h2>
                            <div>
                                <label for="rayon-vision" class="form-label"><i class="fas fa-bullseye mr-2"></i>Visi Rayon</label>
                                <textarea id="rayon-vision" rows="3" class="form-input mt-1" placeholder="Masukkan visi rayon Anda"></textarea>
                            </div>
                            <div class="mt-4">
                                <label for="rayon-mission" class="form-label"><i class="fas fa-flag mr-2"></i>Misi Rayon</label>
                                <textarea id="rayon-mission" rows="5" class="form-input mt-1" placeholder="Masukkan misi rayon Anda (gunakan poin-poin jika perlu)"></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2 class="text-xl font-bold mb-6 text-text-primary">Kontak & Alamat</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="rayon-contact" class="form-label"><i class="fas fa-phone mr-2"></i>No. Telepon/WA</label>
                                    <input type="tel" id="rayon-contact" class="form-input mt-1">
                                </div>
                                <div>
                                    <label for="rayon-email" class="form-label"><i class="fas fa-envelope mr-2"></i>Email</label>
                                    <input type="email" id="rayon-email" class="form-input mt-1">
                                </div>
                            </div>
                            <div class="mt-6">
                                <label for="rayon-address" class="form-label"><i class="fas fa-map-marker-alt mr-2"></i>Alamat Sekretariat</label>
                                <textarea id="rayon-address" rows="3" class="form-input mt-1"></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2 class="text-xl font-bold mb-6 text-text-primary">Media Sosial</h2>
                            <div class="space-y-4">
                                <div>
                                    <label for="social-instagram" class="form-label"><i class="fab fa-instagram mr-2"></i>Instagram</label>
                                    <input type="url" id="social-instagram" class="form-input mt-1" placeholder="https://instagram.com/nama_akun">
                                </div>
                                <div>
                                    <label for="social-facebook" class="form-label"><i class="fab fa-facebook-f mr-2"></i>Facebook</label>
                                    <input type="url" id="social-facebook" class="form-input mt-1" placeholder="https://facebook.com/nama_akun">
                                </div>
                                <div>
                                    <label for="social-twitter" class="form-label"><i class="fab fa-twitter mr-2"></i>Twitter/X</label>
                                    <input type="url" id="social-twitter" class="form-input mt-1" placeholder="https://twitter.com/nama_akun">
                                </div>
                                <div>
                                    <label for="social-youtube" class="form-label"><i class="fab fa-youtube mr-2"></i>YouTube</label>
                                    <input type="url" id="social-youtube" class="form-input mt-1" placeholder="https://youtube.com/channel/nama_channel">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4">
                            <button type="submit" class="btn btn-primary-pmii w-full md:w-auto">
                                <i class="fas fa-save mr-2"></i> Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    </div>
    
    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">© <span id="tahun-footer-kader"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
    window.phpRayonIdFromUrl = <?php echo $rayonIdFromUrlJson; ?>;
</script>
<script type="module" src="../js/edit-profil-rayon.js"></script>
</body>
</html>