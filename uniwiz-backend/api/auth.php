<?php
// FILE: uniwiz-backend/api/auth.php (Updated to handle user roles and auto-login)
// ======================================================================

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Suppress PHP Errors for clean JSON output ---
ini_set('display_errors', 0);
error_reporting(0);

// --- Handle Preflight (OPTIONS) Request ---
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
    echo json_encode(array("message" => "Database connection failed."));
    exit(); 
}

// --- Get Posted Data ---
$data = json_decode(file_get_contents("php://input"));

if ($data === null || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid request. Action not specified."));
    exit();
}

// --- ACTION ROUTER ---
if ($data->action === 'register') {

    // --- REGISTRATION LOGIC ---
    if (!isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data for registration."));
        exit();
    }

    try {
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400); 
            echo json_encode(array("message" => "This email is already registered."));
        } else {
            $query = "INSERT INTO users (email, password, first_name, last_name, role) VALUES (:email, :password, :first_name, :last_name, :role)";
            $stmt = $db->prepare($query);

            $email = htmlspecialchars(strip_tags($data->email));
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $firstName = "";
            $lastName = "";
            $role = htmlspecialchars(strip_tags($data->role));

            if ($role !== 'student' && $role !== 'publisher') {
                http_response_code(400);
                echo json_encode(array("message" => "Invalid role specified."));
                exit();
            }

            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password_hash);
            $stmt->bindParam(':first_name', $firstName);
            $stmt->bindParam(':last_name', $lastName);
            $stmt->bindParam(':role', $role);

            if ($stmt->execute()) {
                // --- CHANGE IS HERE: Auto-login the user after registration ---
                $new_user_id = $db->lastInsertId();

                // Fetch the new user's data to send back to the frontend
                $query = "SELECT id, email, first_name, last_name, role FROM users WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $new_user_id);
                $stmt->execute();
                $new_user = $stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(201);
                // Send back the user object for auto-login
                echo json_encode(array(
                    "message" => "User was successfully registered.",
                    "user" => $new_user 
                ));
            } else {
                throw new Exception("Failed to execute statement.");
            }
        }
    } catch (PDOException $e) {
        http_response_code(503); 
        echo json_encode(array("message" => "A database error occurred."));
    }

} elseif ($data->action === 'login') {
    // --- LOGIN LOGIC (No changes needed here) ---
    if (!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data for login."));
        exit();
    }
    try {
        $query = "SELECT id, email, password, first_name, last_name, role FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data->password, $row['password'])) {
                unset($row['password']);
                http_response_code(200);
                echo json_encode(array("message" => "Login successful.", "user" => $row));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid email or password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid email or password."));
        }
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "A database error occurred during login."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid action specified."));
}
?>
