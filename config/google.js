const { google } = require('googleapis');

async function getGoogleAuth() {
    const auth = google.auth.GoogleAuth({
        keyFile: "./google_credentials/credentials.json",
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });
    return auth;
}

module.exports = { getGoogleAuth };