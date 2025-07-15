<?php
// FILE: uniwiz-backend/api/get_job_details.php (NEW FILE)
// =======================================================
// This file fetches all details for a single job to pre-fill the edit form.

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
    // Select all columns for the specific job
    $query = "SELECT * FROM jobs WHERE id = :job_id LIMIT 1";
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
    echo json_encode(["message" => "Database error while fetching job details."]);
}
?>