<?php
// FILE: uniwiz-backend/api/update_profile.php (Final Production Version with Student Profile Fields)
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

// --- Get Posted Data ---
$data = json_decode(file_get_contents("php://input"));

// Basic validation for common fields
if ($data === null || !isset($data->user_id) || !isset($data->first_name) || !isset($data->last_name)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. user_id, first_name, and last_name are required."]);
    exit();
}

// Fetch user's current role to apply conditional validation and updates
$stmt_role = $db->prepare("SELECT role FROM users WHERE id = :user_id LIMIT 1");
$stmt_role->bindParam(':user_id', $data->user_id, PDO::PARAM_INT);
$stmt_role->execute();
$user_role_row = $stmt_role->fetch(PDO::FETCH_ASSOC);

if (!$user_role_row) {
    http_response_code(404);
    echo json_encode(["message" => "User not found."]);
    exit();
}
$user_role = $user_role_row['role'];

// Conditional validation: If user is a publisher, company_name is required
if ($user_role === 'publisher' && (!isset($data->company_name) || empty(trim($data->company_name)))) {
    http_response_code(400);
    echo json_encode(["message" => "Company name is required for publishers."]);
    exit();
}

// --- Main Update Logic ---
try {
    // Start building the query for the 'users' table
    $query_users = "UPDATE users SET first_name = :first_name, last_name = :last_name";
    $params_users = [
        ':user_id' => $data->user_id,
        ':first_name' => htmlspecialchars(strip_tags($data->first_name)),
        ':last_name' => htmlspecialchars(strip_tags($data->last_name))
    ];

    // Conditionally add company_name to users query and params if it exists in data
    // (Assuming company_name is still in users table for now, based on previous context)
    if (isset($data->company_name)) {
        $query_users .= ", company_name = :company_name";
        $params_users[':company_name'] = htmlspecialchars(strip_tags($data->company_name));
    }

    $query_users .= " WHERE id = :user_id";

    $stmt_users = $db->prepare($query_users);

    // Bind parameters dynamically for users table
    foreach ($params_users as $key => $value) {
        $stmt_users->bindValue($key, $value);
    }
    $stmt_users->execute(); // Execute users table update


    // --- Update student_profiles table if user is a student ---
    if ($user_role === 'student') {
        // Check if student profile exists, if not, create it
        $stmt_check_student_profile = $db->prepare("SELECT id FROM student_profiles WHERE user_id = :user_id LIMIT 1");
        $stmt_check_student_profile->bindParam(':user_id', $data->user_id, PDO::PARAM_INT);
        $stmt_check_student_profile->execute();
        $student_profile_exists = $stmt_check_student_profile->rowCount() > 0;

        $query_student_profile = "";
        $params_student_profile = [':user_id' => $data->user_id];

        // Prepare data for student_profiles table
        $university_name = isset($data->university_name) ? htmlspecialchars(strip_tags($data->university_name)) : null;
        $field_of_study = isset($data->field_of_study) ? htmlspecialchars(strip_tags($data->field_of_study)) : null;
        $year_of_study = isset($data->year_of_study) ? htmlspecialchars(strip_tags($data->year_of_study)) : null;
        $languages_spoken = isset($data->languages_spoken) ? htmlspecialchars(strip_tags($data->languages_spoken)) : null; // Expects comma-separated string
        $preferred_categories = isset($data->preferred_categories) ? htmlspecialchars(strip_tags($data->preferred_categories)) : null; // Expects comma-separated string
        $skills = isset($data->skills) ? htmlspecialchars(strip_tags($data->skills)) : null; // Expects comma-separated string
        // cv_url is handled by a separate upload API, not directly here.

        $params_student_profile[':university_name'] = $university_name;
        $params_student_profile[':field_of_study'] = $field_of_study;
        $params_student_profile[':year_of_study'] = $year_of_study;
        $params_student_profile[':languages_spoken'] = $languages_spoken;
        $params_student_profile[':preferred_categories'] = $preferred_categories;
        $params_student_profile[':skills'] = $skills;

        if ($student_profile_exists) {
            // Update existing student profile
            $query_student_profile = "
                UPDATE student_profiles SET 
                    university_name = :university_name,
                    field_of_study = :field_of_study,
                    year_of_study = :year_of_study,
                    languages_spoken = :languages_spoken,
                    preferred_categories = :preferred_categories,
                    skills = :skills
                WHERE user_id = :user_id
            ";
        } else {
            // Insert new student profile
            $query_student_profile = "
                INSERT INTO student_profiles 
                (user_id, university_name, field_of_study, year_of_study, languages_spoken, preferred_categories, skills)
                VALUES 
                (:user_id, :university_name, :field_of_study, :year_of_study, :languages_spoken, :preferred_categories, :skills)
            ";
        }

        $stmt_student_profile = $db->prepare($query_student_profile);
        foreach ($params_student_profile as $key => $value) {
            $stmt_student_profile->bindValue($key, $value);
        }
        $stmt_student_profile->execute(); // Execute student_profiles table update
    }


    // After updating, fetch the complete, updated user data to send back
    // This query now joins with student_profiles to get all student-specific data
    $query_fetch = "
        SELECT 
            u.id, u.email, u.first_name, u.last_name, u.role, u.company_name, u.profile_image_url,
            sp.university_name, sp.field_of_study, sp.year_of_study, sp.languages_spoken, sp.preferred_categories, sp.skills, sp.cv_url
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = :id
    ";
    $stmt_fetch = $db->prepare($query_fetch);
    $stmt_fetch->bindParam(':id', $data->user_id, PDO::PARAM_INT);
    $stmt_fetch->execute();
    $updated_user = $stmt_fetch->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "message" => "Profile updated successfully.",
        "user" => $updated_user
    ]);

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "A database error occurred: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
}
?>
