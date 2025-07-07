// public/js/chart_config.js

// Modul ini menyediakan fungsi-fungsi untuk mengkonfigurasi dan membuat berbagai jenis grafik
// menggunakan Chart.js.

/**
 * Konfigurasi dasar untuk grafik batang (bar chart).
 * @param {string} chartId - ID elemen canvas HTML tempat grafik akan dirender.
 * @param {string[]} labels - Array label untuk sumbu X (misal: ['Jan', 'Feb', 'Mar']).
 * @param {number[]} data - Array nilai data untuk sumumbu Y.
 * @param {string} label - Label untuk dataset (misal: 'Jumlah Kader').
 * @param {string} title - Judul grafik.
 * @returns {Chart} Instance Chart.js.
 */
export function createBarChart(chartId, labels, data, label, title) {
    const ctx = document.getElementById(chartId);
    if (!ctx) {
        console.error(`Canvas element with ID '${chartId}' not found.`);
        return null;
    }

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [
                    'rgba(0, 92, 151, 0.8)',   // pmii-blue
                    'rgba(0, 74, 124, 0.8)',   // pmii-darkblue
                    'rgba(253, 216, 53, 0.8)', // pmii-yellow
                    'rgba(106, 13, 173, 0.8)', // pmii-purple (example)
                    'rgba(45, 212, 191, 0.8)', // teal-400 (example)
                    'rgba(239, 68, 68, 0.8)'   // red-500 (example)
                ],
                borderColor: [
                    'rgba(0, 92, 151, 1)',
                    'rgba(0, 74, 124, 1)',
                    'rgba(253, 216, 53, 1)',
                    'rgba(106, 13, 173, 1)',
                    'rgba(45, 212, 191, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: '#fff', // Warna judul grafik
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false // Sembunyikan legenda untuk grafik batang sederhana
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#eee' // Warna teks sumbu Y
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Warna grid sumbu Y
                    }
                },
                x: {
                    ticks: {
                        color: '#eee' // Warna teks sumbu X
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Warna grid sumbu X
                    }
                }
            }
        }
    });
}

/**
 * Konfigurasi dasar untuk grafik donat (doughnut chart).
 * @param {string} chartId - ID elemen canvas HTML tempat grafik akan dirender.
 * @param {string[]} labels - Array label untuk setiap segmen donat.
 * @param {number[]} data - Array nilai data untuk setiap segmen.
 * @param {string} title - Judul grafik.
 * @returns {Chart} Instance Chart.js.
 */
export function createDoughnutChart(chartId, labels, data, title) {
    const ctx = document.getElementById(chartId);
    if (!ctx) {
        console.error(`Canvas element with ID '${chartId}' not found.`);
        return null;
    }

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribusi',
                data: data,
                backgroundColor: [
                    'rgba(0, 92, 151, 0.8)',   // pmii-blue
                    'rgba(253, 216, 53, 0.8)', // pmii-yellow
                    'rgba(106, 13, 173, 0.8)', // pmii-purple
                    'rgba(45, 212, 191, 0.8)', // teal-400
                    'rgba(239, 68, 68, 0.8)',  // red-500
                    'rgba(59, 130, 246, 0.8)'  // blue-500
                ],
                borderColor: '#fff', // Border putih untuk segmen
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: '#fff', // Warna judul grafik
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'right', // Posisi legenda
                    labels: {
                        color: '#eee' // Warna teks legenda
                    }
                }
            }
        }
    });
}

/**
 * Konfigurasi dasar untuk grafik garis (line chart).
 * @param {string} chartId - ID elemen canvas HTML tempat grafik akan dirender.
 * @param {string[]} labels - Array label untuk sumbu X (misal: ['Jan', 'Feb', 'Mar']).
 * @param {number[]} data - Array nilai data untuk sumumbu Y.
 * @param {string} label - Label untuk dataset.
 * @param {string} title - Judul grafik.
 * @returns {Chart} Instance Chart.js.
 */
export function createLineChart(chartId, labels, data, label, title) {
    const ctx = document.getElementById(chartId);
    if (!ctx) {
        console.error(`Canvas element with ID '${chartId}' not found.`);
        return null;
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                fill: true, // Isi area di bawah garis
                backgroundColor: 'rgba(0, 92, 151, 0.2)', // Warna area
                borderColor: 'rgba(0, 92, 151, 1)', // Warna garis
                tension: 0.4, // Kehalusan garis
                pointBackgroundColor: 'rgba(253, 216, 53, 1)', // Warna titik
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(253, 216, 53, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: '#fff',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#eee'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#eee'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}
