// All the websites as a graph
itemGraph = createNewGraph();
getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
trackBrowsing = false;

const contextMenuItem = {
  "id": "highlight",
  "title": "Highlight with Knolist",
  "contexts": ["selection"]
};

chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(function(clickData) {
  if (clickData.menuItemId === "highlight" && clickData.selectionText) {
    if (trackBrowsing) {
      contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(clickData.pageUrl);
      $.getJSON(contextExtractionURL, (item) => {
        addHighlightsToItemInGraph(item, clickData.selectionText, itemGraph);
        saveGraphToDisk(itemGraph);
      });
    } else {
      alert("Please activate browser tracking to add highlights.")
    }
  }
});

chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
  if (message.url !== undefined && trackBrowsing) {
    contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(message.url);
    $.getJSON(contextExtractionURL, (item) => {
      updateItemInGraph(item, message.prevURL, itemGraph);
      saveGraphToDisk(itemGraph);
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
  else if (message.command === "get_tracking") {
    _sendResponse({trackBrowsing: trackBrowsing});
  }
});
