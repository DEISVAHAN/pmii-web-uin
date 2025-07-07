// public/js/laporan-analisis.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { generateReport, exportReport, getUsers, getSuratSubmissions, getScientificWorks, getApprovedNews, getApprovedActivities, getApprovedGalleryItems, getSystemActivityLogs } from './api.js'; // Impor API yang diperlukan

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

    // Fungsi global untuk pesan kustom
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

    // --- Logika Spesifik Halaman Laporan & Analisis ---
    const reportPeriodSelect = document.getElementById('reportPeriod');
    const customPeriodFields = document.getElementById('customPeriodFields');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const reportForm = document.getElementById('reportForm');
    const reportResultDiv = document.getElementById('reportResult');
    const reportTitleResult = document.getElementById('reportTitleResult');
    const reportContentDiv = document.getElementById('reportContent');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const formResponseContainer = document.getElementById('report-form-response'); // Elemen untuk pesan form

    let currentReportData = null; // Untuk menyimpan data laporan yang sedang ditampilkan/diekspor


    // --- Pemeriksaan Otentikasi dan Kontrol Akses Halaman ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses halaman ini
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
            return false;
        }

        // Jika pengguna memiliki akses, update UI header
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
        return true;
    }


    // Tampilkan/sembunyikan rentang kustom berdasarkan pilihan periode
    if (reportPeriodSelect) {
        reportPeriodSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customPeriodFields.classList.remove('hidden');
                startDateInput.setAttribute('required', 'true');
                endDateInput.setAttribute('required', 'true');
                updateLabelClass(startDateInput);
                updateLabelClass(endDateInput);
            } else {
                customPeriodFields.classList.add('hidden');
                startDateInput.removeAttribute('required');
                endDateInput.removeAttribute('required');
                startDateInput.value = '';
                endDateInput.value = '';
                updateLabelClass(startDateInput);
                updateLabelClass(endDateInput);
            }
        });
    }

    reportForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const reportType = document.getElementById('reportType').value;
        const reportPeriod = document.getElementById('reportPeriod').value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // Validasi input
        if (reportPeriod === 'custom') {
            if (!startDate || !endDate) {
                window.showCustomMessage('Tanggal mulai dan akhir harus diisi untuk rentang kustom.', 'error');
                return;
            }
            if (new Date(startDate) > new Date(endDate)) {
                window.showCustomMessage('Tanggal mulai tidak boleh lebih dari tanggal akhir.', 'error');
                return;
            }
        }

        try {
            window.showCustomMessage('Membuat laporan...', 'info');
            reportResultDiv.classList.add('hidden'); // Sembunyikan hasil lama
            reportContentDiv.innerHTML = '<p class="text-text-muted">Memuat laporan...</p>'; // Tampilkan loading

            const filters = {
                period: reportPeriod,
                start_date: startDate,
                end_date: endDate
            };

            const response = await generateReport(reportType, filters); // Panggil API generateReport
            
            if (response && response.success && response.data) {
                currentReportData = response.data;
                renderReport(reportType, currentReportData); // Render laporan dengan data dari API
                reportResultDiv.classList.remove('hidden');
                window.showCustomMessage('Laporan berhasil dibuat!', 'success');
            } else {
                currentReportData = null; // Clear data if report generation failed
                reportResultDiv.classList.add('hidden');
                window.showCustomMessage(response.message || 'Gagal membuat laporan.', 'error');
            }
        } catch (error) {
            console.error("Error generating report:", error);
            currentReportData = null;
            reportResultDiv.classList.add('hidden');
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat membuat laporan.', 'error');
        }
    });

    function renderReport(reportType, data) {
        let title = '';
        let contentHtml = '';

        const reportTypeMap = {
            'kader': 'Data Kader',
            'surat': 'Pengajuan Surat',
            'karya-ilmiah': 'Karya Ilmiah',
            'berita': 'Berita & Artikel',
            'kegiatan': 'Kegiatan',
            'galeri': 'Galeri',
            'aktivitas-sistem': 'Aktivitas Sistem'
        };
        title = reportTypeMap[reportType] || 'Laporan';
        reportTitleResult.textContent = title;
        reportContentDiv.innerHTML = ''; // Clear previous content

        if (!data || data.length === 0) {
            reportContentDiv.innerHTML = '<p class="text-text-muted">Tidak ada data untuk periode yang dipilih.</p>';
            return;
        }

        // Render detailed report based on type
        // This part needs to map API response fields to display fields
        switch (reportType) {
            case 'kader':
                const totalKader = data.length;
                const kaderAktif = data.filter(k => k.status === 'aktif').length; // Assuming 'status' field
                const klasifikasiCounts = data.reduce((acc, k) => {
                    if (k.cadre_level && k.cadre_level !== '-') { // Assuming 'cadre_level' field
                        acc[k.cadre_level] = (acc[k.cadre_level] || 0) + 1;
                    }
                    return acc;
                }, {});
                let klasifikasiHtml = Object.entries(klasifikasiCounts).map(([klas, count]) => `
                    <div class="report-item">
                        <span><i class="fas fa-graduation-cap"></i> ${klas}</span>
                        <span>${count}</span>
                    </div>`).join('');

                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Data Kader</h4>
                        <div class="report-item">
                            <span><i class="fas fa-users"></i> Total Kader Ditemukan</span>
                            <span>${totalKader}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-user-check"></i> Kader Aktif</span>
                            <span>${kaderAktif}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Distribusi Klasifikasi Kader</h4>
                        ${klasifikasiHtml || '<p class="text-text-muted text-sm">Tidak ada data klasifikasi.</p>'}
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Kader</h4>
                        <div class="space-y-2">${data.map(k => `
                            <div class="report-item">
                                <span><i class="fas fa-user"></i> ${k.full_name || k.name} (${k.nim || k.username})</span>
                                <span>${k.rayon_name || k.rayon} - ${k.status}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'surat':
                const totalSurat = data.length;
                const disetujui = data.filter(s => s.status === 'approved').length; // Assuming 'status' field
                const diajukan = data.filter(s => s.status === 'pending').length;
                const ditolak = data.filter(s => s.status === 'rejected').length;

                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Pengajuan Surat</h4>
                        <div class="report-item">
                            <span><i class="fas fa-envelope-open-text"></i> Total Surat Ditemukan</span>
                            <span>${totalSurat}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-check-circle text-green-500"></i> Disetujui</span>
                            <span>${disetujui}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-hourglass-half text-yellow-500"></i> Diajukan</span>
                            <span>${diajukan}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-times-circle text-red-500"></i> Ditolak</span>
                            <span>${ditolak}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Pengajuan Surat</h4>
                        <div class="space-y-2">${data.map(s => `
                            <div class="report-item">
                                <span><i class="fas fa-file-alt"></i> ${s.type || s.jenis} (${s.sender_name || s.pengaju})</span>
                                <span>${s.status} pada ${new Date(s.submission_date).toLocaleDateString('id-ID')}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'karya-ilmiah':
                const totalKarya = data.length;
                const tipeKaryaCounts = data.reduce((acc, k) => {
                    if (k.type) { // Assuming 'type' field
                        acc[k.type] = (acc[k.type] || 0) + 1;
                    }
                    return acc;
                }, {});
                let tipeKaryaHtml = Object.entries(tipeKaryaCounts).map(([tipe, count]) => `
                    <div class="report-item">
                        <span><i class="fas fa-tag"></i> ${tipe}</span>
                        <span>${count}</span>
                    </div>`).join('');

                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Karya Ilmiah</h4>
                        <div class="report-item">
                            <span><i class="fas fa-book-open"></i> Total Karya Ilmiah Ditemukan</span>
                            <span>${totalKarya}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Distribusi Tipe Karya</h4>
                        ${tipeKaryaHtml || '<p class="text-text-muted text-sm">Tidak ada data tipe karya.</p>'}
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Karya Ilmiah</h4>
                        <div class="space-y-2">${data.map(k => `
                            <div class="report-item">
                                <span><i class="fas fa-file-pdf"></i> ${k.title}</span>
                                <span>Oleh ${k.author_name} (${k.type})</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'berita':
                const totalBerita = data.length;
                const diterbitkan = data.filter(b => b.status === 'approved').length;
                const menungguVerifikasi = data.filter(b => b.status === 'pending').length;
                const draf = data.filter(b => b.status === 'draft').length;

                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Berita & Artikel</h4>
                        <div class="report-item">
                            <span><i class="fas fa-newspaper"></i> Total Berita & Artikel Ditemukan</span>
                            <span>${totalBerita}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-check"></i> Diterbitkan</span>
                            <span>${diterbitkan}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-clock"></i> Menunggu Verifikasi</span>
                            <span>${menungguVerifikasi}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-pencil-alt"></i> Draf</span>
                            <span>${draf}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Berita & Artikel</h4>
                        <div class="space-y-2">${data.map(b => `
                            <div class="report-item">
                                <span><i class="fas fa-heading"></i> ${b.title}</span>
                                <span>${b.category} - ${b.status}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'kegiatan':
                const totalKegiatan = data.length;
                const terlaksana = data.filter(k => k.status === 'completed').length;
                const mendatang = data.filter(k => k.status === 'upcoming').length;
                const dibatalkan = data.filter(k => k.status === 'cancelled').length;

                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Kegiatan</h4>
                        <div class="report-item">
                            <span><i class="fas fa-calendar-alt"></i> Total Kegiatan Ditemukan</span>
                            <span>${totalKegiatan}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-check-double"></i> Terlaksana</span>
                            <span>${terlaksana}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-clock"></i> Mendatang</span>
                            <span>${mendatang}</span>
                        </div>
                        <div class="report-item">
                            <span><i class="fas fa-ban"></i> Dibatalkan</span>
                            <span>${dibatalkan}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Kegiatan</h4>
                        <div class="space-y-2">${data.map(k => `
                            <div class="report-item">
                                <span><i class="fas fa-calendar-day"></i> ${k.title}</span>
                                <span>${k.type} - ${k.status}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'galeri':
                const totalGaleri = data.length;
                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Galeri</h4>
                        <div class="report-item">
                            <span><i class="fas fa-images"></i> Total Item Galeri Ditemukan</span>
                            <span>${totalGaleri}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Galeri</h4>
                        <div class="space-y-2">${data.map(g => `
                            <div class="report-item">
                                <span><i class="fas fa-camera-retro"></i> ${g.caption}</span>
                                <span>Kegiatan: ${g.activity_related}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'aktivitas-sistem':
                const totalAktivitas = data.length;
                let activityListHtml = data.map(act => `
                    <div class="report-item">
                        <span><i class="fas fa-clipboard-list"></i> ${act.action_type || act.activity} (${act.user_name || act.user})</span>
                        <span>${new Date(act.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                `).join('');
                contentHtml = `
                    <div class="report-section">
                        <h4>Ringkasan Aktivitas Sistem</h4>
                        <div class="report-item">
                            <span><i class="fas fa-cogs"></i> Total Aktivitas Ditemukan</span>
                            <span>${totalAktivitas}</span>
                        </div>
                    </div>
                    <div class="report-section mt-4">
                        <h4>Detail Aktivitas</h4>
                        ${activityListHtml || '<p class="text-text-muted text-sm">Tidak ada aktivitas ditemukan.</p>'}
                    </div>
                `;
                break;
            default:
                contentHtml = '<p class="text-text-muted">Pilih jenis laporan untuk melihat hasilnya.</p>';
                break;
        }
        reportContentDiv.innerHTML = contentHtml;
    }

    exportReportBtn?.addEventListener('click', async function() { // Tambahkan async
        if (!currentReportData || currentReportData.length === 0) {
            window.showCustomMessage('Tidak ada laporan untuk diekspor.', 'error');
            return;
        }

        const reportType = document.getElementById('reportType').value;
        const reportTypeName = document.getElementById('reportType').options[document.getElementById('reportType').selectedIndex].text;
        const reportPeriodName = document.getElementById('reportPeriod').options[document.getElementById('reportPeriod').selectedIndex].text;
        const fileName = `laporan_${reportType}_${reportPeriodName.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;

        try {
            // Panggil API exportReport, jika ada. Asumsi API ini mengembalikan CSV secara langsung atau link download.
            // Jika API mengembalikan data CSV langsung dalam response.data.csvContent
            // const response = await exportReport(reportType, {
            //     period: document.getElementById('reportPeriod').value,
            //     start_date: startDateInput.value,
            //     end_date: endDateInput.value
            // });

            // if (response && response.success && response.data && response.data.csv_content) {
            //     const encodedUri = encodeURI("data:text/csv;charset=utf-8," + response.data.csv_content);
            //     const link = document.createElement("a");
            //     link.setAttribute("href", encodedUri);
            //     link.setAttribute("download", fileName);
            //     document.body.appendChild(link);
            //     link.click();
            //     document.body.removeChild(link);
            //     window.showCustomMessage(`Laporan "${reportTypeName}" berhasil diekspor sebagai CSV.`, 'success');
            // } else {
            //     throw new Error(response.message || "Gagal mengekspor laporan dari API.");
            // }

            // FALLBACK LOKAL KE CSV DARI currentReportData jika tidak ada API exportReport
            let csvContent = "data:text/csv;charset=utf-8,";

            // Headers
            const headers = Object.keys(currentReportData[0]).join(',');
            csvContent += headers + "\r\n";

            // Data rows
            currentReportData.forEach(row => {
                const rowValues = Object.values(row).map(val => {
                    // Handle potential commas or newlines in data by enclosing in quotes
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',');
                csvContent += rowValues + "\r\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.showCustomMessage(`Laporan "${reportTypeName}" berhasil diekspor sebagai CSV.`, 'success');

        } catch (error) {
            console.error("Error exporting report:", error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengekspor laporan.', 'error');
        }
    });


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
    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
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

    // --- INITIALIZATION ---
    const pageCanContinue = await initializePageAccess();

    if (pageCanContinue) {
        // Setel tahun di footer
        document.getElementById('tahun-footer').textContent = new Date().getFullYear();

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        window.addEventListener('scroll', () => {
            if (scrollToTopBtn) {
                if (window.pageYOffset > 200) {
                    scrollToTopBtn.classList.remove('hidden');
                    scrollToTopBtn.classList.add('flex');
                } else {
                    scrollToTopBtn.classList.add('hidden');
                    scrollToTopBtn.classList.remove('flex');
                }
            }
        });
        if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});