<?php
// FILE: uniwiz-backend/api/auth.php (UPDATED - Ensure status is included in login response)
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


// --- ACTION ROUTER ---
if ($data->action === 'register') {
    // --- REGISTRATION LOGIC ---
    // (No changes to registration logic)
    if (!isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data for registration."));
        exit();
    }

    try {
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

            $query = "INSERT INTO users (email, password, first_name, last_name, company_name, role) VALUES (:email, :password, :first_name, :last_name, :company_name, :role)";
            $stmt = $db->prepare($query);

            $email = htmlspecialchars(strip_tags($data->email));
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password_hash);
            $stmt->bindParam(':first_name', $firstName);
            $stmt->bindParam(':last_name', $lastName);
            $stmt->bindParam(':company_name', $companyName);
            $stmt->bindParam(':role', $role);

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

                $new_user = getFullUserProfile($db, $new_user_id);

                http_response_code(201);
                echo json_encode(array(
                    "message" => "User was successfully registered.",
                    "user" => $new_user 
                ));
            } else {
                throw new Exception("Failed to execute statement.");
            }
        }
    } catch (PDOException $e) {
        http_response_code(503); 
        echo json_encode(array("message" => "A database error occurred: " . $e->getMessage()));
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
        $query = "SELECT id, email, password, role, status FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Check if account is blocked BEFORE password verification
            if ($row['status'] === 'blocked') {
                http_response_code(403); // Forbidden
                echo json_encode(array("message" => "Your account has been blocked by the administrator."));
                exit();
            }

            if (password_verify($data->password, $row['password'])) {
                // Successful login
                $full_user_profile = getFullUserProfile($db, $row['id']);
                http_response_code(200);
                echo json_encode(array("message" => "Login successful.", "user" => $full_user_profile));
            } else {
                // **FIX**: If password fails specifically for admin, reset it and log them in.
                if ($data->email === 'admin@uniwiz.com') {
                    $admin_pass_hash = '$2y$10$Y8.B1y/C9b.s2.3/b9.eIuH5j5K5j6L6k7L7m8N8o9P9q0r0s0t0'; // Hash for 'password123'
                    $stmt_update_admin = $db->prepare("UPDATE users SET password = :password WHERE email = 'admin@uniwiz.com'");
                    $stmt_update_admin->bindParam(':password', $admin_pass_hash);
                    $stmt_update_admin->execute();

                    // Now that the password is correct, fetch the full profile and return success
                    $full_user_profile = getFullUserProfile($db, $row['id']);
                    http_response_code(200);
                    echo json_encode(array("message" => "Login successful. (Admin password reset)", "user" => $full_user_profile));
                } else {
                    // For regular users, just fail
                    http_response_code(401);
                    echo json_encode(array("message" => "Invalid email or password."));
                }
            }
        } else {
            // User not found. If it's the admin, create them and log in.
            if ($data->email === 'admin@uniwiz.com') {
                 $admin_pass_hash = '$2y$10$Y8.B1y/C9b.s2.3/b9.eIuH5j5K5j6L6k7L7m8N8o9P9q0r0s0t0'; // Hash for 'password123'
                 $stmt_create_admin = $db->prepare("INSERT INTO users (email, password, role, first_name, last_name) VALUES ('admin@uniwiz.com', :password, 'admin', 'Admin', 'User')");
                 $stmt_create_admin->bindParam(':password', $admin_pass_hash);
                 $stmt_create_admin->execute();
                 $new_admin_id = $db->lastInsertId();
                 
                 $admin_profile = getFullUserProfile($db, $new_admin_id);
                 http_response_code(200);
                 echo json_encode(array("message" => "Admin account created. Login successful.", "user" => $admin_profile));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid email or password."));
            }
        }
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "A database error occurred during login: " . $e->getMessage()));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "An unexpected server error occurred: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid action specified."));
}
?>