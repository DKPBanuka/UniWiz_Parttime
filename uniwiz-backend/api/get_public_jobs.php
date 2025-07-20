<?php
// Set headers to allow cross-origin requests (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include the database connection file
// Make sure the path is correct based on your file structure
require_once '../config/database.php';

// Create a new Database object and get the connection
$database = new Database();
$conn = $database->getConnection();

// SQL query to select active jobs along with company details
// We join the 'jobs' table with the 'users' table to get the company name and profile image
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
    LIMIT 6; -- We'll fetch the 6 most recent active jobs for the landing page
";

$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

$jobs = array();

if ($result->num_rows > 0) {
    // Loop through the results and fetch each job as an associative array
    while ($row = $result->fetch_assoc()) {
        $jobs[] = $row;
    }
}

// Set the HTTP response code to 200 (OK)
http_response_code(200);

// Encode the jobs array into a JSON string and output it
echo json_encode($jobs);

// Close the database connection
$conn->close();
?>
