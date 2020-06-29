/* A collection of functions to manipulate the graph
For these functions, make sure to pull the graph from disk (let graph = await getGraphFromDisk();)
and save it back after manipulation (in case any manipulation was done: saveGraphToDisk(graphData);)
Functions must be async to use the await keyword and ensure sequential execution (i.e., waiting for the graph
to be pulled from Chrome before attempting to access it).
IMPORTANT: don't forget that async functions return promises, so you might have to deal with those when you call
those functions.
 */

const CUR_VERSION_NUM = 1;

/**
 * Creates graph with default project.
 * @returns {{Default: {}, curProject: string, version: *}} the graph with an empty default project
 */
createNewGraph = () => {
    return {
        "Default": {},
        "curProject": "Default",
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
 * @param itemURL the of the item to be removed
 */
removeItemFromGraph = async (itemURL) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];

    // Remove forward and backward edges
    graph[itemURL]["prevURLs"].forEach(prev => {
        graph[prev]["nextURLs"] = graph[prev]["nextURLs"].filter(url => url !== itemURL)
    });
    graph[itemURL]["nextURLs"].forEach(next => {
        graph[next]["prevURLs"] = graph[next]["prevURLs"].filter(url => url !== itemURL)
    });

    // Delete the item now
    delete graph[itemURL];

    // Save to disk
    saveGraphToDisk(graphData);
};

/**
 * Removes an edge from the current project.
 * @param fromURL the URL from where the edge leaves
 * @param toURL the URL where the edge goes into
 */
removeEdgeFromGraph = async (fromURL, toURL) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];

    // Remove forward edge in "from"
    let index = graph[fromURL]["nextURLs"].indexOf(toURL);
    if (index > -1) {
        graph[fromURL]["nextURLs"].splice(index, 1);
    } else {
        console.log("ERROR: next url could not be found");
    }

    // Remove incoming edge in "to"
    index = graph[toURL]["prevURLs"].indexOf(fromURL);
    if (index > -1) {
        graph[toURL]["prevURLs"].splice(index, 1);
    } else {
        console.log("ERROR: prev url could not be found");
    }

    // Save to disk
    saveGraphToDisk(graphData);
};

addEdgeToGraph = async (fromURL, toURL) => {
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];

    // Check if the edge does not exist
    if (graph[fromURL]["nextURLs"].indexOf(toURL) === -1 && graph[fromURL]["prevURLs"].indexOf(fromURL) === -1) {
        // Add forward edge in "from"
        graph[fromURL]["nextURLs"].push(toURL);

        // Add incoming edge in "to"
        graph[toURL]["prevURLs"].push(fromURL);

        // Save to disk
        saveGraphToDisk(graphData);
    }
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
        graph[item["source"]]["notes"] = [];
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

updateAllPositionsInGraph = async (positions) => {
    // Get graph from storage
    let graphData = await getGraphFromDisk();
    const project = graphData["curProject"];
    let graph = graphData[project];

    // Update all positions
    for (let url in positions) {
        const x = positions[url].x;
        const y = positions[url].y;
        graph[url]["x"] = x;
        graph[url]["y"] = y;
    }

    // Save to disk after all positions have been updated
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
        graph[item["source"]]["notes"] = [];
        // Initialize with null positions (will be updated on render of the network
        graph[item["source"]]["x"] = null;
        graph[item["source"]]["y"] = null;
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

addNotesToItemInGraph = (item, notes, graph) => {
  // project = graph["curProject"];
  // graph = graph[project];
  // Create item if it doesn't exist
  if (graph[item["source"]] === undefined) {
    graph[item["source"]] = item;
    graph[item["source"]]["prevURLs"] = [];
    graph[item["source"]]["nextURLs"] = [];
    graph[item["source"]]["highlights"] = [];
    graph[item["source"]]["notes"] = [];
  }
  graph[item["source"]]["notes"].push(notes);
};

/**
 * Deletes a project.
 * @param projectName the name of the project to be deleted
 */
deleteProjectFromGraph = async (projectName) => {
    let graph = await getGraphFromDisk();
    delete graph[projectName];
    // Change curProject if it was deleted
    if (graph["curProject"] === projectName) {
        // Find first available project to set as current
        const keys = Object.keys(graph);
        for (let index in keys) {
            // Ensure valid key (not one of the reserved options
            if (keys[index] !== "version" && keys[index] !== "curProject") {
                graph["curProject"] = keys[index];
                break;
            }
        }
    }
    // If there are no more available options, create a new project called default and set it to curProject
    if (graph["curProject"] === projectName) {
        await createNewProjectInGraph("default");
    }

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

getNotesFromURL = (graph, url) => {
  project = graph["curProject"];
  return graph[project][url]["notes"];
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

/**
 * This method returns a promise that resolves to the graph stored in the chrome storage.
 * A promise was used to ensure that other functions wait for the graph to be retrived before
 * attempting to manipulate it.
 * @returns {Promise<unknown>} a promise that will resolve to the graph stored.
 */
getGraphFromDisk = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('itemGraph', function (result) {
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
