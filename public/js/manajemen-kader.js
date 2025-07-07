// public/js/manajemen-kader.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getUsers, createUser, updateUser, deleteUser, getAllRayons, getSystemActivityLogs } from './api.js'; // Mengimpor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allKaderData = []; // Akan menampung semua data kader dari API
    let allRayons = []; // Akan menampung semua data rayon dari API

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile, // Pastikan mobileAuthLink juga disertakan
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Elemen DOM spesifik untuk halaman manajemen kader
    const adminNamePlaceholderContent = document.getElementById('admin-name-placeholder-content');
    const rayonNameTablePlaceholderContent = document.getElementById('rayon-name-placeholder-table-content');
    const fakultasKaderInput = document.getElementById('fakultas_kader');
    const jurusanKaderInput = document.getElementById('jurusan_kader');
    const rayonKaderInput = document.getElementById('rayon_kader');
    const komisariatKaderInput = document.getElementById('komisariat_kader');
    const statistikKaderSection = document.getElementById('statistik-kader-section');
    const additionalStatsSection = document.getElementById('additional-stats-section');
    const infoStatistik = document.getElementById('infoStatistik');
    const scopeStatistik = document.getElementById('scopeStatistik');
    const filterWaktuStatistik = document.getElementById('filterWaktuStatistik');

    // Address input fields
    const provinsiKaderInput = document.getElementById('provinsi_kader');
    const kotaKabupatenKaderInput = document.getElementById('kota_kabupaten_kader');
    const kecamatanKaderInput = document.getElementById('kecamatan_kader');
    const desaKelurahanKaderInput = document.getElementById('desa_kelurahan_kader');
    const kampungKomplekPerumahanKaderInput = document.getElementById('kampung_komplek_perumahan_kader');
    const rtKaderInput = document.getElementById('rt_kader');
    const rwKaderInput = document.getElementById('rw_kader');

    // Other form fields
    const emailKaderInput = document.getElementById('email_kader');
    const nomorHpWhatsappKaderInput = document.getElementById('nomor_hp_whatsapp_kader');
    const nimKaderInput = document.getElementById('nim_kader');
    const nikKaderInput = document.getElementById('nik_kader');
    const jenisKelaminKaderInput = document.getElementById('jenis_kelamin_kader');
    const ipkKaderInput = document.getElementById('ipk_kader');
    const minatBakatKaderInput = document.getElementById('minat_bakat_kader');
    const angkatanKaderInput = document.getElementById('angkatan_kader');
    const klasifikasiKaderInput = document.getElementById('klasifikasi_kader');
    const namaKaderInput = document.getElementById('nama_kader');

    // Chart instances
    let klasifikasiKaderChart = null;
    let genderChart = null;

    // Numerical statistic elements
    const totalKaderCountEl = document.getElementById('totalKaderCount');
    const kaderMutaqidCountEl = document.getElementById('kaderMutaqidCount');
    const kaderMujahidCountEl = document.getElementById('kaderMujahidCount');
    const kaderMujtahidCountEl = document.getElementById('kaderMujtahidCount');
    const kaderMuharikCountEl = document.getElementById('kaderMuharikCount');
    const averageIpkStatEl = document.getElementById('averageIpkStat');
    const addressListEl = document.getElementById('addressList');

    // HTML forms and elements
    const formInputKader = document.getElementById('formInputKader');
    const submitButton = formInputKader ? formInputKader.querySelector('button[type="submit"]') : null;
    const tabelDataKader = document.getElementById('tabelDataKader');
    const searchKaderRayon = document.getElementById('searchKaderRayon');
    const filterAngkatanRayon = document.getElementById('filterAngkatanRayon');
    const downloadTemplateLink = document.getElementById('downloadTemplateLink');
    const formUploadExcel = document.getElementById('formUploadExcel');
    const fileExcelKaderInput = document.getElementById('file_excel_kader');

    let editingKaderId = null; // Tracks current editing kader ID

    // --- Static/Pre-defined Data (These might also come from API if dynamic) ---
    // In a real application, these might be loaded from a separate config API endpoint.
    const facultiesData = {
        "Ushuluddin": {
            jurusan: ["Ilmu al‑Qur’an dan Tafsir", "Aqidah dan Filsafat Islam", "Studi Agama‑Agama", "Tasawuf dan Psikoterapi", "Ilmu Hadis"],
            rayon: ["PMII Rayon Fakultas Ushuluddin"]
        },
        "Tarbiyah dan Keguruan": {
            jurusan: ["Pendidikan Agama Islam", "Pendidikan Bahasa Arab", "Pendidikan Bahasa Inggris", "Pendidikan Matematika", "Pendidikan Biologi", "Pendidikan Kimia", "Pendidikan Fisika", "Pendidikan Guru Madrasah Ibtidaiyah", "Pendidikan Islam Anak Usia Dini", "Manajemen Pendidikan Islam", "Tadris Bahasa Indonesia"],
            rayon: ["PMII Rayon Fakultas Tarbiyah dan Keguruan"]
        },
        "Syariah dan Hukum": {
            jurusan: ["Hukum Keluarga (Ahwal al‑Syakhshiyyah)", "Hukum Ekonomi Syariah (Muamalah)", "Hukum Tata Negara (Siyasah)", "Perbandingan Mazhab", "Ilmu Hukum", "Hukum Pidana Islam"],
            rayon: ["PMII Rayon Fakultas Syariah dan Hukum"]
        },
        "Dakwah dan Komunikasi": {
            jurusan: ["Komunikasi dan Penyiaran Islam", "Bimbingan dan Konseling Islam", "Manajemen Dakwah", "Pengembangan Masyarakat Islam", "Jurnalistik", "Hubungan Masyarakat (Humas)"],
            rayon: ["PMII Rayon Fakultas Dakwah dan Komunikasi"]
        },
        "Adab dan Humaniora": {
            jurusan: ["Sejarah Peradaban Islam", "Bahasa dan Sastra Arab", "Sastra Inggris", "Ilmu Perpustakaan dan Informasi Islam"],
            rayon: ["PMII Rayon Fakultas Adab dan Humaniora"]
        },
        "Sains dan Teknologi": {
            jurusan: ["Matematika", "Biologi", "Fisika", "Kimia", "Teknik Informatika", "Agroteknologi", "Teknik Elektro"],
            rayon: ["PMII Rayon Fakultas Sains dan Teknologi"]
        },
        "Psikologi": {
            jurusan: ["Psikologi"],
            rayon: ["PMII Rayon Fakultas Psikologi"]
        },
        "Ilmu Sosial dan Ilmu Politik": {
            jurusan: ["Administrasi Publik", "Sosiologi", "Ilmu Politik"],
            rayon: ["PMII Rayon Fakultas Ilmu Sosial dan Ilmu Politik"]
        },
        "Ekonomi dan Bisnis Islam": {
            jurusan: ["Akuntansi Syariah", "Ekonomi Syariah", "Manajemen", "Manajemen Keuangan Syariah"],
            rayon: ["PMII Rayon Fakultas Ekonomi dan Bisnis Islam"]
        }
    };

    const indonesianProvinces = [
        "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan",
        "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta",
        "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
        "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
        "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
        "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
        "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah",
        "Papua Pegunungan", "Papua Barat Daya"
    ];

    // --- UTILITY FUNCTIONS ---

    // Function to populate dropdowns (e.g., Provinces, Faculties)
    function populateDropdown(selectElement, options, selectedValue = '') {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value="" disabled selected></option>';
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            if (optionText === selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
        updateLabelClass(selectElement); // Update floating label
    }

    // Populate Province dropdown
    function populateProvincesDropdown() {
        populateDropdown(provinsiKaderInput, indonesianProvinces);
    }

    // Populate Faculties dropdown
    function populateFacultiesDropdown() {
        populateDropdown(fakultasKaderInput, Object.keys(facultiesData));
    }

    // Populate Jurusan dropdown based on selected Fakultas
    function populateJurusanDropdown(selectedFakultas, selectedValue = '') {
        if (!jurusanKaderInput) return;
        jurusanKaderInput.innerHTML = '<option value="" disabled selected></option>';
        if (selectedFakultas && facultiesData[selectedFakultas]) {
            populateDropdown(jurusanKaderInput, facultiesData[selectedFakultas].jurusan, selectedValue);
        } else {
            updateLabelClass(jurusanKaderInput); // Clear label if no faculty selected
        }
    }

    // Populate Rayon dropdown based on selected Fakultas
    async function populateRayonDropdown(selectedFakultas, selectedValue = '') {
        if (!rayonKaderInput) return;
        rayonKaderInput.innerHTML = '<option value="" disabled selected></option>';
        // Fetch real rayon data, then filter by faculty (if faculty info is part of rayon data)
        try {
            const rayonsResponse = await getAllRayons();
            if (rayonsResponse && rayonsResponse.data) {
                let filteredRayons = rayonsResponse.data;
                if (selectedFakultas && facultiesData[selectedFakultas]) {
                    // Filter based on the rayon name that belongs to the selected faculty
                    const facultyRayonName = facultiesData[selectedFakultas].rayon[0]; // Assuming one rayon per faculty for simplicity
                    filteredRayons = filteredRayons.filter(r => r.name === facultyRayonName);
                }
                
                populateDropdown(rayonKaderInput, filteredRayons.map(r => r.name), selectedValue);
            }
        } catch (error) {
            console.error("Error fetching rayons for dropdown:", error);
            window.showCustomMessage('Gagal memuat daftar rayon.', 'error');
        }
        updateLabelClass(rayonKaderInput); // Update floating label
    }

    // Initial populating of all static dropdowns
    populateProvincesDropdown();
    populateFacultiesDropdown();

    // Event listener for Fakultas change
    if (fakultasKaderInput) {
        fakultasKaderInput.addEventListener('change', function() {
            const selectedFakultas = this.value;
            populateJurusanDropdown(selectedFakultas);
            populateRayonDropdown(selectedFakultas); // Populate Rayon based on selected Faculty
        });
    }

    // Floating label logic (adapted from previous files)
    const allFormInputs = document.querySelectorAll('.form-input-modern');
    allFormInputs.forEach(input => {
        const label = input.nextElementSibling;
        const updateLabel = () => {
            if (label && label.classList.contains('form-label-modern')) {
                // For file inputs, also check if a file is selected
                if (input.type === 'file') {
                    if (input.files.length > 0) {
                        input.classList.add('has-value');
                    } else {
                        input.classList.remove('has-value');
                    }
                } else if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
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

    // --- AUTHENTICATION & UI SETUP (from previous files) ---
    async function updateManajemenKaderUI() { // Added async
        const allowedRolesForThisPage = ['rayon', 'komisariat']; // Admin Rayon dan Komisariat
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

        if (hasAccess) {
            const adminDisplayName = loggedInUser.nama || 'Admin';
            if (adminNamePlaceholderContent) adminNamePlaceholderContent.textContent = adminDisplayName;

            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
            }

            // Tampilkan/sembunyikan form input kader massal dan daftar kader berdasarkan peran
            const makalahFormSection = document.getElementById('formInputKader').closest('.form-section-modern');
            const formUploadExcelSection = document.getElementById('formUploadExcel').closest('.form-section-modern');
            const rayonInputGroup = document.getElementById('rayon-input-group');
            const filterRayonContainer = document.getElementById('filter-rayon-container');


            if (loggedInUser.role === 'komisariat') {
                if (makalahFormSection) makalahFormSection.classList.remove('hidden'); // Komisariat bisa menambah/edit kader
                if (formUploadExcelSection) formUploadExcelSection.classList.remove('hidden'); // Komisariat bisa unggah massal
                if (filterRayonContainer) filterRayonContainer.classList.remove('hidden'); // Komisariat bisa filter per rayon
                if (rayonInputGroup) rayonInputGroup.classList.remove('hidden'); // Pastikan Rayon input terlihat
            } else if (loggedInUser.role === 'rayon') {
                if (makalahFormSection) makalahFormSection.classList.remove('hidden'); // Rayon bisa menambah/edit kader
                if (formUploadExcelSection) formUploadExcelSection.classList.add('hidden'); // Rayon tidak bisa unggah massal
                if (filterRayonContainer) filterRayonContainer.classList.add('hidden'); // Rayon hanya melihat rayonnya sendiri
                if (rayonInputGroup) rayonInputGroup.classList.remove('hidden'); // Pastikan Rayon input terlihat
                // Pre-fill and disable Rayon input for Rayon admin
                if(rayonKaderInput) {
                    const currentRayon = allRayons.find(r => r.id === loggedInUser.rayon_id); // Get rayon object from API data
                    if(currentRayon) {
                        rayonKaderInput.value = currentRayon.name;
                        rayonKaderInput.disabled = true;
                        rayonKaderInput.classList.add('has-value');
                        // Set value for fakultas and jurusan based on rayon's faculty (assuming 1-to-1 mapping or lookup)
                        const facultyName = Object.keys(facultiesData).find(f => facultiesData[f].rayon.includes(currentRayon.name));
                        if(facultyName && fakultasKaderInput) {
                            fakultasKaderInput.value = facultyName;
                            fakultasKaderInput.disabled = false; // Rayon admin CAN change faculty/major
                            fakultasKaderInput.classList.add('has-value');
                            populateJurusanDropdown(facultyName); // Populate jurusan for this faculty
                        }
                    }
                }
            } else { // Jika bukan komisariat atau rayon
                if (makalahFormSection) makalahFormSection.classList.add('hidden');
                if (formUploadExcelSection) formUploadExcelSection.classList.add('hidden');
                if (filterRayonContainer) filterRayonContainer.classList.add('hidden');
                if (rayonInputGroup) rayonInputGroup.classList.add('hidden');
            }

            // Update placeholder for table based on role
            if (rayonNameTablePlaceholderContent) {
                rayonNameTablePlaceholderContent.textContent = loggedInUser.role === 'komisariat' ? 'Semua Rayon' : (loggedInUser.rayon_name || 'Rayon Anda');
            }
            if (scopeStatistik) {
                scopeStatistik.textContent = loggedInUser.role === 'komisariat' ? 'Seluruh Rayon' : (loggedInUser.rayon_name || 'Rayon Anda');
            }
        } else {
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


    // --- CRUD OPERATIONS (API-BASED) ---

    // Function to load all kader data from API
    async function loadAllKaderData() {
        if (!tabelDataKader) return;
        tabelDataKader.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-text-muted">Memuat data kader...</td></tr>';
        try {
            const response = await getUsers(); // Asumsi getUsers mengembalikan semua pengguna
            if (response && response.data) {
                // Filter hanya role 'kader' untuk halaman ini
                allUsers = response.data; // Simpan semua user untuk referensi
                allKaderData = response.data.filter(user => user.role === 'kader');
                // Map data API ke format yang diharapkan oleh frontend
                allKaderData = allKaderData.map(kader => ({
                    id: kader.user_id, // Gunakan user_id sebagai ID
                    nama: kader.full_name || kader.name,
                    nim: kader.nim || kader.username, // NIM atau Username
                    nik: kader.nik,
                    email: kader.email,
                    nomor_hp_whatsapp: kader.phone_number,
                    provinsi: kader.address_province,
                    kota_kabupaten: kader.address_city,
                    kecamatan: kader.address_district,
                    desa_kelurahan: kader.address_village,
                    kampung_komplek_perumahan: kader.address_street,
                    rt: kader.address_rt,
                    rw: kader.address_rw,
                    jenis_kelamin: kader.gender,
                    fakultas: kader.faculty,
                    jurusan: kader.major,
                    ipk: kader.ipk,
                    minat_bakat: kader.skills_interests,
                    angkatan: kader.entry_year_university, // Asumsi angkatan adalah tahun masuk universitas
                    rayon_id: kader.rayon_id, // ID rayon
                    rayon_name: kader.rayon_name, // Nama rayon
                    komisariat: kader.komisariat || "PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung",
                    klasifikasi: kader.cadre_level,
                    tanggal_input: kader.created_at ? new Date(kader.created_at).toISOString().slice(0, 10) : ''
                }));

                renderKaderTable(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon); // Render tabel
                updateAndRenderStats(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon, filterWaktuStatistik.value); // Perbarui statistik
                updateAndRenderAdditionalStats(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon); // Perbarui statistik tambahan
            } else {
                window.showCustomMessage("Gagal memuat daftar akun dari server.", "error");
                if (tabelDataKader) tabelDataKader.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-text-muted">Tidak ada data kader.</td></tr>`;
            }
        } catch (error) {
            console.error("Error loading kader data:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat data kader.", "error");
            if (tabelDataKader) tabelDataKader.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-text-muted">Gagal memuat data. ${error.message}</td></tr>`;
        }
    }


    // Function to render accounts in the table
    function renderKaderTable(kaderList, role, userRayonName) {
        const tabelBody = document.getElementById('tabelDataKader');
        if (!tabelBody) return;
        tabelBody.innerHTML = '';

        let filteredKader = kaderList;
        // Filter data untuk Admin Rayon
        if (role === 'rayon') {
            filteredKader = kaderList.filter(kader => kader.rayon_name === userRayonName);
        }

        const searchTerm = searchKaderRayon ? searchKaderRayon.value.toLowerCase() : '';
        const selectedAngkatan = filterAngkatanRayon ? filterAngkatanRayon.value : '';

        // Terapkan filter pencarian dan angkatan
        filteredKader = filteredKader.filter(kader => {
            const matchesSearch = (kader.nama && kader.nama.toLowerCase().includes(searchTerm)) || (kader.nim && kader.nim.includes(searchTerm));
            const matchesAngkatan = selectedAngkatan ? (kader.angkatan ? kader.angkatan.toString() === selectedAngkatan : false) : true;
            return matchesSearch && matchesAngkatan;
        });


        if (filteredKader.length === 0) {
            tabelBody.innerHTML = '<tr><td colspan="8" class="py-8 text-center text-text-muted">Tidak ada data kader yang sesuai.</td></tr>';
            return;
        }

        // Isi baris tabel
        filteredKader.forEach(kader => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>${kader.nama}</td>
                <td>${kader.nim}</td>
                <td>${kader.jenis_kelamin || 'N/A'}</td>
                <td>${kader.email || 'N/A'}</td>
                <td>${kader.nomor_hp_whatsapp || 'N/A'}</td>
                <td>${kader.rayon_name || kader.rayon || 'N/A'}</td>
                <td>${kader.klasifikasi || 'N/A'}</td>
                <td class="text-right action-links">
                    <button title="Edit" class="action-icon edit-kader-btn" data-id="${kader.id}"><i class="fas fa-edit"></i></button>
                    <button title="Hapus" class="action-icon delete-kader-btn" data-id="${kader.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tabelBody.appendChild(row);
        });

        // Add event listeners AFTER rendering rows
        tabelBody.querySelectorAll('.edit-kader-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const kaderId = this.dataset.id;
                editKader(kaderId);
            });
        });

        tabelBody.querySelectorAll('.delete-kader-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const kaderId = this.dataset.id;
                deleteKader(kaderId);
            });
        });
    }

    // Event listener for search and filter table
    if (searchKaderRayon) {
        searchKaderRayon.addEventListener('input', () => {
            if(loggedInUser) renderKaderTable(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon);
        });
    }
    if (filterAngkatanRayon) {
        filterAngkatanRayon.addEventListener('change', () => {
            if(loggedInUser) renderKaderTable(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon);
        });
    }

    // --- FORM SUBMISSION (ADD/EDIT KADER) ---
    async function editKader(kaderId) {
        const kaderToEdit = allKaderData.find(k => k.id === kaderId);
        if (!kaderToEdit) {
            window.showCustomMessage('Data kader tidak ditemukan.', 'error');
            return;
        }

        editingKaderId = kaderId;
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Perbarui Data Kader';
        }

        // Fill form fields with data from API
        namaKaderInput.value = kaderToEdit.nama;
        nimKaderInput.value = kaderToEdit.nim;
        nikKaderInput.value = kaderToEdit.nik || '';
        jenisKelaminKaderInput.value = kaderToEdit.jenis_kelamin || '';
        emailKaderInput.value = kaderToEdit.email || '';
        nomorHpWhatsappKaderInput.value = kaderToEdit.nomor_hp_whatsapp || '';

        populateDropdown(provinsiKaderInput, indonesianProvinces, kaderToEdit.provinsi);
        kotaKabupatenKaderInput.value = kaderToEdit.kota_kabupaten || '';
        kecamatanKaderInput.value = kaderToEdit.kecamatan || '';
        desaKelurahanKaderInput.value = kaderToEdit.desa_kelurahan || '';
        kampungKomplekPerumahanKaderInput.value = kaderToEdit.kampung_komplek_perumahan || '';
        rtKaderInput.value = kaderToEdit.rt || '';
        rwKaderInput.value = kaderToEdit.rw || '';

        populateFacultiesDropdown(); // Repopulate to ensure all options are there
        fakultasKaderInput.value = kaderToEdit.fakultas || '';
        populateJurusanDropdown(kaderToEdit.fakultas, kaderToEdit.jurusan); // Populate jurusan based on faculty
        populateRayonDropdown(kaderToEdit.fakultas, kaderToEdit.rayon_name); // Populate rayon based on faculty
        
        ipkKaderInput.value = kaderToEdit.ipk || '';
        minatBakatKaderInput.value = kaderToEdit.minat_bakat || '';
        angkatanKaderInput.value = kaderToEdit.angkatan || '';
        klasifikasiKaderInput.value = kaderToEdit.klasifikasi || '';
        komisariatKaderInput.value = kaderToEdit.komisariat || "PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung";

        // Handle role-specific fields for Rayon Admin
        if (loggedInUser.role === 'rayon') {
            nimKaderInput.disabled = true; // Disable NIM for edit if it's already set and admin rayon
            nimKaderInput.classList.add('disabled');
            rayonKaderInput.disabled = true; // Disable rayon input for Rayon admin
            rayonKaderInput.classList.add('disabled');
            fakultasKaderInput.disabled = false; // Enable faculty for Rayon admin
            fakultasKaderInput.classList.remove('disabled');
        } else { // Komisariat or other
            nimKaderInput.disabled = false;
            nimKaderInput.classList.remove('disabled');
            rayonKaderInput.disabled = false;
            rayonKaderInput.classList.remove('disabled');
            fakultasKaderInput.disabled = false;
            fakultasKaderInput.classList.remove('disabled');
        }
        
        // Always disable komisariat_kader
        komisariatKaderInput.disabled = true;
        komisariatKaderInput.classList.add('disabled');

        // Update floating labels after populating form
        allFormInputs.forEach(input => {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
        
        formInputKader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function deleteKader(kaderId) {
        window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data kader ini? Aksi ini tidak dapat dibatalkan.', async () => {
            try {
                // Asumsi API endpoint deleteUser dapat menghapus kader berdasarkan user_id
                const response = await deleteUser(kaderId);
                if (response && response.success) {
                    window.showCustomMessage('Data kader berhasil dihapus.', 'success');
                    await loadAllKaderData(); // Muat ulang data setelah penghapusan
                } else {
                    throw new Error(response.message || 'Gagal menghapus data kader.');
                }
            } catch (error) {
                console.error("Error deleting kader:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus data kader.', 'error');
            }
        });
    }

    // Reset Form
    function resetFormAndSubmitButton() {
        formInputKader.reset();
        editingKaderId = null;
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Data Kader';
        }
        // Reset floating labels
        allFormInputs.forEach(input => {
            input.classList.remove('has-value', 'disabled'); // Remove has-value and disabled classes
            input.disabled = false; // Enable all
            // Special handling for selects to reset visual state of floating label
            if (input.tagName === 'SELECT') {
                input.value = ""; // Explicitly reset value
            }
        });
        // Repopulate and re-apply role-specific rules
        populateProvincesDropdown();
        populateFacultiesDropdown();
        populateJurusanDropdown(""); // Clear jurusan
        populateRayonDropdown(""); // Clear rayon

        // Re-apply role-specific disabled states/pre-fills
        if (loggedInUser && loggedInUser.role === 'rayon') {
            const currentRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
            if (currentRayon) {
                rayonKaderInput.value = currentRayon.name;
                rayonKaderInput.disabled = true;
                rayonKaderInput.classList.add('has-value', 'disabled');
                const facultyName = Object.keys(facultiesData).find(f => facultiesData[f].rayon.includes(currentRayon.name));
                if(facultyName && fakultasKaderInput) {
                    fakultasKaderInput.value = facultyName;
                    fakultasKaderInput.disabled = false;
                    fakultasKaderInput.classList.add('has-value');
                    populateJurusanDropdown(facultyName);
                }
            }
        }
        komisariatKaderInput.value = "PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung";
        komisariatKaderInput.disabled = true;
        komisariatKaderInput.classList.add('has-value', 'disabled');
    }

    // Handle form submission for Add/Edit Kader
    formInputKader.addEventListener('submit', async function(e) {
        e.preventDefault();

        const data = {
            full_name: namaKaderInput.value.trim(),
            nim: nimKaderInput.value.trim(),
            nik: nikKaderInput.value.trim(),
            email: emailKaderInput.value.trim(),
            phone_number: nomorHpWhatsappKaderInput.value.trim(),
            address_province: provinsiKaderInput.value,
            address_city: kotaKabupatenKaderInput.value.trim(),
            address_district: kecamatanKaderInput.value.trim(),
            address_village: desaKelurahanKaderInput.value.trim(),
            address_street: kampungKomplekPerumahanKaderInput.value.trim(),
            address_rt: rtKaderInput.value.trim(),
            address_rw: rwKaderInput.value.trim(),
            gender: jenisKelaminKaderInput.value,
            faculty: fakultasKaderInput.value,
            major: jurusanKaderInput.value,
            ipk: parseFloat(ipkKaderInput.value) || 0.0,
            skills_interests: minatBakatKaderInput.value.trim(),
            entry_year_university: parseInt(angkatanKaderInput.value) || null,
            rayon_id: null, // Initialize rayon_id
            rayon_name: rayonKaderInput.value, // Keep name for validation/lookup
            komisariat: komisariatKaderInput.value,
            cadre_level: klasifikasiKaderInput.value,
            role: 'kader', // Always 'kader' for this form
            status: 'aktif' // New kaders are active by default
        };

        // Convert rayon_name to rayon_id for API
        const selectedRayon = allRayons.find(r => r.name === rayonKaderInput.value);
        if (selectedRayon) {
            data.rayon_id = selectedRayon.id;
            // data.rayon_name is already set
        } else {
            window.showCustomMessage('Rayon yang dipilih tidak valid.', 'error');
            return;
        }

        // Handle full address string assembly
        data.address = `${data.address_street || ''}, RT ${data.address_rt || ''}/RW ${data.address_rw || ''}, ${data.address_village || ''}, ${data.address_district || ''}, ${data.address_city || ''}, ${data.address_province || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();

        // Basic validation
        if (!data.full_name || !data.nim || !data.email || !data.gender || !data.rayon_id || !data.cadre_level) {
            window.showCustomMessage('Nama, NIM, Email, Jenis Kelamin, Rayon, dan Klasifikasi wajib diisi.', 'error');
            return;
        }

        try {
            let response;
            if (editingKaderId) {
                response = await updateUser(editingKaderId, data); // user_id adalah editingKaderId
                if (response && response.success) {
                    window.showCustomMessage('Data kader berhasil diperbarui!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal memperbarui data kader.');
                }
            } else {
                response = await createUser(data); // Asumsi API createUser bisa membuat kader
                if (response && response.success) {
                    window.showCustomMessage('Data kader berhasil disimpan!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal menyimpan data kader. NIM atau email mungkin sudah terdaftar.');
                }
            }
            await loadAllKaderData(); // Muat ulang data kader setelah CRUD
            resetFormAndSubmitButton();
        } catch (error) {
            console.error("Error saving kader data:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat menyimpan data kader.", "error");
        }
    });


    // --- EXCEL IMPORT/EXPORT ---
    // Handle Excel file upload for mass data
    if(formUploadExcel) {
        formUploadExcel.addEventListener('submit', async function(e) { // Tambahkan async
            e.preventDefault();
            const fileInput = document.getElementById('file_excel_kader');
            if(fileInput.files.length === 0) {
                window.showCustomMessage('Silakan pilih file Excel terlebih dahulu.', 'error');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async function(event) { // Tambahkan async
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonKader = XLSX.utils.sheet_to_json(worksheet, {
                        header: ['nama', 'nim', 'nik', 'email', 'nomor_hp_whatsapp', 'provinsi', 'kota_kabupaten', 'kecamatan', 'desa_kelurahan', 'kampung_komplek_perumahan', 'rt', 'rw', 'jenis_kelamin', 'fakultas', 'jurusan', 'ipk', 'minat_bakat', 'angkatan', 'rayon', 'klasifikasi'],
                        range: 1
                    });

                    let newKaderCount = 0;
                    for (const kader of jsonKader) { // Gunakan for...of untuk await
                        if (kader.nama && kader.nim) {
                            const rayonObj = allRayons.find(r => r.name === kader.rayon); // Find rayon ID
                            if (!rayonObj) {
                                window.showCustomMessage(`Rayon "${kader.rayon}" tidak ditemukan untuk kader ${kader.nama}. Dilewati.`, 'warning');
                                continue;
                            }
                            
                            const kaderDataForApi = {
                                full_name: kader.nama || '',
                                nim: kader.nim ? kader.nim.toString() : '',
                                nik: kader.nik ? kader.nik.toString() : '',
                                email: kader.email || '',
                                phone_number: kader.nomor_hp_whatsapp ? kader.nomor_hp_whatsapp.toString() : '',
                                address_province: kader.provinsi || '',
                                address_city: kader.kota_kabupaten || '',
                                address_district: kader.kecamatan || '',
                                address_village: kader.desa_kelurahan || '',
                                address_street: kader.kampung_komplek_perumahan || '',
                                address_rt: kader.rt ? kader.rt.toString() : '',
                                address_rw: kader.rw ? kader.rw.toString() : '',
                                gender: kader.jenis_kelamin || '',
                                faculty: kader.fakultas || '',
                                major: kader.jurusan || '',
                                ipk: parseFloat(kader.ipk) || 0.0,
                                skills_interests: kader.minat_bakat || '',
                                entry_year_university: parseInt(kader.angkatan) || null,
                                rayon_id: rayonObj.id, // Use actual rayon ID
                                komisariat: "PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung",
                                cadre_level: kader.klasifikasi || "Kader Mu'taqid",
                                role: 'kader',
                                status: 'aktif',
                                // Password will be auto-generated by backend or should be provided in Excel
                            };
                            kaderDataForApi.address = `${kaderDataForApi.address_street || ''}, RT ${kaderDataForApi.address_rt || ''}/RW ${kaderDataForApi.address_rw || ''}, ${kaderDataForApi.address_village || ''}, ${kaderDataForApi.address_district || ''}, ${kaderDataForApi.address_city || ''}, ${kaderDataForApi.address_province || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();

                            try {
                                const response = await createUser(kaderDataForApi); // Panggil API untuk setiap kader
                                if (response && response.success) {
                                    newKaderCount++;
                                } else {
                                    console.error(`Gagal menambahkan kader ${kader.nama}:`, response.message || 'Error API');
                                    window.showCustomMessage(`Gagal menambahkan kader ${kader.nama}: ${response.message || 'Error'}`, 'error');
                                }
                            } catch (apiError) {
                                console.error(`Error API saat menambahkan kader ${kader.nama}:`, apiError);
                                window.showCustomMessage(`Error jaringan untuk kader ${kader.nama}: ${apiError.message || 'Error'}`, 'error');
                            }
                        }
                    }

                    await loadAllKaderData(); // Muat ulang data setelah impor selesai
                    window.showCustomMessage(`${newKaderCount} data kader berhasil diimpor dari file Excel!`, 'success');
                    formUploadExcel.reset();

                } catch (error) {
                    console.error("Error processing Excel file:", error);
                    window.showCustomMessage("Terjadi kesalahan saat memproses file. Pastikan format file dan kolomnya sudah benar.", 'error');
                }
            };

            reader.onerror = function() {
                window.showCustomMessage('Gagal membaca file.', 'error');
            };

            reader.readAsArrayBuffer(file);
        });
    }

    // Download Excel Template
    if (downloadTemplateLink) {
        downloadTemplateLink.addEventListener('click', async function(e){
            e.preventDefault();
            // Headers for the Excel template
            const templateHeader = [
                'nama', 'nim', 'nik', 'email', 'nomor_hp_whatsapp', 'provinsi', 'kota_kabupaten', 'kecamatan', 'desa_kelurahan', 'kampung_komplek_perumahan', 'rt', 'rw', 'jenis_kelamin', 'fakultas', 'jurusan', 'ipk', 'minat_bakat', 'angkatan', 'rayon', 'klasifikasi'
            ];
            const templateExample = [
                'Nama Kader Contoh', '123456789', '3201234567890001', 'contoh@email.com', '081234567890', 'Jawa Barat', 'Kota Bandung', 'Cibiru', 'Cipadung Wetan', 'Komplek A', '001', '002', 'Laki-laki', 'Ushuluddin', 'Aqidah dan Filsafat Islam', '3.50', 'Seni Musik', '2023', 'PMII Rayon Fakultas Ushuluddin', 'Kader Mu\'taqid'
            ];

            const templateData = [ templateHeader, templateExample ];

            const ws = XLSX.utils.aoa_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data Kader");
            XLSX.writeFile(wb, "Template_Data_Kader_Lengkap_PMII.xlsx");
        });
    }


    // --- STATISTIK ---
    // Function to update and render classification statistics (from dashboard-statistik.js)
    function updateAndRenderStats(kaderList, role, userRayonName, filterDate = null) {
        const ctx = document.getElementById('klasifikasiKaderChart');
        if (!ctx) return;

        let dataToProcess = kaderList;
        // Filter data based on user role (Rayon Admin only sees their own rayon's data)
        if (role === 'rayon') {
            dataToProcess = kaderList.filter(kader => kader.rayon_name === userRayonName);
        }

        if (filterDate) {
            dataToProcess = dataToProcess.filter(kader => kader.tanggal_input && kader.tanggal_input.startsWith(filterDate));
        }

        const klasifikasiCounts = {
            "Kader Mu'taqid": 0,
            "Kader Mujahid": 0,
            "Kader Mujtahid": 0,
            "Kader Muharik": 0
        };
        let totalKader = 0;

        dataToProcess.forEach(kader => {
            if (klasifikasiCounts.hasOwnProperty(kader.klasifikasi)) {
                klasifikasiCounts[kader.klasifikasi]++;
            }
            totalKader++;
        });

        if(totalKaderCountEl) totalKaderCountEl.textContent = totalKader;
        if(kaderMutaqidCountEl) kaderMutaqidCountEl.textContent = klasifikasiCounts["Kader Mu'taqid"];
        if(kaderMujahidCountEl) kaderMujahidCountEl.textContent = klasifikasiCounts["Kader Mujahid"];
        if(kaderMujtahidCountEl) kaderMujtahidCountEl.textContent = klasifikasiCounts["Kader Mujtahid"];
        if(kaderMuharikCountEl) kaderMuharikCountEl.textContent = klasifikasiCounts["Kader Muharik"];

        const chartData = {
            labels: Object.keys(klasifikasiCounts),
            datasets: [{
                label: 'Jumlah Kader',
                data: Object.values(klasifikasiCounts),
                backgroundColor: [
                    'rgba(22, 163, 74, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)'
                ],
                borderColor: [
                    'rgba(22, 163, 74, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 1.5,
                hoverOffset: 8,
                hoverBorderColor: 'rgba(0,0,0,0.2)',
                hoverBorderWidth: 2
            }]
        };

        if (klasifikasiKaderChart) {
            klasifikasiKaderChart.destroy();
        }

        klasifikasiKaderChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 11, family: "'Inter', sans-serif" },
                            color: 'white',
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    title: {
                        display: true,
                        text: `Distribusi Klasifikasi Kader ${scopeStatistik.textContent}`,
                        font: { size: 16, weight: '600', family: "'Poppins', sans-serif" },
                        color: 'var(--pmii-yellow)',
                        padding: { top: 15, bottom: 20 }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        titleFont: { size: 13, weight: 'bold', family: "'Poppins', sans-serif" },
                        bodyFont: { size: 12, family: "'Inter', sans-serif" },
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed;
                                }
                                const percentage = totalKader > 0 ? ((context.parsed / totalKader) * 100).toFixed(1) : 0;
                                label += ` (${percentage}%)`;
                                return label;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }

    // Function to update and render additional statistics (Gender, IPK, Address) (from dashboard-statistik.js)
    function updateAndRenderAdditionalStats(kaderList, role, userRayonName) {
        let dataToProcess = kaderList;
        if (role === 'rayon' && userRayonName) {
            dataToProcess = kaderList.filter(kader => kader.rayon_name === userRayonName);
        }

        // 1. Hitung Statistik Jenis Kelamin
        const genderCounts = { 'Laki-laki': 0, 'Perempuan': 0 };
        dataToProcess.forEach(kader => {
            if (kader.jenis_kelamin === 'Laki-laki') {
                genderCounts['Laki-laki']++;
            } else if (kader.jenis_kelamin === 'Perempuan') {
                genderCounts['Perempuan']++;
            }
        });
        renderGenderChart(genderCounts);

        // 2. Hitung Rata-Rata IPK
        let totalIpk = 0;
        let kaderWithIpkCount = 0;
        dataToProcess.forEach(kader => {
            const ipk = parseFloat(String(kader.ipk).replace(',', '.'));
            if (!isNaN(ipk)) {
                totalIpk += ipk;
                kaderWithIpkCount++;
            }
        });
        const averageIpk = kaderWithIpkCount > 0 ? (totalIpk / kaderWithIpkCount).toFixed(2) : '0.00';
        if (averageIpkStatEl) {
            averageIpkStatEl.textContent = averageIpk;
        }

        // 3. Hitung Distribusi Alamat (5 lokasi teratas)
        const addressCounts = {};
        dataToProcess.forEach(kader => {
            let locationKey = "Tidak Diketahui";
            if (kader.kota_kabupaten && kader.provinsi) {
                locationKey = `${kader.kota_kabupaten}, ${kader.provinsi}`;
            } else if (kader.alamat) {
                const addressParts = kader.alamat.split(',');
                const city = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : "Tidak Diketahui";
                locationKey = city;
            }
            addressCounts[locationKey] = (addressCounts[locationKey] || 0) + 1;
        });
        const sortedAddresses = Object.entries(addressCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
        if (addressListEl) {
            addressListEl.innerHTML = '';
            if (sortedAddresses.length > 0) {
                sortedAddresses.forEach(([city, count]) => {
                    const li = document.createElement('li');
                    li.className = 'flex justify-between items-center text-sm py-1.5 border-b border-white border-opacity-10 last:border-b-0';
                    li.innerHTML = `<span class="text-white text-opacity-80">${city}</span><span class="font-semibold text-pmii-yellow">${count} Kader</span>`;
                    addressListEl.appendChild(li);
                });
            } else {
                addressListEl.innerHTML = '<li class="text-center text-text-muted">Data alamat tidak tersedia.</li>';
            }
        }
    }

    // Render gender chart using Chart.js (from dashboard-statistik.js)
    function renderGenderChart(genderData) {
        const ctx = document.getElementById('genderChart');
        if (!ctx) return;

        if (genderChart) {
            genderChart.destroy();
        }

        const totalDisplay = genderData['Laki-laki'] + genderData['Perempuan'];

        genderChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Laki-laki', 'Perempuan'],
                datasets: [{
                    data: [genderData['Laki-laki'], genderData['Perempuan']],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: ['#FFFFFF', '#FFFFFF'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11, family: "'Inter', sans-serif" },
                            color: 'white',
                            padding: 15
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        titleFont: { size: 13, weight: 'bold', family: "'Poppins', sans-serif" },
                        bodyFont: { size: 12, family: "'Inter', sans-serif" },
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.raw || 0;
                                let percentage = totalDisplay > 0 ? (value * 100 / totalDisplay).toFixed(1) + '%' : '0%';
                                return `${label}: ${value} (${percentage})`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        textAlign: 'center',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: (value, ctx) => {
                            let percentage = totalDisplay > 0 ? (value * 100 / totalDisplay).toFixed(1) + '%' : '0%';
                            return percentage;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // Event listener for statistics time filter
    if(filterWaktuStatistik){
        filterWaktuStatistik.addEventListener('change', function(){
            if(loggedInUser){
                    updateAndRenderStats(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon, this.value);
                    updateAndRenderAdditionalStats(allKaderData, loggedInUser.role, loggedInUser.rayon_name || loggedInUser.namaRayon);
            }
        });
    }


    // --- INITIALIZATION ---
    const pageCanContinue = await updateManajemenKaderUI(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await populateRayonDropdown(''); // Initial populate of Rayon dropdown
        await loadAllKaderData(); // Muat data kader dari API saat halaman dimuat

        // Setel tahun di footer
        document.getElementById('tahun-footer-kader').textContent = new Date().getFullYear();

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

        // Intersection Observer for Animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Optionally remove is-visible when element scrolls out of view
                    // entry.target.classList.remove('is-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animated-section').forEach(section => {
            observer.observe(section);
        });
    }
});