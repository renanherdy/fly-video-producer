const fs = require('fs');
const path = require('path');

module.exports = async function saveProject(project) {
  fs.writeFileSync(project.savedPath, JSON.stringify(project));
  console.log('project', path.dirname(project));
  return project;
}