const express = require("express");
const path = require("path");
const axios = require("axios");

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
    app.get("/", async (req, res) => {

        // Retreives the list of videos from the metadata microservice.
        const videosResponse = await axios.get("http://metadata/videos");

        // Renders the video list for display in the browser.
        res.render("video-list", { videos: videosResponse.data.videos });
    });

    //
    // Web page to play a particular video.
    //
    app.get("/video", async (req, res) => {

        const videoId = req.query.id;

        // Retreives the data from the metadata microservice.
        const videoResponse = await axios.get(`http://metadata/video?id=${videoId}`);

        const video = {
            metadata: videoResponse.data.video,
            url: `/api/video?id=${videoId}`,
        };
        
        // Renders the video for display in the browser.
        res.render("play-video", { video });
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
    app.get("/history", async (req, res) => {

        // Retreives the data from the history microservice.
        const historyResponse = await axios.get("http://history/history");

        // Renders the history for display in the browser.
        res.render("history", { videos: historyResponse.data.history });
    });

    //
    // HTTP GET route that streams video to the user's browser.
    //
    app.get("/api/video", async (req, res) => {

        const response = await axios({ // Forwards the request to the video-streaming microservice.
            method: "GET",
            url: `http://video-streaming/video?id=${req.query.id}`, 
            data: req, 
            responseType: "stream",
        });
        response.data.pipe(res);
    });

    //
    // HTTP POST route to upload video from the user's browser.
    //
    app.post("/api/upload", async (req, res) => {

        const response = await axios({ // Forwards the request to the video-upload microservice.
            method: "POST",
            url: "http://video-upload/upload", 
            data: req, 
            responseType: "stream",
            headers: {
                "content-type": req.headers["content-type"],
                "file-name": req.headers["file-name"],
            },
        });
        response.data.pipe(res);
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