<?php
// FILE: uniwiz-backend/api/update_application_status.php (ENHANCED with Notifications)
// =====================================================================
// This file handles updating the status of a specific job application
// and creates a notification for the student.

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

if ($data === null || !isset($data->application_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Application ID and new status are required."]);
    exit();
}

$allowed_statuses = ['viewed', 'accepted', 'rejected', 'pending'];
if (!in_array($data->status, $allowed_statuses)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid status provided."]);
    exit();
}

try {
    $db->beginTransaction();

    // 1. Update the application status
    $query_update = "UPDATE job_applications SET status = :status WHERE id = :application_id";
    $stmt_update = $db->prepare($query_update);

    $application_id = htmlspecialchars(strip_tags($data->application_id));
    $status = htmlspecialchars(strip_tags($data->status));

    $stmt_update->bindParam(':status', $status);
    $stmt_update->bindParam(':application_id', $application_id);

    if ($stmt_update->execute()) {
        if ($stmt_update->rowCount() > 0) {
            
            // 2. If status is 'accepted' or 'rejected', create a notification
            if ($status === 'accepted' || $status === 'rejected') {
                
                // Get student_id and job_title for the notification message
                $query_info = "
                    SELECT ja.student_id, j.title as job_title 
                    FROM job_applications ja 
                    JOIN jobs j ON ja.job_id = j.id 
                    WHERE ja.id = :application_id
                ";
                $stmt_info = $db->prepare($query_info);
                $stmt_info->bindParam(':application_id', $application_id, PDO::PARAM_INT);
                $stmt_info->execute();
                $app_info = $stmt_info->fetch(PDO::FETCH_ASSOC);

                if ($app_info) {
                    $student_id = $app_info['student_id'];
                    $job_title = $app_info['job_title'];
                    $notification_type = 'application_' . $status; // 'application_accepted' or 'application_rejected'
                    $notification_message = "Congratulations! Your application for the job \"$job_title\" has been $status.";
                    if ($status === 'rejected') {
                        $notification_message = "Your application for the job \"$job_title\" has been updated to '$status'.";
                    }

                    // Insert notification into the database
                    $query_notif = "
                        INSERT INTO notifications (user_id, type, message, link) 
                        VALUES (:user_id, :type, :message, '/applied-jobs')
                    ";
                    $stmt_notif = $db->prepare($query_notif);
                    $stmt_notif->bindParam(':user_id', $student_id, PDO::PARAM_INT);
                    $stmt_notif->bindParam(':type', $notification_type);
                    $stmt_notif->bindParam(':message', $notification_message);
                    
                    $stmt_notif->execute();
                }
            }

            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Application status updated successfully."]);

        } else {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(["message" => "Application not found or status is already the same."]);
        }
    } else {
        throw new Exception("Failed to update application status.");
    }

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(503);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
