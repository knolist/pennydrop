// All the websites as a graph
itemGraph = createNewGraph();
getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
trackBrowsing = false;

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if (message.url !== undefined && trackBrowsing) {
    contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(message.url);
    $.getJSON(contextExtractionURL, (item) => {
      updateItemInGraph(item, message.prevURL, itemGraph);
      saveGraphToDisk(itemGraph)
    });
  }
  else if (message.command === "reset") {
    resetCurProjectInGraph(itemGraph);
    saveGraphToDisk(itemGraph);
  }
  else if (message.command === "start" && message.project !== undefined) {
    chrome.browserAction.setIcon({path: "../images/icon128_active.png"});
    trackBrowsing = true;
    setCurrentProjectInGraph(itemGraph, message.project);
    saveGraphToDisk(itemGraph);
  }
  else if (message.command === "stop") {
    chrome.browserAction.setIcon({path: "../images/icon128.png"});
    trackBrowsing = false;
  }
  else if (message.command === "get_tracking") {
    _sendResponse({trackBrowsing: trackBrowsing});
  }
});
