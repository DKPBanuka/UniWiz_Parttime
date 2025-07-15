<?php
// FILE: uniwiz-backend/api/get_student_stats.php (NEW FILE)
// =========================================================
// This file fetches statistics relevant to a student's dashboard.

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // OK
    exit();
}

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Check for database connection failure
if ($db === null) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// --- Get and Validate student_id ---
// Ensure student_id is provided and is a valid integer
if (!isset($_GET['student_id']) || !filter_var($_GET['student_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "A valid Student ID is required."]);
    exit();
}
$student_id = (int)$_GET['student_id'];

try {
    $stats = [];

    // 1. Get Applications Sent Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM job_applications WHERE student_id = :student_id");
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['applications_sent'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Get Profile Views (Placeholder - requires more complex tracking logic)
    // For now, this is a mock value or could be fetched from a 'profile_views' table
    $stats['profile_views'] = 12; // Mock data for demonstration

    // 3. Get Offers Received (Placeholder - requires 'offers' table and logic)
    // For now, this is a mock value or could be fetched from an 'offers' table
    $stats['offers_received'] = 1; // Mock data for demonstration

    // Set HTTP response code to 200 (OK)
    http_response_code(200);
    // Return stats as JSON
    echo json_encode($stats);

} catch (PDOException $e) {
    // Catch any PDO (database) exceptions
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "A database error occurred while fetching student stats."]);
} catch (Exception $e) {
    // Catch any other general exceptions
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "An unexpected server error occurred."]);
}
?>
