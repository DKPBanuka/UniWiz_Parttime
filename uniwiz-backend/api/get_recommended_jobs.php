<?php
// FILE: uniwiz-backend/api/get_recommended_jobs.php (FIXED & ENHANCED with Application Status)
// =================================================================
// This file recommends jobs to a student based on their profile.
// It now correctly includes the company name and the student's application status for each job.

// --- Headers & DB Connection ---
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

// --- Input Validation ---
if (!isset($_GET['student_id']) || !filter_var($_GET['student_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Student ID is required."]);
    exit();
}
$student_id = (int)$_GET['student_id'];

try {
    // 1. Get student's profile details
    $stmt_student = $db->prepare("SELECT skills, preferred_categories FROM student_profiles WHERE user_id = :student_id");
    $stmt_student->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_student->execute();
    $student_profile = $stmt_student->fetch(PDO::FETCH_ASSOC);

    $student_skills = $student_profile ? array_map('trim', explode(',', $student_profile['skills'])) : [];
    $student_categories = $student_profile ? array_map('trim', explode(',', $student_profile['preferred_categories'])) : [];

    // 2. Get all active jobs with company details and application status
    // **CHANGE**: Joined with job_applications to get the status for the current student
    $stmt_jobs = $db->prepare("
        SELECT 
            j.*, 
            jc.name as category_name,
            u.first_name as publisher_name,
            u.company_name,
            ja.status as application_status
        FROM jobs j 
        JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN users u ON j.publisher_id = u.id
        LEFT JOIN job_applications ja ON j.id = ja.job_id AND ja.student_id = :student_id
        WHERE j.status = 'active'
    ");
    $stmt_jobs->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_jobs->execute();
    $all_jobs = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

    $recommended_jobs = [];

    // 3. Score each job based on relevance
    foreach ($all_jobs as $job) {
        $score = 0;
        $job_skills = array_map('trim', explode(',', $job['skills_required']));

        if (in_array($job['category_name'], $student_categories)) {
            $score += 5;
        }

        $matching_skills = array_intersect($job_skills, $student_skills);
        $score += count($matching_skills) * 2;

        if ($score > 0) {
            $job['recommendation_score'] = $score;
            $recommended_jobs[] = $job;
        }
    }

    // 4. Sort jobs by score and return the top results
    usort($recommended_jobs, function($a, $b) {
        return $b['recommendation_score'] - $a['recommendation_score'];
    });

    http_response_code(200);
    echo json_encode(array_slice($recommended_jobs, 0, 3));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An error occurred: " . $e->getMessage()]);
}
?>