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
    .attr("fill", config.color);

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

export { createBarChart, createScatterPlot };
