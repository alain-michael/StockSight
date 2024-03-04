const form = document.querySelector("#stock-form");
const stockName = document.querySelector('[name="name"]');
const startDate = document.querySelector('[name="start-date"]');
const endDate = document.querySelector('[name="end-date"]');
const switcher = document.querySelector("#choose-mode");
const body = document.querySelector("body");

function processData(data) {
    // Set up SVG dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create an SVG container
    const svg = d3.select("#stockChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.t)))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.c), d3.max(data, d => d.c)])
        .range([height, 0]);

    // Create line generator
    const line = d3.line()
        .x(d => xScale(new Date(d.t)))
        .y(d => yScale(d.c));

    // Append the line path
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line); // Use the line generator

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add tooltips
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => xScale(new Date(d.t)))
    .attr("cy", d => yScale(d.c))
    .attr("r", 8)
    .attr('fill-opacity', 0)
    .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition().duration(200).style("opacity", 0.9).style('color', 'brown');
        tooltip.html(`Date: ${new Date(d.t).toLocaleDateString()}<br>Value: ${d.c}`)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 20) + "px");
    
        // Make circle visible when hovered
        d3.select(this).attr("fill", "steelblue").attr('fill-opacity', 1);
    })
    .on("mousemove", function(event) {
        // Update tooltip position
        tooltip.style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition().duration(100).style("opacity", 0);
    
        // Reset circle appearance
        d3.select(this).attr("fill-opacity", 0);
    });
    
    
}

function getStockData(stock_name, start_date, end_date) {
    console.log(startDate.value, endDate.value)
    headers = {"User-Agent": "MyAPI 0.0.1", "Authorization": "Bearer qgqm4upxttwKpNp2fZrq1j3dgHu7zJMn"}
    fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2024-01-14?adjusted=true&sort=asc`, {
        headers: headers,
    }).then(response => response.json())
    .then(data => processData(data.results))
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    getStockData(stockName,startDate, endDate)
});

switcher.addEventListener("click", () => {
  body.classList.toggle("light");
});
