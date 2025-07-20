<?php
// FILE: uniwiz-backend/api/get_messages_admin.php (NEW FILE)
// DESCRIPTION: Fetches messages for a conversation without marking them as read.
// This is specifically for the admin's read-only view.

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

if (!isset($_GET['conversation_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Conversation ID is required."]);
    exit();
}
$conversation_id = (int)$_GET['conversation_id'];

try {
    // Fetch all messages for the conversation without updating the 'is_read' status.
    $query_fetch = "SELECT * FROM messages WHERE conversation_id = :conversation_id ORDER BY created_at ASC";
    $stmt_fetch = $db->prepare($query_fetch);
    $stmt_fetch->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
    $stmt_fetch->execute();
    $messages = $stmt_fetch->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($messages);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
