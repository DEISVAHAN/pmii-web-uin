<?php
// public/digilib-prosiding-seminar.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

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
    <title>Perpustakaan Digital - Prosiding Seminar</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts: Poppins & Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/digilib-prosiding-seminar.css">
</head>
<body>
    
    <!-- Custom Notification/Alert -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <!-- Confirmation Modal -->
    <div id="customConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div class="p-5 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                <h3 id="confirmModalTitle" class="text-lg font-semibold text-text-primary">Konfirmasi</h3>
                <p id="confirmModalMessage" class="text-sm text-text-secondary mt-2 mb-6">Apakah Anda yakin?</p>
            </div>
            <div class="flex justify-center items-center p-4 bg-gray-50 border-t">
                <button id="confirmCancelBtn" class="btn btn-outline mr-3">Batal</button>
                <button id="confirmYesBtn" class="btn btn-danger">Yakin</button>
            </div>
        </div>
    </div>


    <!-- Header -->
    <header class="internal-header py-3 sticky top-0 z-40">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="digilib.php" class="flex items-center space-x-2.5">
                <img src="img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span class="text-sm md:text-base font-semibold logo-text">Perpustakaan Digital PMII</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="user-info" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="login.php" id="auth-info-header" class="btn btn-primary text-xs sm:text-sm">Login</a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 lg:py-12">
        <div id="proceeding-list-view">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl lg:text-4xl page-title">Prosiding Seminar</h1>
                    <p class="text-md text-text-muted mt-2">Dokumentasi dan materi dari seminar dan diskusi publik.</p>
                </div>
                <button id="add-data-btn" class="btn btn-primary admin-controls">
                    <i class="fas fa-plus mr-2"></i> Tambah Prosiding
                </button>
            </div>

            <div class="mb-8 bg-white p-4 rounded-lg shadow-md">
                <div class="relative">
                    <input type="search" id="search-input" placeholder="Cari judul seminar..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <div class="absolute top-1/2 left-3 -translate-y-1/2"><i class="fas fa-search text-gray-400"></i></div>
                </div>
            </div>

            <div id="proceeding-list" class="space-y-4">
                <!-- Proceeding items will be dynamically inserted here -->
            </div>
            <p id="no-data-message" class="text-center py-16 text-text-muted hidden">Memuat data prosiding...</p>
        </div>
    </main>

    <!-- Modal for Adding/Editing Data -->
    <div id="data-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden modal-overlay">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg modal-content transform scale-95">
            <div class="flex justify-between items-center p-5 border-b">
                <h3 id="modal-title" class="text-xl font-bold text-text-primary">Tambah Prosiding Baru</h3>
                <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form id="data-form" class="p-5 space-y-4">
                <input type="hidden" id="document-id">
                <div>
                    <label for="judul" class="block text-sm font-medium text-gray-700 mb-1">Judul Seminar</label>
                    <input type="text" id="judul" name="judul" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                <div>
                    <label for="tahun" class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <input type="number" id="tahun" name="tahun" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 2024" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">File Prosiding (PDF, DOCX)</label>
                    <div id="file-upload-area" class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div class="space-y-1 text-center">
                            <i class="fas fa-file-alt fa-3x mx-auto text-gray-400"></i>
                            <div class="flex text-sm text-gray-600">
                                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Unggah file</span>
                                    <input id="file-upload" name="file-upload" type="file" class="sr-only" accept=".pdf,.doc,.docx">
                                </label>
                                <p class="pl-1">atau seret dan lepas</p>
                            </div>
                            <p id="file-name-preview" class="text-xs text-gray-500">PDF, DOC, DOCX hingga 10MB</p>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end pt-4">
                    <button type="button" id="cancel-btn" class="btn btn-outline mr-3">Batal</button>
                    <button type="submit" id="submit-btn" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Modal for Showing Document Details (Universal Modal) -->
    <div id="detailSearchResultModal" class="modal-overlay hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="detailSearchResultTitle">Detail Dokumen</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('detailSearchResultModal')">&times;</button>
            </div>
            <div class="modal-body text-sm text-text-secondary">
                <p><strong>Judul:</strong> <span id="detailResultJudul" class="font-medium"></span></p>
                <p><strong>Penulis:</strong> <span id="detailResultPenulis"></span></p>
                <p id="detailResultRayonContainer" class="hidden"><strong>Rayon:</strong> <span id="detailResultRayon"></span></p>
                <p id="detailResultTahunContainer" class="hidden"><strong>Tahun:</strong> <span id="detailResultTahun"></span></p>
                <p id="detailResultPenerbitContainer" class="hidden"><strong>Penerbit:</strong> <span id="detailResultPenerbit"></span></p>
                <p id="detailResultPeriodeContainer" class="hidden"><strong>Periode:</strong> <span id="detailResultPeriode"></span></p>
                <p id="detailResultTanggalUnggahContainer" class="hidden"><strong>Tanggal Unggah:</strong> <span id="detailResultTanggalUnggah"></span></p>
                <h4 class="font-semibold text-text-primary mt-4 mb-2">Abstrak/Deskripsi:</h4>
                <p id="detailResultAbstrak"></p>
                <div class="modal-footer justify-between">
                    <a href="#" id="detailResultDownloadLink" target="_blank" class="btn-modern btn-outline-modern">
                        <i class="fas fa-download mr-2"></i> Unduh File
                    </a>
                    <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('detailSearchResultModal')">Tutup</button>
                </div>
            </div>
        </div>
    </div>
    
    <footer class="bg-pmii-darkblue py-8 mt-16">
        <div class="container mx-auto px-4 text-center text-gray-300">
            <p class="text-sm">&copy; <span id="footer-year"></span> PK PMII UIN Sunan Gunung Djati. All Rights Reserved.</p>
        </div>
    </footer>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import './js/digilib-prosiding-seminar.js';
        import { updateAuthUI } from './js/auth.js'; // Impor updateAuthUI
        
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
