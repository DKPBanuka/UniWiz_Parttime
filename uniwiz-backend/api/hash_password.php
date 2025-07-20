<?php
$plain_password = "your_secure_admin_password"; // ඔබට භාවිතා කිරීමට අවශ්‍ය මුරපදය මෙහි දමන්න
$hashed_password = password_hash($plain_password, PASSWORD_BCRYPT);
echo "Plain Password: " . $plain_password . "<br>";
echo "Hashed Password: " . $hashed_password;
?>