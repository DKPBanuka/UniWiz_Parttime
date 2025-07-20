<?php
// FILE: uniwiz-backend/api/get_all_users_admin.php (FIXED for robust filtering)
// ==========================================================
// This endpoint provides all user data specifically for the admin panel,
// now with improved filtering for role, verification status, and account status.

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// Get filter parameters from query string
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
$role_filter = isset($_GET['role']) ? trim($_GET['role']) : 'All'; // 'All', 'student', 'publisher', 'admin'
$is_verified_param = isset($_GET['is_verified']) ? $_GET['is_verified'] : 'All'; // '0', '1', 'All'
$status_param = isset($_GET['status']) ? trim($_GET['status']) : 'All'; // 'active', 'blocked', 'All'
$sort_order = isset($_GET['sort_order']) ? trim($_GET['sort_order']) : 'newest'; // 'newest', 'oldest'

try {
    $query = "
        SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.company_name, 
            u.role, 
            u.is_verified, 
            u.status, 
            u.created_at,
            u.profile_image_url,
            -- Student specific fields
            sp.university_name,
            sp.field_of_study,
            sp.year_of_study,
            sp.languages_spoken,
            sp.preferred_categories,
            sp.skills,
            sp.cv_url,
            -- Publisher specific fields
            pp.about,
            pp.industry,
            pp.website_url,
            pp.address,
            pp.phone_number,
            pp.facebook_url,
            pp.linkedin_url,
            pp.instagram_url
        FROM 
            users u
        LEFT JOIN 
            student_profiles sp ON u.id = sp.user_id
        LEFT JOIN
            publisher_profiles pp ON u.id = pp.user_id
        WHERE 1=1
    ";

    $params = [];

    // Add role filter
    if ($role_filter !== 'All' && in_array($role_filter, ['student', 'publisher', 'admin'])) {
        $query .= " AND u.role = :role_filter";
        $params[':role_filter'] = $role_filter;
    }

    // Add verification status filter
    // Check explicitly for '0' or '1' as string, then cast to int for PDO
    if ($is_verified_param === '0' || $is_verified_param === '1') {
        $query .= " AND u.is_verified = :is_verified_filter";
        $params[':is_verified_filter'] = (int)$is_verified_param;
    }

    // Add account status filter
    if ($status_param !== 'All' && in_array($status_param, ['active', 'blocked'])) {
        $query .= " AND u.status = :status_filter";
        $params[':status_filter'] = $status_param;
    }

    // Add search term filter
    if (!empty($search_term)) {
        $query .= " AND (u.first_name LIKE :search_term OR u.last_name LIKE :search_term OR u.email LIKE :search_term OR u.company_name LIKE :search_term)";
        $params[':search_term'] = "%" . $search_term . "%";
    }

    // Add sorting
    if ($sort_order === 'oldest') {
        $query .= " ORDER BY u.created_at ASC";
    } else { // Default to 'newest'
        $query .= " ORDER BY u.created_at DESC";
    }

    $stmt = $db->prepare($query);

    foreach ($params as $key => &$val) {
        // Determine PDO parameter type dynamically
        $param_type = PDO::PARAM_STR; // Default to string
        if (is_int($val)) {
            $param_type = PDO::PARAM_INT;
        } elseif (is_bool($val)) { // For boolean values like is_verified (0 or 1)
            $param_type = PDO::PARAM_BOOL;
        }
        $stmt->bindParam($key, $val, $param_type);
    }

    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($users);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "An error occurred: " . $e->getMessage()]);
}
?>