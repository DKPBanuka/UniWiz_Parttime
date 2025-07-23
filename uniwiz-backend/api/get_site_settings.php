<?php
// FILE: uniwiz-backend/api/get_site_settings.php
// =================================================
// This file fetches site-wide settings (e.g., footer links) from the database and returns them as JSON.

// --- Suppress error reporting for cleaner output ---
error_reporting(0);
ini_set('display_errors', 0);

// --- Set CORS and Content-Type Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from frontend
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Allow these HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json'); // Respond with JSON

require_once '../config/database.php';
// require_once '../vendor/autoload.php'; // Remove if not needed

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // --- Fetch footer settings from the site_settings table ---
    $stmt = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'footer_links' LIMIT 1");
    $stmt->execute();
    $siteSettings = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($siteSettings) {
        $footerLinks = json_decode($siteSettings['setting_value'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($footerLinks)) {
            $footerLinks = [];
        }
        // Output as root-level object
        echo json_encode($footerLinks);
        exit;
    } else {
        // No settings found, return empty object
        echo json_encode(new stdClass());
        exit;
    }
} catch (Exception $e) {
    // On error, return empty object
    echo json_encode(new stdClass());
    exit;
}
?>