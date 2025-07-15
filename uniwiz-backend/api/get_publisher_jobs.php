<?php
// FILE: uniwiz-backend/api/get_publisher_jobs.php (Updated with Search & Debugging)
// ===================================================================================
// This file now accepts a 'search' parameter to filter jobs by title.

// --- Headers & DB Connection (same as before) ---
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

// --- Get Parameters ---
if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Publisher ID is required."]);
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];
// Get the search term, if it exists
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';

// --- DEBUGGING STEP ---
// To check if the correct publisher ID is being received, you can temporarily
// remove the comment markers (/* and */) from the lines below.
// This will stop the script and show you the ID it received.
/*
http_response_code(200);
echo json_encode(["debug_message" => "Script received this publisher_id", "id" => $publisher_id]);
exit();
*/
// --------------------


try {
    // The base query is the same, but we will add a WHERE clause for search
    $query = "
        SELECT 
            j.id, j.title, j.status, j.created_at,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
        FROM jobs as j
        WHERE j.publisher_id = :publisher_id
    ";

    // If a search term is provided, add the LIKE clause
    if (!empty($search_term)) {
        $query .= " AND j.title LIKE :search_term";
    }

    $query .= " ORDER BY j.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);

    // Bind the search term parameter if it exists
    if (!empty($search_term)) {
        $search_param = "%" . $search_term . "%";
        $stmt->bindParam(':search_term', $search_param, PDO::PARAM_STR);
    }
    
    $stmt->execute();
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($jobs);

} catch (PDOException $e) { 
    http_response_code(503);
    echo json_encode(["message" => "A database error occurred while fetching jobs."]);
}
?>
