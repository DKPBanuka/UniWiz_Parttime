<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
// FILE: uniwiz-backend/api/verify_email.php (NEW FILE)
// =======================================================
// This file handles the email verification process when a user clicks the link.

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    // Basic error message if DB connection fails
    die("<h1>Error: Could not connect to the database.</h1>");
}

// --- Verification Logic ---
if (!isset($_GET['token']) || empty($_GET['token'])) {
    die("<h1>Verification Failed</h1><p>Invalid verification link. No token provided.</p>");
}

$token = $_GET['token'];

try {
    // 1. Find the user with the given verification token
    $query = "SELECT id, email_verified_at FROM users WHERE email_verification_token = :token LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Check if the email is already verified
        if ($user['email_verified_at'] !== null) {
            die("<h1>Already Verified</h1><p>This email address has already been verified. You can now log in.</p>");
        }

        // 3. If not verified, update the user record
        $update_query = "
            UPDATE users 
            SET 
                email_verified_at = CURRENT_TIMESTAMP, 
                email_verification_token = NULL 
            WHERE 
                id = :user_id
        ";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':user_id', $user['id']);
        
        if ($update_stmt->execute()) {
            // Success message
            // You can create a more visually appealing HTML page for this
            echo "<h1>Verification Successful!</h1>";
            echo "<p>Your email address has been successfully verified. You can now close this window and log in to your account.</p>";
            // Optional: Redirect to login page after a few seconds
            // header("refresh:5;url=http://localhost:3000/login"); 
        } else {
            throw new Exception("Failed to update user record.");
        }

    } else {
        // Token not found in the database
        die("<h1>Verification Failed</h1><p>Invalid or expired verification link. Please try registering again.</p>");
    }

} catch (Exception $e) {
    // Generic error message for any other issues
    die("<h1>An Error Occurred</h1><p>Something went wrong during the verification process. Please try again later.</p>");
}
?>