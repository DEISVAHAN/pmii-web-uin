// public/js/repository-ilmiah.js

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

    const tabelKaryaIlmiahBody = document.getElementById('tabelKaryaIlmiahBody');
    const searchKaryaIlmiahInput = document.getElementById('searchKaryaIlmiah');
    const filterStatusKaryaSelect = document.getElementById('filterStatusKarya');

    let currentFileUrl = null; // Untuk menyimpan URL file yang sudah ada/baru diunggah


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
        // Update general UI elements (navbar, etc.)
        const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
        const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';

        if (headerTitleText) {
            headerTitleText.textContent = (loggedInUser && loggedInUser.role !== 'public') ? loggedInTitle : defaultTitle;
        }
        if (mobileHeaderTitleText) {
            mobileHeaderTitleText.textContent = (loggedInUser && loggedInUser.role !== 'public') ? loggedInTitle : defaultTitle;
        }
        
        // Handle Auth Link (Login/Logout button)
        if (authLinkMain) {
            authLinkMain.removeEventListener('click', handleAuthClick);
            if (loggedInUser && loggedInUser.role !== 'public') {
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
            if (loggedInUser && loggedInUser.role !== 'public') {
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
        if (loggedInUser) {
            if (loggedInUser.role === 'komisariat' || loggedInUser.role === 'rayon') {
                if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            } else if (loggedInUser.role === 'kader') {
                if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.remove('hidden');
            }
        }

        // Populate mobile menu (function from auth.js)
        populateMobileMenu();


        // Handle page access based on roles
        const allowedRolesForThisPage = ['rayon', 'komisariat']; // Rayon Admin and Komisariat Admin
        const currentPage = window.location.pathname.split('/').pop();
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ];

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
        
        // Update user info in header
        if (userInfoHeader) {
            userInfoHeader.textContent = `Halo, ${loggedInUser?.full_name || loggedInUser?.nama || 'Admin'}`;
            userInfoHeader.classList.remove('hidden');
        }
        
        // Hide/show upload form based on role
        if (loggedInUser && (loggedInUser.role === 'rayon' || loggedInUser.role === 'komisariat')) {
            uploadFormSection.classList.remove('hidden');
            if (loggedInUser.role === 'komisariat') {
                subtitleText.textContent = 'Kelola semua makalah dan karya ilmiah dari kader PMII.';
                backToDashboardLink.href = 'admin-dashboard-komisariat.php';
            } else { // Rayon Admin
                subtitleText.textContent = `Ajukan dan kelola karya ilmiah kader dari ${loggedInUser.rayon_name || 'Rayon Anda'}.`;
                backToDashboardLink.href = 'admin-dashboard-rayon.php';
            }
        } else {
            uploadFormSection.classList.add('hidden');
            subtitleText.textContent = 'Lihat semua makalah dan karya ilmiah dari kader PMII.'; // Non-admin view
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
        tabelKaryaIlmiahBody.innerHTML = '<tr><td colspan="7" class="text-center p-8 text-text-muted">Memuat data karya ilmiah...</td></tr>';
        
        let filters = { status: filterStatusKaryaSelect.value === 'all' ? undefined : filterStatusKaryaSelect.value };
        if (loggedInUser.role === 'rayon' && loggedInUser.user_id) {
            filters.author_user_id = loggedInUser.user_id; // Filter by current user if Rayon admin
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
                    senderRayonName: item.rayon_name // Rayon pengaju nama
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

        // Apply status filter (already done in loadScientificWorksData based on select value, but re-filter here for search)
        // const currentStatusFilter = filterStatusKaryaSelect.value;
        // if (currentStatusFilter && currentStatusFilter !== 'all') {
        //     filteredData = filteredData.filter(item => item.status === currentStatusFilter);
        // }

        if (filteredData.length === 0) {
            tabelKaryaIlmiahBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-text-muted">Tidak ada karya ilmiah yang cocok dengan filter.</td></tr>`;
            return;
        }

        filteredData.forEach(item => {
            let statusClassForBadge;
            let displayStatusText;
            if(item.status === 'approved') { statusClassForBadge = 'status-approved'; displayStatusText = 'Disetujui'; }
            else if (item.status === 'pending') { statusClassForBadge = 'status-pending'; displayStatusText = 'Pending'; }
            else if (item.status === 'rejected') { statusClassForBadge = 'status-rejected'; displayStatusText = 'Ditolak'; }
            else if (item.status === 'revision') { statusClassForBadge = 'status-revision'; displayStatusText = 'Revisi'; }
            else { statusClassForBadge = ''; displayStatusText = item.status; }

            const rayonName = allRayons.find(r => r.id === item.senderRayonId)?.name || item.senderRayonName || 'N/A';
            const uploadDate = item.tanggalUnggah ? new Date(item.tanggalUnggah).toLocaleDateString('id-ID') : 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.judul}</td>
                <td>${item.penulis}</td>
                <td>${item.tipe}</td>
                <td>${uploadDate}</td>
                <td><span class="status-badge ${statusClassForBadge}">${displayStatusText}</span></td>
                <td>${rayonName}</td>
                <td class="text-right action-links">
                    <a href="${item.fileUrl}" target="_blank" class="action-icon" title="Lihat File"><i class="fas fa-eye"></i></a>
                    <button class="action-icon edit-btn" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-icon delete-btn" data-id="${item.id}" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tabelKaryaIlmiahBody.appendChild(row);
        });

        // Add event listeners for buttons
        tabelKaryaIlmiahBody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editKarya(e.currentTarget.dataset.id));
        });
        tabelKaryaIlmiahBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteKarya(e.currentTarget.dataset.id));
        });
    }

    // --- FORM SUBMISSION (ADD/EDIT KARYA) ---
    async function editKarya(karyaId) {
        const karyaToEdit = allScientificWorksData.find(k => k.id === karyaId);
        if (!karyaToEdit) {
            window.showCustomMessage('Karya ilmiah tidak ditemukan.', 'error');
            return;
        }

        karyaIdInput.value = karyaToEdit.id;
        judulKaryaInput.value = karyaToEdit.judul;
        penulisKaryaInput.value = karyaToEdit.penulis;
        tipeKaryaSelect.value = karyaToEdit.tipe;
        abstrakKaryaTextarea.value = karyaToEdit.abstrak || '';
        
        // Display current file name but don't re-fill file input
        fileNamePreview.textContent = karyaToEdit.fileName || 'Tidak ada file dipilih.';
        currentFileUrl = karyaToEdit.fileUrl; // Simpan URL file yang sudah ada

        // Update floating labels
        allFormInputs.forEach(input => updateLabelClass(input));
        
        // Scroll to form
        formUploadKarya.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function deleteKarya(karyaId) {
        window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus karya ilmiah ini? Tindakan ini tidak dapat dibatalkan.', async () => {
            try {
                const response = await deleteScientificWork(karyaId); // Panggil API delete
                if (response && response.success) {
                    window.showCustomMessage('Karya ilmiah berhasil dihapus!', 'success');
                    await loadScientificWorksData(); // Muat ulang data
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

        const id = karyaIdInput.value || null;
        const judul = judulKaryaInput.value.trim();
        const penulis = penulisKaryaInput.value.trim();
        const tipe = tipeKaryaSelect.value;
        const abstrak = abstrakKaryaTextarea.value.trim();
        const file = fileKaryaInput.files[0];

        // Validasi dasar
        if (!judul || !penulis || !tipe || (!file && !currentFileUrl)) { // File wajib jika bukan edit atau tidak ada file lama
            window.showCustomMessage('Judul, Penulis, Tipe Karya, dan File wajib diisi.', 'error');
            return;
        }

        let fileUrlToSave = currentFileUrl; // Mulai dengan URL file yang sudah ada/terakhir
        let fileNameToSave = fileNamePreview.textContent.includes('Tidak ada file') ? null : fileNamePreview.textContent;

        if (file) { // Jika ada file baru diunggah
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                window.showCustomMessage('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
                return;
            }
            try {
                const uploadResponse = await uploadFile(fileKaryaInput, { type: 'document', purpose: 'scientific_work', sender_id: loggedInUser.user_id });
                if (uploadResponse && uploadResponse.file_url) {
                    fileUrlToSave = uploadResponse.file_url;
                    fileNameToSave = uploadResponse.file_name;
                } else {
                    throw new Error(uploadResponse.message || "Gagal mengunggah file baru.");
                }
            } catch (error) {
                window.showCustomMessage(`Gagal mengunggah file baru: ${error.message}`, 'error');
                return;
            }
        } else if (!id && !currentFileUrl) { // Jika mode tambah dan tidak ada file
             window.showCustomMessage('File karya ilmiah wajib diunggah.', 'error');
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

        const karyaData = {
            title: judul,
            author_name: penulis,
            type: tipe,
            abstract: abstrak,
            file_path: fileUrlToSave,
            file_name: fileNameToSave,
            upload_date: new Date().toISOString().slice(0, 10), // Set current date for upload
            sender_user_id: loggedInUser.user_id,
            sender_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
            rayon_id: senderRayonId,
            rayon_name: senderRayonName,
            status: 'pending' // Default status pending, needs admin approval
        };

        try {
            let response;
            if (id) {
                response = await updateScientificWork(id, karyaData); // Panggil API update
            } else {
                response = await uploadScientificWork(karyaData); // Panggil API upload (create)
            }

            if (response && response.success) {
                window.showCustomMessage(`Karya ilmiah berhasil ${id ? 'diperbarui' : 'diunggah'}!`, 'success');
                formUploadKarya.reset(); // Reset form
                karyaIdInput.value = ''; // Clear hidden ID
                fileNamePreview.textContent = 'Tidak ada file dipilih.'; // Reset file preview
                fileKaryaInput.value = ''; // Clear file input
                currentFileUrl = null; // Reset stored file URL
                allFormInputs.forEach(input => updateLabelClass(input)); // Update floating labels
                await loadScientificWorksData(); // Muat ulang data setelah perubahan
            } else {
                throw new Error(response.message || `Gagal ${id ? 'memperbarui' : 'mengunggah'} karya ilmiah.`);
            }
        } catch (error) {
            console.error("Error saving scientific work:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat menyimpan karya ilmiah.", "error");
        }
    });

    // Reset Form button handler
    formUploadKarya.querySelector('button[type="reset"]').addEventListener('click', function() {
        formUploadKarya.reset();
        karyaIdInput.value = ''; // Clear hidden ID
        fileNamePreview.textContent = 'Tidak ada file dipilih.'; // Reset file preview
        fileKaryaInput.value = ''; // Clear file input
        currentFileUrl = null; // Reset stored file URL
        allFormInputs.forEach(input => updateLabelClass(input)); // Update labels
    });


    // --- Event Listeners for Filters ---
    if (searchKaryaIlmiahInput) {
        searchKaryaIlmiahInput.addEventListener('input', renderScientificWorksTable);
    }
    if (filterStatusKaryaSelect) {
        filterStatusKaryaSelect.addEventListener('change', loadScientificWorksData); // Reload data when filter changes
    }


    // --- INITIALIZATION ---
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