import {
  createBarChart,
  createScatterPlot,
  createStackedBarChart,
} from "./components/charts.js";
import { initializeCompensationFilters } from "./components/filter.js";
import { initializeNavigation } from "./components/nav.js";

const MAX_LANGUAGES = 20; // Adjust this to change how many languages are displayed

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
        createLanguageAIChart(languageAIData, rawData);
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
  const aiCategories = { Yes: 0, No: 0 };

  rawData.forEach((d) => {
    if (d.AISelect) {
      const response = d.AISelect.trim();
      if (response === "Yes") {
        aiCategories["Yes"]++;
      } else if (
        response === "No, but I plan to soon" ||
        response === "No, and I don't plan to"
      ) {
        aiCategories["No"]++;
      }
    }
  });

  // Create ordered categories for display
  const categoryOrder = ["Yes", "No"];
  const overallPercentages = categoryOrder.map((category) => ({
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
    .style("background", "#ccd0da")
    .style("padding", "15px")
    .style("border-radius", "8px")
    .style("margin-bottom", "20px")
    .style("border", "1px solid #bcc0cc");
  statsContainer
    .append("h3")
    .style("margin", "0 0 10px 0")
    .style("color", "#4c4f69")
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
      .style("color", "#6c6f85")
      .style("max-width", "150px")
      .style("margin", "0 auto")
      .text(`${data.category} (${data.count.toLocaleString()} developers)`);
  });

  statsContainer
    .append("div")
    .style("text-align", "center")
    .style("margin-top", "15px")
    .style("padding-top", "15px")
    .style("border-top", "1px solid #bcc0cc")
    .style("font-size", "14px")
    .style("color", "#6c6f85")
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
      return "#40a02b";
    case "No":
      return "#d20f39";
    default:
      return "#6c6f85";
  }
}

/**
 * Processes language-specific AI adoption data for visualization
 * @param {Array<Object>} rawData - Raw survey data
 * @param {Array<Object>} languageData - Processed language popularity data
 * @returns {Array<Object>} Processed data for language-AI adoption visualization
 */
function processLanguageAIAdoptionData(rawData, languageData) {
  const topLanguages = MAX_LANGUAGES
    ? languageData.slice(0, MAX_LANGUAGES)
    : languageData;
  const languageAIStats = {};
  topLanguages.forEach((lang) => {
    languageAIStats[lang.language] = {
      yes: 0,
      no: 0,
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
          } else if (
            aiResponse === "No, but I plan to soon" ||
            aiResponse === "No, and I don't plan to"
          ) {
            languageAIStats[cleanLang].no++;
          }
        }
      });
    }
  });

  return topLanguages
    .map((lang) => ({
      language: lang.language,
      yes: languageAIStats[lang.language].yes,
      no: languageAIStats[lang.language].no,
      total: languageAIStats[lang.language].total,
      yesPercentage: (
        (languageAIStats[lang.language].yes /
          languageAIStats[lang.language].total) *
        100
      ).toFixed(1),
      noPercentage: (
        (languageAIStats[lang.language].no /
          languageAIStats[lang.language].total) *
        100
      ).toFixed(1),
    }))
    .filter((lang) => lang.total >= 50)
    .sort((a, b) => parseFloat(b.yesPercentage) - parseFloat(a.yesPercentage));
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

  const languageResult = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: parseFloat(((count / totalResponses) * 100).toFixed(1)),
    }))
    .filter((lang) => lang.percentage > 1.0)
    .sort((a, b) => b.percentage - a.percentage);

  return MAX_LANGUAGES
    ? languageResult.slice(0, MAX_LANGUAGES)
    : languageResult;
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

  const compensationResult = Object.entries(languageStats)
    .filter(([lang, stats]) => stats.count >= 3)
    .map(([language, stats]) => ({
      language,
      avgExperience:
        stats.experiences.reduce((a, b) => a + b, 0) / stats.experiences.length,
      medianCompensation: d3.median(stats.compensations),
      responseCount: stats.count,
    }))
    .sort((a, b) => b.responseCount - a.responseCount);

  return MAX_LANGUAGES
    ? compensationResult.slice(0, MAX_LANGUAGES)
    : compensationResult;
}

/**
 * Creates stacked bar chart showing AI adoption by programming language
 * @param {Array<Object>} data - Processed language-AI adoption data
 * @param {Array<Object>} rawData - Raw survey data for calculating overall averages
 */
function createLanguageAIChart(data, rawData) {
  console.log("Creating language AI adoption stacked bar chart...");
  console.log(`Showing ${data.length} languages with AI adoption data`);

  // Calculate overall averages from Scene 3 data
  const totalResponses = rawData.length;
  const overallYes = rawData.filter(
    (d) => d.AISelect && d.AISelect.trim() === "Yes"
  ).length;
  const overallNo = rawData.filter(
    (d) =>
      d.AISelect &&
      (d.AISelect.trim() === "No, but I plan to soon" ||
        d.AISelect.trim() === "No, and I don't plan to")
  ).length;

  const avgYesPercentage = (overallYes / totalResponses) * 100;
  const avgNoPercentage = (overallNo / totalResponses) * 100;

  console.log(
    `Overall averages: Yes ${avgYesPercentage.toFixed(
      1
    )}%, No ${avgNoPercentage.toFixed(1)}%`
  );

  createStackedBarChart("#language-ai-chart", data, {
    xField: "language",
    stackFields: ["yes", "no"],
    stackLabels: ["Yes", "No"],
    colors: ["#40a02b", "#d20f39"],
    xAxisLabel: "Programming Language",
    yAxisLabel: "Number of Developers",
    rotateXLabels: true,
    showLegend: true,
    showPercentageLabels: true,

    averagePercentages: {
      yes: avgYesPercentage,
      no: avgNoPercentage,
    },
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
    color: "#1e66f5",
    width: 1200,
    height: Math.max(450, Math.min(600, data.length * 22 + 180)),
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
