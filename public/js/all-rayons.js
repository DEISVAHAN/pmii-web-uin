// public/js/all-rayons.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, getAuthData } from './auth.js';
import { getAllRayons } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // --- Data Injeksi dari PHP ---
    // phpLoggedInUser dan phpRayonsData diinjeksi dari all-rayons.php
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpRayonsData = window.phpRayonsData; 

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
    // Pastikan ini didefinisikan secara global di index.php atau file global lainnya
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

    const rayonListContainer = document.getElementById('rayon-list-container');
    let allRayons = []; // Data rayon yang akan ditampilkan

    /**
     * Loads rayon data from API, or uses PHP injected data as fallback.
     */
    async function loadRayonsData() {
        try {
            const response = await getAllRayons(); // Panggil API untuk mendapatkan data rayon
            if (response && response.data) {
                allRayons = response.data;
                console.log('Data Rayon dari API:', allRayons);
            } else {
                // Fallback ke data PHP injected jika API gagal atau kosong
                allRayons = phpRayonsData; // phpRayonsData berasal dari PHP yang diinjeksi
                console.log('Data Rayon dari PHP (fallback):', allRayons);
                window.showCustomMessage('Gagal memuat data rayon dari server. Menampilkan data default.', 'error');
            }
        } catch (error) {
            console.error('Error fetching rayons:', error);
            // Fallback ke data PHP injected jika ada error API
            allRayons = phpRayonsData; // phpRayonsData berasal dari PHP yang diinjeksi
            console.log('Data Rayon dari PHP (fallback karena error API):', allRayons);
            window.showCustomMessage('Terjadi kesalahan saat memuat data rayon. Menampilkan data default.', 'error');
        } finally {
            renderRayonCards(); // Selalu render setelah mencoba memuat data
        }
    }

    /**
     * Renders the rayon cards dynamically into the DOM.
     */
    function renderRayonCards() {
        if (!rayonListContainer) return;

        rayonListContainer.innerHTML = '';
        if (allRayons.length === 0) {
            rayonListContainer.innerHTML = `<p class="text-gray-500 text-center py-8 col-span-full">Belum ada data rayon yang tersedia.</p>`;
            return;
        }

        allRayons.forEach((rayon, index) => {
            const rayonCard = document.createElement('a');
            // Menggunakan index.php sebagai base path
            rayonCard.href = `rayon-profile.html?id=${rayon.id}`; // Tetap ke HTML untuk saat ini
            rayonCard.className = `rayon-card rounded-xl p-6 shadow-md animated-section stagger-${index + 1}`;
            rayonCard.setAttribute('data-cadre-count', rayon.cadre_count || 0);
            rayonCard.setAttribute('data-established-date', rayon.established_date || '');

            // Generate social links HTML for all four platforms.
            const getSocialLinkHtml = (url, iconClass, label) => {
                const href = (url && url !== '#') ? url : 'javascript:void(0)';
                const disabledClass = (url && url !== '#') ? '' : 'pointer-events-none opacity-50';
                return `<a href="${href}" target="_blank" aria-label="${label}" class="${disabledClass}"><i class="${iconClass}"></i></a>`;
            };

            const socialLinksHtml = `
                ${getSocialLinkHtml(rayon.instagram_url, 'fab fa-instagram', 'Instagram')}
                ${getSocialLinkHtml(rayon.facebook_url, 'fab fa-facebook-f', 'Facebook')}
                ${getSocialLinkHtml(rayon.twitter_url, 'fab fa-twitter', 'Twitter')}
                ${getSocialLinkHtml(rayon.youtube_url, 'fab fa-youtube', 'YouTube')}
            `;

            rayonCard.innerHTML = `
                <img src="${rayon.logo_url || 'https://placehold.co/100x100/CCCCCC/333333?text=Logo'}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/CCCCCC/333333?text=Logo';" alt="Logo ${rayon.name}">
                <h3 class="text-xl font-bold text-pmii-darkblue mb-2">${rayon.name}</h3>
                <p class="text-gray-700 text-sm">${(rayon.description || '').substring(0, 100)}...</p>
                
                <div class="mt-4 text-left w-full text-sm text-gray-600">
                    <div class="info-block"><i class="fas fa-users"></i> Jumlah Kader: ${rayon.cadre_count || 0}</div>
                    <div class="info-block"><i class="fas fa-calendar-alt"></i> Berdiri: ${rayon.established_date ? new Date(rayon.established_date).getFullYear() : 'N/A'}</div>
                    <div class="info-block"><i class="fas fa-phone"></i> Kontak: ${rayon.contact_phone || 'N/A'}</div>
                    <div class="info-block"><i class="fas fa-envelope"></i> Email: ${rayon.email || 'N/A'}</div>
                    <div class="info-block"><i class="fas fa-map-marker-alt"></i> Alamat: ${(rayon.address || '').substring(0, 50)}...</div>
                </div>
                <div class="social-links">${socialLinksHtml}</div>
                <span class="detail-link mt-4">Lihat Detail <i class="fas fa-arrow-right ml-1"></i></span>
            `;
            rayonListContainer.appendChild(rayonCard);
        });
    }

    // --- Initializations ---
    loadRayonsData(); // Muat data rayon dari API
    
    // Navbar sticky and scroll to top button
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
        }
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    });

    if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Set current year in footer
    if (document.getElementById('tahun-footer')) document.getElementById('tahun-footer').textContent = new Date().getFullYear();

    // Intersection Observer for Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if(entry.target.id === 'rayon-list-container') {
                    Array.from(entry.target.children).forEach((card, i) => {
                        if(card.classList.contains('animated-section')) {
                            card.style.transitionDelay = `${i * 0.1}s`;
                            card.classList.add('is-visible');
                        }
                    });
                }
                const sectionTitle = entry.target.querySelector('.section-title');
                if (sectionTitle && !sectionTitle.classList.contains('is-visible')) {
                    sectionTitle.classList.add('is-visible');
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelector('.page-header-bg')?.classList.add('animated-section');
    observer.observe(document.querySelector('.page-header-bg'));
    if (rayonListContainer) {
         observer.observe(rayonListContainer);
    }

    // Parallax Effect for Header
    const parallaxContainer = document.querySelector('.parallax-container');
    if (parallaxContainer) {
        const parallaxItems = parallaxContainer.querySelectorAll('.parallax-item');
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            parallaxItems.forEach(item => {
                const speed = parseFloat(item.dataset.parallaxSpeed);
                item.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
    }
});
