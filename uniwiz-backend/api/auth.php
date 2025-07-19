<?php
// FILE: uniwiz-backend/api/auth.php (UPDATED WITH EMAIL VERIFICATION)
// ======================================================================

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Suppress PHP Errors for clean JSON output ---
ini_set('display_errors', 0);
error_reporting(0);

// --- Handle Preflight (OPTIONS) Request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- NEW: Include Composer's autoloader for PHPMailer ---
require '../vendor/autoload.php';

// --- NEW: Use PHPMailer classes ---
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503); 
    echo json_encode(array("message" => "Database connection failed."));
    exit(); 
}

// --- Get Posted Data ---
$data = json_decode(file_get_contents("php://input"));

if ($data === null || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid request. Action not specified."));
    exit();
}

// --- Function to fetch full user profile ---
function getFullUserProfile($db, $user_id) {
    // This function remains the same as before
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
    // This function remains the same as before
    $stmt_admins = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
    $stmt_admins->execute();
    $admin_ids = $stmt_admins->fetchAll(PDO::FETCH_COLUMN, 0);

    if (empty($admin_ids)) {
        return;
    }

    $query_notif = "INSERT INTO notifications (user_id, type, message, link) VALUES (:user_id, :type, :message, :link)";
    $stmt_notif = $db->prepare($query_notif);

    foreach ($admin_ids as $admin_id) {
        $stmt_notif->bindParam(':user_id', $admin_id, PDO::PARAM_INT);
        $stmt_notif->bindParam(':type', $type);
        $stmt_notif->bindParam(':message', $message);
        $stmt_notif->bindParam(':link', $link);
        $stmt_notif->execute();
    }
}


// --- ACTION ROUTER ---
if ($data->action === 'register') {
    // --- REGISTRATION LOGIC ---
    if (!isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data for registration."));
        exit();
    }

    try {
        // Check if email already exists
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400); 
            echo json_encode(array("message" => "This email is already registered."));
        } else {
            $firstName = isset($data->first_name) ? htmlspecialchars(strip_tags($data->first_name)) : '';
            $lastName = isset($data->last_name) ? htmlspecialchars(strip_tags($data->last_name)) : '';
            $companyName = isset($data->company_name) ? htmlspecialchars(strip_tags($data->company_name)) : '';
            $role = htmlspecialchars(strip_tags($data->role));

            if ($role !== 'student' && $role !== 'publisher') {
                http_response_code(400);
                echo json_encode(array("message" => "Invalid role specified."));
                exit();
            }

            // UPDATED: Added email_verification_token to the insert query
            $query = "INSERT INTO users (email, password, first_name, last_name, company_name, role, email_verification_token) VALUES (:email, :password, :first_name, :last_name, :company_name, :role, :token)";
            $stmt = $db->prepare($query);

            $email = htmlspecialchars(strip_tags($data->email));
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            
            // NEW: Generate a unique verification token
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
                    
                    // IMPORTANT: Replace with your actual backend API URL path
                    $verification_link = 'http://uniwiz.test/api/verify_email.php?token=' . $verification_token;
                    
                    $mail->Body    = "
                        <h2>Welcome to UniWiz!</h2>
                        <p>Thank you for registering. Please click the link below to verify your email address:</p>
                        <p><a href='{$verification_link}' style='padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;'>Verify My Email</a></p>
                        <p>If you did not create an account, no further action is required.</p>
                    ";

                    $mail->send();
                } catch (Exception $e) {
                    // Log the error but don't stop the registration process
                    error_log("Mailer Error: {$mail->ErrorInfo}");
                }

                $new_user = getFullUserProfile($db, $new_user_id);
                createAdminNotification($db, 'new_user_registration', "New " . $role . " registered: " . ($companyName ?: "$firstName $lastName"), '/user-management?filter=unverified');

                // UPDATED: Change success message to inform user to check email
                http_response_code(201);
                echo json_encode(array(
                    "message" => "Registration successful! Please check your email to verify your account.",
                    "user" => $new_user 
                ));
            } else {
                throw new Exception("Failed to execute statement.");
            }
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "An unexpected server error occurred: " . $e->getMessage()));
    }

} elseif ($data->action === 'login') {
    // --- LOGIN LOGIC ---
    if (!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data for login."));
        exit();
    }
    try {
        // Fetch email_verified_at along with other details
        $query = "SELECT id, email, password, role, status, email_verified_at FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row['status'] === 'blocked') {
                http_response_code(403);
                echo json_encode(array("message" => "Your account has been blocked by the administrator."));
                exit();
            }

            // *** THIS IS THE CRITICAL CHECK ***
            // Check if email is verified (except for admin)
            if ($row['role'] !== 'admin' && $row['email_verified_at'] === null) {
                http_response_code(403); // Use 403 Forbidden for this specific case
                echo json_encode(array("message" => "Please verify your email address before logging in."));
                exit();
            }

            if (password_verify($data->password, $row['password'])) {
                $full_user_profile = getFullUserProfile($db, $row['id']);
                http_response_code(200);
                echo json_encode(array("message" => "Login successful.", "user" => $full_user_profile));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid email or password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid email or password."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "An unexpected server error occurred: " . $e->getMessage()));
    }

} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid action specified."));
}
?>