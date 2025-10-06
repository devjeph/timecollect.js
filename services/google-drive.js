const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function uploadToGoogleDrive(auth, filePath) {
    try {
        const drive = google.drive({ version: 'v3', auth });
        const fileName = path.basename(filePath);
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            body: fs.createReadStream(filePath),
        };

        const searchResponse = await drive.files.list({
            q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive',
        });

        let response;
        if (searchResponse.data.files.length > 0) {
            const fileId = searchResponse.data.files[0].id;
            response = await drive.files.update({
                fileId: fileId,
                media: media,
            });
            console.log(`File sucesfully updated in Google Drive. File ID: ${response.data.id}`);
        } else {
            response = await drive.files.create({
                resource: {
                    name: fileName,
                    parents: [folderId],
                },
                media: media,
                fields: 'id',
            });
            console.log(`File successfully uploaded to Google Drive. File ID: ${response.data.id}`);
        }

        return response.data;
    } catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        throw error;
    }
}

module.exports = { uploadToGoogleDrive };