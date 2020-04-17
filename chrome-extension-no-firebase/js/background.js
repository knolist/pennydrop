// All the websites as a graph
itemGraph = createNewGraph();
getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
trackBrowsing = false;

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if (message.url != undefined && trackBrowsing) {
    contentExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(message.url);
    $.getJSON(contentExtractionURL, (item) => {
      updateItemInGraph(item, message.prevURL, itemGraph);
      saveGraphToDisk(itemGraph)
    });
  }
  else if (message.command == "reset") {
    resetCurProjectInGraph(itemGraph);
    saveGraphToDisk(itemGraph);
  }
  else if (message.command == "start" && message.project != undefined) {
    trackBrowsing = true;
    setCurrentProjectInGraph(itemGraph, message.project);
    saveGraphToDisk(itemGraph);
  }
  else if (message.command == "stop") {
    trackBrowsing = false;
  }
  else if (message.command == "find_similar_msg") {
    contents = getContentFromGraph(itemGraph, message.currentURL)
    console.log("Starting search to answer question: " + message.selectedText)
    contents.forEach(content => {
      simarity_API_URL = "http://127.0.0.1:5000/bertSimilarity?question=" + encodeURIComponent(message.selectedText) + "&text=" + encodeURIComponent(content);
      $.getJSON(simarity_API_URL, (result) => {
        console.log(JSON.stringify(result))
      });
    });
  }
});
