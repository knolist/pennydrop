// All the websites as a graph
itemGraph = createNewGraph();
getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
trackBrowsing = false; //default to not tracking


setTimeout(function(){
  $("#json").html(JSON.stringify(itemGraph, undefined, 2));
}, 1000);
