<?php
// FILE: uniwiz-backend/api/create_job.php (CONFIRMED - Admin Notifications for New Job Posts)
// ========================================================================

// --- Headers, DB Connection ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
$data = json_decode(file_get_contents("php://input"));

// --- Validate Data ---
if ( $data === null || !isset($data->publisher_id) || !isset($data->title) || !isset($data->status) ) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

// --- NEW: Function to create a notification for all admins (copied from auth.php for reusability) ---
function createAdminNotification($db, $type, $message, $link) {
    // Fetch all admin user IDs
    $stmt_admins = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
    $stmt_admins->execute();
    $admin_ids = $stmt_admins->fetchAll(PDO::FETCH_COLUMN, 0);

    if (empty($admin_ids)) {
        // No admins found to notify, just return
        return;
    }

    // Prepare and execute insert for each admin
    $query_notif = "INSERT INTO notifications (user_id, type, message, link) VALUES (:user_id, :type, :message, :link)";
    $stmt_notif = $db->prepare($query_notif);

    foreach ($admin_ids as $admin_id) {
        $stmt_notif->bindParam(':user_id', $admin_id, PDO::PARAM_INT);
        $stmt_notif->bindParam(':type', $type);
        $stmt_notif->bindParam(':message', $message);
        $stmt_notif->bindParam(':link', $link);
        $stmt_notif->execute();
    }
}


// --- Main Create Job Logic ---
try {
    $query = "
        INSERT INTO jobs 
        (publisher_id, category_id, title, description, skills_required, job_type, payment_range, start_date, end_date, status, work_mode, location, application_deadline, vacancies, working_hours, experience_level) 
        VALUES 
        (:publisher_id, :category_id, :title, :description, :skills_required, :job_type, :payment_range, :start_date, :end_date, :status, :work_mode, :location, :application_deadline, :vacancies, :working_hours, :experience_level)
    ";

    $stmt = $db->prepare($query);

    // Sanitize data
    $publisher_id = htmlspecialchars(strip_tags($data->publisher_id));
    $category_id = htmlspecialchars(strip_tags($data->category_id));
    $title = htmlspecialchars(strip_tags($data->title));
    $description = htmlspecialchars(strip_tags($data->description));
    $job_type = htmlspecialchars(strip_tags($data->job_type));
    $payment_range = htmlspecialchars(strip_tags($data->payment_range));
    $skills_required = isset($data->skills_required) ? htmlspecialchars(strip_tags($data->skills_required)) : "";
    $start_date = isset($data->start_date) && !empty($data->start_date) ? htmlspecialchars(strip_tags($data->start_date)) : null;
    $end_date = isset($data->end_date) && !empty($data->end_date) ? htmlspecialchars(strip_tags($data->end_date)) : null;
    $status = htmlspecialchars(strip_tags($data->status));
    if ($status !== 'active' && $status !== 'draft') {
        $status = 'draft'; // Default to draft if invalid status is provided
    }

    // Sanitize new fields
    $work_mode = isset($data->work_mode) ? htmlspecialchars(strip_tags($data->work_mode)) : 'on-site';
    $location = isset($data->location) ? htmlspecialchars(strip_tags($data->location)) : null;
    $application_deadline = isset($data->application_deadline) && !empty($data->application_deadline) ? htmlspecialchars(strip_tags($data->application_deadline)) : null;
    $vacancies = isset($data->vacancies) ? filter_var($data->vacancies, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]) : 1;
    $working_hours = isset($data->working_hours) ? htmlspecialchars(strip_tags($data->working_hours)) : null;
    $experience_level = isset($data->experience_level) ? htmlspecialchars(strip_tags($data->experience_level)) : 'any';


    // Bind parameters
    $stmt->bindParam(':publisher_id', $publisher_id);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':skills_required', $skills_required);
    $stmt->bindParam(':job_type', $job_type);
    $stmt->bindParam(':payment_range', $payment_range);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->bindParam(':status', $status);

    // Bind new parameters
    $stmt->bindParam(':work_mode', $work_mode);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':application_deadline', $application_deadline);
    $stmt->bindParam(':vacancies', $vacancies, PDO::PARAM_INT);
    $stmt->bindParam(':working_hours', $working_hours);
    $stmt->bindParam(':experience_level', $experience_level);


    if ($stmt->execute()) {
        // --- NEW: Create notification for admins if job is a draft (pending approval) ---
        if ($status === 'draft') {
            $notification_message = "New job posted: \"" . $title . "\" is pending approval.";
            createAdminNotification($db, 'new_job_pending_approval', $notification_message, '/job-management?filter=draft');
        }

        http_response_code(201);
        echo json_encode(["message" => "Job post saved successfully."]);
    } else {
        throw new Exception("Failed to save job post.");
    }

} catch (PDOException $e) {
    http_response_code(503); 
    echo json_encode(["message" => "A database error occurred while saving the job: " . $e->getMessage()]);
}
?>
