<?php
header('Content-Type: application/json');
include_once '../config/database.php';
$db = (new Database())->getConnection();

if (!isset($_GET['student_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing student_id']);
    exit;
}

$student_id = (int)$_GET['student_id'];
$stmt = $db->prepare('SELECT r.rating, r.comment, r.created_at, u.first_name AS publisher_name
                      FROM reviews r
                      JOIN users u ON r.reviewer_id = u.id
                      WHERE r.reviewee_id = ? ORDER BY r.created_at DESC');
$stmt->execute([$student_id]);
$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

$avgStmt = $db->prepare('SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewee_id = ?');
$avgStmt->execute([$student_id]);
$avg = $avgStmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'reviews' => $reviews,
    'avg_rating' => round($avg['avg_rating'], 2)
]);
?> 