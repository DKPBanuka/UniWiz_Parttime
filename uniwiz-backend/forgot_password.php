<?php
// FILE: uniwiz-backend/api/forgot_password.php (NEW FILE)
// =======================================================
// This file handles the first step of the password reset process.

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Use PHPMailer ---
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// --- Include Composer's autoloader ---
require '../vendor/autoload.php';

// --- Database Connection ---
include_once '../config/database.php';

// --- Handle Preflight (OPTIONS) Request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503); 
    echo json_encode(["message" => "Database connection failed."]);
    exit(); 
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || empty($data->email)) {
    http_response_code(400);
    echo json_encode(["message" => "Email address is required."]);
    exit();
}

$email = $data->email;

try {
    // 1. Check if the user exists in the 'users' table
    $query_user = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt_user = $db->prepare($query_user);
    $stmt_user->bindParam(':email', $email);
    $stmt_user->execute();

    if ($stmt_user->rowCount() == 0) {
        // To prevent user enumeration, we send a success-like message even if the user doesn't exist.
        // The user will simply not receive an email.
        http_response_code(200);
        echo json_encode(["message" => "If an account with that email exists, a password reset link has been sent."]);
        exit();
    }

    // 2. Generate a unique token and set an expiration time (e.g., 1 hour from now)
    $token = bin2hex(random_bytes(50));
    $expires = time() + 3600; // 3600 seconds = 1 hour

    // 3. Delete any previous tokens for this email to prevent conflicts
    $query_delete = "DELETE FROM password_reset_temp WHERE email = :email";
    $stmt_delete = $db->prepare($query_delete);
    $stmt_delete->bindParam(':email', $email);
    $stmt_delete->execute();

    // 4. Insert the new token into the database
    $query_insert = "INSERT INTO password_reset_temp (email, token, expires) VALUES (:email, :token, :expires)";
    $stmt_insert = $db->prepare($query_insert);
    $stmt_insert->bindParam(':email', $email);
    $stmt_insert->bindParam(':token', $token);
    $stmt_insert->bindParam(':expires', $expires);
    $stmt_insert->execute();

    // NEW: Send Verification Email
                $mail = new PHPMailer(true);
                try {
                    // --- UPDATED: Server settings for SendGrid ---
                    $mail->isSMTP();
                    $mail->Host       = $_ENV['SMTP_HOST'];
                    $mail->SMTPAuth   = true;
                    $mail->Username   = $_ENV['SMTP_USER'];
                    $mail->Password   = $_ENV['SMTP_PASS']; // Using variable from .env file
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = $_ENV['SMTP_PORT'];

                    //Recipients
                    $mail->setFrom('uniwizparttime@gmail.com', 'UniWiz'); // This email MUST be a verified sender in SendGrid
                    $mail->addAddress($email);

                    //Content
                    $mail->isHTML(true);
                    $mail->Subject = 'Verify Your Email Address for UniWiz';
    
    // IMPORTANT: This link should point to your frontend page for resetting the password
    $reset_link = 'http://localhost:3000/reset-password?token=' . $token;
    
    $mail->Body    = "
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your UniWiz account. Please click the link below to set a new password. This link is valid for one hour.</p>
        <p><a href='{$reset_link}' style='padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;'>Reset My Password</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
    ";

    $mail->send();

    http_response_code(200);
    echo json_encode(["message" => "If an account with that email exists, a password reset link has been sent."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An error occurred. Please try again later. Mailer Error: {$mail->ErrorInfo}"]);
}
?>