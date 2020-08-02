/* Global variables */
// All the websites as a graph
let itemGraph = createNewGraph();
// getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
let trackBrowsing = false; // true if tracking is active
const localServerURL = "http://127.0.0.1:5000/";
const deployedServerURL = "https://knolist.herokuapp.com/";

/* Functions */
// Function to verify if the server is being run locally
// Returns local url if running locally, deployed url if running on deployed version
async function getBaseServerURL() {
    return new Promise((resolve, reject) => {
        $.ajax(localServerURL, {
            complete: (jqXHR, textStatus) => {
                if (textStatus === "success") resolve(localServerURL);
                else resolve(deployedServerURL);
            }
        });
    });
}

const contextMenuItem = {
    "id": "highlight",
    "title": "Highlight with Knolist",
    "contexts": ["selection"]
};

chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(async function (clickData) {
    if (clickData.menuItemId === "highlight" && clickData.selectionText) {
        const baseServerURL = await getBaseServerURL();
        const contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(clickData.pageUrl);
        $.getJSON(contentExtractionURL, (item) => {
            addHighlightsToItemInGraph(item, clickData.selectionText);
        });
    }
});

chrome.runtime.onMessage.addListener(async function (message, _sender, _sendResponse) {
    if (message.url !== undefined && trackBrowsing) {
        // Add to project if tracking is active
        const baseServerURL = await getBaseServerURL();
        const contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(message.url);
        $.getJSON(contentExtractionURL, (item) => {
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
            getBaseServerURL().then(baseServerURL => {
                const similarity_API_URL = baseServerURL + "bertSimilarity?question=" + encodeURIComponent(message.selectedText) + "&text=" + encodeURIComponent(content);
                $.getJSON(similarity_API_URL, (result) => {
                    console.log(JSON.stringify(result))
                });
            });
        });
    } else if (message.command === "get_tracking") {
        _sendResponse({trackBrowsing: trackBrowsing});
    }
});
