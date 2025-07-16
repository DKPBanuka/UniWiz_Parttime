<?php
// FILE: uniwiz-backend/api/get_student_profile.php (NEW FILE)
// =====================================================================
// This file fetches all public details for a specific student.

header("Access-Control-Allow-Origin: http://localhost:3000");
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

if (!isset($_GET['student_id']) || !filter_var($_GET['student_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Student ID is required."]);
    exit();
}
$student_id = (int)$_GET['student_id'];

try {
    $query = "
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.profile_image_url,
            sp.university_name,
            sp.field_of_study,
            sp.year_of_study,
            sp.languages_spoken,
            sp.skills,
            sp.cv_url
        FROM
            users u
        LEFT JOIN
            student_profiles sp ON u.id = sp.user_id
        WHERE
            u.id = :student_id AND u.role = 'student'
        LIMIT 1
    ";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt->execute();

    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student) {
        http_response_code(200);
        echo json_encode($student);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Student not found."]);
    }

} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(["message" => "A database error occurred: " . $e->getMessage()]);
}
?>
