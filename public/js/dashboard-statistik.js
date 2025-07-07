// public/js/dashboard-statistik.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getUsers, getSuratSubmissions, getApprovedNews, getApprovedActivities, getScientificWorks, getAllRayons } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;

    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Fungsi global untuk pesan kustom (akan diakses oleh updateAuthUI)
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

    if (authLinkMain) {
        authLinkMain.removeEventListener('click', handleAuthClick);
        authLinkMain.addEventListener('click', handleAuthClick);
    }
    if (authLinkMobile) {
        authLinkMobile.removeEventListener('click', handleAuthClick);
        authLinkMobile.addEventListener('click', handleAuthClick);
    }

    // --- Logika Spesifik Halaman Dashboard Statistik ---
    // Elemen Statistik
    const totalKaderEl = document.getElementById('total-kader');
    const kaderAktifEl = document.getElementById('kader-aktif');
    const kaderPkdEl = document.getElementById('kader-pkd');
    const kaderPklEl = document.getElementById('kader-pkl');
    const suratDiajukanEl = document.getElementById('surat-diajukan');
    const beritaDiunggahEl = document.getElementById('berita-diunggah');
    const kegiatanTerlaksanaEl = document.getElementById('kegiatan-terlaksana');
    const karyaIlmiahEl = document.getElementById('karya-ilmiah');

    // Chart instances (untuk disimpan agar bisa dihancurkan/diperbarui)
    let klasifikasiKaderChartInstance = null;
    let rayonKaderChartInstance = null;
    let angkatanKaderChartInstance = null;
    let suratTrenChartInstance = null;
    let suratStatusChartInstance = null;
    let beritaTrenChartInstance = null;
    let kegiatanTrenChartInstance = null;


    // Fungsi untuk memperbarui UI spesifik halaman
    async function updateDashboardUI() { // Tambahkan async di sini
        // Peran yang diizinkan untuk halaman ini
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses dashboard statistik
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php',
            ''
        ];

        const currentPage = window.location.pathname.split('/').pop();

        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : null;

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
            return;
        }

        if (hasAccess) {
            // Update nama admin jika ada elemennya
            const adminNameDashboard = document.getElementById('admin-name-dashboard');
            const adminNameDashboardBanner = document.querySelector('.welcome-banner #admin-name-dashboard-banner'); // Selector untuk banner
            if (adminNameDashboard) {
                adminNameDashboard.textContent = loggedInUser.nama || 'Admin Komisariat';
            }
            if (adminNameDashboardBanner) {
                adminNameDashboardBanner.textContent = loggedInUser.nama || 'Admin Komisariat';
            }

            // Update header title ke SINTAKSIS
            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
            }

            // Muat data statistik secara nyata dari API dan render grafik
            await loadAndRenderAllStatisticsAndCharts();

        } else {
            // Jika tidak memiliki akses, atau halaman publik, pastikan header normal
            const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
            if (headerTitleText) {
                headerTitleText.textContent = defaultTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = defaultTitle;
            }
        }

        const tahunFooter = document.getElementById('tahun-footer');
        if (tahunFooter) {
            tahunFooter.textContent = new Date().getFullYear();
        }

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

        setupQuickLinks(); // Panggil setup quick links
    }

    // --- Fungsi untuk memuat semua statistik dan data grafik dari API ---
    async function loadAndRenderAllStatisticsAndCharts() {
        try {
            // Fetch all necessary data
            const usersResponse = await getUsers();
            const suratResponse = await getSuratSubmissions();
            const newsResponse = await getApprovedNews();
            const activitiesResponse = await getApprovedActivities();
            const scientificWorksResponse = await getScientificWorks();
            const rayonsResponse = await getAllRayons(); // Untuk distribusi rayon kader

            const allUsers = usersResponse.data || [];
            const allSurat = suratResponse.data || [];
            const allNews = newsResponse.data || [];
            const allActivities = activitiesResponse.data || [];
            const allScientificWorks = scientificWorksResponse.data || [];
            const allRayons = rayonsResponse.data || []; // Assuming rayons have 'id' and 'name'

            // --- Update Statistik Umum ---
            const allKader = allUsers.filter(u => u.role === 'kader');
            totalKaderEl.textContent = allKader.length;
            kaderAktifEl.textContent = allKader.filter(k => k.status === 'aktif').length;
            kaderPkdEl.textContent = allKader.filter(k => k.lulus_pkd === 1).length;
            kaderPklEl.textContent = allKader.filter(k => k.lulus_pkl === 1).length;

            const currentMonth = new Date().getMonth(); // 0-11
            const currentYear = new Date().getFullYear();
            const suratBulanIni = allSurat.filter(s => {
                const submissionDate = new Date(s.submission_date);
                return submissionDate.getMonth() === currentMonth && submissionDate.getFullYear() === currentYear;
            }).length;
            suratDiajukanEl.textContent = suratBulanIni;

            beritaDiunggahEl.textContent = allNews.length;
            kegiatanTerlaksanaEl.textContent = allActivities.length;
            karyaIlmiahEl.textContent = allScientificWorks.length;


            // --- Render Grafik ---
            // Distribusi Kader Berdasarkan Klasifikasi
            const klasifikasiData = allKader.reduce((acc, user) => {
                if (user.cadre_level && user.cadre_level !== '-') {
                    acc[user.cadre_level] = (acc[user.cadre_level] || 0) + 1;
                }
                return acc;
            }, {});
            destroyChartInstance(klasifikasiKaderChartInstance);
            klasifikasiKaderChartInstance = new Chart(document.getElementById('klasifikasiKaderChart'), {
                type: 'pie',
                data: {
                    labels: Object.keys(klasifikasiData),
                    datasets: [{
                        data: Object.values(klasifikasiData),
                        backgroundColor: ['#005c97', '#fdd835', '#004a7c', '#374151'],
                        borderColor: 'white', borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { family: 'Inter' } } }, title: { display: false } } }
            });

            // Distribusi Kader Berdasarkan Rayon
            const rayonKaderData = allKader.reduce((acc, user) => {
                const rayonName = allRayons.find(r => r.id === user.rayon_id)?.name || 'Tidak Diketahui';
                if (rayonName && rayonName !== 'Tidak Diketahui') {
                    acc[rayonName] = (acc[rayonName] || 0) + 1;
                }
                return acc;
            }, {});
            destroyChartInstance(rayonKaderChartInstance);
            rayonKaderChartInstance = new Chart(document.getElementById('rayonKaderChart'), {
                type: 'bar',
                data: {
                    labels: Object.keys(rayonKaderData),
                    datasets: [{
                        label: 'Jumlah Kader',
                        data: Object.values(rayonKaderData),
                        backgroundColor: '#005c97', borderColor: '#004a7c', borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { family: 'Inter' } } } } }
            });

            // Distribusi Kader Berdasarkan Angkatan
            const angkatanData = allKader.reduce((acc, user) => {
                if (user.entry_year_university) { // Menggunakan tahun masuk universitas sebagai angkatan
                    acc[user.entry_year_university] = (acc[user.entry_year_university] || 0) + 1;
                }
                return acc;
            }, {});
            destroyChartInstance(angkatanKaderChartInstance);
            angkatanKaderChartInstance = new Chart(document.getElementById('angkatanKaderChart'), {
                type: 'bar',
                data: {
                    labels: Object.keys(angkatanData).sort(),
                    datasets: [{
                        label: 'Jumlah Kader',
                        data: Object.keys(angkatanData).sort().map(year => angkatanData[year]),
                        backgroundColor: '#fdd835', borderColor: '#e6a100', borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { family: 'Inter' } } } }
            });

            // Tren Pengajuan Surat (Per Bulan)
            const suratTrenData = Array(12).fill(0); // Inisialisasi 12 bulan dengan 0
            allSurat.forEach(surat => {
                const month = new Date(surat.submission_date).getMonth();
                suratTrenData[month]++;
            });
            const monthsNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            destroyChartInstance(suratTrenChartInstance);
            suratTrenChartInstance = new Chart(document.getElementById('suratTrenChart'), {
                type: 'line',
                data: {
                    labels: monthsNames,
                    datasets: [{
                        label: 'Jumlah Pengajuan Surat',
                        data: suratTrenData,
                        backgroundColor: 'rgba(0, 92, 151, 0.2)',
                        borderColor: '#005c97', borderWidth: 2, tension: 0.3, fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { family: 'Inter' } } } }
            });

            // Status Pengajuan Surat
            const suratStatusData = allSurat.reduce((acc, surat) => {
                const status = surat.status; // Asumsi field status
                if (status) {
                    acc[status] = (acc[status] || 0) + 1;
                }
                return acc;
            }, {});
            destroyChartInstance(suratStatusChartInstance);
            suratStatusChartInstance = new Chart(document.getElementById('suratStatusChart'), {
                type: 'doughnut',
                data: {
                    labels: Object.keys(suratStatusData),
                    datasets: [{
                        data: Object.values(suratStatusData),
                        backgroundColor: [
                            '#005c97', /* Diajukan (PMII Blue) */
                            '#22c55e', /* Disetujui (Success Green) */
                            '#ef4444' /* Ditolak (Danger Red) */
                        ],
                        borderColor: 'white', borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { family: 'Inter' } } }, title: { display: false } }
            });

            // Tren Publikasi Berita/Artikel (Per Bulan)
            const beritaTrenData = Array(12).fill(0);
            allNews.forEach(berita => {
                const month = new Date(berita.publication_date).getMonth(); // Asumsi publication_date
                beritaTrenData[month]++;
            });
            destroyChartInstance(beritaTrenChartInstance);
            beritaTrenChartInstance = new Chart(document.getElementById('beritaTrenChart'), {
                type: 'line',
                data: {
                    labels: monthsNames,
                    datasets: [{
                        label: 'Jumlah Berita/Artikel',
                        data: beritaTrenData,
                        backgroundColor: 'rgba(253, 216, 53, 0.2)',
                        borderColor: '#fdd835', borderWidth: 2, tension: 0.3, fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { family: 'Inter' } } } }
            });

            // Tren Kegiatan Terlaksana (Per Bulan)
            const kegiatanTrenData = Array(12).fill(0);
            allActivities.forEach(activity => {
                const month = new Date(activity.activity_date).getMonth(); // Asumsi activity_date
                kegiatanTrenData[month]++;
            });
            destroyChartInstance(kegiatanTrenChartInstance);
            kegiatanTrenChartInstance = new Chart(document.getElementById('kegiatanTrenChart'), {
                type: 'bar',
                data: {
                    labels: monthsNames,
                    datasets: [{
                        label: 'Jumlah Kegiatan',
                        data: kegiatanTrenData,
                        backgroundColor: '#005c97',
                        borderColor: '#004a7c', borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { font: { family: 'Inter' } } } }
            });

        } catch (error) {
            console.error("Gagal memuat data statistik dari API:", error);
            window.showCustomMessage("Gagal memuat data statistik. Silakan coba lagi nanti.", "error");
            // Setel semua nilai ke 0 jika gagal
            totalKaderEl.textContent = '0';
            kaderAktifEl.textContent = '0';
            kaderPkdEl.textContent = '0';
            kaderPklEl.textContent = '0';
            suratDiajukanEl.textContent = '0';
            beritaDiunggahEl.textContent = '0';
            kegiatanTerlaksanaEl.textContent = '0';
            karyaIlmiahEl.textContent = '0';
        }
    }

    // Helper function to destroy existing chart instances before creating new ones
    function destroyChartInstance(chartInstance) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    }

    function setupQuickLinks() {
        const quickLinks = document.querySelectorAll('.quick-link-item');
        const sections = document.querySelectorAll('section[id$="-section"]');

        quickLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                sections.forEach(sec => sec.style.display = 'none');
                targetSection.style.display = 'block';

                quickLinks.forEach(item => item.classList.remove('active-quick-link'));
                this.classList.add('active-quick-link');

                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Set initial active state and display only the first section
        if (quickLinks.length > 0 && sections.length > 0) {
            quickLinks[0].classList.add('active-quick-link');
            for (let i = 1; i < sections.length; i++) {
                sections[i].style.display = 'none';
            }
        }
    }

    // Panggil fungsi pembaruan UI utama saat DOM siap
    updateDashboardUI();
});