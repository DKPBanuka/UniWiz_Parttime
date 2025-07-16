<?php
// FILE: uniwiz-backend/api/update_application_status.php (NEW FILE)
// =====================================================================
// This file handles updating the status of a specific job application.

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

if ($data === null || !isset($data->application_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Application ID and new status are required."]);
    exit();
}

$allowed_statuses = ['viewed', 'accepted', 'rejected', 'pending'];
if (!in_array($data->status, $allowed_statuses)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid status provided."]);
    exit();
}

try {
    $query = "UPDATE job_applications SET status = :status WHERE id = :application_id";
    $stmt = $db->prepare($query);

    $application_id = htmlspecialchars(strip_tags($data->application_id));
    $status = htmlspecialchars(strip_tags($data->status));

    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':application_id', $application_id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Application status updated successfully."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Application not found or status is already the same."]);
        }
    } else {
        throw new Exception("Failed to update application status.");
    }

} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
