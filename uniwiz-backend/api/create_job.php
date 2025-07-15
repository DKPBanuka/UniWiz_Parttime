<?php
// FILE: uniwiz-backend/api/create_job.php (Final Advanced Version)
// =================================================================

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
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}
$data = json_decode(file_get_contents("php://input"));

// --- Validate Data ---
if ( $data === null || !isset($data->publisher_id) || !isset($data->title) || !isset($data->status) ) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

// --- Main Create Job Logic ---
try {
    // **CHANGE**: Removed estimated_duration, added start_date and end_date
    $query = "
        INSERT INTO jobs 
        (publisher_id, category_id, title, description, skills_required, job_type, payment_range, start_date, end_date, status) 
        VALUES 
        (:publisher_id, :category_id, :title, :description, :skills_required, :job_type, :payment_range, :start_date, :end_date, :status)
    ";

    $stmt = $db->prepare($query);

    // Sanitize data
    $publisher_id = htmlspecialchars(strip_tags($data->publisher_id));
    $category_id = htmlspecialchars(strip_tags($data->category_id));
    $title = htmlspecialchars(strip_tags($data->title));
    $description = htmlspecialchars(strip_tags($data->description));
    $job_type = htmlspecialchars(strip_tags($data->job_type));
    $payment_range = htmlspecialchars(strip_tags($data->payment_range));
    
    // **FIX**: Ensure skills_required is handled correctly
    $skills_required = isset($data->skills_required) ? htmlspecialchars(strip_tags($data->skills_required)) : "";
    
    $start_date = isset($data->start_date) && !empty($data->start_date) ? htmlspecialchars(strip_tags($data->start_date)) : null;
    $end_date = isset($data->end_date) && !empty($data->end_date) ? htmlspecialchars(strip_tags($data->end_date)) : null;
    
    $status = htmlspecialchars(strip_tags($data->status));
    if ($status !== 'active' && $status !== 'draft') {
        $status = 'draft';
    }

    // Bind parameters
    $stmt->bindParam(':publisher_id', $publisher_id);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':skills_required', $skills_required);
    $stmt->bindParam(':job_type', $job_type);
    $stmt->bindParam(':payment_range', $payment_range);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->bindParam(':status', $status);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Job post saved successfully."]);
    } else {
        throw new Exception("Failed to save job post.");
    }

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "A database error occurred while saving the job."]);
}
?>
