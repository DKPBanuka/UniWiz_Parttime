<?php
// FILE: uniwiz-backend/api/get_reports_admin.php (UPDATED to include user roles)
// DESCRIPTION: Fetches all user-submitted reports for the admin panel, now including the roles of the reporter and the reported user.

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

try {
    // UPDATED: The query now joins the users table twice to fetch the role for both the reporter and the reported user.
    $query = "
        SELECT 
            r.id, r.reason, r.status, r.created_at,
            r.conversation_id,
            reporter.id as reporter_id,
            reporter.first_name as reporter_first_name,
            reporter.last_name as reporter_last_name,
            reporter.role as reporter_role, -- NEW: Added reporter's role
            reported.id as reported_id,
            reported.first_name as reported_first_name,
            reported.last_name as reported_last_name,
            reported.role as reported_role -- NEW: Added reported user's role
        FROM reports r
        JOIN users reporter ON r.reporter_id = reporter.id
        JOIN users reported ON r.reported_user_id = reported.id
        ORDER BY r.created_at DESC
    ";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($reports);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
