<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
$plain_password = "Admin@UniWiz"; // Example plain password
$hashed_password = password_hash($plain_password, PASSWORD_BCRYPT);
echo "Plain Password: " . $plain_password . "<br>";
echo "Hashed Password: " . $hashed_password;
?>