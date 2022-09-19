import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import fs from 'fs';
import PCAPNGParser from 'pcap-ng-parser';


dotenv.config();

if (!(process.env.PORT && process.env.CLIENT_ORIGIN_URL && process.env.CLIENT_ORIGIN_DEV_URL)) {
    throw new Error(
        "Missing required environment variables. Check docs for more info."
    );
}

const PORT = parseInt(process.env.PORT, 10);
let CLIENT_ORIGIN_URL;

if (process.env.NODE_ENV === 'production') {
    CLIENT_ORIGIN_URL = process.env.CLIENT_ORIGIN_URL;
} else {
    CLIENT_ORIGIN_URL = process.env.CLIENT_ORIGIN_DEV_URL;
}

const allowedOrigins = [CLIENT_ORIGIN_URL];

console.log(CLIENT_ORIGIN_URL);

const uploadMiddleware = multer({ dest: 'tmp/uploads/' });

const app = express();

// Handle CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = `The CORS policy for this site (${origin}) does not allow access from the specified Origin.`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        //methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        //maxAge: 86400,
    })
);

app.post('/upload', uploadMiddleware.single('gregFile'), function (req, res) {
    console.log('Got a file!');

    // The multer middleware adds the "file" property 
    // to the request object. The file property contains useful
    // information about the file that was uploaded.

    console.log('The original filename was: "%s".', req.file.originalname);
    console.log('I saved the file to: %s.', req.file.path);
    console.log('The file is %s bytes in size.', req.file.size);

    // Now we can do something with the file data
    let text = fs.readFileSync(req.file.path).toString('UTF8');
    const text_arr = text.split(/r?\n/);
    console.log(text_arr);
    console.log("File contents:");
    console.log(text);
    console.log(""); // newline

    // And even use that in our response to the client
    let response = {
        message: "File uploaded successfully!",
        greeting: "Howdy"
    }
    if (text.includes("Hi")) {
        response.greeting = "Hello to you, too!"
        console.log("Hello to you, too!");
    }

    // Finish the request with an HTTP 200 code and an informative message, so we don't leave user
    // hanging in his or her browser.
    res.status(200).json(response);
});

// Handle errors
app.use((err, req, res, next) => {
    const status = err.statusCode || err.code || 500;
    const message = err.message || "internal error";

    console.error(status);
    console.error(message);
    response.status(status).json({ message });
});

// Handle not found
app.use((req, res, next) => {
    console.log(req)
    const message = "Not Found";

    res.status(404).json({ message });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
