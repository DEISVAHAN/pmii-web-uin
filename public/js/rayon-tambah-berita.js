// public/js/rayon-tambah-berita.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { submitNews, uploadFile, getAllRayons } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allRayons = []; // Akan menampung semua data rayon dari API

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

    // Elemen DOM spesifik untuk halaman tambah berita
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');
    const addNewsArticleForm = document.getElementById('addNewsArticleForm');
    const formResponse = document.getElementById('form-response');
    const newsTitleInput = document.getElementById('newsTitle');
    const newsCategorySelect = document.getElementById('newsCategory');
    const newsImageUploadInput = document.getElementById('newsImageUpload');
    const newsImageUrlInput = document.getElementById('newsImageUrl');
    const newsImagePreview = document.getElementById('newsImagePreview');
    const newsImageUploadPlaceholder = document.getElementById('newsImageUploadPlaceholder');
    const newsDescriptionTextarea = document.getElementById('newsDescription');


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
        const allowedRolesForThisPage = ['rayon', 'komisariat']; // Admin Rayon dan Komisariat
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
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Rayon atau Komisariat.", 'error', () => {
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

        // Update back link based on role
        if (backToDashboardLink) {
            if (userRole === 'komisariat') {
                backToDashboardLink.href = 'admin-dashboard-komisariat.php';
            } else if (userRole === 'rayon') {
                backToDashboardLink.href = 'admin-dashboard-rayon.php';
            }
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


    // --- FUNGSI UTAMA TAMBAH KEGIATAN RAYON ---

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

    // Logika Unggah dan Pratinjau Gambar Kegiatan
    const activityImageUrlInput = document.getElementById('activityImageUrl');
    const activityImageUploadInput = document.getElementById('activityImageUpload');
    const activityImagePreview = document.getElementById('activityImagePreview');
    const activityImageUploadPlaceholder = document.getElementById('activityImageUploadPlaceholder');

    // Tampilkan pratinjau gambar jika ada URL atau file yang diunggah
    function showImagePreview(src) {
        if (src) {
            activityImagePreview.src = src;
            activityImagePreview.style.display = 'block';
            activityImageUploadPlaceholder.style.display = 'none';
        } else {
            activityImagePreview.src = '';
            activityImagePreview.style.display = 'none';
            activityImageUploadPlaceholder.style.display = 'flex';
        }
    }

    // Tangani perubahan input URL
    if (activityImageUrlInput) {
        activityImageUrlInput.addEventListener('input', function() {
            const url = this.value;
            if (url) {
                showImagePreview(url);
                activityImageUploadInput.value = ''; // Bersihkan input file jika URL disediakan
            } else {
                // Jika URL dihapus, tampilkan placeholder jika tidak ada file yang diunggah
                if (!activityImageUploadInput.files[0]) {
                    showImagePreview('');
                }
            }
            updateLabelClass(this); // Perbarui floating label
        });
    }

    // Tangani perubahan input file
    if (activityImageUploadInput) {
        activityImageUploadInput.addEventListener('change', async function() { // Tambahkan async
            if (this.files && this.files[0]) {
                const file = this.files[0];
                if (file.size > 2 * 1024 * 1024) { // Batas 2MB
                    window.showCustomMessage('Ukuran gambar terlalu besar. Maksimal 2MB.', 'error');
                    this.value = ''; // Bersihkan input
                    showImagePreview(''); // Kembali ke placeholder
                    return;
                }
                
                // Unggah file dan dapatkan URL dari API
                try {
                    const uploadResponse = await uploadFile(this, { type: 'image', purpose: 'activity_image', sender_id: loggedInUser.user_id });
                    if (uploadResponse && uploadResponse.file_url) {
                        showImagePreview(uploadResponse.file_url);
                        activityImageUrlInput.value = uploadResponse.file_url; // Set URL dari unggahan ke input URL
                        updateLabelClass(activityImageUrlInput); // Perbarui floating label untuk input URL
                        window.showCustomMessage(`Gambar "${uploadResponse.file_name}" berhasil diunggah!`, 'success');
                    } else {
                        throw new Error(uploadResponse.message || "Gagal mengunggah gambar.");
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    window.showCustomMessage(`Gagal mengunggah gambar: ${error.message}`, 'error');
                    // Do not rethrow, continue with other files
                }
            } else {
                // Jika input file dihapus, tampilkan placeholder jika tidak ada URL yang disediakan
                if (!activityImageUrlInput.value) {
                    showImagePreview('');
                }
            }
            updateLabelClass(this); // Perbarui floating label
        });
    }

    // Inisialisasi pratinjau saat dimuat
    if (activityImageUrlInput) { // Periksa keberadaan elemen
        if (activityImageUrlInput.value) {
            showImagePreview(activityImageUrlInput.value); // Tampilkan gambar URL jika ada saat dimuat
        } else if (activityImagePreview && activityImagePreview.src && !activityImagePreview.src.includes('placehold.co')) { // Check if image preview already has a src (e.g. from previous load)
            // If the image preview already has a real image, ensure placeholder is hidden
            showImagePreview(activityImagePreview.src);
        }
    }


    // Elemen pendaftaran
    const enableRegistrationCheckbox = document.getElementById('enableRegistration');
    const registrationFieldsContainer = document.getElementById('registration-fields');
    const registrantNameInput = document.getElementById('registrantName');
    const registrantEmailInput = document.getElementById('registrantEmail');
    const registrantPhoneInput = document.getElementById('registrantPhone');
    const registrantTypeSelect = document.getElementById('registrantType');
    const addRegistrantBtn = document.getElementById('addRegistrantBtn');
    const registrantsList = document.getElementById('registrants-list');
    const noRegistrantsMessage = document.getElementById('no-registrants-message');

    // Event listener untuk checkbox "Aktifkan Pendaftaran"
    if (enableRegistrationCheckbox) {
        enableRegistrationCheckbox.addEventListener('change', function() {
            if (this.checked) {
                registrationFieldsContainer.classList.remove('hidden');
                // Reset fields when shown
                registrantNameInput.value = '';
                registrantEmailInput.value = '';
                registrantPhoneInput.value = '';
                registrantTypeSelect.value = '';
                currentActivityRegistrations = []; // Clear existing registrants
                renderRegistrantsList();
            } else {
                registrationFieldsContainer.classList.add('hidden');
            }
        });
    }

    // Fungsi untuk merender daftar pendaftar
    function renderRegistrantsList() {
        if (!registrantsList) return;
        registrantsList.innerHTML = ''; // Hapus yang sudah ada
        if (currentActivityRegistrations.length === 0) {
            registrantsList.classList.add('hidden');
            noRegistrantsMessage.classList.remove('hidden');
        } else {
            registrantsList.classList.remove('hidden');
            noRegistrantsMessage.classList.add('hidden');
            currentActivityRegistrations.forEach((reg, index) => {
                const registrantItem = document.createElement('div');
                registrantItem.className = 'flex items-center justify-between p-2 border-b last:border-b-0 border-gray-200 text-sm';
                registrantItem.innerHTML = `
                    <div>
                        <p class="font-semibold">${reg.name} (${reg.type})</p>
                        <p class="text-text-muted">${reg.email} | ${reg.phone}</p>
                    </div>
                    <button type="button" class="text-red-500 hover:text-red-700 ml-2 remove-registrant-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                registrantsList.appendChild(registrantItem);
            });

            // Tambahkan event listener untuk tombol hapus
            registrantsList.querySelectorAll('.remove-registrant-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const indexToRemove = parseInt(this.dataset.index);
                    currentActivityRegistrations.splice(indexToRemove, 1);
                    renderRegistrantsList(); // Render ulang daftar
                    window.showCustomMessage('Pendaftar berhasil dihapus dari daftar sementara.', 'info');
                });
            });
        }
    }

    // Event listener untuk tombol "Tambahkan Pendaftar"
    if (addRegistrantBtn) {
        addRegistrantBtn.addEventListener('click', function() {
            const name = registrantNameInput.value.trim();
            const email = registrantEmailInput.value.trim();
            const phone = registrantPhoneInput.value.trim();
            const type = registrantTypeSelect.value;

            if (!name || !email || !phone || !type) {
                window.showCustomMessage('Harap isi semua detail pendaftar (Nama, Email, Telepon, Jenis).', 'error');
                return;
            }

            // Tambahkan pendaftar ke array sementara
            currentActivityRegistrations.push({ name, email, phone, type, registeredAt: new Date().toISOString() });

            // Bersihkan bidang formulir pendaftar
            registrantNameInput.value = '';
            registrantEmailInput.value = '';
            registrantPhoneInput.value = '';
            registrantTypeSelect.value = '';
            allInputs.forEach(input => updateLabelClass(input)); // Update floating labels

            renderRegistrantsList(); // Render ulang daftar
            window.showCustomMessage('Pendaftar berhasil ditambahkan ke daftar sementara!', 'success');
        });
    }

    // Logika Pengajuan Formulir Utama Kegiatan
    document.getElementById('addActivityForm')?.addEventListener('submit', async function(e) { // Tambahkan async
        e.preventDefault();
        
        const activityTitle = activityTitleInput.value.trim();
        const activityDate = activityDateInput.value.trim();
        const activityTime = activityTimeInput.value.trim();
        const activityLocation = activityLocationInput.value.trim();
        const activityDescription = activityDescriptionTextarea.value.trim();
        const enableRegistration = enableRegistrationCheckbox.checked;

        // Validasi dasar
        if (!activityTitle || !activityDate || !activityTime || !activityLocation || !activityDescription) {
            window.showCustomMessage('Harap isi semua bidang kegiatan yang wajib.', 'error');
            return;
        }

        let imageUrlToSave = null;
        // Jika ada URL gambar langsung
        if (activityImageUrlInput.value) { 
            imageUrlToSave = activityImageUrlInput.value;
        } else if (activityImageUploadInput.files && activityImageUploadInput.files[0]) { 
            // URL sudah didapatkan dan disimpan di input URL oleh event listener change pada newsImageUploadInput
            imageUrlToSave = activityImageUrlInput.value; 
            if (!imageUrlToSave) { // Fallback jika uploadFile gagal tapi ada file
                window.showCustomMessage('Gagal mendapatkan URL gambar yang diunggah. Coba lagi.', 'error');
                return;
            }
        }
        // Jika tidak ada URL atau file, imageUrlToSave akan null atau string kosong, tergantung implementasi backend Anda.

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


        const activityData = {
            title: activityTitle,
            activity_date: activityDate,
            activity_time: activityTime,
            location: activityLocation,
            description: activityDescription,
            image_url: imageUrlToSave, // URL gambar yang sudah diunggah atau dari input URL
            registration_enabled: enableRegistration ? 1 : 0, // Convert boolean to 1/0
            submitted_by_user_id: loggedInUser.user_id, // Asumsi user_id ada
            submitted_by_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
            sender_rayon_id: senderRayonId, // ID Rayon pengirim
            sender_rayon_name: senderRayonName, // Nama Rayon pengirim
            status: 'pending' // Status default pending
        };

        try {
            const response = await submitActivity(activityData); // Panggil API submitActivity
            if (response && response.success) {
                const newActivityId = response.data.activity_id; // Asumsi API mengembalikan ID kegiatan yang baru dibuat

                // Jika pendaftaran diaktifkan dan ada pendaftar, kirimkan pendaftar
                if (enableRegistration && currentActivityRegistrations.length > 0) {
                    for (const registrant of currentActivityRegistrations) {
                        await registerForActivity(newActivityId, { // Panggil API registerForActivity
                            activity_id: newActivityId,
                            name: registrant.name,
                            email: registrant.email,
                            phone_number: registrant.phone,
                            type: registrant.type,
                            registered_at: registrant.registeredAt
                        });
                    }
                    window.showCustomMessage('Kegiatan diajukan & pendaftar disimpan ke database!', 'success');
                } else {
                    window.showCustomMessage('Kegiatan berhasil diajukan untuk verifikasi!', 'success');
                }
                
                // Reset form setelah pengajuan berhasil
                this.reset(); 
                allInputs.forEach(input => updateLabelClass(input)); 
                showImagePreview(''); // Reset pratinjau gambar ke placeholder
                enableRegistrationCheckbox.checked = false; // Reset checkbox
                registrationFieldsContainer.classList.add('hidden'); // Sembunyikan bidang pendaftaran
                currentActivityRegistrations = []; // Bersihkan daftar pendaftar sementara
                renderRegistrantsList(); // Render ulang daftar kosong

            } else {
                throw new Error(response.message || 'Gagal mengirim pengajuan kegiatan.');
            }
        } catch (error) {
            console.error("Error submitting activity:", error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengajukan kegiatan.', 'error');
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