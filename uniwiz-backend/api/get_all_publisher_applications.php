<?php
// FILE: uniwiz-backend/api/get_all_publisher_applications.php (NEW FILE)
// =====================================================================
// This file fetches all job applications associated with a specific publisher,
// allowing for searching by student name or job title.

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Check for database connection failure
if ($db === null) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// --- Get and Validate publisher_id ---
// Ensure publisher_id is provided and is a valid integer
if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "A valid Publisher ID is required."]);
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];

// Get the search term from the query string, if it exists
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // Base SQL query to select application details
    // We join job_applications (ja), users (u) for student info, and jobs (j) for job info
    $query = "
        SELECT
            ja.id as application_id,
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email,
            j.title as job_title,
            ja.proposal,
            ja.status,
            ja.applied_at
        FROM
            job_applications ja
        JOIN
            users u ON ja.student_id = u.id
        JOIN
            jobs j ON ja.job_id = j.id
        WHERE
            j.publisher_id = :publisher_id
    ";

    // Add search condition if a search term is provided
    if (!empty($search_term)) {
        // Search by student's first name, last name, or job title
        $query .= " AND (u.first_name LIKE :search_term OR u.last_name LIKE :search_term OR j.title LIKE :search_term)";
    }

    // Order applications by the most recent first
    $query .= " ORDER BY ja.applied_at DESC";

    // Prepare the SQL statement
    $stmt = $db->prepare($query);

    // Bind the publisher_id parameter
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);

    // Bind the search_term parameter if it's used in the query
    if (!empty($search_term)) {
        $search_param = "%" . $search_term . "%"; // Add wildcards for LIKE operator
        $stmt->bindParam(':search_term', $search_param, PDO::PARAM_STR);
    }

    // Execute the statement
    $stmt->execute();

    // Fetch all applications as an associative array
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set HTTP response code to 200 (OK)
    http_response_code(200);
    // Return applications as JSON
    echo json_encode($applications);

} catch (PDOException $e) {
    // Catch any PDO (database) exceptions
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "A database error occurred while fetching applications."]);
} catch (Exception $e) {
    // Catch any other general exceptions
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "An unexpected server error occurred."]);
}
?>
