require("dotenv").config();
const path = require("path");
const express = require("express");
const { google } = require("googleapis");
const { getGoogleAuth } = require("./config/google");
const { getData } = require("./services/data-collection");
const { transformData } = require("./services/transform-data");
const { exportToExcel } = require("./services/excel");
const { setTypes } = require("./utils/get-week-types");
const { uploadToGoogleDrive } = require("./services/google-drive");
const { log, logEmitter } = require("./services/log-stream");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish the connection

    const sendLog = (message) => {
        res.write(`data: ${message}\n\n`);
    };

    logEmitter.on('log', sendLog);

    // Clean up when the client closes the connection
    req.on('close', () => {
        logEmitter.removeListener('log', sendLog);
    });
});

app.post("/process-sheets", async (req, res) => {
    try {
        const auth = await getGoogleAuth();
        const sheetsClient = google.sheets({ version: "v4", auth });
        log("Connected to Google API.");

        const year = parseInt(process.env.DATASET_YEAR);
        const month = parseInt(process.env.DATASET_MONTH);
        const day = parseInt(process.env.DATASET_DAY);
        const sheetNames = process.env.SHEET_NAMES.split(',');
        const datasets = setTypes(year, month, day);

        const projectData = await getData(
            sheetsClient,
            process.env.PROJECT_SPREADSHEET,
            process.env.PROJECT_RANGE
        );
        log("Timesheet collection started...");

        let allTransformedData = [];

        for (const sheetName of sheetNames) {
            const employeeData = await getData(
                sheetsClient,
                process.env.EMPLOYEES_SPREADSHEET_2025, // TODO: will update to 2026 later
                `${sheetName}!A:E`
            );

            if (!employeeData || employeeData.length === 0) {
                log(`⚠️ No employee data collected for ${sheetName}`);
                continue;
            }

            const employees = employeeData
                .filter((employee) => employee.length > 0)
                .map((employee) => ({

                    id: parseInt(employee[0]),
                    name: employee[1],
                    nickname: employee[2],
                    spreadsheetId: employee[4],
                    team: employee[3]
                }));

            log(`Extracting timesheet [${sheetName}] data...\n`);

            for (const employee of employees) {
                const data = await getData(
                    sheetsClient,
                    employee.spreadsheetId,
                    `${sheetName}!A7:BT39` // TODO: check if this range is correct for 2026
                );
                const transformedData = transformData(datasets, data, employee, projectData);
                allTransformedData = allTransformedData.concat(transformedData);
                log(`✅ [${sheetName}]-[${employee.nickname}] data processed.`);
            }
            log(`All data for sheet ${sheetName} processed.`);
        }

        // *** BUG FIX ***: The response should only be sent ONCE, after all loops are finished.
        if (allTransformedData.length > 0) {
            log("Generating Excel file...\n");
            const excelFilePath = await exportToExcel(allTransformedData, "TimeCollect");
            log("Uploading file to Google Drive...\n");
            await uploadToGoogleDrive(auth, excelFilePath);
            log("🚀 Success! Process complete.");
            res.status(200).send("Processing complete. File uploaded to Google Drive.");
        } else {
            log("No data found to process.");
            res.status(200).send("No data found to process.\n");
        }
    } catch (error) {
        console.error("Error processing sheets:", error);
        res.status(500).send(`An error occurred while processing the sheets.\n${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});