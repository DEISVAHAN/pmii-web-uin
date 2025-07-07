<?php
// public/dashboard/notifikasi.php

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
    <title>Notifikasi - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/notifikasi.css"> </head>
<body class="bg-gray-100 text-gray-800 antialiased">

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
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full shadow-md border-2 border-white/40">
                <span class="text-lg lg:text-xl font-semibold logo-text tracking-tight">PK PMII UIN SGD Bandung</span>
            </a>
            <div class="hidden lg:flex space-x-6 items-center">
                <a href="../index.php" class="nav-link text-sm">Beranda</a>
                <a href="../digilib.php" class="nav-link text-sm">📚 Digilib</a>
                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="manajemen-akun.php" id="manajemen-akun-link-desktop" class="dropdown-item"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="manajemen-kader.php" id="manajemen-kader-link-desktop" class="dropdown-item"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="repository-ilmiah.php" id="repository-ilmiah-link-desktop" class="dropdown-item"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="verifikasi-surat.php" id="verifikasi-surat-link-desktop" class="dropdown-item"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="kelola-notifikasi.php" id="kelola-notifikasi-link-desktop" class="dropdown-item"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="admin-dashboard-rayon.php" id="dashboard-rayon-link-desktop" class="dropdown-item"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="admin-dashboard-komisariat.php" id="admin-dashboard-link-desktop" class="dropdown-item"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="edit-beranda.php" id="edit-beranda-link-desktop" class="dropdown-item"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard-statistik.php" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="../generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <a href="arsiparis.php" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
                    </div>
                </div>
                <a href="notifikasi.php" id="notifikasi-link-desktop-general" class="nav-link text-sm"><i class="fas fa-bell mr-1"></i>Notifikasi <span id="notification-badge" class="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden">0</span></a>
                <a href="../index.php#kontak" class="nav-link text-sm">Kontak</a>
                <a href="../login.php" id="auth-link-main" class="btn bg-pmii-yellow text-pmii-blue hover:bg-yellow-400 text-sm">Login</a>
            </div>
            <div class="lg:hidden">
                <button id="mobile-menu-button" class="menu-icon focus:outline-none p-2 -mr-2"><i class="fas fa-bars text-2xl"></i></button>
            </div>
        </div>
    </nav>

    <div id="mobile-menu-content" class="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-gradient-to-b from-pmii-blue to-pmii-darkblue text-white p-6 shadow-2xl z-40 hidden">
        <div class="flex justify-between items-center mb-10">
             <a href="../index.php" class="flex items-center space-x-2">
                <img src="../img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9 w-9 rounded-full">
                <span class="text-lg font-semibold">PK PMII UIN SGD Bandung</span>
            </a>
            <button id="close-mobile-menu-button" class="focus:outline-none p-2 -mr-2"><i class="fas fa-times text-2xl"></i></button>
        </div>
        <nav id="mobile-nav-links" class="flex flex-col space-y-3">
            </nav>
        <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 bg-red-500 hover:bg-red-600 justify-center"></a>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 hidden opacity-0 transition-opacity duration-300"></div>
    <div class="main-content-wrapper py-8 lg:py-12">
        <main class="container mx-auto px-4">
            <div class="text-left mb-8">
                <a href="../index.php" id="back-link" class="btn-modern btn-outline-modern text-sm">
                   <i class="fas fa-arrow-left mr-2"></i> Kembali ke Beranda
                </a>
            </div>

            <section id="notification-page-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-2xl md:text-3xl lg:text-4xl page-title">Notifikasi Anda</h1>
                    <p class="text-md text-text-muted mt-2">Pemberitahuan penting mengenai akun dan aktivitas Anda.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="md:col-span-2">
                        <div class="content-card">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-semibold">Notifikasi Terbaru</h2>
                                <button id="mark-all-read-btn" class="btn-modern btn-outline-modern text-sm px-4 py-2" title="Tandai semua sebagai sudah dibaca">
                                    <i class="fas fa-envelope-open-text mr-2"></i> Tandai Semua Sudah Dibaca
                                </button>
                            </div>
                            <div id="received-notification-list" class="space-y-4">
                                </div>
                            <div id="empty-received-notifications" class="empty-state hidden mt-8">
                                <i class="fas fa-bell-slash"></i>
                                <h3>Tidak Ada Notifikasi</h3>
                                <p>Anda belum memiliki notifikasi baru saat ini.</p>
                            </div>
                        </div>
                    </div>
                    <div class="md:col-span-1">
                        <div class="content-card mb-8">
                            <h2 class="text-xl font-semibold mb-6">Pengaturan Notifikasi</h2>
                            <div class="space-y-4 text-sm text-text-secondary">
                                <p><i class="fas fa-info-circle text-pmii-blue mr-2"></i>Fitur pengaturan notifikasi akan segera hadir.</p>
                                <div class="flex items-center justify-between">
                                    <span>Email Notifikasi</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" checked disabled>
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pmii-blue"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Notifikasi Pop-up</span>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" disabled>
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pmii-blue"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div id="admin-notification-panel" class="hidden">
                            <div class="content-card mb-8">
                                <h2 class="text-xl font-semibold mb-6">Kirim Notifikasi Baru</h2>
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
                                                <option value="all">Semua Pengguna</option>
                                                <option value="kader">Semua Kader</option>
                                                <option value="rayon">Semua Admin Rayon</option>
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
                                            </select>
                                            <label for="notificationType" class="form-label-modern">Jenis Notifikasi</label>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn-modern btn-primary-modern">
                                        <i class="fas fa-paper-plane mr-2"></i>Kirim Notifikasi
                                    </button>
                                </form>
                            </div>

                            <div class="content-card">
                                <h2 class="text-xl font-semibold mb-6">Daftar Notifikasi Terkirim</h2>
                                <div id="sent-notifications-list">
                                    <p class="text-text-muted text-center py-4">Tidak ada notifikasi terkirim.</p>
                                </div>
                                <div id="empty-sent-notifications" class="empty-state hidden mt-8">
                                    <i class="fas fa-paper-plane-slash"></i>
                                    <h3>Belum Ada Notifikasi Terkirim</h3>
                                    <p>Anda belum mengirim notifikasi apa pun.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

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

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png"
                 alt="Logo PMII Footer" class="h-16 w-16 mx-auto mb-2.5 rounded-full shadow-lg filter brightness(0) invert opacity(0.8)">
            <p class="text-lg font-semibold text-white mb-0.5">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 bg-pmii-yellow text-pmii-darkblue w-11 h-11 rounded-full shadow-xl z-50 items-center justify-center hover:bg-yellow-300 transition-all duration-300 transform hover:scale-110 focus:outline-none">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
    </script>
    <script type="module" src="../js/notifikasi.js"></script>
</body>
</html>