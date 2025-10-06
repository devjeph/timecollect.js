function projectDict(data) {
    return data.map(project => ({
        "Project Code": project[0],
        "Project Name": project[1],
        "Project Client": project[2],
    }));
}

function getClient(projectCode, projectData) {
    const projectDatasets = projectDict(projectData);
    const project = projectDatasets.find(proj => proj["Project Code"] === projectCode);
    return project ? project["Project Client"] : "YTP";
}

module.exports = { getClient };