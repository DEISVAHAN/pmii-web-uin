// public/js/verifikasi-surat.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getSuratSubmissions, updateSuratSubmission, getUsers, getAllRayons, sendManualNotification } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allUsers = []; // Akan menampung semua data pengguna dari API
    let allRayons = []; // Akan menampung semua data rayon dari API
    let allSuratData = []; // Akan menampung semua data surat dari API

    // Navbar & Auth Elements (dari index.php)
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

    // Elemen DOM spesifik untuk halaman verifikasi surat
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');
    const pageTitleH1 = document.querySelector('.page-title');
    const pageSubtitleP = document.getElementById('user-role-placeholder'); // Assuming this exists for subtitle
    const tabelSuratBody = document.getElementById('tabelSuratBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    // Modal Verifikasi Surat
    const verificationModal = document.getElementById('verificationModal');
    const modalSuratId = document.getElementById('modalSuratId');
    const idInput = document.getElementById('id_surat_verifikasi');
    const statusInput = document.getElementById('status_surat_verifikasi');
    const komentarInput = document.getElementById('komentar_admin_verifikasi');
    const formVerifikasi = document.getElementById('formVerifikasiSurat');

    // Modal Notifikasi (digunakan untuk pesan hasil verifikasi)
    const notificationModal = document.getElementById('notificationModal');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');


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
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses
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
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat.", 'error', () => {
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

        // Update back link for Komisariat
        if (backToDashboardLink) {
            backToDashboardLink.href = 'admin-dashboard-komisariat.php';
            backToDashboardLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard Admin Kom.`;
        }
        
        // Update page subtitle
        if (pageSubtitleP) {
            pageSubtitleP.innerHTML = `Selamat datang, <strong class="text-pmii-yellow font-semibold">${loggedInUser?.full_name || loggedInUser?.nama || 'Admin Komisariat'}</strong>! Verifikasi dan kelola semua pengajuan surat masuk.`;
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


    // --- FUNGSI UTAMA VERIFIKASI SURAT ---
    async function loadSuratSubmissions() {
        tabelSuratBody.innerHTML = '<tr><td colspan="7" class="text-center p-8 text-gray-500">Memuat data surat...</td></tr>';
        try {
            const response = await getSuratSubmissions(); // Mengambil semua pengajuan surat
            if (response && response.data) {
                allSuratData = response.data;
            } else {
                allSuratData = [];
                window.showCustomMessage("Gagal memuat daftar surat dari server.", "error");
            }
        } catch (error) {
            console.error("Error fetching surat submissions:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat surat.", "error");
            allSuratData = [];
        } finally {
            renderTabel(); // Render tabel dengan data yang dimuat
        }
    }

    function renderTabel() {
        tabelSuratBody.innerHTML = '';
        
        let filteredData = allSuratData;

        // Filter berdasarkan status
        const currentStatusFilter = statusFilter.value;
        if (currentStatusFilter && currentStatusFilter !== 'all') {
            filteredData = filteredData.filter(surat => surat.status.toLowerCase() === currentStatusFilter.toLowerCase());
        }

        // Terapkan filter pencarian
        const query = searchInput.value.toLowerCase();
        if (query) {
            filteredData = filteredData.filter(surat => 
                (surat.submission_id && surat.submission_id.toLowerCase().includes(query)) ||
                (surat.document_type && surat.document_type.toLowerCase().includes(query)) ||
                (surat.sender_name && surat.sender_name.toLowerCase().includes(query)) ||
                (surat.recipient_name && surat.recipient_name.toLowerCase().includes(query))
            );
        }

        // Urutkan (misal: paling baru dulu)
        filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


        if (filteredData.length === 0) {
            tabelSuratBody.innerHTML = `<tr><td colspan="7" class="text-center p-8 text-gray-400">Tidak ada data surat yang cocok.</td></tr>`;
            return;
        }

        filteredData.forEach(surat => {
            let statusClassForBadge;
            let displayStatusText;
            // Asumsi status API adalah 'pending', 'approved', 'rejected', 'revision'
            if(surat.status === 'approved') { statusClassForBadge = 'status-approved'; displayStatusText = 'Disetujui'; }
            else if (surat.status === 'pending') { statusClassForBadge = 'status-pending'; displayStatusText = 'Pending'; }
            else if (surat.status === 'rejected') { statusClassForBadge = 'status-rejected'; displayStatusText = 'Ditolak'; }
            else if (surat.status === 'revision') { statusClassForBadge = 'status-revision'; displayStatusText = 'Revisi'; }
            else { statusClassForBadge = ''; displayStatusText = surat.status; }


            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-medium text-white">${surat.submission_id || 'N/A'}</td>
                <td>${surat.document_type || 'N/A'}</td>
                <td>${surat.sender_name || 'N/A'}</td>
                <td>${surat.recipient_name || 'N/A'}</td>
                <td>${new Date(surat.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                <td><span class="status-badge ${statusClassForBadge}">${displayStatusText}</span></td>
                <td class="text-center">
                    <button class="text-pmii-yellow hover:text-pmii-darkblue font-semibold text-sm verify-btn" data-id="${surat.id}">
                        Kelola
                    </button>
                </td>
            `;
            tabelSuratBody.appendChild(row);
        });
        addEventListenersToButtons();
    }
    
    // Add event listeners for table buttons
    function addEventListenersToButtons() {
        tabelSuratBody.querySelectorAll('.verify-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const suratId = e.currentTarget.dataset.id;
                openVerificationModal(suratId);
            });
        });
    }

    // Event listener for search input
    if (searchInput) {
        searchInput.addEventListener('input', () => renderTabel());
    }

    // Event listener for status filter dropdown
    if (statusFilter) {
        statusFilter.addEventListener('change', () => renderTabel());
    }


    // --- FUNGSI MODAL VERIFIKASI ---
    function openVerificationModal(suratId) {
        const surat = allSuratData.find(s => s.id === suratId); // Find surat by 'id' field, not submission_id
        if (surat) {
            modalSuratId.textContent = surat.submission_id || 'N/A'; // Display submission_id
            idInput.value = surat.id; // Use actual 'id' for hidden input
            statusInput.value = surat.status.toLowerCase();
            komentarInput.value = surat.notes || ''; // Use notes field for comments
            verificationModal.classList.add('active');
        } else {
            window.showCustomMessage('Detail surat tidak ditemukan.', 'error');
        }
    }

    function closeVerificationModal() {
        verificationModal.classList.remove('active');
        formVerifikasi.reset();
        // Reset floating labels after reset
        allInputs.forEach(input => updateLabelClass(input));
    }

    if (formVerifikasi) {
        formVerifikasi.addEventListener('submit', async function(e) { // Tambahkan async
            e.preventDefault();
            const id = idInput.value; // This is the actual record ID
            const newStatus = statusInput.value;
            const newKomentar = komentarInput.value.trim();

            try {
                // Panggil API untuk memperbarui status surat
                // Asumsi `updateSuratSubmission` menerima ID dokumen dan data update
                const response = await updateSuratSubmission(id, {
                    status: newStatus,
                    notes: newKomentar, // Simpan komentar di field notes
                    reviewer_user_id: loggedInUser.user_id, // Siapa yang verifikasi
                    reviewer_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
                    review_date: new Date().toISOString().slice(0, 10)
                });

                if (response && response.success) {
                    showNotification('Berhasil!', `Status surat telah diperbarui menjadi ${newStatus.toUpperCase()}.`, 'success');
                    closeVerificationModal();
                    await loadSuratSubmissions(); // Muat ulang data setelah perubahan
                    
                    // Send notification to sender
                    const updatedSurat = allSuratData.find(s => s.id === id); // Find the updated surat
                    if (updatedSurat) {
                        let notifTitle = `Surat Anda ${newStatus.toUpperCase()}`;
                        let notifMessage = `Pengajuan surat "${updatedSurat.document_type}" Anda (${updatedSurat.submission_id || updatedSurat.id}) telah diverifikasi dengan status: ${newStatus.toUpperCase()}.`;
                        if (newKomentar) notifMessage += ` Komentar Admin: "${newKomentar}".`;

                        await sendManualNotification({
                            title: notifTitle,
                            message: notifMessage,
                            type: (newStatus === 'approved' || newStatus === 'pending') ? 'success' : 'error',
                            target_role: updatedSurat.sender_role,
                            target_id: updatedSurat.sender_user_id,
                            sender_id: loggedInUser.user_id,
                            sender_role: loggedInUser.role
                        });
                    }
                } else {
                    throw new Error(response.message || 'Gagal memperbarui status surat.');
                }
            } catch (error) {
                console.error("Error updating surat status:", error);
                showNotification('Error!', error.message || 'Terjadi kesalahan saat memperbarui status surat.', 'error');
            }
        });
    }


    // --- FUNGSI MODAL NOTIFIKASI (ALERT KUSTOM) ---
    function showNotification(title, message, type = 'success', callback = null) {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationIcon.innerHTML = ''; // Bersihkan ikon sebelumnya
        notificationIcon.classList.remove('bg-green-100', 'bg-red-100'); // Reset background

        if (type === 'error') {
            notificationIcon.classList.add('bg-red-100');
            notificationIcon.innerHTML = '<i class="fas fa-times text-red-600 text-xl"></i>';
        } else { // success atau info
            notificationIcon.classList.add('bg-green-100');
            notificationIcon.innerHTML = '<i class="fas fa-check text-green-600 text-xl"></i>';
        }

        notificationModal.classList.add('active'); // Tampilkan modal

        // Atur callback untuk tombol tutup
        closeNotificationBtn.onclick = () => {
            notificationModal.classList.remove('active');
            if (callback) callback();
        };
    }

    // --- FUNGSI UTILITAS LAINNYA ---
    // Floating label logic (adapted for consistency)
    const allFormInputs = document.querySelectorAll('.form-input-modern');
    allFormInputs.forEach(input => {
        const label = input.nextElementSibling;
        const updateLabel = () => {
            if (label && label.classList.contains('form-label-modern')) {
                if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
        };
        updateLabel();
        input.addEventListener('input', updateLabel);
        input.addEventListener('change', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('focus', () => {
            if (label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            updateLabel();
            if (label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
        });
    });


    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const tahunFooterSurat = document.getElementById('tahun-footer-surat'); // ID for footer year

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

    if (tahunFooterSurat) {
        tahunFooterSurat.textContent = new Date().getFullYear();
    }
    
    // --- INISIALISASI HALAMAN ---
    // Pastikan semua data awal (user, rayons) dimuat sebelum merender tabel dan UI lainnya.
    await initializePageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Setelah autentikasi berhasil dan UI dasar diperbarui, muat data surat.
    await loadUsersAndRayons(); // Load users and rayons for lookup in renderTabel
    await loadSuratSubmissions(); // Muat data surat dan render tabel

    // Pastikan event listeners untuk modal notifikasi dan verifikasi ada setelah elemen-elemennya dimuat.
    document.getElementById('closeNotificationBtn')?.addEventListener('click', () => closeNotificationBtn.onclick()); // Ensure global close works

});

// Helper to load users and rayons (copied from pengajuan-surat.js)
async function loadUsersAndRayons() {
    try {
        const usersResponse = await getUsers();
        if (usersResponse && usersResponse.data) {
            allUsers = usersResponse.data;
        } else {
            console.warn("Gagal memuat data pengguna untuk tabel.");
        }

        const rayonsResponse = await getAllRayons();
        if (rayonsResponse && rayonsResponse.data) {
            allRayons = rayonsResponse.data;
        } else {
            console.warn("Gagal memuat data rayon untuk tabel.");
        }
    } catch (error) {
        console.error("Error loading users and rayons:", error);
        window.showCustomMessage("Gagal memuat data pendukung. Tabel mungkin tidak lengkap.", "error");
    }
}