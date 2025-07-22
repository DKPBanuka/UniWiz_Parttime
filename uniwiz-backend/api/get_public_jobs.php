<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Include the database connection file
// Make sure the path is correct based on your file structure
require_once '../config/database.php';

// Create a new Database object and get the connection
// This assumes your Database class is correctly set up to return a PDO object.
$database = new Database();
$db = $database->getConnection(); 

// Check if database connection was successful
if ($db === null) { 
    // If connection failed, return a 503 Service Unavailable status
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed. Please try again later."]);
    exit();
}

// SQL query to select active jobs along with company details
// It joins the 'jobs' table with the 'users' table to get the company name and profile image.
// Jobs are ordered by creation date in descending order and limited to 6 results.
$query = "
    SELECT 
        j.id, 
        j.title, 
        j.job_type, 
        j.payment_range, 
        j.location,
        j.description,
        u.company_name, 
        u.profile_image_url 
    FROM 
        jobs AS j
    JOIN 
        users AS u ON j.publisher_id = u.id
    WHERE 
        j.status = 'active'
    ORDER BY 
        j.created_at DESC
    LIMIT 6;
";

try {
    // Prepare the SQL query using the PDO connection object
    $stmt = $db->prepare($query); 
    // Execute the prepared statement
    $stmt->execute();

    // Fetch all results as an associative array
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set the HTTP response code to 200 (OK)
    http_response_code(200);

    // Encode the fetched jobs array into a JSON string and output it
    echo json_encode($jobs);

} catch (PDOException $e) {
    // Catch PDO-specific database errors
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Database query error: " . $e->getMessage()]);
} catch (Exception $e) {
    // Catch any other unexpected errors
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "An unexpected error occurred: " . $e->getMessage()]);
}

// In PDO, the connection is automatically closed when the script ends,
// or you can explicitly set $db = null; if needed.
// $db = null; 

?>