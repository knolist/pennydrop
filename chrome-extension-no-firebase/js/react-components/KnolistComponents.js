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
const nodeBackgroundDefaultColor = "#7dc2ff";
const nodeHighlightDefaultColor = "#d2e5ff";

// Wrapper for all the components in the page
class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: createNewGraph(), // All the graph data
            selectedNode: null, // Node that's clicked for the detailed view
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
            fullSearchResults: null // Null when no search was made, search result object when searching (will hide the mind map)
        };

        // Bind functions that need to be passed as parameters
        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.exportData = this.exportData.bind(this);
        this.handleClickedNode = this.handleClickedNode.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
        this.addNode = this.addNode.bind(this);
        this.deleteEdge = this.deleteEdge.bind(this);
        this.addEdge = this.addEdge.bind(this);
        this.switchShowNewNodeForm = this.switchShowNewNodeForm.bind(this);
        this.switchShowNewNotesForm = this.switchShowNewNotesForm.bind(this);
        this.resetSelectedNode = this.resetSelectedNode.bind(this);
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
        window.onclick = (event) => {
            if (event.target.classList.contains("modal")) {
                this.closeModals();
            }
        };

        // Set up listener to close different elements by pressing Escape
        window.onkeyup = (event) => {
            if (event.key === "Escape") {
                if (!this.closeModals()) { // Prioritize closing modals
                    if (this.state.fullSearchResults !== null) {
                        this.resetFullSearchResults();
                    }
                }
            }
        };
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
    getDataFromServer() {
        // All the websites as a graph
        getGraphFromDisk().then((graph) => {
            this.setState({graph: graph});
            this.setupVisGraph();
            this.getBibliographyData();

            // Manually update selectedNode if it's not null nor undefined (for notes update)
            if (this.state.selectedNode !== null && this.state.selectedNode !== undefined) {
                const url = this.state.selectedNode.source;
                const curProject = graph.curProject;
                const updatedSelectedNode = graph[curProject][url];
                this.setState({selectedNode: updatedSelectedNode});
            }

            // Redo search if search mode is active
            if (this.state.fullSearchResults !== null) {
                this.fullSearch()
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
    }

    setSelectedNode(url) {
        const curProject = this.state.graph.curProject;
        this.setState({selectedNode: this.state.graph[curProject][url]});
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

    deleteNode(data, callback) {
        const nodeId = data.nodes[0];
        removeItemFromGraph(nodeId).then(() => {
            callback(data);
        });
    }

    addNode(nodeData, callback) {
        this.setState(
            {
                showNewNodeForm: !this.state.showNewNodeForm,
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

    switchShowNewNodeForm() {
        this.setState({showNewNodeForm: !this.state.showNewNodeForm});
    }

    switchShowNewNotesForm() {
        document.getElementById("new-notes-form").reset();
        this.setState({showNewNotesForm: !this.state.showNewNotesForm});
    }

    openProjectsSidebar() {
        this.setState({showProjectsSidebar: true});
        document.getElementById("projects-sidebar").style.width = "400px";
        document.getElementById("projects-sidebar-btn").style.right = "400px";
    }

    closeProjectsSidebar() {
        this.setState({showProjectsSidebar: false});
        document.getElementById("projects-sidebar").style.width = "0";
        document.getElementById("projects-sidebar-btn").style.right = "0";
    }

    closeNewNodeForm() {
        document.getElementById("new-node-form").reset();
        this.switchShowNewNodeForm();
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
        // REMOVE STARTING HERE
        const curProject = this.state.graph.curProject;
        const graph = this.state.graph[curProject];
        const nodeList = Object.keys(graph);
        filterList = Object.keys(graph[nodeList[0]]);
        // STOP REMOVING

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
        // REMOVE STARTING HERE
        const curProject = this.state.graph.curProject;
        const graph = this.state.graph[curProject];
        const nodeList = Object.keys(graph);
        filterList = Object.keys(graph[nodeList[0]]);
        // STOP REMOVING

        const resultObject = this.getSearchResults(query, filterList);
        // Sort so that results with the most occurrences are at the top
        resultObject.results.sort((a, b) => (a.occurrencesCount >= b.occurrencesCount) ? -1 : 1);
        this.setFullSearchResults(resultObject);
        console.log(resultObject);
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
                chosen: true,
                font: {
                    face: "Product Sans"
                },
                color: {
                    background: nodeBackgroundDefaultColor
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
                smooth: false
            },
            interaction: {
                navigationButtons: true,
                selectConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: this.deleteNode,
                addNode: this.addNode,
                deleteEdge: this.deleteEdge,
                addEdge: this.addEdge
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
                        <SearchBar basicSearch={this.basicSearch} fullSearch={this.fullSearch}/>
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
                              resetSelectedNode={this.resetSelectedNode} setSelectedNode={this.setSelectedNode}
                              refresh={this.getDataFromServer} closePageView={this.closePageView}
                              switchShowNewNotesForm={this.switchShowNewNotesForm}
                              fullSearchResults={this.state.fullSearchResults}
                              showNewNotesForm={this.state.showNewNotesForm}/>
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
                <div style={{display: "flex", marginBottom: "20px"}}>
                    <button className="button" onClick={this.closeSearch}>
                        <img src="../../images/back-icon-black.png" alt="Return"/>
                    </button>
                    <h2>{this.props.fullSearchResults.results.length === 0 ? noResultsMessage : searchResultsMessage}</h2>
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
        return (
            <div onClick={this.itemAction} className="search-result-item">
                <h3>{this.props.item.title}</h3>
                <p>{this.props.result.occurrencesCount} {this.props.result.occurrencesCount > 1 ? "occurrences" : "occurrence"}</p>
                {/*<ExpandedSearchResultData display={this.props.expandedSearchResult === this.props.result.url}/>*/}
            </div>
        );
    }
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

    switchShowNewProjectForm() {
        document.getElementById("new-project-form").reset();
        this.setState({
            showNewProjectForm: !this.state.showNewProjectForm,
            alertMessage: null,
            invalidTitle: null
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
                    {Object.keys(this.props.graph).map(project => <ProjectItem key={project} graph={this.props.graph}
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
                    <ConfirmProjectDeletionWindow project={this.state.projectForDeletion}
                                                  resetForDeletion={this.resetProjectForDeletion}
                                                  refresh={this.props.refresh}/>
                </div>
            </div>
        );
    }
}

// Confirmation window before a project is deleted
class ConfirmProjectDeletionWindow extends React.Component {
    constructor(props) {
        super(props);

        this.deleteProject = this.deleteProject.bind(this);
    }

    deleteProject() {
        this.props.resetForDeletion();
        deleteProjectFromGraph(this.props.project).then(() => this.props.refresh());
    }

    render() {
        if (this.props.project === null) {
            return null;
        }
        return (
            <div className="modal">
                <div id="delete-confirmation-modal" className="modal-content">
                    <img src="../../images/alert-icon-black.png" alt="Alert icon"
                         style={{width: "30%", display: "block", marginLeft: "auto", marginRight: "auto"}}/>
                    <h1>Are you sure you want to delete "{this.props.project}"?</h1>
                    <h3>This action cannot be undone.</h3>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <button className="button confirmation-button" onClick={this.deleteProject}>
                            Yes, delete it!
                        </button>
                        <button className="button confirmation-button" onClick={this.props.resetForDeletion}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}


// Button used to open the "create project" form
function NewProjectButton(props) {
    if (props.showForm) {
        return (
            <button className="button new-project-button cancel-new-project" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button new-project-button" onClick={props.switchShowForm}>
            <img src="../../images/add-icon-white.png" alt="New"/>
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
        const title = event.target.newProjectTitle.value;
        if (title === "curProject" || title === "version") {
            // Invalid options (reserved words for the graph structure)
            this.props.setInvalidTitle(title);
            this.props.setAlertMessage("invalid-title");
        } else if (this.props.projects.includes(title)) {
            // Don't allow repeated project names
            this.props.setInvalidTitle(title);
            this.props.setAlertMessage("repeated-title");
        } else {
            // Valid name
            createNewProjectInGraph(title).then(() => this.props.refresh());

            // Reset entry and close form
            event.target.reset();
            // Close the form
            this.props.switchForm();
            // Hide alert message if there was one
            this.props.setAlertMessage(null);
            this.props.setInvalidTitle(null);
        }
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewProjectForm) {
            style = {display: "block"};
        }
        return (
            <div style={style} className="project-item new-project-form-area">
                <form id="new-project-form" onSubmit={this.handleSubmit}>
                    <input type="text" id="newProjectTitle" name="newProjectTitle" defaultValue="New Project" required/>
                    <button className="button create-project-button">Create</button>
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
            <p>{props.projectTitle} is not a valid title.</p>
        );
    }

    if (props.alertMessage === "repeated-title") {
        return (
            <p>You already have a project called {props.projectTitle}.</p>
        );
    }

    return null;
}

// Visualization of a project in the sidebar, used to switch active projects
class ProjectItem extends React.Component {
    constructor(props) {
        super(props);

        this.switchProject = this.switchProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
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

    render() {
        const project = this.props.project;
        // Ignore properties that are not project names
        if (project === "version" || project === "curProject") {
            return null;
        }

        return (
            <div className={project === this.props.graph.curProject ? "project-item active-project" : "project-item"}
                 onClick={this.switchProject}>
                <h2>{this.props.project}</h2>
                <button className="button delete-project-button" onClick={this.deleteProject}>
                    <img src="../../images/delete-icon-white.png" alt="Delete node"/>
                </button>
            </div>
        );
    }
}


// Form that allows the user to manually add nodes
class NewNodeForm extends React.Component {
    constructor(props) {
        super(props);
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
        $.getJSON(contentExtractionURL, (item) => {
            addItemToGraph(item, "").then(() => {
                return updatePositionOfNode(item.source, this.props.nodeData.x, this.props.nodeData.y);
            }).then(() => this.props.refresh());
        });

        this.props.closeForm();
        event.target.reset(); // Clear the form entries
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
                        <img src="../../images/close-icon-black.png" alt="Close"/>
                    </button>
                    <h1>Add new node</h1>
                    <form id="new-node-form" onSubmit={this.handleSubmit}>
                        <input id="url" name="url" type="url" placeholder="Insert URL" required/><br/>
                        <button className="button" style={{width: 100}}>Add node</button>
                    </form>
                </div>
            </div>
        );
    }
}

// Detailed view of a specific node
class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.deleteNode = this.deleteNode.bind(this);
    }

    deleteNode() {
        // Remove from the graph
        removeItemFromGraph(this.props.selectedNode.source).then(() => {
            // Reset the selected node
            this.props.resetSelectedNode();
            this.props.refresh();
        });
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
                <div className="modal-content">
                    <button className="close-modal button" id="close-page-view"
                            onClick={this.props.closePageView}>
                        <img src="../../images/close-icon-black.png" alt="Close"/>
                    </button>
                    <a href={this.props.selectedNode.source} target="_blank"><h1>{this.props.selectedNode.title}</h1>
                    </a>
                    <HighlightsList highlights={this.props.selectedNode.highlights}/>
                    <NotesList showNewNotesForm={this.props.showNewNotesForm}
                               switchShowNewNotesForm={this.props.switchShowNewNotesForm}
                               selectedNode={this.props.selectedNode} fullSearchResults={this.props.fullSearchResults}
                               refresh={this.props.refresh}/>
                    <div style={{display: "flex"}}>
                        <ListURL type={"prev"} graph={this.props.graph} selectedNode={this.props.selectedNode}
                                 setSelectedNode={this.props.setSelectedNode}/>
                        <ListURL type={"next"} graph={this.props.graph} selectedNode={this.props.selectedNode}
                                 setSelectedNode={this.props.setSelectedNode}/>
                    </div>
                    <div style={{textAlign: "right"}}>
                        <button className="button" onClick={this.deleteNode}>
                            <img src="../../images/delete-icon-black.png" alt="Delete node"/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

// Bibliography export
class ExportView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.shouldShow === false) {
            return null;
        }
        return (
            <div className="modal">
                <div className="modal-content">
                    <button className="close-modal button" id="close-page-view"
                            onClick={this.props.resetDisplayExport}>
                        <img src="../../images/close-icon-black.png" alt="Close"/>
                    </button>
                    <h1>Export for Bibliography</h1>
                    <ul>{this.props.bibliographyData.map(item => <li key={item.url}>{item.title}, {item.url}</li>)}</ul>
                </div>
            </div>
        );
    }
}

// List of URLs in the detailed page view
class ListURL extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // Don't render if type is neither "prev" nor "next"
        if (this.props.type !== "prev" && this.props.type !== "next") return null;

        // Define the list to be used based on the type passed as props
        let urlList = this.props.selectedNode.prevURLs;
        if (this.props.type === "next") urlList = this.props.selectedNode.nextURLs;

        return (
            <div className="url-column">
                <h2 style={{textAlign: "center"}}>
                    {this.props.type === "prev" ? "Previous Connections" : "Next Connections"}
                </h2>
                <ul>{urlList.map((url, index) =>
                    <li key={index}><a href="#"
                                       onClick={() => this.props.setSelectedNode(url)}>{this.props.graph[url].title}</a>
                    </li>)}
                </ul>
            </div>
        );

    }
}

// List of highlights in the detailed page view
class HighlightsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h2>{this.props.highlights.length > 0 ? "My Highlights" : "You haven't added any highlights yet."}</h2>
                <ul>{this.props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul>
            </div>
        );
    }
}

// List of notes in the detailed page view
class NotesList extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        addNotesToItemInGraph(this.props.selectedNode, event.target.notes.value).then(() => {
            this.props.refresh();
        });
        this.props.switchShowNewNotesForm();
        event.target.reset(); // Clear the form entries
    }

    render() {
        return (
            <div>
                <div style={{display: "flex"}}>
                    <h2>{this.props.selectedNode.notes.length > 0 ? "My Notes" : "You haven't added any notes yet."}</h2>
                    { // Only show button to add notes outside of search mode
                        this.props.fullSearchResults === null ?
                            <NewNotesButton showForm={this.props.showNewNotesForm}
                                            switchShowForm={this.props.switchShowNewNotesForm}/> :
                            null
                    }
                </div>
                <ul>{this.props.selectedNode.notes.map((notes, index) => <li key={index}>{notes}</li>)}</ul>
                <NewNotesForm handleSubmit={this.handleSubmit} showNewNotesForm={this.props.showNewNotesForm}/>
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
        <form id="new-notes-form" onSubmit={props.handleSubmit} style={style}>
            <input id="notes" name="notes" type="text" placeholder="Insert Notes" required/>
            <button className="button add-note-button cancel-new-project" style={{marginTop: 0, marginBottom: 0}}>Add
            </button>
        </form>
    );
}

// Button used to open the "create project" form
function NewNotesButton(props) {
    if (props.showForm) {
        return (
            <button className="button add-note-button cancel-new-project" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button add-note-button" onClick={props.switchShowForm}>
            <img src="../../images/add-icon-black.png" alt="New"/>
        </button>
    );
}

function RefreshGraphButton(props) {
    return (
        <button onClick={props.refresh} className="button">
            <img src="../../images/refresh-icon.png" alt="Refresh Button"/>
        </button>
    );
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.submitSearch = this.submitSearch.bind(this);
        this.searchButtonAction = this.searchButtonAction.bind(this);
    }

    searchButtonAction() {
        const query = document.getElementById("search-text").value;
        if (query !== "") this.props.fullSearch(query);
    }

    submitSearch(searchInput) {
        if (searchInput.key === "Enter") {
            if (searchInput.target.value !== "") this.props.fullSearch(searchInput.target.value);
        } else {
            this.props.basicSearch(searchInput.target.value);
        }
    }

    render() {
        return (
            <div id="search-bar">
                <input id="search-text" type="text" onKeyUp={(searchInput) => this.submitSearch(searchInput)}
                       placeholder="Search through your project"/>
                <img onClick={this.searchButtonAction} src="../../images/search-icon-black.png" alt="Search"/>
            </div>
        );
    }
}

function ExportGraphButton(props) {
    return (
        <button onClick={props.export} className="button">
            <img src="../../images/share-icon.webp" alt="Refresh Button"/>
        </button>
    );
}

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="header">
                <div className="header-corner-wrapper logo-wrapper">
                    <img className="logo" src="../../images/horizontal_main.PNG" alt="Knolist Logo"/>
                </div>
                <div id="project-name-div">
                    <h5 id="project-name">Current Project: {this.props.projectName}</h5>
                </div>
                <div className="header-corner-wrapper">
                    <ProjectsSidebarButton showSidebar={this.props.showProjectsSidebar}
                                           openProjectsSidebar={this.props.openProjectsSidebar}
                                           closeProjectsSidebar={this.props.closeProjectsSidebar}/>
                </div>
            </div>
        );
    }
}

class ProjectsSidebarButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.showSidebar) {
            return <button id="projects-sidebar-btn" onClick={this.props.closeProjectsSidebar}>
                <img src="../../images/close-icon-white.png" alt="Close" id="close-sidebar-btn"/>
            </button>
        }
        return (
            <button id="projects-sidebar-btn" onClick={this.props.openProjectsSidebar}>
                <p>Your projects</p>
            </button>
        );
    }
}

ReactDOM.render(<KnolistComponents/>, document.querySelector("#knolist-page"));