<?php
// FILE: uniwiz-backend/api/create_review.php (NEW FILE)
// =====================================================================
// This file handles submitting a company review from a student
// and creates a notification for the publisher.

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
if (
    $data === null || 
    !isset($data->publisher_id) || 
    !isset($data->student_id) ||
    !isset($data->rating) ||
    !isset($data->review_text)
) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Publisher ID, Student ID, rating, and review text are required."]);
    exit();
}

// Further validation
$rating = filter_var($data->rating, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1, "max_range" => 5]]);
if ($rating === false) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid rating. Must be an integer between 1 and 5."]);
    exit();
}

$publisher_id = (int)$data->publisher_id;
$student_id = (int)$data->student_id;
$review_text = htmlspecialchars(strip_tags($data->review_text));

if (empty($review_text)) {
    http_response_code(400);
    echo json_encode(["message" => "Review text cannot be empty."]);
    exit();
}


try {
    $db->beginTransaction();

    // 1. Check if the student has already reviewed this publisher
    $query_check = "SELECT id FROM company_reviews WHERE publisher_id = :publisher_id AND student_id = :student_id";
    $stmt_check = $db->prepare($query_check);
    $stmt_check->bindParam(':publisher_id', $publisher_id);
    $stmt_check->bindParam(':student_id', $student_id);
    $stmt_check->execute();

    if ($stmt_check->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "You have already submitted a review for this publisher."]);
        $db->rollBack();
        exit();
    }

    // 2. Insert the new review
    $query_insert = "INSERT INTO company_reviews (publisher_id, student_id, rating, review_text) VALUES (:publisher_id, :student_id, :rating, :review_text)";
    $stmt_insert = $db->prepare($query_insert);
    $stmt_insert->bindParam(':publisher_id', $publisher_id);
    $stmt_insert->bindParam(':student_id', $student_id);
    $stmt_insert->bindParam(':rating', $rating);
    $stmt_insert->bindParam(':review_text', $review_text);

    if ($stmt_insert->execute()) {
        // 3. Create a notification for the publisher
        // Get student's name for the notification message
        $query_student = "SELECT first_name, last_name FROM users WHERE id = :student_id";
        $stmt_student = $db->prepare($query_student);
        $stmt_student->bindParam(':student_id', $student_id);
        $stmt_student->execute();
        $student_info = $stmt_student->fetch(PDO::FETCH_ASSOC);
        $student_name = $student_info ? $student_info['first_name'] . ' ' . $student_info['last_name'] : 'A student';

        $notification_message = "$student_name has left a $rating-star review for your company.";
        
        // **CHANGE**: The link now points to the specific student's profile
        $notification_link = "/student-profile/" . $student_id;

        $query_notif = "INSERT INTO notifications (user_id, type, message, link) VALUES (:user_id, 'new_review', :message, :link)";
        $stmt_notif = $db->prepare($query_notif);
        $stmt_notif->bindParam(':user_id', $publisher_id);
        $stmt_notif->bindParam(':message', $notification_message);
        $stmt_notif->bindParam(':link', $notification_link);
        $stmt_notif->execute();
        
        $db->commit();
        http_response_code(201);
        echo json_encode(["message" => "Review submitted successfully."]);

    } else {
        throw new Exception("Failed to submit review.");
    }

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(503);
    echo json_encode(["message" => "A server error occurred: " . $e->getMessage()]);
}
?>
