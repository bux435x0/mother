<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $targetDir = 'uploads/';
    $filename = basename($_FILES['image']['name']);
    $target = $targetDir . $filename;
    move_uploaded_file($_FILES['image']['tmp_name'], $target);
}
header('Location: index.php');
