// public/js/main.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getHomepageSections, getAnnouncements, getApprovedNews, getApprovedActivities, getApprovedGalleryItems, getSiteSettings, getSocialMediaLinks, getAllRayons, getNotifications } from './api.js';
import { showCustomMessage, showCustomConfirm } from './utils.js'; // Import dari utils.js

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpHomepageContent = window.phpHomepageContent;
    const phpSiteSettings = window.phpSiteSettings;
    const phpSimulatedRayons = window.phpSimulatedRayons;
    const phpTotalKaderSimulated = window.phpTotalKaderSimulated;
    const phpTotalRayonSimulated = window.phpTotalRayonSimulated;
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');
    const editActivitiesButtonContainer = document.getElementById('edit-activities-button-container');
    const desktopArsiparisLink = document.getElementById('arsiparis-kepengurusan-link-desktop');
    // Deklarasi variabel notifikasi di sini, bukan di dalam fungsi lain
    const notificationButtonDesktop = document.getElementById('notification-button-desktop');
    const notificationBadgeDesktop = document.getElementById('notification-badge-desktop');
    const notificationButtonMobile = document.getElementById('notification-button-mobile');
    const notificationBadgeMobile = document.getElementById('notification-badge-mobile');


    // Kumpulkan elemen-elemen untuk updateAuthUI (dari auth.js)
    const authElements = {
        authLinkMain, authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText,
        editActivitiesButtonContainer, desktopArsiparisLink,
        notificationButtonDesktop, notificationBadgeDesktop,
        notificationButtonMobile, notificationBadgeMobile,
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    // --- Data Management (akan diisi dari API) ---
    let homepageContent = {};
    let siteSettings = {};
    let totalKader = 0;
    let totalRayon = 0;

    // --- References to dynamic content containers ---
    const newsContainer = document.getElementById('news-container');
    const activitiesContainer = document.getElementById('activities-container');
    const galleryContainer = document.getElementById('gallery-container');
    const contactAddressSpan = document.getElementById('contact-address');
    const contactEmailLink = document.getElementById('contact-email');
    const contactPhoneSpan = document.getElementById('contact-phone');
    const socialMediaLinksContainer = document.getElementById('social-media-links-container');
    const heroMainTitleElement = document.getElementById('hero-main-title');
    const announcementTextElement = document.getElementById('announcement-text');
    const announcementSection = document.getElementById('announcement-section');
    const aboutP1Element = document.getElementById('about-us-p1');

    /**
     * Memuat semua konten homepage dari API.
     */
    async function loadHomepageDynamicContent() {
        try {
            // Mengambil data bagian beranda dari API
            const sectionsResponse = await getHomepageSections();
            if (sectionsResponse && sectionsResponse.data) {
                sectionsResponse.data.forEach(section => {
                    if (section.section_name === 'hero' && section.content_json) {
                        homepageContent.heroMainTitle = section.content_json.mainTitle;
                        homepageContent.announcementText = section.content_json.announcementText;
                    } else if (section.section_name === 'about' && section.content_json) {
                        homepageContent.aboutP1 = section.content_json.p1;
                    }
                });
            } else {
                homepageContent.heroMainTitle = "Gagal memuat judul utama.";
                homepageContent.announcementText = "Gagal memuat pengumuman.";
                homepageContent.aboutP1 = "Gagal memuat informasi tentang kami.";
                showCustomMessage('Gagal memuat bagian beranda dari server.', 'error');
            }

            // Mengambil pengaturan situs dari API
            const settingsResponse = await getSiteSettings();
            if (settingsResponse && settingsResponse.data) {
                siteSettings = settingsResponse.data;
            } else {
                siteSettings = {
                    contact_email: 'info@example.com',
                    contact_phone: 'N/A',
                    site_address: 'Alamat tidak tersedia',
                    instagram_url: '#',
                    facebook_url: '#',
                    twitter_url: '#',
                    youtube_url: '#'
                };
                showCustomMessage('Gagal memuat pengaturan situs dari server.', 'error');
            }

            // Mengambil berita terbaru dari API
            const newsResponse = await getApprovedNews();
            if (newsResponse && newsResponse.data) {
                homepageContent.news = newsResponse.data.slice(0, 3);
            } else {
                homepageContent.news = [];
                showCustomMessage('Gagal memuat berita terbaru dari server.', 'error');
            }

            // Mengambil kegiatan terbaru dari API
            const activitiesResponse = await getApprovedActivities();
            if (activitiesResponse && activitiesResponse.data) {
                homepageContent.activities = activitiesResponse.data.slice(0, 2);
            } else {
                homepageContent.activities = [];
                showCustomMessage('Gagal memuat kegiatan terbaru dari server.', 'error');
            }

            // Mengambil item galeri terbaru dari API
            const galleryResponse = await getApprovedGalleryItems();
            if (galleryResponse && galleryResponse.data) {
                homepageContent.gallery = galleryResponse.data.slice(0, 4);
            } else {
                homepageContent.gallery = [];
                showCustomMessage('Gagal memuat item galeri dari server.', 'error');
            }

            // Mengambil data rayon untuk statistik
            const rayonsDataResponse = await getAllRayons();
            if (rayonsDataResponse && rayonsDataResponse.data) {
                totalRayon = rayonsDataResponse.data.length;
                totalKader = rayonsDataResponse.data.reduce((sum, rayon) => sum + (rayon.cadre_count || 0), 0);
            } else {
                totalRayon = 0;
                totalKader = 0;
                showCustomMessage('Gagal memuat data statistik rayon dari server.', 'error');
            }

            // Mengambil notifikasi untuk pengguna yang login
            const authData = getAuthData();
            if (authData.isLoggedIn) {
                const notificationsResponse = await getNotifications();
                if (notificationsResponse && notificationsResponse.data) {
                    const unreadNotifications = notificationsResponse.data.filter(notif => !notif.is_read).length;
                    if (notificationBadgeDesktop) {
                        notificationBadgeDesktop.textContent = unreadNotifications;
                        notificationBadgeDesktop.classList.toggle('hidden', unreadNotifications === 0);
                        notificationBadgeDesktop.classList.toggle('active', unreadNotifications > 0);
                    }
                    if (notificationBadgeMobile) {
                        notificationBadgeMobile.textContent = unreadNotifications;
                        notificationBadgeMobile.classList.toggle('hidden', unreadNotifications === 0);
                        notificationBadgeMobile.classList.toggle('active', unreadNotifications > 0);
                    }
                    if (notificationButtonDesktop) notificationButtonDesktop.classList.remove('hidden');
                    if (notificationButtonMobile) notificationButtonMobile.classList.remove('hidden');
                } else {
                    if (notificationButtonDesktop) notificationButtonDesktop.classList.add('hidden');
                    if (notificationButtonMobile) notificationButtonMobile.classList.add('hidden');
                    showCustomMessage('Gagal memuat notifikasi dari server.', 'error');
                }
            } else {
                if (notificationButtonDesktop) notificationButtonDesktop.classList.add('hidden');
                if (notificationButtonMobile) notificationButtonMobile.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error loading dynamic homepage content:', error);
            showCustomMessage('Terjadi kesalahan fatal saat memuat konten dinamis.', 'error');

            homepageContent = {
                heroMainTitle: "Konten tidak dapat dimuat.",
                announcementText: "Tidak ada pengumuman.",
                aboutP1: "Informasi tidak tersedia."
            };
            siteSettings = {
                contact_email: 'info@example.com',
                contact_phone: 'N/A',
                site_address: 'Alamat tidak tersedia',
                instagram_url: '#', facebook_url: '#', twitter_url: '#', youtube_url: '#'
            };
            homepageContent.news = [];
            homepageContent.activities = [];
            homepageContent.gallery = [];
            totalRayon = 0;
            totalKader = 0;

            if (notificationButtonDesktop) notificationButtonDesktop.classList.add('hidden');
            if (notificationButtonMobile) notificationButtonMobile.classList.add('hidden');

        } finally {
            renderHomepageContent();
        }
    }

    /**
     * Render semua konten ke DOM.
     */
    function renderHomepageContent() {
        // Konten Hero
        if (heroMainTitleElement) {
            heroMainTitleElement.innerHTML = homepageContent.heroMainTitle;
        }

        // Bagian Pengumuman
        if (announcementSection) {
            getAnnouncements(false).then(response => {
                if (response && response.data && response.data.length > 0) {
                    const latestAnnouncement = response.data[0];
                    announcementSection.classList.remove('hidden');
                    announcementTextElement.innerHTML = latestAnnouncement.text_content + (latestAnnouncement.target_url ? ` <a href="${latestAnnouncement.target_url}" class="underline hover:text-white transition-colors">di sini</a>` : '');
                } else {
                    announcementSection.classList.remove('hidden');
                    announcementTextElement.innerHTML = homepageContent.announcementText;
                }
            }).catch(error => {
                console.error('Error fetching announcements:', error);
                announcementSection.classList.remove('hidden');
                announcementTextElement.innerHTML = homepageContent.announcementText;
            });
        }

        // Bagian Tentang Kami
        if (aboutP1Element) {
            aboutP1Element.textContent = homepageContent.aboutP1;
        }

        // Render Statistik
        // **PERBAIKAN LEBIH LANJUT:** Dibuat lebih defensif untuk mencegah error.
        const statistikSection = document.getElementById('statistik');
        if (statistikSection) {
            const rayonStatElement = statistikSection.querySelector('.animated-number:not([data-append-text])');
            if (rayonStatElement) {
                rayonStatElement.dataset.target = totalRayon;
            }

            const kaderStatElement = statistikSection.querySelector('.animated-number[data-append-text="+"]');
            if (kaderStatElement) {
                kaderStatElement.dataset.target = totalKader;
            }
            
            animateNumbersOnScroll();
        }


        // Render Berita & Artikel
        renderNews(homepageContent.news);
        // Render Kegiatan
        renderActivities(homepageContent.activities);
        // Render Galeri
        renderGallery(homepageContent.gallery);

        // Isi informasi kontak dari API
        if (contactAddressSpan) contactAddressSpan.textContent = siteSettings.site_address;
        if (contactEmailLink) {
            const email = siteSettings.contact_email;
            contactEmailLink.textContent = email;
            contactEmailLink.href = `mailto:${email}`;
        }
        if (contactPhoneSpan) contactPhoneSpan.textContent = siteSettings.contact_phone;

        // Render tautan media sosial dari API
        if (socialMediaLinksContainer) {
            socialMediaLinksContainer.innerHTML = '';
            getSocialMediaLinks(false).then(response => {
                const socialLinks = response && response.data ? response.data : [];

                if (socialLinks.length === 0) {
                    const socialPlatformsFallback = [
                        { url: siteSettings.instagram_url, icon: 'fab fa-instagram', label: 'Instagram PMII' },
                        { url: siteSettings.facebook_url, icon: 'fab fa-facebook-f', label: 'Facebook PMII' },
                        { url: siteSettings.twitter_url, icon: 'fab fa-twitter', label: 'Twitter PMII' },
                        { url: siteSettings.youtube_url, icon: 'fab fa-youtube', label: 'Youtube PMII' }
                    ];
                    socialPlatformsFallback.forEach(platform => {
                        if (platform.url && platform.url !== '#') {
                            const link = document.createElement('a');
                            link.href = platform.url;
                            link.target = "_blank";
                            link.setAttribute("aria-label", platform.label);
                            link.className = "text-2xl text-white hover:text-pmii-yellow transition-colors transform hover:scale-110";
                            link.innerHTML = `<i class="${platform.icon}"></i>`;
                            socialMediaLinksContainer.appendChild(link);
                        }
                    });
                } else {
                    socialLinks.forEach(linkData => {
                        if (linkData.is_active && linkData.url && linkData.url !== '#') {
                            const link = document.createElement('a');
                            link.href = linkData.url;
                            link.target = "_blank";
                            link.setAttribute("aria-label", `PMII ${linkData.platform}`);
                            let iconClass = '';
                            if (linkData.platform === 'instagram') iconClass = 'fab fa-instagram';
                            else if (linkData.platform === 'facebook') iconClass = 'fab fa-facebook-f';
                            else if (linkData.platform === 'twitter') iconClass = 'fab fa-twitter';
                            else if (linkData.platform === 'youtube') iconClass = 'fab fa-youtube';
                            
                            if (iconClass) {
                                link.className = "text-2xl text-white hover:text-pmii-yellow transition-colors transform hover:scale-110";
                                link.innerHTML = `<i class="${iconClass}"></i>`;
                                socialMediaLinksContainer.appendChild(link);
                            }
                        }
                    });
                }
            }).catch(error => {
                console.error('Error fetching social media links:', error);
                const socialPlatformsFallback = [
                    { url: siteSettings.instagram_url, icon: 'fab fa-instagram', label: 'Instagram PMII' },
                    { url: siteSettings.facebook_url, icon: 'fab fa-facebook-f', label: 'Facebook PMII' },
                    { url: siteSettings.twitter_url, icon: 'fab fa-twitter', label: 'Twitter PMII' },
                    { url: siteSettings.youtube_url, icon: 'fab fa-youtube', label: 'Youtube PMII' }
                ];
                socialPlatformsFallback.forEach(platform => {
                    if (platform.url && platform.url !== '#') {
                        const link = document.createElement('a');
                        link.href = platform.url;
                        link.target = "_blank";
                        link.setAttribute("aria-label", platform.label);
                        link.className = "text-2xl text-white hover:text-pmii-yellow transition-colors transform hover:scale-110";
                        link.innerHTML = `<i class="${platform.icon}"></i>`;
                        socialMediaLinksContainer.appendChild(link);
                    }
                });
            });
        }
    }

    /**
     * Render Berita & Artikel ke DOM.
     * @param {Array<Object>} newsData - Data berita untuk dirender.
     */
    function renderNews(newsData) {
        if (!newsContainer) return;

        newsContainer.innerHTML = '';
        
        if (newsData && newsData.length > 0) {
            newsData.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));

            newsData.slice(0, 3).forEach((item, index) => {
                const newsCard = `<div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover flex flex-col animated-section animate-card-entry stagger-${index + 1}">
                        <img src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';" alt="${item.title}" class="w-full h-56 object-cover">
                        <div class="p-6 flex flex-col flex-grow">
                            <span class="text-xs text-pmii-blue font-semibold bg-pmii-yellow/50 px-2.5 py-1 rounded-full self-start mb-2.5">${item.category}</span>
                            <h3 class="text-xl font-bold text-pmii-darkblue mb-3 leading-tight hover:text-pmii-yellow transition-colors">${item.title}</h3>
                            <p class="text-text-secondary text-sm mb-5 flex-grow line-clamp-3">${item.description}</p>
                            <a href="berita-artikel.php" class="font-semibold text-pmii-blue hover:text-pmii-yellow transition-colors self-start group text-sm">
                                Baca Selengkapnya <i class="fas fa-arrow-right text-xs ml-1 group-hover:translate-x-0.5 transition-transform"></i>
                            </a>
                        </div>
                    </div>`;
                newsContainer.innerHTML += newsCard;
            });
        } else {
            newsContainer.innerHTML = `<p class="text-gray-500 text-center py-8 col-span-full">Belum ada berita atau artikel terbaru yang ditampilkan.</p>`;
        }
    }

    /**
     * Render Kegiatan ke DOM.
     * @param {Array<Object>} activitiesData - Data kegiatan untuk dirender.
     */
    function renderActivities(activitiesData) {
        if (!activitiesContainer) return;

        activitiesContainer.innerHTML = '';
        
        if (activitiesData && activitiesData.length > 0) {
            activitiesData.sort((a, b) => {
                const dateA = new Date(a.activity_date);
                const dateB = new Date(b.activity_date);
                return dateA - dateB;
            });

            activitiesData.slice(0, 2).forEach((item, index) => {
                const activityDate = new Date(item.activity_date);
                const day = activityDate.getDate();
                const month = activityDate.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
                const year = activityDate.getFullYear();

                const activityCard = `
                    <div class="activity-card-enhanced flex items-center p-4 sm:p-6 mb-4 animated-section animate-card-entry stagger-${index + 1}">
                        <div class="activity-date-block-enhanced">
                            <p class="day">${day}</p>
                            <p class="month">${month}</p>
                            <p class="year">${year}</p>
                        </div>
                        <div class="activity-content-wrapper-enhanced flex-grow">
                            <h3 class="title text-lg font-semibold text-pmii-darkblue mb-2">${item.title}</h3>
                            <p class="activity-info-line flex items-center text-sm text-text-secondary mb-1"><i class="fas fa-clock mr-2 text-pmii-yellow"></i> ${item.activity_time}</p>
                            <p class="activity-info-line flex items-center text-sm text-text-secondary"><i class="fas fa-map-marker-alt mr-2 text-pmii-yellow"></i> ${item.location}</p>
                        </div>
                        <a href="agenda-kegiatan.php" class="activity-detail-button-enhanced whitespace-nowrap btn btn-primary-pmii btn-sm" target="_self">Detail Acara</a>
                    </div>`;
                activitiesContainer.innerHTML += activityCard;
            });
        } else {
            activitiesContainer.innerHTML = `<p class="text-gray-500 text-center py-8">Belum ada agenda kegiatan yang tersedia.</p>`;
        }
    }

    /**
     * Render Galeri ke DOM.
     * @param {Array<Object>} galleryData - Data galeri untuk dirender.
     */
    function renderGallery(galleryData) {
        if (!galleryContainer) return;

        galleryContainer.innerHTML = '';
        
        if (galleryData && galleryData.length > 0) {
            galleryData.slice(0, 4).forEach((item, index) => {
                const galleryItem = `
                    <a href="${item.image_url}" data-fancybox="gallery" data-caption="${item.caption}"
                       class="block rounded-lg overflow-hidden shadow-md group relative aspect-w-1 aspect-h-1 animated-section animate-card-entry stagger-${index + 1}">
                        <img src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/400x400/CCCCCC/333333?text=Image+Not+Found';" alt="${item.caption}"
                                     class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 ease-in-out">
                        <div class="absolute inset-0 bg-gradient-to-t from-pmii-blue/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <p class="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">${item.caption}</p>
                        </div>
                        <div class="absolute top-1.5 right-1.5 bg-pmii-yellow text-pmii-blue p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100 text-xs">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </a>`;
                galleryContainer.innerHTML += galleryItem;
            });
            Fancybox.bind("[data-fancybox]", { Thumbs: false, Toolbar: { display: { left: ["infobar"], middle: [], right: ["close"] } } });
        } else {
            galleryContainer.innerHTML = `<p class="text-gray-500 text-center py-8 col-span-full">Belum ada foto galeri yang ditampilkan.</p>`;
        }
    }

    // --- Event Listeners ---

    // Gulir halus untuk tautan navigasi internal
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Navbar sticky dan tombol gulir ke atas
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
    if (document.getElementById('tahun-footer-kader')) document.getElementById('tahun-footer-kader').textContent = new Date().getFullYear();

    // Fungsi untuk menganimasikan angka untuk bagian statistik
    function animateNumber(element, start, end, duration, appendText = '') {
        let startTime = null;
        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString('id-ID');
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString('id-ID') + appendText;
                element.dataset.animated = 'true';
            }
        };
        requestAnimationFrame(step);
    }

    // Fungsi untuk mengamati dan menganimasikan angka
    function animateNumbersOnScroll() {
        const statisticSection = document.getElementById('statistik');
        if (statisticSection) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.animated-number').forEach(numberElement => {
                            if (!numberElement.dataset.animated || numberElement.dataset.animated === 'false') {
                                const targetNumber = parseInt(numberElement.dataset.target);
                                const appendTextFromData = numberElement.dataset.appendText || '';
                                animateNumber(numberElement, 0, targetNumber, 1500, appendTextFromData);
                            }
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            observer.observe(statisticSection);
        }
    }


    // Intersection Observer untuk animasi bagian
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if(entry.target.id === 'news-container' || entry.target.id === 'gallery-container' || entry.target.id === 'activities-container') {
                    Array.from(entry.target.children).forEach((card, i) => {
                        if(card.classList.contains('animated-section') || card.classList.contains('animate-card-entry')) {
                            card.style.transitionDelay = `${i * 0.1}s`;
                            card.classList.add('is-visible');
                        }
                    });
                }
            } else {
                // entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.1 });

    // Amati semua bagian yang dianimasikan
    document.querySelectorAll('.animated-section').forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Contact Form Submission ---
    const formKontakPesan = document.getElementById('formKontakPesan');
    const contactFormResponseMessage = document.getElementById('contact-form-response-message');

    if (formKontakPesan) {
        formKontakPesan.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nama = document.getElementById('nama_kontak').value.trim();
            const email = document.getElementById('email_kontak').value.trim();
            const pesan = document.getElementById('pesan_kontak').value.trim();

            if (nama === '' || email === '' || pesan === '') {
                showCustomMessage('Harap isi semua kolom formulir.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, email, pesan })
                });
                const responseData = await response.json();

                if (response.ok) {
                    showCustomMessage(responseData.message || 'Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
                    formKontakPesan.reset();
                } else {
                    throw new Error(responseData.message || 'Gagal mengirim pesan kontak.');
                }
            } catch (error) {
                console.error('Error sending contact message:', error);
                showCustomMessage(error.message || 'Terjadi kesalahan saat mengirim pesan.', 'error');
            }
        });
    }

    // Event listener for notification buttons
    // Variabel ini sudah dideklarasikan di scope global di atas, jadi tidak perlu `const` lagi di sini.
    if (notificationButtonDesktop) {
        notificationButtonDesktop.addEventListener('click', () => {
            window.location.href = 'dashboard/kelola-notifikasi.php';
        });
    }
    if (notificationButtonMobile) {
        notificationButtonMobile.addEventListener('click', () => {
            window.location.href = 'dashboard/kelola-notifikasi.php';
        });
    }

    // Fungsi untuk menangani klik tombol autentikasi (Login/Logout)
    function handleAuthClick(e) {
        e.preventDefault();
        const action = e.target.dataset.action;

        if (action === 'login') {
            window.location.href = 'login.php';
        } else if (action === 'logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                handleLogout();
            }, () => {
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        }
    }

    // Panggil fungsi untuk memuat konten dinamis saat DOM siap
    loadHomepageDynamicContent();
    animateNumbersOnScroll();
});
