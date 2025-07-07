<?php
// app/core/Database.php

// Kelas ini bertanggung jawab untuk mengelola koneksi database
// dan menyediakan metode dasar untuk menjalankan query SQL.

class Database
{
    private $pdo; // Objek PDO untuk koneksi database
    private $stmt; // Objek PDOStatement untuk query yang disiapkan

    /**
     * Konstruktor kelas Database.
     * Menginisialisasi koneksi database menggunakan PDO berdasarkan konfigurasi.
     */
    public function __construct()
    {
        // Memuat konfigurasi database dari file app/config/database.php
        // Sesuaikan path jika struktur direktori Anda berbeda.
        $config = include __DIR__ . '/../config/database.php';
        $dbConfig = $config['connections'][$config['default']];

        // Membangun DSN (Data Source Name) untuk koneksi PDO
        $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset={$dbConfig['charset']}";

        // Opsi PDO untuk penanganan error dan mode fetch default
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Mengaktifkan mode pengecualian untuk error
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Mengambil hasil sebagai array asosiatif secara default
            PDO::ATTR_EMULATE_PREPARES   => false,                  // Menonaktifkan emulasi prepared statements
        ];

        try {
            // Membuat instance PDO baru untuk koneksi database
            $this->pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], $options);
        } catch (PDOException $e) {
            // Menangani error koneksi database
            error_log("Koneksi database gagal: " . $e->getMessage());
            // Dalam aplikasi produksi, Anda mungkin ingin menampilkan pesan error generik
            // dan mencatat detail error ke file log, bukan langsung ke output.
            die("Koneksi database gagal: " . $e->getMessage());
        }
    }

    /**
     * Menyiapkan dan menjalankan query SQL.
     *
     * @param string $sql Query SQL yang akan dijalankan.
     * @param array $params Array opsional dari parameter untuk prepared statement.
     * @return PDOStatement Objek PDOStatement yang dieksekusi.
     */
    public function query($sql, $params = [])
    {
        try {
            $this->stmt = $this->pdo->prepare($sql); // Menyiapkan query
            $this->stmt->execute($params);           // Menjalankan query dengan parameter
            return $this->stmt;
        } catch (PDOException $e) {
            // Menangani error eksekusi query
            error_log("Kesalahan Query Database: " . $e->getMessage() . " | SQL: " . $sql . " | Params: " . json_encode($params));
            // Dalam aplikasi produksi, lemparkan atau tangani error dengan cara yang lebih elegan.
            throw new PDOException("Kesalahan Query Database: " . $e->getMessage());
        }
    }

    /**
     * Mengambil satu baris hasil dari query yang dijalankan.
     *
     * @param string $sql Query SQL.
     * @param array $params Array parameter opsional.
     * @return array|false Baris hasil sebagai array asosiatif, atau false jika tidak ada hasil.
     */
    public function fetch($sql, $params = [])
    {
        return $this->query($sql, $params)->fetch();
    }

    /**
     * Mengambil semua baris hasil dari query yang dijalankan.
     *
     * @param string $sql Query SQL.
     * @param array $params Array parameter opsional.
     * @return array Array dari semua baris hasil sebagai array asosiatif.
     */
    public function fetchAll($sql, $params = [])
    {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Mengembalikan ID dari baris terakhir yang dimasukkan.
     *
     * @return string ID terakhir yang dimasukkan.
     */
    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * Memulai transaksi database.
     */
    public function beginTransaction()
    {
        $this->pdo->beginTransaction();
    }

    /**
     * Melakukan commit transaksi database.
     */
    public function commit()
    {
        $this->pdo->commit();
    }

    /**
     * Melakukan rollback transaksi database.
     */
    public function rollback()
    {
        $this->pdo->rollBack();
    }
}
