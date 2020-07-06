// All the websites as a graph
let itemGraph = createNewGraph();
// getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
let trackBrowsing = false;

const contextMenuItem = {
    "id": "highlight",
    "title": "Highlight with Knolist",
    "contexts": ["selection"]
};

chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId === "highlight" && clickData.selectionText) {
        const contextExtractionURL = "https://knolist.herokuapp.com/extract?url=" + encodeURIComponent(clickData.pageUrl);
        $.getJSON(contextExtractionURL, (item) => {
            addHighlightsToItemInGraph(item, clickData.selectionText);
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, _sender, _sendResponse) {
    if (message.url !== undefined && trackBrowsing) {
        const contextExtractionURL = "https://knolist.herokuapp.com/extract?url=" + encodeURIComponent(message.url);
        $.getJSON(contextExtractionURL, (item) => {
            addItemToGraph(item, message.prevURL);
        });
    } else if (message.command === "reset") {
        resetCurProjectInGraph();
    } else if (message.command === "start-tracking") {
        chrome.browserAction.setIcon({path: "../images/icon128_active.png"});
        trackBrowsing = true;
    } else if (message.command === "stop-tracking") {
        chrome.browserAction.setIcon({path: "../images/icon128.png"});
        trackBrowsing = false;
    } else if (message.command === "find_similar_msg") {
        const contents = getContentFromGraph(message.currentURL);
        console.log("Starting search to answer question: " + message.selectedText);
        contents.forEach(content => {
            const similarity_API_URL = "https://knolist.herokuapp.com/bertSimilarity?question=" + encodeURIComponent(message.selectedText) + "&text=" + encodeURIComponent(content);
            $.getJSON(similarity_API_URL, (result) => {
                console.log(JSON.stringify(result))
            });
        });
    } else if (message.command === "get_tracking") {
        _sendResponse({trackBrowsing: trackBrowsing});
    }
});
