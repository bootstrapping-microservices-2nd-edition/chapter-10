const express = require("express");
const mongodb = require("mongodb");
const amqp = require('amqplib');
const http = require("http");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.RABBIT) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");
}

const PORT = process.env.PORT;
const RABBIT = process.env.RABBIT;

//
//  Writes a Node.js stream to a HTTP POST request.
//
function streamToHttpPost(inputStream, uploadHost, uploadRoute, headers) {
    return new Promise((resolve, reject) => { // Wraps the stream in a promise so that we can wait for it to complete.
        const forwardRequest = http.request( // Forwards the request to the video storage microservice.
            {
                host: uploadHost,
                path: uploadRoute,
                method: 'POST',
                headers: headers,
            }
        );
        
        inputStream.on("error", reject);
        inputStream.pipe(forwardRequest)
            .on("error", reject)
            .on("end", resolve)
            .on("finish", resolve)
            .on("close", resolve);
    });
}

//
// Application entry point.
//
async function main() {

    const messagingConnection = await amqp.connect(RABBIT); // Connects to the RabbitMQ server.

    const messageChannel = await messagingConnection.createChannel(); // Creates a RabbitMQ messaging channel.

    const app = express();

    //
    // Broadcasts the "video-uploaded" message.
    //
    function broadcastVideoUploadedMessage(videoMetadata) {
        console.log(`Publishing message on "video-uploaded" exchange.`);
            
        const msg = { video: videoMetadata };
        const jsonMsg = JSON.stringify(msg);
        messageChannel.publish("video-uploaded", "", Buffer.from(jsonMsg)); // Publishes the message to the "video-uploaded" exchange.
    }

    //
    // Route for uploading videos.
    //
    app.post("/upload", async (req, res) => {
        const fileName = req.headers["file-name"];
        const videoId = new mongodb.ObjectId(); // Creates a new unique ID for the video.
        const newHeaders = Object.assign({}, req.headers, { id: videoId });
        await streamToHttpPost(req, `video-storage`, `/upload`, newHeaders)

        res.sendStatus(200);

        // Broadcasts the message to other microservices.
        broadcastVideoUploadedMessage({ id: videoId, name: fileName });
    });

    // Other handlers go here.

    app.listen(PORT, () => { // Starts the HTTP server.
        console.log("Microservice online.");
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });