

plotModule.create();

var header = ["koppel", "stroom"];
var labels = ["Torque", "Current"];

formModule.updateYVars(labels, header);

// Add events
events.on("update", function() {
  formModule.updateFileList(dataModule.fileNames);
  dataModule.update();
  console.log("Plot up to date!");
});
