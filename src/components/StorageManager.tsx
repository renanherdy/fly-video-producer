function getObjectFromStorage(itemName: string) {
  const itemString = String(localStorage.getItem(itemName));
  var item;
  if (itemString !== "" && itemString !== "null") {
    item = JSON.parse(itemString);
  }
  return item;
}

export function getEmptyProject() {
  return {
    projectName: "",
    savedPath: "",
    instructionGroups: [],
    savedOutputs: [],
    scenes: []
  };
}

export function loadProjectFromLocalStorage() {
  const loadedProject = getObjectFromStorage("project");
  var result;
  if (loadedProject) {
    result = loadedProject;
  } else {
    result = getEmptyProject();
  }
  return result;
}

export function saveProjectToLocalStorage(project: any) {
  localStorage.setItem("project", JSON.stringify(project));
}
