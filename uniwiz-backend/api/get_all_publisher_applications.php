<?php
// FILE: uniwiz-backend/api/get_all_publisher_applications.php (ENHANCED)
// =====================================================================
// This file fetches all job applications for a publisher.
// It can be filtered by publisher_id, job_id, search term, and status.

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// --- Get and Validate Parameters ---
// At least one of publisher_id or job_id must be present.
if (!isset($_GET['publisher_id']) && !isset($_GET['job_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "A Publisher ID or Job ID is required."]);
    exit();
}

$publisher_id = isset($_GET['publisher_id']) ? (int)$_GET['publisher_id'] : null;
$job_id = isset($_GET['job_id']) ? (int)$_GET['job_id'] : null;
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
$status_filter = isset($_GET['status']) ? trim($_GET['status']) : 'All';

try {
    // The base query joins all necessary tables to get complete applicant info.
    $query = "
        SELECT
            ja.id as application_id,
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email,
            u.profile_image_url,
            j.title as job_title,
            ja.proposal,
            ja.status,
            ja.applied_at,
            sp.university_name,
            sp.field_of_study,
            sp.year_of_study,
            sp.languages_spoken,
            sp.skills,
            sp.cv_url
        FROM
            job_applications ja
        JOIN
            users u ON ja.student_id = u.id
        JOIN
            jobs j ON ja.job_id = j.id
        LEFT JOIN
            student_profiles sp ON u.id = sp.user_id
        WHERE 1=1
    ";

    // Dynamically build the rest of the query based on provided parameters.
    $params = [];

    if ($publisher_id !== null) {
        $query .= " AND j.publisher_id = :publisher_id";
        $params[':publisher_id'] = $publisher_id;
    }

    if ($job_id !== null) {
        $query .= " AND ja.job_id = :job_id";
        $params[':job_id'] = $job_id;
    }

    if ($status_filter !== 'All') {
        $query .= " AND ja.status = :status";
        $params[':status'] = $status_filter;
    }

    if (!empty($search_term)) {
        $query .= " AND (u.first_name LIKE :search_term OR u.last_name LIKE :search_term OR j.title LIKE :search_term OR sp.skills LIKE :search_term)";
        $params[':search_term'] = "%" . $search_term . "%";
    }

    $query .= " ORDER BY ja.applied_at DESC";

    $stmt = $db->prepare($query);

    // Bind all the dynamic parameters.
    foreach ($params as $key => &$val) {
        // Determine the parameter type based on the key.
        $param_type = is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR;
        $stmt->bindParam($key, $val, $param_type);
    }

    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($applications);

} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(["message" => "A database error occurred: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
}
?>
