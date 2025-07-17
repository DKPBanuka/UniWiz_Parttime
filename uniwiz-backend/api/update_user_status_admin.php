<?php
// FILE: uniwiz-backend/api/update_user_status_admin.php (NEW FILE)
// =====================================================================
// This endpoint allows an admin to update a user's status (active/blocked)
// and verification status (is_verified).

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
if ($data === null || !isset($data->target_user_id) || !isset($data->admin_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Target User ID and Admin ID are required."]);
    exit();
}

$target_user_id = (int)$data->target_user_id;
$admin_id = (int)$data->admin_id;
$new_status = isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : null;
$new_is_verified = isset($data->is_verified) ? (int)$data->is_verified : null;

try {
    // Security check: Ensure the user performing the action is actually an admin
    $stmt_check = $db->prepare("SELECT role FROM users WHERE id = :admin_id");
    $stmt_check->bindParam(':admin_id', $admin_id, PDO::PARAM_INT);
    $stmt_check->execute();
    $admin_user = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$admin_user || $admin_user['role'] !== 'admin') {
        http_response_code(403); // Forbidden
        echo json_encode(["message" => "You do not have permission to perform this action."]);
        exit();
    }

    // Construct the update query dynamically based on provided fields
    $update_fields = [];
    $params = [':target_user_id' => $target_user_id];

    if ($new_status !== null) {
        if (!in_array($new_status, ['active', 'blocked'])) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid status provided. Must be 'active' or 'blocked'."]);
            exit();
        }
        $update_fields[] = "status = :new_status";
        $params[':new_status'] = $new_status;
    }

    if ($new_is_verified !== null) {
        if (!in_array($new_is_verified, [0, 1])) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid verification status provided. Must be 0 or 1."]);
            exit();
        }
        $update_fields[] = "is_verified = :new_is_verified";
        $params[':new_is_verified'] = $new_is_verified;
    }

    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode(["message" => "No valid fields provided for update."]);
        exit();
    }

    $query = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = :target_user_id";
    $stmt = $db->prepare($query);

    foreach ($params as $key => &$val) {
        $param_type = is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR;
        $stmt->bindParam($key, $val, $param_type);
    }

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "User updated successfully."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found or no changes made."]);
        }
    } else {
        throw new Exception("Failed to update user.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
