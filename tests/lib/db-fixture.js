//
// Helper functions for working with the database.
// Loaeding and unloading database fixture, etc.
//

const axios = require("axios");

//
// The URL for the database fixtures REST API.
//
const dbFixturesUrl = "http://localhost:9000";

//
// Loads a named database fixtyure.
//
async function loadFixture(databaseName, fixtureName) {
    unloadFixture(databaseName, fixtureName);

    const url = dbFixturesUrl + "/load-fixture?db=" + databaseName + "&fix=" + fixtureName;
    await axios.get(url);
}

//
// Unloads a named database fixtyure.
//
async function unloadFixture(databaseName, fixtureName) {
    const url = dbFixturesUrl + "/unload-fixture?db=" + databaseName + "&fix=" + fixtureName;
    await axios.get(url);
}

//
// Drops an entire database. Be careful!
//
async function dropDatabase(databaseName) {
    const url = dbFixturesUrl + "/drop-database?db=" + databaseName;
    await axios.get(url);
}

//
// Drops a collection of records from the database. Be careful!
//
async function dropCollection(databaseName, collectionName) {
    const url  = dbFixturesUrl + "/drop-collection?db=" + databaseName + "&col=" + collectionName;
    await axios.get(url);
}

//
// Gets a  collection of records from the database.
//
async function getCollection(databaseName, collectionName) {
    const url = dbFixturesUrl + "/get-collection?db=" + databaseName + "&col=" + collectionName;
    const { data } = await axios.get(url);
    return data;
}

module.exports = {
    loadFixture,
    unloadFixture,
    dropDatabase,
    dropCollection,
    getCollection,
};