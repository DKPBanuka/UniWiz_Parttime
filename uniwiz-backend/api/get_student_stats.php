<?php
// FILE: uniwiz-backend/api/get_student_stats.php (UPDATED)
// =========================================================
// Ee file iga profile completion stats, accepted applications,
// hāgū profile views gaḷannu hisābu māḍi tegedukoḷḷuttade.

// --- Headers ---
header("Access-Control-Allow-Origin: *");
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

if (!isset($_GET['student_id']) || !filter_var($_GET['student_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid Student ID is required."]);
    exit();
}
$student_id = (int)$_GET['student_id'];

try {
    $stats = [];

    // 1. Kaḷisida arjigaḷa saṅkhye (Applications Sent Count)
    $stmt_sent = $db->prepare("SELECT COUNT(*) as count FROM job_applications WHERE student_id = :student_id");
    $stmt_sent->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_sent->execute();
    $stats['applications_sent'] = $stmt_sent->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Svīkr̥ta arjigaḷa saṅkhye (Accepted Applications Count)
    $stmt_accepted = $db->prepare("SELECT COUNT(*) as count FROM job_applications WHERE student_id = :student_id AND status = 'accepted'");
    $stmt_accepted->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_accepted->execute();
    $stats['applications_accepted'] = $stmt_accepted->fetch(PDO::FETCH_ASSOC)['count'];

    // 3. Profile Vīkṣaṇegaḷu (Profile Views) - 'viewed' status-ninda nija dattamsha
    $stmt_viewed = $db->prepare("SELECT COUNT(*) as count FROM job_applications WHERE student_id = :student_id AND status = 'viewed'");
    $stmt_viewed->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_viewed->execute();
    $stats['profile_views'] = $stmt_viewed->fetch(PDO::FETCH_ASSOC)['count'];

    // 4. Profile Pūrṇateyannu Hisābu māḍi (Calculate Profile Completion)
    $query_profile = "
        SELECT u.profile_image_url, sp.*
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = :student_id
    ";
    $stmt_profile = $db->prepare($query_profile);
    $stmt_profile->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt_profile->execute();
    $profile_data = $stmt_profile->fetch(PDO::FETCH_ASSOC);

    $completed_fields = 0;
    $total_fields = 6; // Pūrṇatege nãvu track māḍuttiruva ಒಟ್ಟು fields

    if ($profile_data) {
        if (!empty($profile_data['profile_image_url'])) $completed_fields++;
        if (!empty($profile_data['university_name'])) $completed_fields++;
        if (!empty($profile_data['field_of_study'])) $completed_fields++;
        if (!empty($profile_data['year_of_study'])) $completed_fields++;
        if (!empty($profile_data['skills'])) $completed_fields++;
        if (!empty($profile_data['cv_url'])) $completed_fields++;
    }
    
    $stats['profile_completion_percentage'] = ($total_fields > 0) ? round(($completed_fields / $total_fields) * 100) : 0;


    http_response_code(200);
    echo json_encode($stats);

} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(["message" => "A database error occurred while fetching student stats."]);
}
?>
