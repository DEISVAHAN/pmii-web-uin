// public/js/manajemen-makalah-kader.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getScientificWorks, getScientificWorkById, uploadFile, uploadScientificWork, updateScientificWork, deleteScientificWork, getAllRayons, getUsers } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allScientificWorksData = []; // Akan menampung semua data karya ilmiah
    let allRayons = []; // Untuk mendapatkan nama Rayon
    let allUsers = []; // Untuk mendapatkan nama penulis (jika bukan user yang login)

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

    // Elemen DOM spesifik untuk halaman repository ilmiah
    const userInfoHeader = document.getElementById('user-info'); // Di header internal
    const authInfoHeader = document.getElementById('auth-info-header'); // Link Login/Logout di header internal

    const backToDashboardLink = document.getElementById('back-to-dashboard-link');
    const subtitleText = document.getElementById('subtitle-text');
    const uploadFormSection = document.getElementById('upload-form-section'); // Formulir unggah

    const formUploadKarya = document.getElementById('formUploadKarya');
    const formResponse = document.getElementById('form-response');
    const karyaIdInput = document.getElementById('karyaId'); // Hidden ID for editing
    const judulKaryaInput = document.getElementById('judul_karya');
    const penulisKaryaInput = document.getElementById('penulis_karya');
    const tipeKaryaSelect = document.getElementById('tipe_karya');
    const abstrakKaryaTextarea = document.getElementById('abstrak_karya');
    const fileKaryaInput = document.getElementById('file_karya');
    const fileNamePreview = document.getElementById('fileNamePreview');
    const submitFormButton = document.getElementById('submitFormButton');
    const resetFormButton = document.getElementById('resetFormButton');
    const rayonInputGroup = document.getElementById('rayon-input-group'); // This is the div containing makalahRayonSelect

    const tabelKaryaIlmiahBody = document.getElementById('tabelKaryaIlmiahBody');
    const searchKaryaIlmiahInput = document.getElementById('searchKaryaIlmiah');
    const filterStatusKaryaSelect = document.getElementById('filterStatusKarya');
    const filterStatusContainer = document.getElementById('filter-status-container'); // Container for status filter
    const filterRayonSelect = document.getElementById('filterRayon');
    const filterRayonContainer = document.getElementById('filter-rayon-container'); // Container for rayon filter

    // Detail Modal Elements
    const detailMakalahModal = document.getElementById('detailMakalahModal');
    const detailModalTitle = document.getElementById('detailModalTitle');
    const detailJudul = document.getElementById('detailJudul');
    const detailPenulis = document.getElementById('detailPenulis');
    const detailRayon = document.getElementById('detailRayon');
    const detailTanggal = document.getElementById('detailTanggal');
    const detailStatus = document.getElementById('detailStatus');
    const detailKomentarAdminContainer = document.getElementById('detailKomentarAdminContainer');
    const detailKomentarAdmin = document.getElementById('detailKomentarAdmin');
    const detailAbstrak = document.getElementById('detailAbstrak');
    const detailDownloadLink = document.getElementById('detailDownloadLink');

    // Custom Confirm Modal Elements
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle'); // This will be defined by showCustomConfirm
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    let confirmCallback = null; // Stores the callback for confirmation

    let currentFileUrl = null; // Untuk menyimpan URL file yang sudah ada/baru diunggah
    let editingKaryaId = null; // To track which item is being edited


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
        cancelConfirmBtn.onclick = () => { if (onCancel) { onCancel(); } hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };

    // --- AUTHENTICATION & UI SETUP ---
    async function initializePageAccess() {
        const authData = getAuthData();
        loggedInUser = authData.userData || phpLoggedInUser; // Prioritize actual login data

        let userRole = loggedInUser ? loggedInUser.role : 'public';

        // Update common UI elements (navbar, etc.)
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

        // Update desktop menu visibility
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

        // Control page access: only allow Rayon Admin and Komisariat Admin
        const allowedRolesForThisPage = ['rayon', 'komisariat'];
        const currentPage = window.location.pathname.split('/').pop();
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ];

        let hasAccess = false;
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
        
        // Update user info in header
        if (userInfoHeader) {
            userInfoHeader.textContent = `Halo, ${loggedInUser?.full_name || loggedInUser?.nama || 'Pengguna'}`;
            userInfoHeader.classList.remove('hidden');
        }

        // Show/hide upload form and filter based on role
        if (userRole === 'kader' || userRole === 'rayon' || userRole === 'komisariat') {
            uploadFormSection.classList.remove('hidden');
            if (userRole === 'kader') {
                pageMainTitle.textContent = 'Ajukan Makalah Anda';
                pageSubtitle.textContent = 'Unggah dan kelola karya ilmiah pribadi Anda.';
                formSectionTitle.textContent = 'Unggah Makalah Baru';
                
                penulisKaryaInput.value = loggedInUser.full_name || loggedInUser.nama || '';
                penulisKaryaInput.disabled = true;
                penulisKaryaInput.classList.add('has-value');

                // Pre-fill and disable Rayon for Kader (assuming rayon_id is part of loggedInUser)
                const kaderRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                if (kaderRayon) {
                    makalahRayonSelect.innerHTML = `<option value="${kaderRayon.id}" selected>${kaderRayon.name}</option>`;
                    makalahRayonSelect.disabled = true;
                    makalahRayonSelect.classList.add('has-value');
                } else {
                    makalahRayonSelect.innerHTML = `<option value="" disabled selected>Rayon tidak ditemukan</option>`;
                    makalahRayonSelect.disabled = true;
                }
                rayonInputGroup.classList.remove('hidden'); // Ensure rayon dropdown is visible
                
                filterStatusContainer.classList.add('hidden'); // Kader doesn't filter status
                filterRayonContainer.classList.add('hidden'); // Kader doesn't filter by rayon

                backToDashboardLink.href = 'edit-profil-kader.php'; // Kader back to edit profile

            } else if (userRole === 'rayon') {
                pageMainTitle.textContent = 'Manajemen Makalah Rayon';
                pageSubtitle.textContent = `Kelola dan verifikasi karya ilmiah kader dari ${loggedInUser.rayon_name || 'Rayon Anda'}.`;
                formSectionTitle.textContent = 'Ajukan / Edit Makalah Kader';
                
                penulisKaryaInput.disabled = false;
                makalahRayonSelect.disabled = false;
                // Pre-fill and disable Rayon for Rayon Admin
                const rayonAdminRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                if (rayonAdminRayon) {
                    makalahRayonSelect.innerHTML = `<option value="${rayonAdminRayon.id}" selected>${rayonAdminRayon.name}</option>`;
                    makalahRayonSelect.disabled = true;
                    makalahRayonSelect.classList.add('has-value');
                } else {
                    makalahRayonSelect.innerHTML = `<option value="" disabled selected>Rayon tidak ditemukan</option>`;
                    makalahRayonSelect.disabled = true;
                }
                rayonInputGroup.classList.remove('hidden');

                filterStatusContainer.classList.remove('hidden'); // Rayon can filter status
                filterRayonContainer.classList.add('hidden'); // Rayon admin doesn't filter by rayon

                backToDashboardLink.href = 'admin-dashboard-rayon.php'; // Rayon back to rayon dashboard

            } else if (userRole === 'komisariat') {
                pageMainTitle.textContent = 'Manajemen Makalah Kader';
                pageSubtitle.textContent = 'Kelola semua makalah dan karya ilmiah dari kader PMII.';
                formSectionTitle.textContent = 'Ajukan / Edit Makalah Kader';

                penulisKaryaInput.disabled = false;
                makalahRayonSelect.disabled = false;
                rayonInputGroup.classList.remove('hidden'); // Ensure rayon dropdown is visible

                filterStatusContainer.classList.remove('hidden');
                filterRayonContainer.classList.remove('hidden');
                populateRayonFilterDropdown(); // Populate for Komisariat

                backToDashboardLink.href = 'admin-dashboard-komisariat.php'; // Komisariat back to komisariat dashboard
            }
        } else { // Public/Guest
            uploadFormSection.classList.add('hidden'); // Hide upload form
            pageMainTitle.textContent = 'Repository Ilmiah';
            pageSubtitle.textContent = 'Lihat semua makalah dan karya ilmiah dari kader PMII.';
            filterStatusContainer.classList.add('hidden'); // Public doesn't filter status
            filterRayonContainer.classList.add('hidden'); // Public doesn't filter by rayon
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


    // --- FUNGSI UTAMA REPOSITORY ILMIAH ---

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
    const allFormInputs = document.querySelectorAll('.form-input-modern');
    allFormInputs.forEach(input => {
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

    // Handle file input change and preview
    fileKaryaInput.addEventListener('change', function() {
        fileNamePreview.textContent = this.files[0] ? this.files[0].name : 'Tidak ada file dipilih.';
        updateLabelClass(this);
    });

    // --- Data Loading & Rendering ---
    /**
     * Memuat data karya ilmiah berdasarkan peran pengguna dan filter.
     */
    async function loadScientificWorksData() {
        if (!tabelKaryaIlmiahBody) return;
        tabelKaryaIlmiahBody.innerHTML = '<tr><td colspan="7" class="text-center p-8 text-text-muted">Memuat data karya ilmiah...</td></tr>';
        
        let filters = { status: filterStatusKaryaSelect.value === 'all' ? undefined : filterStatusKaryaSelect.value };
        if (loggedInUser.role === 'kader' && loggedInUser.user_id) { // Filter by logged in user for kader
            filters.author_user_id = loggedInUser.user_id;
            filters.status = filterStatusKaryaSelect.value === 'all' ? undefined : filterStatusKaryaSelect.value; // Kader can also filter their own status
        } else if (loggedInUser.role === 'rayon' && loggedInUser.rayon_id) { // Filter by rayon admin's rayon
            filters.rayon_id = loggedInUser.rayon_id;
            filters.status = filterStatusKaryaSelect.value === 'all' ? undefined : filterStatusKaryaSelect.value;
        }

        try {
            const response = await getScientificWorks(filters); // Panggil API dengan filter
            if (response && response.data) {
                allScientificWorksData = response.data.map(item => ({
                    id: item.work_id, // Asumsi ID dari API
                    judul: item.title,
                    penulis: item.author_name,
                    tipe: item.type,
                    abstrak: item.abstract,
                    fileUrl: item.file_path, // Asumsi path file
                    fileName: item.file_name,
                    status: item.status, // Status: pending, approved, rejected, revision
                    tanggalUnggah: item.upload_date, // Asumsi tanggal unggah
                    senderRayonId: item.rayon_id, // Rayon pengaju ID
                    senderRayonName: item.rayon_name, // Rayon pengaju nama
                    adminNotes: item.admin_notes || '' // Admin notes for revision/rejection
                }));
                renderScientificWorksTable();
            } else {
                allScientificWorksData = [];
                renderScientificWorksTable();
                window.showCustomMessage('Gagal memuat data karya ilmiah dari server.', 'error');
            }
        } catch (error) {
            console.error("Error loading scientific works:", error);
            allScientificWorksData = [];
            renderScientificWorksTable();
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat karya ilmiah.", "error");
        }
    }

    /**
     * Merender tabel karya ilmiah berdasarkan data dan filter.
     */
    function renderScientificWorksTable() {
        if (!tabelKaryaIlmiahBody) return;
        tabelKaryaIlmiahBody.innerHTML = '';
        
        let filteredData = allScientificWorksData;

        // Apply search filter
        const query = searchKaryaIlmiahInput.value.toLowerCase();
        if (query) {
            filteredData = filteredData.filter(item => 
                (item.judul && item.judul.toLowerCase().includes(query)) ||
                (item.penulis && item.penulis.toLowerCase().includes(query)) ||
                (item.abstrak && item.abstrak.toLowerCase().includes(query))
            );
        }

        // Apply status filter (handled by loadScientificWorksData's API filter, but needed here for local search/rerender)
        const currentStatusFilter = filterStatusKaryaSelect.value;
        if (currentStatusFilter && currentStatusFilter !== 'all') {
            filteredData = filteredData.filter(item => item.status === currentStatusFilter);
        }

        // Apply rayon filter (Komisariat only)
        if (loggedInUser.role === 'komisariat') {
            const selectedRayonFilter = filterRayonSelect.value;
            if (selectedRayonFilter !== 'all') {
                filteredData = filteredData.filter(item => item.rayon_id === selectedRayonFilter);
            }
        }

        if (filteredData.length === 0) {
            tabelKaryaIlmiahBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-text-muted">Tidak ada karya ilmiah yang cocok dengan filter.</td></tr>`;
            return;
        }

        filteredData.forEach(item => {
            let statusClassForBadge;
            let displayStatusText;
            if(item.status === 'approved') { statusClassForBadge = 'approved'; displayStatusText = 'Disetujui'; }
            else if (item.status === 'pending') { statusClassForBadge = 'pending'; displayStatusText = 'Pending'; }
            else if (item.status === 'rejected') { statusClassForBadge = 'rejected'; displayStatusText = 'Ditolak'; }
            else if (item.status === 'revision') { statusClassForBadge = 'revision'; displayStatusText = 'Revisi'; }
            else { statusClassForBadge = ''; displayStatusText = item.status; }

            const rayonName = item.senderRayonName || allRayons.find(r => r.id === item.senderRayonId)?.name || 'N/A';
            const uploadDate = item.tanggalUnggah ? new Date(item.tanggalUnggah).toLocaleDateString('id-ID') : 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.judul}</td>
                <td>${item.penulis}</td>
                <td>${rayonName}</td>
                <td>${uploadDate}</td>
                <td><span class="status-badge ${statusClassForBadge}">${displayStatusText}</span></td>
                <td class="text-center whitespace-nowrap">
                    <a href="${item.fileUrl}" target="_blank" class="action-icon" title="Lihat File"><i class="fas fa-eye"></i></a>
                    ${(loggedInUser.role === 'komisariat' || (loggedInUser.role === 'rayon' && item.senderRayonId === loggedInUser.rayon_id) || (loggedInUser.role === 'kader' && item.author_user_id === loggedInUser.user_id && item.status === 'pending' || item.status === 'rejected')) ? // Only editable if admin or their own pending/rejected
                        `<button class="action-icon edit-btn" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i></button>` : ''
                    }
                    ${loggedInUser.role === 'komisariat' ? `
                        <button class="action-icon approve-btn" data-id="${item.id}" title="Setujui" ${item.status === 'approved' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
                        <button class="action-icon reject-btn" data-id="${item.id}" title="Tolak" ${item.status === 'rejected' ? 'disabled' : ''}><i class="fas fa-times"></i></button>
                        <button class="action-icon revision-btn" data-id="${item.id}" title="Revisi" ${item.status === 'revision' ? 'disabled' : ''}><i class="fas fa-undo"></i></button>
                    ` : ''}
                    ${(loggedInUser.role === 'komisariat' || (loggedInUser.role === 'rayon' && item.senderRayonId === loggedInUser.rayon_id && (item.status === 'pending' || item.status === 'rejected')) || (loggedInUser.role === 'kader' && item.author_user_id === loggedInUser.user_id && (item.status === 'pending' || item.status === 'rejected'))) ? // Allow deletion for komisariat, or rayon/kader if it's their own and pending/rejected
                        `<button class="action-icon delete-btn" data-id="${item.id}" title="Hapus"><i class="fas fa-trash-alt"></i></button>` : ''
                    }
                </td>
            `;
            tabelKaryaIlmiahBody.appendChild(row);
        });

        attachTableButtonListeners();
    }

    function attachTableButtonListeners() {
        tabelKaryaIlmiahBody.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => viewMakalah(e.currentTarget.dataset.id));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editMakalah(e.currentTarget.dataset.id));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Konfirmasi Setujui', 'Apakah Anda yakin ingin MENYETUJUI makalah ini?', () => updateItemStatus(e.currentTarget.dataset.id, 'approved')));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Konfirmasi Tolak', 'Apakah Anda yakin ingin MENOLAK makalah ini?', () => updateItemStatus(e.currentTarget.dataset.id, 'rejected')));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.revision-btn').forEach(button => { // New revision button
            button.addEventListener('click', (e) => showCustomConfirm('Konfirmasi Revisi', 'Apakah Anda yakin ingin meminta REVISI makalah ini?', () => updateItemStatus(e.currentTarget.dataset.id, 'revision')));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin MENGHAPUS makalah ini? Aksi ini tidak dapat dibatalkan.', () => deleteKarya(e.currentTarget.dataset.id)));
        });
    }

    // --- FORM SUBMISSION (ADD/EDIT KARYA) ---
    async function editKarya(karyaId) {
        editingKaryaId = karyaId;
        const karyaToEdit = allScientificWorksData.find(k => k.id === karyaId);
        if (!karyaToEdit) {
            window.showCustomMessage('Karya ilmiah tidak ditemukan.', 'error');
            return;
        }

        judulKaryaInput.value = karyaToEdit.judul;
        penulisKaryaInput.value = karyaToEdit.penulis;
        tipeKaryaSelect.value = karyaToEdit.tipe;
        abstrakKaryaTextarea.value = karyaToEdit.abstrak || '';
        
        // Display current file name but don't re-fill file input
        fileNamePreview.textContent = karyaToEdit.fileName || 'Tidak ada file dipilih.';
        currentFileUrl = karyaToEdit.fileUrl; // Store existing file URL

        // Update floating labels after populating form
        allFormInputs.forEach(input => updateLabelClass(input));
        
        // Handle author and rayon fields based on role
        if (loggedInUser.role === 'kader') {
            penulisKaryaInput.disabled = true;
            penulisKaryaInput.classList.add('has-value');
            makalahRayonSelect.innerHTML = `<option value="${loggedInUser.rayon_id}" selected>${loggedInUser.rayon_name || 'Rayon Anda'}</option>`;
            makalahRayonSelect.disabled = true;
            makalahRayonSelect.classList.add('has-value');
        } else if (loggedInUser.role === 'rayon') {
            penulisKaryaInput.disabled = false; // Rayon admin can edit author name
            makalahRayonSelect.innerHTML = `<option value="${loggedInUser.rayon_id}" selected>${loggedInUser.rayon_name || 'Rayon Anda'}</option>`;
            makalahRayonSelect.disabled = true;
            makalahRayonSelect.classList.add('has-value');
        } else { // Komisariat
            penulisKaryaInput.disabled = false;
            await populateRayonFilterDropdown(true); // Populate rayon for Komisariat to edit existing rayon
            makalahRayonSelect.value = karyaToEdit.rayon_id;
            makalahRayonSelect.disabled = false;
        }

        submitFormButton.innerHTML = '<i class="fas fa-save mr-2"></i> Perbarui Makalah';
        // Scroll to form
        formUploadKarya.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    /**
     * Memperbarui status karya ilmiah.
     * @param {string} id - ID karya ilmiah.
     * @param {string} newStatus - Status baru ('approved', 'rejected', 'revision').
     */
    async function updateItemStatus(id, newStatus) {
        const originalItem = allScientificWorksData.find(item => item.id === id);
        if (!originalItem) {
            window.showCustomMessage('Karya ilmiah tidak ditemukan untuk diperbarui.', 'error');
            return;
        }

        let comment = '';
        if (newStatus === 'rejected' || newStatus === 'revision') {
            comment = prompt("Masukkan komentar untuk penolakan/revisi (opsional):") || '';
        }

        try {
            const response = await updateScientificWork(id, {
                status: newStatus,
                admin_notes: comment // Asumsi API menerima admin_notes
            });

            if (response && response.success) {
                window.showCustomMessage(`Karya ilmiah berhasil ${newStatus}!`, 'success');
                // Optional: Send notification back to sender (kader or rayon admin)
                // Need to implement sendManualNotification if not already done.
                await loadScientificWorksData(); // Reload data after status update
            } else {
                throw new Error(response.message || `Gagal memperbarui status karya ilmiah menjadi ${newStatus}.`);
            }
        } catch (error) {
            console.error("Error updating scientific work status:", error);
            window.showCustomMessage(error.message || `Terjadi kesalahan saat memperbarui status karya ilmiah.`, 'error');
        }
    }

    async function deleteKarya(karyaId) {
        showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus karya ilmiah ini? Tindakan ini tidak dapat dibatalkan.', async () => {
            try {
                const response = await deleteScientificWork(karyaId); // Panggil API delete
                if (response && response.success) {
                    window.showCustomMessage('Karya ilmiah berhasil dihapus!', 'success');
                    await loadScientificWorksData(); // Muat ulang data
                    resetForm(); // Reset form jika yang dihapus adalah yang sedang diedit
                } else {
                    throw new Error(response.message || 'Gagal menghapus karya ilmiah.');
                }
            } catch (error) {
                console.error("Error deleting scientific work:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus karya ilmiah.', 'error');
            }
        });
    }

    // Handle form submission for Add/Edit Karya Ilmiah
    formUploadKarya.addEventListener('submit', async function(e) {
        e.preventDefault();

        const id = editingKaryaId; // Use editingKaryaId directly
        const judul = judulKaryaInput.value.trim();
        const penulis = penulisKaryaInput.value.trim();
        const tipe = tipeKaryaSelect.value;
        const abstrak = abstrakKaryaTextarea.value.trim();
        const file = fileKaryaInput.files[0];

        // Validasi dasar
        if (!judul || !penulis || !tipe || !abstrak) {
            window.showCustomMessage('Judul, Penulis, Tipe Karya, dan Abstrak wajib diisi.', 'error');
            return;
        }
        if (!file && !currentFileUrl && !id) { // File wajib jika ini baru dan tidak ada file lama
            window.showCustomMessage('File karya ilmiah wajib diunggah.', 'error');
            return;
        }


        let fileUrlToSave = currentFileUrl; // Start with existing file URL
        let fileNameToSave = fileNamePreview.textContent.includes('Tidak ada file') ? null : fileNamePreview.textContent;

        if (file) { // If a new file is uploaded
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                window.showCustomMessage('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
                return;
            }
            try {
                // `uploadFile` needs the file input element itself, not just the file object.
                const uploadResponse = await uploadFile(fileKaryaInput, { type: 'document', purpose: 'scientific_work', sender_id: loggedInUser.user_id });
                if (uploadResponse && uploadResponse.file_url) {
                    fileUrlToSave = uploadResponse.file_url;
                    fileNameToSave = uploadResponse.file_name;
                    window.showCustomMessage(`File "${fileNameToSave}" berhasil diunggah.`, 'success');
                } else {
                    throw new Error(uploadResponse.message || "Gagal mengunggah file baru.");
                }
            } catch (error) {
                window.showCustomMessage(`Gagal mengunggah file baru: ${error.message}`, 'error');
                return;
            }
        } else if (!id && !fileUrlToSave) { // If creating new and no file/URL provided
             window.showCustomMessage('File karya ilmiah wajib diunggah.', 'error');
             return;
        }


        // Get sender Rayon ID and Name from loggedInUser
        let senderRayonId = loggedInUser.rayon_id || null;
        let senderRayonName = loggedInUser.rayon_name || null;

        // If logged-in user is a Komisariat admin, use selected rayon from dropdown
        if (loggedInUser.role === 'komisariat') {
            const selectedRayon = allRayons.find(r => r.id === makalahRayonSelect.value);
            if (selectedRayon) {
                senderRayonId = selectedRayon.id;
                senderRayonName = selectedRayon.name;
            } else {
                window.showCustomMessage('Harap pilih Rayon Asal yang valid.', 'error');
                return;
            }
        } else if (!senderRayonId) { // For Kader/Rayon admin, ensure senderRayonId is found
            window.showCustomMessage('Data rayon pengirim tidak ditemukan. Harap login kembali atau hubungi admin.', 'error');
            return;
        }

        const karyaData = {
            title: judul,
            author_name: penulis,
            type: tipe,
            abstract: abstrak,
            file_path: fileUrlToSave,
            file_name: fileNameToSave,
            upload_date: new Date().toISOString().slice(0, 10), // Set current date for upload
            author_user_id: loggedInUser.user_id, // Store the ID of the submitting user
            submitted_by_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
            rayon_id: senderRayonId,
            rayon_name: senderRayonName,
            status: 'pending' // Default status pending, needs admin approval
        };

        try {
            let response;
            if (id) {
                response = await updateScientificWork(id, karyaData); // Update existing work
            } else {
                response = await uploadScientificWork(karyaData); // Upload new work
            }

            if (response && response.success) {
                window.showCustomMessage(`Karya ilmiah berhasil ${id ? 'diperbarui' : 'diunggah'}!`, 'success');
                resetForm(); // Reset form
                await loadScientificWorksData(); // Reload data after change
            } else {
                throw new Error(response.message || `Gagal ${id ? 'memperbarui' : 'mengunggah'} karya ilmiah.`);
            }
        } catch (error) {
            console.error("Error saving scientific work:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat menyimpan karya ilmiah.", "error");
        }
    });

    // Reset Form button handler
    resetFormButton.addEventListener('click', resetForm);

    function resetForm() {
        formUploadKarya.reset();
        editingKaryaId = null; // Clear editing state
        submitFormButton.innerHTML = '<i class="fas fa-upload mr-2"></i> Unggah Makalah'; // Reset button text
        fileNamePreview.textContent = 'Tidak ada file dipilih.'; // Reset file preview
        fileKaryaInput.value = ''; // Clear file input
        currentFileUrl = null; // Reset stored file URL

        // Reset author and rayon fields based on role after reset
        if (loggedInUser.role === 'kader') {
            penulisKaryaInput.value = loggedInUser.full_name || loggedInUser.nama || '';
            penulisKaryaInput.disabled = true;
            penulisKaryaInput.classList.add('has-value');

            const kaderRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
            if (kaderRayon) {
                makalahRayonSelect.innerHTML = `<option value="${kaderRayon.id}" selected>${kaderRayon.name}</option>`;
                makalahRayonSelect.disabled = true;
                makalahRayonSelect.classList.add('has-value');
            }
        } else if (loggedInUser.role === 'rayon') {
            penulisKaryaInput.value = ''; // Clear for manual input
            penulisKaryaInput.disabled = false;
            makalahRayonSelect.innerHTML = `<option value="${loggedInUser.rayon_id}" selected>${loggedInUser.rayon_name || 'Rayon Anda'}</option>`;
            makalahRayonSelect.disabled = true;
            makalahRayonSelect.classList.add('has-value');
        } else { // Komisariat
            penulisKaryaInput.value = '';
            penulisKaryaInput.disabled = false;
            populateRayonFilterDropdown(true); // Re-populate for Komisariat to allow selection
            makalahRayonSelect.value = ''; // Clear selection
            makalahRayonSelect.disabled = false;
        }

        allFormInputs.forEach(input => updateLabelClass(input)); // Update floating labels
    }


    // Populate Rayon dropdown for the form (not filter)
    async function populateMakalahRayonDropdown() {
        if (!makalahRayonSelect) return;

        // Komisariat can select any rayon
        if (loggedInUser.role === 'komisariat') {
            populateRayonFilterDropdown(true); // Re-use existing populate function
            makalahRayonSelect.disabled = false;
        } else if (loggedInUser.role === 'rayon' && loggedInUser.rayon_id) {
            // Rayon admin only sees their own rayon, and it's disabled
            const rayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
            if (rayon) {
                makalahRayonSelect.innerHTML = `<option value="${rayon.id}" selected>${rayon.name}</option>`;
                makalahRayonSelect.disabled = true;
                makalahRayonSelect.classList.add('has-value');
            } else {
                makalahRayonSelect.innerHTML = '<option value="" disabled selected>Rayon tidak ditemukan</option>';
                makalahRayonSelect.disabled = true;
            }
        } else if (loggedInUser.role === 'kader' && loggedInUser.rayon_id) {
            // Kader's rayon is pre-filled and disabled
            const rayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
            if (rayon) {
                makalahRayonSelect.innerHTML = `<option value="${rayon.id}" selected>${rayon.name}</option>`;
                makalahRayonSelect.disabled = true;
                makalahRayonSelect.classList.add('has-value');
            } else {
                makalahRayonSelect.innerHTML = '<option value="" disabled selected>Rayon tidak ditemukan</option>';
                makalahRayonSelect.disabled = true;
            }
        } else { // Fallback for public or if rayon_id is missing
            makalahRayonSelect.innerHTML = '<option value="" disabled selected>Pilih Rayon...</option>';
            makalahRayonSelect.disabled = true;
        }
    }


    // Populate Rayon Filter (for Komisariat Admin)
    async function populateRayonFilterDropdown(forForm = false) { // Add a flag to distinguish from form dropdown
        const targetSelect = forForm ? makalahRayonSelect : filterRayonSelect;
        if (!targetSelect) return;
        
        targetSelect.innerHTML = forForm ? '<option value="" disabled selected></option>' : '<option value="all">Semua Rayon</option>'; // Default option differs for form/filter

        try {
            // Ensure allRayons is populated from API
            if (allRayons.length === 0) {
                const response = await getAllRayons();
                if (response && response.data) {
                    allRayons = response.data;
                } else {
                    console.warn("Gagal memuat data rayon untuk filter dropdown.");
                    window.showCustomMessage('Gagal memuat daftar rayon untuk filter.', 'error');
                }
            }
            
            allRayons.forEach(rayon => {
                const option = document.createElement('option');
                option.value = rayon.id;
                option.textContent = rayon.name;
                targetSelect.appendChild(option);
            });
            // Ensure floating label updates
            updateLabelClass(targetSelect);
        } catch (error) {
            console.error("Error fetching rayons for filter:", error);
            window.showCustomMessage('Terjadi kesalahan saat memuat daftar rayon.', 'error');
        }
    }


    // --- Modal View Details ---
    function viewMakalah(karyaId) {
        const makalah = allScientificWorksData.find(m => m.id === karyaId);
        if (!makalah) {
            window.showCustomMessage('Karya ilmiah tidak ditemukan.', 'error');
            return;
        }

        detailJudul.textContent = makalah.judul;
        detailPenulis.textContent = makalah.penulis;
        detailRayon.textContent = makalah.rayon_name || makalah.rayon || 'N/A';
        detailTanggal.textContent = makalah.tanggalUnggah ? new Date(makalah.tanggalUnggah).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        
        detailStatus.textContent = makalah.status;
        detailStatus.className = `status-badge status-${makalah.status}`; // Apply status styling
        
        if (makalah.adminNotes) {
            detailKomentarAdminContainer.classList.remove('hidden');
            detailKomentarAdmin.textContent = makalah.adminNotes;
        } else {
            detailKomentarAdminContainer.classList.add('hidden');
            detailKomentarAdmin.textContent = '';
        }
        
        detailAbstrak.textContent = makalah.abstrak;

        // Handle download link based on user role
        if (loggedInUser.role === 'public') { // Public users cannot download unless specified by logic
            detailDownloadLink.removeAttribute('href'); // Remove direct link
            detailDownloadLink.onclick = (e) => { // Add click handler to trigger login/message
                e.preventDefault();
                closeModal('detailMakalahModal'); // Close detail modal first
                window.showCustomMessage('Silakan login untuk mengunduh makalah.', 'info', () => {
                    window.location.assign('../login.php'); // Redirect to login.php
                });
            };
        } else {
            // For logged-in users, allow direct download
            detailDownloadLink.href = makalah.fileUrl;
            detailDownloadLink.download = makalah.fileName;
            detailDownloadLink.onclick = null; // Remove previous onclick handler if any
        }
        openModal('detailMakalahModal');
    }


    // --- INITIALIZATION ---
    await initializePageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Muat data rayon untuk form dan filter
    await populateRayonFilterDropdown(); // This populates filterRayonSelect and also fetches allRayons
    await populateMakalahRayonDropdown(); // This populates makalahRayonSelect based on allRayons

    // Muat data karya ilmiah setelah page access dan rayon data
    await loadScientificWorksData();

    // Setel tahun di footer
    const tahunFooterRepo = document.getElementById('tahun-footer-repo');
    if (tahunFooterRepo) {
        tahunFooterRepo.textContent = new Date().getFullYear();
    }

    // Scroll to Top Button functionality
    const scrollToTopBtnRepo = document.getElementById('scrollToTopBtnRepo');
    if (scrollToTopBtnRepo) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnRepo.classList.remove('hidden');
                scrollToTopBtnRepo.classList.add('flex');
            } else {
                scrollToTopBtnRepo.classList.add('hidden');
                scrollToTopBtnRepo.classList.remove('flex');
            }
        });
        scrollToTopBtnRepo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});