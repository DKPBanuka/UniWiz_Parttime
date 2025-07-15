<?php
// FILE: uniwiz-backend/config/database.php (Temporary Debugging Version)
// ======================================================================
// This version is designed to show the REAL database connection error.

class Database {
    // --- Database Credentials ---
    private $host = "localhost";
    private $db_name = "uniwiz_db";
    private $username = "root";
    private $password = "root"; // Default password for Laragon is empty
    public $conn;

    // --- Get the database connection ---
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // --- CHANGE IS HERE ---
            // We will now forcefully stop the script and print the actual error.
            // This will help us see the root cause of the connection failure.
            die("DATABASE ERROR: " . $exception->getMessage());
        }

        return $this->conn;
    }
}
?>
