

plotModule2.init();

formModule.updateYVars();

// Add events
events.on("update", function() {
  dataModule.update();
});
events.on("update", function() {
  console.log("Plot up to date!");
});
