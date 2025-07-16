<?php
// FILE: uniwiz-backend/api/applications.php (FIXED)
// =================================================================
// This file now correctly sets the default status of new applications to 'pending'.

// --- Headers, DB Connection ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
if ($db === null) { 
    http_response_code(503); 
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}
$data = json_decode(file_get_contents("php://input"));

// Now we check for all three required fields
if ($data === null || !isset($data->user_id) || !isset($data->job_id) || !isset($data->proposal)) {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. User ID, Job ID, and Proposal are required."));
    exit();
}

// --- Main Application Logic ---
try {
    // 1. Check if the user has already applied for this job
    $query = "SELECT id FROM job_applications WHERE student_id = :user_id AND job_id = :job_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':job_id', $data->job_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(array("message" => "You have already applied for this job."));
    } else {
        // 2. If not, insert the new application
        $query = "INSERT INTO job_applications (student_id, job_id, proposal, status) VALUES (:student_id, :job_id, :proposal, :status)";
        $stmt = $db->prepare($query);

        $studentId = htmlspecialchars(strip_tags($data->user_id));
        $jobId = htmlspecialchars(strip_tags($data->job_id));
        $proposal = htmlspecialchars(strip_tags($data->proposal));
        
        // **FIX**: The default status is now 'pending' instead of 'applied'
        $status = "pending";

        $stmt->bindParam(':student_id', $studentId);
        $stmt->bindParam(':job_id', $jobId);
        $stmt->bindParam(':proposal', $proposal);
        $stmt->bindParam(':status', $status);

        if($stmt->execute()){
            http_response_code(201);
            echo json_encode(array("message" => "Application submitted successfully."));
        } else {
            throw new Exception("Could not execute the application statement.");
        }
    }
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(array("message" => "A database error occurred while submitting the application."));
}
?>
