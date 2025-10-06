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

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/process-sheets", async (req, res) => {
    try {
        const auth = await getGoogleAuth();
        const sheetsClient = google.sheets({ version: "v4", auth });
        console.log("Connected to Google API.");

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
        console.log("Timesheet collection started...");

        let allTransformedData = [];

        for (const sheetName of sheetNames) {
            const employeeData = await getData(
                sheetsClient,
                process.env.EMPLOYEES_SPREADSHEET_2025, // TODO: will update to 2026 later
                `${sheetName}!A:E`
            );

            if (!employeeData || employeeData.length === 0) {
                console.error(`No employee data collected for ${sheetName}`);
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

            console.log(`Collecting timesheet [${sheetName}] data...`);

            for (const employee of employees) {
                const data = await getData(
                    sheetsClient,
                    employee.spreadsheetId,
                    `${sheetName}!A7:BT39` // TODO: check if this range is correct for 2026
                );
                const transformedData = transformData(datasets, data, employee, projectData);
                allTransformedData = allTransformedData.concat(transformedData);
                console.log(`✅ [${sheetName}]-[${employee.nickname}] data processed.`);
            }
        }

        if (allTransformedData.length > 0) {
            const excelFilePath = await exportToExcel(allTransformedData, "TimeCollect_2025");
            await uploadToGoogleDrive(auth, excelFilePath);
            res.status(200).send("Sheets processed and data uploaded to Google Drive.");
        } else {
            res.status(200).send("No data found to process.");
        }
    } catch (error) {
        console.error("Error processing sheets:", error);
        res.status(500).send("An error occurred while processing the sheets.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});