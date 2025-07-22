<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['job_id']) || !isset($data['new_deadline'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing job_id or new_deadline."]);
    exit();
}

$job_id = (int)$data['job_id'];
$new_deadline = $data['new_deadline'];

try {
    $query = "UPDATE jobs SET application_deadline = :new_deadline, status = 'active' WHERE id = :job_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':new_deadline', $new_deadline);
    $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(["message" => "Job deadline extended successfully."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?> 