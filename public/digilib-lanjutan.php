<?php
// public/dashboard/digilib-lanjutan.php

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
    <title>Manajemen Makalah Kader - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/digilib-lanjutan.css">
</head>
<body>

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="admin-name-header" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="text-xs sm:text-sm">Logout</a>
                <a href="../index.php" class="text-xs sm:text-sm text-pmii-blue hover:text-pmii-darkblue font-medium hidden md:flex items-center">
                    <i class="fas fa-arrow-left mr-1"></i>Kembali ke Beranda
                </a>
            </div>
        </div>
    </header>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <!-- Tombol Kembali -->
            <div class="mb-6">
                <a href="#" id="back-to-dashboard-link" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali
                </a>
            </div>

            <section id="manajemen-makalah-kader-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title" id="page-main-title">Manajemen Makalah Kader</h1>
                    <p class="text-md text-text-muted mt-2" id="page-subtitle">Kelola dan verifikasi karya ilmiah kader.</p>
                </div>

                <!-- Form Unggah/Edit Makalah (Tampak untuk Admin Rayon dan Komisariat, Sembunyi untuk Publik) -->
                <div id="makalah-form-section" class="content-section mb-8 max-w-2xl mx-auto">
                    <h3 class="text-lg font-semibold mb-6" id="form-section-title">Ajukan / Edit Makalah Kader</h3>
                    <div id="form-response" class="hidden form-message-info mb-5"></div>
                    <form id="makalahForm" class="space-y-6">
                        <input type="hidden" id="makalahId" name="makalahId">
                        
                        <!-- Penulis (untuk Admin Komisariat bisa diedit, untuk Admin Rayon/Kader otomatis) -->
                        <div class="input-group-modern">
                            <input type="text" id="makalahPenulis" name="penulis" class="form-input-modern" required placeholder=" ">
                            <label for="makalahPenulis" class="form-label-modern">Nama Penulis</label>
                        </div>

                        <!-- Rayon (untuk Admin Komisariat bisa diedit, untuk Admin Rayon/Kader otomatis) -->
                        <div id="rayon-input-group" class="input-group-modern">
                            <select id="makalahRayon" name="rayon" class="form-input-modern" required>
                                <option value="" disabled selected></option>
                                <!-- Rayon options populated by JS -->
                            </select>
                            <label for="makalahRayon" class="form-label-modern">Rayon Asal</label>
                        </div>

                        <div class="input-group-modern">
                            <input type="text" id="makalahJudul" name="judul" class="form-input-modern" required placeholder=" ">
                            <label for="makalahJudul" class="form-label-modern">Judul Makalah</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="makalahAbstrak" name="abstrak" class="form-input-modern" rows="5" required placeholder=" "></textarea>
                            <label for="makalahAbstrak" class="form-label-modern">Abstrak</label>
                        </div>
                        <div>
                            <label for="makalahFile" class="block text-sm font-medium text-text-secondary mb-1">Unggah File Makalah (PDF/DOCX, Maks. 5MB)</label>
                            <input type="file" id="makalahFile" name="file" class="form-input-modern" accept=".pdf,.doc,.docx">
                            <p id="fileNamePreview" class="text-xs text-text-muted mt-1">Tidak ada file dipilih.</p>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="reset" class="btn-modern btn-outline-modern" id="resetFormButton">Reset Form</button>
                            <button type="submit" class="btn-modern btn-primary-modern" id="submitFormButton">
                                <i class="fas fa-upload mr-2"></i> Unggah Makalah
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Filter & Daftar Makalah -->
                <div class="content-section">
                    <h3 class="text-lg font-semibold mb-4">Daftar Makalah Kader</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div class="lg:col-span-2 input-group-modern">
                            <input type="text" id="searchMakalah" class="form-input-modern" placeholder=" ">
                            <label for="searchMakalah" class="form-label-modern">Cari Judul / Penulis...</label>
                        </div>
                        <div id="filter-status-container" class="input-group-modern">
                            <select id="filterStatus" class="form-input-modern">
                                <option value="all">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                            <label for="filterStatus" class="form-label-modern">Filter Status</label>
                        </div>
                        <div id="filter-rayon-container" class="input-group-modern hidden">
                            <select id="filterRayon" class="form-input-modern">
                                <option value="all">Semua Rayon</option>
                                <!-- Rayon options populated by JS -->
                            </select>
                            <label for="filterRayon" class="form-label-modern">Filter Rayon</label>
                        </div>
                    </div>

                    <div class="table-modern-wrapper">
                        <table class="table-modern">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Penulis</th>
                                    <th>Rayon</th>
                                    <th>Tanggal Unggah</th>
                                    <th>Status</th>
                                    <th class="text-center" id="action-header">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="makalahTableBody">
                                <tr><td colspan="6" class="py-8 text-center text-text-muted">Memuat data makalah...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Modal Detail Makalah -->
    <div id="detailMakalahModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="detailModalTitle">Detail Makalah</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('detailMakalahModal')">&times;</button>
            </div>
            <div class="modal-body text-sm text-text-secondary">
                <p><strong>Judul:</strong> <span id="detailJudul" class="font-medium"></span></p>
                <p><strong>Penulis:</strong> <span id="detailPenulis"></span></p>
                <p><strong>Rayon:</strong> <span id="detailRayon"></span></p>
                <p><strong>Tanggal Unggah:</strong> <span id="detailTanggal"></span></p>
                <p><strong>Status:</strong> <span id="detailStatus" class="status-badge"></span></p>
                <p id="detailKomentarAdminContainer" class="hidden"><strong>Komentar Admin:</strong> <span id="detailKomentarAdmin"></span></p>
                <h4 class="font-semibold text-text-primary mt-4 mb-2">Abstrak:</h4>
                <p id="detailAbstrak"></p>
                <div class="modal-footer justify-between">
                    <a href="#" id="detailDownloadLink" target="_blank" class="btn-modern btn-outline-modern">
                        <i class="fas fa-download mr-2"></i> Unduh File
                    </a>
                    <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('detailMakalahModal')">Tutup</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Konfirmasi Universal -->
    <div id="customConfirmModal" class="modal-overlay">
        <div class="modal-content text-center max-w-sm">
            <p id="confirmMessage" class="text-lg font-semibold text-gray-800 mb-6"></p>
            <div class="flex justify-center space-x-4">
                <button type="button" class="btn-modern btn-outline-modern" id="cancelConfirmBtn">Batal</button>
                <button type="button" class="btn-modern btn-danger-modern" id="confirmActionBtn">Konfirmasi</button>
            </div>
        </div>
    </div>

    <footer class="internal-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-makalah"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtnMakalah" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>

    <!-- Custom Message Box -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import '../js/digilib-lanjutan.js';
        import { updateAuthUI } from '../js/auth.js'; // Impor updateAuthUI
        
        document.addEventListener('DOMContentLoaded', function() {
            // Kumpulkan elemen-elemen untuk updateAuthUI (dari index.php)
            const headerTitleText = document.getElementById('header-title-text');
            const mobileHeaderTitleText = null; // Tidak ada di halaman ini
            const authLinkMain = document.getElementById('auth-info-header'); // Menggunakan auth-info-header
            const authLinkMobile = null; // Tidak ada di halaman ini

            const desktopKaderMenuContainer = null; // Tidak ada di halaman ini
            const desktopAdminMenuContainer = null; // Tidak ada di halaman ini

            const authElements = {
                authLinkMain, authLinkMobile, desktopKaderMenuContainer,
                desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
            };
            updateAuthUI(authElements); // Panggil untuk memperbarui UI navigasi
        });
    </script>
</body>
</html>
