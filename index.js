const form = document.querySelector("#stock-form");
const stockName = document.querySelector('[name="name"]');
const startDate = document.querySelector('[name="start-date"]');
const endDate = document.querySelector('[name="end-date"]');
const switcher = document.querySelector("#choose-mode");
const body = document.querySelector("body");
const loadingSpinner = document.getElementById("loadingSpinner");

function showLoadingSpinner() {
  loadingSpinner.style.display = "block";
}

function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}


function createTooltip(svg,data,tooltip,xScale,yScale,item) {
    dict = {'h': 'Highest', 'o': 'Opening', 'c': 'Closing'}
    svg.selectAll()
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => xScale(new Date(d.t)))
    .attr("cy", d => yScale(d[item]))
    .attr("r", 8)
    .attr('fill-opacity', 0)
    .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.transition().duration(200).style("opacity", 0.9).style('color', 'brown');
        tooltip.html(`Date: ${new Date(d.t).toLocaleDateString()}<br>Value: ${d[item]}<br>Type: ${dict[item]}`)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 20) + "px");
    
        // Make circle visible when hovered over
        d3.select(this).attr("fill", "steelblue").attr('fill-opacity', 1);
    })
    .on("mousemove", function(event) {
        // Update tooltip position to follow the mouse
        tooltip.style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
        // Hide tooltip
        tooltip.transition().duration(400).style("opacity", 0);
    
        // Reset circle appearance
        d3.select(this).transition().duration(100).attr("fill-opacity", 0);
    });
}

function processData(data) {
    // Function to process data and create a visualization of it.
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
        .domain([Math.min(d3.min(data, d => d.c), d3.min(data, d => d.o)), d3.max(data, d => d.h)])
        .range([height, 0]);

    // Create line generator
    const line = d3.line()
        .x(d => xScale(new Date(d.t)))
        .y(d => yScale(d.c));

    const line2 = d3.line()
        .x(d => xScale(new Date(d.t)))
        .y(d => yScale(d.h));
    
    const line3 = d3.line()
        .x(d => xScale(new Date(d.t)))
        .y(d => yScale(d.o));

 
        
    // Append the line path
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line); // Use the line generator
    
    svg.append("path")
        .datum(data)
        .attr("class", "line line2")
        .attr("d", line2);

    svg.append("path")
        .datum(data)
        .attr("class", "line line3")
        .attr("d", line3);

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

    createTooltip(svg,data,tooltip,xScale,yScale,'c')
    createTooltip(svg,data,tooltip,xScale,yScale,'o')
    createTooltip(svg,data,tooltip,xScale,yScale,'h')
    
    
}

function getStockData(stock_name, start_date, end_date) {
    // Function to scrape the data
    console.log(startDate.value, endDate.value);
    const headers = {
        "User-Agent": "MyAPI 0.0.1",
        "Authorization": "Bearer qgqm4upxttwKpNp2fZrq1j3dgHu7zJMn"
    };
    
    return new Promise((resolve, reject) => {
        fetch(`https://api.polygon.io/v2/aggs/ticker/${stock_name.value}/range/1/day/${start_date.value}/${end_date.value}?adjusted=true&sort=asc`, {
            headers: headers,
        })
        .then(response => response.json())
        .then(data => {
            processData(data.results);
            resolve(); // Resolve the Promise after data processing so that the rest can run
        })
        .catch(error => reject(error));
    });
    
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const svgElement = document.getElementById("stockChart");
    svgElement.innerHTML = ""
    showLoadingSpinner();
    getStockData(stockName,startDate, endDate)
    .then(() => {
        d3.select('.legend').style('display', 'block')
        hideLoadingSpinner(); // Hide loading spinner when data processing is complete
        const svgPosition = svgElement.getBoundingClientRect().top;
  
        // Scroll the page to the SVG element
        window.scrollTo({
          top: svgPosition,
          behavior: "smooth"
        });
      });
});

switcher.addEventListener("click", () => {
  body.classList.toggle("light");
});

const stockCards = document.querySelectorAll('.stock-card');
const stockInput = document.querySelector('[name="name"]');

// Function to set default dates if not already set
function setDefaultDates() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const startDateInput = document.querySelector('[name="start-date"]');
    const endDateInput = document.querySelector('[name="end-date"]');
    
    if (!startDateInput.value) {
        startDateInput.value = oneYearAgo.toISOString().split('T')[0];
    }
    if (!endDateInput.value) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

// Add click event listeners to stock cards
stockCards.forEach(card => {
    card.addEventListener('click', () => {
        const symbol = card.dataset.symbol;
        stockInput.value = symbol;
        setDefaultDates();
        
        // Add a subtle highlight effect
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'translateY(-2px)';
        }, 150);
    });
});

// Call setDefaultDates when the page loads
document.addEventListener('DOMContentLoaded', setDefaultDates);
