async function getData(sheets, spreadsheetId, range) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        return response.data.values || [];

    } catch (error) {
        console.error(`An error occurred while fetching from ${spreadsheetId} with range ${range}:, ${error}`);
        return [];
    }
}

module.exports = { getData };