<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = trim($_POST['content'] ?? '');
    if ($content !== '') {
        $postsFile = 'posts.json';
        $posts = file_exists($postsFile) ? json_decode(file_get_contents($postsFile), true) : [];
        $posts[] = ['date' => date('c'), 'content' => $content];
        file_put_contents($postsFile, json_encode($posts, JSON_PRETTY_PRINT));
    }
}
header('Location: index.php');
