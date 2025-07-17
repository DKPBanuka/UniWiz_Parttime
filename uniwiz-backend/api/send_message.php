<?php
// FILE: uniwiz-backend/api/send_message.php (NEW FILE)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
// ... (add other necessary headers)

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->sender_id) || !isset($data->receiver_id) || !isset($data->message_text)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

$sender_id = (int)$data->sender_id;
$receiver_id = (int)$data->receiver_id;
$message_text = htmlspecialchars(strip_tags($data->message_text));

if (empty(trim($message_text))) {
    http_response_code(400);
    echo json_encode(["message" => "Message cannot be empty."]);
    exit();
}


try {
    $db->beginTransaction();

    // Find or create a conversation
    $query_conv = "SELECT id FROM conversations WHERE (user_one_id = :u1 AND user_two_id = :u2) OR (user_one_id = :u2 AND user_two_id = :u1)";
    $stmt_conv = $db->prepare($query_conv);
    $stmt_conv->bindParam(':u1', $sender_id, PDO::PARAM_INT);
    $stmt_conv->bindParam(':u2', $receiver_id, PDO::PARAM_INT);
    $stmt_conv->execute();

    if ($stmt_conv->rowCount() > 0) {
        $conversation = $stmt_conv->fetch(PDO::FETCH_ASSOC);
        $conversation_id = $conversation['id'];
    } else {
        $query_create_conv = "INSERT INTO conversations (user_one_id, user_two_id) VALUES (:u1, :u2)";
        $stmt_create_conv = $db->prepare($query_create_conv);
        $stmt_create_conv->bindParam(':u1', $sender_id, PDO::PARAM_INT);
        $stmt_create_conv->bindParam(':u2', $receiver_id, PDO::PARAM_INT);
        $stmt_create_conv->execute();
        $conversation_id = $db->lastInsertId();
    }

    // Insert the message
    $query_msg = "INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text) VALUES (:conv_id, :sender_id, :receiver_id, :msg_text)";
    $stmt_msg = $db->prepare($query_msg);
    $stmt_msg->bindParam(':conv_id', $conversation_id, PDO::PARAM_INT);
    $stmt_msg->bindParam(':sender_id', $sender_id, PDO::PARAM_INT);
    $stmt_msg->bindParam(':receiver_id', $receiver_id, PDO::PARAM_INT);
    $stmt_msg->bindParam(':msg_text', $message_text, PDO::PARAM_STR);
    
    if($stmt_msg->execute()){
        $db->commit();
        http_response_code(201);
        echo json_encode(["message" => "Message sent successfully.", "conversation_id" => $conversation_id]);
    } else {
        throw new Exception("Failed to send message.");
    }

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>