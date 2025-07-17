<?php
// FILE: uniwiz-backend/api/get_all_jobs_admin.php (NEW FILE)
// ==========================================================
// This endpoint provides all job data specifically for the admin panel.

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

try {
    // This query fetches all jobs and joins with users and categories
    // to get the publisher's name and the category name.
    $query = "
        SELECT 
            j.id, 
            j.title, 
            j.status, 
            j.created_at,
            u.company_name, 
            u.first_name, 
            u.last_name,
            jc.name as category_name
        FROM 
            jobs j
        JOIN 
            users u ON j.publisher_id = u.id
        LEFT JOIN 
            job_categories jc ON j.category_id = jc.id
        ORDER BY 
            j.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($jobs);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An error occurred: " . $e->getMessage()]);
}
?>
