<?php
// FILE: uniwiz-backend/api/jobs.php (Updated to include company_name)
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
    // Get filter parameters from query string
    $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category_id_filter = isset($_GET['category_id']) ? trim($_GET['category_id']) : '';
    $job_type_filter = isset($_GET['job_type']) ? trim($_GET['job_type']) : '';
    $date_posted_filter = isset($_GET['date_posted']) ? trim($_GET['date_posted']) : ''; // e.g., '24_hours', '7_days_ago'
    $specific_date_filter = isset($_GET['specific_date']) ? trim($_GET['specific_date']) : ''; // New: Specific date from calendar
    $min_salary_filter = isset($_GET['min_salary']) ? (float)$_GET['min_salary'] : null;
    $max_salary_filter = isset($_GET['max_salary']) ? (float)$_GET['max_salary'] : null;

    $query = "
        SELECT 
            j.id, 
            j.title, 
            jc.name as category, 
            j.category_id,      
            j.job_type, 
            j.payment_range, 
            j.created_at,       
            j.start_date,       
            j.end_date,         
            u.first_name as publisher_first_name, -- Get publisher's first name
            u.company_name as publisher_company_name, -- Get publisher's company name
            u.id as publisher_id -- Get publisher's ID for linking to company profile
        FROM 
            jobs as j
        LEFT JOIN 
            job_categories as jc ON j.category_id = jc.id
        LEFT JOIN 
            users as u ON j.publisher_id = u.id
        WHERE 
            j.status = 'active' -- Only fetch active jobs
    ";

    // Add search term filter
    if (!empty($search_term)) {
        $query .= " AND (j.title LIKE :search_term OR u.first_name LIKE :search_term OR u.company_name LIKE :search_term)"; // Search by company name too
    }

    // Add category filter
    if (!empty($category_id_filter)) {
        $query .= " AND j.category_id = :category_id_filter";
    }

    // Add job type filter
    if (!empty($job_type_filter)) {
        $query .= " AND j.job_type = :job_type_filter";
    }

    // Add date posted filter (e.g., '24_hours', '7_days_ago')
    if (!empty($date_posted_filter)) {
        $date_limit = '';
        switch ($date_posted_filter) {
            case '24_hours':
                $date_limit = date('Y-m-d H:i:s', strtotime('-24 hours'));
                break;
            case '2_days_ago':
                $date_limit = date('Y-m-d H:i:s', strtotime('-2 days'));
                break;
            case '7_days_ago':
                $date_limit = date('Y-m-d H:i:s', strtotime('-7 days'));
                break;
            case '30_days_ago':
                $date_limit = date('Y-m-d H:i:s', strtotime('-30 days'));
                break;
            // Add more cases as needed
        }
        if (!empty($date_limit)) {
            $query .= " AND j.created_at >= :date_limit";
        }
    }

    // New: Specific date filter (job's start_date or end_date must include this day)
    if (!empty($specific_date_filter)) {
        $query .= " AND (
            (j.start_date <= :specific_date_filter AND j.end_date >= :specific_date_filter)
            OR (j.start_date <= :specific_date_filter AND j.end_date IS NULL)
            OR (j.start_date = :specific_date_filter)
        )";
    }

    // Salary range filtering (still client-side in FindJobsPage.js due to complex payment_range field)


    $query .= " ORDER BY j.created_at DESC";

    $stmt = $db->prepare($query);

    // Bind parameters
    if (!empty($search_term)) {
        $search_param = "%" . $search_term . "%";
        $stmt->bindParam(':search_term', $search_param, PDO::PARAM_STR);
    }
    if (!empty($category_id_filter)) {
        $stmt->bindParam(':category_id_filter', $category_id_filter, PDO::PARAM_INT);
    }
    if (!empty($job_type_filter)) {
        $stmt->bindParam(':job_type_filter', $job_type_filter, PDO::PARAM_STR);
    }
    if (!empty($date_limit)) {
        $stmt->bindParam(':date_limit', $date_limit, PDO::PARAM_STR);
    }
    if (!empty($specific_date_filter)) {
        $stmt->bindParam(':specific_date_filter', $specific_date_filter, PDO::PARAM_STR);
    }

    $stmt->execute();

    $num = $stmt->rowCount();

    if ($num > 0) {
        $jobs_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $job_item = array(
                "id" => $row['id'],
                "title" => $row['title'],
                "category" => $row['category'],
                "category_id" => $row['category_id'],
                "job_type" => $row['job_type'],
                "payment_range" => $row['payment_range'],
                "created_at" => $row['created_at'], 
                "start_date" => $row['start_date'], 
                "end_date" => $row['end_date'],     
                "publisher_id" => $row['publisher_id'], // Include publisher ID
                "publisher_name" => $row['publisher_first_name'], // Include publisher first name
                "company_name" => $row['publisher_company_name'] // Include company name
            );
            // Prioritize company name for display
            $job_item['publisher'] = !empty($row['publisher_company_name']) ? $row['publisher_company_name'] : $row['publisher_first_name'];

            array_push($jobs_arr, $job_item);
        }
        http_response_code(200);
        echo json_encode($jobs_arr);
    } else {
        http_response_code(200);
        echo json_encode([]);
    }

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "Database error while fetching jobs: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); 
    echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
}
?>
