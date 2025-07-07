// public/js/rayon-tambah-galeri.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { uploadGalleryItem, uploadFile, getAllRayons } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allRayons = []; // Akan menampung semua data rayon dari API
    let uploadedImages = []; // Menyimpan URL gambar yang diunggah

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Elemen DOM spesifik untuk halaman tambah galeri
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');
    const addGalleryForm = document.getElementById('addGalleryForm');
    const formResponse = document.getElementById('form-response');
    const galleryCaptionInput = document.getElementById('galleryCaption');
    const galleryImageUploadInput = document.getElementById('galleryImageUpload');
    const galleryImagesPreviewList = document.getElementById('gallery-images-preview-list');
    const galleryUploadPlaceholder = document.getElementById('galleryUploadPlaceholder');


    // --- Custom Message Box & Confirm Modal (Global Helper Functions) ---
    window.showCustomMessage = window.showCustomMessage || function(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return;
        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';
        if (type === 'success') { messageBox.classList.add('bg-green-500'); } else if (type === 'error') { messageBox.classList.add('bg-red-500'); } else { messageBox.classList.add('bg-blue-500'); }
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) messageBox.addEventListener('transitionend', function handler() { callback(); messageBox.removeEventListener('transitionend', handler); });
        }, 3000);
    };

    window.showCustomConfirm = window.showCustomConfirm || function(title, message, onConfirm, onCancel = null) {
        const customConfirmModal = document.getElementById('customConfirmModal');
        const confirmModalTitle = document.getElementById('confirmModalTitle');
        const confirmModalMessage = document.getElementById('confirmModalMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        let currentConfirmCallback = null;
        if (!customConfirmModal || !confirmModalTitle || !confirmModalMessage || !confirmYesBtn || !confirmCancelBtn) return;
        confirmModalTitle.textContent = title; confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active'); currentConfirmCallback = onConfirm;
        confirmYesBtn.onclick = () => { if (currentConfirmCallback) { currentConfirmCallback(); } hideCustomConfirm(); };
        confirmCancelBtn.onclick = () => { if (onCancel) { onCancel(); } hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };


    // --- AUTHENTICATION & UI SETUP ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['rayon']; // Hanya admin rayon yang bisa akses
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ];

        const currentPage = window.location.pathname.split('/').pop();
        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : 'public';

        if (userRole && allowedRolesForThisPage.includes(userRole)) {
            hasAccess = true;
        }

        if (!defaultAllowedPages.includes(currentPage) && !hasAccess) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Rayon.", 'error', () => {
                window.location.assign('../login.php');
            });
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-pmii-darkblue text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-pmii-yellow mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn btn-primary-pmii text-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
            return false;
        }

        // Update header titles and dynamic links (from common auth module)
        const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
        const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';

        if (headerTitleText) {
            headerTitleText.textContent = (userRole !== 'public') ? loggedInTitle : defaultTitle;
        }
        if (mobileHeaderTitleText) {
            mobileHeaderTitleText.textContent = (userRole !== 'public') ? loggedInTitle : defaultTitle;
        }
        
        // Handle Auth Link (Login/Logout button)
        if (authLinkMain) {
            authLinkMain.removeEventListener('click', handleAuthClick);
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
            authLinkMain.addEventListener('click', handleAuthClick);
        }
        if (authLinkMobile) {
            authLinkMobile.removeEventListener('click', handleAuthClick);
            if (userRole !== 'public') {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Logout</span>`;
                authLinkMobile.classList.add('logout-active');
                authLinkMobile.dataset.action = "logout";
            } else {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLinkMobile.classList.remove('logout-active');
                authLinkMobile.classList.add('logged-out-styles');
                authLinkMobile.dataset.action = "login";
            }
            authLinkMobile.addEventListener('click', handleAuthClick);
        }

        // Update desktop menu visibility (assuming these are defined in style.css or parent scripts)
        const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
        const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');
        if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.add('hidden');
        if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.add('hidden');
        if (userRole === 'komisariat' || userRole === 'rayon') {
            if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            // Assuming adminMenuLinks desktop visibility is handled by auth.js based on role
        } else if (userRole === 'kader') {
            if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.remove('hidden');
        }

        // Populate mobile menu (function from auth.js)
        populateMobileMenu();

        // Update back link for Rayon Admin
        if (backToDashboardLink) {
            backToDashboardLink.href = 'admin-dashboard-rayon.php';
        }
        
        return true;
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
            { text: 'Beranda', href: '../index.php#beranda', icon: 'fas fa-home' },
            { text: 'Tentang Kami', href: '../tentang-kami.php', icon: 'fas fa-info-circle' },
            { text: 'Berita', href: '../berita-artikel.php', icon: 'fas fa-newspaper' },
            { text: '📚 Digilib', href: '../digilib.php', icon: 'fas fa-book-reader' },
            { text: 'Kegiatan', href: '../agenda-kegiatan.php', icon: 'fas fa-calendar-alt' },
            { text: 'Galeri', href: '../galeri-foto.php', icon: 'fas fa-images' },
            { text: 'Kontak', href: '../index.php#kontak', icon: 'fas fa-envelope' },
        ];

        commonLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-nav-link';
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.text}</span>`;
            mobileNavLinksContainer.appendChild(a);
        });

        // Tautan khusus berdasarkan peran
        if (loggedInUser) {
            if (loggedInUser.role === 'kader') {
                appendMobileSubmenu(mobileNavLinksContainer, 'Profil Kader', [
                    { text: 'Edit Profil', href: 'edit-profil-kader.php', icon: 'fas fa-user-edit' },
                    { text: 'Pengaturan Akun', href: 'pengaturan-akun-kader.php', icon: 'fas fa-cog' },
                    { text: 'Jurnal Al Harokah', href: '../akses-ojs.php', icon: 'fas fa-book-reader' },
                    { text: 'Pengajuan Surat', href: 'pengajuan-surat.php', icon: 'fas fa-file-alt' },
                ]);
            } else if (loggedInUser.role === 'rayon' || loggedInUser.role === 'komisariat') {
                appendMobileSubmenu(mobileNavLinksContainer, 'Sistem Internal', [
                    // Tautan untuk semua admin (komisariat & rayon)
                    { text: 'Manajemen Kader', href: 'manajemen-kader.php', icon: 'fas fa-users-cog' },
                    { text: 'Repository Ilmiah', href: 'repository-ilmiah.php', icon: 'fas fa-book-open' },
                    { text: 'Pengajuan Surat', href: 'pengajuan-surat.php', icon: 'fas fa-file-alt' },
                    { text: 'Verifikasi Surat', href: 'verifikasi-surat.php', icon: 'fas fa-check-circle' },
                    { text: 'Jurnal Al Harokah', href: '../akses-ojs.php', icon: 'fas fa-book-reader' },
                    { text: 'Verifikasi Konten Rayon', href: 'verifikasi-konten-rayon.php', icon: 'fas fa-check-double' },
                    { text: 'Tambah Berita & Artikel', href: 'rayon-tambah-berita.php', icon: 'fas fa-newspaper' },
                    { text: 'Tambah Kegiatan', href: 'rayon-tambah-kegiatan.php', icon: 'fas fa-calendar-plus' },
                    { text: 'Tambah Galeri Kegiatan', href: 'rayon-tambah-galeri.php', icon: 'fas fa-images' },
                    { text: 'Edit Profil Rayon', href: 'edit-profil-rayon.php', icon: 'fas fa-building' },
                ]);

                if (loggedInUser.role === 'komisariat') {
                    appendMobileSubmenu(mobileNavLinksContainer, 'Admin Komisariat', [
                        { text: 'Manajemen Akun', href: 'manajemen-akun.php', icon: 'fas fa-user-shield' },
                        { text: 'Dashboard Admin Kom.', href: 'admin-dashboard-komisariat.php', icon: 'fas fa-tachometer-alt' },
                        { text: 'Edit Beranda', href: 'edit-beranda.php', icon: 'fas fa-edit' },
                        { text: 'Pengaturan Situs', href: 'pengaturan-situs.php', icon: 'fas fa-cogs' },
                        { text: 'Dashboard Statistik', href: 'dashboard-statistik.php', icon: 'fas fa-chart-bar' },
                        { text: 'Kelola Notifikasi', href: 'kelola-notifikasi.php', icon: 'fas fa-bell' },
                        { text: 'Laporan & Analisis', href: 'laporan-analisis.php', icon: 'fas fa-file-invoice' },
                        { text: 'TTD Digital', href: '../generate-qr.php', icon: 'fas fa-qrcode' },
                        { text: 'Arsiparis Kepengurusan', href: 'arsiparis.php', icon: 'fas fa-archive' },
                    ]);
                }
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
            populateMobileMenu(); // Isi menu sebelum ditampilkan
            mobileMenuContent.classList.add('menu-active');
            mobileMenuOverlay.classList.add('menu-active');
            document.body.classList.add('overflow-hidden'); // Mencegah scrolling latar belakang
        } else {
            mobileMenuContent.classList.remove('menu-active');
            mobileMenuOverlay.classList.remove('menu-active');
            document.body.classList.remove('overflow-hidden'); // Mengizinkan scrolling latar belakang
        }
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);


    // --- FUNGSI UTAMA TAMBAH GALERI KEGIATAN RAYON ---

    // Fungsi untuk mengupdate kelas floating label
    function updateLabelClass(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label-modern')) {
            if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
    }

    // Inisialisasi floating labels untuk semua input saat DOMContentLoaded
    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
        updateLabelClass(input);
        input.addEventListener('input', () => updateLabelClass(input));
        input.addEventListener('change', () => updateLabelClass(input));
        input.addEventListener('blur', () => updateLabelClass(input));
        input.addEventListener('focus', () => {
            const label = input.nextElementSibling;
            if(label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            const label = input.nextElementSibling;
            updateLabelClass(input);
            if(label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
        });
    });

    // Gallery Image Upload and Preview Logic
    const galleryImageUploadInput = document.getElementById('galleryImageUpload');
    const galleryImagesPreviewList = document.getElementById('gallery-images-preview-list');
    const galleryUploadPlaceholder = document.getElementById('galleryUploadPlaceholder');

    // Render previews of currently uploaded images
    function renderGalleryPreviews() {
        if (!galleryImagesPreviewList) return;
        galleryImagesPreviewList.innerHTML = ''; // Clear existing previews

        if (uploadedImages.length === 0) {
            galleryUploadPlaceholder.style.display = 'flex'; // Show placeholder if no images
            return;
        } else {
            galleryUploadPlaceholder.style.display = 'none'; // Hide placeholder if images exist
        }

        uploadedImages.forEach((imageSrc, index) => {
            const imgItem = document.createElement('div');
            imgItem.className = 'gallery-image-item';
            imgItem.innerHTML = `
                <img src="${imageSrc}" alt="Galeri Gambar ${index + 1}">
                <button type="button" class="remove-btn" data-index="${index}"><i class="fas fa-times"></i></button>
            `;
            galleryImagesPreviewList.appendChild(imgItem);
        });

        // Add event listeners for remove buttons
        galleryImagesPreviewList.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToRemove = parseInt(this.dataset.index);
                uploadedImages.splice(indexToRemove, 1); // Remove from array
                renderGalleryPreviews(); // Re-render the list
                window.showCustomMessage('Gambar berhasil dihapus dari pratinjau.', 'info');
            });
        });
    }

    // Handle multiple file selection for gallery
    if (galleryImageUploadInput) {
        galleryImageUploadInput.addEventListener('change', async function() { // Tambahkan async
            const files = this.files;
            if (files.length > 0) {
                // Clear previous uploaded images if new files are selected
                uploadedImages = []; 
                for (const file of Array.from(files)) { // Use for...of for await inside loop
                    if (file.size > 2 * 1024 * 1024) { // Max 2MB
                        window.showCustomMessage(`Ukuran gambar "${file.name}" terlalu besar (maks 2MB).`, 'error');
                        continue; // Skip this file
                    }
                    try {
                        // Unggah setiap file satu per satu
                        const uploadResponse = await uploadFile(this, { type: 'image', purpose: 'gallery_item', sender_id: loggedInUser.user_id, file_name: file.name });
                        if (uploadResponse && uploadResponse.file_url) {
                            uploadedImages.push(uploadResponse.file_url);
                            window.showCustomMessage(`Gambar "${uploadResponse.file_name}" berhasil diunggah!`, 'success');
                        } else {
                            throw new Error(uploadResponse.message || `Gagal mengunggah gambar "${file.name}".`);
                        }
                    } catch (error) {
                        console.error(`Error uploading image "${file.name}":`, error);
                        window.showCustomMessage(`Gagal mengunggah gambar "${file.name}": ${error.message}`, 'error');
                        // Do not rethrow, continue with other files
                    }
                }
                renderGalleryPreviews(); // Render setelah semua upload (atau yang sukses) selesai
                this.value = ''; // Clear file input after reading
            }
        });
    }

    // Initial render (empty list)
    renderGalleryPreviews();

    // Form Submission Logic
    document.getElementById('addGalleryForm')?.addEventListener('submit', async function(e) { // Tambahkan async
        e.preventDefault();
        const galleryCaption = galleryCaptionInput.value.trim();

        if (!galleryCaption) {
            window.showCustomMessage('Judul/Keterangan Galeri wajib diisi.', 'error');
            return;
        }
        if (uploadedImages.length === 0) {
            window.showCustomMessage('Mohon unggah setidaknya satu gambar untuk galeri.', 'error');
            return;
        }

        // Get sender Rayon ID and Name from loggedInUser
        let senderRayonId = loggedInUser.rayon_id || null;
        let senderRayonName = loggedInUser.rayon_name || null;

        // If rayon_id is not available from loggedInUser, try to find it from allRayons based on name
        if (!senderRayonId && loggedInUser.namaRayon) {
            const foundRayon = allRayons.find(r => r.name === loggedInUser.namaRayon);
            if (foundRayon) {
                senderRayonId = foundRayon.id;
            }
        }
        
        if (!senderRayonId) {
            window.showCustomMessage('Data rayon pengirim tidak ditemukan. Harap login kembali atau hubungi admin.', 'error');
            return;
        }


        const galleryData = {
            caption: galleryCaption,
            image_urls: uploadedImages, // Array of URLs from successful uploads
            submitted_by_user_id: loggedInUser.user_id,
            submitted_by_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
            sender_rayon_id: senderRayonId,
            sender_rayon_name: senderRayonName,
            status: 'pending' // Default status pending
        };

        try {
            const response = await uploadGalleryItem(galleryData); // Panggil API uploadGalleryItem
            if (response && response.success) {
                window.showCustomMessage('Galeri kegiatan berhasil diajukan untuk verifikasi!', 'success');
                this.reset(); // Reset form
                allInputs.forEach(input => updateLabelClass(input)); // Update floating labels
                uploadedImages = []; // Clear array after submission
                renderGalleryPreviews(); // Clear previews
            } else {
                throw new Error(response.message || 'Gagal mengajukan galeri kegiatan.');
            }
        } catch (error) {
            console.error("Error submitting gallery:", error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengajukan galeri kegiatan.', 'error');
        }
    });


    // --- INITIALISASI HALAMAN ---
    await initializePageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Muat data rayon untuk pre-fill rayon input dan dropdown
    try {
        const rayonsResponse = await getAllRayons();
        if (rayonsResponse && rayonsResponse.data) {
            allRayons = rayonsResponse.data;
        } else {
            console.warn("Gagal memuat data rayon untuk halaman. Beberapa fungsionalitas mungkin terbatas.");
        }
    } catch (error) {
        console.error("Error loading rayons data during initialization:", error);
        window.showCustomMessage("Gagal memuat data rayon. Beberapa fungsionalitas mungkin terbatas.", "error");
    }


    // Inisialisasi tahun di footer
    const tahunFooterKader = document.getElementById('tahun-footer-kader');
    if (tahunFooterKader) {
        tahunFooterKader.textContent = new Date().getFullYear();
    }

    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtn.classList.remove('hidden');
                scrollToTopBtn.classList.add('flex');
            } else {
                scrollToTopBtn.classList.add('hidden');
                scrollToTopBtn.classList.remove('flex');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});