<?php
// FILE: uniwiz-backend/api/get_admin_stats.php (UPDATED for Admin Dashboard with Unverified Users)
// =======================================================
// This file fetches various statistics for the Admin Dashboard.

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

try {
    $stats = [];

    // 1. Total Users Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $stats['totalUsers'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Total Jobs Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM jobs");
    $stmt->execute();
    $stats['totalJobs'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 3. Jobs Pending Approval (e.g., status 'draft' or 'pending' if you have such a status)
    // Assuming 'draft' jobs need admin approval before becoming 'active'
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'draft'");
    $stmt->execute();
    $stats['jobsPendingApproval'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 4. Total Students Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    $stmt->execute();
    $stats['totalStudents'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 5. Total Publishers Count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'publisher'");
    $stmt->execute();
    $stats['totalPublishers'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 6. Unverified Users Count (NEW)
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE is_verified = 0 AND role != 'admin'"); // Exclude admin from unverified count
    $stmt->execute();
    $stats['unverifiedUsers'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Return the statistics as JSON
    http_response_code(200);
    echo json_encode($stats);

} catch (PDOException $e) {
    // Handle any database errors
    http_response_code(503);
    echo json_encode(["message" => "A database error occurred: " . $e->getMessage()]);
} catch (Exception $e) {
    // Handle any other general exceptions
    http_response_code(500);
    echo json_encode(["message" => "An unexpected server error occurred: " . $e->getMessage()]);
}
?>
