const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function uploadToGoogleDrive(auth, filePath) {
  const drive = google.drive({ version: "v3", auth });
  const fileName = path.basename(filePath);
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("FATAL: GOOGLE_DRIVE_FOLDER_ID is not set in your .env file.");
  }

  try {
    // **Step 1: Verify the folder exists and we have access to it.**
    console.log(`Verifying access to Google Drive Folder ID: ${folderId}`);
    await drive.files.get({
      fileId: folderId,
      fields: 'id', // We only need the ID to confirm it exists.
    });
    console.log("✅ Folder verified successfully.");

  } catch (error) {
    console.error("❌ Critical Error: Could not find or access the Google Drive folder.");
    console.error("Please check two things:");
    console.error(`1. Is the GOOGLE_DRIVE_FOLDER_ID in your .env file correct?`);
    console.error(`2. Have you shared the folder with your service account email ('${auth.email}') and given it 'Editor' permissions?`);
    throw new Error(`Failed to access Google Drive folder. Original error: ${error.message}`);
  }

  try {
    // **Step 2: Search for an existing file to update, or create a new one.**
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    const media = {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: fs.createReadStream(filePath),
    };

    if (searchResponse.data.files.length > 0) {
      // File exists, so we update it.
      const fileId = searchResponse.data.files[0].id;
      console.log(`Found existing file with ID: ${fileId}. Updating it...`);
      const response = await drive.files.update({ fileId, media });
      console.log(`🚀 File successfully updated in Google Drive.`);
      return response.data;
    } else {
      // File does not exist, so we create it.
      console.log("No existing file found. Creating a new one...");
      const response = await drive.files.create({
        resource: { name: fileName, parents: [folderId] },
        media: media,
        fields: "id",
      });
      console.log(`🚀 File successfully uploaded to Google Drive.`);
      return response.data;
    }
  } catch (error) {
    console.error("Error during the file upload process:", error.message);
    throw error;
  }
}

module.exports = { uploadToGoogleDrive };