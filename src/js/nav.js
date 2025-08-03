/**
 * Initializes navigation functionality for scene transitions
 * @param {Array<string>} scenes - Array of scene CSS selectors
 * @param {Object} currentScene - Object containing current scene index (passed by reference)
 * @param {Function} updateChartForScene - Callback function to update charts when scene changes
 */
export function initializeNavigation(
  scenes,
  currentScene,
  updateChartForScene
) {
  document.getElementById("next").addEventListener("click", () => {
    if (currentScene.value < scenes.length - 1) {
      d3.select(scenes[currentScene.value]).classed("active", false);
      currentScene.value++;
      d3.select(scenes[currentScene.value]).classed("active", true);
      updateSceneIndicator(currentScene.value);
      updateChartForScene(currentScene.value);
      updateNavigationButtons(currentScene.value, scenes.length);
    }
  });

  document.getElementById("previous").addEventListener("click", () => {
    if (currentScene.value > 0) {
      d3.select(scenes[currentScene.value]).classed("active", false);
      currentScene.value--;
      d3.select(scenes[currentScene.value]).classed("active", true);
      updateSceneIndicator(currentScene.value);
      updateChartForScene(currentScene.value);
      updateNavigationButtons(currentScene.value, scenes.length);
    }
  });
  const dots = document.querySelectorAll(".nav-dot");
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index !== currentScene.value) {
        d3.select(scenes[currentScene.value]).classed("active", false);
        currentScene.value = index;
        d3.select(scenes[currentScene.value]).classed("active", true);
        updateSceneIndicator(currentScene.value);
        updateChartForScene(currentScene.value);
        updateNavigationButtons(currentScene.value, scenes.length);
      }
    });
  });
}

/**
 * Updates the visual indicators for the current scene
 * @param {number} sceneIndex - Index of the currently active scene
 */
function updateSceneIndicator(sceneIndex) {
  const dots = document.querySelectorAll(".nav-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === sceneIndex);
  });
}

/**
 * Updates the state of navigation buttons based on current scene
 * @param {number} sceneIndex - Index of the currently active scene
 * @param {number} totalScenes - Total number of scenes
 */
function updateNavigationButtons(sceneIndex, totalScenes) {
  const prevButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");

  prevButton.disabled = sceneIndex === 0;
  nextButton.disabled = sceneIndex === totalScenes - 1;
}
