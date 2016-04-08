var plotModule = (function () {

  // Setup plot window
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  var line = d3.svg.line()
    .x(function(d) { return x(d.tijd); })
    .y(function(d) { return y(d.snelheid); })
    .interpolate("basis");

  var svg = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // Public functions
  function createPlot() {
    // initial data on plot
    var data = [{tijd: 0, snelheid: 0}];

    x.domain(d3.extent(data, function(d) { return +d.tijd; }));
    y.domain(d3.extent(data, function(d) { return +d.snelheid; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em");
        //.style("text-anchor", "end")
        //.text("Snelheid (km/u)");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
  }

  function updatePlot(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return +d.tijd; }));
    y.domain(d3.extent(data, function(d) { return +d.snelheid; }));

    // update data of .line tag
    svg.select(".line").datum(data);

    // add transition to the update
    var t = svg.transition().duration(750);
    t.select(".x.axis")
        .call(xAxis);

    t.select(".y.axis")
        .call(yAxis);

    t.select(".line")
        .attr("d", line);
  }

  // Reveal public vars and funcs
  return {
    create: createPlot,
    update: updatePlot
  }
})();

var dataModule = (function() {
  // initialize data acces
  var path = "/data/";
  var fileNames = ["test1.txt", "test2.txt"];

  d3.tsv(path + fileNames[0], plotModule.update);

  function updatePlot() {
      var name = document.getElementById("fileSelection").value;
      d3.tsv(path + name, plotModule.update);
  }

  function getFileNames() {
    return fileNames;
  }

  return {
    update: updatePlot,
    getFileNames: getFileNames
  }
})();

var formModule = (function() {

  // Init file selection menu
  var fileNames = dataModule.getFileNames();

  var $select = d3.select("#fileSelection");
  for (i=0; i < fileNames.length; i++) {
    $select.append("option")
            .attr("value", fileNames[i])
            .text(fileNames[i]);
  }

  var header = ["koppel", "stroom"];
  var labels = ["Torque", "Current"];
  var $div = d3.select("#yVarSelection");

  // some realy ugly dom handling
  function updateYVars() {
    for (i=0; i<labels.length; i++) {
      var $label = $div.append("div")
                    .attr("class", "radio")
                    .append("label")
      $label.append("input")
            .attr("type", "radio")
            .attr("name", "yVarSelection")
            .attr("value", header[i])
      $label.append("p").text(labels[i]);
    }

  }

  return {
    updateYVars: updateYVars
  }
})();
