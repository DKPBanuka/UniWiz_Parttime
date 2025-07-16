<?php
// FILE: uniwiz-backend/api/get_job_details.php (FIXED to include company name)
// ==============================================================================
// This file fetches all details for a single job, including the company name.

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

// --- Get job_id ---
if (!isset($_GET['job_id']) || !filter_var($_GET['job_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Job ID is required."]);
    exit();
}
$job_id = (int)$_GET['job_id'];

try {
    // FIX: Join with the users table to get the company_name
    $query = "
        SELECT 
            j.*,
            u.company_name,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'accepted') as accepted_count
        FROM 
            jobs j
        LEFT JOIN
            users u ON j.publisher_id = u.id
        WHERE 
            j.id = :job_id 
        LIMIT 1
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $job = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($job) {
        http_response_code(200);
        echo json_encode($job);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Job not found."]);
    }

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "Database error while fetching job details: " . $e->getMessage()]);
}
?>
