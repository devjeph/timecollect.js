const { JWT } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

async function getGoogleAuth() {
    const keyFilePath = path.join(__dirname, '..', 'google_credentials', 'serviceToken.json');

    try {
        // Read the service account credentials from the JSON file
        const credentialsContent = await fs.readFile(keyFilePath, 'utf8');
        const keys = JSON.parse(credentialsContent);

        // Use the credentials option instead of 'keyFile'
        const client = new JWT({
            email: keys.client_email,
            key: keys.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ]
        });
        return client;
    } catch (error) {
        console.error("FATAL ERROR: Failed to load Google service account credentials:", error);
        console.error("Please ensure the credentials file exists and is valid.");
        throw error;
    }
}

module.exports = { getGoogleAuth };