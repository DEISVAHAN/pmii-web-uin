// public/js/verifikasi-konten-rayon.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getPendingNews, approveNews, rejectNews, getPendingActivities, approveActivity, rejectActivity, getPendingGalleryItems, approveGalleryItem, rejectGalleryItem, getUsers, getAllRayons } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    let loggedInUser = null;
    let allNews = []; // Akan menampung semua data berita/artikel
    let allActivities = []; // Akan menampung semua data kegiatan
    let allGalleries = []; // Akan menampung semua data galeri
    let allRayons = []; // Untuk mendapatkan nama Rayon

    // DOM Elements
    const adminNameHeader = document.getElementById('admin-name-header');
    const authInfoHeader = document.getElementById('auth-info-header');
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');

    const pendingItemsList = document.getElementById('pending-items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const filterStatusMessage = document.getElementById('filter-status-message');

    // Modal elements
    const detailModal = document.getElementById('detail-modal');
    const detailModalTitle = document.getElementById('detail-modal-title');
    const detailType = document.getElementById('detail-type');
    const detailTitle = document.getElementById('detail-title');
    const detailSubmittedBy = document.getElementById('detail-submitted-by');
    const detailDate = document.getElementById('detail-date');
    const detailStatus = document.getElementById('detail-status');
    const detailCategoryWrapper = document.getElementById('detail-category-wrapper');
    const detailCategory = document.getElementById('detail-category');
    const detailLocationWrapper = document.getElementById('detail-location-wrapper');
    const detailLocation = document.getElementById('detail-location');
    const detailTimeWrapper = document.getElementById('detail-time-wrapper');
    const detailTime = document.getElementById('detail-time');
    const detailDescription = document.getElementById('detail-description');
    const detailImageWrapper = document.getElementById('detail-image-wrapper');
    const detailImage = document.getElementById('detail-image');
    const detailGalleryWrapper = document.getElementById('detail-gallery-wrapper');
    const detailGalleryImages = document.getElementById('detail-gallery-images');
    const approveButton = document.getElementById('approve-button');
    const rejectButton = document.getElementById('reject-button');

    let currentFilter = 'all'; // Default filter
    let currentItemBeingReviewed = null; // Stores the item object being viewed in the modal

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
    async function updateVerifikasiKontenUI() {
        const authData = getAuthData();
        loggedInUser = authData.userData || phpLoggedInUser; // Prioritize actual login data

        let userRole = loggedInUser ? loggedInUser.role : 'public';

        // Check if user has access to this page (only Komisariat Admin)
        const allowedRolesForThisPage = ['komisariat'];
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


    // --- FUNGSI UTAMA VERIFIKASI KONTEN RAYON ---

    /**
     * Memuat semua data konten yang diajukan (berita, kegiatan, galeri) dari API.
     */
    async function loadAllPendingContent() {
        pendingItemsList.innerHTML = '<p class="text-text-muted text-center py-8">Memuat ajuan...</p>';
        noItemsMessage.classList.add('hidden'); // Sembunyikan pesan tidak ada item

        allNews = [];
        allActivities = [];
        allGalleries = [];

        try {
            // Fetch News/Articles
            const newsResponse = await getPendingNews(); // Asumsi getPendingNews mengembalikan berita pending/approved/rejected
            if (newsResponse && newsResponse.data) {
                // Filter news based on status: pending, approved, rejected
                allNews = newsResponse.data.filter(item => ['pending', 'approved', 'rejected'].includes(item.status));
            }

            // Fetch Activities
            const activitiesResponse = await getPendingActivities(); // Asumsi getPendingActivities mengembalikan kegiatan pending/approved/rejected
            if (activitiesResponse && activitiesResponse.data) {
                allActivities = activitiesResponse.data.filter(item => ['pending', 'approved', 'rejected'].includes(item.status));
            }

            // Fetch Galleries
            const galleriesResponse = await getPendingGalleryItems(); // Asumsi getPendingGalleryItems mengembalikan galeri pending/approved/rejected
            if (galleriesResponse && galleriesResponse.data) {
                allGalleries = galleriesResponse.data.filter(item => ['pending', 'approved', 'rejected'].includes(item.status));
            }

            // Fetch Rayons data for displaying rayon names
            const rayonsResponse = await getAllRayons();
            if (rayonsResponse && rayonsResponse.data) {
                allRayons = rayonsResponse.data;
            }

        } catch (error) {
            console.error("Error loading pending content:", error);
            window.showCustomMessage(error.message || "Gagal memuat ajuan konten dari server.", "error");
        } finally {
            renderPendingItems(); // Render item dengan data yang dimuat
        }
    }

    /**
     * Merender daftar item tertunda berdasarkan filter saat ini.
     */
    function renderPendingItems() {
        let itemsToRender = [];
        
        // Gabungkan semua data dengan field 'type' dan 'displayType' yang sesuai
        const allItems = [
            ...allNews.map(item => ({ ...item, type: 'news', displayType: 'Berita & Artikel', id: item.news_id })),
            ...allActivities.map(item => ({ ...item, type: 'activities', displayType: 'Kegiatan', id: item.activity_id })),
            ...allGalleries.map(item => ({ ...item, type: 'galleries', displayType: 'Galeri', id: item.gallery_id }))
        ];

        if (currentFilter === 'all') {
            itemsToRender = allItems;
        } else if (['news', 'activities', 'galleries'].includes(currentFilter)) {
            itemsToRender = allItems.filter(item => item.type === currentFilter);
        } else if (['pending', 'approved', 'rejected', 'revision'].includes(currentFilter)) { // Tambahkan 'revision'
            itemsToRender = allItems.filter(item => item.status === currentFilter);
        }

        // Urutkan berdasarkan tanggal submit (terbaru dulu)
        itemsToRender.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


        pendingItemsList.innerHTML = '';
        if (itemsToRender.length === 0) {
            noItemsMessage.classList.remove('hidden');
            pendingItemsList.classList.add('hidden');
        } else {
            noItemsMessage.classList.add('hidden');
            pendingItemsList.classList.remove('hidden');
            itemsToRender.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = `review-item ${item.status}`;
                
                // Get sender Rayon Name from allRayons array
                const senderRayonName = allRayons.find(rayon => rayon.id === item.sender_rayon_id)?.name || 'Tidak Diketahui';
                
                // Dapatkan thumbnail untuk item
                let thumbnailUrl = '';
                if (item.type === 'news') {
                    thumbnailUrl = item.image_url;
                } else if (item.type === 'activities') {
                    thumbnailUrl = item.image_url;
                } else if (item.type === 'galleries' && item.image_urls && item.image_urls.length > 0) {
                    thumbnailUrl = item.image_urls[0]; // Gunakan gambar pertama sebagai thumbnail
                }

                itemElement.innerHTML = `
                    ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${item.title || item.caption || 'Konten'}" class="review-item-image" onerror="this.onerror=null;this.src='https://placehold.co/80x60/cccccc/333333?text=N/A';">` : ''}
                    <div class="review-item-content">
                        <strong>${item.title || item.caption}</strong>
                        <span>Tipe: ${item.displayType} • Diajukan oleh: ${senderRayonName} • Tgl: ${formatDate(item.created_at)}</span>
                    </div>
                    <div class="review-item-actions">
                        <button type="button" class="btn-modern btn-outline-modern" data-id="${item.id}" data-type="${item.type}" data-action="view">Detail</button>
                        ${item.status === 'pending' ? `
                            <button type="button" class="btn-modern btn-success-modern" data-id="${item.id}" data-type="${item.type}" data-action="approve">Setujui</button>
                            <button type="button" class="btn-modern btn-danger-modern" data-id="${item.id}" data-type="${item.type}" data-action="reject">Tolak</button>
                        ` : ''}
                    </div>
                `;
                pendingItemsList.appendChild(itemElement);
            });

            // Tambahkan event listener untuk tombol aksi
            pendingItemsList.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', handleItemAction);
            });
        }
    }

    /**
     * Menangani tindakan klik pada item ulasan (lihat, setujui, tolak).
     * @param {Event} event - Objek event klik.
     */
    function handleItemAction(event) {
        const id = event.target.dataset.id;
        const type = event.target.dataset.type;
        const action = event.target.dataset.action;

        let item;
        if (type === 'news') item = allNews.find(n => n.news_id == id);
        else if (type === 'activities') item = allActivities.find(a => a.activity_id == id);
        else if (type === 'galleries') item = allGalleries.find(g => g.gallery_id == id);

        if (!item) {
            window.showCustomMessage('Item tidak ditemukan.', 'error');
            return;
        }

        currentItemBeingReviewed = { ...item, originalType: type }; // Simpan item dan tipe aslinya

        if (action === 'view') {
            showDetailModal(item);
        } else if (action === 'approve') {
            window.showCustomConfirm('Setujui Konten', 'Apakah Anda yakin ingin MENYETUJUI konten ini?', () => {
                updateItemStatus(type, id, 'approved');
            });
        } else if (action === 'reject') {
            window.showCustomConfirm('Tolak Konten', 'Apakah Anda yakin ingin MENOLAK konten ini? Mohon berikan komentar jika ada.', () => {
                updateItemStatus(type, id, 'rejected');
            });
        }
    }

    /**
     * Memperbarui status item dan me-render ulang daftar.
     * @param {string} type - 'news', 'activities', atau 'galleries'.
     * @param {string} id - ID item.
     * @param {string} newStatus - 'approved', 'rejected', atau 'revision'.
     */
    async function updateItemStatus(type, id, newStatus) {
        let updateApiCall;
        let originalItem;
        if (type === 'news') { originalItem = allNews.find(n => n.news_id === id); updateApiCall = approveNews; if (newStatus === 'rejected') updateApiCall = rejectNews; }
        else if (type === 'activities') { originalItem = allActivities.find(a => a.activity_id === id); updateApiCall = approveActivity; if (newStatus === 'rejected') updateApiCall = rejectActivity; }
        else if (type === 'galleries') { originalItem = allGalleries.find(g => g.gallery_id === id); updateApiCall = approveGalleryItem; if (newStatus === 'rejected') updateApiCall = rejectGalleryItem; }
        else return;

        if (!originalItem) {
            window.showCustomMessage('Item asli tidak ditemukan untuk diperbarui.', 'error');
            return;
        }

        let comment = '';
        if (newStatus === 'rejected' || newStatus === 'revision') {
            comment = prompt("Masukkan komentar untuk penolakan/revisi (opsional):") || '';
        }

        try {
            const response = await updateApiCall(id, {
                status: newStatus,
                admin_notes: comment // Asumsi API menerima admin_notes
            });

            if (response && response.success) {
                window.showCustomMessage(`Konten berhasil ${newStatus}!`, 'success');
                closeModal('detail-modal'); // Tutup modal jika terbuka
                await loadAllPendingContent(); // Muat ulang data setelah perubahan

                // Kirim notifikasi ke pengirim konten
                const senderRayonName = allRayons.find(r => r.id === originalItem.sender_rayon_id)?.name || 'Rayon Anda';
                let notifTitle = `Status Konten Anda: ${newStatus.toUpperCase()}`;
                let notifMessage = `Pengajuan "${originalItem.title || originalItem.caption}" dari ${senderRayonName} telah diverifikasi dengan status: ${newStatus.toUpperCase()}.`;
                if (comment) notifMessage += ` Komentar Admin: "${comment}".`;

                await sendManualNotification({
                    title: notifTitle,
                    message: notifMessage,
                    type: (newStatus === 'approved') ? 'success' : 'error',
                    target_role: 'rayon', // Target always rayon admin who submitted
                    target_id: originalItem.sender_rayon_id, // Target specific rayon
                    sender_id: loggedInUser.user_id, // Admin komisariat
                    sender_role: loggedInUser.role // Role Komisariat
                });

            } else {
                throw new Error(response.message || `Gagal memperbarui status konten menjadi ${newStatus}.`);
            }
        } catch (error) {
            console.error("Error updating item status:", error);
            window.showCustomMessage(error.message || `Terjadi kesalahan saat memperbarui status konten.`, 'error');
        }
    }


    /**
     * Menampilkan modal detail untuk item konten (berita, kegiatan, atau galeri).
     * @param {Object} item - Objek item yang akan ditampilkan.
     */
    function showDetailModal(item) {
        detailModalTitle.textContent = `Detail Ajuan ${item.displayType}`;
        detailType.textContent = item.displayType;
        detailTitle.textContent = item.title || item.caption;
        detailSubmittedBy.textContent = item.submitted_by_name || 'Tidak Diketahui'; // Asumsi submitted_by_name
        detailDate.textContent = formatDate(item.created_at); // Asumsi created_at
        detailStatus.textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        detailStatus.className = `font-medium status-badge status-${item.status}`;
        
        detailDescription.textContent = item.description || 'Tidak ada deskripsi.';

        // Sembunyikan/tampilkan bidang spesifik berdasarkan jenis item
        detailCategoryWrapper.classList.toggle('hidden', item.type !== 'news');
        if (item.type === 'news') detailCategory.textContent = item.category;

        detailLocationWrapper.classList.toggle('hidden', item.type !== 'activities');
        detailTimeWrapper.classList.toggle('hidden', item.type !== 'activities');
        if (item.type === 'activities') {
            detailLocation.textContent = item.location;
            detailTime.textContent = `${item.activity_time} (${new Date(item.activity_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})`;
        }

        detailImageWrapper.classList.toggle('hidden', item.type !== 'news' && item.type !== 'activities');
        if (item.type === 'news' || item.type === 'activities') {
            detailImage.src = item.image_url || 'https://placehold.co/300x200/cccccc/333333?text=No+Image';
            detailImage.onerror = function() { this.src = 'https://placehold.co/300x200/cccccc/333333?text=Broken+Image'; };
        }
        
        detailGalleryWrapper.classList.toggle('hidden', item.type !== 'galleries');
        detailGalleryImages.innerHTML = ''; // Clear previous images
        if (item.type === 'galleries' && item.image_urls && item.image_urls.length > 0) {
            item.image_urls.forEach(imgSrc => {
                const imgElement = document.createElement('img');
                imgElement.src = imgSrc;
                imgElement.alt = item.caption;
                imgElement.onerror = function() { this.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; };
                detailGalleryImages.appendChild(imgElement);
            });
        } else if (item.type === 'galleries') {
            detailGalleryImages.innerHTML = '<p class="text-text-muted">Tidak ada gambar di galeri ini.</p>';
        }

        // Show/hide action buttons based on current status
        if (item.status === 'pending') {
            approveButton.classList.remove('hidden');
            rejectButton.classList.remove('hidden');
            // Re-attach listeners to ensure they point to the correct `currentItemBeingReviewed` context
            approveButton.onclick = () => updateItemStatus(currentItemBeingReviewed.originalType, currentItemBeingReviewed.id, 'approved');
            rejectButton.onclick = () => updateItemStatus(currentItemBeingReviewed.originalType, currentItemBeingReviewed.id, 'rejected');
        } else {
            approveButton.classList.add('hidden');
            rejectButton.classList.add('hidden');
        }

        detailModal.classList.add('active');
        // Prevent body scrolling when modal is open
        document.body.classList.add('overflow-hidden');
    }

    // Helper to close modals (made global for onclick in HTML)
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
        currentItemBeingReviewed = null; // Clear item when modal closes
    };

    // Helper to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Filter button event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderPendingItems();
            updateFilterStatusMessage();
        });
    });

    function updateFilterStatusMessage() {
        let message = "Menampilkan ";
        const filterTypeMap = {
            'all': 'semua ajuan.',
            'news': 'ajuan Berita & Artikel.',
            'activities': 'ajuan Kegiatan.',
            'galleries': 'ajuan Galeri.',
            'pending': 'ajuan dengan status Pending.',
            'approved': 'ajuan dengan status Disetujui.',
            'rejected': 'ajuan dengan status Ditolak.',
            'revision': 'ajuan dengan status Revisi.' // New
        };
        message += filterTypeMap[currentFilter] || 'semua ajuan.';
        filterStatusMessage.textContent = message;
    }

    // --- INITIALIZATION ---
    await initializePageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Setelah autentikasi berhasil dan UI dasar diperbarui, muat semua konten
    await loadAllPendingContent(); // Muat data dan render tabel

    // Initial render on page load (already done by loadAllPendingContent finally block)
    updateFilterStatusMessage();

    // Scroll to Top Button
    const scrollToTopBtnVerif = document.getElementById('scrollToTopBtnVerif');
    if (scrollToTopBtnVerif) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnVerif.classList.remove('hidden');
                scrollToTopBtnVerif.classList.add('flex');
            } else {
                scrollToTopBtnVerif.classList.add('hidden');
                scrollToTopBtnVerif.classList.remove('flex');
            }
        });
        scrollToTopBtnVerif.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Tahun di footer
    const tahunFooterVerif = document.getElementById('tahun-footer-verif');
    if (tahunFooterVerif) {
        tahunFooterVerif.textContent = new Date().getFullYear();
    }
});