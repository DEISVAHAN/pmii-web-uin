// public/js/digilib.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getDigilibCategories, getDigilibItems, getScientificWorks, getDigilibItemById, getScientificWorkById } from './api.js';

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

    // Kumpulkan elemen-elemen untuk updateAuthUI (dari auth.js)
    const authElements = {
        authLinkMain, authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
    };

    let userRole = 'public'; // 'public', 'kader', 'rayon', 'komisariat'

    // Elemen DOM
    const categoryCardsContainer = document.getElementById('category-cards-container');
    const noCategoryResultsMessage = document.getElementById('no-search-results'); 
    const searchResultsContainer = document.getElementById('search-results-container');
    const resultsList = document.getElementById('results-list');
    const noFilteredResultsMessage = document.getElementById('no-filtered-results');
    const searchInputDisplay = document.getElementById('search-query-display');
    const backToCategoriesBtn = document.getElementById('back-to-categories-btn');
    const customMessageBox = document.getElementById('customMessageBox');
    const digilibSearchInputPage = document.getElementById('digilib-search-input-page');
    const digilibSearchButtonPage = document.getElementById('digilib-search-button-page');

    // Elemen Modal Detail Hasil Pencarian
    const detailSearchResultModal = document.getElementById('detailSearchResultModal');
    const detailResultJudul = document.getElementById('detailResultJudul');
    const detailResultPenulis = document.getElementById('detailResultPenulis');
    const detailResultRayonContainer = document.getElementById('detailResultRayonContainer');
    const detailResultRayon = document.getElementById('detailResultRayon');
    const detailResultTahunContainer = document.getElementById('detailResultTahunContainer');
    const detailResultTahun = document.getElementById('detailResultTahun');
    const detailResultPenerbitContainer = document.getElementById('detailResultPenerbitContainer');
    const detailResultPenerbit = document.getElementById('detailResultPenerbit');
    const detailResultPeriodeContainer = document.getElementById('detailResultPeriodeContainer');
    const detailResultPeriode = document.getElementById('detailResultPeriode');
    const detailResultTanggalUnggahContainer = document.getElementById('detailResultTanggalUnggahContainer');
    const detailResultTanggalUnggah = document.getElementById('detailResultTanggalUnggah');
    const detailResultAbstrak = document.getElementById('detailResultAbstrak');
    const detailResultDownloadLink = document.getElementById('detailResultDownloadLink');

    // Elemen Pagination
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageNumbersDiv = document.getElementById('page-numbers');

    // Elemen Pencarian Terakhir dan File Terbaru
    const recentSearchesContainer = document.getElementById('recent-searches-container');
    const recentSearchesList = document.getElementById('recent-searches-list');
    const noRecentSearchesMessage = document.getElementById('no-recent-searches');
    const recentFilesContainer = document.getElementById('recent-files-container');
    const recentFilesList = document.getElementById('recent-files-list');
    const noRecentFilesMessage = document.getElementById('no-recent-files');

    // Elemen Saran Pencarian
    const searchSuggestionsContainer = document.getElementById('search-suggestions');


    // Variabel Global untuk Pencarian dan Pagination
    let allDigilibItems = []; // Akan diisi dari API
    let currentSearchResults = [];
    let currentPage = 1;
    const itemsPerPage = 6; // Menampilkan 6 item per halaman
    const MAX_RECENT_SEARCHES = 5;
    const MAX_RECENT_FILES = 5;
    let recentSearches = [];
    let recentFiles = [];

    // --- Fungsi Kotak Pesan Kustom ---
    /**
     * Menampilkan pesan kustom kepada pengguna.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {string} type - Tipe pesan ('info', 'success', 'error').
     * @param {Function} [callback] - Fungsi callback opsional yang akan dieksekusi setelah pesan memudar.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        customMessageBox.textContent = message;
        customMessageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0'; // Reset kelas
        // Tambahkan warna latar belakang berdasarkan tipe
        if (type === 'success') {
            customMessageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            customMessageBox.classList.add('bg-red-500');
        } else {
            customMessageBox.classList.add('bg-blue-500'); // Warna info default
        }
        customMessageBox.classList.add('show', type); // Tambahkan kelas 'show' dan type

        setTimeout(() => {
            customMessageBox.classList.remove('show');
            // Jalankan callback setelah pesan memudar
            setTimeout(() => {
                if (callback) callback();
            }, 300); // Beri waktu untuk animasi memudar
        }, 3000); // Pesan terlihat selama 3 detik
    }

    /* Logika Modal Konfirmasi Kustom */
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null; // Untuk menyimpan fungsi callback

    /**
     * Menampilkan modal konfirmasi kustom.
     * @param {string} title - Judul modal konfirmasi.
     * @param {string} message - Pesan yang akan ditampilkan di modal.
     * @param {Function} onConfirm - Fungsi callback yang akan dieksekusi jika 'Ya' diklik.
     * @param {Function} [onCancel] - Fungsi callback opsional yang akan dieksekusi jika 'Tidak' diklik.
     */
    function showCustomConfirm(title, message, onConfirm, onCancel = null) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active'); // Tampilkan overlay modal
        currentConfirmCallback = onConfirm; // Simpan callback konfirmasi

        // Atur event listener untuk tombol modal
        confirmYesBtn.onclick = () => {
            if (currentConfirmCallback) {
                currentConfirmCallback(); // Jalankan callback konfirmasi
            }
            hideCustomConfirm(); // Sembunyikan modal
        };
        confirmCancelBtn.onclick = () => {
            if (onCancel) {
                onCancel(); // Jalankan callback batal jika disediakan
            }
            hideCustomConfirm(); // Sembunyikan modal
        };
    }

    /**
     * Menyembunyikan modal konfirmasi kustom.
     */
    function hideCustomConfirm() {
        customConfirmModal.classList.remove('active'); // Sembunyikan overlay modal
        currentConfirmCallback = null; // Hapus callback
    }

    // Tutup modal saat mengklik di luar konten
    customConfirmModal.addEventListener('click', function(event) {
        if (event.target === customConfirmModal) { // Periksa apakah klik terjadi pada overlay itu sendiri
            hideCustomConfirm();
        }
    });

    /**
     * Menangani klik autentikasi (login/logout).
     * @param {Event} e - Objek event klik.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        // Tutup menu seluler jika terbuka
        if (mobileMenuContent.classList.contains('menu-active')) {
            toggleMobileMenu();
        }

        const action = e.target.dataset.action || (e.target.closest('a') ? e.target.closest('a').dataset.action : null);

        if (action === 'login') {
            // Arahkan ke login.php saat tombol login diklik
            window.location.href = 'login.php';
            
        } else if (action === 'logout') {
            // Tampilkan modal konfirmasi kustom untuk logout
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                // Jika pengguna mengonfirmasi (klik Ya)
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout(); // Panggil fungsi logout dari auth.js
                    window.location.reload(); 
                }, 500); // Sesuaikan durasi fade-out CSS
            }, () => {
                // Jika pengguna membatalkan (klik Tidak), tidak lakukan apa-apa atau berikan pesan
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        }
    }


    /**
     * Memperbarui UI spesifik halaman berdasarkan status autentikasi dan peran pengguna.
     * Ini termasuk menampilkan/menyembunyikan tautan navigasi dan bagian konten tertentu.
     */
    function updatePageSpecificUI() {
        // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
        // Ini akan mengisi `userRole` secara internal di auth.js
        updateAuthUI(authElements);

        // Setelah `updateAuthUI` dijalankan, kita bisa mendapatkan peran terbaru
        const authData = getAuthData();
        userRole = authData.userData ? authData.userData.user_role : 'public';

        // Update common UI elements for logged-in users
        if (authLinkMain) {
            if (userRole !== 'public') {
                authLinkMain.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i> Logout`;
                authLinkMain.classList.add('logout-active');
                authLinkMain.dataset.action = "logout";
            } else {
                authLinkMain.innerHTML = `Login`;
                authLinkMain.classList.remove('logout-active');
                authLinkMain.classList.add('logged-out-styles');
                authLinkMain.dataset.action = "login";
            }
            authLinkMain.removeEventListener('click', handleAuthClick);
            authLinkMain.addEventListener('click', handleAuthClick);
        }

        // Juga perbarui tautan autentikasi seluler
        if (authLinkMobile) {
            if (userRole !== 'public') {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i> Logout`;
                authLinkMobile.classList.add('logout-active');
                authLinkMobile.dataset.action = "logout";
            } else {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLinkMobile.classList.remove('logout-active');
                authLinkMobile.classList.add('logged-out-styles');
                authLinkMobile.dataset.action = "login";
            }
            authLinkMobile.removeEventListener('click', handleAuthClick);
            authLinkMobile.addEventListener('click', handleAuthClick);
        }
        populateMobileMenu(); // Isi ulang menu seluler untuk memastikan selalu terkini
    }

    /**
     * Mengisi menu seluler secara dinamis berdasarkan peran pengguna.
     */
    function populateMobileMenu() {
        const mobileNavLinksContainer = document.getElementById('mobile-nav-links');
        if (!mobileNavLinksContainer) return;

        mobileNavLinksContainer.innerHTML = ''; // Bersihkan konten sebelumnya

        // Tautan navigasi umum
        const commonLinks = [
            { text: 'Beranda', href: 'index.php#beranda', icon: 'fas fa-home' },
            { text: 'Tentang Kami', href: 'tentang-kami.php', icon: 'fas fa-info-circle' },
            { text: 'Berita', href: 'berita-artikel.php', icon: 'fas fa-newspaper' },
            { text: '📚 Digilib', href: 'digilib.php', icon: 'fas fa-book-reader' },
            { text: 'Kegiatan', href: 'agenda-kegiatan.php', icon: 'fas fa-calendar-alt' },
            { text: 'Galeri', href: 'galeri-foto.php', icon: 'fas fa-images' },
            { text: 'Kontak', href: 'index.php#kontak', icon: 'fas fa-envelope' },
        ];

        commonLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-nav-link';
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.text}</span>`;
            mobileNavLinksContainer.appendChild(a);
        });

        // Tautan khusus berdasarkan peran
        if (userRole === 'kader') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Profil Kader', [
                { text: 'Edit Profil', href: 'dashboard/edit-profil-kader.html', icon: 'fas fa-user-edit' },
                { text: 'Pengaturan Akun', href: 'dashboard/pengaturan-akun-kader.html', icon: 'fas fa-cog' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.html', icon: 'fas fa-book-reader' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
            ]);
        } else if (userRole === 'rayon' || userRole === 'komisariat') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Sistem Internal', [
                // Tautan untuk semua admin (komisariat & rayon)
                { text: 'Manajemen Kader', href: 'dashboard/manajemen-kader.html', icon: 'fas fa-users-cog' },
                { text: 'Repository Ilmiah', href: 'dashboard/repository-ilmiah.html', icon: 'fas fa-book-open' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.html', icon: 'fas fa-book-reader' },
                { text: 'Verifikasi Konten Rayon', href: 'dashboard/verifikasi-konten-rayon.html', icon: 'fas fa-check-double' },
                { text: 'Tambah Berita & Artikel', href: 'dashboard/rayon-tambah-berita.html', icon: 'fas fa-newspaper' },
                { text: 'Tambah Kegiatan', href: 'dashboard/rayon-tambah-kegiatan.html', icon: 'fas fa-calendar-plus' },
                { text: 'Tambah Galeri Kegiatan', href: 'dashboard/rayon-tambah-galeri.html', icon: 'fas fa-images' },
                { text: 'Edit Profil Rayon', href: 'dashboard/edit-profil-rayon.html', icon: 'fas fa-building' },
            ]);

            if (userRole === 'komisariat') {
                appendMobileSubmenu(mobileNavLinksContainer, 'Admin Komisariat', [
                    { text: 'Manajemen Akun', href: 'dashboard/manajemen-akun.html', icon: 'fas fa-user-shield' },
                    { text: 'Verifikasi Surat', href: 'dashboard/verifikasi-surat.html', icon: 'fas fa-check-circle' },
                    { text: 'Dashboard Admin Kom.', href: 'dashboard/admin-dashboard-komisariat.html', icon: 'fas fa-tachometer-alt' },
                    { text: 'Edit Beranda', href: 'dashboard/edit-beranda.html', icon: 'fas fa-edit' },
                    { text: 'Pengaturan Situs', href: 'dashboard/pengaturan-situs.php', icon: 'fas fa-cogs' },
                    { text: 'Dashboard Statistik', href: 'dashboard/dashboard-statistik.html', icon: 'fas fa-chart-bar' },
                    { text: 'Kelola Notifikasi', href: 'dashboard/kelola-notifikasi.html', icon: 'fas fa-bell' },
                    { text: 'Laporan & Analisis', href: 'dashboard/laporan-analisis.php', icon: 'fas fa-file-invoice' },
                    { text: 'TTD Digital', href: 'generate-qr.html', icon: 'fas fa-qrcode' },
                    { text: 'Arsiparis Kepengurusan', href: 'dashboard/arsiparis.html', icon: 'fas fa-archive' },
                ]);
            }
        }
    }

    /**
     * Menambahkan grup submenu ke menu seluler.
     * @param {HTMLElement} parentElement - Elemen induk (misalnya, mobileNavLinksContainer).
     * @param {string} title - Judul submenu.
     * @param {Array<Object>} links - Array objek tautan { text, href, icon }.
     */
    function appendMobileSubmenu(parentElement, title, links) {
        const titleEl = document.createElement('div');
        titleEl.className = 'mobile-submenu-title';
        titleEl.textContent = title;
        parentElement.appendChild(titleEl);

        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-submenu-item';
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.text}</span>`;
            parentElement.appendChild(a);
        });
    }

    /**
     * Mengubah visibilitas menu seluler dan overlay-nya.
     */
    function toggleMobileMenu() {
        const mobileMenuContent = document.getElementById('mobile-menu-content');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

        const isOpen = mobileMenuContent.classList.contains('menu-active');
        if (!isOpen) {
            mobileMenuContent.classList.add('menu-active');
            mobileMenuOverlay.classList.add('menu-active');
            document.body.classList.add('overflow-hidden'); // Mencegah scrolling latar belakang
        } else {
            mobileMenuContent.classList.remove('menu-active');
            mobileMenuOverlay.classList.remove('menu-active');
            document.body.classList.remove('overflow-hidden'); // Mengizinkan scrolling latar belakang
        }
    }
    
    // Pastikan tombol menu dan overlay ditemukan sebelum melampirkan pendengar
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuContent = document.getElementById('mobile-menu-content');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);


    // --- Fungsi Modal Universal ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.add('active');
            // console.log(`Modal ${modalId} opened.`); // Debug log
        }
    }

    window.closeModal = function(modalId) { // Dibuat global agar bisa dipanggil dari onclick di HTML
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
            // console.log(`Modal ${modalId} closed.`); // Debug log
        }
    }

    /**
     * Menampilkan modal detail universal dengan informasi tentang dokumen.
     * Fungsi ini menangani pengisian modal dengan data dinamis dan
     * menyesuaikan visibilitas tautan unduhan berdasarkan peran pengguna.
     * @param {object} item - Objek dokumen yang berisi detail.
     * @param {string} item.judul - Judul dokumen.
     * @param {string} item.title - Judul alternatif (untuk prosiding).
     * @param {string} item.penulis - Penulis dokumen.
     * @param {string} item.author - Penulis alternatif (untuk prosiding).
     * @param {string} item.abstrak - Abstrak/deskripsi dokumen.
     * @param {string} item.description - Deskripsi alternatif (untuk prosiding).
     * @param {string} item.type - Tipe dokumen (mis. 'makalah', 'buku', 'prosiding', 'naskah', 'jurnal').
     * @param {string} [item.rayon] - Rayon (untuk tipe 'makalah').
     * @param {string} [item.tanggalUnggah] - Tanggal unggah (untuk tipe 'makalah').
     * @param {number} [item.tahun] - Tahun publikasi (untuk tipe 'buku').
     * @param {string} [item.penerbit] - Penerbit (untuk tipe 'buku').
     * @param {number} [item.year] - Tahun (untuk tipe 'prosiding', 'jurnal').
     * @param {string} [item.period] - Periode sejarah (untuk tipe 'naskah').
     * @param {string} [item.file_url] - URL untuk mengunduh file dari API.
     * @param {string} [item.file_name] - Nama file yang disarankan untuk diunduh dari API.
     */
    function showUniversalDetailModal(item) {
        detailResultJudul.textContent = item.judul || item.title || 'Tidak Diketahui';
        detailResultPenulis.textContent = item.penulis || item.author || 'Tidak Diketahui';
        detailResultAbstrak.textContent = item.abstrak || item.description || 'Tidak ada deskripsi.';

        // Sembunyikan semua bidang opsional secara default
        detailResultRayonContainer.classList.add('hidden');
        detailResultTahunContainer.classList.add('hidden');
        detailResultPenerbitContainer.classList.add('hidden');
        detailResultPeriodeContainer.classList.add('hidden');
        detailResultTanggalUnggahContainer.classList.add('hidden');

        // Tampilkan bidang yang relevan berdasarkan jenis dokumen
        if (item.type === 'makalah') {
            if (item.rayon_name) { detailResultRayon.textContent = item.rayon_name; detailResultRayonContainer.classList.remove('hidden'); }
            if (item.upload_date) { detailResultTanggalUnggah.textContent = new Date(item.upload_date).toLocaleDateString('id-ID'); detailResultTanggalUnggahContainer.classList.remove('hidden'); }
        } else if (item.type === 'buku') {
            if (item.publication_year) { detailResultTahun.textContent = item.publication_year; detailResultTahunContainer.classList.remove('hidden'); }
            if (item.publisher) { detailResultPenerbit.textContent = item.publisher; detailResultPenerbitContainer.classList.remove('hidden'); }
        } else if (item.type === 'prosiding' || item.type === 'jurnal') {
            if (item.year) { detailResultTahun.textContent = item.year; detailResultTahunContainer.classList.remove('hidden'); }
        } else if (item.type === 'naskah') {
            if (item.period) { detailResultPeriode.textContent = item.period; detailResultPeriodeContainer.classList.remove('hidden'); }
        }

        // Tangani tautan unduhan berdasarkan status login
        const actualFileUrl = item.file_url || '#'; // Gunakan file_url dari API
        const actualFileName = item.file_name || 'document'; // Gunakan file_name dari API

        if (userRole === 'public') {
            detailResultDownloadLink.removeAttribute('href');
            detailResultDownloadLink.onclick = (e) => {
                e.preventDefault();
                closeModal('detailSearchResultModal');
                showCustomMessage('Silakan login untuk mengunduh dokumen.', 'info', () => {
                    window.location.assign('login.php'); // Arahkan ke login.php
                });
            };
            detailResultDownloadLink.classList.remove('hidden');
        } else {
            detailResultDownloadLink.href = actualFileUrl;
            detailResultDownloadLink.download = actualFileName;
            detailResultDownloadLink.onclick = null; // Hapus handler onclick sebelumnya untuk pengguna publik
            detailResultDownloadLink.classList.remove('hidden');

            // Tambahkan file ke riwayat terbaru hanya jika unduhan diizinkan (pengguna login)
            addFileToHistory(item); 
        }

        openModal('detailSearchResultModal');
    }

    // --- File History Management ---
    /**
     * Menambahkan item file ke riwayat file terbaru di localStorage.
     * @param {object} fileItem - Objek file yang akan ditambahkan ke riwayat.
     */
    function addFileToHistory(fileItem) {
        if (!fileItem || (!fileItem.file_url && !fileItem.file_name)) {
            console.warn("Mencoba menambahkan item file tidak valid ke riwayat:", fileItem);
            return;
        }
        
        const simplifiedItem = {
            id: fileItem.id, 
            title: fileItem.judul || fileItem.title,
            author: fileItem.penulis || fileItem.author,
            type: fileItem.type,
            file_url: fileItem.file_url,
            file_name: fileItem.file_name
        };

        recentFiles = recentFiles.filter(item => !(item.id === simplifiedItem.id && item.type === simplifiedItem.type));
        recentFiles.unshift(simplifiedItem);
        
        if (recentFiles.length > MAX_RECENT_FILES) {
            recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
        }
        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
        renderRecentFiles(); // Render ulang setelah menambahkan ke riwayat
    }

    // --- Agregasi Data (Mengambil dari API) ---
    /**
     * Memuat semua data perpustakaan digital dari API.
     * Menggabungkan data dari berbagai kategori (makalah kader, buku, prosiding, naskah sejarah, karya ilmiah).
     */
    async function loadAllDigilibData() {
        allDigilibItems = []; // Bersihkan data agregat sebelumnya

        try {
            // Ambil Makalah Kader (Scientific Works)
            const scientificWorksResponse = await getScientificWorks({ status: 'approved' });
            if (scientificWorksResponse && scientificWorksResponse.data) {
                scientificWorksResponse.data.forEach(item => {
                    allDigilibItems.push({
                        id: item.work_id,
                        judul: item.title,
                        penulis: item.author_name,
                        abstrak: item.abstract,
                        type: 'makalah', // Sesuaikan dengan kategori yang Anda inginkan
                        rayon_name: item.rayon_name, // Asumsi ada di data API
                        upload_date: item.upload_date,
                        file_url: item.file_path, // Asumsi file_path adalah URL unduhan
                        file_name: item.file_name,
                        searchKeywords: `${item.title} ${item.author_name} ${item.abstract} ${item.rayon_name}`.toLowerCase()
                    });
                });
            }

            // Ambil Item Digilib (Buku Referensi, Prosiding Seminar, Naskah Sejarah)
            const digilibItemsResponse = await getDigilibItems({ status: 'approved' });
            if (digilibItemsResponse && digilibItemsResponse.data) {
                digilibItemsResponse.data.forEach(item => {
                    let type = 'lain-lain'; // Default
                    if (item.category_name === 'Buku Referensi') {
                        type = 'buku';
                    } else if (item.category_name === 'Prosiding Seminar') {
                        type = 'prosiding';
                    } else if (item.category_name === 'Naskah Sejarah') {
                        type = 'naskah';
                    }
                    // Anda bisa menambahkan kategori lain jika ada

                    allDigilibItems.push({
                        id: item.item_id,
                        judul: item.title,
                        penulis: item.author,
                        abstrak: item.description,
                        type: type,
                        publication_year: item.publication_year,
                        publisher: item.publisher,
                        period: item.period, // Untuk naskah sejarah
                        file_url: item.file_path,
                        file_name: item.file_name,
                        searchKeywords: `${item.title} ${item.author} ${item.description} ${item.category_name} ${item.publication_year} ${item.publisher} ${item.period}`.toLowerCase()
                    });
                });
            }

            console.log("Semua Item Digilib yang Agregat (dari API):", allDigilibItems);

        } catch (error) {
            console.error("Error loading digilib data from API:", error);
            showCustomMessage("Gagal memuat data perpustakaan digital dari server. Silakan coba lagi nanti.", "error");
            // Jika API gagal, allDigilibItems akan tetap kosong, yang akan menampilkan pesan "Tidak ada dokumen"
        }
        
        // Render category cards after data is loaded (or attempted to load)
        renderCategoryCards();
    }

    /**
     * Merender kartu kategori secara dinamis.
     */
    async function renderCategoryCards() {
        categoryCardsContainer.innerHTML = ''; // Clear existing cards

        try {
            const categoriesResponse = await getDigilibCategories({ activeOnly: true });
            let categories = [];
            if (categoriesResponse && categoriesResponse.data) {
                categories = categoriesResponse.data;
            } else {
                showCustomMessage("Gagal memuat kategori digilib. Menampilkan kategori default.", "info");
                // Fallback to hardcoded categories if API fails
                categories = [
                    { name: "Makalah Kader", target_url: "dashboard/manajemen-makalah-kader.html", icon: "fas fa-file-alt", description: "Kumpulan makalah dan tulisan ilmiah dari kader PMII.", keywords: "makalah kader, tulisan ilmiah, karya ilmiah" },
                    { name: "Buku Referensi", target_url: "digilib-buku-referensi.html", icon: "fas fa-book", description: "Koleksi buku-buku penting untuk kajian dan referensi.", keywords: "buku referensi, koleksi buku, bacaan" },
                    { name: "Prosiding Seminar", target_url: "digilib-prosiding-seminar.html", icon: "fas fa-folder-open", description: "Dokumentasi dan materi dari seminar dan diskusi publik.", keywords: "prosiding seminar, diskusi, publikasi, materi" },
                    { name: "Naskah Sejarah", target_url: "digilib-naskah-sejarah.html", icon: "fas fa-scroll", description: "Arsip dan naskah terkait sejarah pergerakan.", keywords: "naskah sejarah, arsip, sejarah pergerakan" },
                    { name: "Jurnal PMII", target_url: "akses-ojs.html", icon: "fas fa-book-journal-whills", description: "Publikasi jurnal resmi dan penelitian internal organisasi.", keywords: "jurnal pmii, publikasi jurnal, penelitian" },
                ];
            }

            if (categories.length > 0) {
                categories.forEach(cat => {
                    const card = `
                        <a href="${cat.target_url}" class="digilib-category-card" data-keywords="${cat.keywords || ''}">
                            <div class="card-icon-wrapper">
                                <i class="${cat.icon} card-icon"></i>
                            </div>
                            <h4>${cat.name}</h4>
                            <p>${cat.description}</p>
                        </a>
                    `;
                    categoryCardsContainer.innerHTML += card;
                });
            } else {
                categoryCardsContainer.innerHTML = `<p class="no-results-message">Tidak ada kategori yang tersedia.</p>`;
            }
        } catch (error) {
            console.error("Error rendering categories:", error);
            showCustomMessage("Gagal memuat kategori digilib. Silakan coba lagi.", "error");
        }
    }


    // --- Fungsi untuk memfilter kartu kategori secara langsung saat mengetik ---
    function liveFilterCategories() {
        const query = digilibSearchInputPage.value.toLowerCase().trim();
        const allCategoryCards = document.querySelectorAll('.digilib-category-card'); // Ambil ulang setiap kali

        let hasVisibleCategories = false;

        searchResultsContainer.classList.add('hidden');
        categoryCardsContainer.classList.remove('hidden');
        recentSearchesContainer.classList.remove('hidden'); // Pastikan riwayat pencarian tetap terlihat
        recentFilesContainer.classList.remove('hidden'); // Pastikan riwayat file tetap terlihat

        if (query === '') {
            allCategoryCards.forEach(card => {
                card.style.display = 'flex';
            });
            noCategoryResultsMessage.classList.add('hidden');
            return; 
        }

        allCategoryCards.forEach(card => {
            const keywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();

            if (keywords.includes(query) || title.includes(query) || description.includes(query)) {
                card.style.display = 'flex';
                hasVisibleCategories = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (noCategoryResultsMessage) {
            if (hasVisibleCategories) {
                noCategoryResultsMessage.classList.add('hidden');
            } else {
                noCategoryResultsMessage.classList.remove('hidden');
            }
        }
    }

    // --- Fungsi untuk menambahkan pencarian ke riwayat ---
    function addSearchToHistory(query) {
        if (query) {
            // Hapus duplikat
            recentSearches = recentSearches.filter(item => item !== query);
            // Tambahkan di awal
            recentSearches.unshift(query);
            // Batasi jumlah entri
            if (recentSearches.length > MAX_RECENT_SEARCHES) {
                recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
            }
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            renderRecentSearches();
        }
    }

    // --- Fungsi untuk merender riwayat pencarian ---
    function renderRecentSearches() {
        recentSearchesList.innerHTML = '';
        recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || []; // Pastikan selalu mengambil data terbaru
        if (recentSearches.length === 0) {
            noRecentSearchesMessage.classList.remove('hidden');
        } else {
            noRecentSearchesMessage.classList.add('hidden');
            recentSearches.forEach(query => {
                const searchItem = document.createElement('span');
                searchItem.className = 'recent-item recent-search-item'; // Tambahkan kelas umum 'recent-item'
                searchItem.textContent = query;
                searchItem.addEventListener('click', () => {
                    digilibSearchInputPage.value = query;
                    fullTextSearch(query); // Jalankan pencarian penuh dengan query dari riwayat
                });
                recentSearchesList.appendChild(searchItem);
            });
        }
    }

    // --- Fungsi untuk merender riwayat file terbaru ---
    function renderRecentFiles() {
        recentFilesList.innerHTML = '';
        recentFiles = JSON.parse(localStorage.getItem('recentFiles')) || [];
        if (recentFiles.length === 0) {
            noRecentFilesMessage.classList.remove('hidden');
        } else {
            noRecentFilesMessage.classList.add('hidden');
            recentFiles.forEach(fileItem => {
                const fileElement = document.createElement('a');
                fileElement.className = 'recent-item recent-file-item'; // Tambahkan kelas umum 'recent-item'
                fileElement.textContent = fileItem.title;
                fileElement.title = `${fileItem.title} (${fileItem.author || 'Tidak Diketahui'})`; // Tooltip
                
                fileElement.addEventListener('click', async (e) => {
                    e.preventDefault(); // Mencegah navigasi langsung
                    let foundItem = null;
                    if (fileItem.type === 'makalah') {
                        const response = await getScientificWorkById(fileItem.id);
                        if (response && response.data) foundItem = { ...response.data, type: 'makalah' };
                    } else { // Untuk buku, prosiding, naskah
                        const response = await getDigilibItemById(fileItem.id);
                        if (response && response.data) foundItem = { ...response.data, type: fileItem.type };
                    }

                    if (foundItem) {
                        showUniversalDetailModal(foundItem);
                    } else {
                        console.error('Item not found via API for recent file:', fileItem);
                        showCustomMessage('Detail dokumen tidak ditemukan di server. Menampilkan data yang tersedia.', 'error');
                        showUniversalDetailModal(fileItem); // Tampilkan detail seadanya dari riwayat
                    }
                });
                recentFilesList.appendChild(fileElement);
            });
        }
    }

    // --- Fungsi untuk merender saran dokumen saat mengetik ---
    function renderDocumentSuggestions(query) {
        searchSuggestionsContainer.innerHTML = ''; // Hapus saran sebelumnya

        if (query.length < 1) { // Tampilkan saran setelah 1 karakter
            searchSuggestionsContainer.classList.add('hidden');
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const matchedSuggestions = allDigilibItems.filter(item => {
            const searchableText = item.searchKeywords; // Gunakan searchKeywords yang sudah dibuat
            return searchableText.includes(lowerCaseQuery);
        }).slice(0, 7); // Batasi hingga 7 saran teratas

        if (matchedSuggestions.length > 0) {
            matchedSuggestions.forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0';
                suggestionItem.textContent = item.judul || item.title;
                suggestionItem.addEventListener('click', () => {
                    digilibSearchInputPage.value = item.judul || item.title; // Isi input dengan saran yang dipilih
                    fullTextSearch(); // Lakukan pencarian penuh
                    searchSuggestionsContainer.classList.add('hidden'); // Sembunyikan saran
                });
                searchSuggestionsContainer.appendChild(suggestionItem);
            });
            searchSuggestionsContainer.classList.remove('hidden');
        } else {
            searchSuggestionsContainer.classList.add('hidden');
        }
    }


    // --- Fungsi untuk melakukan pencarian teks penuh di semua item digilib ---
    function fullTextSearch(queryFromHistory = null) {
        const query = queryFromHistory || digilibSearchInputPage.value.toLowerCase().trim();

        // Sembunyikan saran pencarian saat pencarian penuh dijalankan
        searchSuggestionsContainer.classList.add('hidden');

        if (query === '') {
            categoryCardsContainer.classList.remove('hidden');
            searchResultsContainer.classList.add('hidden');
            noCategoryResultsMessage.classList.add('hidden');
            noFilteredResultsMessage.classList.add('hidden');
            // allCategoryCards.forEach(card => { // allCategoryCards perlu didefinisikan
            //     card.style.display = 'flex'; 
            // });
            // Panggil ulang renderCategoryCards untuk memastikan semua kartu terlihat
            renderCategoryCards();
            paginationControls.classList.add('hidden'); // Sembunyikan pagination
            recentSearchesContainer.classList.remove('hidden'); // Pastikan riwayat pencarian terlihat
            recentFilesContainer.classList.remove('hidden'); // Pastikan riwayat file terlihat
            return;
        }

        // Tambahkan query ke riwayat
        addSearchToHistory(query);

        categoryCardsContainer.classList.add('hidden');
        searchResultsContainer.classList.remove('hidden');
        recentSearchesContainer.classList.add('hidden'); // Sembunyikan riwayat pencarian saat hasil ditampilkan
        recentFilesContainer.classList.add('hidden'); // Sembunyikan riwayat file saat hasil ditampilkan
        searchInputDisplay.textContent = `"${query}"`;
        noCategoryResultsMessage.classList.add('hidden');

        const filteredResults = allDigilibItems.filter(item => {
            const searchableText = item.searchKeywords;
            return searchableText.includes(query);
        });

        currentSearchResults = filteredResults;
        currentPage = 1; // Kembali ke halaman pertama setiap kali pencarian baru
        displayPage(currentPage); // Tampilkan hasil untuk halaman pertama

        // Tampilkan atau sembunyikan kontrol pagination
        if (currentSearchResults.length > itemsPerPage) {
            paginationControls.classList.remove('hidden');
        } else {
            paginationControls.classList.add('hidden');
        }
    }

    // --- Fungsi untuk merender hasil pencarian dokumen (dengan pagination) ---
    function renderSearchResults(resultsToShow) {
        resultsList.innerHTML = '';
        if (resultsToShow.length === 0) {
            noFilteredResultsMessage.classList.remove('hidden');
        } else {
            noFilteredResultsMessage.classList.add('hidden');
            resultsToShow.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'search-result-item';
                
                let authors = item.penulis || item.author || 'Tidak Diketahui';
                let descriptionPreview = item.abstrak || item.description || 'Tidak ada abstrak/deskripsi.';
                let title = item.judul || item.title;
                let metaInfo = [];

                if (item.type === 'makalah') {
                    metaInfo.push(`Kategori: Makalah Kader`);
                    if (item.rayon_name) metaInfo.push(`Rayon: ${item.rayon_name}`);
                    if (item.upload_date) metaInfo.push(`Tanggal Unggah: ${new Date(item.upload_date).toLocaleDateString('id-ID')}`);
                } else if (item.type === 'buku') {
                     metaInfo.push(`Jenis: Buku Referensi`);
                    if (item.publisher) metaInfo.push(`Penerbit: ${item.publisher}`);
                    if (item.publication_year) metaInfo.push(`Tahun: ${item.publication_year}`);
                    if (item.isbn) metaInfo.push(`ISBN: ${item.isbn}`);
                } else if (item.type === 'prosiding') {
                     metaInfo.push(`Jenis: Prosiding Seminar`);
                    if (item.year) metaInfo.push(`Tahun: ${item.year}`);
                } else if (item.type === 'naskah') {
                    metaInfo.push(`Jenis: Naskah Sejarah`);
                    if (item.period) metaInfo.push(`Periode: ${item.period}`);
                } else if (item.type === 'jurnal') {
                    metaInfo.push(`Jenis: Jurnal PMII`);
                    if (item.year) metaInfo.push(`Tahun: ${item.year}`);
                }

                let downloadButtonHtml = '';
                if (item.file_url) { // Hanya tampilkan tombol jika file ada
                    if (userRole !== 'public') { 
                        // Pengguna login: tombol unduh langsung
                        downloadButtonHtml = `
                            <a href="${item.file_url}" download="${item.file_name || 'document'}" class="btn-modern btn-primary-pmii">
                                <i class="fas fa-download mr-2"></i> Unduh File
                            </a>
                        `;
                    } else {
                        // Pengguna publik: tombol unduh yang memicu login
                        downloadButtonHtml = `
                            <button class="btn-modern btn-primary-pmii download-trigger-login" 
                                    data-id="${item.id}" data-type="${item.type}">
                                <i class="fas fa-download mr-2"></i> Unduh File
                            </button>
                        `;
                    }
                }

                itemElement.innerHTML = `
                    <h4 class="item-title">${title}</h4>
                    <p class="item-meta">Oleh: ${authors} ${metaInfo.length > 0 ? `| ${metaInfo.join(' | ')}` : ''}</p>
                    <p class="item-abstract">${descriptionPreview}</p>
                    <div class="item-actions">
                        ${downloadButtonHtml}
                        <button class="btn-modern btn-outline-modern view-detail-btn" data-id="${item.id}" data-type="${item.type}">
                            Lihat Detail
                        </button>
                    </div>
                `;
                resultsList.appendChild(itemElement);
            });
            
            // Lampirkan pendengar peristiwa untuk tombol "Lihat Detail"
            resultsList.querySelectorAll('.view-detail-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const itemId = e.currentTarget.dataset.id;
                    const itemType = e.currentTarget.dataset.type;
                    
                    let foundItem = null;
                    if (itemType === 'makalah') {
                        const response = await getScientificWorkById(itemId);
                        if (response && response.data) foundItem = { ...response.data, type: 'makalah' };
                    } else { // Untuk buku, prosiding, naskah, jurnal
                        const response = await getDigilibItemById(itemId);
                        if (response && response.data) foundItem = { ...response.data, type: itemType };
                    }

                    if (foundItem) {
                        showUniversalDetailModal(foundItem);
                    } else {
                        console.error('Item not found via API for detail modal:', itemId, itemType);
                        showCustomMessage('Dokumen tidak ditemukan.', 'error');
                    }
                });
            });

            // Lampirkan pendengar peristiwa untuk tombol "Unduh File" yang memicu login (untuk pengguna publik)
            resultsList.querySelectorAll('.download-trigger-login').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    showCustomMessage('Silakan login untuk mengunduh dokumen.', 'info', () => {
                        window.location.assign('login.php');
                    });
                });
            });
        }
    }

    // --- Fungsi untuk menampilkan halaman tertentu dari hasil pencarian ---
    function displayPage(page) {
        currentPage = page;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const resultsToShow = currentSearchResults.slice(startIndex, endIndex);

        renderSearchResults(resultsToShow);
        updatePaginationControls();
    }

    // --- Fungsi untuk memperbarui kontrol pagination ---
    function updatePaginationControls() {
        const totalPages = Math.ceil(currentSearchResults.length / itemsPerPage);

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        pageNumbersDiv.innerHTML = '';
        if (totalPages > 0) {
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.classList.add('page-number-btn');
                if (i === currentPage) {
                    pageBtn.classList.add('active');
                }
                pageBtn.addEventListener('click', () => displayPage(i));
                pageNumbersDiv.appendChild(pageBtn);
            }
        }
    }

    // --- Pendengar Peristiwa ---
    digilibSearchInputPage.addEventListener('input', () => {
        liveFilterCategories(); // Filter kartu kategori (sesuai perilaku sebelumnya)
        renderDocumentSuggestions(digilibSearchInputPage.value); // Tampilkan saran dokumen
    });

    digilibSearchButtonPage.addEventListener('click', () => fullTextSearch());
    digilibSearchInputPage.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){
            fullTextSearch();
        }
    });

    backToCategoriesBtn.addEventListener('click', () => {
        digilibSearchInputPage.value = '';
        renderCategoryCards(); // Panggil ulang untuk menampilkan semua kartu kategori
        searchResultsContainer.classList.add('hidden');
        paginationControls.classList.add('hidden'); 
        recentSearchesContainer.classList.remove('hidden'); // Pastikan riwayat pencarian terlihat lagi
        recentFilesContainer.classList.remove('hidden'); // Pastikan riwayat file terlihat lagi
        searchSuggestionsContainer.classList.add('hidden'); // Sembunyikan saran
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(currentSearchResults.length / itemsPerPage);
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    });

    // --- Pemuatan Awal Data dan UI ---
    // Pemuatan awal riwayat pencarian dan file dari localStorage
    recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentFiles = JSON.parse(localStorage.getItem('recentFiles')) || [];
    
    // Pemuatan awal semua data digilib dari API
    loadAllDigilibData();
    renderRecentSearches(); // Muat dan tampilkan riwayat pencarian saat halaman dimuat
    renderRecentFiles(); // Muat dan tampilkan riwayat file saat halaman dimuat
    liveFilterCategories(); // Panggilan awal untuk memastikan keadaan awal yang benar
    updatePageSpecificUI(); // Panggil ini untuk menangani otentikasi dan tampilan menu

    const scrollToTopBtnDigilib = document.getElementById('scrollToTopBtnDigilib');
    if (scrollToTopBtnDigilib) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnDigilib.classList.remove('hidden');
                scrollToTopBtnDigilib.classList.add('flex');
            } else {
                scrollToTopBtnDigilib.classList.add('hidden');
                scrollToTopBtnDigilib.classList.remove('flex');
            }
        });
        scrollToTopBtnDigilib.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.getElementById('tahun-footer-digilib').textContent = new Date().getFullYear();
});
