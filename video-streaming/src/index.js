const express = require("express");
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
// Application entry point.
//
async function main() {
    const connection = await amqp.connect(RABBIT); // Connect to the RabbitMQ server.
    
    const messageChannel = await connection.createChannel(); // Create a RabbitMQ messaging channel.
    
    await messageChannel.assertExchange("viewed", "fanout"); // Assert that we have a "viewed" exchange.

    //
    // Broadcasts the "viewed" message to other microservices.
    //
    function broadcastViewedMessage(messageChannel, videoId) {
        console.log(`Publishing message on "viewed" exchange.`);
            
        const msg = { video: { id: videoId } };
        const jsonMsg = JSON.stringify(msg);
        messageChannel.publish("viewed", "", Buffer.from(jsonMsg)); // Publish message to the "viewed" exchange.
    }

    const app = express();

    app.get("/video", (req, res) => { // Route for streaming video.
        const videoId = req.query.id;

        const forwardRequest = http.request( // Forward the request to the video storage microservice.
            {
                host: `video-storage`,
                path: `/video?id=${videoId}`,
                method: 'GET',
                headers: req.headers,
            }, 
            forwardResponse => {
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
            }
        );
        
        req.pipe(forwardRequest);

        broadcastViewedMessage(messageChannel, videoId); // Send "viewed" message to indicate this video has been watched.
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