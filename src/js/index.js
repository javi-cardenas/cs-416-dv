import {
  createBarChart,
  createScatterPlot,
  createStackedBarChart,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const scenes = ["#scene-1", "#scene-2", "#scene-3", "#scene-4"];
  let currentScene = 0;

  // Load and process data
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

    function updateChartForScene(sceneIndex) {
      if (sceneIndex === 0) {
        createLanguageChart(languageData);
      } else if (sceneIndex === 1) {
        createCompensationChart(compensationData);
      } else if (sceneIndex === 2) {
        // Initialize with overall AI adoption percentages
        updateAIAdoptionChart(null, rawData);
      } else if (sceneIndex === 3) {
        createLanguageAIChart(languageAIData);
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
        d.ConvertedCompYearly !== null &&
        d.LanguageHaveWorkedWith !== null &&
        d.AISelect !== null &&
        d.ConvertedCompYearly > 0 &&
        d.ConvertedCompYearly < 500000 && // Remove unrealistic outliers
        d.YearsCodePro !== "More than 50 years" // Remove edge case
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

// Data processing functions for real Stack Overflow survey data

// Interactive chart update functions

function updateAIAdoptionChart(selectedTool, rawData) {
  console.log("Updating AI adoption chart for:", selectedTool);

  // Calculate AI adoption percentages by category
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

  // Show overall AI adoption chart with the three categories
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

  // Add overall statistics text
  updateAIStatsDisplay(overallPercentages, totalResponses);
}

function updateAIStatsDisplay(overallPercentages, totalResponses) {
  // Remove existing stats display
  d3.select("#ai-stats-display").remove();

  // Create stats display container
  const statsContainer = d3
    .select("#ai-adoption-chart")
    .insert("div", ":first-child")
    .attr("id", "ai-stats-display")
    .style("background", "#f8f9fa")
    .style("padding", "15px")
    .style("border-radius", "8px")
    .style("margin-bottom", "20px")
    .style("border", "1px solid #dee2e6");

  // Add title
  statsContainer
    .append("h3")
    .style("margin", "0 0 10px 0")
    .style("color", "#495057")
    .text("AI Tool Adoption Survey Results");

  // Add overall percentages
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
      .style("color", "#6c757d")
      .style("max-width", "150px")
      .style("margin", "0 auto")
      .text(`${data.category} (${data.count.toLocaleString()} developers)`);
  });

  // Add summary information
  statsContainer
    .append("div")
    .style("text-align", "center")
    .style("margin-top", "15px")
    .style("padding-top", "15px")
    .style("border-top", "1px solid #dee2e6")
    .style("font-size", "14px")
    .style("color", "#6c757d")
    .text(
      `Total survey responses: ${totalResponses.toLocaleString()} developers`
    );
}

function getColorForCategory(category) {
  switch (category) {
    case "Yes":
      return "#2E8B57"; // Green for current users
    case "No, but I plan to":
      return "#FF8C00"; // Orange for those planning to use
    case "No, and I don't plan to":
      return "#DC3545"; // Red for those not planning to use
    default:
      return "#6c757d"; // Default gray
  }
}

// Process language-AI adoption data for Scene 4
function processLanguageAIAdoptionData(rawData, languageData) {
  // Get the top languages from scene 1 (already filtered for >1% usage)
  const topLanguages = languageData.slice(0, 15); // Show top 15 languages for readability
  const languageAIStats = {};

  // Initialize counters for each language
  topLanguages.forEach((lang) => {
    languageAIStats[lang.language] = {
      yes: 0,
      planning: 0,
      notPlanning: 0,
      total: 0,
    };
  });

  // Count AI adoption for each language
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

  // Convert to array format needed for stacked bar chart
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
    .filter((lang) => lang.total >= 50) // Only include languages with at least 50 responses
    .sort((a, b) => b.total - a.total); // Sort by total responses
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

  // Convert to array with percentages and filter by >1% usage
  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: parseFloat(((count / totalResponses) * 100).toFixed(1)),
    }))
    .filter((lang) => lang.percentage > 1.0) // Only show languages with >1% usage
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
}

function processCompensationDataWithLanguages(data) {
  // First, get the list of languages with >1% usage from the first scene
  const languageData = processLanguageDataWithPercentages(data);
  const validLanguages = new Set(languageData.map((lang) => lang.language));

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
          // Only include languages that have >1% usage in first scene
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

  // Calculate averages and return formatted data for all valid languages
  return Object.entries(languageStats)
    .filter(([lang, stats]) => stats.count >= 3) // Reduced minimum to 3 responses for more inclusivity
    .map(([language, stats]) => ({
      language,
      avgExperience:
        stats.experiences.reduce((a, b) => a + b, 0) / stats.experiences.length,
      medianCompensation: d3.median(stats.compensations),
      responseCount: stats.count,
    }))
    .sort((a, b) => b.responseCount - a.responseCount); // Removed slice limit to show all languages
}

// Chart creation function for Scene 4
function createLanguageAIChart(data) {
  console.log("Creating language AI adoption stacked bar chart...");
  console.log(`Showing ${data.length} languages with AI adoption data`);

  createStackedBarChart("#language-ai-chart", data, {
    xField: "language",
    stackFields: ["yes", "planning", "notPlanning"],
    stackLabels: ["Yes", "No, but I plan to", "No, and I don't plan to"],
    colors: ["#2E8B57", "#FF8C00", "#DC3545"], // Green, Orange, Red
    xAxisLabel: "Programming Language",
    yAxisLabel: "Number of Developers",
    rotateXLabels: true,
    showLegend: true,
    width: 1000,
    height: 600,
    margin: { top: 40, right: 180, bottom: 120, left: 80 },
  });
}

// Chart creation functions using real survey data
function createLanguageChart(data) {
  console.log("Creating language percentage chart...");
  console.log(`Showing ${data.length} languages with >1% usage`);
  createBarChart("#language-chart", data, {
    xField: "language",
    yField: "percentage",
    xAxisLabel: "Programming Language",
    yAxisLabel: "Responses (%)",
    rotateXLabels: true,
    color: "#4A90E2",
    width: 900,
    height: Math.max(500, data.length * 25 + 200), // Dynamic height based on number of languages
    margin: { top: 40, right: 30, bottom: 120, left: 60 }, // Increased top margin for percentage labels
  });
}

function createCompensationChart(data) {
  console.log("Creating compensation bubble chart with language labels...");
  console.log(
    `Showing ${data.length} languages from scene 1 with compensation data`
  );
  createScatterPlot("#compensation-chart", data, {
    xField: "avgExperience",
    yField: "medianCompensation",
    radiusField: "responseCount",
    colorField: "language",
    xAxisLabel: "Average Years of Professional Coding",
    yAxisLabel: "Median Compensation ($)",
    width: 1000, // Increased width to accommodate more labels
    height: 600, // Increased height for better spacing
    margin: { top: 40, right: 200, bottom: 60, left: 80 }, // Increased right margin for more labels
  });
}

// End of chart functions
