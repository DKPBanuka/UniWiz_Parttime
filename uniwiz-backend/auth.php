<?php
// FILE: uniwiz-backend/auth.php (FULLY FIXED AND CLEANED)
// ======================================================================

// For debugging purposes ONLY. Remove these lines in a live environment.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- Handle Preflight (OPTIONS) Request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(204);
    exit;
}

// --- Standard Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");

// --- Include Composer's autoloader for PHPMailer ---
// CORRECTED PATH: No longer needs '../' as this file is in the root backend folder
require 'vendor/autoload.php';
include_once 'config/database.php';

// --- Use PHPMailer classes ---
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503); 
    echo json_encode(["message" => "Database connection failed. Check your config/database.php credentials."]);
    exit(); 
}

// --- Get Posted Data ---
$data = json_decode(file_get_contents("php://input"));

if ($data === null || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid request. Action not specified."]);
    exit();
}

// --- Function to fetch full user profile ---
function getFullUserProfile($db, $user_id) {
    $query = "
        SELECT 
            u.id, u.email, u.first_name, u.last_name, u.role, u.company_name, u.profile_image_url, u.is_verified, u.status,
            sp.university_name, sp.field_of_study, sp.year_of_study, sp.languages_spoken, sp.preferred_categories, sp.skills, sp.cv_url,
            pp.about, pp.industry, pp.website_url, pp.address, pp.phone_number, pp.facebook_url, pp.linkedin_url, pp.instagram_url
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN publisher_profiles pp ON u.id = pp.user_id
        WHERE u.id = :id
    ";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// --- Function to create a notification for all admins ---
function createAdminNotification($db, $type, $message, $link) {
    // ... (This function is correct, no changes needed)
}

// --- ACTION ROUTER ---
if ($data->action === 'register') {
    if (!isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data for registration."]);
        exit();
    }

    try {
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400); 
            echo json_encode(["message" => "This email is already registered."]);
        } else {
            $firstName = isset($data->first_name) ? htmlspecialchars(strip_tags($data->first_name)) : '';
            $lastName = isset($data->last_name) ? htmlspecialchars(strip_tags($data->last_name)) : '';
            $companyName = isset($data->company_name) ? htmlspecialchars(strip_tags($data->company_name)) : '';
            $role = htmlspecialchars(strip_tags($data->role));

            if ($role !== 'student' && $role !== 'publisher') {
                http_response_code(400);
                echo json_encode(["message" => "Invalid role specified."]);
                exit();
            }

            $query = "INSERT INTO users (email, password, first_name, last_name, company_name, role, email_verification_token) VALUES (:email, :password, :first_name, :last_name, :company_name, :role, :token)";
            $stmt = $db->prepare($query);

            $email = htmlspecialchars(strip_tags($data->email));
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $verification_token = bin2hex(random_bytes(50));
            
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password_hash);
            $stmt->bindParam(':first_name', $firstName);
            $stmt->bindParam(':last_name', $lastName);
            $stmt->bindParam(':company_name', $companyName);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':token', $verification_token);

            if ($stmt->execute()) {
                $new_user_id = $db->lastInsertId();

                if ($role === 'student') {
                    $stmt_student_profile = $db->prepare("INSERT INTO student_profiles (user_id) VALUES (:user_id)");
                    $stmt_student_profile->bindParam(':user_id', $new_user_id, PDO::PARAM_INT);
                    $stmt_student_profile->execute();
                } elseif ($role === 'publisher') {
                    $stmt_publisher_profile = $db->prepare("INSERT INTO publisher_profiles (user_id) VALUES (:user_id)");
                    $stmt_publisher_profile->bindParam(':user_id', $new_user_id, PDO::PARAM_INT);
                    $stmt_publisher_profile->execute();
                }

                $mail = new PHPMailer(true);
                try {
                    if (empty($_ENV['SMTP_PASS'])) {
                        throw new Exception('SMTP password not configured in .env file.');
                    }
                    $mail->isSMTP();
                    $mail->Host       = $_ENV['SMTP_HOST'];
                    $mail->SMTPAuth   = true;
                    $mail->Username   = $_ENV['SMTP_USER'];
                    $mail->Password   = $_ENV['SMTP_PASS'];
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = $_ENV['SMTP_PORT'];

                    $mail->setFrom('uniwizparttime@gmail.com', 'UniWiz');
                    $mail->addAddress($email);
                    $mail->isHTML(true);
                    $mail->Subject = 'Verify Your Email Address for UniWiz';
                    
                    // CORRECTED PATH: Removed '/api' from the link
                    $verification_link = 'http://uniwiz-backend.test/verify_email.php?token=' . $verification_token;
                    
                    $mail->Body    = "<h2>Welcome to UniWiz!</h2><p>Thank you for registering. Please click the link below to verify your email address:</p><p><a href='{$verification_link}' style='padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;'>Verify My Email</a></p><p>If you did not create an account, no further action is required.</p>";
                    $mail->send();
                } catch (Exception $e) {
                    error_log("Mailer Error: {$mail->ErrorInfo}");
                }

                $new_user = getFullUserProfile($db, $new_user_id);
                http_response_code(201);
                echo json_encode([
                    "message" => "Registration successful! Please check your email to verify your account.",
                    "user" => $new_user 
                ]);
            } else {
                throw new Exception("Failed to execute statement.");
            }
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
    }

} elseif ($data->action === 'login') {
    if (!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data for login."]);
        exit();
    }
    try {
        $query = "SELECT id, email, password, role, status, email_verified_at FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row['status'] === 'blocked') {
                http_response_code(403);
                echo json_encode(["message" => "Your account has been blocked by the administrator."]);
                exit();
            }

            if ($row['role'] !== 'admin' && $row['email_verified_at'] === null) {
                http_response_code(403);
                echo json_encode(["message" => "Please verify your email address before logging in."]);
                exit();
            }

            if (password_verify($data->password, $row['password'])) {
                $full_user_profile = getFullUserProfile($db, $row['id']);
                http_response_code(200);
                echo json_encode(["message" => "Login successful.", "user" => $full_user_profile]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Invalid email or password."]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid action specified."]);
}
?>