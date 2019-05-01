'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  var circles ;
  let selectedValue = '';
  // load data and make scatter plot after window loads

  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Countries by Life Expectancy and Fertility Rate");

    svgContainer.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Fertility Rates (Avg Children per Woman)');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy (years)');
    

    d3.csv("./data/dataEveryYear.csv")
      .then((data) => makeScatterPlot(data));



    }


  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));
    let timeData = data.map((row) => parseFloat(row['time']))

    var lowestTime = Math.min.apply(Math, timeData);
    var highestTime = Math.max.apply(Math, timeData);
 
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy");

    var dropDown = d3.select("#filter").append("select")
    .attr("name", "year-list");

    var rangeTime = [];
    for(let i = lowestTime; i <= highestTime; i++){
      rangeTime.push(i);
    }

    
    var options = dropDown.selectAll("option")
      .data(rangeTime) //rangeTime
      .enter()
      .append("option");
    options.text(function (d) { return d; }) //remove Loc
      .attr("value", function (d) { return d; });



    dropDown.on("change", function() {
      var selected = this.value;
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";
      console.log(selected);
  
      circles
        .filter(function(d) {return selected != d.time;})
        .attr("display", displayOthers);
            
      circles
        .filter(function(d) {return selected == d.time;})
        .attr("display", display);
    });
    plotData(mapFunctions)



 
  }

  function plotData(mapFunctions) {
    // var map = mapFunctions
    // var tempData = [];
    // var length = data.length;
    // for(let i = 0; i < length; i++){
    //   if(data[i].time == year){
    //     tempData.push(data[i]);
    //   }
    // }

    // data = tempData;

    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = mapFunctions.x;
    let yMap = mapFunctions.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // append data to SVG and plot as points
    circles = svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', (d) => pop_map_func(d["pop_mlns"]))
        .attr('fill', "#4286f4")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d.location + "<br/>" + "Life Expectancy: "+ d["life_expectancy"] + "<br/>" + "Fertility Rate" + d["fertility_rate"] +  "<br/>" + "Population" + numberWithCommas(d["pop_mlns"]*1000000) + "<br/>" + "Year:" + d["time"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    let xValue = function(d) { return +d[x]; }

    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 450]);

    let xMap = function(d) { return xScale(xValue(d)); };
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    let yValue = function(d) { return +d[y]}
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    let yMap = function (d) { return yScale(yValue(d)); };
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);
    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }
  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
