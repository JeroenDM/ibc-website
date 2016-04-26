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
	};
})();

var dataModule = (function() {
	// initialize data acces
	var path = "/data/";
	var fileNames = [];
	var currentData;
	
	
	fileNames = _readFileNames();
	
	var varNames = ["snelheid", "koppel", "kadans", "stroom", "spanning"];
	var xVar = "tijd";
	var yVar = "koppel";

	// Private functions
	function _selectXYAndPlot(data) {
		var plotData = [];

		for (var i=0; i<data.length; i++) {
		  plotData.push({
			  x: data[i][xVar],
			  y: data[i][yVar]
		  });
		}
		plotModule2.update(plotData);
	}
	
	function _processData(data) {
		currentData = data;
		_selectXYAndPlot(data);
	}

	function _readFileNames() {
		// create dummy html for responsetext
		var dummy = document.createElement( 'html' );
		
		// create event function for request
		function reqListener () {
			dummy.innerHTML = this.responseText;
			var list = dummy.getElementsByTagName("a");
			fileNames = [];
			for(var i=0; i<list.length;i++){
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
		if (name === "") {
			alert("Please select an input file.");
		} else {
			d3.tsv(path + name, _processData);
		}
	}
	
	function updateYVar(name) {
		yVar = name;
	}
	
	function getVarNames() {
		return varNames;
	}
	
	function getCurrentData() {
		return currentData;
	}

	return {
	update: update,
	getFileNames: getFileNames,
	updateYVar: updateYVar,
	getVarNames: getVarNames,
	getCurrentData: getCurrentData
	};
})();

var formModule = (function() {
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
		for (var var i=0; i < fileNames.length; i++) {
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
  };
})();

summaryModule = (function() {
	
	function update() {
		var result = _calculateSummary();
		
		document.getElementById("averageSpeed").innerHTML = result.averageSpeed + " km/h";
		document.getElementById("averageCadence").innerHTML = result.averageCadence + " rpm";
		console.log("summary updated");
	}
	
	function _calculateSummary() {
		var result = {
			averageSpeed: 0,
			averageCadence: 0
		};
		
		var data = dataModule.getCurrentData();
		if (!data) console.log("summaryModule: No data in data" + data.length);
		var len = data.length;
		
		var tempSpeed = 0;
		var tempCadence = 0;
		for (var i=0; i<len;i++) {
			tempSpeed += +data[i].snelheid;
			tempCadence += +data[i].kadans;
		}
		
		result.averageSpeed = tempSpeed / len;
		result.averageCadence = tempCadence / len;
		
		return result;
	}
	
	return {
		update: update
	};
})();