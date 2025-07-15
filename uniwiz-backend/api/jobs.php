<?php
// FILE: uniwiz-backend/api/jobs.php (Final version that fetches from the database)
// =================================================================================

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    echo json_encode(["message" => "Database connection failed."]);
    exit(); 
}

// --- Main Logic to Fetch Jobs ---
try {
    // We need to join multiple tables to get all the information the frontend needs:
    // 1. `jobs` table for the main job details.
    // 2. `job_categories` table to get the category name from `category_id`.
    // 3. `users` table to get the publisher's name from `publisher_id`.
    $query = "
        SELECT 
            j.id, 
            j.title, 
            jc.name as category, -- get category name and alias it as 'category'
            j.job_type, 
            j.payment_range, 
            u.first_name as publisher -- get publisher's first name and alias it as 'publisher'
        FROM 
            jobs as j
        LEFT JOIN 
            job_categories as jc ON j.category_id = jc.id
        LEFT JOIN 
            users as u ON j.publisher_id = u.id
        WHERE 
            j.status = 'active' -- Only fetch active jobs
        ORDER BY 
            j.created_at DESC -- Show the newest jobs first
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $num = $stmt->rowCount();

    // Check if any jobs were found
    if ($num > 0) {
        $jobs_arr = array();
        
        // Fetch all rows from the result set
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // The `extract` function creates variables from the array keys (e.g., $id, $title)
            extract($row);
            
            // Create an array for each job with the structure the frontend expects
            $job_item = array(
                "id" => $id,
                "title" => $title,
                "category" => $category,
                "job_type" => $job_type,
                "payment_range" => $payment_range,
                "publisher" => $publisher
            );
            
            // Add the job item to our main array
            array_push($jobs_arr, $job_item);
        }
        
        // Set HTTP response code to 200 (OK)
        http_response_code(200);
        // Send the jobs array as a JSON response
        echo json_encode($jobs_arr);
    } else {
        // If no jobs are found, send an empty array
        http_response_code(200);
        echo json_encode([]);
    }

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "Database error while fetching jobs."]);
}
?>
