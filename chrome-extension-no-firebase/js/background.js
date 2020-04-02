// All the websites as a graph
itemGraph = createNewGraph();
getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if (message.url != undefined) {
    contextExtractionURL = "http://boilerpipe-web.appspot.com/extract?output=json&url=" + encodeURIComponent(message.url);
    $.get(contextExtractionURL, (data) => {
        if (data["status"] == "success") {
          updateItemInGraph(data["response"], message.prevURL, itemGraph);
          saveGraphToDisk(itemGraph)
        }
        else {
          alert(JSON.stringify(data["error"]))
        }
    });
  }
  else if (message.command == "reset") {
    resetCurProjectInGraph(itemGraph);
    saveGraphToDisk(itemGraph);
  }
});
