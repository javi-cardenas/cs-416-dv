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
  updateSliderDisplay("experience-min", "experience-min-value", (val) => val);
  updateSliderDisplay("experience-max", "experience-max-value", (val) => val);
  updateSliderDisplay(
    "comp-min",
    "comp-min-value",
    (val) => `$${parseInt(val).toLocaleString()}`
  );
  updateSliderDisplay(
    "comp-max",
    "comp-max-value",
    (val) => `$${parseInt(val).toLocaleString()}`
  );

  addFilterEventListeners();
  updateDualRangeHighlight();
  updateCompensationDualRangeHighlight();
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
    if (sliderId === "experience-min" || sliderId === "experience-max") {
      slider.addEventListener("input", () => {
        handleDualRangeUpdate(sliderId);
        display.textContent = formatter(slider.value);
        applyFilters();
      });
    } else if (sliderId === "comp-min" || sliderId === "comp-max") {
      slider.addEventListener("input", () => {
        handleCompensationDualRangeUpdate(sliderId);
        display.textContent = formatter(slider.value);
        applyFilters();
      });
    } else {
      slider.addEventListener("input", () => {
        display.textContent = formatter(slider.value);
        applyFilters();
      });
    }
  }
}

/**
 * Handles updates to dual range sliders for experience filtering
 * @param {string} changedSliderId - ID of the slider that changed
 */
function handleDualRangeUpdate(changedSliderId) {
  updateDualRangeHighlight();
}

/**
 * Updates the visual highlighting for the experience dual range slider
 */
function updateDualRangeHighlight() {
  const minSlider = document.getElementById("experience-min");
  const maxSlider = document.getElementById("experience-max");
  const container = document.getElementById("experience-range-container");

  if (!minSlider || !maxSlider || !container) return;

  const min = parseFloat(minSlider.min);
  const max = parseFloat(minSlider.max);
  const minVal = parseFloat(minSlider.value);
  const maxVal = parseFloat(maxSlider.value);

  // Handle cases where sliders cross over
  const actualMin = Math.min(minVal, maxVal);
  const actualMax = Math.max(minVal, maxVal);

  const leftPercent = ((actualMin - min) / (max - min)) * 100;
  const rightPercent = ((max - actualMax) / (max - min)) * 100;

  container.style.setProperty("--range-left", leftPercent + "%");
  container.style.setProperty("--range-right", rightPercent + "%");
  const style = document.createElement("style");
  style.textContent = `
    #experience-range-container::after {
      left: ${leftPercent}% !important;
      right: ${rightPercent}% !important;
    }
  `;

  const existingStyle = document.getElementById("dual-range-style");
  if (existingStyle) {
    existingStyle.remove();
  }

  style.id = "dual-range-style";
  document.head.appendChild(style);
}

/**
 * Handles updates to dual range sliders for compensation filtering
 * @param {string} changedSliderId - ID of the slider that changed
 */
function handleCompensationDualRangeUpdate(changedSliderId) {
  updateCompensationDualRangeHighlight();
}

/**
 * Updates the visual highlighting for the compensation dual range slider
 */
function updateCompensationDualRangeHighlight() {
  const minSlider = document.getElementById("comp-min");
  const maxSlider = document.getElementById("comp-max");
  const container = document.getElementById("compensation-range-container");

  if (!minSlider || !maxSlider || !container) return;

  const min = parseFloat(minSlider.min);
  const max = parseFloat(minSlider.max);
  const minVal = parseFloat(minSlider.value);
  const maxVal = parseFloat(maxSlider.value);

  // Handle cases where sliders cross over
  const actualMin = Math.min(minVal, maxVal);
  const actualMax = Math.max(minVal, maxVal);

  const leftPercent = ((actualMin - min) / (max - min)) * 100;
  const rightPercent = ((max - actualMax) / (max - min)) * 100;
  const style = document.createElement("style");
  style.textContent = `
    #compensation-range-container::after {
      left: ${leftPercent}% !important;
      right: ${rightPercent}% !important;
    }
  `;

  const existingStyle = document.getElementById("comp-dual-range-style");
  if (existingStyle) {
    existingStyle.remove();
  }

  style.id = "comp-dual-range-style";
  document.head.appendChild(style);
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
  const minExperience = parseFloat(
    document.getElementById("experience-min")?.value || 0
  );
  const maxExperience = parseFloat(
    document.getElementById("experience-max")?.value || 15
  );
  const minComp = parseInt(document.getElementById("comp-min")?.value || 0);
  const maxComp = parseInt(
    document.getElementById("comp-max")?.value || 200000
  );

  const filteredData = originalData.filter((item) => {
    if (item.responseCount < minResponses) return false;

    const actualMinExperience = Math.min(minExperience, maxExperience);
    const actualMaxExperience = Math.max(minExperience, maxExperience);
    if (
      item.avgExperience < actualMinExperience ||
      item.avgExperience > actualMaxExperience
    )
      return false;

    const actualMinComp = Math.min(minComp, maxComp);
    const actualMaxComp = Math.max(minComp, maxComp);
    if (
      item.medianCompensation < actualMinComp ||
      item.medianCompensation > actualMaxComp
    )
      return false;

    return true;
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
  const sliders = [
    { id: "responses-slider", value: 5000 },
    { id: "experience-min", value: 0 },
    { id: "experience-max", value: 15 },
    { id: "comp-min", value: 0 },
    { id: "comp-max", value: 200000 },
  ];

  sliders.forEach(({ id, value }) => {
    const slider = document.getElementById(id);
    if (slider) {
      slider.value = value;
    }
  });

  if (window.compensationFilters) {
    updateSliderDisplay(
      "responses-slider",
      "responses-value",
      (val) => `${parseInt(val).toLocaleString()}`
    );
    updateSliderDisplay("experience-min", "experience-min-value", (val) => val);
    updateSliderDisplay("experience-max", "experience-max-value", (val) => val);
    updateSliderDisplay(
      "comp-min",
      "comp-min-value",
      (val) => `$${parseInt(val).toLocaleString()}`
    );
    updateSliderDisplay(
      "comp-max",
      "comp-max-value",
      (val) => `$${parseInt(val).toLocaleString()}`
    );

    updateDualRangeHighlight();
    updateCompensationDualRangeHighlight();
    applyFilters();
  }
}
