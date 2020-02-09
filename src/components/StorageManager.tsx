export function getEmptyProject() {
  return {
    projectName: "",
    savedPath: "",
    instructionGroups: [],
    savedOutputs: []
  };
}

export function loadProjectFromLocalStorage() {
  const projectString = String(localStorage.getItem("project"));
  var project = getEmptyProject();
  if (projectString !== "" && projectString !== "null") {
    project = JSON.parse(projectString);
  }
  return project;
}

export function saveProjectToLocalStorage(project: any ) {
  localStorage.setItem("project", JSON.stringify(project));
}
