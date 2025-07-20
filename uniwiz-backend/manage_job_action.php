<?php
// FILE: uniwiz-backend/api/manage_job_action.php (NEW FILE)
// =========================================================
// This file handles actions like closing or deleting a job.

// --- Headers & DB Connection ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// --- Include and Check Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
if ($db === null) { 
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// --- Validate Data ---
if ($data === null || !isset($data->job_id) || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Job ID and action are required."]);
    exit();
}

try {
    $action = $data->action;
    $job_id = (int)$data->job_id; // Cast to integer for security

    if ($action === 'close') {
        $stmt = $db->prepare("UPDATE jobs SET status = 'closed' WHERE id = :job_id");
    } elseif ($action === 'delete') {
        $stmt = $db->prepare("DELETE FROM jobs WHERE id = :job_id");
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid action specified."]);
        exit();
    }

    $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        http_response_code(200);
        // Create a user-friendly message, e.g., "Job has been successfully closed."
        echo json_encode(["message" => "Job has been successfully " . $action . "d."]);
    } else {
        throw new Exception("Failed to perform action on the job.");
    }

} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
