<?php
// FILE: uniwiz-backend/api/update_profile.php (Final Production Version)
// =========================================================================

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Handle Preflight Request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503); 
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// --- Get Posted Data ---
$data = json_decode(file_get_contents("php://input"));

if ($data === null || !isset($data->user_id) || !isset($data->first_name) || !isset($data->last_name)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. user_id, first_name, and last_name are required."]);
    exit();
}

// --- Main Update Logic ---
try {
    // Check if 'company_name' is sent from the frontend.
    if (isset($data->company_name)) {
        $query = "UPDATE users SET first_name = :first_name, last_name = :last_name, company_name = :company_name WHERE id = :user_id";
    } else {
        $query = "UPDATE users SET first_name = :first_name, last_name = :last_name WHERE id = :user_id";
    }

    $stmt = $db->prepare($query);

    // Sanitize data
    $userId = htmlspecialchars(strip_tags($data->user_id));
    $firstName = htmlspecialchars(strip_tags($data->first_name));
    $lastName = htmlspecialchars(strip_tags($data->last_name));

    // Bind common parameters
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':first_name', $firstName);
    $stmt->bindParam(':last_name', $lastName);
    
    // Bind company_name only if it exists
    if (isset($data->company_name)) {
        $companyName = htmlspecialchars(strip_tags($data->company_name));
        $stmt->bindParam(':company_name', $companyName);
    }

    if ($stmt->execute()) {
        // After updating, fetch the complete, updated user data to send back
        $query = "SELECT id, email, first_name, last_name, role, company_name FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            "message" => "Profile updated successfully.",
            "user" => $updated_user
        ]);
    } else {
        throw new Exception("Failed to update profile.");
    }

} catch (PDOException $e) {
    // Generic catch-all for any other errors during the process
    http_response_code(503); 
    echo json_encode(array("message" => "An internal server error occurred. Unable to update profile."));
}
?>
