<?php
// FILE: uniwiz-backend/api/update_report_status_admin.php (NEW FILE)
// DESCRIPTION: Allows an admin to update the status of a report.

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->report_id) || !isset($data->status) || !isset($data->admin_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Report ID, status, and Admin ID are required."]);
    exit();
}

try {
    // Security check: Ensure the user is an admin
    $stmt_check = $db->prepare("SELECT role FROM users WHERE id = :admin_id");
    $stmt_check->bindParam(':admin_id', $data->admin_id);
    $stmt_check->execute();
    $admin_user = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$admin_user || $admin_user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Permission denied."]);
        exit();
    }

    $allowed_statuses = ['resolved', 'dismissed', 'pending'];
    if (!in_array($data->status, $allowed_statuses)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid status provided."]);
        exit();
    }

    $query = "UPDATE reports SET status = :status WHERE id = :report_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':report_id', $data->report_id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Report status updated successfully."]);
    } else {
        throw new Exception("Failed to update report status.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
