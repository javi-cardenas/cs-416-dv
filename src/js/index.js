import {
  createBarChart,
  createScatterPlot,
  createStackedBarChart,
} from "./utils.js";
import { initializeCompensationFilters } from "./filter.js";
import { initializeNavigation } from "./nav.js";

document.addEventListener("DOMContentLoaded", init);

/**
 * Main initialization function for the data visualization application
 */
async function init() {
  const scenes = ["#scene-0", "#scene-1", "#scene-2", "#scene-3", "#scene-4"];
  let currentScene = { value: 0 }; // Use object to pass by reference

  try {
    const rawData = await loadSurveyData();

    // Process data for different visualizations
    const languageData = processLanguageDataWithPercentages(rawData);
    const compensationData = processCompensationDataWithLanguages(rawData);
    const languageAIData = processLanguageAIAdoptionData(rawData, languageData);

    console.log("Processed language data:", languageData.length, "records");
    console.log(
      "Processed compensation data:",
      compensationData.length,
      "records"
    );
    console.log(
      "Processed language-AI data:",
      languageAIData.length,
      "records"
    );

    // Initial chart rendering
    updateChartForScene(currentScene.value);
    initializeNavigation(scenes, currentScene, updateChartForScene);

    /**
     * Updates the chart displayed based on the current scene
     * @param {number} sceneIndex - Index of the scene to display
     */
    function updateChartForScene(sceneIndex) {
      if (sceneIndex === 0) {
        return;
      } else if (sceneIndex === 1) {
        createLanguageChart(languageData);
      } else if (sceneIndex === 2) {
        createCompensationChart(compensationData);
      } else if (sceneIndex === 3) {
        updateAIAdoptionChart(null, rawData);
      } else if (sceneIndex === 4) {
        createLanguageAIChart(languageAIData);
      }
    }
  } catch (error) {
    console.error("Failed to initialize application:", error);
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

/**
 * Loads and filters Stack Overflow survey data from JSON file
 * @returns {Promise<Array<Object>>} Promise resolving to filtered survey data
 * @throws {Error} When data loading fails
 */
async function loadSurveyData() {
  try {
    console.log("Loading complete Stack Overflow survey data...");
    const response = await fetch("data/project-dataset/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allData = await response.json();
    console.log(`Loaded ${allData.length} total records from survey data`);

    // Filter for valid records with all required fields
    const filteredData = allData.filter(
      (d) =>
        d.YearsCodePro !== null &&
        d.LanguageHaveWorkedWith !== null &&
        d.AISelect !== null &&
        d.YearsCodePro !== "More than 50 years" &&
        ((d.ConvertedCompYearly !== null &&
          d.ConvertedCompYearly > 0 &&
          d.ConvertedCompYearly < 500000) ||
          (d.CompTotal !== null && d.CompTotal > 0 && d.CompTotal < 500000))
    );

    console.log(
      `Using ${filteredData.length} valid records for visualization (${(
        (filteredData.length / allData.length) *
        100
      ).toFixed(1)}% of total)`
    );
    return filteredData;
  } catch (error) {
    console.error("Error loading data:", error);
    throw new Error(
      "Failed to load Stack Overflow survey data. Please check that data/project-dataset/data.json exists and is accessible."
    );
  }
}

/**
 * Updates the AI adoption chart with survey response data
 * @param {string|null} selectedTool - Currently selected AI tool (unused in current implementation)
 * @param {Array<Object>} rawData - Raw survey data
 */
function updateAIAdoptionChart(selectedTool, rawData) {
  console.log("Updating AI adoption chart for:", selectedTool);
  const totalResponses = rawData.length;
  const aiCategories = {};

  rawData.forEach((d) => {
    if (d.AISelect) {
      const category = d.AISelect.trim();
      aiCategories[category] = (aiCategories[category] || 0) + 1;
    }
  });

  // Create ordered categories for display
  const categoryOrder = ["Yes", "No, but I plan to", "No, and I don't plan to"];
  const overallPercentages = categoryOrder
    .filter((category) => aiCategories[category]) // Only include categories that exist in data
    .map((category) => ({
      category,
      count: aiCategories[category] || 0,
      percentage: parseFloat(
        (((aiCategories[category] || 0) / totalResponses) * 100).toFixed(1)
      ),
    }));

  createBarChart("#ai-adoption-chart", overallPercentages, {
    xField: "category",
    yField: "percentage",
    xAxisLabel: "AI Tool Usage Response",
    yAxisLabel: "Percentage of All Developers (%)",
    rotateXLabels: false,
    colorFunction: (d) => getColorForCategory(d.category),
    width: 900,
    height: 400,
    margin: { top: 20, right: 30, bottom: 80, left: 60 },
  });

  updateAIStatsDisplay(overallPercentages, totalResponses);
}

/**
 * Creates and displays AI adoption statistics
 * @param {Array<Object>} overallPercentages - Array of AI adoption data by category
 * @param {number} totalResponses - Total number of survey responses
 */
function updateAIStatsDisplay(overallPercentages, totalResponses) {
  d3.select("#ai-stats-display").remove();

  const statsContainer = d3
    .select("#ai-adoption-chart")
    .insert("div", ":first-child")
    .attr("id", "ai-stats-display")
    .style("background", "#313244")
    .style("padding", "15px")
    .style("border-radius", "8px")
    .style("margin-bottom", "20px")
    .style("border", "1px solid #45475a");
  statsContainer
    .append("h3")
    .style("margin", "0 0 10px 0")
    .style("color", "#cdd6f4")
    .text("AI Tool Adoption Survey Results");

  const overallStats = statsContainer
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-around")
    .style("margin-bottom", "10px");

  overallPercentages.forEach((data) => {
    const statItem = overallStats
      .append("div")
      .style("text-align", "center")
      .style("padding", "10px")
      .style("flex", "1");

    statItem
      .append("div")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("color", getColorForCategory(data.category))
      .text(`${data.percentage}%`);

    statItem
      .append("div")
      .style("font-size", "14px")
      .style("color", "#a6adc8")
      .style("max-width", "150px")
      .style("margin", "0 auto")
      .text(`${data.category} (${data.count.toLocaleString()} developers)`);
  });

  statsContainer
    .append("div")
    .style("text-align", "center")
    .style("margin-top", "15px")
    .style("padding-top", "15px")
    .style("border-top", "1px solid #45475a")
    .style("font-size", "14px")
    .style("color", "#a6adc8")
    .text(
      `Total survey responses: ${totalResponses.toLocaleString()} developers`
    );
}

/**
 * Returns appropriate color for AI adoption category
 * @param {string} category - AI adoption category
 * @returns {string} Hex color code
 */
function getColorForCategory(category) {
  switch (category) {
    case "Yes":
      return "#a6e3a1";
    case "No, but I plan to":
      return "#fab387";
    case "No, and I don't plan to":
      return "#f38ba8";
    default:
      return "#a6adc8";
  }
}

/**
 * Processes language-specific AI adoption data for visualization
 * @param {Array<Object>} rawData - Raw survey data
 * @param {Array<Object>} languageData - Processed language popularity data
 * @returns {Array<Object>} Processed data for language-AI adoption visualization
 */
function processLanguageAIAdoptionData(rawData, languageData) {
  const topLanguages = languageData.slice(0, 15);
  const languageAIStats = {};
  topLanguages.forEach((lang) => {
    languageAIStats[lang.language] = {
      yes: 0,
      planning: 0,
      notPlanning: 0,
      total: 0,
    };
  });

  rawData.forEach((d) => {
    if (d.LanguageHaveWorkedWith && d.AISelect) {
      const languages = d.LanguageHaveWorkedWith.split(";");
      const aiResponse = d.AISelect.trim();

      languages.forEach((lang) => {
        const cleanLang = lang.trim();
        if (languageAIStats[cleanLang]) {
          languageAIStats[cleanLang].total++;

          if (aiResponse === "Yes") {
            languageAIStats[cleanLang].yes++;
          } else if (aiResponse === "No, but I plan to") {
            languageAIStats[cleanLang].planning++;
          } else if (aiResponse === "No, and I don't plan to") {
            languageAIStats[cleanLang].notPlanning++;
          }
        }
      });
    }
  });

  return topLanguages
    .map((lang) => ({
      language: lang.language,
      yes: languageAIStats[lang.language].yes,
      planning: languageAIStats[lang.language].planning,
      notPlanning: languageAIStats[lang.language].notPlanning,
      total: languageAIStats[lang.language].total,
      yesPercentage: (
        (languageAIStats[lang.language].yes /
          languageAIStats[lang.language].total) *
        100
      ).toFixed(1),
      planningPercentage: (
        (languageAIStats[lang.language].planning /
          languageAIStats[lang.language].total) *
        100
      ).toFixed(1),
      notPlanningPercentage: (
        (languageAIStats[lang.language].notPlanning /
          languageAIStats[lang.language].total) *
        100
      ).toFixed(1),
    }))
    .filter((lang) => lang.total >= 50)
    .sort((a, b) => b.total - a.total);
}

/**
 * Processes language popularity data with usage percentages
 * @param {Array<Object>} data - Raw survey data
 * @returns {Array<Object>} Processed language data with percentages and counts
 */
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

  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: parseFloat(((count / totalResponses) * 100).toFixed(1)),
    }))
    .filter((lang) => lang.percentage > 1.0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 15);
}

/**
 * Processes compensation and experience data by programming language
 * @param {Array<Object>} data - Raw survey data
 * @returns {Array<Object>} Processed compensation data with language statistics
 */
function processCompensationDataWithLanguages(data) {
  const languageData = processLanguageDataWithPercentages(data);
  const validLanguages = new Set(languageData.map((lang) => lang.language));

  const languageStats = {};
  let convertedCompCount = 0;
  let compTotalCount = 0;

  data.forEach((d) => {
    if (
      d.LanguageHaveWorkedWith &&
      d.YearsCodePro &&
      d.YearsCodePro !== "More than 50 years"
    ) {
      const experience = parseFloat(d.YearsCodePro);
      let compensation = null;
      if (d.ConvertedCompYearly && d.ConvertedCompYearly > 0) {
        compensation = parseFloat(d.ConvertedCompYearly);
        convertedCompCount++;
      } else if (d.CompTotal && d.CompTotal > 0) {
        compensation = parseFloat(d.CompTotal);
        compTotalCount++;
      }

      if (
        !isNaN(experience) &&
        compensation !== null &&
        !isNaN(compensation) &&
        experience <= 30 &&
        compensation < 500000 &&
        compensation > 0
      ) {
        const languages = d.LanguageHaveWorkedWith.split(";");
        languages.forEach((lang) => {
          const cleanLang = lang.trim();
          if (cleanLang && validLanguages.has(cleanLang)) {
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

  console.log(
    `Compensation data sources: ${convertedCompCount} from ConvertedCompYearly, ${compTotalCount} from CompTotal (${
      convertedCompCount + compTotalCount
    } total)`
  );

  return Object.entries(languageStats)
    .filter(([lang, stats]) => stats.count >= 3)
    .map(([language, stats]) => ({
      language,
      avgExperience:
        stats.experiences.reduce((a, b) => a + b, 0) / stats.experiences.length,
      medianCompensation: d3.median(stats.compensations),
      responseCount: stats.count,
    }))
    .sort((a, b) => b.responseCount - a.responseCount)
    .slice(0, 15);
}

/**
 * Creates stacked bar chart showing AI adoption by programming language
 * @param {Array<Object>} data - Processed language-AI adoption data
 */
function createLanguageAIChart(data) {
  console.log("Creating language AI adoption stacked bar chart...");
  console.log(`Showing ${data.length} languages with AI adoption data`);

  createStackedBarChart("#language-ai-chart", data, {
    xField: "language",
    stackFields: ["yes", "planning", "notPlanning"],
    stackLabels: ["Yes", "No, but I plan to", "No, and I don't plan to"],
    colors: ["#a6e3a1", "#fab387", "#f38ba8"],
    xAxisLabel: "Programming Language",
    yAxisLabel: "Number of Developers",
    rotateXLabels: true,
    showLegend: true,
    width: 1000,
    height: 600,
    margin: { top: 40, right: 180, bottom: 120, left: 80 },
  });
}

/**
 * Creates bar chart showing programming language popularity
 * @param {Array<Object>} data - Processed language popularity data
 */
function createLanguageChart(data) {
  console.log("Creating language percentage chart...");
  console.log(`Showing ${data.length} languages with >1% usage`);
  createBarChart("#language-chart", data, {
    xField: "language",
    yField: "percentage",
    xAxisLabel: "Programming Language",
    yAxisLabel: "Responses (%)",
    rotateXLabels: true,
    color: "#89b4fa",
    width: 900,
    height: Math.max(500, data.length * 25 + 200),
    margin: { top: 40, right: 30, bottom: 120, left: 60 },
  });
}

/**
 * Creates scatter plot showing compensation vs experience by programming language
 * @param {Array<Object>} data - Original compensation data
 * @param {Array<Object>|null} [filteredData=null] - Filtered data to display (if null, uses original data)
 */
export function createCompensationChart(data, filteredData = null) {
  console.log("Creating compensation bubble chart with language labels...");
  const dataToShow = filteredData || data;
  console.log(
    `Showing ${dataToShow.length} languages from scene 1 with compensation data`
  );

  if (!window.compensationFilters) {
    initializeCompensationFilters(data, createCompensationChart);
  }

  createScatterPlot("#compensation-chart", dataToShow, {
    xField: "avgExperience",
    yField: "medianCompensation",
    radiusField: "responseCount",
    colorField: "language",
    xAxisLabel: "Average Years of Professional Coding",
    yAxisLabel: "Median Compensation ($)",
    width: 700,
    height: 500,
    margin: { top: 40, right: 120, bottom: 60, left: 80 },
  });
}
