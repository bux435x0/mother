<?php
session_start();
$loggedIn = isset($_SESSION['user']);
if (!is_dir('uploads')) {
    mkdir('uploads', 0777, true);
}
$images = array_values(array_filter(glob('uploads/*'), 'is_file'));
$postsFile = 'posts.json';
$posts = file_exists($postsFile) ? json_decode(file_get_contents($postsFile), true) : [];
?>
<!DOCTYPE html>
<html>
<head>
    <title>Artist Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1>My Art</h1>
    <nav>
        <a href="index.php">Home</a>
        <?php if ($loggedIn): ?>
            <a href="logout.php">Logout</a>
        <?php else: ?>
            <a href="login.php">Login</a>
        <?php endif; ?>
    </nav>
</header>
<section class="gallery">
    <?php foreach ($images as $img): ?>
        <img src="<?php echo htmlspecialchars($img); ?>" alt="">
    <?php endforeach; ?>
</section>
<?php if ($loggedIn): ?>
<section>
    <h2>Upload Image</h2>
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <input type="file" name="image" required>
        <button type="submit">Upload</button>
    </form>
</section>
<?php endif; ?>
<section id="blog">
    <h2>Blog</h2>
    <?php foreach ($posts as $post): ?>
        <div class="post">
            <small><?php echo htmlspecialchars(date('Y-m-d H:i', strtotime($post['date']))); ?></small>
            <p><?php echo nl2br(htmlspecialchars($post['content'])); ?></p>
        </div>
    <?php endforeach; ?>
    <?php if ($loggedIn): ?>
    <div>
        <form action="post.php" method="post">
            <textarea name="content" rows="4" cols="50" required></textarea><br>
            <button type="submit">Post</button>
        </form>
    </div>
    <?php endif; ?>
</section>
</body>
</html>
