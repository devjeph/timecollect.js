const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getName(datasets, year, month, day) {
    const targetDate = new Date(year, month - 1, day);
    for (let i = 0; i < datasets.length; i++) {
        const data = datasets[i];
        if (data["Start Date"] <= targetDate && targetDate <= data["End Date"]) {
            return data["Week Type"];
        }
    }
    return null;
}

function setTypes(year, month, day) {
    const dates = setDates(year, month, day);
    if (!dates) return [];
    const [sundays, saturdays, weekIndices, weekNames] = dates;

    return sundays.map((start, index) => ({
        "Start Date": start,
        "End Date": saturdays[index],
        "Week Number": weekIndices[index],
        "Week Type": weekNames[index]
    }));
}

function setName(startDate, endDate) {
    try {
        const startMonth = startDate.getMonth() + 1;
        const endMonth = endDate.getMonth() + 1;
        let weekName = `${startMonth}${String.fromCharCode(65 + Math.floor((startDate.getDate() - 1) / 7))}`;
        if (startMonth !== endMonth && startDate.getFullYear() !== endDate.getFullYear()) {
            weekName = `${endMonth}A`;
        } else if (startMonth === 1) {
            weekName = `${startMonth}${String.fromCharCode(66 + Math.floor((startDate.getDate() - 1) / 7))}`;
        } else if (startMonth !== endMonth && startDate.getFullYear() === endDate.getFullYear()) {
            weekName = `${startMonth}to${endMonth}`;
        }
        return weekName;
    } catch (error) {
        return "Invalid Date";
    }
}

function setDates(year, month, day) {
    const sundays = [], saturdays = [], weekIndices = [], weekNames = [];
    const startDate = new Date(year, month - 1, day);
    if (startDate.getDay() !== 0) {
        console.error(`Date must be a Sunday. You inputted a ${daysOfWeek[startDate.getDay()]}.`);
        return [];
    }
    for (let weekIndex = 0; weekIndex < 104; weekIndex++) {
        const sunday = new Date(startDate);
        sunday.setDate(startDate.getDate() + weekIndex * 7);
        const saturday = new Date(sunday);
        saturday.setDate(saturday.getDate() + 6);
        if (sunday.getFullYear() >= year + 2) break;
        const weekType = setName(sunday, saturday);
        sundays.push(sunday);
        saturdays.push(saturday);
        weekIndices.push(weekIndex + 1);
        weekNames.push(weekType);
    }
    weekNames[weekNames.length - 1] = "12to1";
    return [sundays, saturdays, weekIndices, weekNames];
}

module.exports = { getName, setTypes, setDates };