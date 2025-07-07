// public/js/akses-ojs.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { 
    getScientificWorks, 
    uploadScientificWork, 
    updateScientificWork, 
    deleteScientificWork, 
    approveScientificWork, 
    rejectScientificWork,
    getScientificWorkById, // Diimpor untuk mengambil detail jurnal tunggal
    submitJournalComment, // Asumsi fungsi ini ada di api.js untuk mengirim komentar
    getJournalComments // Asumsi fungsi ini ada di api.js untuk mengambil komentar
} from './api.js';

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

    // Journal title specific elements
    const ojsJournalTitle = "Jurnal Al Harokah"; 
    const heroTitleElement = document.getElementById('ojs-journal-title');
    if (heroTitleElement) heroTitleElement.textContent = ojsJournalTitle;
    const headerTitleElement = document.querySelector('.ojs-header .logo-text');
    if (headerTitleElement) headerTitleElement.textContent = ojsJournalTitle;
    document.title = `${ojsJournalTitle} - Open Journal System | PK PMII UIN SGD Bandung`;

    // Get references to journal display and filter elements
    const mainJournalListSection = document.getElementById('main-journal-list-section');
    const heroSectionOjs = document.getElementById('hero-section-ojs');
    const panduanPenulisSectionOjs = document.getElementById('panduan-penulis-section');

    const searchJurnalInputOjs = document.getElementById('ojsSearchInputHero');
    const filterTahunJurnalOjs = document.getElementById('filterTahunJurnalOjs');
    const filterKategoriJurnalOjs = document.getElementById('filterKategoriJurnalOjs');
    const jurnalMenungguVerifikasiContainerOjs = document.getElementById('jurnalMenungguVerifikasiContainerOjs');
    const jurnalLoadingOjs = document.getElementById('jurnalLoadingOjs');
    const sortMostReadBtn = document.getElementById('sortMostReadBtn');

    // Statistic Elements
    const statTotalJurnalEl = document.getElementById('statTotalJurnal');
    const statTotalPenulisEl = document.getElementById('statTotalPenulis');
    const statTotalUnduhanEl = document.getElementById('statTotalUnduhan');
    const statJurnalBaruEl = document.getElementById('statJurnalBaru');

    // Modal elements
    const uploadModalOjs = document.getElementById('uploadJurnalModalOjs');
    const detailModalOjs = document.getElementById('detailJurnalModalOjs');
    const formUploadJurnalOjs = document.getElementById('formUploadJurnalOjs');
    const uploadFileErrorOjs = document.getElementById('uploadFileErrorOjs');

    // Journal Detail Modal Elements
    const detailJudulOjs = document.getElementById('detailJudulOjs');
    const detailPenulisOjs = document.getElementById('detailPenulisOjs');
    const detailORCID = document.getElementById('detailORCID');
    const detailTanggalOjs = document.getElementById('detailTanggalOjs');
    const detailKategoriOjs = document.getElementById('detailKategoriOjs');
    const detailDoiOjs = document.getElementById('detailDoiOjs');
    const detailStatusOjs = document.getElementById('detailStatusOjs');
    const detailViewCountOjs = document.getElementById('detailViewCountOjs');
    const detailCitationCountOjs = document.getElementById('detailCitationCountOjs');
    const detailAbstrakOjs = document.getElementById('detailAbstrakOjs');
    const detailFileLinkOjs = document.getElementById('detailFileLinkOjs');
    const btnEksporSitasi = document.getElementById('btnEksporSitasi');
    const komentarSectionOjs = document.getElementById('komentarSectionOjs');
    const daftarKomentarOjs = document.getElementById('daftarKomentarOjs');
    const formKomentarOjs = document.getElementById('formKomentarOjs');
    const inputKomentarOjs = document.getElementById('inputKomentarOjs');

    let allJournals = []; // Data jurnal akan dimuat dari API
    let currentSortOrder = 'newest'; // 'newest' or 'mostRead'
    let currentJournalIdForComments = null; // Menyimpan ID jurnal yang sedang dilihat untuk komentar

    /**
     * Fungsi untuk menampilkan pesan kustom kepada pengguna.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {string} type - 'success', 'error', 'info', 'warning'.
     * @param {Function} [callback] - Fungsi callback opsional yang akan dieksekusi setelah pesan memudar.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';

        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500');
        } else if (type === 'warning') {
            messageBox.classList.add('bg-yellow-500', 'text-gray-900'); // Warning has dark text
        } else {
            messageBox.classList.add('bg-blue-500');
        }

        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');

        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) {
                messageBox.addEventListener('transitionend', function handler() {
                    callback();
                    messageBox.removeEventListener('transitionend', handler);
                });
            }
        }, 3000);
    }

    /* Logika Modal Konfirmasi Kustom */
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null;

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
        customConfirmModal.classList.add('active');
        currentConfirmCallback = onConfirm;

        confirmYesBtn.onclick = () => {
            if (currentConfirmCallback) {
                currentConfirmCallback();
            }
            hideCustomConfirm();
        };
        confirmCancelBtn.onclick = () => {
            if (onCancel) {
                onCancel();
            }
            hideCustomConfirm();
        };
    }

    /**
     * Menyembunyikan modal konfirmasi kustom.
     */
    function hideCustomConfirm() {
        customConfirmModal.classList.remove('active');
        currentConfirmCallback = null;
    }

    // Tutup modal saat mengklik di luar konten
    customConfirmModal.addEventListener('click', function(event) {
        if (event.target === customConfirmModal) {
            hideCustomConfirm();
        }
    });

    /**
     * Menangani klik autentikasi (login/logout).
     * @param {Event} e - Objek event klik.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        const mobileOjsMenu = document.getElementById('mobile-ojs-menu');
        if (mobileOjsMenu && mobileOjsMenu.classList.contains('menu-active')) {
            toggleMobileMenu();
        }

        const action = e.target.dataset.action || (e.target.closest('a') ? e.target.closest('a').dataset.action : null);

        if (action === 'login') {
            window.location.href = 'login.php';
        } else if (action === 'logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout();
                    window.location.reload(); 
                }, 500);
            }, () => {
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        }
    }

    /**
     * Memperbarui UI spesifik halaman berdasarkan status autentikasi dan peran pengguna.
     * Ini termasuk menampilkan/menyembunyikan tautan navigasi dan bagian konten tertentu.
     */
    function updatePageSpecificUI() {
        updateAuthUI(authElements);

        const authData = getAuthData();
        userRole = authData.userData ? authData.userData.user_role : 'public';

        if (authLinkMain) {
            if (userRole !== 'public') {
                authLinkMain.textContent = 'Logout';
                authLinkMain.classList.add('logout-active');
                authLinkMain.dataset.action = "logout";
            } else {
                authLinkMain.textContent = 'Login';
                authLinkMain.classList.remove('logout-active');
                authLinkMain.dataset.action = "login";
            }
            authLinkMain.removeEventListener('click', handleAuthClick);
            authLinkMain.addEventListener('click', handleAuthClick);
        }

        if (authLinkMobile) {
            if (userRole !== 'public') {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i><span>Logout</span>`;
                authLinkMobile.classList.add('logout-active');
                authLinkMobile.dataset.action = "logout";
            } else {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLinkMobile.classList.remove('logout-active');
                authLinkMobile.dataset.action = "login";
            }
            authLinkMobile.removeEventListener('click', handleAuthClick);
            authLinkMobile.addEventListener('click', handleAuthClick);
        }
        populateMobileMenu();

        const btnOpenUploadModalOjsPage = document.getElementById('btnOpenUploadModalOjsPage');
        const mobileUploadLink = document.getElementById('mobile-ojs-upload-link');
        const ojsSubmitLink = document.getElementById('ojs-submit-link');
        const mobileOjsSubmitLink = document.getElementById('mobile-ojs-submit-link');

        if (userRole === 'kader' || userRole === 'rayon' || userRole === 'komisariat') {
            if (btnOpenUploadModalOjsPage) btnOpenUploadModalOjsPage.classList.remove('hidden');
            if (mobileUploadLink) mobileUploadLink.classList.remove('hidden');
            if (ojsSubmitLink) {
                ojsSubmitLink.removeEventListener('click', handleOpenUploadModal);
                ojsSubmitLink.addEventListener('click', handleOpenUploadModal);
            }
            if (mobileOjsSubmitLink) {
                mobileOjsSubmitLink.removeEventListener('click', handleOpenUploadModal);
                mobileOjsSubmitLink.addEventListener('click', handleOpenUploadModal);
            }
        } else {
            if (btnOpenUploadModalOjsPage) btnOpenUploadModalOjsPage.classList.add('hidden');
            if (mobileUploadLink) mobileUploadLink.classList.add('hidden');
            if (ojsSubmitLink) ojsSubmitLink.removeEventListener('click', handleOpenUploadModal);
            if (mobileOjsSubmitLink) mobileOjsSubmitLink.removeEventListener('click', handleOpenUploadModal);
        }

        const panelVerifikasiAdminOjs = document.getElementById('panelVerifikasiAdminOjs');
        if (panelVerifikasiAdminOjs) {
            if (userRole === 'komisariat') {
                panelVerifikasiAdminOjs.classList.remove('hidden');
                renderJurnalUntukVerifikasiOjs();
            } else {
                panelVerifikasiAdminOjs.classList.add('hidden');
            }
        }
    }

    function handleOpenUploadModal(e) {
        e.preventDefault();
        if (userRole === 'public') {
            showCustomMessage("Silakan login sebagai kader atau admin untuk mengunggah jurnal.", 'warning', () => {
                window.location.assign('login.php');
            });
        } else {
            openModal('uploadJurnalModalOjs');
        }
    }

    /**
     * Mengisi menu seluler secara dinamis berdasarkan peran pengguna.
     */
    function populateMobileMenu() {
        const mobileNavLinksContainer = document.getElementById('mobile-nav-links');
        if (!mobileNavLinksContainer) return;

        mobileNavLinksContainer.innerHTML = '';

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

        const authData = getAuthData(); // Get current auth data
        const currentUserRole = authData.userData ? authData.userData.user_role : 'public';

        if (currentUserRole === 'kader') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Profil Kader', [
                { text: 'Edit Profil', href: 'dashboard/edit-profil-kader.html', icon: 'fas fa-user-edit' },
                { text: 'Pengaturan Akun', href: 'dashboard/pengaturan-akun-kader.html', icon: 'fas fa-cog' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.php', icon: 'fas fa-book-reader' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
            ]);
        } else if (currentUserRole === 'rayon' || currentUserRole === 'komisariat') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Sistem Internal', [
                { text: 'Manajemen Kader', href: 'dashboard/manajemen-kader.html', icon: 'fas fa-users-cog' },
                { text: 'Repository Ilmiah', href: 'dashboard/repository-ilmiah.html', icon: 'fas fa-book-open' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.php', icon: 'fas fa-book-reader' },
                { text: 'Verifikasi Konten Rayon', href: 'dashboard/verifikasi-konten-rayon.html', icon: 'fas fa-check-double' },
                { text: 'Tambah Berita & Artikel', href: 'dashboard/rayon-tambah-berita.html', icon: 'fas fa-newspaper' },
                { text: 'Tambah Kegiatan', href: 'dashboard/rayon-tambah-kegiatan.html', icon: 'fas fa-calendar-plus' },
                { text: 'Tambah Galeri Kegiatan', href: 'dashboard/rayon-tambah-galeri.html', icon: 'fas fa-images' },
                { text: 'Edit Profil Rayon', href: 'dashboard/edit-profil-rayon.html', icon: 'fas fa-building' },
            ]);

            if (currentUserRole === 'komisariat') {
                appendMobileSubmenu(mobileNavLinksContainer, 'Admin Komisariat', [
                    { text: 'Manajemen Akun', href: 'dashboard/manajemen-akun.html', icon: 'fas fa-user-shield' },
                    { text: 'Verifikasi Surat', href: 'dashboard/verifikasi-surat.html', icon: 'fas fa-check-circle' },
                    { text: 'Dashboard Admin Kom.', href: 'dashboard/admin-dashboard-komisariat.html', icon: 'fas fa-tachometer-alt' },
                    { text: 'Edit Beranda', href: 'dashboard/edit-beranda.html', icon: 'fas fa-edit' },
                    { text: 'Pengaturan Situs', href: 'dashboard/pengaturan-situs.php', icon: 'fas fa-cogs' },
                    { text: 'Dashboard Statistik', href: 'dashboard/dashboard-statistik.html', icon: 'fas fa-chart-bar' },
                    { text: 'Kelola Notifikasi', href: 'dashboard/kelola-notifikasi.html', icon: 'fas fa-bell' },
                    { text: 'Laporan & Analisis', href: 'dashboard/laporan-analisis.php', icon: 'fas fa-file-invoice' },
                    { text: 'TTD Digital', href: 'generate-qr.php', icon: 'fas fa-qrcode' },
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
        const mobileOjsMenu = document.getElementById('mobile-ojs-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

        const isOpen = mobileOjsMenu.classList.contains('hidden');
        if (isOpen) {
            populateMobileMenu();
            mobileOjsMenu.classList.remove('hidden');
            mobileMenuOverlay.classList.add('menu-active');
            document.body.classList.add('overflow-hidden');
        } else {
            mobileOjsMenu.classList.add('hidden');
            mobileMenuOverlay.classList.remove('menu-active');
            document.body.classList.remove('overflow-hidden');
        }
    }
    
    const mobileOjsMenuButton = document.getElementById('mobile-ojs-menu-button');
    const mobileOjsMenu = document.getElementById('mobile-ojs-menu');
    const mobileMenuOverlayElement = document.getElementById('mobile-menu-overlay');

    if (mobileOjsMenuButton) mobileOjsMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlayElement) mobileMenuOverlayElement.addEventListener('click', toggleMobileMenu);


    /**
     * Fungsi untuk merender jurnal di area tampilan utama.
     * @param {Array<Object>} jurnalsToRender - Array objek jurnal yang akan dirender.
     */
    async function renderJurnalsOjs(jurnalsToRender) {
        if(mainJournalListSection) mainJournalListSection.classList.remove('hidden');
        if(heroSectionOjs) heroSectionOjs.classList.remove('hidden');

        const daftarJurnalContainerOjs = document.getElementById('daftarJurnalContainerOjs');
        if (!daftarJurnalContainerOjs) return;
        if(jurnalLoadingOjs) jurnalLoadingOjs.style.display = 'none';
        daftarJurnalContainerOjs.innerHTML = '';

        let displayableJournals = jurnalsToRender;
        if (userRole !== 'komisariat') {
            displayableJournals = jurnalsToRender.filter(j => j.status === "approved");
        }

        if (currentSortOrder === 'newest') {
            displayableJournals.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
        } else if (currentSortOrder === 'mostRead') {
            displayableJournals.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        }

        if (displayableJournals.length === 0) {
            daftarJurnalContainerOjs.innerHTML = '<p class="text-text-muted col-span-full text-center py-8">Tidak ada jurnal yang cocok dengan kriteria Anda atau belum ada jurnal terverifikasi.</p>';
            return;
        }

        displayableJournals.forEach(jurnal => {
            let statusClass = '';
            let statusText = '';
            if (jurnal.status === 'approved') { statusClass = 'status-terverifikasi'; statusText = 'Terverifikasi'; }
            else if (jurnal.status === 'pending') { statusClass = 'status-menunggu'; statusText = 'Menunggu Verifikasi'; }
            else if (jurnal.status === 'rejected') { statusClass = 'status-ditolak'; statusText = 'Ditolak'; }

            const card = `
                <div class="journal-card flex flex-col animate-scaleIn">
                    <div class="journal-card-content flex-grow">
                        <h3 class="journal-card-title">${jurnal.title}</h3>
                        <p class="journal-card-author">Oleh: ${jurnal.author_name}</p>
                        <p class="journal-card-abstract">${jurnal.abstract ? jurnal.abstract.substring(0, 120) + '...' : 'Tidak ada abstrak.'}</p>
                    </div>
                    <div class="journal-card-meta px-5 pb-3 text-xs">
                        <span>${new Date(jurnal.publication_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span> | 
                        <span>Kategori: ${jurnal.category || 'Umum'}</span>
                        <br><span>Dilihat: ${jurnal.view_count || 0} | Disitasi: ${jurnal.citation_count || 0}</span>
                        ${jurnal.doi ? `<br><span>DOI: <a href="https://doi.org/${jurnal.doi}" target="_blank" class="text-pmii-blue hover:underline">${jurnal.doi}</a></span>` : ''}
                        ${ (userRole === 'komisariat') ? `<br><span class="status-badge ${statusClass} mt-1 inline-block">${statusText}</span>` : ''}
                    </div>
                    <div class="journal-card-actions flex justify-between items-center">
                        <button onclick="openDetailModalOjs(${jurnal.scientific_work_id})" class="btn-modern btn-primary-modern !py-1.5 !px-3 !text-xs">
                            <i class="fas fa-eye mr-1.5"></i>Lihat Detail
                        </button>
                        ${userRole === 'komisariat' ? 
                            `<button onclick="confirmAndDeleteJurnalOjs(${jurnal.scientific_work_id})" class="btn-modern !bg-red-500 hover:!bg-red-600 !text-white !py-1.5 !px-3 !text-xs">
                                <i class="fas fa-trash-alt mr-1.5"></i>Hapus
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
            daftarJurnalContainerOjs.innerHTML += card;
        });
    }
            
    if (sortMostReadBtn) {
        sortMostReadBtn.addEventListener('click', () => {
            if (currentSortOrder === 'newest') {
                currentSortOrder = 'mostRead';
                sortMostReadBtn.innerHTML = '<i class="fas fa-calendar-alt mr-1"></i>Terbaru';
            } else {
                currentSortOrder = 'newest';
                sortMostReadBtn.innerHTML = '<i class="fas fa-fire mr-1"></i>Paling Banyak Dibaca';
            }
            filterAndSearchJurnalsOjs();
        });
    }

    function populateTahunFilterOjs() {
        const years = new Set(allJournals.map(j => new Date(j.publication_date).getFullYear()));
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        if(filterTahunJurnalOjs) {
            filterTahunJurnalOjs.innerHTML = '<option value="">Semua Tahun</option>'; 
            sortedYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filterTahunJurnalOjs.appendChild(option);
            });
        }
    }

    function filterAndSearchJurnalsOjs() {
        let filtered = allJournals;
        const searchTerm = searchJurnalInputOjs ? searchJurnalInputOjs.value.toLowerCase() : "";
        const selectedTahun = filterTahunJurnalOjs ? filterTahunJurnalOjs.value : "";
        const selectedKategori = filterKategoriJurnalOjs ? filterKategoriJurnalOjs.value : "";

        if (searchTerm) {
            filtered = filtered.filter(j => 
                j.title.toLowerCase().includes(searchTerm) || 
                j.author_name.toLowerCase().includes(searchTerm) ||
                (j.abstract && j.abstract.toLowerCase().includes(searchTerm))
            );
        }
        if (selectedTahun) {
            filtered = filtered.filter(j => new Date(j.publication_date).getFullYear().toString() === selectedTahun);
        }
        if (selectedKategori) {
            filtered = filtered.filter(j => j.category === selectedKategori);
        }
        renderJurnalsOjs(filtered);
        updateStats(filtered);
    }
            
    function updateStats(journals) {
        const terverifikasi = journals.filter(j => j.status === "approved");
        if(statTotalJurnalEl) statTotalJurnalEl.textContent = terverifikasi.length;
        
        const penulisUnik = new Set(terverifikasi.map(j => j.author_name.split(',')[0].trim()));
        if(statTotalPenulisEl) statTotalPenulisEl.textContent = penulisUnik.size;
        
        const totalUnduhan = terverifikasi.reduce((sum, j) => sum + (j.view_count || 0), 0);
        if(statTotalUnduhanEl) statTotalUnduhanEl.textContent = totalUnduhan;

        const bulanIni = new Date().toISOString().slice(0, 7);
        const jurnalBulanIni = terverifikasi.filter(j => j.publication_date.startsWith(bulanIni)).length;
        if(statJurnalBaruEl) statJurnalBaruEl.textContent = jurnalBulanIni;
    }

    if(searchJurnalInputOjs) searchJurnalInputOjs.addEventListener('input', filterAndSearchJurnalsOjs);
    if(filterTahunJurnalOjs) filterTahunJurnalOjs.addEventListener('change', filterAndSearchJurnalsOjs);
    if(filterKategoriJurnalOjs) filterKategoriJurnalOjs.addEventListener('change', filterAndSearchJurnalsOjs);
            
    const ojsSearchButtonHero = document.getElementById('ojsSearchButtonHero');
    if(ojsSearchButtonHero && searchJurnalInputOjs) {
        ojsSearchButtonHero.addEventListener('click', () => {
             filterAndSearchJurnalsOjs(); 
        });
         searchJurnalInputOjs.addEventListener('keypress', function(e){
            if(e.key === 'Enter'){
                ojsSearchButtonHero.click();
            }
        });
    }

    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.add('active');
            initializeModalInputs(modal);
        }
    }
            
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('active');
        const modalInputs = modal.querySelectorAll('.form-input-modern');
        modalInputs.forEach(input => input.classList.remove('has-value'));
        if (modalId === 'uploadJurnalModalOjs') {
            formUploadJurnalOjs.reset();
            if(uploadFileErrorOjs) uploadFileErrorOjs.classList.add('hidden');
        }
    }

    function initializeModalInputs(modalElement) {
        const modalInputs = modalElement.querySelectorAll('.form-input-modern');
        modalInputs.forEach(input => {
            const label = input.nextElementSibling;
            const updateModalLabelClass = () => {
                if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '') || (input.type === 'file' && input.files.length > 0)) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            };
            updateModalLabelClass();
            input.addEventListener('input', updateModalLabelClass);
            input.addEventListener('change', updateModalLabelClass);
            input.addEventListener('focus', () => { if(label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style'); });
            input.addEventListener('blur', () => { 
                updateModalLabelClass();
                if(label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
            });
        });
    }
    if(uploadModalOjs) initializeModalInputs(uploadModalOjs);
    if(detailModalOjs) initializeModalInputs(detailModalOjs); 

    if(formUploadJurnalOjs) {
        formUploadJurnalOjs.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('uploadFileOjs');
            const file = fileInput.files[0];

            if (file) {
                if (file.type !== "application/pdf") {
                    if(uploadFileErrorOjs) {
                        uploadFileErrorOjs.textContent = "Format file harus PDF.";
                        uploadFileErrorOjs.classList.remove('hidden');
                    }
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                     if(uploadFileErrorOjs) {
                        uploadFileErrorOjs.textContent = "Ukuran file maksimal 5MB.";
                        uploadFileErrorOjs.classList.remove('hidden');
                    }
                    return;
                }
                 if(uploadFileErrorOjs) uploadFileErrorOjs.classList.add('hidden');
            } else {
                 if(uploadFileErrorOjs) {
                    uploadFileErrorOjs.textContent = "Mohon pilih file untuk diunggah.";
                    uploadFileErrorOjs.classList.remove('hidden');
                }
                return;
            }

            const formData = new FormData();
            formData.append('title', document.getElementById('uploadJudulOjs').value);
            formData.append('author_name', document.getElementById('uploadPenulisOjs').value);
            formData.append('orcid', document.getElementById('uploadORCID').value);
            formData.append('abstract', document.getElementById('uploadAbstrakOjs').value);
            formData.append('category', document.getElementById('uploadKategoriOjs').value);
            formData.append('file', file);
            formData.append('user_id', getAuthData().userData ? getAuthData().userData.user_id : null);
            formData.append('user_role', userRole);

            try {
                const response = await uploadScientificWork(formData);
                if (response.success) {
                    showCustomMessage(response.message || "Karya ilmiah berhasil diunggah dan menunggu verifikasi.", 'success');
                    await loadJournals(); 
                    filterAndSearchJurnalsOjs();
                    populateTahunFilterOjs();
                    if(userRole === 'komisariat') renderJurnalUntukVerifikasiOjs();
                    formUploadJurnalOjs.reset();
                    document.querySelectorAll('#uploadJurnalModalOjs .form-input-modern').forEach(input => input.classList.remove('has-value'));
                    closeModal('uploadJurnalModalOjs');
                } else {
                    throw new Error(response.message || "Gagal mengunggah karya ilmiah.");
                }
            } catch (error) {
                console.error("Error saat mengunggah karya ilmiah:", error);
                showCustomMessage(error.message || `Terjadi kesalahan saat mengunggah karya ilmiah.`, 'error');
            }
        });
    }

    // Global function to open journal detail modal
    window.openDetailModalOjs = async function(scientificWorkId) {
        try {
            const response = await getScientificWorkById(scientificWorkId); // Menggunakan getScientificWorkById
            const jurnal = response.data; // Asumsi response.data adalah objek jurnal langsung

            if (!jurnal) {
                showCustomMessage('Detail jurnal tidak ditemukan.', 'error');
                return;
            }

            currentJournalIdForComments = jurnal.scientific_work_id; // Simpan ID jurnal untuk komentar

            detailJudulOjs.textContent = jurnal.title;
            detailPenulisOjs.textContent = jurnal.author_name;
            
            if (jurnal.orcid) {
                detailORCID.textContent = jurnal.orcid;
            } else {
                detailORCID.textContent = "Tidak Tersedia";
            }

            detailTanggalOjs.textContent = new Date(jurnal.publication_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            detailKategoriOjs.textContent = jurnal.category;
            
            if (jurnal.doi) {
                detailDoiOjs.textContent = jurnal.doi;
                detailDoiOjs.href = `https://doi.org/${jurnal.doi}`;
            } else {
                detailDoiOjs.textContent = "Tidak Tersedia";
                detailDoiOjs.removeAttribute('href');
            }

            const statusBadge = detailStatusOjs;
            if (jurnal.status === 'approved') { statusBadge.textContent = 'Terverifikasi'; statusBadge.className = 'status-badge status-terverifikasi'; }
            else if (jurnal.status === 'pending') { statusBadge.textContent = 'Menunggu Verifikasi'; statusBadge.className = 'status-badge status-menunggu'; }
            else if (jurnal.status === 'rejected') { statusBadge.textContent = 'Ditolak'; statusBadge.className = 'status-badge status-ditolak'; }
            else { statusBadge.textContent = 'Tidak Diketahui'; statusBadge.className = 'status-badge'; }
            
            detailViewCountOjs.textContent = jurnal.view_count || 0;
            detailCitationCountOjs.textContent = jurnal.citation_count || 0;

            detailAbstrakOjs.textContent = jurnal.abstract;
            detailFileLinkOjs.href = jurnal.file_path;
            detailFileLinkOjs.download = jurnal.file_name || 'jurnal.pdf';

            if(komentarSectionOjs) {
                if(userRole !== 'public'){
                    komentarSectionOjs.classList.remove('hidden');
                    if(formKomentarOjs) formKomentarOjs.classList.remove('hidden');
                    await loadComments(jurnal.scientific_work_id); // Muat komentar yang sebenarnya
                } else {
                    komentarSectionOjs.classList.add('hidden');
                    if(formKomentarOjs) formKomentarOjs.classList.add('hidden');
                }
            }

            openModal('detailJurnalModalOjs');
        } catch (error) {
            console.error("Error saat membuka modal detail jurnal:", error);
            showCustomMessage(error.message || "Gagal memuat detail jurnal.", 'error');
        }
    }

    // Fungsi untuk memuat komentar jurnal dari API
    async function loadComments(journalId) {
        if (!daftarKomentarOjs) return;
        daftarKomentarOjs.innerHTML = '<p class="text-text-muted text-center">Memuat komentar...</p>'; // Tampilkan pesan loading

        try {
            const response = await getJournalComments(journalId); // Panggil API untuk mendapatkan komentar
            const comments = response.data || [];

            if (comments.length === 0) {
                daftarKomentarOjs.innerHTML = '<p class="text-text-muted">Belum ada komentar.</p>';
                return;
            }

            daftarKomentarOjs.innerHTML = ''; // Bersihkan placeholder
            comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Urutkan terbaru dulu

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'border-t border-gray-100 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0';
                commentElement.innerHTML = `
                    <p class="text-gray-800 text-sm">${comment.comment_text}</p>
                    <p class="text-xs text-gray-500 mt-1">Oleh: ${comment.commenter_name || 'Anonim'} pada ${new Date(comment.created_at).toLocaleDateString('id-ID')} ${new Date(comment.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
                `;
                daftarKomentarOjs.appendChild(commentElement);
            });

        } catch (error) {
            console.error("Error saat memuat komentar:", error);
            daftarKomentarOjs.innerHTML = '<p class="text-red-500">Gagal memuat komentar.</p>';
        }
    }
            
    // Fungsi untuk merender jurnal yang menunggu verifikasi di panel admin
    async function renderJurnalUntukVerifikasiOjs() {
        if (!jurnalMenungguVerifikasiContainerOjs || userRole !== 'komisariat') return;
        
        jurnalMenungguVerifikasiContainerOjs.innerHTML = '';

        try {
            const response = await getScientificWorks({ status: 'pending' });
            const menunggu = response.data || [];

            if (menunggu.length === 0) {
                jurnalMenungguVerifikasiContainerOjs.innerHTML = '<p class="text-text-muted text-center">Tidak ada jurnal yang menunggu verifikasi saat ini.</p>';
                return;
            }
            menunggu.forEach(jurnal => {
                const item = `
                    <div class="p-3 border border-gray-200 rounded-md shadow-sm bg-yellow-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="flex-grow">
                            <h4 class="font-semibold text-pmii-darkblue text-sm sm:text-base">${jurnal.title}</h4>
                            <p class="text-xs text-gray-600">Oleh: ${jurnal.author_name} | Kategori: ${jurnal.category || 'Umum'}</p>
                        </div>
                        <div class="mt-2 sm:mt-0 space-x-1 sm:space-x-2 flex-shrink-0">
                            <button onclick="verifikasiJurnalOjs(${jurnal.scientific_work_id}, 'approved')" class="btn-modern !bg-green-500 hover:!bg-green-600 !text-white !py-1 !px-2 !text-xs"><i class="fas fa-check mr-1"></i>Setujui</button>
                            <button onclick="verifikasiJurnalOjs(${jurnal.scientific_work_id}, 'rejected')" class="btn-modern !bg-red-500 hover:!bg-red-600 !text-white !py-1 !px-2 !text-xs"><i class="fas fa-times mr-1"></i>Tolak</button>
                            <button onclick="openDetailModalOjs(${jurnal.scientific_work_id})" class="btn-modern btn-outline-modern !py-1 !px-2 !text-xs"><i class="fas fa-eye mr-1"></i>Detail</button>
                        </div>
                    </div>
                `;
                jurnalMenungguVerifikasiContainerOjs.innerHTML += item;
            });
        } catch (error) {
            console.error("Error saat memuat jurnal untuk verifikasi:", error);
            jurnalMenungguVerifikasiContainerOjs.innerHTML = '<p class="text-red-500 text-center">Gagal memuat jurnal untuk verifikasi.</p>';
        }
    }

    // Global function to verify (approve/reject) a journal
    window.verifikasiJurnalOjs = async function(scientificWorkId, statusKeputusan) {
        try {
            if (statusKeputusan === 'approved') {
                await approveScientificWork(scientificWorkId);
                showCustomMessage(`Jurnal telah disetujui.`, 'success');
            } else if (statusKeputusan === 'rejected') {
                await rejectScientificWork(scientificWorkId);
                showCustomMessage(`Jurnal telah ditolak.`, 'info');
            }
            await loadJournals();
            filterAndSearchJurnalsOjs();
            renderJurnalUntukVerifikasiOjs();
        } catch (error) {
            console.error(`Error saat verifikasi jurnal ${scientificWorkId}:`, error);
            showCustomMessage(error.message || `Gagal memperbarui status jurnal.`, 'error');
        }
    }
            
    // Global function to confirm and delete a journal (admin only)
    window.confirmAndDeleteJurnalOjs = function(scientificWorkId) {
        if (userRole !== 'komisariat') {
            showCustomMessage("Hanya Admin Komisariat yang dapat menghapus jurnal.", 'warning');
            return;
        }
        const jurnal = allJournals.find(j => j.scientific_work_id === scientificWorkId);
        if (jurnal) {
            showCustomConfirm(`Apakah Anda yakin ingin menghapus jurnal "${jurnal.title}"? Aksi ini tidak dapat diurungkan.`  , async () => { 
                try {
                    await deleteScientificWork(scientificWorkId);
                    showCustomMessage(`Jurnal "${jurnal.title}" telah dihapus.`, 'success');
                    await loadJournals();
                    filterAndSearchJurnalsOjs();
                    renderJurnalUntukVerifikasiOjs();
                } catch (error) {
                    console.error(`Error saat menghapus jurnal ${scientificWorkId}:`, error);
                    showCustomMessage(error.message || `Gagal menghapus jurnal.`, 'error');
                }
            });
        }
    }
            
    if (btnEksporSitasi) {
        btnEksporSitasi.addEventListener('click', function() {
            const judulJurnal = detailJudulOjs.textContent;
            const penulisJurnal = detailPenulisOjs.textContent;
            const tanggalPublikasiText = detailTanggalOjs.textContent;
            const yearMatch = tanggalPublikasiText.match(/\d{4}/);
            const tahunPublikasi = yearMatch ? yearMatch[0] : 'Tahun Tidak Diketahui';
            const doiJurnal = detailDoiOjs.textContent;

            let sitasi = `${penulisJurnal}. (${tahunPublikasi}). ${judulJurnal}. Jurnal Al Harokah.`;
            if (doiJurnal && doiJurnal !== "Tidak Tersedia") {
                sitasi += ` DOI: ${doiJurnal}`;
            }
            
            try {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = sitasi;
                document.body.appendChild(tempTextArea);
                tempTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextArea);
                showCustomMessage('Informasi sitasi telah disalin ke clipboard:\n\n' + sitasi, 'success');
            } catch (err) {
                showCustomMessage('Gagal menyalin sitasi. Informasi Sitasi:\n\n' + sitasi, 'error');
                console.error('Gagal menyalin sitasi:', err);
            }
        });
    }

    // Handle comment form submission (actual API call)
    if (formKomentarOjs) {
        formKomentarOjs.addEventListener('submit', async function(e) {
            e.preventDefault();
            const komentarText = inputKomentarOjs.value.trim();
            if (!komentarText) {
                showCustomMessage('Komentar tidak boleh kosong.', 'warning');
                return;
            }

            if (!currentJournalIdForComments) {
                showCustomMessage('Kesalahan: ID jurnal tidak ditemukan untuk komentar.', 'error');
                return;
            }

            const authData = getAuthData();
            const userId = authData.userData ? authData.userData.user_id : null;
            const userName = authData.userData ? authData.userData.user_name : 'Anonim';

            if (!userId) {
                showCustomMessage('Anda harus login untuk mengirim komentar.', 'warning');
                return;
            }

            try {
                const commentData = {
                    scientific_work_id: currentJournalIdForComments,
                    user_id: userId,
                    comment_text: komentarText,
                    commenter_name: userName // Kirim nama pengguna untuk ditampilkan
                };
                const response = await submitJournalComment(commentData); // Panggil API
                
                if (response.success) {
                    showCustomMessage(response.message || 'Komentar berhasil ditambahkan.', 'success');
                    inputKomentarOjs.value = '';
                    inputKomentarOjs.classList.remove('has-value');
                    await loadComments(currentJournalIdForComments); // Muat ulang komentar setelah berhasil
                } else {
                    throw new Error(response.message || 'Gagal menambahkan komentar.');
                }
            } catch (error) {
                console.error('Error saat menambahkan komentar:', error);
                showCustomMessage(error.message || 'Terjadi kesalahan saat menambahkan komentar.', 'error');
            }
        });
    }

    // Fungsi untuk memuat jurnal dari API
    async function loadJournals() {
        if(jurnalLoadingOjs) jurnalLoadingOjs.style.display = 'block';
        try {
            const response = await getScientificWorks();
            if (response.success && response.data) {
                allJournals = response.data;
                console.log("Jurnal dimuat dari API:", allJournals);
            } else {
                allJournals = [];
                showCustomMessage("Gagal memuat jurnal dari server. Menampilkan data kosong.", "error");
            }
        } catch (error) {
            console.error("Error memuat jurnal:", error);
            allJournals = [];
            showCustomMessage("Terjadi kesalahan jaringan saat memuat jurnal.", "error");
        } finally {
            if(jurnalLoadingOjs) jurnalLoadingOjs.style.display = 'none';
        }
    }

    // --- Inisialisasi Halaman ---
    updatePageSpecificUI();
    await loadJournals();
    populateTahunFilterOjs();
    filterAndSearchJurnalsOjs();

    const scrollToTopBtnOjsPage = document.getElementById('scrollToTopBtnOjsPage');
    if (scrollToTopBtnOjsPage) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnOjsPage.classList.remove('hidden');
                scrollToTopBtnOjsPage.classList.add('flex');
            } else {
                scrollToTopBtnOjsPage.classList.add('hidden');
                scrollToTopBtnOjsPage.classList.remove('flex');
            }
        });
        scrollToTopBtnOjsPage.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const tahunFooterOjsPage = document.getElementById('tahun-footer-ojs-page');
    if (tahunFooterOjsPage) {
        tahunFooterOjsPage.textContent = new Date().getFullYear();
    }

    function showContentSection(sectionToShowId) {
        heroSectionOjs.classList.add('hidden');
        mainJournalListSection.classList.add('hidden');
        panduanPenulisSectionOjs.classList.add('hidden');
        if (panelVerifikasiAdminOjs) panelVerifikasiAdminOjs.classList.add('hidden');

        const targetSection = document.getElementById(sectionToShowId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            if (sectionToShowId === 'main-journal-list-section') {
                heroSectionOjs.classList.remove('hidden');
                filterAndSearchJurnalsOjs();
            } else if (sectionToShowId === 'panelVerifikasiAdminOjs') {
                renderJurnalUntukVerifikasiOjs();
            }
        }
        const mobileOjsMenu = document.getElementById('mobile-ojs-menu');
        if (mobileOjsMenu) mobileOjsMenu.classList.add('hidden');

        document.querySelectorAll('.ojs-header-nav a, #mobile-ojs-menu a').forEach(link => {
            link.classList.remove('active');
        });
        const desktopHomeLink = document.getElementById('desktop-home-link');
        const mobileHomeLink = document.getElementById('mobile-home-link');
        const panduanPenulisDesktopLink = document.getElementById('panduan-penulis-desktop-link');
        const panduanPenulisMobileLink = document.getElementById('panduan-penulis-mobile-link');

        if (sectionToShowId === 'main-journal-list-section') {
            if (desktopHomeLink) desktopHomeLink.classList.add('active');
            if (mobileHomeLink) mobileHomeLink.classList.add('active');
        } else if (sectionToShowId === 'panduan-penulis-section') {
            if (panduanPenulisDesktopLink) panduanPenulisDesktopLink.classList.add('active');
            if (panduanPenulisMobileLink) panduanPenulisMobileLink.classList.add('active');
        }
    }

    const homeLink = document.getElementById('home-link');
    const desktopHomeLink = document.getElementById('desktop-home-link');
    const mobileHomeLink = document.getElementById('mobile-home-link');
    const panduanPenulisDesktopLink = document.getElementById('panduan-penulis-desktop-link');
    const panduanPenulisMobileLink = document.getElementById('panduan-penulis-mobile-link');

    if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); showContentSection('main-journal-list-section'); });
    if (desktopHomeLink) desktopHomeLink.addEventListener('click', (e) => { e.preventDefault(); showContentSection('main-journal-list-section'); });
    if (mobileHomeLink) mobileHomeLink.addEventListener('click', (e) => { e.preventDefault(); showContentSection('main-journal-list-section'); });
    
    if (panduanPenulisDesktopLink) panduanPenulisDesktopLink.addEventListener('click', (e) => { e.preventDefault(); showContentSection('panduan-penulis-section'); });
    if (panduanPenulisMobileLink) panduanPenulisMobileLink.addEventListener('click', (e) => { e.preventDefault(); showContentSection('panduan-penulis-section'); });
});
