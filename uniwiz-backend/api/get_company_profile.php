<?php
// FILE: uniwiz-backend/api/get_company_profile.php (NEW FILE)
// ===========================================================
// This file fetches details for a specific company (publisher) and their job postings.

// --- Headers ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // OK
    exit();
}

// --- Database Connection ---
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Check for database connection failure
if ($db === null) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "Database connection failed."]); // දත්ත සමුදා සම්බන්ධතාවය අසාර්ථක විය
    exit();
}

// --- Get and Validate publisher_id ---
// Ensure publisher_id is provided and is a valid integer
if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "A valid Publisher ID is required."]); // වලංගු ප්‍රකාශක හැඳුනුම්පතක් අවශ්‍ය වේ
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];

try {
    $company_data = [];

    // 1. Fetch Company (Publisher) Details
    $query_company = "
        SELECT 
            id, 
            first_name, 
            last_name, 
            email, 
            company_name, 
            profile_image_url 
        FROM 
            users 
        WHERE 
            id = :publisher_id AND role = 'publisher' LIMIT 1
    ";
    $stmt_company = $db->prepare($query_company);
    $stmt_company->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_company->execute();
    $company_details = $stmt_company->fetch(PDO::FETCH_ASSOC);

    if (!$company_details) {
        http_response_code(404); // Not Found
        echo json_encode(["message" => "Company not found."]); // සමාගම සොයා ගැනීමට නොහැකි විය
        exit();
    }
    $company_data['details'] = $company_details;

    // 2. Fetch Jobs Posted by This Company
    $query_jobs = "
        SELECT 
            j.id, 
            j.title, 
            jc.name as category, 
            j.category_id,      
            j.job_type, 
            j.payment_range, 
            j.created_at,       
            j.start_date,       
            j.end_date 
        FROM 
            jobs as j
        LEFT JOIN 
            job_categories as jc ON j.category_id = jc.id
        WHERE 
            j.publisher_id = :publisher_id AND j.status = 'active'
        ORDER BY 
            j.created_at DESC
    ";
    $stmt_jobs = $db->prepare($query_jobs);
    $stmt_jobs->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_jobs->execute();
    $company_data['jobs'] = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

    // Set HTTP response code to 200 (OK)
    http_response_code(200);
    // Return combined company details and job postings as JSON
    echo json_encode($company_data);

} catch (PDOException $e) {
    // Catch any PDO (database) exceptions
    http_response_code(503); // Service Unavailable
    echo json_encode(["message" => "A database error occurred while fetching company details: " . $e->getMessage()]); // සමාගම් විස්තර ලබා ගැනීමේදී දත්ත සමුදා දෝෂයක් සිදුවිය
} catch (Exception $e) {
    // Catch any other general exceptions
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "An unexpected server error occurred."]); // අනපේක්ෂිත සේවාදායක දෝෂයක් සිදුවිය
}
?>
