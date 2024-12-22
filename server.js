// Required libraries
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const UploadModel = require("./model/schema");
const fs = require("fs");
require("dotenv").config(); // Import environment variables

// Initialize the app
const app = express();

// Dummy user database
const users = [];

// Passport configuration
const initializePassport = require("./passport-config");
initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
);

// Middleware
app.use(express.static("public")); // Adjust if public is not in the root
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET || "defaultSecret", // Use the session secret from .env file
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Connect MongoDB database
require("./database/database")();

// View Engine
app.set("views", "./views");
app.set("view engine", "ejs");

// Authentication Middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

// File Upload with Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads"); // Ensure "uploads" folder exists
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
        cb(null, file.fieldname + "-" + Date.now() + ext);
    },
});
const upload = multer({ storage });

// Ensure the uploads folder exists
if (!fs.existsSync("uploads")) {
    try {
        fs.mkdirSync("uploads");
    } catch (err) {
        console.error("Error creating uploads directory:", err);
    }
}

// Routes
app.get("/", ensureAuthenticated, async (req, res) => {
    try {
        // Fetch images by user ID and category
        const images = await UploadModel.find({ userId: req.user.id }); // Make sure all images are fetched
        res.render("wardrobe", { name: req.user.name, images });
    } catch (err) {
        console.error("Error fetching images:", err);
        res.status(500).send("Error loading images.");
    }
});


app.get("/home", (req, res) => {
    res.render("index");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register");
});

// File upload handler
app.post("/uploadmultiple", ensureAuthenticated, upload.array("images", 12), async (req, res) => {
    const files = req.files;
    const category = req.body.category; // Get the selected category from the form
    if (!files || files.length === 0) {
        return res.status(400).send("Please upload files.");
    }

    try {
        // Convert images into base64 encoding and include the category
        const imgArray = files.map((file) => {
            const img = fs.readFileSync(file.path);
            // After saving the image to the database, remove the file
            fs.unlinkSync(file.path);
            return {
                filename: file.originalname,
                contentType: file.mimetype,
                imageBase64: img.toString("base64"),
                category: category, // Store the selected category
                userId: req.user.id, // Associate image with the logged-in user
            };
        });

        // Save images to MongoDB
        await Promise.all(
            imgArray.map((img) => {
                const newUpload = new UploadModel(img);
                return newUpload.save();
            })
        );

        res.redirect("/"); // Redirect to wardrobe page after upload
    } catch (err) {
        console.error("Error uploading files:", err);
        res.status(500).send("Error uploading files.");
    }
});

// Registration
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        res.redirect("/login");
    } catch (e) {
        console.error("Registration error:", e);
        res.redirect("/register");
    }
});

// Login
app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

// Logout
app.delete("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out.");
        }
        res.redirect("/login");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
