<?php
// FILE: uniwiz-backend/api/get_company_profile.php (ENHANCED)
// ===========================================================
// This file now fetches rating details along with other profile info.

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

if (!isset($_GET['publisher_id']) || !filter_var($_GET['publisher_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Publisher ID is required."]);
    exit();
}
$publisher_id = (int)$_GET['publisher_id'];

try {
    $company_data = [];

    // 1. Fetch Company Details with profile and new rating info
    $query_company = "
        SELECT 
            u.id, u.first_name, u.last_name, u.email, u.company_name, u.profile_image_url,
            pp.about, pp.industry, pp.website_url, pp.address, pp.phone_number, 
            pp.facebook_url, pp.linkedin_url, pp.instagram_url,
            (SELECT AVG(rating) FROM company_reviews WHERE publisher_id = u.id) as average_rating,
            (SELECT COUNT(*) FROM company_reviews WHERE publisher_id = u.id) as review_count
        FROM 
            users u
        LEFT JOIN
            publisher_profiles pp ON u.id = pp.user_id
        WHERE 
            u.id = :publisher_id AND u.role = 'publisher' LIMIT 1
    ";
    $stmt_company = $db->prepare($query_company);
    $stmt_company->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_company->execute();
    $company_details = $stmt_company->fetch(PDO::FETCH_ASSOC);

    if (!$company_details) {
        http_response_code(404);
        echo json_encode(["message" => "Company not found."]);
        exit();
    }
    $company_data['details'] = $company_details;

    // 2. Fetch Jobs Posted by This Company
    $query_jobs = "
        SELECT 
            j.id, 
            j.title, 
            jc.name as category, 
            j.job_type, 
            j.payment_range, 
            j.created_at
        FROM jobs as j
        LEFT JOIN job_categories as jc ON j.category_id = jc.id
        WHERE j.publisher_id = :publisher_id AND j.status = 'active'
        ORDER BY j.created_at DESC
    ";
    $stmt_jobs = $db->prepare($query_jobs);
    $stmt_jobs->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_jobs->execute();
    $company_data['jobs'] = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);


    // 3. Fetch latest reviews for the company
    $query_reviews = "
        SELECT 
            r.rating, r.review_text, r.created_at,
            s.first_name, s.last_name, s.profile_image_url as student_image_url
        FROM company_reviews r
        JOIN users s ON r.student_id = s.id
        WHERE r.publisher_id = :publisher_id
        ORDER BY r.created_at DESC
        LIMIT 5
    ";
    $stmt_reviews = $db->prepare($query_reviews);
    $stmt_reviews->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_reviews->execute();
    $company_data['reviews'] = $stmt_reviews->fetchAll(PDO::FETCH_ASSOC);


    http_response_code(200);
    echo json_encode($company_data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
}
?>
