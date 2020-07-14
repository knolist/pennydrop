var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is the file that contains the React components for the web application page.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */
import Utils from "../utils.js";

// Global variables
var localServerURL = "http://127.0.0.1:5000/";
var deployedServerURL = "https://knolist.herokuapp.com/";
var nodeBackgroundDefaultColor = "#7dc2ff";
var nodeHighlightDefaultColor = "#d2e5ff";

// Wrapper for all the components in the page

var KnolistComponents = function (_React$Component) {
    _inherits(KnolistComponents, _React$Component);

    function KnolistComponents(props) {
        _classCallCheck(this, KnolistComponents);

        var _this = _possibleConstructorReturn(this, (KnolistComponents.__proto__ || Object.getPrototypeOf(KnolistComponents)).call(this, props));

        _this.state = {
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
        _this.getDataFromServer = _this.getDataFromServer.bind(_this);
        _this.exportData = _this.exportData.bind(_this);
        _this.handleClickedNode = _this.handleClickedNode.bind(_this);
        _this.deleteNode = _this.deleteNode.bind(_this);
        _this.addNode = _this.addNode.bind(_this);
        _this.deleteEdge = _this.deleteEdge.bind(_this);
        _this.addEdge = _this.addEdge.bind(_this);
        _this.switchShowNewNodeForm = _this.switchShowNewNodeForm.bind(_this);
        _this.switchShowNewNotesForm = _this.switchShowNewNotesForm.bind(_this);
        _this.resetSelectedNode = _this.resetSelectedNode.bind(_this);
        _this.resetDisplayExport = _this.resetDisplayExport.bind(_this);
        _this.openProjectsSidebar = _this.openProjectsSidebar.bind(_this);
        _this.closeProjectsSidebar = _this.closeProjectsSidebar.bind(_this);
        _this.closePageView = _this.closePageView.bind(_this);
        _this.closeNewNodeForm = _this.closeNewNodeForm.bind(_this);
        _this.setSelectedNode = _this.setSelectedNode.bind(_this);
        _this.basicSearch = _this.basicSearch.bind(_this);
        _this.fullSearch = _this.fullSearch.bind(_this);
        _this.setFullSearchResults = _this.setFullSearchResults.bind(_this);
        _this.resetFullSearchResults = _this.resetFullSearchResults.bind(_this);

        // Set up listener to close modals when user clicks outside of them
        window.onclick = function (event) {
            if (event.target.classList.contains("modal")) {
                _this.closeModals();
            }
        };

        // Set up listener to close different elements by pressing Escape
        window.onkeyup = function (event) {
            if (event.key === "Escape") {
                if (!_this.closeModals()) {
                    // Prioritize closing modals
                    if (_this.state.fullSearchResults !== null) {
                        _this.resetFullSearchResults();
                    }
                }
            }
        };
        return _this;
    }

    // Return true if a modal was closed. Used to prioritize modal closing


    _createClass(KnolistComponents, [{
        key: "closeModals",
        value: function closeModals() {
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

    }, {
        key: "checkIfLocalServer",
        value: function checkIfLocalServer() {
            var _this2 = this;

            $.ajax(localServerURL, {
                complete: function complete(jqXHR, textStatus) {
                    if (textStatus === "success") _this2.setState({ localServer: true });else _this2.setState({ localServer: false });
                }
            });
        }

        // Calls graph.js function to pull the graph from the Chrome storage

    }, {
        key: "getDataFromServer",
        value: function getDataFromServer() {
            var _this3 = this;

            // All the websites as a graph
            getGraphFromDisk().then(function (graph) {
                _this3.setState({ graph: graph });
                _this3.setupVisGraph();
                _this3.getBibliographyData();

                // Manually update selectedNode if it's not null nor undefined (for notes update)
                if (_this3.state.selectedNode !== null && _this3.state.selectedNode !== undefined) {
                    var url = _this3.state.selectedNode.source;
                    var curProject = graph.curProject;
                    var updatedSelectedNode = graph[curProject][url];
                    _this3.setState({ selectedNode: updatedSelectedNode });
                }
            });

            // window.setTimeout(() => {
            //     if (this.state.autoRefresh) this.getDataFromServer();
            // }, 200);
        }

        // Pulls the bibliography data from the backend

    }, {
        key: "getBibliographyData",
        value: function getBibliographyData() {
            var _this4 = this;

            getTitlesFromGraph().then(function (bibliographyData) {
                _this4.setState({ bibliographyData: bibliographyData });
            });
        }

        // Used for the export bibliography button

    }, {
        key: "exportData",
        value: function exportData() {
            this.setState({ displayExport: true });
        }
    }, {
        key: "resetDisplayExport",
        value: function resetDisplayExport() {
            this.setState({ displayExport: false });
        }
    }, {
        key: "resetSelectedNode",
        value: function resetSelectedNode() {
            this.setState({ selectedNode: null });
        }
    }, {
        key: "setSelectedNode",
        value: function setSelectedNode(url) {
            var curProject = this.state.graph.curProject;
            this.setState({ selectedNode: this.state.graph[curProject][url] });
        }
    }, {
        key: "closePageView",
        value: function closePageView() {
            // Only call switchForm if the notes form is showing
            if (this.state.showNewNotesForm) {
                this.switchShowNewNotesForm();
            }

            this.resetSelectedNode();
        }

        // Set selected node for the detailed view

    }, {
        key: "handleClickedNode",
        value: function handleClickedNode(id) {
            var visCloseButton = document.getElementsByClassName("vis-close")[0];
            // Only open modal outside of edit mode
            if (getComputedStyle(visCloseButton).display === "none") {
                this.setSelectedNode(id);
            }
        }
    }, {
        key: "deleteNode",
        value: function deleteNode(data, callback) {
            var nodeId = data.nodes[0];
            removeItemFromGraph(nodeId).then(function () {
                callback(data);
            });
        }
    }, {
        key: "addNode",
        value: function addNode(nodeData, callback) {
            this.setState({
                showNewNodeForm: !this.state.showNewNodeForm,
                newNodeData: nodeData
            });
        }
    }, {
        key: "deleteEdge",
        value: function deleteEdge(data, callback) {
            var _this5 = this;

            var edgeId = data.edges[0];
            var connectedNodes = this.state.visNetwork.getConnectedNodes(edgeId);
            removeEdgeFromGraph(connectedNodes[0], connectedNodes[1]).then(function () {
                _this5.getDataFromServer();
                callback(data);
            });
            callback(data);
        }
    }, {
        key: "addEdge",
        value: function addEdge(edgeData, callback) {
            var _this6 = this;

            if (edgeData.from !== edgeData.to) {
                // Ensure that user isn't adding self edge
                addEdgeToGraph(edgeData.from, edgeData.to).then(function () {
                    _this6.getDataFromServer();
                    callback(edgeData);
                });
            }
        }
    }, {
        key: "switchShowNewNodeForm",
        value: function switchShowNewNodeForm() {
            this.setState({ showNewNodeForm: !this.state.showNewNodeForm });
        }
    }, {
        key: "switchShowNewNotesForm",
        value: function switchShowNewNotesForm() {
            document.getElementById("new-notes-form").reset();
            this.setState({ showNewNotesForm: !this.state.showNewNotesForm });
        }
    }, {
        key: "openProjectsSidebar",
        value: function openProjectsSidebar() {
            this.setState({ showProjectsSidebar: true });
            document.getElementById("projects-sidebar").style.width = "400px";
            document.getElementById("projects-sidebar-btn").style.right = "400px";
        }
    }, {
        key: "closeProjectsSidebar",
        value: function closeProjectsSidebar() {
            this.setState({ showProjectsSidebar: false });
            document.getElementById("projects-sidebar").style.width = "0";
            document.getElementById("projects-sidebar-btn").style.right = "0";
        }
    }, {
        key: "closeNewNodeForm",
        value: function closeNewNodeForm() {
            document.getElementById("new-node-form").reset();
            this.switchShowNewNodeForm();
        }
    }, {
        key: "setFullSearchResults",
        value: function setFullSearchResults(results) {
            this.setState({ fullSearchResults: results });
        }
    }, {
        key: "resetFullSearchResults",
        value: function resetFullSearchResults() {
            document.getElementById("search-text").value = ""; // Reset the search bar
            this.highlightNodes(null); // Reset highlighted nodes
            this.setState({ fullSearchResults: null });
        }

        /**
         * Visually highlights nodes by changing colors and opacity
         * @param nodesToHighlight an array of ids of the nodes to be highlighted
         */

    }, {
        key: "highlightNodes",
        value: function highlightNodes(nodesToHighlight) {
            var _this7 = this;

            // If the list is null, reset all nodes to the default
            if (nodesToHighlight === null) {
                this.state.visNodes.forEach(function (node) {
                    node.opacity = 1;
                    node.color = {
                        background: nodeBackgroundDefaultColor
                    };
                    _this7.state.visNodes.update(node);
                });
                return;
            }

            // If list is not null, highlight based on the list
            this.state.visNodes.forEach(function (node) {
                if (!nodesToHighlight.includes(node.id)) {
                    node.opacity = 0.3;
                } else {
                    node.opacity = 1;
                    node.color = {
                        background: nodeHighlightDefaultColor
                    };
                }
                _this7.state.visNodes.update(node);
            });
        }

        /**
         * Given a text query, this function searches the current project for occurrences of that query. If the query is
         * empty, the function returns null. Else, the function returns an array of objects
         * that represent the occurrences of the query on each node of the current project.
         * @param query the query to be searched
         * @param filterList a list of node keys that whose contents will be included in the search
         * @returns {null|[]} null if the query is empty, else array of result objects
         */

    }, {
        key: "getSearchResults",
        value: function getSearchResults(query, filterList) {
            // Return null for empty queries
            if (query === "") {
                return null;
            }

            var curProject = this.state.graph.curProject;
            var graph = this.state.graph[curProject];

            var results = [];
            query = Utils.trimString(query); // trim it
            query = query.toLowerCase();
            for (var graphKey in graph) {
                var node = graph[graphKey];
                var occurrences = [];
                var occurrencesCount = 0;
                // Iterate through the keys inside the node
                for (var nodeKey in node) {
                    // Act depending on the type of node[key]
                    var elem = node[nodeKey];
                    if (typeof elem === "number") break; // Ignore pure numbers
                    if (Array.isArray(elem)) elem = elem.toString(); // Serialize arrays for search (notes, highlights, ...)
                    elem = elem.toLowerCase(); // Lower case for case-insensitive search

                    if (filterList.includes(nodeKey)) {
                        // Check if query is present
                        var indices = Utils.getIndicesOf(query, elem);
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
                    results.push({
                        url: node.source,
                        occurrences: occurrences,
                        occurrencesCount: occurrencesCount
                    });
                }
            }
            return results;
        }
    }, {
        key: "basicSearch",
        value: function basicSearch(query, filterList) {
            // REMOVE STARTING HERE
            var curProject = this.state.graph.curProject;
            var graph = this.state.graph[curProject];
            var nodeList = Object.keys(graph);
            filterList = Object.keys(graph[nodeList[0]]);
            // STOP REMOVING

            var results = this.getSearchResults(query, filterList);
            if (results === null) {
                // If results are null, the query was empty
                this.highlightNodes(results);
            } else {
                // Construct array of IDs based on the results
                var resultIDs = [];
                results.forEach(function (result) {
                    return resultIDs.push(result.url);
                });
                // Highlight results
                this.highlightNodes(resultIDs);
            }
        }
    }, {
        key: "fullSearch",
        value: function fullSearch(query, filterList) {
            // REMOVE STARTING HERE
            var curProject = this.state.graph.curProject;
            var graph = this.state.graph[curProject];
            var nodeList = Object.keys(graph);
            filterList = Object.keys(graph[nodeList[0]]);
            // STOP REMOVING

            var searchResults = this.getSearchResults(query, filterList);
            // Sort so that results with the most occurrences are at the top
            searchResults.sort(function (a, b) {
                return a.occurrencesCount >= b.occurrencesCount ? -1 : 1;
            });
            this.setFullSearchResults(searchResults);
            console.log(searchResults);
        }

        /* Helper function to generate position for nodes
        This function adds an offset to  the randomly generated position based on the
        position of the node's parent (if it has one)
         */

    }, {
        key: "generateNodePositions",
        value: function generateNodePositions(node) {
            var xOffset = 0;
            var yOffset = 0;
            // Update the offset if the node has a parent
            if (node.prevURLs.length !== 0) {
                var prevURL = node.prevURLs[0];
                var curProject = this.state.graph.curProject;
                var prevNode = this.state.graph[curProject][prevURL];
                // Check if the previous node has defined coordinates
                if (prevNode.x !== null && prevNode.y !== null) {
                    xOffset = prevNode.x;
                    yOffset = prevNode.y;
                }
            }
            // Helper variable to generate random positions
            var rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
            // Generate random positions
            var xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
            var yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

            // Return positions with offset
            return [xRandom + xOffset, yRandom + yOffset];
        }

        // Helper function to setup the nodes and edges for the graph

    }, {
        key: "createNodesAndEdges",
        value: function createNodesAndEdges() {
            var nodes = new vis.DataSet();
            var edges = new vis.DataSet();
            var curProject = this.state.graph.curProject;
            // Iterate through each node in the graph and build the arrays of nodes and edges
            for (var index in this.state.graph[curProject]) {
                var node = this.state.graph[curProject][index];
                // Deal with positions
                if (node.x === null || node.y === null || node.x === undefined || node.y === undefined) {
                    // If position is still undefined, generate random x and y in interval [-300, 300]
                    var _generateNodePosition = this.generateNodePositions(node),
                        _generateNodePosition2 = _slicedToArray(_generateNodePosition, 2),
                        x = _generateNodePosition2[0],
                        y = _generateNodePosition2[1];

                    nodes.add({ id: node.source, label: node.title, x: x, y: y });
                } else {
                    nodes.add({ id: node.source, label: node.title, x: node.x, y: node.y });
                }
                // Deal with edges
                for (var nextIndex in node.nextURLs) {
                    edges.add({ from: node.source, to: node.nextURLs[nextIndex] });
                }
            }
            // console.log(nodes);
            // console.log(edges);
            this.setState({ visNodes: nodes, visEdges: edges });
            return [nodes, edges];
        }

        // Main function to set up the vis-network object

    }, {
        key: "setupVisGraph",
        value: function setupVisGraph() {
            var _this8 = this;

            var _createNodesAndEdges = this.createNodesAndEdges(),
                _createNodesAndEdges2 = _slicedToArray(_createNodesAndEdges, 2),
                nodes = _createNodesAndEdges2[0],
                edges = _createNodesAndEdges2[1];

            // create a network


            var container = document.getElementById("graph");
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
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
            var network = new vis.Network(container, data, options);
            network.fit(); // Zoom in or out to fit entire network on screen

            // Store all positions
            var positions = network.getPositions();
            updateAllPositionsInGraph(positions);

            // Handle click vs drag
            network.on("click", function (params) {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    var nodeId = params.nodes[0];
                    _this8.handleClickedNode(nodeId);
                }
            });

            // Stop auto refresh while dragging
            network.on("dragStart", function () {
                // this.setState({autoRefresh: false});
            });

            // Update positions after dragging node
            network.on("dragEnd", function () {
                // Only update positions if there is a selected node
                if (network.getSelectedNodes().length !== 0) {
                    var url = network.getSelectedNodes()[0];
                    var position = network.getPosition(url);
                    var x = position.x;
                    var y = position.y;
                    updatePositionOfNode(url, x, y);
                }
                // this.setState({autoRefresh: true});
            });

            // Store the network
            this.setState({ visNetwork: network });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this9 = this;

            this.getDataFromServer();
            this.checkIfLocalServer();
            // Add listener to refresh the page when the tab is clicked
            chrome.tabs.onActivated.addListener(function (activeInfo) {
                chrome.tabs.get(activeInfo.tabId, function (tab) {
                    if (tab.title === "Knolist") {
                        // Update data
                        _this9.getDataFromServer();
                    }
                });
            });
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

    }, {
        key: "render",
        value: function render() {
            if (this.state.graph === null) return null;

            // Only show mind map outside of full search mode
            var graphStyle = { display: "block" };
            if (this.state.fullSearchResults !== null) graphStyle = { display: "none" };

            var curProject = this.state.graph.curProject;
            return React.createElement(
                "div",
                null,
                React.createElement(Header, { projectName: curProject, refresh: this.getDataFromServer,
                    showProjectsSidebar: this.state.showProjectsSidebar,
                    openProjectsSidebar: this.openProjectsSidebar,
                    closeProjectsSidebar: this.closeProjectsSidebar }),
                React.createElement(
                    "div",
                    { className: "main-body" },
                    React.createElement(
                        "div",
                        { id: "buttons-bar" },
                        React.createElement(RefreshGraphButton, { refresh: this.getDataFromServer }),
                        React.createElement(SearchBar, { basicSearch: this.basicSearch, fullSearch: this.fullSearch }),
                        React.createElement(ExportGraphButton, { "export": this.exportData })
                    ),
                    React.createElement("div", { id: "graph", style: graphStyle }),
                    React.createElement(FullSearchResults, { fullSearchResults: this.state.fullSearchResults,
                        graph: this.state.graph[curProject],
                        resetFullSearchResults: this.resetFullSearchResults }),
                    React.createElement(ProjectsSidebar, { graph: this.state.graph, refresh: this.getDataFromServer }),
                    React.createElement(NewNodeForm, { showNewNodeForm: this.state.showNewNodeForm, nodeData: this.state.newNodeData,
                        localServer: this.state.localServer, closeForm: this.closeNewNodeForm,
                        refresh: this.getDataFromServer }),
                    React.createElement(PageView, { graph: this.state.graph[curProject], selectedNode: this.state.selectedNode,
                        resetSelectedNode: this.resetSelectedNode, setSelectedNode: this.setSelectedNode,
                        refresh: this.getDataFromServer, closePageView: this.closePageView,
                        showNewNotesForm: this.state.showNewNotesForm,
                        switchShowNewNotesForm: this.switchShowNewNotesForm }),
                    React.createElement(ExportView, { bibliographyData: this.state.bibliographyData, shouldShow: this.state.displayExport,
                        resetDisplayExport: this.resetDisplayExport })
                )
            );
        }
    }]);

    return KnolistComponents;
}(React.Component);

var FullSearchResults = function (_React$Component2) {
    _inherits(FullSearchResults, _React$Component2);

    function FullSearchResults(props) {
        _classCallCheck(this, FullSearchResults);

        var _this10 = _possibleConstructorReturn(this, (FullSearchResults.__proto__ || Object.getPrototypeOf(FullSearchResults)).call(this, props));

        _this10.state = {
            expandedSearchResult: null
        };

        _this10.setExpandedSearchResult = _this10.setExpandedSearchResult.bind(_this10);
        _this10.resetExpandedSearchResult = _this10.resetExpandedSearchResult.bind(_this10);
        _this10.closeSearch = _this10.closeSearch.bind(_this10);
        return _this10;
    }

    _createClass(FullSearchResults, [{
        key: "setExpandedSearchResult",
        value: function setExpandedSearchResult(url) {
            this.setState({ expandedSearchResult: url });
        }
    }, {
        key: "resetExpandedSearchResult",
        value: function resetExpandedSearchResult() {
            this.setState({ expandedSearchResult: null });
        }
    }, {
        key: "closeSearch",
        value: function closeSearch() {
            this.resetExpandedSearchResult();
            this.props.resetFullSearchResults();
        }
    }, {
        key: "render",
        value: function render() {
            var _this11 = this;

            if (this.props.fullSearchResults === null) return null;

            var noResultsMessage = "Sorry, we couldn't find any results for your search.";
            var searchResultsMessage = "Search results";

            return React.createElement(
                "div",
                { id: "full-search-results-area" },
                React.createElement(
                    "div",
                    { style: { display: "flex", marginBottom: "20px" } },
                    React.createElement(
                        "button",
                        { className: "button", onClick: this.closeSearch },
                        React.createElement("img", { src: "../../images/back-icon-black.png", alt: "Return" })
                    ),
                    React.createElement(
                        "h2",
                        null,
                        this.props.fullSearchResults.length === 0 ? noResultsMessage : searchResultsMessage
                    )
                ),
                this.props.fullSearchResults.map(function (result) {
                    return React.createElement(SearchResultItem, { key: result.url,
                        item: _this11.props.graph[result.url],
                        expandedSearchResult: _this11.state.expandedSearchResult,
                        result: result,
                        setExpandedSearchResult: _this11.setExpandedSearchResult,
                        resetExpandedSearchResult: _this11.resetExpandedSearchResult });
                })
            );
        }
    }]);

    return FullSearchResults;
}(React.Component);

var SearchResultItem = function (_React$Component3) {
    _inherits(SearchResultItem, _React$Component3);

    function SearchResultItem(props) {
        _classCallCheck(this, SearchResultItem);

        var _this12 = _possibleConstructorReturn(this, (SearchResultItem.__proto__ || Object.getPrototypeOf(SearchResultItem)).call(this, props));

        _this12.itemAction = _this12.itemAction.bind(_this12);
        return _this12;
    }

    _createClass(SearchResultItem, [{
        key: "itemAction",
        value: function itemAction() {
            if (this.props.expandedSearchResult === this.props.result.url) this.props.resetExpandedSearchResult();else this.props.setExpandedSearchResult(this.props.result.url);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { onClick: this.itemAction, className: "search-result-item" },
                React.createElement(
                    "h3",
                    null,
                    this.props.item.title
                ),
                React.createElement(
                    "p",
                    null,
                    this.props.result.occurrencesCount,
                    " ",
                    this.props.result.occurrencesCount > 1 ? "occurrences" : "occurrence"
                ),
                React.createElement(ExpandedSearchResultData, { display: this.props.expandedSearchResult === this.props.result.url })
            );
        }
    }]);

    return SearchResultItem;
}(React.Component);

/**
 * @return {null}
 */


function ExpandedSearchResultData(props) {
    if (!props.display) return null;

    return React.createElement(
        "p",
        null,
        "Expanded!"
    );
}

// Sidebar to switch between projects

var ProjectsSidebar = function (_React$Component4) {
    _inherits(ProjectsSidebar, _React$Component4);

    function ProjectsSidebar(props) {
        _classCallCheck(this, ProjectsSidebar);

        var _this13 = _possibleConstructorReturn(this, (ProjectsSidebar.__proto__ || Object.getPrototypeOf(ProjectsSidebar)).call(this, props));

        _this13.state = {
            showNewProjectForm: false,
            projectForDeletion: null,
            alertMessage: null,
            invalidTitle: null
        };

        _this13.switchShowNewProjectForm = _this13.switchShowNewProjectForm.bind(_this13);
        _this13.setProjectForDeletion = _this13.setProjectForDeletion.bind(_this13);
        _this13.resetProjectForDeletion = _this13.resetProjectForDeletion.bind(_this13);
        _this13.setAlertMessage = _this13.setAlertMessage.bind(_this13);
        _this13.setInvalidTitle = _this13.setInvalidTitle.bind(_this13);
        return _this13;
    }

    _createClass(ProjectsSidebar, [{
        key: "setAlertMessage",
        value: function setAlertMessage(value) {
            this.setState({ alertMessage: value });
        }
    }, {
        key: "setInvalidTitle",
        value: function setInvalidTitle(value) {
            this.setState({ invalidTitle: value });
        }
    }, {
        key: "setProjectForDeletion",
        value: function setProjectForDeletion(project) {
            this.setState({ projectForDeletion: project });
        }
    }, {
        key: "resetProjectForDeletion",
        value: function resetProjectForDeletion() {
            this.setState({ projectForDeletion: null });
        }
    }, {
        key: "switchShowNewProjectForm",
        value: function switchShowNewProjectForm() {
            document.getElementById("new-project-form").reset();
            this.setState({
                showNewProjectForm: !this.state.showNewProjectForm,
                alertMessage: null,
                invalidTitle: null
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this14 = this;

            return React.createElement(
                "div",
                { id: "projects-sidebar", className: "sidebar" },
                React.createElement(
                    "div",
                    { id: "sidebar-header" },
                    React.createElement(
                        "h1",
                        { id: "sidebar-title" },
                        "Your Projects"
                    ),
                    React.createElement(NewProjectButton, { showForm: this.state.showNewProjectForm,
                        switchShowForm: this.switchShowNewProjectForm })
                ),
                React.createElement(
                    "div",
                    { id: "sidebar-content" },
                    Object.keys(this.props.graph).map(function (project) {
                        return React.createElement(ProjectItem, { key: project, graph: _this14.props.graph,
                            project: project,
                            refresh: _this14.props.refresh,
                            setForDeletion: _this14.setProjectForDeletion });
                    }),
                    React.createElement(NewProjectForm, { showNewProjectForm: this.state.showNewProjectForm, refresh: this.props.refresh,
                        switchForm: this.switchShowNewProjectForm,
                        setAlertMessage: this.setAlertMessage,
                        setInvalidTitle: this.setInvalidTitle,
                        alertMessage: this.state.alertMessage,
                        invalidTitle: this.state.invalidTitle,
                        projects: Object.keys(this.props.graph) }),
                    React.createElement(ConfirmProjectDeletionWindow, { project: this.state.projectForDeletion,
                        resetForDeletion: this.resetProjectForDeletion,
                        refresh: this.props.refresh })
                )
            );
        }
    }]);

    return ProjectsSidebar;
}(React.Component);

// Confirmation window before a project is deleted


var ConfirmProjectDeletionWindow = function (_React$Component5) {
    _inherits(ConfirmProjectDeletionWindow, _React$Component5);

    function ConfirmProjectDeletionWindow(props) {
        _classCallCheck(this, ConfirmProjectDeletionWindow);

        var _this15 = _possibleConstructorReturn(this, (ConfirmProjectDeletionWindow.__proto__ || Object.getPrototypeOf(ConfirmProjectDeletionWindow)).call(this, props));

        _this15.deleteProject = _this15.deleteProject.bind(_this15);
        return _this15;
    }

    _createClass(ConfirmProjectDeletionWindow, [{
        key: "deleteProject",
        value: function deleteProject() {
            var _this16 = this;

            this.props.resetForDeletion();
            deleteProjectFromGraph(this.props.project).then(function () {
                return _this16.props.refresh();
            });
        }
    }, {
        key: "render",
        value: function render() {
            if (this.props.project === null) {
                return null;
            }
            return React.createElement(
                "div",
                { className: "modal" },
                React.createElement(
                    "div",
                    { id: "delete-confirmation-modal", className: "modal-content" },
                    React.createElement("img", { src: "../../images/alert-icon-black.png", alt: "Alert icon",
                        style: { width: "30%", display: "block", marginLeft: "auto", marginRight: "auto" } }),
                    React.createElement(
                        "h1",
                        null,
                        "Are you sure you want to delete \"",
                        this.props.project,
                        "\"?"
                    ),
                    React.createElement(
                        "h3",
                        null,
                        "This action cannot be undone."
                    ),
                    React.createElement(
                        "div",
                        { style: { display: "flex", justifyContent: "space-between" } },
                        React.createElement(
                            "button",
                            { className: "button confirmation-button", onClick: this.deleteProject },
                            "Yes, delete it!"
                        ),
                        React.createElement(
                            "button",
                            { className: "button confirmation-button", onClick: this.props.resetForDeletion },
                            "Cancel"
                        )
                    )
                )
            );
        }
    }]);

    return ConfirmProjectDeletionWindow;
}(React.Component);

// Button used to open the "create project" form


function NewProjectButton(props) {
    if (props.showForm) {
        return React.createElement(
            "button",
            { className: "button new-project-button cancel-new-project", onClick: props.switchShowForm },
            React.createElement(
                "p",
                null,
                "Cancel"
            )
        );
    }
    return React.createElement(
        "button",
        { className: "button new-project-button", onClick: props.switchShowForm },
        React.createElement("img", { src: "../../images/add-icon-white.png", alt: "New" })
    );
}

// Form to create a new project

var NewProjectForm = function (_React$Component6) {
    _inherits(NewProjectForm, _React$Component6);

    function NewProjectForm(props) {
        _classCallCheck(this, NewProjectForm);

        var _this17 = _possibleConstructorReturn(this, (NewProjectForm.__proto__ || Object.getPrototypeOf(NewProjectForm)).call(this, props));

        _this17.handleSubmit = _this17.handleSubmit.bind(_this17);
        return _this17;
    }

    _createClass(NewProjectForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this18 = this;

            // Prevent page from reloading
            event.preventDefault();

            // Data validation
            var title = event.target.newProjectTitle.value;
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
                createNewProjectInGraph(title).then(function () {
                    return _this18.props.refresh();
                });

                // Reset entry and close form
                event.target.reset();
                // Close the form
                this.props.switchForm();
                // Hide alert message if there was one
                this.props.setAlertMessage(null);
                this.props.setInvalidTitle(null);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var style = { display: "none" };
            if (this.props.showNewProjectForm) {
                style = { display: "block" };
            }
            return React.createElement(
                "div",
                { style: style, className: "project-item new-project-form-area" },
                React.createElement(
                    "form",
                    { id: "new-project-form", onSubmit: this.handleSubmit },
                    React.createElement("input", { type: "text", id: "newProjectTitle", name: "newProjectTitle", defaultValue: "New Project", required: true }),
                    React.createElement(
                        "button",
                        { className: "button create-project-button" },
                        "Create"
                    )
                ),
                React.createElement(ProjectTitleAlertMessage, { alertMessage: this.props.alertMessage,
                    projectTitle: this.props.invalidTitle })
            );
        }
    }]);

    return NewProjectForm;
}(React.Component);

/** Alert message for invalid project names
 * @return {null}
 */


function ProjectTitleAlertMessage(props) {
    if (props.alertMessage === "invalid-title") {
        return React.createElement(
            "p",
            null,
            props.projectTitle,
            " is not a valid title."
        );
    }

    if (props.alertMessage === "repeated-title") {
        return React.createElement(
            "p",
            null,
            "You already have a project called ",
            props.projectTitle,
            "."
        );
    }

    return null;
}

// Visualization of a project in the sidebar, used to switch active projects

var ProjectItem = function (_React$Component7) {
    _inherits(ProjectItem, _React$Component7);

    function ProjectItem(props) {
        _classCallCheck(this, ProjectItem);

        var _this19 = _possibleConstructorReturn(this, (ProjectItem.__proto__ || Object.getPrototypeOf(ProjectItem)).call(this, props));

        _this19.switchProject = _this19.switchProject.bind(_this19);
        _this19.deleteProject = _this19.deleteProject.bind(_this19);
        return _this19;
    }

    _createClass(ProjectItem, [{
        key: "switchProject",
        value: function switchProject(data) {
            var _this20 = this;

            // Only switch if the click was on the item, not on the delete button
            if (data.target.className === "project-item" || data.target.tagName === "H2") {
                setCurrentProjectInGraph(this.props.project).then(function () {
                    return _this20.props.refresh();
                });
            }
        }
    }, {
        key: "deleteProject",
        value: function deleteProject() {
            this.props.setForDeletion(this.props.project);
        }
    }, {
        key: "render",
        value: function render() {
            var project = this.props.project;
            // Ignore properties that are not project names
            if (project === "version" || project === "curProject") {
                return null;
            }
            // Display the active project in a different color and show more info
            if (project === this.props.graph.curProject) {
                return React.createElement(
                    "div",
                    { className: "project-item active-project", onClick: this.switchProject },
                    React.createElement(
                        "h2",
                        null,
                        this.props.project
                    ),
                    React.createElement(
                        "button",
                        { className: "button delete-project-button", onClick: this.deleteProject },
                        React.createElement("img", { src: "../../images/delete-icon-white.png", alt: "Delete node" })
                    )
                );
            }
            // Display other projects
            return React.createElement(
                "div",
                { className: "project-item", onClick: this.switchProject },
                React.createElement(
                    "h2",
                    null,
                    this.props.project
                ),
                React.createElement(
                    "button",
                    { className: "button delete-project-button", onClick: this.deleteProject },
                    React.createElement("img", { src: "../../images/delete-icon-white.png", alt: "Delete node" })
                )
            );
        }
    }]);

    return ProjectItem;
}(React.Component);

// Form that allows the user to manually add nodes


var NewNodeForm = function (_React$Component8) {
    _inherits(NewNodeForm, _React$Component8);

    function NewNodeForm(props) {
        _classCallCheck(this, NewNodeForm);

        var _this21 = _possibleConstructorReturn(this, (NewNodeForm.__proto__ || Object.getPrototypeOf(NewNodeForm)).call(this, props));

        _this21.handleSubmit = _this21.handleSubmit.bind(_this21);
        return _this21;
    }

    _createClass(NewNodeForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this22 = this;

            event.preventDefault(); // Stop page from reloading
            // Call from server
            var baseServerURL = deployedServerURL;
            if (this.props.localServer) {
                // Use local server if it's active
                baseServerURL = localServerURL;
            }
            var contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(event.target.url.value);
            $.getJSON(contentExtractionURL, function (item) {
                addItemToGraph(item, "").then(function () {
                    return updatePositionOfNode(item.source, _this22.props.nodeData.x, _this22.props.nodeData.y);
                }).then(function () {
                    return _this22.props.refresh();
                });
            });

            this.props.closeForm();
            event.target.reset(); // Clear the form entries
        }
    }, {
        key: "render",
        value: function render() {
            var style = { display: "none" };
            if (this.props.showNewNodeForm) {
                style = { display: "block" };
            }
            return React.createElement(
                "div",
                { className: "modal", style: style },
                React.createElement(
                    "div",
                    { className: "modal-content" },
                    React.createElement(
                        "button",
                        { className: "close-modal button", onClick: this.props.closeForm },
                        React.createElement("img", { src: "../../images/close-icon-black.png", alt: "Close" })
                    ),
                    React.createElement(
                        "h1",
                        null,
                        "Add new node"
                    ),
                    React.createElement(
                        "form",
                        { id: "new-node-form", onSubmit: this.handleSubmit },
                        React.createElement("input", { id: "url", name: "url", type: "url", placeholder: "Insert URL", required: true }),
                        React.createElement("br", null),
                        React.createElement(
                            "button",
                            { className: "button", style: { width: 100 } },
                            "Add node"
                        )
                    )
                )
            );
        }
    }]);

    return NewNodeForm;
}(React.Component);

// Detailed view of a specific node


var PageView = function (_React$Component9) {
    _inherits(PageView, _React$Component9);

    function PageView(props) {
        _classCallCheck(this, PageView);

        var _this23 = _possibleConstructorReturn(this, (PageView.__proto__ || Object.getPrototypeOf(PageView)).call(this, props));

        _this23.deleteNode = _this23.deleteNode.bind(_this23);
        return _this23;
    }

    _createClass(PageView, [{
        key: "deleteNode",
        value: function deleteNode() {
            var _this24 = this;

            // Remove from the graph
            removeItemFromGraph(this.props.selectedNode.source).then(function () {
                // Reset the selected node
                _this24.props.resetSelectedNode();
                _this24.props.refresh();
            });
        }
    }, {
        key: "render",
        value: function render() {
            // Don't render if selectedNode is null or undefined
            if (this.props.selectedNode === null || this.props.selectedNode === undefined) {
                return null;
            }

            // Don't render if selectedNode doesn't belong to curProject (to allow for CU-96hk2k)
            if (!this.props.graph.hasOwnProperty(this.props.selectedNode.source)) {
                return null;
            }

            return React.createElement(
                "div",
                { id: "page-view", className: "modal" },
                React.createElement(
                    "div",
                    { className: "modal-content" },
                    React.createElement(
                        "button",
                        { className: "close-modal button", id: "close-page-view",
                            onClick: this.props.closePageView },
                        React.createElement("img", { src: "../../images/close-icon-black.png", alt: "Close" })
                    ),
                    React.createElement(
                        "a",
                        { href: this.props.selectedNode.source, target: "_blank" },
                        React.createElement(
                            "h1",
                            null,
                            this.props.selectedNode.title
                        )
                    ),
                    React.createElement(HighlightsList, { highlights: this.props.selectedNode.highlights }),
                    React.createElement(NotesList, { showNewNotesForm: this.props.showNewNotesForm,
                        switchShowNewNotesForm: this.props.switchShowNewNotesForm,
                        selectedNode: this.props.selectedNode, refresh: this.props.refresh }),
                    React.createElement(
                        "div",
                        { style: { display: "flex" } },
                        React.createElement(ListURL, { type: "prev", graph: this.props.graph, selectedNode: this.props.selectedNode,
                            setSelectedNode: this.props.setSelectedNode }),
                        React.createElement(ListURL, { type: "next", graph: this.props.graph, selectedNode: this.props.selectedNode,
                            setSelectedNode: this.props.setSelectedNode })
                    ),
                    React.createElement(
                        "div",
                        { style: { textAlign: "right" } },
                        React.createElement(
                            "button",
                            { className: "button", onClick: this.deleteNode },
                            React.createElement("img", { src: "../../images/delete-icon-black.png", alt: "Delete node" })
                        )
                    )
                )
            );
        }
    }]);

    return PageView;
}(React.Component);

// Bibliography export


var ExportView = function (_React$Component10) {
    _inherits(ExportView, _React$Component10);

    function ExportView(props) {
        _classCallCheck(this, ExportView);

        return _possibleConstructorReturn(this, (ExportView.__proto__ || Object.getPrototypeOf(ExportView)).call(this, props));
    }

    _createClass(ExportView, [{
        key: "render",
        value: function render() {
            if (this.props.shouldShow === false) {
                return null;
            }
            return React.createElement(
                "div",
                { className: "modal" },
                React.createElement(
                    "div",
                    { className: "modal-content" },
                    React.createElement(
                        "button",
                        { className: "close-modal button", id: "close-page-view",
                            onClick: this.props.resetDisplayExport },
                        React.createElement("img", { src: "../../images/close-icon-black.png", alt: "Close" })
                    ),
                    React.createElement(
                        "h1",
                        null,
                        "Export for Bibliography"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.bibliographyData.map(function (item) {
                            return React.createElement(
                                "li",
                                { key: item.url },
                                item.title,
                                ", ",
                                item.url
                            );
                        })
                    )
                )
            );
        }
    }]);

    return ExportView;
}(React.Component);

// List of URLs in the detailed page view


var ListURL = function (_React$Component11) {
    _inherits(ListURL, _React$Component11);

    function ListURL(props) {
        _classCallCheck(this, ListURL);

        return _possibleConstructorReturn(this, (ListURL.__proto__ || Object.getPrototypeOf(ListURL)).call(this, props));
    }

    _createClass(ListURL, [{
        key: "render",
        value: function render() {
            var _this27 = this;

            if (this.props.type === "prev") {
                return React.createElement(
                    "div",
                    { className: "url-column" },
                    React.createElement(
                        "h2",
                        { style: { textAlign: "center" } },
                        "Previous Connections"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.selectedNode.prevURLs.map(function (url, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                React.createElement(
                                    "a",
                                    { href: "#",
                                        onClick: function onClick() {
                                            return _this27.props.setSelectedNode(url);
                                        } },
                                    _this27.props.graph[url].title
                                )
                            );
                        })
                    )
                );
            } else if (this.props.type === "next") {
                return React.createElement(
                    "div",
                    { className: "url-column" },
                    React.createElement(
                        "h2",
                        { style: { textAlign: "center" } },
                        "Next Connections"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.selectedNode.nextURLs.map(function (url, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                React.createElement(
                                    "a",
                                    { href: "#",
                                        onClick: function onClick() {
                                            return _this27.props.setSelectedNode(url);
                                        } },
                                    _this27.props.graph[url].title
                                )
                            );
                        })
                    )
                );
            } else return null;
        }
    }]);

    return ListURL;
}(React.Component);

// List of highlights in the detailed page view


var HighlightsList = function (_React$Component12) {
    _inherits(HighlightsList, _React$Component12);

    function HighlightsList(props) {
        _classCallCheck(this, HighlightsList);

        return _possibleConstructorReturn(this, (HighlightsList.__proto__ || Object.getPrototypeOf(HighlightsList)).call(this, props));
    }

    _createClass(HighlightsList, [{
        key: "render",
        value: function render() {
            if (this.props.highlights.length !== 0) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "h2",
                        null,
                        "My Highlights"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.highlights.map(function (highlight, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                highlight
                            );
                        })
                    )
                );
            }
            return React.createElement(
                "h2",
                null,
                "You haven't added any highlights yet."
            );
        }
    }]);

    return HighlightsList;
}(React.Component);

// List of notes in the detailed page view


var NotesList = function (_React$Component13) {
    _inherits(NotesList, _React$Component13);

    function NotesList(props) {
        _classCallCheck(this, NotesList);

        var _this29 = _possibleConstructorReturn(this, (NotesList.__proto__ || Object.getPrototypeOf(NotesList)).call(this, props));

        _this29.handleSubmit = _this29.handleSubmit.bind(_this29);
        return _this29;
    }

    _createClass(NotesList, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this30 = this;

            event.preventDefault();
            addNotesToItemInGraph(this.props.selectedNode, event.target.notes.value).then(function () {
                _this30.props.refresh();
            });
            this.props.switchShowNewNotesForm();
            event.target.reset(); // Clear the form entries
        }
    }, {
        key: "render",
        value: function render() {
            if (this.props.selectedNode.notes.length !== 0) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { style: { display: "flex" } },
                        React.createElement(
                            "h2",
                            null,
                            "My Notes"
                        ),
                        React.createElement(NewNotesButton, { showForm: this.props.showNewNotesForm,
                            switchShowForm: this.props.switchShowNewNotesForm })
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.selectedNode.notes.map(function (notes, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                notes
                            );
                        })
                    ),
                    React.createElement(NewNotesForm, { handleSubmit: this.handleSubmit, showNewNotesForm: this.props.showNewNotesForm })
                );
            }
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { style: { display: "flex" } },
                    React.createElement(
                        "h2",
                        null,
                        "You haven't added any notes yet."
                    ),
                    React.createElement(NewNotesButton, { showForm: this.props.showNewNotesForm,
                        switchShowForm: this.props.switchShowNewNotesForm })
                ),
                React.createElement(NewNotesForm, { handleSubmit: this.handleSubmit, showNewNotesForm: this.props.showNewNotesForm })
            );
        }
    }]);

    return NotesList;
}(React.Component);

function NewNotesForm(props) {
    // Hidden form for adding notes
    var style = { display: "none" };
    if (props.showNewNotesForm) {
        style = { display: "block" };
    }

    return React.createElement(
        "form",
        { id: "new-notes-form", onSubmit: props.handleSubmit, style: style },
        React.createElement("input", { id: "notes", name: "notes", type: "text", placeholder: "Insert Notes", required: true }),
        React.createElement(
            "button",
            { className: "button add-note-button cancel-new-project", style: { marginTop: 0, marginBottom: 0 } },
            "Add"
        )
    );
}

// Button used to open the "create project" form
function NewNotesButton(props) {
    if (props.showForm) {
        return React.createElement(
            "button",
            { className: "button add-note-button cancel-new-project", onClick: props.switchShowForm },
            React.createElement(
                "p",
                null,
                "Cancel"
            )
        );
    }
    return React.createElement(
        "button",
        { className: "button add-note-button", onClick: props.switchShowForm },
        React.createElement("img", { src: "../../images/add-icon-black.png", alt: "New" })
    );
}

function RefreshGraphButton(props) {
    return React.createElement(
        "button",
        { onClick: props.refresh, className: "button" },
        React.createElement("img", { src: "../../images/refresh-icon.png", alt: "Refresh Button" })
    );
}

var SearchBar = function (_React$Component14) {
    _inherits(SearchBar, _React$Component14);

    function SearchBar(props) {
        _classCallCheck(this, SearchBar);

        var _this31 = _possibleConstructorReturn(this, (SearchBar.__proto__ || Object.getPrototypeOf(SearchBar)).call(this, props));

        _this31.submitSearch = _this31.submitSearch.bind(_this31);
        _this31.searchButtonAction = _this31.searchButtonAction.bind(_this31);
        return _this31;
    }

    _createClass(SearchBar, [{
        key: "searchButtonAction",
        value: function searchButtonAction() {
            var query = document.getElementById("search-text").value;
            if (query !== "") this.props.fullSearch(query);
        }
    }, {
        key: "submitSearch",
        value: function submitSearch(searchInput) {
            if (searchInput.key === "Enter") {
                if (searchInput.target.value !== "") this.props.fullSearch(searchInput.target.value);
            } else {
                this.props.basicSearch(searchInput.target.value);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this32 = this;

            return React.createElement(
                "div",
                { id: "search-bar" },
                React.createElement("input", { id: "search-text", type: "text", onKeyUp: function onKeyUp(searchInput) {
                        return _this32.submitSearch(searchInput);
                    },
                    placeholder: "Search through your project" }),
                React.createElement("img", { onClick: this.searchButtonAction, src: "../../images/search-icon-black.png", alt: "Search" })
            );
        }
    }]);

    return SearchBar;
}(React.Component);

function ExportGraphButton(props) {
    return React.createElement(
        "button",
        { onClick: props.export, className: "button" },
        React.createElement("img", { src: "../../images/share-icon.webp", alt: "Refresh Button" })
    );
}

var Header = function (_React$Component15) {
    _inherits(Header, _React$Component15);

    function Header(props) {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));
    }

    _createClass(Header, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "header" },
                React.createElement(
                    "div",
                    { className: "header-corner-wrapper logo-wrapper" },
                    React.createElement("img", { className: "logo", src: "../../images/horizontal_main.PNG", alt: "Knolist Logo" })
                ),
                React.createElement(
                    "div",
                    { id: "project-name-div" },
                    React.createElement(
                        "h5",
                        { id: "project-name" },
                        "Current Project: ",
                        this.props.projectName
                    )
                ),
                React.createElement(
                    "div",
                    { className: "header-corner-wrapper" },
                    React.createElement(ProjectsSidebarButton, { showSidebar: this.props.showProjectsSidebar,
                        openProjectsSidebar: this.props.openProjectsSidebar,
                        closeProjectsSidebar: this.props.closeProjectsSidebar })
                )
            );
        }
    }]);

    return Header;
}(React.Component);

var ProjectsSidebarButton = function (_React$Component16) {
    _inherits(ProjectsSidebarButton, _React$Component16);

    function ProjectsSidebarButton(props) {
        _classCallCheck(this, ProjectsSidebarButton);

        return _possibleConstructorReturn(this, (ProjectsSidebarButton.__proto__ || Object.getPrototypeOf(ProjectsSidebarButton)).call(this, props));
    }

    _createClass(ProjectsSidebarButton, [{
        key: "render",
        value: function render() {
            if (this.props.showSidebar) {
                return React.createElement(
                    "button",
                    { id: "projects-sidebar-btn", onClick: this.props.closeProjectsSidebar },
                    React.createElement("img", { src: "../../images/close-icon-white.png", alt: "Close", id: "close-sidebar-btn" })
                );
            }
            return React.createElement(
                "button",
                { id: "projects-sidebar-btn", onClick: this.props.openProjectsSidebar },
                React.createElement(
                    "p",
                    null,
                    "Your projects"
                )
            );
        }
    }]);

    return ProjectsSidebarButton;
}(React.Component);

ReactDOM.render(React.createElement(KnolistComponents, null), document.querySelector("#knolist-page"));