const googleSheets = require('./google-sheets-service');
const transformData = require('./transform-data');

async function collect(entry) {
    const transformedEntry = transformData.transformData(entry);
    await googleSheets.save(transformedEntry);
}

module.exports = { collect };