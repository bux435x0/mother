const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const upload = multer({ dest: UPLOAD_DIR });

app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(UPLOAD_DIR));

function readPosts() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login.html');
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'artist' && password === 'password') {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.redirect('/login.html');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/upload', isAuthenticated, upload.single('image'), (req, res) => {
  res.redirect('/');
});

app.post('/post', isAuthenticated, (req, res) => {
  const posts = readPosts();
  posts.push({ date: new Date().toISOString(), content: req.body.content });
  writePosts(posts);
  res.redirect('/');
});

app.get('/gallery', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) files = [];
    const images = files.map(f => `/uploads/${f}`);
    res.json({ images });
  });
});

app.get('/posts', (req, res) => {
  const posts = readPosts();
  res.json({ posts });
});
app.get("/auth", (req, res) => { res.json({ loggedIn: !!req.session.user }); });

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
