require("dotenv").config();
const { google } = require("googleapis");

/**
 * Creates or updates a Google Sheet with the provided data.
 * @param {object} auth - The authenticated Google JWT client.
 * @param {Array<Array<any>>} data - The transformed data to write to the sheet.
 */
async function createOrUpdateSheet(auth, data) {
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const spreadsheetName = process.env.OUTPUT_GOOGLE_SPREADSHEET_NAME;

    if (!folderId || !spreadsheetName ) {
        throw new Error("Missing environment variables. Check your .env file");
    }

    let spreadsheetId;

    // Search for an existing spreadsheet with the same name in the folder.
    console.log(`Searching for existing spreadsheet named: "${spreadsheetName}"`);
    const searchResponse = await drive.files.list({
        q: `name='${spreadsheetName}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        fields: 'files(id)',
        spaces: 'drive'
    });

    if (searchResponse.data.files.length > 0) {
        // Spreadsheet exists
        spreadsheetId = searchResponse.data.files[0].id;
        console.log(`Found existing spreadsheet with ID: ${spreadsheetId}`);

        console.log("Clearing existing data from the sheet...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: 'Sheet1'
        });
    } else {
        // Spreadsheet does not exist
        console.log("No existing spreadsheet found. Creating a new one...");

        const createResponse = await sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: spreadsheetName
                },
            },
            fields: 'spreadsheetId'
        });
        spreadsheetId = createResponse.data.spreadsheetId;

        // Move the newly created file to the correct folder
        await drive.files.update({
            fileId: spreadsheetId,
            addParents: folderId,
            removeParents: 'root',
            fields: 'id, parents'
        });
        console.log(`Successfully created and moved new spreadsheet with ID: ${spreadsheetId}`);
    }

    // Write the new data to the spreadseet.
    console.log("Writing new data to the spreadsheet...");
    const headers = [
        "対応", "行番号", "年", "月", "日", "WeekType", "名前", "工号", "種別", "直接/間接", "原寸/3D/管理", "時間"
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [headers, ...data],
        },
    });

    console.log("🚀 Success! Google Sheet has been updated with the latest data.");
    return spreadsheetId;
}

module.exports = { createOrUpdateSheet };