/**
 * Creates a customizable bar chart using D3.js
 * @param {string} containerId - CSS selector for the container element
 * @param {Array<Object>} data - Array of data objects to visualize
 * @param {Object} [options={}] - Configuration options for the chart
 * @param {number} [options.width=800] - Chart width in pixels
 * @param {number} [options.height=600] - Chart height in pixels
 * @param {Object} [options.margin] - Chart margins
 * @param {string} [options.xField="x"] - Property name for x-axis values
 * @param {string} [options.yField="y"] - Property name for y-axis values
 * @param {string} [options.color="#1e66f5"] - Default bar color
 * @param {string} [options.xAxisLabel=""] - Label for x-axis
 * @param {string} [options.yAxisLabel=""] - Label for y-axis
 * @param {boolean} [options.rotateXLabels=false] - Whether to rotate x-axis labels
 * @param {Function} [options.colorFunction] - Function to determine bar colors
 * @returns {Object} Object containing SVG elements and scales
 */
function createBarChart(containerId, data, options = {}) {
  const defaults = {
    width: 800,
    height: 600,
    margin: { top: 20, right: 30, bottom: 100, left: 50 },
    xField: "x",
    yField: "y",
    color: "#1e66f5",
    xAxisLabel: "",
    yAxisLabel: "",
    rotateXLabels: false,
  };

  const config = { ...defaults, ...options };

  d3.select(containerId).selectAll("*").remove(); // clear existing SVG content

  const svg = d3
    .select(containerId)
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height);

  const width = config.width - config.margin.left - config.margin.right;
  const height = config.height - config.margin.top - config.margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

  // Scales
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[config.xField]))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[config.yField])])
    .range([height, 0]);

  // X-axis
  const xAxis = g
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  if (config.rotateXLabels) {
    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  }

  // Y-axis
  g.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "bar-tooltip")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "rgba(239, 241, 245, 0.95)")
    .style("color", "#4c4f69")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("border", "1px solid #bcc0cc");

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[config.xField]))
    .attr("y", (d) => y(d[config.yField]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[config.yField]))
    .attr("fill", (d) =>
      config.colorFunction ? config.colorFunction(d) : config.color
    )
    .on("mouseover", function (event, d) {
      let tooltipContent = "";

      if (d.breakdown) {
        tooltipContent = `<strong>${d.category}</strong><br/>`;
        tooltipContent += `Total: ${d.count.toLocaleString()} developers (${
          d.percentage
        }%)<br/><br/>`;
        tooltipContent += `<strong>Breakdown:</strong><br/>`;

        Object.entries(d.breakdown).forEach(([subcategory, data]) => {
          tooltipContent += `${subcategory}: ${data.count.toLocaleString()} developers (${
            data.percentage
          }%)<br/>`;
        });
      } else if (d.count !== undefined && d.percentage !== undefined) {
        const fieldName = d[config.xField];
        tooltipContent = `<strong>${fieldName}</strong><br/>`;
        tooltipContent += `${d.percentage}% of developers<br/>`;
        tooltipContent += `${d.count.toLocaleString()} responses`;
      }

      if (tooltipContent) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      }
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add percentage labels on bars
  if (data.length > 0 && data[0].hasOwnProperty("percentage")) {
    g.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d[config.xField]) + x.bandwidth() / 2)
      .attr("y", (d) => y(d[config.yField]) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#4c4f69")
      .text((d) => d.percentage + "%");
  }

  // Axis labels
  if (config.xAxisLabel) {
    svg
      .append("text")
      .attr("transform", `translate(${config.width / 2}, ${config.height - 5})`)
      .style("text-anchor", "middle")
      .text(config.xAxisLabel);
  }

  if (config.yAxisLabel) {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - config.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(config.yAxisLabel);
  }

  return { svg, g, x, y };
}

/**
 * Creates a customizable scatter plot with optional sizing and coloring by data fields
 * @param {string} containerId - CSS selector for the container element
 * @param {Array<Object>} data - Array of data objects to visualize
 * @param {Object} [options={}] - Configuration options for the chart
 * @param {number} [options.width=800] - Chart width in pixels
 * @param {number} [options.height=600] - Chart height in pixels
 * @param {Object} [options.margin] - Chart margins
 * @param {string} [options.xField="x"] - Property name for x-axis values
 * @param {string} [options.yField="y"] - Property name for y-axis values
 * @param {string} [options.radiusField=null] - Property name for circle radius sizing
 * @param {string} [options.colorField=null] - Property name for circle coloring
 * @param {number} [options.radius=5] - Default circle radius
 * @param {string} [options.color="#1e66f5"] - Default circle color
 * @param {string} [options.xAxisLabel=""] - Label for x-axis
 * @param {string} [options.yAxisLabel=""] - Label for y-axis
 * @param {boolean} [options.showTooltip=true] - Whether to show tooltips on hover
 * @returns {Object} Object containing SVG elements, scales, and tooltip
 */
function createScatterPlot(containerId, data, options = {}) {
  const defaults = {
    width: 800,
    height: 600,
    margin: { top: 20, right: 30, bottom: 60, left: 50 },
    xField: "x",
    yField: "y",
    radiusField: null,
    colorField: null,
    radius: 5,
    color: "#1e66f5",
    xAxisLabel: "",
    yAxisLabel: "",
    showTooltip: true,
  };

  const config = { ...defaults, ...options };

  d3.select(containerId).selectAll("*").remove(); // clear existing SVG content

  const svg = d3
    .select(containerId)
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height);

  const width = config.width - config.margin.left - config.margin.right;
  const height = config.height - config.margin.top - config.margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

  // Scales
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[config.xField]))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[config.yField]))
    .range([height, 0]);

  // Optional radius scale
  let radiusScale = null;
  if (config.radiusField) {
    radiusScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[config.radiusField]))
      .range([3, 20]);
  }

  // Optional color scale
  let colorScale = null;
  if (config.colorField) {
    const colorDomain = Array.from(
      new Set(data.map((d) => d[config.colorField]))
    );
    const catppuccinColors = [
      "#1e66f5",
      "#8839ef",
      "#d20f39",
      "#fe640b",
      "#df8e1d",
      "#40a02b",
      "#179299",
      "#04a5e5",
      "#7287fd",
      "#ea76cb",
      "#4c4f69",
      "#5c5f77",
      "#6c6f85",
      "#7c7f93",
      "#8c8fa1",
    ];
    colorScale = d3.scaleOrdinal(catppuccinColors).domain(colorDomain);
  }

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y-axis
  g.append("g").call(d3.axisLeft(y));

  let tooltip = null;
  if (config.showTooltip) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "rgba(239, 241, 245, 0.95)")
      .style("color", "#4c4f69")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  // Circles
  g.selectAll(".chart-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "chart-dot")
    .attr("cx", (d) => x(d[config.xField]))
    .attr("cy", (d) => y(d[config.yField]))
    .attr("r", (d) =>
      radiusScale ? radiusScale(d[config.radiusField]) : config.radius
    )
    .attr("fill", (d) =>
      colorScale ? colorScale(d[config.colorField]) : config.color
    )
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      if (tooltip) {
        let tooltipContent = "";

        if (config.colorField && d[config.colorField]) {
          tooltipContent += `<strong>${d[config.colorField]}</strong><br/>`;
        }

        if (config.xField === "avgExperience") {
          tooltipContent += `Avg. Experience: ${d[config.xField].toFixed(
            2
          )} years<br/>`;
        } else {
          tooltipContent += `${config.xField}: ${d[config.xField]}<br/>`;
        }

        if (config.yField === "medianCompensation") {
          tooltipContent += `Median Compensation: $${d[
            config.yField
          ].toLocaleString()}`;
        } else {
          tooltipContent += `${config.yField}: ${d[config.yField]}`;
        }

        if (config.radiusField && d[config.radiusField]) {
          tooltipContent += `<br/><em>Responses: ${d[
            config.radiusField
          ].toLocaleString()}</em>`;
        }

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      }
    })
    .on("mouseout", function (d) {
      if (tooltip) {
        tooltip.transition().duration(500).style("opacity", 0);
      }
    });

  if (
    config.colorField &&
    data.length > 0 &&
    data[0].hasOwnProperty(config.colorField)
  ) {
    g.selectAll(".chart-dot-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "chart-dot-label")
      .attr(
        "x",
        (d) =>
          x(d[config.xField]) +
          (radiusScale ? radiusScale(d[config.radiusField]) : config.radius) +
          5
      )
      .attr(
        "y",
        (d) =>
          y(d[config.yField]) -
          (radiusScale ? radiusScale(d[config.radiusField]) : config.radius) -
          2
      )
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#4c4f69")
      .style("text-anchor", "start")
      .style("pointer-events", "none") // Prevent interfering with dot interactions
      .style("opacity", 0.9) // Slightly transparent to reduce visual clutter
      .text((d) => d[config.colorField]);
  }

  // Axis labels
  if (config.xAxisLabel) {
    svg
      .append("text")
      .attr("transform", `translate(${config.width / 2}, ${config.height - 5})`)
      .style("text-anchor", "middle")
      .text(config.xAxisLabel);
  }

  if (config.yAxisLabel) {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - config.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(config.yAxisLabel);
  }

  return { svg, g, x, y, tooltip };
}

/**
 * Creates a stacked bar chart with customizable stack fields and colors
 * @param {string} containerId - CSS selector for the container element
 * @param {Array<Object>} data - Array of data objects to visualize
 * @param {Object} [options={}] - Configuration options for the chart
 * @param {number} [options.width=900] - Chart width in pixels
 * @param {number} [options.height=600] - Chart height in pixels
 * @param {Object} [options.margin] - Chart margins
 * @param {string} [options.xField="language"] - Property name for x-axis values
 * @param {Array<string>} [options.stackFields] - Array of property names to stack
 * @param {Array<string>} [options.stackLabels] - Labels for stack segments
 * @param {Array<string>} [options.colors] - Colors for each stack segment
 * @param {string} [options.xAxisLabel=""] - Label for x-axis
 * @param {string} [options.yAxisLabel=""] - Label for y-axis
 * @param {boolean} [options.rotateXLabels=true] - Whether to rotate x-axis labels
 * @param {boolean} [options.showLegend=true] - Whether to show legend
 * @param {boolean} [options.showPercentageLabels=false] - Whether to show percentage labels
 * @returns {Object} Object containing SVG elements, scales, and tooltip
 */
function createStackedBarChart(containerId, data, options = {}) {
  const defaults = {
    width: 900,
    height: 600,
    margin: { top: 40, right: 150, bottom: 120, left: 60 },
    xField: "language",
    stackFields: ["yes", "planning", "notPlanning"],
    stackLabels: ["Yes", "No, but I plan to", "No, and I don't plan to"],
    colors: ["#40a02b", "#fe640b", "#d20f39"],
    xAxisLabel: "",
    yAxisLabel: "",
    rotateXLabels: true,
    showLegend: true,
    showPercentageLabels: false,
  };

  const config = { ...defaults, ...options };

  d3.select(containerId).selectAll("*").remove(); // clear existing SVG content

  const svg = d3
    .select(containerId)
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height);

  const width = config.width - config.margin.left - config.margin.right;
  const height = config.height - config.margin.top - config.margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

  // Create stack generator
  const stack = d3.stack().keys(config.stackFields);
  const stackedData = stack(data);

  // Scales
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[config.xField]))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain(
      config.usePercentageScale
        ? [0, 100]
        : [0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])]
    )
    .range([height, 0]);

  const colorScale = d3.scaleOrdinal().range(config.colors);

  // X-axis
  const xAxis = g
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  if (config.rotateXLabels) {
    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  }

  // Y-axis
  g.append("g").call(d3.axisLeft(y));

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "rgba(239, 241, 245, 0.95)")
    .style("color", "#4c4f69")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Create stacked bars
  const layers = g
    .selectAll(".layer")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", (d, i) => colorScale(i))
    .each(function (d, i) {
      d.index = i;
    }); // Store the index for tooltip reference

  layers
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.data[config.xField]))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", function (event, d) {
      const stackIndex = d3.select(this.parentNode).datum().index;
      const stackLabel = config.stackLabels[stackIndex];
      const value = d[1] - d[0];
      let percentage;

      if (config.usePercentageScale) {
        percentage = value.toFixed(1);
      } else {
        percentage = ((value / d.data.total) * 100).toFixed(1);
      }

      let tooltipContent = `<strong>${d.data[config.xField]}</strong><br/>`;

      if (config.usePercentageScale) {
        const actualCount = stackLabel === "Yes" ? d.data.yes : d.data.no;
        tooltipContent += `${stackLabel}: ${percentage}% (${actualCount.toLocaleString()} developers)<br/>`;
        tooltipContent += `<em>Total developers: ${d.data.total.toLocaleString()}</em>`;
      } else {
        tooltipContent += `${stackLabel}: ${value.toLocaleString()} developers (${percentage}%)`;
      }

      // Add difference from average if available
      if (config.averagePercentages && config.stackFields) {
        const stackField = config.stackFields[stackIndex];
        const avgPercentage = config.averagePercentages[stackField];
        const difference = parseFloat(percentage) - avgPercentage;
        const sign = difference > 0 ? "+" : "";

        tooltipContent += `<br/><em>Overall average: ${avgPercentage.toFixed(
          1
        )}%</em>`;
        tooltipContent += `<br/><em>Difference: ${sign}${difference.toFixed(
          1
        )}%</em>`;
      }

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(tooltipContent)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  if (config.showPercentageLabels) {
    layers.each(function (layerData, layerIndex) {
      d3.select(this)
        .selectAll("text")
        .data(layerData)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.data[config.xField]) + x.bandwidth() / 2)
        .attr("y", (d) => {
          const segmentHeight = y(d[0]) - y(d[1]);
          return y(d[1]) + segmentHeight / 2;
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
        .style("pointer-events", "none")
        .text((d) => {
          const value = d[1] - d[0];
          let percentage;

          if (config.usePercentageScale) {
            percentage = value;
          } else {
            percentage = (value / d.data.total) * 100;
          }

          return percentage >= 5 ? `${percentage.toFixed(1)}%` : "";
        });
    });
  }

  if (config.showLegend) {
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${width + config.margin.left + 20}, ${config.margin.top})`
      );

    const legendItems = legend
      .selectAll(".legend-item")
      .data(config.stackLabels)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d, i) => config.colors[i]);

    legendItems
      .append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text((d) => d);
  }

  // Axis labels
  if (config.xAxisLabel) {
    svg
      .append("text")
      .attr("transform", `translate(${config.width / 2}, ${config.height - 5})`)
      .style("text-anchor", "middle")
      .text(config.xAxisLabel);
  }

  if (config.yAxisLabel) {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - config.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(config.yAxisLabel);
  }

  return { svg, g, x, y, tooltip };
}

export { createBarChart, createScatterPlot, createStackedBarChart };
