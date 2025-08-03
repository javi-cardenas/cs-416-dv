function createBarChart(containerId, data, options = {}) {
  const defaults = {
    width: 800,
    height: 600,
    margin: { top: 20, right: 30, bottom: 100, left: 50 },
    xField: "x",
    yField: "y",
    color: "steelblue",
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

  // Bars
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
    );

  // Add percentage labels on bars (if percentage field exists in data)
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
      .style("fill", "#cdd6f4") // Catppuccin text
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
    color: "steelblue",
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
    colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(colorDomain);
  }

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y-axis
  g.append("g").call(d3.axisLeft(y));

  // Tooltip
  let tooltip = null;
  if (config.showTooltip) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  // Circles
  g.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
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
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `${config.xField}: ${d[config.xField]}<br/>${config.yField}: ${
              d[config.yField]
            }`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      }
    })
    .on("mouseout", function (d) {
      if (tooltip) {
        tooltip.transition().duration(500).style("opacity", 0);
      }
    });

  // Add text labels for programming languages (if colorField exists in data)
  if (
    config.colorField &&
    data.length > 0 &&
    data[0].hasOwnProperty(config.colorField)
  ) {
    g.selectAll(".dot-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "dot-label")
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
      .style("font-size", "10px") // Slightly smaller to fit more labels
      .style("font-weight", "500")
      .style("fill", "#cdd6f4") // Catppuccin text
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

// World map function removed - no longer needed

function createStackedBarChart(containerId, data, options = {}) {
  const defaults = {
    width: 900,
    height: 600,
    margin: { top: 40, right: 150, bottom: 120, left: 60 },
    xField: "language",
    stackFields: ["yes", "planning", "notPlanning"],
    stackLabels: ["Yes", "No, but I plan to", "No, and I don't plan to"],
    colors: ["#a6e3a1", "#fab387", "#f38ba8"], // Catppuccin green, peach, red
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
    .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
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
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
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
      const percentage = ((value / d.data.total) * 100).toFixed(1);

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<strong>${d.data[config.xField]}</strong><br/>
           ${stackLabel}: ${value.toLocaleString()} developers (${percentage}%)`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add legend if enabled
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
