<?php
// FILE: uniwiz-backend/api/get_publisher_jobs.php (ENHANCED with Vacancy & Accepted Counts, and Expiry Status)
// =======================================================================================================
// This file now returns vacancy details, accepted counts, and a dynamic status for expired jobs.

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

// --- Get Parameters ---
if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Publisher ID is required."]);
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // **UPDATED**: Query now includes all fields needed for both display and editing, including application_deadline.
    $query = "
        SELECT 
            j.*, 
            jc.name as category_name,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'accepted') as accepted_count
        FROM jobs as j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        WHERE j.publisher_id = :publisher_id
    ";

    if (!empty($search_term)) {
        $query .= " AND j.title LIKE :search_term";
    }

    $query .= " ORDER BY j.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);

    if (!empty($search_term)) {
        $search_param = "%" . $search_term . "%";
        $stmt->bindParam(':search_term', $search_param, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $jobs_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $jobs_processed = [];
    foreach ($jobs_raw as $job) {
        // **NEW**: Logic to determine the display status
        $is_expired = ($job['application_deadline'] !== null && new DateTime() > new DateTime($job['application_deadline']));
        
        if ($job['status'] === 'active' && $is_expired) {
            $job['display_status'] = 'expired';
        } else {
            $job['display_status'] = $job['status'];
        }
        $jobs_processed[] = $job;
    }

    http_response_code(200);
    echo json_encode($jobs_processed);

} catch (Exception $e) { 
    http_response_code(503);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
