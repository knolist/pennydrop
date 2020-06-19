/* A collection of functions to manipulate the graph
For these functions, make sure to pull the graph from disk (let graph = await getGraphFromDisk();)
and save it back after manipulation (in case any manipulation was done: saveGraphToDisk(graphData);)
Functions must be async to use the await keyword and ensure sequential execution (i.e., waiting for the graph
to be pulled from Chrome before attempting to access it)
 */

const CUR_VERSION_NUM = 1;

/**
 * Creates graph with default project.
 * @returns {{default: {}, curProject: string, version: *}} the graph with an empty default project
 */
createNewGraph = () => {
    return {
        "default": {},
        "curProject": "default",
        "version": CUR_VERSION_NUM
    };
};

/**
 * Gets all the content from each node in the current project.
 * @param exceptURL a URL to be excluded from the extraction
 * @returns {[]|Array} an array with all the contents
 */
getContentFromGraph = async (exceptURL) => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    graph = graph[project];
    let output = [];
    for (let item in graph) {
        if (item !== exceptURL) {
            output.push(graph[item]["content"]);
        }
    }
    return output
};

/**
 * Removes an item from the current project.
 * @param item the item to be removed
 */
removeItemFromGraph = async (item) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];

    // Remove forward and backward edges
    graph[item]["prevURLs"].forEach(prev => {
        graph[prev]["nextURLs"] = graph[prev]["nextURLs"].filter(url => url !== item)
    });
    graph[item]["nextURLs"].forEach(next => {
        graph[next]["prevURLs"] = graph[next]["prevURLs"].filter(url => url !== item)
    });

    // Delete the item now
    delete graph[item];

    // Save to disk
    saveGraphToDisk(graphData);
};

/**
 * Main function used to add items to the graph (inside current project).
 * It can also be used for a simple update in edges.
 * @param item the idem to be added/updated
 * @param previousURL the URL of this node's parent in the graph
 */
updateItemInGraph = async (item, previousURL) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];
    // Create item if it doesn't exist
    if (graph[item["source"]] === undefined) {
        graph[item["source"]] = item;
        graph[item["source"]]["prevURLs"] = [];
        graph[item["source"]]["nextURLs"] = [];
        graph[item["source"]]["highlights"] = [];
        // Initialize with null positions (will be updated on render of the network
        graph[item["source"]]["x"] = null;
        graph[item["source"]]["y"] = null;
    }
    // Add edge to graph
    if (previousURL !== "" && graph[previousURL] !== undefined) {
        graph[item["source"]]["prevURLs"].push(previousURL);
        graph[previousURL]["nextURLs"].push(item["source"]);
    }

    // Save to disk
    saveGraphToDisk(graphData);
};

/**
 * Updates the position of node with a specific url in the current project
 * @param url the url of the node whose position will be updated
 * @param x the x position
 * @param y the y position
 */
updatePositionOfNode = async (url, x, y) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];
    graph[url]["x"] = x;
    graph[url]["y"] = y;

    // Save to disk
    saveGraphToDisk(graphData);
};

/**
 * Adds an array of highlights to an item in the current project.
 * @param item the item to receive the highlights
 * @param highlights an array of text highlights to be added
 */
addHighlightsToItemInGraph = async (item, highlights) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];
    // Create item if it doesn't exist
    if (graph[item["source"]] === undefined) {
        graph[item["source"]] = item;
        graph[item["source"]]["prevURLs"] = [];
        graph[item["source"]]["nextURLs"] = [];
        graph[item["source"]]["highlights"] = [];
    }
    graph[item["source"]]["highlights"].push(highlights);

    // Save to disk
    saveGraphToDisk(graphData);
};

/**
 * Deletes all items in the current project.
 */
resetCurProjectInGraph = async () => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    graph[project] = {};

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Deletes a project.
 * @param projectName the name of the project to be deleted
 */
deleteProjectFromGraph = async (projectName) => {
    let graph = await getGraphFromDisk();
    delete graph[projectName];

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Creates new project and sets current project to this new project.
 * @param projectName
 */
createNewProjectInGraph = async (projectName) => {
    let graph = await getGraphFromDisk();
    graph[projectName] = {};
    graph["curProject"] = projectName;

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Set the current project.
 * @param projectName name of the project to be set
 */
setCurrentProjectInGraph = async (projectName) => {
    let graph = await getGraphFromDisk();
    graph["curProject"] = projectName;

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Returns the list of children of a given node in the current project.
 * @param url the url of the node
 * @returns {*} array of the children's URLs
 */
getNextURLsFromURL = async (url) => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    return graph[project][url]["nextURLs"];
};

/**
 * Returns the list of parents of a given node in the current project.
 * @param url the url of the node
 * @returns {*} array of the parents' URLs
 */
getPrevURLsFromURL = async (url) => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    return graph[project][url]["prevURLs"];
};

/**
 * Returns the list of highlights of a given node in the current project.
 * @param url the url of the node
 * @returns {*} array of the highlights
 */
getHighlightsFromURL = async (url) => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    return graph[project][url]["highlights"];
};

/**
 * Returns a list of all titles of nodes in the current project.
 * @returns {[]|Array} the array of titles
 */
getTitlesFromGraph = async () => {
    let graph = await getGraphFromDisk();
    const project = graph["curProject"];
    graph = graph[project];
    let output = [];
    for (let url in graph) {
        output.push({
            url: url,
            title: graph[url]["title"]
        });
    }
    return output;
};

/**
 * Stores the graph using the Chrome storage API.
 * @param graph the graph to be stored
 */
saveGraphToDisk = (graph) => {
    console.log(graph);
    chrome.storage.local.set({'itemGraph': graph});
};

// /**
//  * This method updates the passed in graph variable in place.
//  * @param graph the graph to be updated
//  */
// getGraphFromDisk = async (graph) => {
//     chrome.storage.local.get('itemGraph', function (result) {
//         result = result.itemGraph;
//         if (result.version === CUR_VERSION_NUM) {
//             Object.keys(graph).forEach(k => delete graph[k]);
//             Object.keys(result).forEach(k => graph[k] = result[k]);
//             console.log(graph)
//         } else {
//             console.log("Either the graph doesnt exist in storage or it's not version " + CUR_VERSION_NUM)
//         }
//     });
// };

getGraphFromDisk = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('itemGraph', function(result) {
            resolve(result.itemGraph);
        });
    })
};

/**
 * This method updates the passed in graph variable in place but works with React.
 * @param graph the graph to be updated
 * @param reactComponent the React component that gas a "graph" state variable to be updated
 */
getGraphFromDiskToReact = (graph, reactComponent) => {
    chrome.storage.local.get('itemGraph', function (result) {
        result = result.itemGraph;
        if (result.version === CUR_VERSION_NUM) {
            Object.keys(graph).forEach(k => delete graph[k]);
            Object.keys(result).forEach(k => graph[k] = result[k]);
            console.log(graph);
            reactComponent.setState({graph: graph});
            reactComponent.setupVisGraph();
        } else {
            console.log("Either the graph doesnt exist in storage or it's not version " + CUR_VERSION_NUM)
        }
    });
};
