<?php
// FILE: uniwiz-backend/api/update_job_status_admin.php (NEW FILE)
// ==============================================================
// This endpoint allows an admin to update the status of a job (e.g., approve/reject).

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$data = json_decode(file_get_contents("php://input"));

// Basic validation
if ($data === null || !isset($data->job_id) || !isset($data->status) || !isset($data->admin_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Job ID, new status, and Admin ID are required."]);
    exit();
}

try {
    // Security check: Ensure the user performing the action is actually an admin
    $stmt_check = $db->prepare("SELECT role FROM users WHERE id = :admin_id");
    $stmt_check->bindParam(':admin_id', $data->admin_id);
    $stmt_check->execute();
    $admin_user = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$admin_user || $admin_user['role'] !== 'admin') {
        http_response_code(403); // Forbidden
        echo json_encode(["message" => "You do not have permission to perform this action."]);
        exit();
    }

    // Proceed with the update
    $allowed_statuses = ['active', 'closed']; // Admin can approve ('active') or reject ('closed')
    if (!in_array($data->status, $allowed_statuses)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid status provided for this action."]);
        exit();
    }

    $query = "UPDATE jobs SET status = :status WHERE id = :job_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':job_id', $data->job_id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Job status updated successfully."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Job not found or status is already the same."]);
        }
    } else {
        throw new Exception("Failed to update job status.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
 