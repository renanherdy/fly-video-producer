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
  if (loadedProject) {
    if (!Array.isArray(loadedProject.scenes)) {
      loadedProject.scenes = [];
    }
    return loadedProject;
  } else {
    return getEmptyProject();
  }
}

export function saveProjectToLocalStorage(project: any) {
  localStorage.setItem("project", JSON.stringify(project));
}

export function getCurrentScene() {
  return getObjectFromStorage("currentScene");
}

export function saveCurrentSceneToLocalStorage(currentScene: any) {
  localStorage.setItem("currentScene", JSON.stringify(currentScene));
}
