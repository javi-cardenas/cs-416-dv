import { createBarChart, createScatterPlot } from "./utils.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const scenes = ["#scene-1", "#scene-2", "#scene-3"];
  let currentScene = 0;

  // Load and process data
  try {
    const rawData = await loadSampleData();

    // Process data for different visualizations
    const languageData = processLanguageDataWithPercentages(rawData);
    const compensationData = processCompensationDataWithLanguages(rawData);
    const aiAdoptionData = processAIAdoptionData(rawData);

    console.log("Processed language data:", languageData.length, "records");
    console.log(
      "Processed compensation data:",
      compensationData.length,
      "records"
    );
    console.log(
      "Processed AI adoption data:",
      aiAdoptionData.length,
      "records"
    );

    // Populate AI tool dropdown
    populateAIToolDropdown(rawData);

    // Initial chart rendering
    updateChartForScene(currentScene);

    // Add event listeners to navigation buttons
    document.getElementById("next").addEventListener("click", () => {
      if (currentScene < scenes.length - 1) {
        d3.select(scenes[currentScene]).classed("active", false);
        currentScene++;
        d3.select(scenes[currentScene]).classed("active", true);
        updateSceneIndicator(currentScene);
        updateChartForScene(currentScene);
        updateNavigationButtons(currentScene, scenes.length);
      }
    });

    document.getElementById("previous").addEventListener("click", () => {
      if (currentScene > 0) {
        d3.select(scenes[currentScene]).classed("active", false);
        currentScene--;
        d3.select(scenes[currentScene]).classed("active", true);
        updateSceneIndicator(currentScene);
        updateChartForScene(currentScene);
        updateNavigationButtons(currentScene, scenes.length);
      }
    });

    // AI tool dropdown change handler
    d3.select("#ai-tool-select").on("change", function () {
      const selectedTool = d3.select(this).property("value");
      if (selectedTool) {
        updateAIAdoptionChart(selectedTool, rawData);
      }
    });

    function updateChartForScene(sceneIndex) {
      if (sceneIndex === 0) {
        createLanguageChart(languageData);
      } else if (sceneIndex === 1) {
        createCompensationChart(compensationData);
      } else if (sceneIndex === 2) {
        // Initialize with first AI tool if available
        const firstTool = document.querySelector(
          "#ai-tool-select option:nth-child(2)"
        )?.value;
        if (firstTool) {
          document.getElementById("ai-tool-select").value = firstTool;
          updateAIAdoptionChart(firstTool, rawData);
        }
      }
    }

    function updateSceneIndicator(sceneIndex) {
      document.getElementById("scene-indicator").textContent = `Scene ${
        sceneIndex + 1
      } of ${scenes.length}`;
    }

    function updateNavigationButtons(sceneIndex, totalScenes) {
      const prevButton = document.getElementById("previous");
      const nextButton = document.getElementById("next");

      prevButton.disabled = sceneIndex === 0;
      nextButton.disabled = sceneIndex === totalScenes - 1;
    }
  } catch (error) {
    console.error("Failed to initialize application:", error);
    // Display error message to user
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
      <h3>Error Loading Data</h3>
      <p>${error.message}</p>
      <p>Please ensure the data file exists at: <code>data/project-dataset/data.json</code></p>
    `;
    document.querySelector("main").prepend(errorDiv);
  }
}

// Data loading and processing functions
async function loadSampleData() {
  try {
    console.log("Loading real Stack Overflow survey data...");
    const response = await fetch("data/project-dataset/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allData = await response.json();
    console.log(`Loaded ${allData.length} total records from survey data`);

    // Sample 2000 random records for performance while maintaining statistical validity
    const sampleSize = Math.min(2000, allData.length);
    const sampledData = [];
    const indices = new Set();

    while (indices.size < sampleSize) {
      indices.add(Math.floor(Math.random() * allData.length));
    }

    indices.forEach((index) => {
      sampledData.push(allData[index]);
    });

    // Filter for valid records with all required fields
    const filteredData = sampledData.filter(
      (d) =>
        d.YearsCodePro !== null &&
        d.ConvertedCompYearly !== null &&
        d.LanguageHaveWorkedWith !== null &&
        d.AISelect !== null &&
        d.ConvertedCompYearly > 0 &&
        d.ConvertedCompYearly < 500000 && // Remove unrealistic outliers
        d.YearsCodePro !== "More than 50 years" // Remove edge case
    );

    console.log(`Using ${filteredData.length} valid records for visualization`);
    return filteredData;
  } catch (error) {
    console.error("Error loading data:", error);
    throw new Error(
      "Failed to load Stack Overflow survey data. Please check that data/project-dataset/data.json exists and is accessible."
    );
  }
}

// Data processing functions for real Stack Overflow survey data

function processAIAdoptionData(data) {
  const aiCounts = {};

  data.forEach((d) => {
    if (d.AISelect) {
      aiCounts[d.AISelect] = (aiCounts[d.AISelect] || 0) + 1;
    }
  });

  return Object.entries(aiCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);
}

function populateAIToolDropdown(data) {
  const aiTools = [
    ...new Set(data.filter((d) => d.AISelect).map((d) => d.AISelect)),
  ].sort();
  const select = d3.select("#ai-tool-select");

  select.selectAll("option:not(:first-child)").remove();

  select
    .selectAll("option.ai-option")
    .data(aiTools)
    .enter()
    .append("option")
    .attr("class", "ai-option")
    .attr("value", (d) => d)
    .text((d) => d);
}

// Interactive chart update functions

function updateAIAdoptionChart(selectedTool, rawData) {
  console.log("Updating AI adoption chart for:", selectedTool);

  const filteredData = rawData.filter(
    (d) => d.AISelect === selectedTool && d.YearsCodePro
  );
  const experienceGroups = {};

  filteredData.forEach((d) => {
    const exp = Math.floor(parseFloat(d.YearsCodePro) / 5) * 5; // Group by 5-year intervals
    const expLabel = `${exp}-${exp + 4} years`;
    experienceGroups[expLabel] = (experienceGroups[expLabel] || 0) + 1;
  });

  const chartData = Object.entries(experienceGroups)
    .map(([experience, count]) => ({ experience, count }))
    .sort((a, b) => parseInt(a.experience) - parseInt(b.experience));

  createBarChart("#ai-adoption-chart", chartData, {
    xField: "experience",
    yField: "count",
    xAxisLabel: "Years of Experience",
    yAxisLabel: `Developers using ${selectedTool}`,
    rotateXLabels: false,
    color: "#764ba2",
    width: 900,
    height: 400,
    margin: { top: 20, right: 30, bottom: 80, left: 60 },
  });
}

// New data processing functions for professional visualization
function processLanguageDataWithPercentages(data) {
  const languageCounts = {};
  const totalResponses = data.length;

  data.forEach((d) => {
    if (d.LanguageHaveWorkedWith) {
      const languages = d.LanguageHaveWorkedWith.split(";");
      languages.forEach((lang) => {
        const cleanLang = lang.trim();
        if (cleanLang) {
          languageCounts[cleanLang] = (languageCounts[cleanLang] || 0) + 1;
        }
      });
    }
  });

  // Convert to array with percentages and sort by percentage, take top 15
  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: parseFloat(((count / totalResponses) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

function processCompensationDataWithLanguages(data) {
  const languageStats = {};

  data.forEach((d) => {
    if (
      d.LanguageHaveWorkedWith &&
      d.YearsCodePro &&
      d.ConvertedCompYearly &&
      d.YearsCodePro !== "More than 50 years" &&
      d.ConvertedCompYearly > 0
    ) {
      const experience = parseFloat(d.YearsCodePro);
      const compensation = parseFloat(d.ConvertedCompYearly);

      if (
        !isNaN(experience) &&
        !isNaN(compensation) &&
        experience <= 30 &&
        compensation < 500000
      ) {
        const languages = d.LanguageHaveWorkedWith.split(";");
        languages.forEach((lang) => {
          const cleanLang = lang.trim();
          if (cleanLang) {
            if (!languageStats[cleanLang]) {
              languageStats[cleanLang] = {
                experiences: [],
                compensations: [],
                count: 0,
              };
            }
            languageStats[cleanLang].experiences.push(experience);
            languageStats[cleanLang].compensations.push(compensation);
            languageStats[cleanLang].count++;
          }
        });
      }
    }
  });

  // Calculate averages and return formatted data
  return Object.entries(languageStats)
    .filter(([lang, stats]) => stats.count >= 10) // Minimum 10 responses
    .map(([language, stats]) => ({
      language,
      avgExperience:
        stats.experiences.reduce((a, b) => a + b, 0) / stats.experiences.length,
      medianCompensation: d3.median(stats.compensations),
      responseCount: stats.count,
    }))
    .sort((a, b) => b.responseCount - a.responseCount)
    .slice(0, 20);
}

// Chart creation functions using real survey data
function createLanguageChart(data) {
  console.log("Creating language percentage chart...");
  createBarChart("#language-chart", data, {
    xField: "language",
    yField: "percentage",
    xAxisLabel: "Programming Language",
    yAxisLabel: "Responses (%)",
    rotateXLabels: true,
    color: "#4A90E2",
    width: 900,
    height: 500,
    margin: { top: 20, right: 30, bottom: 120, left: 60 },
  });
}

function createCompensationChart(data) {
  console.log("Creating compensation bubble chart...");
  createScatterPlot("#compensation-chart", data, {
    xField: "avgExperience",
    yField: "medianCompensation",
    radiusField: "responseCount",
    colorField: "language",
    xAxisLabel: "Average Years of Professional Coding",
    yAxisLabel: "Median Compensation ($)",
    width: 900,
    height: 500,
    margin: { top: 20, right: 150, bottom: 60, left: 80 },
  });
}

// End of chart functions
