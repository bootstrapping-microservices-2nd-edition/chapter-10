const express = require("express");
const amqp = require('amqplib');
const axios = require("axios");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.RABBIT) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");
}

const PORT = process.env.PORT;
const RABBIT = process.env.RABBIT;

//
// Application entry point.
//
async function main() {
    const messagingConnection = await amqp.connect(RABBIT); // Connects to the RabbitMQ server.
    
    const messageChannel = await messagingConnection.createChannel(); // Creates a RabbitMQ messaging channel.
    
    await messageChannel.assertExchange("viewed", "fanout"); // Asserts that we have a "viewed" exchange.

    //
    // Broadcasts the "viewed" message to other microservices.
    //
    function broadcastViewedMessage(messageChannel, videoId) {
        console.log(`Publishing message on "viewed" exchange.`);
            
        const msg = { video: { id: videoId } };
        const jsonMsg = JSON.stringify(msg);
        messageChannel.publish("viewed", "", Buffer.from(jsonMsg)); // Publishes message to the "viewed" exchange.
    }

    const app = express();

    app.get("/video", async (req, res) => { // Route for streaming video.

        const videoId = req.query.id;
        const response = await axios({ // Forwards the request to the video-storage microservice.
            method: "GET",
            url: `http://video-storage/video?id=${videoId}`, 
            data: req, 
            responseType: "stream",
        });
        response.data.pipe(res);

        broadcastViewedMessage(messageChannel, videoId); // Sends the "viewed" message to indicate this video has been watched.
    });

    app.listen(PORT, () => { // Starts the HTTP server.
        console.log("Microservice online.");
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });