<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once '../config/database.php';
require_once '../vendor/autoload.php';

$response = [
    'success' => false,
    'message' => 'An unknown error occurred.'
];

try {
    $pdo = getPDO();

    // Fetch footer settings
    $stmt = $pdo->prepare("SELECT footer_links FROM site_settings LIMIT 1");
    $stmt->execute();
    $siteSettings = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($siteSettings) {
        $footerLinks = json_decode($siteSettings['footer_links'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Handle JSON decode error - log it and perhaps return an empty array or default
            $footerLinks = []; // Default to empty array if JSON is invalid
        }
    } else {
        $footerLinks = []; // Default to empty array if no settings found
    }

    $response = [
        'success' => true,
        'footerLinks' => $footerLinks,
        'message' => 'Site settings fetched successfully.'
    ];

} catch (PDOException $e) {
    $response = [
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ];
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ];
}

echo json_encode($response);
?>