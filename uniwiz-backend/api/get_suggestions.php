<?php
// FILE: uniwiz-backend/api/get_suggestions.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

try {
    // Fetch all skill names
    $skills_stmt = $db->prepare("SELECT name FROM skills ORDER BY name ASC");
    $skills_stmt->execute();
    $skills = $skills_stmt->fetchAll(PDO::FETCH_COLUMN, 0);

    // Fetch all category names
    $categories_stmt = $db->prepare("SELECT name FROM job_categories ORDER BY name ASC");
    $categories_stmt->execute();
    $categories = $categories_stmt->fetchAll(PDO::FETCH_COLUMN, 0);

    // Return both lists as a JSON object
    http_response_code(200);
    echo json_encode([
        "skills" => $skills,
        "categories" => $categories
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>