const express = require("express");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

//
// Throws an error if the any required environment variables are missing.
//

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error("Please specify the name of an Azure storage account in environment variable STORAGE_ACCOUNT_NAME.");
}

if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error("Please specify the access key to an Azure storage account in environment variable STORAGE_ACCESS_KEY.");
}

//
// Extracts environment variables to globals for convenience.
//

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;
const STORAGE_CONTAINER_NAME = "videos";

console.log(`Serving videos from Azure storage account ${STORAGE_ACCOUNT_NAME}/${STORAGE_CONTAINER_NAME}.`);

//
// Create the Blob service API to communicate with Azure storage.
//
function createBlobService() {
    const sharedKeyCredential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    const blobService = new BlobServiceClient(
        `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        sharedKeyCredential
    );
    return blobService;
}

const app = express();

//
// Registers a HTTP GET route to retrieve videos from storage.
//
app.get("/video", async (req, res) => {

    const videoId = req.query.id;

    const blobService = createBlobService();
    const containerClient = blobService.getContainerClient(STORAGE_CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(videoId);
    const properties = await blobClient.getProperties();

    //
    // Writes HTTP headers to the response.
    //
    res.writeHead(200, {
        "Content-Length": properties.contentLength,
        "Content-Type": "video/mp4",
    });

    const response = await blobClient.download();
    response.readableStreamBody.pipe(res);
});

//
// HTTP POST route to upload a video to Azure storage.
//
app.post("/upload", async (req, res) => {

    const videoId = req.headers.id;
    const contentType = req.headers["content-type"];

    const blobService = createBlobService();

    const containerClient = blobService.getContainerClient(STORAGE_CONTAINER_NAME); 
    await containerClient.createIfNotExists(); // Creates the container if it doesn't already exist.

    const blockBlobClient = containerClient.getBlockBlobClient(videoId);
    await blockBlobClient.uploadStream(req);
    await blockBlobClient.setHTTPHeaders({
        blobContentType: contentType,
    });
    res.sendStatus(200);
});

//
// Starts the HTTP server.
//
app.listen(PORT, () => {
    console.log(`Microservice online`);
});
