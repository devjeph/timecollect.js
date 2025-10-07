const { deleteColumns } = require("../utils/clean-data");
const { getName } = require("../utils/get-week-types");
const { getClient } = require("../utils/project-helper");

/**
 * Transforms raw data from a Google Sheet into a structured format.
 * @param {Array} dataset - The week type datasets.
 * @param {Array<Array<string>>} dataList - The raw data from the sheet.
 * @param {object} employee - The employee object.
 * @param {Array} project - The project data.
 * @returns {Array<Array<any>>} - The transformed data.
 */
function transformData(dataset, dataList, employee, project) {
    let transformedData = [];

    if (dataList && employee && dataList.length > 0) {
        dataList[0] = dataList[0].concat(["0.00", "0.00", "0.00", "0.00"]);

        const columnsToDelete = [
            3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71
        ];
        let data = deleteColumns(dataList, columnsToDelete);

        if (data.length > 1) {
            data[1].splice(0, 9, ...data[0].slice(0, 9));

        }

        const workData = ["日付", ...Array(8).fill("間接"), ...Array(40).fill("直接")];

        for (let col = 0; col < data[0].length - 3; col++) {
            for (let row = 0; row < data.length - 2; row++) {
                const year = parseInt(data[row + 2][0]);
                const month = parseInt(data[row + 2][1]);
                const day = parseInt(data[row + 2][2]);
                const employeeName = employee.nickname;
                const employeeTeam = employee.team;
                const weekType = getName(dataset, year, month, day);
                const taskType = data[1][col + 3];
                const projectCode = data[0][col + 3];
                const workType = workData[col + 3];
                const workedHours = parseFloat(data[row + 2][col + 3]).toFixed(2);
                const client = getClient(projectCode, project);

                transformedData.push([
                    client,
                    row + 1,
                    year,
                    month,
                    day,
                    weekType,
                    employeeName,
                    projectCode,
                    taskType,
                    workType,
                    employeeTeam,
                    workedHours
                ]);
            }
        }
    }

    return transformedData;
}

module.exports = { transformData };