function deleteColumns(data, columnIndices) {
    return data.map(row => {
        return row.filter((_, index) => !columnIndices.includes(index));
    });
}

module.exports = { deleteColumns };