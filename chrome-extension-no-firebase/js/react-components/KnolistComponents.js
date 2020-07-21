/**
 * This is the file that contains the React components for the web application page.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */
import Utils from "../utils.js"

// Global variables
const localServerURL = "http://127.0.0.1:5000/";
const deployedServerURL = "https://knolist.herokuapp.com/";
const nodeBackgroundDefaultColor = Utils.getDefaultNodeColor();
const nodeHighlightDefaultColor = Utils.getHighlightNodeColor();

// Wrapper for all the components in the page
class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: null, // All the graph data
            selectedNode: null, // Node that's clicked for the detailed view,
            nodeForDeletion: null, // Node to be deleted after confirmation
            editNodeMode: false, // Set to true when selectedNode is in edit mode
            displayExport: false,
            showNewNodeForm: false,
            showNewNotesForm: false,
            // autoRefresh: true, // Will be set to false on drag
            newNodeData: null, // Used when creating a new node
            visNetwork: null, // The vis-network object
            visNodes: null, // The vis DataSet of nodes
            visEdges: null, // The vis DataSet of edges
            bibliographyData: null, // The data to be exported as bibliography
            showProjectsSidebar: false, // Whether or not to show the projects sidebar
            localServer: false, // Set to true if the server is being run locally
            fullSearchResults: null, // Null when no search was made, search result object when searching (will hide the mind map)
        };

        // Bind functions that need to be passed as parameters
        // this.deleteNode = this.deleteNode.bind(this); // Was used for deletion through the vis.js GUI
        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.exportData = this.exportData.bind(this);
        this.handleClickedNode = this.handleClickedNode.bind(this);
        this.addNode = this.addNode.bind(this);
        this.deleteEdge = this.deleteEdge.bind(this);
        this.addEdge = this.addEdge.bind(this);
        this.switchShowNewNodeForm = this.switchShowNewNodeForm.bind(this);
        this.switchShowNewNotesForm = this.switchShowNewNotesForm.bind(this);
        this.resetSelectedNode = this.resetSelectedNode.bind(this);
        this.setNodeForDeletion = this.setNodeForDeletion.bind(this);
        this.setEditNodeMode = this.setEditNodeMode.bind(this);
        this.resetNodeForDeletion = this.resetNodeForDeletion.bind(this);
        this.deleteNodeAfterConfirmation = this.deleteNodeAfterConfirmation.bind(this);
        this.resetDisplayExport = this.resetDisplayExport.bind(this);
        this.openProjectsSidebar = this.openProjectsSidebar.bind(this);
        this.closeProjectsSidebar = this.closeProjectsSidebar.bind(this);
        this.closePageView = this.closePageView.bind(this);
        this.closeNewNodeForm = this.closeNewNodeForm.bind(this);
        this.setSelectedNode = this.setSelectedNode.bind(this);
        this.basicSearch = this.basicSearch.bind(this);
        this.fullSearch = this.fullSearch.bind(this);
        this.setFullSearchResults = this.setFullSearchResults.bind(this);
        this.resetFullSearchResults = this.resetFullSearchResults.bind(this);

        // Set up listener to close modals when user clicks outside of them
        document.body.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal")) {
                this.closeModals();
            }
        });

        // Set up listener to close different elements by pressing Escape
        document.body.addEventListener("keyup", (event) => {
            if (event.key === "Escape") {
                if (!this.closeModals()) { // Prioritize closing modals
                    if (this.state.fullSearchResults !== null) {
                        this.resetFullSearchResults();
                    }
                }
            }
        });

        // Set timeout and update graph to get the correct font
        setTimeout(() => this.getDataFromServer(), 1000);
    }

    // Return true if a modal was closed. Used to prioritize modal closing
    closeModals() {
        if (this.state.selectedNode !== null) {
            this.closePageView();
            return true;
        }
        if (this.state.displayExport) {
            this.resetDisplayExport();
            return true;
        }
        if (this.state.showNewNodeForm) {
            this.closeNewNodeForm();
            return true;
        }
        return false;
    }

    // Verifies if the local server is being run
    checkIfLocalServer() {
        $.ajax(localServerURL, {
            complete: (jqXHR, textStatus) => {
                if (textStatus === "success") this.setState({localServer: true});
                else this.setState({localServer: false});
            }
        });
    }

    // Calls graph.js function to pull the graph from the Chrome storage
    // Optional callback to be called after selectedNode is updated
    /**
     * Main function used to update the front end graph data
     * @param callbackObject is an optional object containing callback functions. callbackObject.graphCallback is called
     * after updating the graph. callbackObject.selectedNodeCallback is called after updating the selected node.
     */
    getDataFromServer(callbackObject = {}) {
        // All the websites as a graph
        getGraphFromDisk().then((graph) => {
            this.setState({graph: graph}, () => {
                if (callbackObject.graphCallback !== undefined) callbackObject.graphCallback();
            });
            this.setupVisGraph();
            this.getBibliographyData();

            // Redo search if search mode is active
            if (this.state.fullSearchResults !== null) {
                const resultObject = this.state.fullSearchResults;
                this.fullSearch(resultObject.query, resultObject.filterList);
            }

            // Manually update selectedNode if it's not null nor undefined
            if (this.state.selectedNode !== null && this.state.selectedNode !== undefined) {
                const url = this.state.selectedNode.source;
                const curProject = graph.curProject;
                const updatedSelectedNode = graph[curProject][url];
                this.setState({selectedNode: updatedSelectedNode}, () => {
                    if (callbackObject.selectedNodeCallback !== undefined) callbackObject.selectedNodeCallback();
                });
            }
        });

        // window.setTimeout(() => {
        //     if (this.state.autoRefresh) this.getDataFromServer();
        // }, 200);
    }

    // Pulls the bibliography data from the backend
    getBibliographyData() {
        getTitlesFromGraph().then(bibliographyData => {
            this.setState({bibliographyData: bibliographyData});
        })
    }

    // Used for the export bibliography button
    exportData() {
        this.setState({displayExport: true});
    }

    resetDisplayExport() {
        this.setState({displayExport: false});
    }

    resetSelectedNode() {
        this.setState({selectedNode: null});
        this.resetNodeForDeletion();
        this.setEditNodeMode(false);
    }

    setSelectedNode(url) {
        const curProject = this.state.graph.curProject;
        this.setState({selectedNode: this.state.graph[curProject][url]});
    }

    setNodeForDeletion(url) {
        this.setState({nodeForDeletion: url});
    }

    resetNodeForDeletion() {
        this.setState({nodeForDeletion: null});
    }

    setEditNodeMode(status) {
        this.setState({editNodeMode: status});
    }

    deleteNodeAfterConfirmation() {
        // Remove from the graph
        removeItemFromGraph(this.state.selectedNode.source).then(() => {
            // Reset the selected node
            this.resetSelectedNode();
            this.getDataFromServer();
        });
    }

    closePageView() {
        // Only call switchForm if the notes form is showing
        if (this.state.showNewNotesForm) {
            this.switchShowNewNotesForm();
        }

        this.resetSelectedNode();
    }

    // Set selected node for the detailed view
    handleClickedNode(id) {
        const visCloseButton = document.getElementsByClassName("vis-close")[0];
        // Only open modal outside of edit mode
        if (getComputedStyle(visCloseButton).display === "none") {
            this.setSelectedNode(id);
        }
    }

    // Was used for deletion through the vis.js GUI, probably unnecessary
    // deleteNode(data, callback) {
    //     const nodeId = data.nodes[0];
    //     removeItemFromGraph(nodeId).then(() => {
    //         callback(data);
    //     });
    // }

    addNode(nodeData, callback) {
        this.switchShowNewNodeForm();
        this.setState({
            newNodeData: nodeData
        });
    }

    deleteEdge(data, callback) {
        const edgeId = data.edges[0];
        const connectedNodes = this.state.visNetwork.getConnectedNodes(edgeId);
        removeEdgeFromGraph(connectedNodes[0], connectedNodes[1]).then(() => {
            this.getDataFromServer();
            callback(data);
        });
        callback(data);
    }

    addEdge(edgeData, callback) {
        if (edgeData.from !== edgeData.to) { // Ensure that user isn't adding self edge
            addEdgeToGraph(edgeData.from, edgeData.to).then(() => {
                this.getDataFromServer();
                callback(edgeData);
            });
        }
    }

    closeNewNodeForm() {
        document.getElementById("new-node-form").reset();
        this.switchShowNewNodeForm();
    }

    switchShowNewNodeForm() {
        this.setState({showNewNodeForm: !this.state.showNewNodeForm}, () => {
            // Set focus to the input field
            if (this.state.showNewNodeForm) {
                document.getElementById("url").focus();
            }
        });
    }

    switchShowNewNotesForm() {
        document.getElementById("new-notes-form").reset();
        this.setState({showNewNotesForm: !this.state.showNewNotesForm}, () => {
            // Set focus to the input field if the notes form is open
            if (this.state.showNewNotesForm) document.getElementById("notes").focus();
        });
    }

    openProjectsSidebar() {
        this.setState({showProjectsSidebar: true});
        const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width");
        document.getElementById("projects-sidebar").style.width = sidebarWidth;
        document.getElementById("projects-sidebar-btn").style.right = sidebarWidth;
    }

    closeProjectsSidebar() {
        this.setState({showProjectsSidebar: false});
        document.getElementById("projects-sidebar").style.width = "0";
        document.getElementById("projects-sidebar-btn").style.right = "0";
    }

    setFullSearchResults(results) {
        this.setState({fullSearchResults: results});
    }

    resetFullSearchResults() {
        document.getElementById("search-text").value = ""; // Reset the search bar
        this.highlightNodes(null); // Reset highlighted nodes
        this.setState({fullSearchResults: null});
    }

    /**
     * Visually highlights nodes by changing colors and opacity
     * @param nodesToHighlight an array of ids of the nodes to be highlighted
     */
    highlightNodes(nodesToHighlight) {
        // If the list is null, reset all nodes to the default
        if (nodesToHighlight === null) {
            this.state.visNodes.forEach(node => {
                node.opacity = 1;
                node.color = {
                    background: nodeBackgroundDefaultColor
                };
                this.state.visNodes.update(node);
            });
            return;
        }

        // If list is not null, highlight based on the list
        this.state.visNodes.forEach(node => {
            if (!nodesToHighlight.includes(node.id)) {
                node.opacity = 0.3;
                node.color = {
                    background: nodeBackgroundDefaultColor
                }
            } else {
                node.opacity = 1;
                node.color = {
                    background: nodeHighlightDefaultColor
                };
            }
            this.state.visNodes.update(node);
        });
    }

    /**
     * Given a text query, this function searches the current project for occurrences of that query. The function returns
     * a "result object", which contains the query, filterList, and an array of results grouped by node. If the query is empty,
     * the results array is set to null.
     * @param query the query to be searched
     * @param filterList a list of node keys that whose contents will be included in the search
     * @returns {{query: *, filterList: *, results: []}} the result object. The results array is null is the query is empty
     */
    getSearchResults(query, filterList) {
        // Return object with null results for empty queries
        if (query === "") {
            return {
                query: query,
                filterList: filterList,
                results: null
            };
        }

        const curProject = this.state.graph.curProject;
        const graph = this.state.graph[curProject];

        let resultObject = {
            query: query,
            filterList: filterList,
            results: []
        };
        query = Utils.trimString(query); // trim it
        query = query.toLowerCase();
        for (let graphKey in graph) {
            const node = graph[graphKey];
            let occurrences = [];
            let occurrencesCount = 0;
            // Iterate through the keys inside the node
            for (let nodeKey in node) {
                // Act depending on the type of node[key]
                let elem = node[nodeKey];
                if (typeof (elem) === "number") break; // Ignore pure numbers
                if (Array.isArray(elem)) elem = elem.toString(); // Serialize arrays for search (notes, highlights, ...)
                elem = elem.toLowerCase(); // Lower case for case-insensitive search

                if (filterList.includes(nodeKey)) { // Check if query is present
                    const indices = Utils.getIndicesOf(query, elem);
                    // Only add if results were found
                    if (indices.length > 0) {
                        occurrences.push({
                            key: nodeKey,
                            indices: indices
                        });
                        occurrencesCount += indices.length;
                    }
                }
            }
            // If occurrences were found, include the current node in results
            if (occurrences.length > 0) {
                resultObject.results.push({
                    url: node.source,
                    occurrences: occurrences,
                    occurrencesCount: occurrencesCount
                })
            }
        }
        return resultObject;
    }

    basicSearch(query, filterList) {
        const resultObject = this.getSearchResults(query, filterList);
        if (resultObject.results === null) {
            // If results are null, the query was empty
            this.highlightNodes(null);
        } else {
            // Construct array of IDs based on the results
            let resultIDs = [];
            resultObject.results.forEach(result => resultIDs.push(result.url));
            // Highlight results
            this.highlightNodes(resultIDs);
        }
    }

    fullSearch(query, filterList) {
        const resultObject = this.getSearchResults(query, filterList);
        // Sort so that results with the most occurrences are at the top
        resultObject.results.sort((a, b) => (a.occurrencesCount >= b.occurrencesCount) ? -1 : 1);
        this.setFullSearchResults(resultObject);
    }

    /* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
    generateNodePositions(node) {
        let xOffset = 0;
        let yOffset = 0;
        // Update the offset if the node has a parent
        if (node.prevURLs.length !== 0) {
            const prevURL = node.prevURLs[0];
            const curProject = this.state.graph.curProject;
            const prevNode = this.state.graph[curProject][prevURL];
            // Check if the previous node has defined coordinates
            if (prevNode.x !== null && prevNode.y !== null) {
                xOffset = prevNode.x;
                yOffset = prevNode.y;
            }
        }
        // Helper variable to generate random positions
        const rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
        // Generate random positions
        const xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
        const yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

        // Return positions with offset
        return [xRandom + xOffset, yRandom + yOffset];
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new vis.DataSet();
        let edges = new vis.DataSet();
        const curProject = this.state.graph.curProject;
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.graph[curProject]) {
            let node = this.state.graph[curProject][index];
            // Deal with positions
            if (node.x === null || node.y === null || node.x === undefined || node.y === undefined) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const [x, y] = this.generateNodePositions(node);
                nodes.add({id: node.source, label: node.title, x: x, y: y});
            } else {
                nodes.add({id: node.source, label: node.title, x: node.x, y: node.y});
            }
            // Deal with edges
            for (let nextIndex in node.nextURLs) {
                edges.add({from: node.source, to: node.nextURLs[nextIndex]})
            }
        }
        // console.log(nodes);
        // console.log(edges);
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    // Main function to set up the vis-network object
    setupVisGraph() {
        const [nodes, edges] = this.createNodesAndEdges();

        // create a network
        const container = document.getElementById("graph");
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {
            nodes: {
                shape: "box",
                size: 16,
                margin: 10,
                physics: false,
                chosen: false,
                font: {
                    face: "Product Sans"
                },
                color: {
                    background: nodeBackgroundDefaultColor
                },
                widthConstraint: {
                    maximum: 500
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true
                    }
                },
                color: "black",
                physics: false,
                smooth: false,
                hoverWidth: 0
            },
            interaction: {
                navigationButtons: true,
                selectConnectedEdges: false,
                hover: true,
                hoverConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: false,
                addNode: this.addNode,
                deleteEdge: this.deleteEdge,
                addEdge: this.addEdge,
                editEdge: false
            }
        };
        const network = new vis.Network(container, data, options);
        network.fit(); // Zoom in or out to fit entire network on screen

        // Store all positions
        const positions = network.getPositions();
        updateAllPositionsInGraph(positions);

        // Handle click vs drag
        network.on("click", (params) => {
            if (params.nodes !== undefined && params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.handleClickedNode(nodeId);
            }
        });

        // Stop auto refresh while dragging
        network.on("dragStart", () => {
            // this.setState({autoRefresh: false});
        });

        // Update positions after dragging node
        network.on("dragEnd", () => {
            // Only update positions if there is a selected node
            if (network.getSelectedNodes().length !== 0) {
                const url = network.getSelectedNodes()[0];
                const position = network.getPosition(url);
                const x = position.x;
                const y = position.y;
                updatePositionOfNode(url, x, y);
            }
            // this.setState({autoRefresh: true});
        });

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({visNetwork: network});
    }

    componentDidMount() {
        this.getDataFromServer();
        this.checkIfLocalServer();
        // Add listener to refresh the page when the tab is clicked
        chrome.tabs.onActivated.addListener(activeInfo => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                if (tab.title === "Knolist") {
                    // Update data
                    this.getDataFromServer();
                }
            })
        })
    }

    // // Helper function to track why a component is being re-rendered
    // componentDidUpdate(prevProps, prevState) {
    //     Object.entries(this.props).forEach(([key, val]) =>
    //         prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    //     );
    //     if (this.state) {
    //         Object.entries(this.state).forEach(([key, val]) =>
    //             prevState[key] !== val && console.log(`State '${key}' changed`)
    //         );
    //     }
    // }

    render() {
        if (this.state.graph === null) return null;

        // Only show mind map outside of full search mode
        let graphStyle = {display: "block"};
        if (this.state.fullSearchResults !== null) graphStyle = {display: "none"};

        const curProject = this.state.graph.curProject;
        return (
            <div>
                <Header projectName={curProject} refresh={this.getDataFromServer}
                        showProjectsSidebar={this.state.showProjectsSidebar}
                        openProjectsSidebar={this.openProjectsSidebar}
                        closeProjectsSidebar={this.closeProjectsSidebar}/>
                <div className="main-body">
                    <div id="buttons-bar">
                        <RefreshGraphButton refresh={this.getDataFromServer}/>
                        <SearchBar basicSearch={this.basicSearch} fullSearch={this.fullSearch}
                                   graph={this.state.graph[curProject]}
                                   fullSearchResults={this.state.fullSearchResults}/>
                        <ExportGraphButton export={this.exportData}/>
                    </div>
                    <div id="graph" style={graphStyle}/>
                    <FullSearchResults fullSearchResults={this.state.fullSearchResults}
                                       graph={this.state.graph[curProject]}
                                       resetFullSearchResults={this.resetFullSearchResults}
                                       setSelectedNode={this.setSelectedNode}/>
                    <ProjectsSidebar graph={this.state.graph} refresh={this.getDataFromServer}/>
                    <NewNodeForm showNewNodeForm={this.state.showNewNodeForm} nodeData={this.state.newNodeData}
                                 localServer={this.state.localServer} closeForm={this.closeNewNodeForm}
                                 refresh={this.getDataFromServer}/>
                    <PageView graph={this.state.graph[curProject]} selectedNode={this.state.selectedNode}
                              editNodeMode={this.state.editNodeMode}
                              resetSelectedNode={this.resetSelectedNode} setSelectedNode={this.setSelectedNode}
                              setNodeForDeletion={this.setNodeForDeletion} setEditNodeMode={this.setEditNodeMode}
                              refresh={this.getDataFromServer} closePageView={this.closePageView}
                              switchShowNewNotesForm={this.switchShowNewNotesForm}
                              fullSearchResults={this.state.fullSearchResults}
                              showNewNotesForm={this.state.showNewNotesForm}/>
                    <ConfirmDeletionWindow
                        item={this.state.nodeForDeletion == null ? null : this.state.nodeForDeletion.title}
                        resetForDeletion={this.resetNodeForDeletion}
                        delete={this.deleteNodeAfterConfirmation}/>
                    <ExportView bibliographyData={this.state.bibliographyData} shouldShow={this.state.displayExport}
                                resetDisplayExport={this.resetDisplayExport}/>
                </div>
            </div>
        );
    }
}

class FullSearchResults extends React.Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     expandedSearchResult: null,
        // };
        //
        // this.setExpandedSearchResult = this.setExpandedSearchResult.bind(this);
        // this.resetExpandedSearchResult = this.resetExpandedSearchResult.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
    }

    // setExpandedSearchResult(url) {
    //     this.setState({expandedSearchResult: url});
    // }
    //
    // resetExpandedSearchResult() {
    //     this.setState({expandedSearchResult: null});
    // }

    closeSearch() {
        // this.resetExpandedSearchResult();
        this.props.resetFullSearchResults();
    }

    render() {
        if (this.props.fullSearchResults === null) return null;

        const noResultsMessage = "Sorry, we couldn't find any results for your search.";
        const searchResultsMessage = "Search results";

        return (
            <div id="full-search-results-area">
                <div id="search-results-header">
                    <button className="button" onClick={this.closeSearch}>
                        <img src="../../images/back-icon-white.png" alt="Return"/>
                    </button>
                    <h2>{this.props.fullSearchResults.results.length === 0 ? noResultsMessage : searchResultsMessage}</h2>
                    <div style={{width: "40px"}}/>
                </div>
                {/* List of results */}
                {this.props.fullSearchResults.results.map((result) => <SearchResultItem key={result.url}
                                                                                        item={this.props.graph[result.url]}
                    // expandedSearchResult={this.state.expandedSearchResult}
                    // setExpandedSearchResult={this.setExpandedSearchResult}
                    // resetExpandedSearchResult={this.resetExpandedSearchResult}
                                                                                        result={result}
                                                                                        setSelectedNode={this.props.setSelectedNode}/>)}
            </div>
        );
    }
}

class SearchResultItem extends React.Component {
    constructor(props) {
        super(props);

        this.itemAction = this.itemAction.bind(this);
    }

    itemAction() {
        this.props.setSelectedNode(this.props.item.source);
        // if (this.props.expandedSearchResult === this.props.result.url) this.props.resetExpandedSearchResult();
        // else this.props.setExpandedSearchResult(this.props.result.url);
    }

    render() {
        if (this.props.item === undefined) return null;
        return (
            <div onClick={this.itemAction} className="search-result-item">
                <div>
                    <h3>{this.props.item.title}</h3>
                    <p>{this.props.result.occurrencesCount} {this.props.result.occurrencesCount > 1 ? "occurrences" : "occurrence"}</p>
                </div>
                <OccurrenceCategories occurrences={this.props.result.occurrences}/>
                {/*<ExpandedSearchResultData display={this.props.expandedSearchResult === this.props.result.url}/>*/}
            </div>
        );
    }
}

function OccurrenceCategories(props) {
    return (
        <div className="occurrence-categories">
            {props.occurrences.map((occurrence, index) => {
                return (
                    <div key={occurrence.key} style={{display: "flex"}}>
                        <div className="occurrence-item">
                            <h3>{Utils.getNodePropertyTitle(occurrence.key)}</h3>
                            <p>{occurrence.indices.length}</p>
                        </div>
                        {index < props.occurrences.length - 1 ? <div className="vertical-line"/> : null}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * @return {null}
 */
function ExpandedSearchResultData(props) {
    if (!props.display) return null;

    return <p>Expanded!</p>
}

// Sidebar to switch between projects
class ProjectsSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showNewProjectForm: false,
            projectForDeletion: null,
            alertMessage: null,
            invalidTitle: null
        };

        this.switchShowNewProjectForm = this.switchShowNewProjectForm.bind(this);
        this.setProjectForDeletion = this.setProjectForDeletion.bind(this);
        this.resetProjectForDeletion = this.resetProjectForDeletion.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);
        this.setInvalidTitle = this.setInvalidTitle.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
    }

    setAlertMessage(value) {
        this.setState({alertMessage: value});
    }

    setInvalidTitle(value) {
        this.setState({invalidTitle: value});
    }

    setProjectForDeletion(project) {
        this.setState({projectForDeletion: project});
    }

    resetProjectForDeletion() {
        this.setState({projectForDeletion: null});
    }

    deleteProject() {
        deleteProjectFromGraph(this.state.projectForDeletion).then(() => {
            const callbackObject = {
                graphCallback: () => {
                    this.resetProjectForDeletion();
                }
            };
            this.props.refresh(callbackObject);
        });
    }

    switchShowNewProjectForm() {
        this.setState({
            showNewProjectForm: !this.state.showNewProjectForm,
            alertMessage: null,
            invalidTitle: null
        }, () => {
            // Set focus to the input field
            if (this.state.showNewProjectForm) document.getElementById("newProjectTitle").focus();
            document.getElementById("new-project-form").reset();
        });
    }

    render() {
        return (
            <div id="projects-sidebar" className="sidebar">
                <div id="sidebar-header">
                    <h1 id="sidebar-title">Your Projects</h1>
                    <NewProjectButton showForm={this.state.showNewProjectForm}
                                      switchShowForm={this.switchShowNewProjectForm}/>
                </div>
                <div id="sidebar-content">
                    {Object.keys(this.props.graph).map((project, index) => <ProjectItem key={index} index={index}
                                                                                        graph={this.props.graph}
                                                                                        project={project}
                                                                                        refresh={this.props.refresh}
                                                                                        setForDeletion={this.setProjectForDeletion}/>)}
                    <NewProjectForm showNewProjectForm={this.state.showNewProjectForm} refresh={this.props.refresh}
                                    switchForm={this.switchShowNewProjectForm}
                                    setAlertMessage={this.setAlertMessage}
                                    setInvalidTitle={this.setInvalidTitle}
                                    alertMessage={this.state.alertMessage}
                                    invalidTitle={this.state.invalidTitle}
                                    projects={Object.keys(this.props.graph)}/>
                    <ConfirmDeletionWindow item={this.state.projectForDeletion}
                                           resetForDeletion={this.resetProjectForDeletion}
                                           delete={this.deleteProject}/>
                </div>
            </div>
        );
    }
}

/**Confirmation window before an item is deleted
 * @return {null}
 */
function ConfirmDeletionWindow(props) {
    if (props.item === null) {
        return null;
    }
    return (
        <div className="modal">
            <div id="delete-confirmation-modal" className="modal-content">
                <img src="../../images/alert-icon-black.png" alt="Alert icon"
                     style={{width: "30%", display: "block", marginLeft: "auto", marginRight: "auto"}}/>
                <h1>Are you sure you want to delete "{props.item}"?</h1>
                <h3>This action cannot be undone.</h3>
                <div className="flex-and-spaced">
                    <button className="button confirmation-button" onClick={props.delete}>
                        Yes, delete it!
                    </button>
                    <button className="button confirmation-button" onClick={props.resetForDeletion}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}


// Button used to open the "create project" form
function NewProjectButton(props) {
    return (
        <button
            className={props.showForm ? "button new-project-button button-with-text" : "button new-project-button"}
            onMouseDown={(event) => {
                event.preventDefault();
                props.switchShowForm();
            }}>
            {
                props.showForm ?
                    <p>Cancel</p> :
                    <img src="../../images/add-icon-white.png" alt="New"/>
            }
        </button>
    );
}

// Form to create a new project
class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        // Prevent page from reloading
        event.preventDefault();

        // Data validation
        const title = Utils.trimString(event.target.newProjectTitle.value);
        const alertMessage = Utils.validateProjectTitle(title, this.props.projects);
        this.props.setAlertMessage(alertMessage);
        if (alertMessage == null) { // Valid entry
            // Reset entry and close form
            event.target.reset();

            // Create project
            createNewProjectInGraph(title).then(() => {
                const callbackObject = {
                    graphCallback: () => {
                        // Close the form
                        this.props.switchForm();
                        // Hide alert message if there was one
                        this.props.setInvalidTitle(null);
                    }
                };
                this.props.refresh(callbackObject);
            });
        } else {
            this.props.setInvalidTitle(title);
        }
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewProjectForm) {
            style = {display: "block"};
        }
        return (
            <div style={style} className="project-item new-project-form-area">
                <form id="new-project-form" onSubmit={this.handleSubmit}
                      onBlur={() => this.props.showNewProjectForm ? this.props.switchForm() : null} autoComplete="off">
                    <input type="text" id="newProjectTitle" name="newProjectTitle" defaultValue="New Project" required/>
                    <button onMouseDown={(event) => event.preventDefault()}
                            className="button create-project-button">Create
                    </button>
                </form>
                <ProjectTitleAlertMessage alertMessage={this.props.alertMessage}
                                          projectTitle={this.props.invalidTitle}/>
            </div>
        );
    }
}

/** Alert message for invalid project names
 * @return {null}
 */
function ProjectTitleAlertMessage(props) {
    if (props.alertMessage === "invalid-title") {
        return (
            <p className="alert-message">{props.projectTitle} is not a valid title.</p>
        );
    }

    if (props.alertMessage === "repeated-title") {
        return (
            <p className="alert-message">You already have a project called {props.projectTitle}.</p>
        );
    }

    return null;
}

// Visualization of a project in the sidebar, used to switch active projects
class ProjectItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            projectEditMode: false,
            alertMessage: null,
            invalidTitle: null
        };

        this.switchProject = this.switchProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
        this.switchProjectEditMode = this.switchProjectEditMode.bind(this);
        this.editProjectName = this.editProjectName.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);
        this.setInvalidTitle = this.setInvalidTitle.bind(this);
    }

    getInputFieldId() {
        // Generate unique id
        return "edit-project-title" + this.props.index;
    }

    switchProject(data) {
        // Only switch if the click was on the item, not on the delete button
        if (data.target.className === "project-item" || data.target.tagName === "H2") {
            setCurrentProjectInGraph(this.props.project).then(() => this.props.refresh());
        }
    }

    deleteProject() {
        this.props.setForDeletion(this.props.project);
    }

    setAlertMessage(value) {
        this.setState({alertMessage: value});
    }

    setInvalidTitle(value) {
        this.setState({invalidTitle: value});
    }

    submitOnEnter(event) {
        event.preventDefault();
        this.editProjectName(event.target[this.getInputFieldId()].value);
    }

    editProjectName(title) {
        // Prevent user from inputting empty title name
        if (title == null || title.length === 0) {
            this.switchProjectEditMode();
            return;
        }

        title = Utils.trimString(title);
        // Check if submitted title is equal to the current
        if (title === this.props.project) {
            this.switchProjectEditMode();
            return;
        }

        const projects = Object.keys(this.props.graph);
        const alertMessage = Utils.validateProjectTitle(title, projects);
        this.setAlertMessage(alertMessage);
        if (alertMessage == null) {
            // Valid name
            updateProjectTitle(this.props.project, title).then(() => {
                const callbackObject = {
                    graphCallback: () => {
                        // Update on callback
                        this.switchProjectEditMode();
                        // Hide alert message if there was one
                        this.setInvalidTitle(null);
                    }
                };
                this.props.refresh(callbackObject);
            });
        } else {
            this.setInvalidTitle(title);
        }
    }

    switchProjectEditMode() {
        this.setState({projectEditMode: !this.state.projectEditMode}, () => {
            if (this.state.projectEditMode) {
                document.getElementById(this.getInputFieldId()).focus();
            } else {
                this.setAlertMessage(null);
                this.setInvalidTitle(null);
            }
        });
    };

    render() {
        const project = this.props.project;
        // Ignore properties that are not project names
        if (project === "version" || project === "curProject") {
            return null;
        }

        // Generate unique id
        const projectId = this.getInputFieldId();

        return (
            <div className={project === this.props.graph.curProject ? "project-item active-project" : "project-item"}
                 onClick={this.switchProject}>
                {
                    this.state.projectEditMode ?
                        <div>
                            <form onSubmit={(event) => this.submitOnEnter(event)}
                                  onBlur={(event) => this.editProjectName(event.target.value)}
                                  autoComplete="off">
                                <input id={projectId} type="text" defaultValue={this.props.project} required/>
                            </form>
                            <ProjectTitleAlertMessage alertMessage={this.state.alertMessage}
                                                      projectTitle={this.state.invalidTitle}/>
                        </div> :
                        <h2>{this.props.project}</h2>
                }
                <SidebarButtons deleteProject={this.deleteProject} switchProjectEditMode={this.switchProjectEditMode}
                                projectEditMode={this.state.projectEditMode}/>
            </div>
        );
    }
}

function SidebarButtons(props) {
    return (
        <div>
            <button
                className={props.projectEditMode ? "button edit-project-button button-with-text" : "button edit-project-button"}
                onMouseDown={(event) => {
                    event.preventDefault();
                    props.switchProjectEditMode();
                }}>
                {
                    props.projectEditMode ?
                        <p>Cancel</p> :
                        <img src="../../images/edit-icon-white.png" alt="Edit project"/>
                }
            </button>
            <button className="button delete-project-button" onClick={props.deleteProject}>
                <img src="../../images/delete-icon-white.png" alt="Delete project"/>
            </button>
        </div>
    );
}

// Form that allows the user to manually add nodes
class NewNodeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false // Used to display loading icon while the new node is being added
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault(); // Stop page from reloading
        // Call from server
        let baseServerURL = deployedServerURL;
        if (this.props.localServer) { // Use local server if it's active
            baseServerURL = localServerURL;
        }
        const contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(event.target.url.value);

        // Start loading
        event.persist();
        this.setState({loading: true}, () => {
            $.getJSON(contentExtractionURL, (item) => {
                addItemToGraph(item, "").then(() => {
                    return updatePositionOfNode(item.source, this.props.nodeData.x, this.props.nodeData.y);
                }).then(() => {
                    // Create callback object
                    const callbackObject = {
                        graphCallback: () => {
                            this.setState({loading: false}, () => {
                                this.props.closeForm();
                                event.target.reset(); // Clear the form entries
                            });
                        }
                    };
                    this.props.refresh(callbackObject);
                });
            });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        // Block clicks while the new node is being loaded
        if (prevState.loading !== this.state.loading) {
            if (this.state.loading) document.body.style.pointerEvents = "none";
            else document.body.style.pointerEvents = "auto";
        }
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewNodeForm) {
            style = {display: "block"}
        }
        return (
            <div className="modal" style={style}>
                <div className="modal-content">
                    <button className="close-modal button" onClick={this.props.closeForm}>
                        <img src="../../images/close-icon-white.png" alt="Close"/>
                    </button>
                    <h1>Add new node</h1>
                    <form id="new-node-form" onSubmit={this.handleSubmit}>
                        <input id="url" name="url" type="url" placeholder="Insert URL" required/><br/>
                        <button className="button button-with-text">Add node</button>
                    </form>
                    {this.state.loading ? <div id="new-node-spinner"><LoadingSpinner/></div> : null}
                </div>
            </div>
        );
    }
}

// Simple loading spinner, CSS is defined in utilities.less
function LoadingSpinner() {
    return <div className="spinner"/>

    // return (
    //     <div className="lds-spinner">
    //         <div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/>
    //     </div>
    // );
}

// Detailed view of a specific node
class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.setForDeletion = this.setForDeletion.bind(this);
    }

    setForDeletion() {
        this.props.setNodeForDeletion(this.props.selectedNode);
    }

    render() {
        // Don't render if selectedNode is null or undefined
        if (this.props.selectedNode === null || this.props.selectedNode === undefined) {
            return null;
        }

        // Don't render if selectedNode doesn't belong to curProject
        // (To allow for data update when the page is focused - CU-96hk2k)
        if (!this.props.graph.hasOwnProperty(this.props.selectedNode.source)) {
            return null;
        }

        return (
            <div id="page-view" className="modal">
                <div className="modal-content pageview">
                    <div className="flex-and-spaced pageview-header">
                        <PageViewTitle selectedNode={this.props.selectedNode} editNodeMode={this.props.editNodeMode}
                                       refresh={this.props.refresh}/>
                        <button className="button close-pageview" id="close-page-view" data-tooltip="Close"
                                data-tooltip-location="down" onClick={this.props.closePageView}>
                            <img src="../../images/close-icon-white.png" alt="Close"/>
                        </button>
                    </div>
                    <HighlightsList highlights={this.props.selectedNode.highlights}
                                    editNodeMode={this.props.editNodeMode}/>
                    <hr/>
                    <NotesList showNewNotesForm={this.props.showNewNotesForm}
                               switchShowNewNotesForm={this.props.switchShowNewNotesForm}
                               selectedNode={this.props.selectedNode}
                               refresh={this.props.refresh}
                               editNodeMode={this.props.editNodeMode}/>
                    <hr/>
                    <div style={{display: "flex"}}>
                        <ListURL type={"prev"} graph={this.props.graph} selectedNode={this.props.selectedNode}
                                 setSelectedNode={this.props.setSelectedNode}/>
                        <ListURL type={"next"} graph={this.props.graph} selectedNode={this.props.selectedNode}
                                 setSelectedNode={this.props.setSelectedNode}/>
                    </div>
                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <EditNodeButton editNodeMode={this.props.editNodeMode}
                                        setEditNodeMode={this.props.setEditNodeMode}/>
                        <DeleteNodeButton setForDeletion={this.setForDeletion}/>
                    </div>
                </div>
            </div>
        );
    }
}

function EditNodeButton(props) {
    return (
        <button className={props.editNodeMode ? "button button-with-text" : "button"} style={{marginRight: "10px"}}
                data-tooltip={props.editNodeMode ? undefined : "Edit Node"}
                data-tooltip-location={props.editNodeMode ? undefined : "up"}
                onClick={() => props.setEditNodeMode(!props.editNodeMode)}>
            {
                props.editNodeMode ?
                    <p>Done</p> :
                    <img src="../../images/edit-icon-white.png" alt="Edit node"/>
            }
        </button>
    );
}

function DeleteNodeButton(props) {
    return (
        <button className="button" data-tooltip="Delete node" data-tooltip-location="up"
                onClick={props.setForDeletion}>
            <img src="../../images/delete-icon-white.png" alt="Delete node"/>
        </button>
    )
}

class PageViewTitle extends React.Component {
    updateTitle(newTitle) {
        updateNodeTitleInGraph(this.props.selectedNode.source, newTitle).then(() => {
            const callbackObject = {
                selectedNodeCallback: () => document.getElementById("newNodeTitle").value = this.props.selectedNode.title
            };
            this.props.refresh(callbackObject);
        });
    }

    render() {
        if (this.props.editNodeMode) {
            return (
                <form onSubmit={(event) => {
                    event.preventDefault();
                    this.updateTitle(event.target.newNodeTitle.value);
                }}
                      onBlur={(event) => this.updateTitle(event.target.value)}>
                    <input type="text" id="newNodeTitle" defaultValue={this.props.selectedNode.title}
                           key={this.props.selectedNode.title} autoComplete="off" required/>
                </form>
            );
        }
        return (
            <a href={this.props.selectedNode.source} target="_blank">
                <h1>{this.props.selectedNode.title}</h1>
            </a>
        );
    }
}

// Bibliography export
/**
 * @return {null}
 */
function ExportView(props) {
    if (props.shouldShow === false) {
        return null;
    }
    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-modal button" id="close-page-view" onClick={props.resetDisplayExport}>
                    <img src="../../images/close-icon-white.png" alt="Close"/>
                </button>
                <h1>Export for Bibliography</h1>
                <ul>{props.bibliographyData.map(item => <li key={item.url}>{item.title}, {item.url}</li>)}</ul>
            </div>
        </div>
    );
}

// List of URLs in the detailed page view
/**
 * @return {null}
 */
function ListURL(props) {
    // Don't render if type is neither "prev" nor "next"
    if (props.type !== "prev" && props.type !== "next") return null;

    // Define the list to be used based on the type passed as props
    let urlList = props.selectedNode.prevURLs;
    if (props.type === "next") urlList = props.selectedNode.nextURLs;

    return (
        <div className="url-column">
            <h2 style={{textAlign: "center"}}>
                {props.type === "prev" ? "Previous Connections" : "Next Connections"}
            </h2>
            <ul>{urlList.map((url, index) =>
                <li key={index}><a href="#"
                                   onClick={() => props.setSelectedNode(url)}>{props.graph[url].title}</a>
                </li>)}
            </ul>
        </div>
    );
}

// List of highlights in the detailed page view
function HighlightsList(props) {
    return (
        <div>
            <h2>{props.highlights.length > 0 ? "My Highlights" : "You haven't added any highlights yet."}</h2>
            {
                props.highlights.length === 0 ?
                    <p>To add highlights, select text on a page, right-click, then click on "Highlight with
                        Knolist".</p> :
                    null
            }
            {
                props.editNodeMode ?
                    <form style={{margin: "12px 0"}}>
                        {props.highlights.map((highlight, index) =>
                            <div key={index}>
                                <label><input type="checkbox"/>{highlight}</label>
                            </div>)}
                    </form> :
                    <ul>
                        {props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
                    </ul>
            }
        </div>
    );

}

// List of notes in the detailed page view
class NotesList extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateNotesOnBlur = this.updateNotesOnBlur.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        event.persist();
        addNotesToItemInGraph(this.props.selectedNode, event.target.notes.value).then(() => {
            const callbackObject = {
                selectedNodeCallback: () => {
                    this.props.switchShowNewNotesForm();
                    event.target.reset(); // Clear the form entries
                }
            };
            this.props.refresh(callbackObject);
        });
    }

    updateNotesOnBlur(index, newNotes) {
        if (newNotes === "") newNotes = null; // Set to null to delete the note on blur

        updateNotesInGraph(this.props.selectedNode.source, index, newNotes).then(() => {
            this.props.refresh();
        });
    }

    render() {
        return (
            <div>
                <div style={{display: "flex"}}>
                    <h2>{this.props.selectedNode.notes.length > 0 ? "My Notes" : "You haven't added any notes yet."}</h2>
                    <NewNotesButton showForm={this.props.showNewNotesForm}
                                    switchShowForm={this.props.switchShowNewNotesForm}/>
                </div>
                {
                    this.props.editNodeMode ?
                        <form style={{margin: "12px 0"}}>
                            {this.props.selectedNode.notes.map((notes, index) =>
                                <div className="editable-note" key={Math.random()}>
                                    <input type="checkbox"/><input type="text" defaultValue={notes}
                                                                   onBlur={(event) => this.updateNotesOnBlur(index, event.target.value)}/>
                                </div>)}
                        </form> :
                        <ul>
                            {this.props.selectedNode.notes.map((notes, index) => <li key={index}>{notes}</li>)}
                        </ul>
                }
                <NewNotesForm handleSubmit={this.handleSubmit} showNewNotesForm={this.props.showNewNotesForm}
                              switchShowNewNotesForm={this.props.switchShowNewNotesForm}/>
            </div>
        );
    }
}

function NewNotesForm(props) {
    // Hidden form for adding notes
    let style = {display: "none"};
    if (props.showNewNotesForm) {
        style = {display: "block"}
    }

    return (
        <form id="new-notes-form" onSubmit={props.handleSubmit}
              onBlur={() => {
                  if (props.showNewNotesForm) props.switchShowNewNotesForm();
              }} style={style}>
            <input id="notes" name="notes" type="text" placeholder="Insert Notes" required/>
            <button onMouseDown={(event) => {
                event.preventDefault();
            }} className="button small-button button-with-text" style={{marginTop: 0, marginBottom: 0}}>
                Add
            </button>
        </form>
    );
}

// Button used to open the "create notes" form
function NewNotesButton(props) {
    return (
        <button className={props.showForm ? "button small-button button-with-text" : "button small-button"}
                data-tooltip={props.showForm ? undefined : "Add notes"}
                data-tooltip-location={props.showForm ? undefined : "up"}
                onMouseDown={(event) => {
                    event.preventDefault();
                    props.switchShowForm();
                }}>
            {
                props.showForm ?
                    <p>Cancel</p> :
                    <img src="../../images/add-icon-white.png" alt="New"/>
            }

        </button>
    );
}

function RefreshGraphButton(props) {
    return (
        <button onClick={props.refresh} className="button" data-tooltip="Refresh" data-tooltip-location="right">
            <img src="../../images/refresh-icon-white.png" alt="Refresh Button"/>
        </button>
    );
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterList: this.generateFilterList(),
            showFilterList: false
        };

        this.submitSearch = this.submitSearch.bind(this);
        this.searchButtonAction = this.searchButtonAction.bind(this);
        this.setActiveFilter = this.setActiveFilter.bind(this);
        this.switchShowFilterList = this.switchShowFilterList.bind(this);
        this.setAllFilters = this.setAllFilters.bind(this);

        // Add listener to close filter when clicking outside
        document.body.addEventListener("click", (event) => {
            if (!Utils.isDescendant(document.getElementById("filter-dropdown"), event.target) &&
                !Utils.isDescendant(document.getElementById("search-filters-button"), event.target)) {
                this.closeFilterList();
            }
        });

        // Remap CTRL+F to focus the search bar
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'f') {
                event.preventDefault();
                document.getElementById("search-text").focus();
                $("#search-bar").effect({
                    effect: "highlight",
                    color: "#fffaa6",
                    duration: 1500,
                    queue: false
                });
            }
        });
    }

    switchShowFilterList() {
        this.setState({showFilterList: !this.state.showFilterList});
    }

    closeFilterList() {
        if (this.state.showFilterList) this.switchShowFilterList();
    }

    generateFilterList() {
        // Get list of all filters
        const nodeList = Object.keys(this.props.graph);
        if (nodeList.length === 0) return [];
        let filterNames = Object.keys(this.props.graph[nodeList[0]]);

        // Remove unwanted properties from filter list
        const propertiesToRemove = ["x", "y"];
        propertiesToRemove.forEach(property => {
            const index = filterNames.indexOf(property);
            filterNames.splice(index, 1);
        });

        // Create filter objects
        let filterList = {};
        filterNames.forEach(name => {
            filterList[name] = {active: true};
        });

        return filterList;
    }

    setFilterList(filterList) {
        this.setState({filterList: filterList}, () => {
            // Call search with updated filter list
            if (this.props.fullSearchResults !== null && this.props.fullSearchResults.query !== "") {
                this.props.fullSearch(this.props.fullSearchResults.query, this.getActiveFilters());
            } else {
                const query = document.getElementById("search-text").value;
                this.props.basicSearch(query, this.getActiveFilters());
            }
        });
    }

    setActiveFilter(name, active) {
        let filterList = this.state.filterList;
        filterList[name].active = active;
        this.setFilterList(filterList);
    }

    setAllFilters(active) {
        let filterList = this.state.filterList;
        Object.keys(filterList).forEach((filter) => {
            filterList[filter].active = active;
        });
        this.setFilterList(filterList);
    }

    getActiveFilters() {
        let activeFilters = [];
        Object.keys(this.state.filterList).forEach(filter => {
            if (this.state.filterList[filter].active) activeFilters.push(filter);
        });
        return activeFilters;
    }

    searchButtonAction() {
        const query = document.getElementById("search-text").value;
        if (query !== "") {
            this.props.fullSearch(query, this.getActiveFilters());
            this.closeFilterList();
        }
    }

    submitSearch(searchInput) {
        this.closeFilterList();
        if (searchInput.key === "Enter" || this.props.fullSearchResults !== null) {
            if (searchInput.target.value !== "") this.props.fullSearch(searchInput.target.value, this.getActiveFilters());
        } else {
            this.props.basicSearch(searchInput.target.value, this.getActiveFilters());
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.graph !== this.props.graph) this.setState({filterList: this.generateFilterList()});
    }

    render() {
        return (
            <div style={{display: "flex"}}>
                <div id="search-bar">
                    <input id="search-text" type="text" onKeyUp={(searchInput) => this.submitSearch(searchInput)}
                           placeholder="Search through your project"/>
                    <img onClick={this.searchButtonAction} src="../../images/search-icon-black.png" alt="Search"/>
                </div>
                <Filters filterList={this.state.filterList} showFilterList={this.state.showFilterList}
                         setActiveFilter={this.setActiveFilter}
                         switchShowFilterList={this.switchShowFilterList}
                         setAllFilters={this.setAllFilters}/>
            </div>
        );
    }
}

function Filters(props) {
    return (
        <div>
            <button onClick={props.switchShowFilterList} className="button" id="search-filters-button"
                    data-tooltip="Search Filters" data-tooltip-location="top">
                <img src="../../images/filter-icon-black.png" alt="Filter"/>
            </button>
            <FiltersDropdown showFilterList={props.showFilterList} filterList={props.filterList}
                             setActiveFilter={props.setActiveFilter} setAllFilters={props.setAllFilters}/>
        </div>
    );
}

function FiltersDropdown(props) {
    let dropdownStyle = {display: "none"};
    if (props.showFilterList) dropdownStyle = {display: "block"};

    return (
        <div className="dropdown" style={dropdownStyle}>
            <div className="dropdown-content filters-dropdown" id="filter-dropdown">
                <div id="filter-dropdown-buttons">
                    <a onClick={() => props.setAllFilters(true)} id="filter-dropdown-left-button">Select all</a>
                    <a onClick={() => props.setAllFilters(false)}>Clear all</a>
                </div>
                {Object.keys(props.filterList).map(filter => <FilterItem key={filter} filter={filter}
                                                                         filterList={props.filterList}
                                                                         setActiveFilter={props.setActiveFilter}/>)}
            </div>
        </div>
    );
}

class FilterItem extends React.Component {
    constructor(props) {
        super(props);
        this.filterClicked = this.filterClicked.bind(this);
    }

    filterClicked() {
        this.props.setActiveFilter(this.props.filter, !this.props.filterList[this.props.filter].active);
    }

    render() {
        return (
            <div className="filter-item" onClick={this.filterClicked}>
                <p>{Utils.getNodePropertyTitle(this.props.filter)}</p>
                {this.props.filterList[this.props.filter].active ?
                    <img src="../../images/checkmark-icon-green.png" alt="Active"/> :
                    null}
            </div>
        );
    }
}

function ExportGraphButton(props) {
    return (
        <button onClick={props.export} className="button" data-tooltip="Export for Bibliography"
                data-tooltip-location="left">
            <img src="../../images/export-icon-white.png" alt="Refresh Button"/>
        </button>
    );
}

function Header(props) {
    return (
        <div className="header">
            <div className="header-corner-wrapper logo-wrapper">
                <img className="logo" src="../../images/horizontal_main.PNG" alt="Knolist Logo"/>
            </div>
            <div id="project-name-div">
                <h5 id="project-name">Current Project: {props.projectName}</h5>
            </div>
            <div className="header-corner-wrapper">
                <ProjectsSidebarButton showSidebar={props.showProjectsSidebar}
                                       openProjectsSidebar={props.openProjectsSidebar}
                                       closeProjectsSidebar={props.closeProjectsSidebar}/>
            </div>
        </div>
    );
}

function ProjectsSidebarButton(props) {
    if (props.showSidebar) {
        return <button id="projects-sidebar-btn" onClick={props.closeProjectsSidebar}>
            <img src="../../images/close-icon-white.png" alt="Close" id="close-sidebar-btn"/>
        </button>
    }
    return (
        <button id="projects-sidebar-btn" onClick={props.openProjectsSidebar}>
            <p>Your projects</p>
        </button>
    );
}

ReactDOM.render(<KnolistComponents/>, document.querySelector("#knolist-page"));