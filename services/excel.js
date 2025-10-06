const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

async function exportToExcel(data, sheetName) {
    const saveDirectory = process.env.OUTPUT_DIRECTORY || "./output";
    const filePath = path.join(saveDirectory, "TimeCollect.xlsx");

    await fs.mkdir(saveDirectory, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = [
        { header: "対応", key: "col1" },
        { header: "行番号", key: "col2" },
        { header: "年", key: "col3" },
        { header: "月", key: "col4" },
        { header: "日", key: "col5" },
        { header: "WeekType", key: "col6" },
        { header: "名前", key: "col7" },
        { header: "工号", key: "col8" },
        { header: "種別", key: "col9" },
        { header: "直接/間接", key: "col10" },
        { header: "原寸/3D/管理", key: "col11" },
        { header: "時間", key: "col12" },
    ];

    worksheet.addRows(data);

    await workbook.xlsx.writeFile(filePath);
    console.log(`Filename: TimeCollect.xlsx saved to ${saveDirectory}`);

    return filePath;
}

module.exports = { exportToExcel };