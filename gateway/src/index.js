const express = require("express");
const path = require("path");
const http = require("http");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

const PORT = process.env.PORT;

//
// Application entry point.
//
async function main() {
    const app = express();

    app.set("views", path.join(__dirname, "views")); // Set directory that contains templates for views.
    app.set("view engine", "hbs"); // Use hbs as the view engine for Express.
    
    app.use(express.static("public"));

    //
    // Main web page that lists videos.
    //
    app.get("/", (req, res) => {
        http.request( // Get the list of videos from the metadata microservice.
            {
                host: `metadata`,
                path: `/videos`,
                method: `GET`,
            },
            (response) => {
                let data = "";
                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {
                    // Renders the video list for display in the browser.
                    res.render("video-list", { videos: JSON.parse(data).videos });
                });

                response.on("error", err => {
                    console.error("Failed to get video list.");
                    console.error(err || `Status code: ${response.statusCode}`);
                    res.sendStatus(500);
                });
            }
        ).end();
    });

    //
    // Web page to play a particular video.
    //
    app.get("/video", (req, res) => {
        const videoId = req.query.id;
        http.request( // Get a particular video from the metadata microservice.
            {
                host: `metadata`,
                path: `/video?id=${videoId}`,
                method: `GET`,
            },
            (response) => {
                let data = "";
                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {
                    const metadata = JSON.parse(data).video;
                    const video = {
                        metadata,
                        url: `/api/video?id=${videoId}`,
                    };
                    
                    // Renders the video for display in the browser.
                    res.render("play-video", { video });
                });

                response.on("error", err => {
                    console.error(`Failed to get details for video ${videoId}.`);
                    console.error(err || `Status code: ${response.statusCode}`);
                    res.sendStatus(500);
                });
            }
        ).end();
    });

    //
    // Web page to upload a new video.
    //
    app.get("/upload", (req, res) => {
        res.render("upload-video", {});
    });

    //
    // Web page to show the users viewing history.
    //
    app.get("/history", (req, res) => {
        http.request( // Gets the viewing history from the history microservice.
            {
                host: `history`,
                path: `/history`,
                method: `GET`,
            },
            (response) => {
                let data = "";
                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {
                    // Renders the history for display in the browser.
                    res.render("history", { videos: JSON.parse(data).history });
                });

                response.on("error", err => {
                    console.error("Failed to get history.");
                    console.error(err || `Status code: ${response.statusCode}`);
                    res.sendStatus(500);
                });
            }
        ).end();
    });

    //
    // HTTP GET route that streams video to the user's browser.
    //
    app.get("/api/video", (req, res) => {
        
        const forwardRequest = http.request( // Forward the request to the video streaming microservice.
            {
                host: `video-streaming`,
                path: `/video?id=${req.query.id}`,
                method: 'GET',
            }, 
            forwardResponse => {
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
            }
        );
        
        req.pipe(forwardRequest);
    });

    //
    // HTTP POST route to upload video from the user's browser.
    //
    app.post("/api/upload", (req, res) => {

        const forwardRequest = http.request( // Forward the request to the video streaming microservice.
            {
                host: `video-upload`,
                path: `/upload`,
                method: 'POST',
                headers: req.headers,
            }, 
            forwardResponse => {
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
            }
        );
        
        req.pipe(forwardRequest);
    });

    app.listen(PORT, () => {
        console.log("Microservice online.");
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });