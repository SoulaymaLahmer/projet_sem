const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    imageBase64: String,
    category: String, // Category field
    userId: String, // This associates the image with a user
});

module.exports = mongoose.model("Upload", uploadSchema);
