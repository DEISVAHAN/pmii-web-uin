<?php
// public/dashboard/manajemen-buku-referensi.php

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
    <title>Manajemen Buku Referensi - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/manajemen-buku-referensi.css"> </head>
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

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="admin-name-header" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="text-xs sm:text-sm">Logout</a>
            </div>
        </div>
    </header>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="admin-dashboard-komisariat.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Dashboard
                </a>
            </div>

            <section id="manajemen-buku-referensi-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Manajemen Buku Referensi</h1>
                    <p class="text-md text-text-muted mt-2">Kelola koleksi buku referensi digital perpustakaan.</p>
                </div>

                <div class="content-section mb-8 max-w-2xl mx-auto">
                    <h3 class="text-lg font-semibold mb-6">Formulir Input Buku Baru</h3>
                    <div id="form-response" class="hidden form-message-success"></div>
                    <form id="bukuForm" class="space-y-6">
                        <input type="hidden" id="bukuId" name="bukuId"> <div class="input-group-modern">
                            <input type="text" id="bukuJudul" name="judul" class="form-input-modern" required placeholder=" ">
                            <label for="bukuJudul" class="form-label-modern">Judul Buku</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="bukuPenulis" name="penulis" class="form-input-modern" required placeholder=" ">
                            <label for="bukuPenulis" class="form-label-modern">Penulis / Editor</label>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="input-group-modern">
                                <input type="number" id="bukuTahun" name="tahun" class="form-input-modern" required min="1000" max="2100" placeholder=" ">
                                <label for="bukuTahun" class="form-label-modern">Tahun Terbit</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="text" id="bukuPenerbit" name="penerbit" class="form-input-modern" required placeholder=" ">
                                <label for="bukuPenerbit" class="form-label-modern">Penerbit</label>
                            </div>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="bukuISBN" name="isbn" class="form-input-modern" placeholder=" ">
                            <label for="bukuISBN" class="form-label-modern">ISBN (Opsional)</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="bukuRingkasan" name="ringkasan" class="form-input-modern" rows="4" placeholder=" "></textarea>
                            <label for="bukuRingkasan" class="form-label-modern">Ringkasan Singkat / Deskripsi</label>
                        </div>
                        <div>
                            <label for="bukuFile" class="block text-sm font-medium text-gray-700 mb-1">Unggah File Buku (PDF/ePub - Opsional)</label>
                            <input type="file" id="bukuFile" name="file" class="form-input-modern" accept=".pdf,.epub">
                            <p id="fileNamePreview" class="text-xs text-text-muted mt-1">Tidak ada file dipilih.</p>
                        </div>
                        <div class="input-group-modern">
                            <input type="url" id="bukuLinkEksternal" name="link_eksternal" class="form-input-modern" placeholder=" ">
                            <label for="bukuLinkEksternal" class="form-label-modern">Link Eksternal (Opsional)</label>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="reset" class="btn-modern btn-outline-modern">Reset Form</button>
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-save mr-2"></i> Simpan Buku
                            </button>
                        </div>
                    </form>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold mb-6">Daftar Buku Referensi</h3>
                    <div id="buku-list" class="space-y-2">
                        <p class="text-text-muted text-center py-4">Belum ada buku yang ditambahkan.</p>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/manajemen-buku-referensi.js"></script>
</body>
</html>