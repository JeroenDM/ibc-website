var plotModule2 = (function() {
	const width = 700;
	const height = 300;
	const margin = 40;
	
	var svg = d3.select("#chart")
				.attr("width", width + 2*margin)
				.attr("height", height + 2*margin)
				.append("g")
				.attr("transform", "translate(" + margin + "," + margin + ")");
				//.append("path")
				//.attr("class", "line");
	
	var xScale = d3.scale.linear().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);
	
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
	
	var line = d3.svg.line()
		.x(function(d) { return xScale(+d.x); })
		.y(function(d) { return yScale(+d.y); })
		.interpolate("basis");
	
	function init() {
		var data = [{x: 0, y: 0},
					{x: 1, y: 1}];
		
		_updataScaleDomain(data);
		
		svg.append("path")
			.attr("class", "line")
			.attr("d", line(data));
			
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	}
	
	function update(data) {
		_updataScaleDomain(data);
		
		// add transition to the update
		//var t = svg.transition().duration(750); // TO SLOW!!
		var t = svg;
		
		t.select(".x.axis")
			.call(xAxis);

		t.select(".y.axis")
			.call(yAxis);
		
		t.select("path")
			.attr("d", line(data));
	}
	
	function _updataScaleDomain(data) {
		xScale.domain( d3.extent(data, function(d) {return +d.x;}) );
		yScale.domain( d3.extent(data, function(d) {return +d.y;}) );
	}
	
	return {
		init: init,
		update: update
	}
	
})();

/* var plotModule = (function () {

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
})(); */

var dataModule = (function() {
	// initialize data acces
	var path = "/data/";
	var fileNames = [];
	
	
	fileNames = _readFileNames();
	
	var varNames = ["snelheid", "koppel", "kadans", "stroom", "spanning"];
	var xVar = "tijd";
	var yVar = "koppel";

	// Private functions
	function _selectXYAndPlot(data) {
		var plotData = [];

		for (i=0; i<data.length; i++) {
		  plotData.push({
			  x: data[i][xVar],
			  y: data[i][yVar]
		  });
		};
		plotModule2.update(plotData);
	}

	function _readFileNames() {
		// create dummy html for responsetext
		var dummy = document.createElement( 'html' );
		
		// create event function for request
		function reqListener () {
			dummy.innerHTML = this.responseText;
			var list = dummy.getElementsByTagName("a");
			fileNames = [];
			for(i=0; i<list.length;i++){
				var name = list[i].innerHTML.trim();
				if (name.slice(-3) == "txt") {
					fileNames.push(name);
				}
			}
			formModule.updateFileList();
		}

		// execute request
		var oReq = new XMLHttpRequest();
		oReq.addEventListener('load', reqListener);
		oReq.open("get", "/data", true);
		oReq.send();
	}
  
	// Public functions
	function getFileNames() {
		return fileNames;
	}
	
	function update() {
		// Update yVar
		yVar = formModule.getCheckedYVar();
		
		// updata plot data
		var name = document.getElementById("fileSelection").value;
		if (name == "") {
			alert("Please select an input file.");
		} else {
			d3.tsv(path + name, _selectXYAndPlot);
		}
	}
	
	function updateYVar(name) {
		yVar = name;
	}
	
	function getVarNames() {
		return varNames;
	}

	return {
	update: update,
	getFileNames: getFileNames,
	updateYVar: updateYVar,
	getVarNames: getVarNames
	}
})();

var formModule = (function() {

	var header = ["koppel", "stroom"];
	var labels = ["Torque", "Current"];
	var $div = d3.select("#yVarSelection");
	var $select = d3.select("#fileSelection");

	// Public functions
	function updateFileList() {
		var fileNames = dataModule.getFileNames();
		$select.selectAll("option")
				.data(fileNames)
				.enter()
				.append("option")
				.attr("value", function(d) {return d;})
				.text(function(d) {return d;});
/* 		var $select = d3.select("#fileSelection");
		for (i=0; i < fileNames.length; i++) {
			$select.append("option")
				  .attr("value", fileNames[i])
				  .text(fileNames[i]);
		} */
	}
	
	function getCheckedYVar() {
		return d3.select('input[name="yVarSelection"]:checked').property("value");
	}
	
	// some realy ugly dom handling
	function updateYVars() {
		var varNames = dataModule.getVarNames();
		var defaultChecked = "snelheid";
		$div.selectAll("label")
			.data(varNames)
			.enter()
			.append("div").attr("class", "radio")
			.append("label")
			.text(function(d) {return d;})
			.insert("input")
			.attr("type", "radio")
			.attr("name", "yVarSelection")
			.attr("value", function(d) {return d;})
			.attr("onchange", "events.emit('update')")
			.property("checked", function(d) {return d===defaultChecked;});
	}

  return {
    updateYVars: updateYVars,
    updateFileList: updateFileList,
	getCheckedYVar: getCheckedYVar
  }
})();
