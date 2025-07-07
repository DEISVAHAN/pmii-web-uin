<?php
// public/dashboard/kelola-notifikasi.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Notifikasi - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/kelola-notifikasi.css">
</head>
<body>

    <!-- Custom Message Box & Confirm Modal -->
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

    <!-- Modal Hapus Notifikasi -->
    <div id="deleteNotificationModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Konfirmasi Hapus Notifikasi</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('deleteNotificationModal')">&times;</button>
            </div>
            <p>Apakah Anda yakin ingin menghapus notifikasi ini?</p>
            <div class="modal-footer">
                <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('deleteNotificationModal')">Batal</button>
                <button type="button" class="btn-modern btn-danger-modern" id="confirmDeleteNotificationBtn">Hapus</button>
            </div>
        </div>
    </div>

    <!-- HEADER START -->
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
                        <a href="edit-profil-kader.html" id="edit-profil-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-edit"></i> Edit Profil</a>
                        <a href="pengaturan-akun-kader.html" id="pengaturan-akun-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cog"></i> Pengaturan Akun</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i> Jurnal Al Harokah</a>
                        <a href="pengajuan-surat.html" id="pengajuan-surat-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
                    </div>
                </div>
                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="manajemen-akun.html" id="manajemen-akun-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="manajemen-kader.html" id="manajemen-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="repository-ilmiah.html" id="repository-ilmiah-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="pengajuan-surat.html" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="verifikasi-surat.html" id="verifikasi-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="admin-dashboard-rayon.html" id="dashboard-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="admin-dashboard-komisariat.html" id="admin-dashboard-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="edit-beranda.html" id="edit-beranda-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="verifikasi-konten-rayon.html" id="verifikasi-konten-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-double"></i>Verifikasi Konten Rayon</a>
                        <a href="rayon-tambah-berita.html" id="tambah-berita-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-newspaper"></i>Tambah Berita & Artikel</a>
                        <a href="rayon-tambah-kegiatan.html" id="tambah-kegiatan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-calendar-plus"></i>Tambah Kegiatan</a>
                        <a href="rayon-tambah-galeri.html" id="tambah-galeri-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-images"></i>Tambah Galeri Kegiatan</a>
                        <a href="edit-profil-rayon.html" id="edit-profil-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-building"></i>Edit Profil Rayon</a>
                        <!-- New Admin Links -->
                        <a href="pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard-statistik.html" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="kelola-notifikasi.php" id="kelola-notifikasi-link-desktop" class="dropdown-item active-nav-link" target="_self"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="../generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <a href="arsiparis.html" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
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
            <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 justify-center logged-out-styles" data-action="login">
                <i class="fas fa-sign-in-alt"></i><span>Login</span>
            </a>
        </nav>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
    <!-- HEADER END -->

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <!-- Tombol Kembali -->
            <div class="mb-6">
                <a href="#" id="back-to-dashboard-link" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali
                </a>
            </div>

            <section id="kelola-notifikasi-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Kelola Notifikasi</h1>
                    <p class="text-md text-white mt-2">Kirim dan kelola notifikasi untuk pengguna.</p>
                </div>

                <!-- Bagian Notifikasi Otomatis -->
                <div id="automatic-notification-section" class="content-section">
                    <h3 class="text-lg font-semibold">Picu Notifikasi Otomatis</h3>
                    <div id="automatic-notification-response" class="hidden form-message mb-5"></div>
                    <div class="space-y-4">
                        <p class="text-text-secondary">Picu notifikasi untuk setiap kegiatan atau berita baru yang belum diumumkan. Dalam implementasi nyata, ini akan terjadi secara otomatis saat data kegiatan/berita baru ditambahkan.</p>
                        <button id="triggerAutoNotificationBtn" class="btn-modern btn-primary-modern">
                            <i class="fas fa-robot mr-2"></i>Picu Notifikasi Otomatis
                        </button>
                    </div>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold">Kirim Notifikasi Manual</h3>
                    <div id="send-notification-form-response" class="hidden form-message mb-5"></div>
                    <form id="sendNotificationForm" class="space-y-6">
                        <div>
                            <div class="input-group-modern">
                                <input type="text" id="notificationTitle" name="notificationTitle" class="form-input-modern" required placeholder=" ">
                                <label for="notificationTitle" class="form-label-modern">Judul Notifikasi</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <textarea id="notificationMessage" name="notificationMessage" class="form-input-modern" rows="4" required placeholder=" "></textarea>
                                <label for="notificationMessage" class="form-label-modern">Isi Pesan Notifikasi</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <select id="notificationRecipient" name="notificationRecipient" class="form-input-modern" required>
                                    <option value=""></option>
                                </select>
                                <label for="notificationRecipient" class="form-label-modern">Target Penerima</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <select id="notificationType" name="notificationType" class="form-input-modern" required>
                                    <option value="info" selected>Informasi</option>
                                    <option value="success">Sukses</option>
                                    <option value="warning">Peringatan</option>
                                    <option value="error">Error</option>
                                    <option value="letter_approved">Verifikasi Surat (Disetujui)</option>
                                    <option value="letter_pending">Verifikasi Surat (Pending)</option>
                                    <option value="letter_revision">Verifikasi Surat (Revisi)</option>
                                    <option value="rayon_content_verification">Verifikasi Konten Rayon</option>
                                    <option value="document_sent">Dokumen Terkirim</option>
                                </select>
                                <label for="notificationType" class="form-label-modern">Jenis Notifikasi</label>
                            </div>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-paper-plane mr-2"></i>Kirim Notifikasi
                        </button>
                    </form>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold">Daftar Notifikasi Terkirim</h3>
                    <div class="mb-4">
                        <div class="input-group-modern">
                            <input type="text" id="searchSentNotifications" name="searchSentNotifications" class="form-input-modern" placeholder="Cari notifikasi terkirim...">
                            <label for="searchSentNotifications" class="form-label-modern">Cari Notifikasi</label>
                        </div>
                    </div>
                    <div id="notifications-list" class="space-y-4">
                        <p class="text-text-muted text-center py-4">Memuat notifikasi...</p>
                    </div>
                    <div id="empty-sent-notifications" class="empty-state hidden">
                        <i class="fas fa-paper-plane-slash"></i>
                        <h3>Belum Ada Notifikasi Terkirim</h3>
                        <p>Anda belum mengirim notifikasi apa pun.</p>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- FOOTER START -->
    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-kader"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    <!-- FOOTER END -->

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 bg-pmii-yellow text-pmii-darkblue w-11 h-11 rounded-full shadow-xl z-50 items-center justify-center hover:bg-yellow-300 transition-all duration-300 transform hover:scale-110 focus:outline-none">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>
    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import '../js/kelola-notifikasi.js';
        import { updateAuthUI } from '../js/auth.js'; // Impor updateAuthUI
        
        document.addEventListener('DOMContentLoaded', function() {
            // Kumpulkan elemen-elemen untuk updateAuthUI (dari index.php)
            const headerTitleText = document.getElementById('header-title-text');
            const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
            const authLinkMain = document.getElementById('auth-link-main');
            const authLinkMobile = document.getElementById('mobile-logout-link'); // Mobile auth link
            const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
            const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

            const authElements = {
                authLinkMain, authLinkMobile, desktopKaderMenuContainer,
                desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
            };
            updateAuthUI(authElements); // Panggil untuk memperbarui UI navigasi
        });
    </script>
</body>
</html>
