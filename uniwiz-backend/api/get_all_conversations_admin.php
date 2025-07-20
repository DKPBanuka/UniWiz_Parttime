<?php
// FILE: uniwiz-backend/api/get_all_conversations_admin.php (NEW FILE)
// DESCRIPTION: Fetches all conversations in the system for the admin panel.

header("Access-Control-Allow-Origin: *");
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

try {
    // This query joins conversations with both users to get their names.
    $query = "
        SELECT 
            c.id as conversation_id,
            c.job_id,
            u1.id as user_one_id,
            u1.first_name as user_one_first_name,
            u1.last_name as user_one_last_name,
            u1.company_name as user_one_company_name,
            u1.profile_image_url as user_one_profile_image,
            u2.id as user_two_id,
            u2.first_name as user_two_first_name,
            u2.last_name as user_two_last_name,
            u2.company_name as user_two_company_name,
            u2.profile_image_url as user_two_profile_image,
            (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM conversations c
        JOIN users u1 ON c.user_one_id = u1.id
        JOIN users u2 ON c.user_two_id = u2.id
        ORDER BY last_message_time DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($conversations);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
