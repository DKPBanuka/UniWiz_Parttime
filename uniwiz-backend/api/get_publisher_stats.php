<?php
// FILE: uniwiz-backend/api/get_publisher_stats.php (UPDATED for Job Overview Vacancy & Accepted Counts)
// =============================================================================
// This file now includes the publisher's average rating and total review count,
// and also vacancy and accepted counts for jobs in the overview.

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
    $stats = [];

    // 1. Active Jobs Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM jobs WHERE publisher_id = :publisher_id AND status = 'active'");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['active_jobs'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Total Applicants Count
    $stmt = $db->prepare("SELECT COUNT(ja.id) as count FROM job_applications ja INNER JOIN jobs j ON ja.job_id = j.id WHERE j.publisher_id = :publisher_id");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['total_applicants'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 3. New Applicants Today
    $stmt = $db->prepare("SELECT COUNT(ja.id) as count FROM job_applications ja INNER JOIN jobs j ON ja.job_id = j.id WHERE j.publisher_id = :publisher_id AND DATE(ja.applied_at) = CURDATE()");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['new_applicants_today'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // 4. Pending Applicants Count
    $stmt = $db->prepare("SELECT COUNT(ja.id) as count FROM job_applications ja INNER JOIN jobs j ON ja.job_id = j.id WHERE j.publisher_id = :publisher_id AND ja.status = 'pending'");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['pending_applicants'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 5. Recent Applicants (Top 5)
    $stmt = $db->prepare("SELECT ja.id as application_id, u.id as student_id, u.first_name, u.last_name, u.profile_image_url, j.title as job_title, ja.applied_at FROM job_applications ja JOIN users u ON ja.student_id = u.id JOIN jobs j ON ja.job_id = j.id WHERE j.publisher_id = :publisher_id ORDER BY ja.applied_at DESC LIMIT 5");
    $stmt->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats['recent_applicants'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 6. Job Overview (Top 5 recent jobs) - UPDATED with vacancies and accepted_count
    $stmt_jobs = $db->prepare("
        SELECT 
            j.id, 
            j.title, 
            j.status, 
            j.vacancies, -- NEW: Added vacancies
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'accepted') as accepted_count -- NEW: Added accepted_count
        FROM jobs j 
        WHERE j.publisher_id = :publisher_id 
        ORDER BY j.created_at DESC 
        LIMIT 5
    ");
    $stmt_jobs->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_jobs->execute();
    $stats['job_overview'] = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

    // 7. Latest Reviews
    $stmt_reviews = $db->prepare("
        SELECT 
            r.id as review_id, r.rating, r.review_text, r.created_at,
            s.first_name, s.last_name, s.profile_image_url as student_image_url
        FROM company_reviews r
        JOIN users s ON r.student_id = s.id
        WHERE r.publisher_id = :publisher_id
        ORDER BY r.created_at DESC
        LIMIT 3
    ");
    $stmt_reviews->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_reviews->execute();
    $stats['latest_reviews'] = $stmt_reviews->fetchAll(PDO::FETCH_ASSOC);

    // 8. Publisher's Average Rating and Total Review Count
    $stmt_rating = $db->prepare("
        SELECT 
            AVG(rating) as average_rating,
            COUNT(id) as total_review_count
        FROM company_reviews
        WHERE publisher_id = :publisher_id
    ");
    $stmt_rating->bindParam(':publisher_id', $publisher_id, PDO::PARAM_INT);
    $stmt_rating->execute();
    $rating_data = $stmt_rating->fetch(PDO::FETCH_ASSOC);
    
    $stats['average_rating'] = $rating_data['average_rating'] ? round($rating_data['average_rating'], 1) : 0;
    $stats['total_review_count'] = $rating_data['total_review_count'] ? (int)$rating_data['total_review_count'] : 0;


    http_response_code(200);
    echo json_encode($stats);

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "A database error occurred while fetching dashboard stats."]);
}
?>