<?php
// FILE: uniwiz-backend/api/update_profile.php (FIXED to handle publisher profiles)
// =========================================================================

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Handle Preflight Request ---
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
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// --- Get Data from POST (now multipart/form-data) ---
// This script expects data to be sent as multipart/form-data,
// as it handles file uploads (profile picture, CV).
if (!isset($_POST['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "User ID is required."]);
    exit();
}

$user_id = $_POST['user_id'];
$profile_image_url_to_update = null;
$cv_url_to_update = null;

try {
    // --- Get user role to determine which profile table to update ---
    $stmt_role = $db->prepare("SELECT role FROM users WHERE id = :user_id LIMIT 1");
    $stmt_role->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt_role->execute();
    $user_role_row = $stmt_role->fetch(PDO::FETCH_ASSOC);
    if (!$user_role_row) {
        // If user is not found, return an error
        throw new Exception("User not found.");
    }
    $user_role = $user_role_row['role'];

    // --- 1. Handle Profile Picture Upload (if provided) ---
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $file = $_FILES['profile_picture'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        // Validate file type and size (2MB limit)
        if (!in_array($file['type'], $allowed_types) || $file['size'] > 2097152) {
             throw new Exception("Invalid profile picture. Must be JPG, PNG, or GIF and under 2MB.");
        }
        
        $target_dir = "uploads/"; // Directory to save profile pictures
        // Create directory if it doesn't exist
        if (!is_dir($target_dir)) { mkdir($target_dir, 0777, true); }
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        // Generate a unique filename to prevent conflicts
        $new_filename = "user_" . $user_id . "_" . time() . "." . $file_extension;
        $target_file = $target_dir . $new_filename;
        
        // Move uploaded file to its permanent location
        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $profile_image_url_to_update = $target_file; // Store path relative to API folder
        } else {
            throw new Exception("Failed to move uploaded profile picture.");
        }
    }

    // --- 2. Handle CV Upload (if provided and user is a student) ---
    if ($user_role === 'student' && isset($_FILES['cv_file']) && $_FILES['cv_file']['error'] == 0) {
        $file = $_FILES['cv_file'];
        // Validate file type (PDF only) and size (5MB limit)
        if ($file['type'] !== 'application/pdf' || $file['size'] > 5242880) {
            throw new Exception("Invalid CV file. Must be a PDF and under 5MB.");
        }

        $target_dir = "uploads/cvs/"; // Directory to save CVs
        // Create directory if it doesn't exist
        if (!is_dir($target_dir)) { mkdir($target_dir, 0777, true); }
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        // Generate a unique filename
        $new_filename = "cv_user_" . $user_id . "_" . time() . "." . $file_extension;
        $target_file = $target_dir . $new_filename;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $cv_url_to_update = $target_file; // Store path relative to API folder
        } else {
            throw new Exception("Failed to move uploaded CV.");
        }
    }
    
    // --- 3. Update 'users' table ---
    // Prepare base query for the 'users' table
    $query_users = "UPDATE users SET first_name = :first_name, last_name = :last_name";
    $params_users = [
        ':user_id' => $user_id,
        ':first_name' => htmlspecialchars(strip_tags($_POST['first_name'])),
        ':last_name' => htmlspecialchars(strip_tags($_POST['last_name'])),
    ];
    // Conditionally add company_name if provided (relevant for publishers)
    if (isset($_POST['company_name'])) {
        $query_users .= ", company_name = :company_name";
        $params_users[':company_name'] = htmlspecialchars(strip_tags($_POST['company_name']));
    }
    // Conditionally add profile_image_url if a new one was uploaded
    if ($profile_image_url_to_update !== null) {
        $query_users .= ", profile_image_url = :profile_image_url";
        $params_users[':profile_image_url'] = $profile_image_url_to_update;
    }
    $query_users .= " WHERE id = :user_id"; // Add WHERE clause
    $stmt_users = $db->prepare($query_users);
    $stmt_users->execute($params_users); // Execute the update

    // --- 4. Update or Insert 'student_profiles' table (if user is a student) ---
    if ($user_role === 'student') {
        // Check if a student profile already exists for this user
        $stmt_check = $db->prepare("SELECT id FROM student_profiles WHERE user_id = :user_id LIMIT 1");
        $stmt_check->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt_check->execute();
        $profile_exists = $stmt_check->rowCount() > 0;

        // Prepare parameters for student profile update/insert
        $params_student = [
            ':user_id' => $user_id,
            ':university_name' => isset($_POST['university_name']) ? htmlspecialchars(strip_tags($_POST['university_name'])) : null,
            ':field_of_study' => isset($_POST['field_of_study']) ? htmlspecialchars(strip_tags($_POST['field_of_study'])) : null,
            ':year_of_study' => isset($_POST['year_of_study']) ? htmlspecialchars(strip_tags($_POST['year_of_study'])) : null,
            ':languages_spoken' => isset($_POST['languages_spoken']) ? htmlspecialchars(strip_tags($_POST['languages_spoken'])) : null,
            ':preferred_categories' => isset($_POST['preferred_categories']) ? htmlspecialchars(strip_tags($_POST['preferred_categories'])) : null,
            ':skills' => isset($_POST['skills']) ? htmlspecialchars(strip_tags($_POST['skills'])) : null,
        ];
        // Conditionally add cv_url if a new one was uploaded
        if ($cv_url_to_update !== null) {
            $params_student[':cv_url'] = $cv_url_to_update;
        }

        if ($profile_exists) {
            // If profile exists, update existing record
            $query_student = "UPDATE student_profiles SET university_name = :university_name, field_of_study = :field_of_study, year_of_study = :year_of_study, languages_spoken = :languages_spoken, preferred_categories = :preferred_categories, skills = :skills";
            if ($cv_url_to_update !== null) {
                $query_student .= ", cv_url = :cv_url";
            }
            $query_student .= " WHERE user_id = :user_id";
        } else {
            // If profile does not exist, insert a new record
            $cols = "user_id, university_name, field_of_study, year_of_study, languages_spoken, preferred_categories, skills";
            $vals = ":user_id, :university_name, :field_of_study, :year_of_study, :languages_spoken, :preferred_categories, :skills";
            if ($cv_url_to_update !== null) {
                $cols .= ", cv_url";
                $vals .= ", :cv_url";
            }
            $query_student = "INSERT INTO student_profiles ($cols) VALUES ($vals)";
        }
        $stmt_student = $db->prepare($query_student);
        $stmt_student->execute($params_student); // Execute the student profile update/insert
    }

    // --- 5. Update or Insert 'publisher_profiles' table (if user is a publisher) ---
    if ($user_role === 'publisher') {
        // Check if a publisher profile already exists for this user
        $stmt_check = $db->prepare("SELECT id FROM publisher_profiles WHERE user_id = :user_id LIMIT 1");
        $stmt_check->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt_check->execute();
        $profile_exists = $stmt_check->rowCount() > 0;

        // Prepare parameters for publisher profile update/insert
        $params_publisher = [
            ':user_id' => $user_id,
            ':about' => isset($_POST['about']) ? htmlspecialchars(strip_tags($_POST['about'])) : null,
            ':industry' => isset($_POST['industry']) ? htmlspecialchars(strip_tags($_POST['industry'])) : null,
            ':website_url' => isset($_POST['website_url']) ? htmlspecialchars(strip_tags($_POST['website_url'])) : null,
            ':address' => isset($_POST['address']) ? htmlspecialchars(strip_tags($_POST['address'])) : null,
            ':phone_number' => isset($_POST['phone_number']) ? htmlspecialchars(strip_tags($_POST['phone_number'])) : null,
            ':facebook_url' => isset($_POST['facebook_url']) ? htmlspecialchars(strip_tags($_POST['facebook_url'])) : null,
            ':linkedin_url' => isset($_POST['linkedin_url']) ? htmlspecialchars(strip_tags($_POST['linkedin_url'])) : null,
            ':instagram_url' => isset($_POST['instagram_url']) ? htmlspecialchars(strip_tags($_POST['instagram_url'])) : null,
        ];

        if ($profile_exists) {
            // If profile exists, update existing record
            $query_publisher = "UPDATE publisher_profiles SET about = :about, industry = :industry, website_url = :website_url, address = :address, phone_number = :phone_number, facebook_url = :facebook_url, linkedin_url = :linkedin_url, instagram_url = :instagram_url WHERE user_id = :user_id";
        } else {
            // If profile does not exist, insert a new record
            $query_publisher = "INSERT INTO publisher_profiles (user_id, about, industry, website_url, address, phone_number, facebook_url, linkedin_url, instagram_url) VALUES (:user_id, :about, :industry, :website_url, :address, :phone_number, :facebook_url, :linkedin_url, :instagram_url)";
        }
        $stmt_publisher = $db->prepare($query_publisher);
        $stmt_publisher->execute($params_publisher); // Execute the publisher profile update/insert
    }
    
    // --- 6. Fetch and Return Fully Updated User Data ---
    // Fetch the complete user profile after all updates to return the latest data to the frontend
    $query_fetch = "
        SELECT 
            u.id, u.email, u.first_name, u.last_name, u.role, u.company_name, u.profile_image_url,
            u.is_verified, u.status, -- Include is_verified and status
            sp.university_name, sp.field_of_study, sp.year_of_study, sp.languages_spoken, sp.preferred_categories, sp.skills, sp.cv_url,
            pp.about, pp.industry, pp.website_url, pp.address, pp.phone_number, pp.facebook_url, pp.linkedin_url, pp.instagram_url
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN publisher_profiles pp ON u.id = pp.user_id
        WHERE u.id = :id
    ";
    $stmt_fetch = $db->prepare($query_fetch);
    $stmt_fetch->bindParam(':id', $user_id, PDO::PARAM_INT);
    $stmt_fetch->execute();
    $updated_user = $stmt_fetch->fetch(PDO::FETCH_ASSOC);

    http_response_code(200); // OK
    echo json_encode([
        "message" => "Profile updated successfully.",
        "user" => $updated_user
    ]);

} catch (PDOException $e) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "Database Error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Server Error: " . $e->getMessage()]);
}
?>
