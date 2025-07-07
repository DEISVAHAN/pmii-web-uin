// public/js/agenda-kegiatan.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, getAuthData } from './auth.js';
import { getApprovedActivities } from './api.js';

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpActivitiesData = window.phpActivitiesData; // Data kegiatan dari PHP

    // --- Global State & Elements ---
    // Navbar & Auth Elements (diambil dari index.php, tapi perlu diinisialisasi di sini juga)
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link'); // ID dari HTML mobile menu
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');
    
    // Kumpulkan elemen-elemen untuk updateAuthUI
    const authElements = {
        authLinkMain, authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
    };

    // Fungsi global untuk pesan kustom (digunakan oleh auth.js)
    window.showCustomMessage = window.showCustomMessage || function(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return; // Ensure element exists
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

    // Fungsi global untuk modal konfirmasi kustom (digunakan oleh auth.js)
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
        confirmYesBtn.onclick = () => { if (currentConfirmCallback) currentConfirmCallback(); hideCustomConfirm(); };
        confirmCancelBtn.onclick = () => { if (onCancel) onCancel(); hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    // --- Logika Spesifik Halaman Agenda Kegiatan ---
    const activitiesListFull = document.getElementById('activities-list-full');
    const noActivitiesMessage = document.getElementById('no-activities-message');

    /**
     * Memuat data kegiatan dari API atau menggunakan data PHP injected sebagai fallback.
     */
    async function loadActivitiesData() {
        let activities = [];
        try {
            const response = await getApprovedActivities(); // Panggil API untuk mendapatkan data kegiatan yang disetujui
            if (response && response.data) {
                activities = response.data;
                console.log('Data Kegiatan dari API:', activities);
            } else {
                // Fallback ke data PHP injected jika API gagal atau kosong
                activities = phpActivitiesData;
                console.log('Data Kegiatan dari PHP (fallback):', activities);
                window.showCustomMessage('Gagal memuat data kegiatan dari server. Menampilkan data default.', 'error');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            activities = phpActivitiesData;
            console.log('Data Kegiatan dari PHP (fallback karena error API):', activities);
            window.showCustomMessage('Terjadi kesalahan saat memuat data kegiatan. Menampilkan data default.', 'error');
        } finally {
            renderActivities(activities); // Selalu render setelah mencoba memuat data
        }
    }

    /**
     * Merender daftar kegiatan secara dinamis ke DOM.
     * @param {Array<Object>} activities - Array objek kegiatan.
     */
    function renderActivities(activities) {
        if (!activitiesListFull) return;

        activitiesListFull.innerHTML = ''; // Kosongkan konten yang ada
        if (activities.length === 0) {
            noActivitiesMessage.classList.remove('hidden');
        } else {
            noActivitiesMessage.classList.add('hidden');
            // Urutkan berdasarkan tanggal, yang akan datang dulu
            activities.sort((a, b) => {
                const dateA = new Date(a.activity_date);
                const dateB = new Date(b.activity_date);
                return dateA - dateB;
            });

            activities.forEach(item => {
                const activityDate = new Date(item.activity_date);
                const day = activityDate.getDate();
                const month = activityDate.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
                const year = activityDate.getFullYear();

                const activityItem = `
                    <div class="activity-item">
                        <div class="activity-item-header">
                            <div class="date-day">${day}</div>
                            <div class="date-month-year">${month} ${year}</div>
                        </div>
                        <div class="activity-item-content">
                            <h3 class="title">${item.title}</h3>
                            <div class="activity-item-info"><i class="fas fa-clock"></i> ${item.activity_time || 'N/A'}</div>
                            <div class="activity-item-info"><i class="fas fa-map-marker-alt"></i> ${item.location || 'N/A'}</div>
                            <p class="activity-item-description">${item.description || ''}</p>
                            ${item.image_url ? `<img src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Gambar+Kegiatan';" alt="Gambar Kegiatan" class="w-full h-40 object-cover mt-4 rounded-md">` : ''}
                            ${item.external_link && item.external_link !== '#' ? `<a href="${item.external_link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary-pmii btn-sm mt-4 self-end">Lihat Detail <i class="fas fa-external-link-alt ml-2"></i></a>` : ''}
                        </div>
                    </div>
                `;
                activitiesListFull.innerHTML += activityItem;
            });
        }
    }

    // --- General UI (from index.php) ---
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if(navbar) navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
        }
    });
    if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    // Set current year in footer
    const tahunFooter = document.getElementById('tahun-footer'); // Assuming 'tahun-footer' is the ID for this page's footer year
    if (tahunFooter) {
        tahunFooter.textContent = new Date().getFullYear();
    }

    // Intersection Observer for section animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animated-section').forEach(section => observer.observe(section));

    // --- Initializations ---
    loadActivitiesData(); // Muat data kegiatan dari API
});
