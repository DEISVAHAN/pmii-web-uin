// public/js/rayon-profile.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getRayonById } from './api.js'; // Asumsi ada fungsi getRayonById di api.js

document.addEventListener('DOMContentLoaded', async function() {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpRayonData = window.phpRayonData; // Data rayon yang diinjeksi dari PHP

    // --- DOM Element References ---
    const rayonLogo = document.getElementById('rayon-logo');
    const rayonName = document.getElementById('rayon-name');
    const chairmanPhoto = document.getElementById('chairman-photo');
    const rayonChairman = document.getElementById('rayon-chairman');
    const rayonDescription = document.getElementById('rayon-description');
    const rayonCadreCount = document.getElementById('rayon-cadre-count');
    const rayonEstablishedDate = document.getElementById('rayon-established-date');
    const rayonVision = document.getElementById('rayon-vision');
    const rayonMission = document.getElementById('rayon-mission');
    const rayonContact = document.getElementById('rayon-contact');
    const rayonEmail = document.getElementById('rayon-email');
    const rayonAddress = document.getElementById('rayon-address');
    const socialInstagramLink = document.getElementById('social-instagram-link');
    const socialFacebookLink = document.getElementById('social-facebook-link');
    const socialTwitterLink = document.getElementById('social-twitter-link');
    const socialYoutubeLink = document.getElementById('social-youtube-link');
    const rayonPageTitle = document.getElementById('rayon-page-title');
    const rayonTagline = document.getElementById('rayon-tagline');
    const mainContentArea = document.querySelector('main .max-w-5xl'); // Area konten utama untuk pesan error

    // --- Custom Message Box Function (from global context, assuming main.js loads it) ---
    // Pastikan fungsi ini tersedia secara global di `window` oleh `main.js` atau `index.php`.
    // Jika tidak, Anda perlu mendefinisikannya di sini atau memastikan `main.js` dimuat sebelum ini.
    if (typeof window.showCustomMessage !== 'function') {
        window.showCustomMessage = function(message, type = 'info') {
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
            }, 3000);
        };
    }

    /**
     * Memuat dan menampilkan data rayon.
     */
    async function loadRayonProfile() {
        const urlParams = new URLSearchParams(window.location.search);
        const rayonId = urlParams.get('id');
        let currentRayon = null;

        if (!rayonId) {
            displayRayonNotFound('ID Rayon tidak ditemukan di URL.');
            return;
        }

        try {
            // Coba ambil data dari PHP injected terlebih dahulu (untuk initial load)
            if (phpRayonData && phpRayonData.id === rayonId) {
                currentRayon = phpRayonData;
            } else {
                // Jika tidak ada di PHP injected atau ID tidak cocok, panggil API
                const response = await getRayonById(rayonId); // Asumsi getRayonById ada di api.js
                if (response && response.data) {
                    currentRayon = response.data;
                } else {
                    throw new Error(response.message || 'Data rayon tidak ditemukan dari API.');
                }
            }
            
            renderRayonData(currentRayon);

        } catch (error) {
            console.error('Error loading rayon profile:', error);
            window.showCustomMessage(error.message || 'Gagal memuat profil rayon.', 'error');
            displayRayonNotFound('Terjadi kesalahan saat memuat profil rayon.');
        } finally {
            // Animasi masuk konten setelah data dimuat atau error ditangani
            document.querySelector('.page-header-bg').classList.add('is-visible');
            const rayonProfileContent = document.getElementById('rayon-profile-content');
            if (rayonProfileContent) {
                rayonProfileContent.classList.add('is-visible');
                document.querySelectorAll('#rayon-profile-content .animated-section').forEach((el, index) => {
                    el.style.transitionDelay = `${(index + 1) * 0.1}s`;
                    el.classList.add('is-visible');
                });
            }
        }
    }

    /**
     * Menampilkan data rayon ke DOM.
     * @param {Object} rayon - Objek data rayon.
     */
    function renderRayonData(rayon) {
        if (!rayon) {
            displayRayonNotFound('Data rayon tidak valid.');
            return;
        }

        rayonLogo.src = rayon.logo || 'https://placehold.co/150x150/005c97/FFFFFF?text=Logo';
        rayonName.textContent = rayon.name || 'Nama Rayon Tidak Ditemukan';
        
        chairmanPhoto.src = rayon.chairman_photo || 'https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua';
        rayonChairman.textContent = rayon.chairman || 'N/A';
        rayonDescription.textContent = rayon.description || 'Deskripsi rayon belum tersedia.';

        rayonVision.textContent = rayon.vision || 'Visi rayon belum tersedia.';
        rayonMission.textContent = rayon.mission || 'Misi rayon belum tersedia.';

        rayonCadreCount.textContent = rayon.cadre_count !== undefined ? rayon.cadre_count.toLocaleString('id-ID') : 'N/A';
        rayonEstablishedDate.textContent = rayon.established_date ? new Date(rayon.established_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

        rayonContact.textContent = rayon.contact || 'N/A';
        rayonEmail.textContent = rayon.email || 'N/A';
        rayonAddress.textContent = rayon.address || 'N/A';
        
        rayonPageTitle.textContent = `Profil ${rayon.name}`;
        rayonTagline.textContent = `Informasi lengkap mengenai ${rayon.name} Komisariat UIN Sunan Gunung Djati Cabang Kota Bandung.`;
        document.title = `Profil ${rayon.name} - Sistem Internal PMII`;

        // Social media links
        if (rayon.instagram && rayon.instagram.trim() !== '') {
            socialInstagramLink.href = rayon.instagram;
            socialInstagramLink.classList.remove('hidden');
        } else {
            socialInstagramLink.classList.add('hidden');
        }

        if (rayon.facebook && rayon.facebook.trim() !== '') {
            socialFacebookLink.href = rayon.facebook;
            socialFacebookLink.classList.remove('hidden');
        } else {
            socialFacebookLink.classList.add('hidden');
        }
        
        if (rayon.twitter && rayon.twitter.trim() !== '') {
            socialTwitterLink.href = rayon.twitter;
            socialTwitterLink.classList.remove('hidden');
        } else {
            socialTwitterLink.classList.add('hidden');
        }

        if (rayon.youtube && rayon.youtube.trim() !== '') {
            socialYoutubeLink.href = rayon.youtube;
            socialYoutubeLink.classList.remove('hidden');
        } else {
            socialYoutubeLink.classList.add('hidden');
        }
    }

    /**
     * Menampilkan pesan "Rayon Tidak Ditemukan".
     * @param {string} message - Pesan yang akan ditampilkan.
     */
    function displayRayonNotFound(message) {
        if (mainContentArea) {
            mainContentArea.innerHTML = `
                <div class="content-section-card text-center p-8 animated-section is-visible">
                    <h2 class="text-2xl font-bold text-red-600 mb-4">Rayon Tidak Ditemukan</h2>
                    <p class="text-md text-text-secondary mb-6">${message}</p>
                    <a href="all-rayons.php" class="btn btn-primary">
                        <i class="fas fa-arrow-left mr-2"></i> Kembali ke Daftar Rayon
                    </a>
                </div>
            `;
        }
        if (rayonPageTitle) rayonPageTitle.textContent = 'Rayon Tidak Ditemukan';
        if (rayonTagline) rayonTagline.textContent = 'Terjadi kesalahan saat memuat profil rayon.';
        document.title = 'Rayon Tidak Ditemukan';
    }

    // --- Event Listeners & General UI Logic ---

    // Setel tahun saat ini di footer
    const footerYearElement = document.getElementById('tahun-footer-kader');
    if (footerYearElement) {
        footerYearElement.textContent = new Date().getFullYear();
    }

    // Fungsionalitas tombol gulir ke atas
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
        }
    });
    if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Tambahkan Efek Parallax ke header
    const parallaxContainer = document.querySelector('.page-header-bg .parallax-container');
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

    // Panggil fungsi untuk memuat profil rayon saat DOM siap
    loadRayonProfile();
});

// Catatan: Fungsi getRayonById(id) perlu ditambahkan ke public/js/api.js
// Contoh implementasi di api.js:
/*
export async function getRayonById(id) {
    try {
        const response = await fetch(`/api/rayons/${id}`); // Asumsi endpoint API untuk rayon berdasarkan ID
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengambil data rayon.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching rayon by ID:', error);
        throw error;
    }
}
*/
