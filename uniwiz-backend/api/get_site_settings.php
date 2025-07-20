<?php
// FILE: uniwiz-backend/api/get_site_settings.php
// DESCRIPTION: Fetches site-wide settings, such as footer links, from the database.

header("Access-Control-Allow-Origin: *"); // Allows any domain to access this, which is fine for public data
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// We are specifically fetching the footer links here.
$setting_key = 'footer_links';

try {
    $query = "SELECT setting_value FROM site_settings WHERE setting_key = :setting_key LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':setting_key', $setting_key);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        http_response_code(200);
        // The data is stored as a JSON string, so we echo it directly.
        // The frontend will parse it.
        echo $row['setting_value'];
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Settings key '{$setting_key}' not found."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
