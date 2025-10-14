require("dotenv").config();
const { google } = require("googleapis");
const { authorize } = require('../config/google');

const sheets = google.sheets('v4');

async function getSheet(auth, spreadsheetId) {
    try {
        const request = { spreadsheetId, auth };
        const response = await sheets.spreadsheets.get(request);
        return response.data;
    } catch (error) {
        if (error.code === 404) {
            return null;
        }
        throw error;
    }
}

async function createSheet(auth, title) {
    const request = {
        resource: {
            properties: { title },
        },
        auth,
    };
    const response = await sheets.spreadsheets.create(request);
    return response.data;
}

async function save(entry) {
    const auth = await authorize();
    
    if (!spreadsheetId) {
        spreadsheetId = await createSheet(auth);
        console.log(`Created new spreadsheet with ID: ${spreadsheetId}`);
    }

    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [entry],
        },
        auth,
    };

    await sheets.spreadsheets.values.append(request);
}

module.exports = { save };