const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const fs = require("fs");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require("method-override");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use(methodOverride("_method"));

// Ensure the uploads directory exists
const UPLOAD_DIR = 'uploads';
if (!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({ storage: storage });

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

let posts = [
    {
        id: uuidv4(),
        img: "https://img.freepik.com/free-vector/background-monsoon-season_52683-115103.jpg",
        username: "sanskruti_09",
        caption: "💃Dance in the rain, and let the rhythm of the droplets soothe your soul🩵"
    },
    {
        id: uuidv4(),
        img: "https://cdn.openart.ai/published/q0RHz3RU9nYdEyfQoATc/mjrSkf5a_WGdD_512.webp",
        username: "chanchu_09",
        caption: "🌈Flying down the mountain, heart pumping with excitement😉"
    }
];

// Route to handle form submission
app.post('/posts', upload.single('img'), (req, res) => {
    const { username, caption } = req.body;
    const img = req.file;

    if (!img) {
        return res.status(400).send('No image uploaded');
    }

    const imgUrl = `/uploads/${img.filename}`;
    const id = Date.now().toString();
    posts.push({ id, img: imgUrl, username, caption });

    res.redirect("/posts");
});

app.get("/posts", (req, res) => {
    res.render("index.ejs", { posts });
});

app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});

app.get("/posts/:id", (req, res) => {
    const { id } = req.params;
    const post = posts.find((p) => p.id === id);
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render("show.ejs", { post });
});
app.patch("/posts/:id", (req, res) => {
    let { id } = req.params;
    let newcaption = req.body.caption;
    let post = posts.find((p) => p.id === id);
    post.caption=newcaption;
    console.log(post);
    res.redirect("/posts");
});

app.get("/posts/:id/edit", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => p.id === id);

    if (!post) {
        return res.status(404).send('Post not found');
    }

    res.render("edit.ejs", { post });
});
app.delete("/posts/:id",(req,res)=>{
    let { id } = req.params;
    posts = posts.filter((p) => p.id !== id);
    res.redirect("/posts");
})



app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
