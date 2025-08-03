/**
 * Initializes compensation filter functionality for the visualization
 * @param {Array<Object>} originalData - Original dataset to filter
 * @param {Function} createCompensationChartCallback - Function to recreate chart with filtered data
 */
export function initializeCompensationFilters(
  originalData,
  createCompensationChartCallback
) {
  if (window.compensationFilters) return;
  window.compensationFilters = {
    originalData: originalData,
    currentData: originalData,
    createCompensationChart: createCompensationChartCallback,
  };
  updateSliderDisplay(
    "responses-slider",
    "responses-value",
    (val) => `${parseInt(val).toLocaleString()}`
  );

  addFilterEventListeners();
}

/**
 * Updates slider display value and attaches event listeners
 * @param {string} sliderId - ID of the slider element
 * @param {string} displayId - ID of the display element to update
 * @param {Function} formatter - Function to format the slider value for display
 */
function updateSliderDisplay(sliderId, displayId, formatter) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);

  if (slider && display) {
    display.textContent = formatter(slider.value);
    slider.addEventListener("input", () => {
      display.textContent = formatter(slider.value);
      applyFilters();
    });
  }
}

/**
 * Adds event listeners for filter controls
 */
function addFilterEventListeners() {
  ["responses-slider"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", applyFilters);
    }
  });

  const resetButton = document.getElementById("reset-filters");
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
}

/**
 * Applies current filter settings to the data and updates the visualization
 */
export function applyFilters() {
  if (!window.compensationFilters) return;

  const originalData = window.compensationFilters.originalData;
  const minResponses = parseInt(
    document.getElementById("responses-slider")?.value || 0
  );

  const filteredData = originalData.filter((item) => {
    return item.responseCount >= minResponses;
  });

  window.compensationFilters.currentData = filteredData;
  if (window.compensationFilters.createCompensationChart) {
    window.compensationFilters.createCompensationChart(
      originalData,
      filteredData
    );
  }
}

/**
 * Resets all filter controls to their default values
 */
function resetFilters() {
  const slider = document.getElementById("responses-slider");
  if (slider) {
    slider.value = 0;
  }

  if (window.compensationFilters) {
    updateSliderDisplay(
      "responses-slider",
      "responses-value",
      (val) => `${parseInt(val).toLocaleString()}`
    );
    applyFilters();
  }
}
