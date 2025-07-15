<?php
// FILE: uniwiz-backend/api/get_publisher_stats.php (Final Production Version)
// =============================================================================

// --- Headers & DB Connection ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
if ($db === null) { 
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// --- Get and Validate publisher_id ---
if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Publisher ID is required."]);
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];

// --- Main Logic to Fetch Stats ---
try {
    $stats = [];

    // 1. Get Active Jobs Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM jobs WHERE publisher_id = :publisher_id AND status = 'active'");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['active_jobs'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Get Total Applicants Count
    $stmt = $db->prepare("
        SELECT COUNT(ja.id) as count 
        FROM job_applications ja 
        INNER JOIN jobs j ON ja.job_id = j.id 
        WHERE j.publisher_id = :publisher_id
    ");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['total_applicants'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 3. Get New Applicants Today
    $stmt = $db->prepare("
        SELECT COUNT(ja.id) as count 
        FROM job_applications ja 
        INNER JOIN jobs j ON ja.job_id = j.id 
        WHERE j.publisher_id = :publisher_id AND DATE(ja.applied_at) = CURDATE()
    ");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['new_applicants_today'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 4. Get Recent Applicants (Top 5)
    $stmt = $db->prepare("
        SELECT u.first_name, u.last_name, j.title as job_title, ja.applied_at 
        FROM job_applications ja 
        JOIN users u ON ja.student_id = u.id 
        JOIN jobs j ON ja.job_id = j.id 
        WHERE j.publisher_id = :publisher_id 
        ORDER BY ja.applied_at DESC 
        LIMIT 5
    ");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['recent_applicants'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($stats);

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "A database error occurred while fetching dashboard stats."]);
}
?>
