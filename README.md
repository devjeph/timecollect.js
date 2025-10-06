
# TimeCollect.js

`TimeCollect.js` is a Node.js web application designed to automate the collection and processing of timesheet data from Google Sheets BPG Timesheet. It aggregates data from multiple employee sheets, transforms it into a structured format, generates a consolidated Excel exported data, and automatically uploads it to a specified folder in Google Drive.

## ✨ Features

* **Automated Data Fetching** : Connects to the Google Sheets API to pull data from multiple timesheets.
* **Data Transformation** : Cleans, structures, and aggregates timesheet entries into a single dataset.
* **Excel Report Generation** : Creates a `.xlsx` file from the processed data using `exceljs`.
* **Google Drive Integration** : Automatically uploads the final report to a designated Google Drive folder, updating the existing file if it's already there.
* **Web Interface** : A simple UI with a single button to trigger the entire process and a log panel to monitor progress.

## 🛠️ Tech Stack

* **Backend** : Node.js, Express.js
* **APIs** : Google Sheets API v4, Google Drive API v3
* **Key Libraries** :
* `googleapis` for Google API interaction.
* `exceljs` for creating Excel files.
* `dotenv` for environment variable management.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* **Node.js** (v18.x or later recommended)
* A **Google Cloud Platform** project with a configured Service Account.

### Installation and Setup

1. **Clone the repository**
   

   ```
   git clone https://github.com/your-username/timecollect.js.git
   cd timecollect.js
   ```
2. **Install dependencies**

   ```
   npm install
   ```
3. **Google Cloud Setup**

   * Ensure you have a Google Cloud project created.
   * In your project, enable the **Google Sheets API** and the  **Google Drive API** .
   * Create a **Service Account** and download its JSON key file.
   * Rename the downloaded key to `credentials.json` and place it inside the `/google_credentials` directory.
   * Share your Google Sheets with the service account's email address as a  **Viewer** .
   * Create a target folder in Google Drive and share it with the service account's email as an  **Editor** .
4. **Configure Environment Variables**

   * Create a `.env` file in the root of the project. You can copy the example below.
   * Fill in the required values for your project.

   **Code snippet**

   ```
   # .env file

   # Application Port
   PORT=3000

   # Dataset Configuration for week types
   DATASET_YEAR=2024
   DATASET_MONTH=12
   DATASET_DAY=29

   # Sheet Names to process (comma-separated)
   SHEET_NAMES=202509,202510

   # Google Sheet IDs and Ranges
   PROJECT_SPREADSHEET=your_project_spreadsheet_id_here
   PROJECT_RANGE=Sheet1!A:C
   EMPLOYEES_SPREADSHEET_2025=your_employees_spreadsheet_id_here
   OUTPUT_DIRECTORY=./output

   # Google Drive Folder ID
   # Get this from the URL of your target folder in Google Drive
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   ```

### Usage

1. **Start the server**
   

   ```
   npm start
   ```

   The application will be running at `http://localhost:3000`.
2. **Run the process**

   * Open your web browser and navigate to `http://localhost:3000`.
   * Click the **"Process Timesheets"** button.
   * Monitor the progress in the log panel on the webpage and in your terminal.
   * Upon completion, the `TimeCollect.xlsx` file will be saved locally in the `/output` directory and uploaded to your specified Google Drive folder.

## 🧪 Testing

This project is set up with Jest for automated testing.

1. **Install testing dependencies** (if you haven't already)
   

   ```
   npm install --save-dev jest supertest
   ```
2. **Run tests**

   ```
   npm test
   ```
