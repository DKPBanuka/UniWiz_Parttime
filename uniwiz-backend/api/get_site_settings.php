<?php
// Error reporting suppress
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');

require_once '../config/database.php';
// require_once '../vendor/autoload.php'; // Remove if not needed

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Fetch footer settings
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