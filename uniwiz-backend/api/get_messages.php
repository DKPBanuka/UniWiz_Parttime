<?php
// FILE: uniwiz-backend/api/get_messages.php (NEW FILE)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
// ... (add other necessary headers)

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if (!isset($_GET['conversation_id']) || !isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Conversation ID and User ID are required."]);
    exit();
}
$conversation_id = (int)$_GET['conversation_id'];
$user_id = (int)$_GET['user_id'];

try {
    $db->beginTransaction();

    // Mark messages as read
    $query_update = "UPDATE messages SET is_read = 1 WHERE conversation_id = :conversation_id AND receiver_id = :user_id AND is_read = 0";
    $stmt_update = $db->prepare($query_update);
    $stmt_update->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
    $stmt_update->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt_update->execute();

    // Fetch all messages for the conversation
    $query_fetch = "SELECT * FROM messages WHERE conversation_id = :conversation_id ORDER BY created_at ASC";
    $stmt_fetch = $db->prepare($query_fetch);
    $stmt_fetch->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
    $stmt_fetch->execute();
    $messages = $stmt_fetch->fetchAll(PDO::FETCH_ASSOC);

    $db->commit();

    http_response_code(200);
    echo json_encode($messages);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>