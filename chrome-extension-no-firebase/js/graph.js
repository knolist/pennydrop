// A collection of functions to manipulate the graph

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
 * @param graph the graph from which we're extracting content
 * @param exceptURL a URL to be excluded from the extraction
 * @returns {[]|Array} an array with all the contents
 */
getContentFromGraph = async (graph, exceptURL) => {
    await getGraphFromDisk(graph);
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
 * @param graphData the graph from which the item will be removed
 */
removeItemFromGraph = async (item, graphData) => {
    await getGraphFromDisk(graphData);
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
 * @param graphData the graph where the item will be added
 */
updateItemInGraph = async (item, previousURL, graphData) => {
    await getGraphFromDisk(graphData);
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
 * @param graphData the graph object that holds url. We will use the graph's current project
 * @param url the url of the node whose position will be updated
 * @param x the x position
 * @param y the y position
 */
updatePositionOfNode = async (graphData, url, x, y) => {
    await getGraphFromDisk(graphData);
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
 * @param graphData the graph where item is located
 */
addHighlightsToItemInGraph = async (item, highlights, graphData) => {
    await getGraphFromDisk(graphData);
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
 * @param graph the graph that holds the current project
 */
resetCurProjectInGraph = async (graph) => {
    await getGraphFromDisk(graph);
    const project = graph["curProject"];
    graph[project] = {};

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Deletes a project.
 * @param graph the graph to have a project deleted
 * @param projectName the name of the project to be deleted
 */
deleteProjectFromGraph = async (graph, projectName) => {
    await getGraphFromDisk(graph);
    delete graph[projectName];

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Creates new project and sets current project to this new project.
 * @param graph
 * @param projectName
 */
createNewProjectInGraph = async (graph, projectName) => {
    await getGraphFromDisk(graph);
    graph[projectName] = {};
    graph["curProject"] = projectName;

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Set the current project.
 * @param graph the graph to have its current project set
 * @param projectName name of the project to be set
 */
setCurrentProjectInGraph = async (graph, projectName) => {
    await getGraphFromDisk(graph);
    graph["curProject"] = projectName;

    // Save to disk
    saveGraphToDisk(graph);
};

/**
 * Returns the list of children of a given node in the current project.
 * @param graph the graph in question
 * @param url the url of the node
 * @returns {*} array of the children's URLs
 */
getNextURLsFromURL = async (graph, url) => {
    await getGraphFromDisk(graph);
    const project = graph["curProject"];
    return graph[project][url]["nextURLs"];
};

/**
 * Returns the list of parents of a given node in the current project.
 * @param graph the graph in question
 * @param url the url of the node
 * @returns {*} array of the parents' URLs
 */
getPrevURLsFromURL = async (graph, url) => {
    await getGraphFromDisk(graph);
    const project = graph["curProject"];
    return graph[project][url]["prevURLs"];
};

/**
 * Returns the list of highlights of a given node in the current project.
 * @param graph the graph in question
 * @param url the url of the node
 * @returns {*} array of the highlights
 */
getHighlightsFromURL = async (graph, url) => {
    await getGraphFromDisk(graph);
    const project = graph["curProject"];
    return graph[project][url]["highlights"];
};

/**
 * Returns a list of all titles of nodes in the current project.
 * @param graph the graph in question
 * @returns {[]|Array} the array of titles
 */
getTitlesFromGraph = async (graph) => {
    await getGraphFromDisk(graph);
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

/**
 * This method updates the passed in graph variable in place.
 * @param graph the graph to be updated
 */
getGraphFromDisk = async (graph) => {
    chrome.storage.local.get('itemGraph', function (result) {
        result = result.itemGraph;
        if (result.version === CUR_VERSION_NUM) {
            Object.keys(graph).forEach(k => delete graph[k]);
            Object.keys(result).forEach(k => graph[k] = result[k]);
            console.log(graph)
        } else {
            console.log("Either the graph doesnt exist in storage or it's not version " + CUR_VERSION_NUM)
        }
    });
};

// getGraphFromDisk = () => {
//     let graph;
//     chrome.storage.local.get('itemGraph', result => {
//         graph = result.itemGraph;
//     });
//     return new Promise((resolve, reject) => {
//         resolve(graph);
//     })
// };

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
