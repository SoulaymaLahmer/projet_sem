const mongoose = require('mongoose');
const config = require('../config');

const connect = async () => {
    try {
        // MongoDB cloud connection
        const con = await mongoose.connect(config.MONGO_URI, {
            useNewUrlParser: true, // Still valid
            useUnifiedTopology: true, // Still valid
        });
        console.log(`MongoDB Connected: ${con.connection.host}`);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

module.exports = connect;
