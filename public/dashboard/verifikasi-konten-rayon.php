<?php
// public/dashboard/verifikasi-konten-rayon.php

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
    <title>Verifikasi Konten Rayon - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* CSS Variables for consistent theming based on PMII colors and general UI elements */
        :root {
            --pmii-blue: #005c97;
            --pmii-darkblue: #004a7c;
            --pmii-yellow: #fdd835;
            --text-primary: #111827;
            --text-secondary: #374151;
            --text-muted: #6b7280;
            --border-color: #e5e7eb;
            --input-bg: #f9fafb;
            --background-light: #f9fafb;
            --background-page: #f3f4f6;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --danger-color: #ef4444;
            --danger-hover-color: #dc2626;
            --success-color: #22c55e;
            --warning-color: #f59e0b;
        }
        html { scroll-behavior: smooth; }
        body { 
            font-family: 'Poppins', 'Inter', sans-serif; 
            overflow-x: hidden; 
            background-color: var(--background-page);
            color: var(--text-primary); 
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            transition: background-color 0.3s;
            line-height: 1.6;
        }
        .main-content-wrapper { 
            flex-grow: 1;
            opacity: 0;
            transform: translateY(30px);
            animation: pageFadeInUp 0.7s 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes pageFadeInUp { to { opacity: 1; transform: translateY(0); } }
        
        /* Header Internal */
        .internal-header {
            background-color: white;
            box-shadow: var(--shadow-md);
            border-bottom: 1px solid var(--border-color);
            position: sticky; top: 0; z-index: 1000; 
        }
        .internal-header .logo-text { color: var(--pmii-blue); font-weight: 700; }
        .internal-header #admin-name-header { color: var(--text-secondary); font-weight: 500; }
        .internal-header #auth-info-header {
            background-color: var(--pmii-blue); color: white;
            padding: 0.6rem 1.2rem; border-radius: 0.5rem; 
            transition: background-color 0.25s, transform 0.2s, box-shadow 0.25s; 
            text-decoration: none; font-weight: 500; box-shadow: var(--shadow-sm);
        }
        .internal-header #auth-info-header:hover {
            background-color: var(--pmii-darkblue); transform: translateY(-2px); box-shadow: var(--shadow-md);
        }
        .internal-header #auth-info-header.logout-active { background-color: #ef4444 !important; } 
        .internal-header #auth-info-header.logout-active:hover { background-color: #dc2626 !important; } 

        /* Judul Halaman */
        .page-title { color: var(--pmii-darkblue); font-weight: 800; text-shadow: 1px 1px 2px rgba(0,0,0,0.05); }
        
        /* Bagian Konten (Card) */
        .content-section { 
            background-color: white; padding: 2rem; border-radius: 0.75rem; 
            box-shadow: var(--shadow-md); border: 1px solid var(--border-color);
        }
        .content-section h2, .content-section h3 {
            color: var(--pmii-darkblue); border-bottom: 2px solid var(--pmii-yellow);
            padding-bottom: 0.5rem; display: inline-block; font-weight: 700;
        }

        /* Gaya Tombol Modern */
        .btn-modern {
            padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-weight: 500;
            font-size: 0.875rem; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
            display: inline-flex; align-items: center; justify-content: center; 
            cursor: pointer; border: none; text-decoration: none;
            box-shadow: var(--shadow-sm);
        }
        .btn-modern:hover { transform: translateY(-2px) scale(1.02); box-shadow: var(--shadow-md); }
        .btn-modern:active { transform: translateY(0px) scale(0.98); }
        .btn-primary-modern { background-color: var(--pmii-blue); color: white; }
        .btn-primary-modern:hover { background-color: var(--pmii-darkblue); }
        .btn-danger-modern { background-color: var(--danger-color); color: white; }
        .btn-danger-modern:hover { background-color: var(--danger-hover-color); }
        .btn-outline-modern {
            background-color: transparent; color: var(--pmii-blue); border: 1px solid var(--pmii-blue);
        }
        .btn-outline-modern:hover { background-color: rgba(0,92,151,0.05); }
        .btn-success-modern { background-color: var(--success-color); color: white; }
        .btn-success-modern:hover { background-color: var(--success-hover-color); }
        .btn-warning-modern { background-color: var(--warning-color); color: white; }
        .btn-warning-modern:hover { background-color: var(--warning-hover-color); }

        /* Item Review Styling */
        .review-item {
            background-color: var(--background-light);
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
            margin-bottom: 0.75rem;
            display: flex;
            flex-wrap: wrap; /* Allow wrapping on smaller screens */
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            box-shadow: var(--shadow-sm);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .review-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        .review-item.approved { border-left: 5px solid #22c55e; /* green-500 */ padding-left: calc(1.5rem - 5px); }
        .review-item.rejected { border-left: 5px solid #ef4444; /* red-500 */ padding-left: calc(1.5rem - 5px); }
        .review-item.pending { border-left: 5px solid #f97316; /* orange-500 */ padding-left: calc(1.5rem - 5px); }
        .review-item.revision { border-left: 5px solid #f59e0b; /* warning-color (orange) */ padding-left: calc(1.5rem - 5px); } /* New style for 'revision' */

        .review-item-content {
            flex-grow: 1;
            min-width: 0; /* Allow content to shrink */
        }
        .review-item-content strong {
            display: block;
            font-weight: 600;
            color: var(--pmii-darkblue);
            font-size: 0.95rem;
            margin-bottom: 0.25rem;
        }
        .review-item-content span {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: block;
        }
        .review-item-image {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 0.25rem;
            flex-shrink: 0; /* Prevent shrinking */
            margin-right: 1rem;
        }
        .review-item-actions {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0; /* Prevent shrinking */
            margin-left: auto; /* Push to right */
        }
        .review-item-actions button {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
        }

        /* Modal Styling (for details) */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0,0,0,0.6);
            display: flex; align-items: center; justify-content: center;
            opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
            z-index: 2000;
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }
        .modal-content {
            background-color: white; padding: 2rem; border-radius: 0.75rem;
            box-shadow: var(--shadow-lg); width: 100%; max-width: 600px; /* Wider modal for details */
            transform: scale(0.95); opacity: 0;
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;
            max-height: 90vh; /* Limit modal height */
            overflow-y: auto; /* Enable scroll if content is too long */
        }
        .modal-overlay.active .modal-content { transform: scale(1); opacity: 1; }
        .modal-header { border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;}
        .modal-title { font-size: 1.25rem; font-weight: 600; color: var(--pmii-darkblue); }
        .modal-footer { border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
        .modal-body img { max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem;}
        .modal-body .gallery-modal-images {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;
            margin-top: 1rem;
        }
        .modal-body .gallery-modal-images img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 0.25rem;
        }

        /* Footer Internal */
        .internal-footer {
            background-color: var(--pmii-darkblue); color: #cbd5e1; 
            padding: 2.5rem 1rem; 
        }
        .internal-footer p { color: #e5e7eb; }
        .internal-footer .footer-title { color: white; font-weight: 600; }
        .internal-footer img { filter: brightness(0) invert(1) opacity(0.8); }

        /* Tombol Scroll to Top */
        #scrollToTopBtnVerif {
            background-color: var(--pmii-yellow); color: var(--pmii-darkblue);
            width: 2.75rem; height: 2.75rem; border-radius: 50%; 
            box-shadow: var(--shadow-lg); transition: background-color 0.2s, transform 0.2s;
        }
        #scrollToTopBtnVerif:hover { background-color: #fbc02d; transform: scale(1.1) translateY(-2px); }

        /* Filter buttons */
        .filter-buttons button {
            background-color: var(--background-light);
            color: var(--text-secondary);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.2s ease;
            border: 1px solid var(--border-color);
        }
        .filter-buttons button:hover {
            background-color: #e2e8f0;
            border-color: #cbd5e1;
        }
        .filter-buttons button.active {
            background-color: var(--pmii-blue);
            color: white;
            border-color: var(--pmii-blue);
            box-shadow: var(--shadow-sm);
        }
        .filter-buttons button.active:hover {
            background-color: var(--pmii-darkblue);
            border-color: var(--pmii-darkblue);
        }
    </style>
</head>
<body>

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
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
            <div class="mb-6">
                <a href="admin-dashboard-komisariat.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Dashboard Komisariat
                </a>
            </div>

            <section id="verifikasi-konten-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Verifikasi Konten Rayon</h1>
                    <p class="text-md text-text-muted mt-2">Daftar konten (Berita, Kegiatan, Galeri) yang diajukan oleh Admin Rayon.</p>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-4">Filter Ajuan</h3>
                    <div class="filter-buttons flex flex-wrap gap-2 mb-4">
                        <button type="button" data-filter="all" class="active">Semua Ajuan</button>
                        <button type="button" data-filter="news">Berita & Artikel</button>
                        <button type="button" data-filter="activities">Kegiatan</button>
                        <button type="button" data-filter="galleries">Galeri</button>
                        <button type="button" data-filter="pending">Pending</button>
                        <button type="button" data-filter="approved">Disetujui</button>
                        <button type="button" data-filter="rejected">Ditolak</button>
                    </div>
                    <div id="filter-status-message" class="text-sm text-text-muted mb-4">Menampilkan semua ajuan.</div>

                    <h3 class="text-lg font-semibold mb-4">Daftar Ajuan Konten</h3>
                    <div id="pending-items-list" class="space-y-4">
                        <p class="text-text-muted text-center py-8">Memuat ajuan...</p>
                    </div>
                    <div id="no-items-message" class="hidden text-text-muted text-center py-8">Tidak ada ajuan yang cocok dengan filter.</div>
                </div>
            </section>
        </main>
    </div>

    <div id="detail-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="detail-modal-title">Detail Ajuan</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('detail-modal')">&times;</button>
            </div>
            <div class="modal-body text-sm text-text-secondary">
                <p><strong>Tipe Konten:</strong> <span id="detail-type" class="font-medium text-pmii-blue"></span></p>
                <p><strong>Judul:</strong> <span id="detail-title" class="font-medium"></span></p>
                <p><strong>Diajukan Oleh:</strong> <span id="detail-submitted-by" class="font-medium"></span></p>
                <p><strong>Tanggal Ajuan:</strong> <span id="detail-date"></span></p>
                <p><strong>Status:</strong> <span id="detail-status" class="font-medium"></span></p>
                <div id="detail-category-wrapper"><p><strong>Kategori:</strong> <span id="detail-category"></span></p></div>
                <div id="detail-location-wrapper"><p><strong>Lokasi:</strong> <span id="detail-location"></span></p></div>
                <div id="detail-time-wrapper"><p><strong>Waktu:</strong> <span id="detail-time"></span></p></div>
                
                <h4 class="font-semibold text-pmii-darkblue mt-4 mb-2">Deskripsi:</h4>
                <p id="detail-description"></p>

                <div id="detail-image-wrapper">
                    <h4 class="font-semibold text-pmii-darkblue mt-4 mb-2">Gambar Utama:</h4>
                    <img id="detail-image" src="" alt="Gambar Konten">
                </div>
                
                <div id="detail-gallery-wrapper">
                    <h4 class="font-semibold text-pmii-darkblue mt-4 mb-2">Foto Galeri:</h4>
                    <div id="detail-gallery-images" class="gallery-modal-images">
                        </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('detail-modal')">Tutup</button>
                <button type="button" class="btn-modern btn-danger-modern" id="reject-button">Tolak</button>
                <button type="button" class="btn-modern btn-primary-modern" id="approve-button">Setujui</button>
            </div>
        </div>
    </div>


    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-verif"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtnVerif" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/verifikasi-konten-rayon.js"></script>
</body>
</html>