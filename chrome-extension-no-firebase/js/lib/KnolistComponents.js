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

// Helper global function for title case
function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

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
            bibliographyData: null, // The data to be exported as bibliography
            showProjectsSidebar: false
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

        // Set up listener to close modals when user clicks outside of them
        window.onclick = function (event) {
            if (event.target.classList.contains("modal")) {
                if (_this.state.selectedNode !== null) {
                    _this.resetSelectedNode();
                }
                if (_this.state.displayExport) {
                    _this.resetDisplayExport();
                }
            }
        };
        return _this;
    }

    // Calls graph.js function to pull the graph from the Chrome storage


    _createClass(KnolistComponents, [{
        key: 'getDataFromServer',
        value: function getDataFromServer() {
            // All the websites as a graph
            getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place

            // window.setTimeout(() => {
            //     if (this.state.autoRefresh) this.getDataFromServer();
            // }, 200);
        }

        // Pulls the bibliography data from the backend

    }, {
        key: 'getBibliographyData',
        value: function getBibliographyData() {
            var _this2 = this;

            getTitlesFromGraph().then(function (bibliographyData) {
                _this2.setState({ bibliographyData: bibliographyData });
            });
        }

        // Used for the export bibliography button

    }, {
        key: 'exportData',
        value: function exportData() {
            this.setState({ displayExport: true });
        }
    }, {
        key: 'resetDisplayExport',
        value: function resetDisplayExport() {
            this.setState({ displayExport: false });
        }
    }, {
        key: 'resetSelectedNode',
        value: function resetSelectedNode() {
            this.setState({ selectedNode: null });
        }

        // Set selected node for the detailed view

    }, {
        key: 'handleClickedNode',
        value: function handleClickedNode(id) {
            var visCloseButton = document.getElementsByClassName("vis-close")[0];
            // Only open modal outside of edit mode
            if (getComputedStyle(visCloseButton).display === "none") {
                var curProject = this.state.graph.curProject;
                this.setState({ selectedNode: this.state.graph[curProject][id] });
            }
        }
    }, {
        key: 'deleteNode',
        value: function deleteNode(data, callback) {
            var nodeId = data.nodes[0];
            removeItemFromGraph(nodeId).then(function () {
                callback(data);
            });
        }
    }, {
        key: 'addNode',
        value: function addNode(nodeData, callback) {
            this.setState({
                showNewNodeForm: !this.state.showNewNodeForm,
                newNodeData: nodeData
            });
        }
    }, {
        key: 'deleteEdge',
        value: function deleteEdge(data, callback) {
            var _this3 = this;

            var edgeId = data.edges[0];
            var connectedNodes = this.state.visNetwork.getConnectedNodes(edgeId);
            removeEdgeFromGraph(connectedNodes[0], connectedNodes[1]).then(function () {
                _this3.getDataFromServer();
                callback(data);
            });
            callback(data);
        }
    }, {
        key: 'addEdge',
        value: function addEdge(edgeData, callback) {
            var _this4 = this;

            if (edgeData.from !== edgeData.to) {
                // Ensure that user isn't adding self edge
                addEdgeToGraph(edgeData.from, edgeData.to).then(function () {
                    _this4.getDataFromServer();
                    callback(edgeData);
                });
            }
        }
    }, {
        key: 'switchShowNewNodeForm',
        value: function switchShowNewNodeForm() {
            this.setState({ showNewNodeForm: !this.state.showNewNodeForm });
        }
    }, {
        key: 'switchShowNewNotesForm',
        value: function switchShowNewNotesForm() {
            this.setState({ showNewNotesForm: !this.state.showNewNotesForm });
        }
    }, {
        key: 'openProjectsSidebar',
        value: function openProjectsSidebar() {
            this.setState({ showProjectsSidebar: true });
            document.getElementById("projects-sidebar").style.width = "400px";
            document.getElementById("projects-sidebar-btn").style.right = "400px";
        }
    }, {
        key: 'closeProjectsSidebar',
        value: function closeProjectsSidebar() {
            this.setState({ showProjectsSidebar: false });
            document.getElementById("projects-sidebar").style.width = "0";
            document.getElementById("projects-sidebar-btn").style.right = "0";
        }

        /* Helper function to generate position for nodes
        This function adds an offset to  the randomly generated position based on the
        position of the node's parent (if it has one)
         */

    }, {
        key: 'generateNodePositions',
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
        key: 'createNodesAndEdges',
        value: function createNodesAndEdges() {
            var nodes = [];
            var edges = [];
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

                    nodes.push({ id: node.source, label: node.title, x: x, y: y });
                } else {
                    nodes.push({ id: node.source, label: node.title, x: node.x, y: node.y });
                }
                // Deal with edges
                for (var nextIndex in node.nextURLs) {
                    edges.push({ from: node.source, to: node.nextURLs[nextIndex] });
                }
            }
            // console.log(nodes);
            // console.log(edges);
            return [nodes, edges];
        }

        // Main function to set up the vis-network object

    }, {
        key: 'setupVisGraph',
        value: function setupVisGraph() {
            var _this5 = this;

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
                    chosen: true
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
                    _this5.handleClickedNode(nodeId);
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
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.getDataFromServer();
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.graph === null) {
                return null;
            }
            this.getBibliographyData();
            var curProject = this.state.graph.curProject;
            return React.createElement(
                'div',
                null,
                React.createElement(Header, { projectName: curProject, refresh: this.getDataFromServer,
                    showProjectsSidebar: this.state.showProjectsSidebar,
                    openProjectsSidebar: this.openProjectsSidebar,
                    closeProjectsSidebar: this.closeProjectsSidebar }),
                React.createElement(
                    'div',
                    { className: 'main-body' },
                    React.createElement(
                        'div',
                        { id: 'buttons-bar' },
                        React.createElement(RefreshGraphButton, { refresh: this.getDataFromServer }),
                        React.createElement(ExportGraphButton, { 'export': this.exportData })
                    ),
                    React.createElement('div', { id: 'graph' }),
                    React.createElement(ProjectsSidebar, { graph: this.state.graph, refresh: this.getDataFromServer }),
                    React.createElement(NewNodeForm, { showNewNodeForm: this.state.showNewNodeForm, nodeData: this.state.newNodeData,
                        graph: this.state.graph,
                        switchForm: this.switchShowNewNodeForm, refresh: this.getDataFromServer }),
                    React.createElement(PageView, { graph: this.state.graph[curProject], selectedNode: this.state.selectedNode,
                        resetSelectedNode: this.resetSelectedNode, refresh: this.getDataFromServer,
                        showNewNotesForm: this.state.showNewNotesForm, switchForm: this.switchShowNewNotesForm }),
                    React.createElement(ExportView, { bibliographyData: this.state.bibliographyData, shouldShow: this.state.displayExport,
                        resetDisplayExport: this.resetDisplayExport })
                )
            );
        }
    }]);

    return KnolistComponents;
}(React.Component);

// Sidebar to switch between projects


var ProjectsSidebar = function (_React$Component2) {
    _inherits(ProjectsSidebar, _React$Component2);

    function ProjectsSidebar(props) {
        _classCallCheck(this, ProjectsSidebar);

        var _this6 = _possibleConstructorReturn(this, (ProjectsSidebar.__proto__ || Object.getPrototypeOf(ProjectsSidebar)).call(this, props));

        _this6.state = {
            showNewProjectForm: false,
            projectForDeletion: null
        };

        _this6.switchShowNewProjectForm = _this6.switchShowNewProjectForm.bind(_this6);
        _this6.setProjectForDeletion = _this6.setProjectForDeletion.bind(_this6);
        _this6.resetProjectForDeletion = _this6.resetProjectForDeletion.bind(_this6);
        return _this6;
    }

    _createClass(ProjectsSidebar, [{
        key: 'setProjectForDeletion',
        value: function setProjectForDeletion(project) {
            this.setState({ projectForDeletion: project });
        }
    }, {
        key: 'resetProjectForDeletion',
        value: function resetProjectForDeletion() {
            this.setState({ projectForDeletion: null });
        }
    }, {
        key: 'switchShowNewProjectForm',
        value: function switchShowNewProjectForm() {
            document.getElementById("new-project-form").reset();
            this.setState({ showNewProjectForm: !this.state.showNewProjectForm });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            return React.createElement(
                'div',
                { id: 'projects-sidebar', className: 'sidebar' },
                React.createElement(
                    'div',
                    { id: 'sidebar-header' },
                    React.createElement(
                        'h1',
                        { id: 'sidebar-title' },
                        'Your Projects'
                    ),
                    React.createElement(NewProjectButton, { showForm: this.state.showNewProjectForm,
                        switchShowForm: this.switchShowNewProjectForm })
                ),
                React.createElement(
                    'div',
                    { id: 'sidebar-content' },
                    Object.keys(this.props.graph).map(function (project) {
                        return React.createElement(ProjectItem, { key: project, graph: _this7.props.graph,
                            project: project,
                            refresh: _this7.props.refresh,
                            setForDeletion: _this7.setProjectForDeletion });
                    }),
                    React.createElement(NewProjectForm, { showNewProjectForm: this.state.showNewProjectForm, refresh: this.props.refresh,
                        switchForm: this.switchShowNewProjectForm,
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


var ConfirmProjectDeletionWindow = function (_React$Component3) {
    _inherits(ConfirmProjectDeletionWindow, _React$Component3);

    function ConfirmProjectDeletionWindow(props) {
        _classCallCheck(this, ConfirmProjectDeletionWindow);

        var _this8 = _possibleConstructorReturn(this, (ConfirmProjectDeletionWindow.__proto__ || Object.getPrototypeOf(ConfirmProjectDeletionWindow)).call(this, props));

        _this8.deleteProject = _this8.deleteProject.bind(_this8);
        return _this8;
    }

    _createClass(ConfirmProjectDeletionWindow, [{
        key: 'deleteProject',
        value: function deleteProject() {
            var _this9 = this;

            this.props.resetForDeletion();
            deleteProjectFromGraph(this.props.project).then(function () {
                return _this9.props.refresh();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.project === null) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'modal' },
                React.createElement(
                    'div',
                    { id: 'delete-confirmation-modal', className: 'modal-content' },
                    React.createElement('img', { src: '../../images/alert-icon-black.png', alt: 'Alert icon',
                        style: { width: "30%", display: "block", marginLeft: "auto", marginRight: "auto" } }),
                    React.createElement(
                        'h1',
                        null,
                        'Are you sure you want to delete "',
                        this.props.project,
                        '"?'
                    ),
                    React.createElement(
                        'h3',
                        null,
                        'This action cannot be undone.'
                    ),
                    React.createElement(
                        'div',
                        { style: { display: "flex", justifyContent: "space-between" } },
                        React.createElement(
                            'button',
                            { className: 'button confirmation-button', onClick: this.deleteProject },
                            'Yes, delete it!'
                        ),
                        React.createElement(
                            'button',
                            { className: 'button confirmation-button', onClick: this.props.resetForDeletion },
                            'Cancel'
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
            'button',
            { className: 'button new-project-button cancel-new-project', onClick: props.switchShowForm },
            React.createElement(
                'p',
                null,
                'Cancel'
            )
        );
    }
    return React.createElement(
        'button',
        { className: 'button new-project-button', onClick: props.switchShowForm },
        React.createElement('img', { src: '../../images/new-icon.png', alt: 'New', style: { width: "100%" } })
    );
}

// Form to create a new project

var NewProjectForm = function (_React$Component4) {
    _inherits(NewProjectForm, _React$Component4);

    function NewProjectForm(props) {
        _classCallCheck(this, NewProjectForm);

        var _this10 = _possibleConstructorReturn(this, (NewProjectForm.__proto__ || Object.getPrototypeOf(NewProjectForm)).call(this, props));

        _this10.handleSubmit = _this10.handleSubmit.bind(_this10);
        return _this10;
    }

    _createClass(NewProjectForm, [{
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            var _this11 = this;

            // Prevent page from reloading
            event.preventDefault();

            // Data validation
            var title = event.target.newProjectTitle.value;
            if (title === "curProject" || title === "version") {
                // Invalid options (reserved words for the graph structure)
                alert(event.target.newProjectTitle.value + " is not a valid title.");
            } else if (this.props.projects.includes(title)) {
                // Don't allow repeated project names
                alert("You already have a project called " + title + ".");
            } else {
                // Valid name
                createNewProjectInGraph(title).then(function () {
                    return _this11.props.refresh();
                });

                // Reset entry and close form
                event.target.reset();
                this.props.switchForm();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var style = { display: "none" };
            if (this.props.showNewProjectForm) {
                style = { display: "block" };
            }
            return React.createElement(
                'div',
                { style: style, className: 'project-item new-project-form-area' },
                React.createElement(
                    'form',
                    { id: 'new-project-form', onSubmit: this.handleSubmit },
                    React.createElement('input', { type: 'text', id: 'newProjectTitle', name: 'newProjectTitle', defaultValue: 'New Project' }),
                    React.createElement(
                        'button',
                        { className: 'button create-project-button' },
                        'Create'
                    )
                )
            );
        }
    }]);

    return NewProjectForm;
}(React.Component);

// Visualization of a project in the sidebar, used to switch active projects


var ProjectItem = function (_React$Component5) {
    _inherits(ProjectItem, _React$Component5);

    function ProjectItem(props) {
        _classCallCheck(this, ProjectItem);

        var _this12 = _possibleConstructorReturn(this, (ProjectItem.__proto__ || Object.getPrototypeOf(ProjectItem)).call(this, props));

        _this12.switchProject = _this12.switchProject.bind(_this12);
        _this12.deleteProject = _this12.deleteProject.bind(_this12);
        return _this12;
    }

    _createClass(ProjectItem, [{
        key: 'switchProject',
        value: function switchProject(data) {
            var _this13 = this;

            // Only switch if the click was on the item, not on the delete button
            if (data.target.className === "project-item" || data.target.tagName === "H2") {
                setCurrentProjectInGraph(this.props.project).then(function () {
                    return _this13.props.refresh();
                });
            }
        }
    }, {
        key: 'deleteProject',
        value: function deleteProject() {
            this.props.setForDeletion(this.props.project);
        }
    }, {
        key: 'render',
        value: function render() {
            var project = this.props.project;
            // Ignore properties that are not project names
            if (project === "version" || project === "curProject") {
                return null;
            }
            // Display the active project in a different color and show more info
            if (project === this.props.graph.curProject) {
                return React.createElement(
                    'div',
                    { className: 'project-item active-project', onClick: this.switchProject },
                    React.createElement(
                        'h2',
                        null,
                        this.props.project
                    ),
                    React.createElement(
                        'button',
                        { className: 'button delete-project-button', onClick: this.deleteProject },
                        React.createElement('img', { src: '../../images/delete-icon-white.png', alt: 'Delete node', style: { width: "100%" } })
                    )
                );
            }
            // Display other projects
            return React.createElement(
                'div',
                { className: 'project-item', onClick: this.switchProject },
                React.createElement(
                    'h2',
                    null,
                    this.props.project
                ),
                React.createElement(
                    'button',
                    { className: 'button delete-project-button', onClick: this.deleteProject },
                    React.createElement('img', { src: '../../images/delete-icon-white.png', alt: 'Delete node', style: { width: "100%" } })
                )
            );
        }
    }]);

    return ProjectItem;
}(React.Component);

// Form that allows the user to manually add nodes


var NewNodeForm = function (_React$Component6) {
    _inherits(NewNodeForm, _React$Component6);

    function NewNodeForm(props) {
        _classCallCheck(this, NewNodeForm);

        var _this14 = _possibleConstructorReturn(this, (NewNodeForm.__proto__ || Object.getPrototypeOf(NewNodeForm)).call(this, props));

        _this14.handleSubmit = _this14.handleSubmit.bind(_this14);
        _this14.closeForm = _this14.closeForm.bind(_this14);
        return _this14;
    }

    _createClass(NewNodeForm, [{
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            var _this15 = this;

            event.preventDefault(); // Stop page from reloading
            // Call from server
            var contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(event.target.url.value);
            $.getJSON(contextExtractionURL, function (item) {
                addItemToGraph(item, "").then(function () {
                    return updatePositionOfNode(item.source, _this15.props.nodeData.x, _this15.props.nodeData.y);
                }).then(function () {
                    return _this15.props.refresh();
                });
            });

            this.props.switchForm();
            event.target.reset(); // Clear the form entries
        }
    }, {
        key: 'closeForm',
        value: function closeForm() {
            document.getElementById("new-node-form").reset();
            this.props.switchForm();
        }
    }, {
        key: 'render',
        value: function render() {
            var style = { display: "none" };
            if (this.props.showNewNodeForm) {
                style = { display: "block" };
            }
            return React.createElement(
                'div',
                { className: 'modal', style: style },
                React.createElement(
                    'div',
                    { className: 'modal-content' },
                    React.createElement(
                        'button',
                        { className: 'close-modal button', onClick: this.closeForm },
                        React.createElement('img', { src: '../../images/close-icon-black.png', alt: 'Close', style: { width: "100%" } })
                    ),
                    React.createElement(
                        'h1',
                        null,
                        'Add new node'
                    ),
                    React.createElement(
                        'form',
                        { id: 'new-node-form', onSubmit: this.handleSubmit },
                        React.createElement(
                            'label',
                            { htmlFor: 'url' },
                            'Page URL'
                        ),
                        React.createElement('br', null),
                        React.createElement('input', { id: 'url', name: 'url', type: 'url', placeholder: 'Insert URL', required: true }),
                        React.createElement('br', null),
                        React.createElement(
                            'button',
                            { className: 'button', style: { width: 100 } },
                            'Add node'
                        )
                    )
                )
            );
        }
    }]);

    return NewNodeForm;
}(React.Component);

// Detailed view of a specific node


var PageView = function (_React$Component7) {
    _inherits(PageView, _React$Component7);

    function PageView(props) {
        _classCallCheck(this, PageView);

        var _this16 = _possibleConstructorReturn(this, (PageView.__proto__ || Object.getPrototypeOf(PageView)).call(this, props));

        _this16.deleteNode = _this16.deleteNode.bind(_this16);
        _this16.handleSubmit = _this16.handleSubmit.bind(_this16);
        _this16.closeForm = _this16.closeForm.bind(_this16);
        return _this16;
    }

    _createClass(PageView, [{
        key: 'deleteNode',
        value: function deleteNode() {
            var _this17 = this;

            // Remove from the graph
            removeItemFromGraph(this.props.selectedNode.source).then(function () {
                // Reset the selected node
                _this17.props.resetSelectedNode();
                _this17.props.refresh();
            });
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            event.preventDefault();
            addNotesToItemInGraph(this.props.selectedNode, event.target.notes.value, this.props.graph);
            // saveGraphToDisk(this.props.graph);

            this.props.switchForm();
            setTimeout(this.props.refresh, 1000); // Timeout to allow graph to be updated //TODO remove after implementing coordinates and autorefresh
            event.target.reset(); // Clear the form entries
        }
    }, {
        key: 'closeForm',
        value: function closeForm() {
            document.getElementById("new-notes-form").reset();
            this.props.switchForm();
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.selectedNode === null) {
                return null;
            }

            // Hidden form for adding notes
            var style = { display: "none" };
            if (this.props.showNewNotesForm) {
                style = { display: "block" };
            }

            return React.createElement(
                'div',
                { id: 'page-view', className: 'modal' },
                React.createElement(
                    'div',
                    { className: 'modal-content' },
                    React.createElement(
                        'button',
                        { className: 'button', id: 'add-notes', onClick: this.props.switchForm, style: { width: 100 } },
                        'Add Notes'
                    ),
                    React.createElement(
                        'button',
                        { className: 'close-modal button', id: 'close-page-view',
                            onClick: this.props.resetSelectedNode },
                        React.createElement('img', { src: '../../images/close-icon-black.png', alt: 'Close', style: { width: "100%" } })
                    ),
                    React.createElement(
                        'a',
                        { href: this.props.selectedNode.source, target: '_blank' },
                        React.createElement(
                            'h1',
                            null,
                            this.props.selectedNode.title
                        )
                    ),
                    React.createElement(HighlightsList, { highlights: this.props.selectedNode.highlights }),
                    React.createElement(NotesList, { notes: this.props.selectedNode.notes }),
                    React.createElement(
                        'form',
                        { id: 'new-notes-form', onSubmit: this.handleSubmit, style: style },
                        React.createElement(
                            'label',
                            { htmlFor: 'notes' },
                            'Notes:'
                        ),
                        React.createElement('br', null),
                        React.createElement('input', { id: 'notes', name: 'notes', type: 'notes', placeholder: 'Insert Notes', required: true }),
                        React.createElement(
                            'button',
                            { className: 'button', style: { width: 100 } },
                            '+'
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { display: "flex" } },
                        React.createElement(ListURL, { type: "prev", graph: this.props.graph, selectedNode: this.props.selectedNode }),
                        React.createElement(ListURL, { type: "next", graph: this.props.graph, selectedNode: this.props.selectedNode })
                    ),
                    React.createElement(
                        'div',
                        { style: { textAlign: "right" } },
                        React.createElement(
                            'button',
                            { className: 'button', onClick: this.deleteNode },
                            React.createElement('img', { src: '../../images/delete-icon-black.png', alt: 'Delete node', style: { width: "100%" } })
                        )
                    )
                )
            );
        }
    }]);

    return PageView;
}(React.Component);

// Bibliography export


var ExportView = function (_React$Component8) {
    _inherits(ExportView, _React$Component8);

    function ExportView(props) {
        _classCallCheck(this, ExportView);

        return _possibleConstructorReturn(this, (ExportView.__proto__ || Object.getPrototypeOf(ExportView)).call(this, props));
    }

    _createClass(ExportView, [{
        key: 'render',
        value: function render() {
            if (this.props.shouldShow === false) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'modal' },
                React.createElement(
                    'div',
                    { className: 'modal-content' },
                    React.createElement(
                        'button',
                        { className: 'close-modal button', id: 'close-page-view',
                            onClick: this.props.resetDisplayExport },
                        React.createElement('img', { src: '../../images/close-icon-black.png', alt: 'Close', style: { width: "100%" } })
                    ),
                    React.createElement(
                        'h1',
                        null,
                        'Export for Bibliography'
                    ),
                    React.createElement(
                        'ul',
                        null,
                        this.props.bibliographyData.map(function (item) {
                            return React.createElement(
                                'li',
                                { key: item.url },
                                item.title,
                                ', ',
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


var ListURL = function (_React$Component9) {
    _inherits(ListURL, _React$Component9);

    function ListURL(props) {
        _classCallCheck(this, ListURL);

        return _possibleConstructorReturn(this, (ListURL.__proto__ || Object.getPrototypeOf(ListURL)).call(this, props));
    }

    _createClass(ListURL, [{
        key: 'render',
        value: function render() {
            var _this20 = this;

            if (this.props.type === "prev") {
                return React.createElement(
                    'div',
                    { className: 'url-column' },
                    React.createElement(
                        'h2',
                        { style: { textAlign: "center" } },
                        'Previous Connections'
                    ),
                    React.createElement(
                        'ul',
                        null,
                        this.props.selectedNode.prevURLs.map(function (url, index) {
                            return React.createElement(
                                'li',
                                { key: index },
                                React.createElement(
                                    'a',
                                    { href: _this20.props.graph[url].source,
                                        target: '_blank' },
                                    _this20.props.graph[url].title
                                )
                            );
                        })
                    )
                );
            } else if (this.props.type === "next") {
                return React.createElement(
                    'div',
                    { className: 'url-column' },
                    React.createElement(
                        'h2',
                        { style: { textAlign: "center" } },
                        'Next Connections'
                    ),
                    React.createElement(
                        'ul',
                        null,
                        this.props.selectedNode.nextURLs.map(function (url, index) {
                            return React.createElement(
                                'li',
                                { key: index },
                                React.createElement(
                                    'a',
                                    { href: _this20.props.graph[url].source,
                                        target: '_blank' },
                                    _this20.props.graph[url].title
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


var HighlightsList = function (_React$Component10) {
    _inherits(HighlightsList, _React$Component10);

    function HighlightsList(props) {
        _classCallCheck(this, HighlightsList);

        return _possibleConstructorReturn(this, (HighlightsList.__proto__ || Object.getPrototypeOf(HighlightsList)).call(this, props));
    }

    _createClass(HighlightsList, [{
        key: 'render',
        value: function render() {
            if (this.props.highlights.length !== 0) {
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        null,
                        'My Highlights'
                    ),
                    React.createElement(
                        'ul',
                        null,
                        this.props.highlights.map(function (highlight, index) {
                            return React.createElement(
                                'li',
                                { key: index },
                                highlight
                            );
                        })
                    )
                );
            }
            return React.createElement(
                'h2',
                null,
                'You haven\'t added any highlights yet.'
            );
        }
    }]);

    return HighlightsList;
}(React.Component);

var NotesList = function (_React$Component11) {
    _inherits(NotesList, _React$Component11);

    function NotesList(props) {
        _classCallCheck(this, NotesList);

        return _possibleConstructorReturn(this, (NotesList.__proto__ || Object.getPrototypeOf(NotesList)).call(this, props));
    }

    _createClass(NotesList, [{
        key: 'render',
        value: function render() {
            if (this.props.notes.length !== 0) {
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        null,
                        'My Notes'
                    ),
                    React.createElement(
                        'ul',
                        null,
                        this.props.notes.map(function (notes, index) {
                            return React.createElement(
                                'li',
                                { key: index },
                                notes
                            );
                        })
                    )
                );
            }
            return React.createElement(
                'h2',
                null,
                'You haven\'t added any notes yet.'
            );
        }
    }]);

    return NotesList;
}(React.Component);

function RefreshGraphButton(props) {
    return React.createElement(
        'button',
        { onClick: props.refresh, className: 'button' },
        React.createElement('img', { src: '../../images/refresh-icon.png', alt: 'Refresh Button', style: { width: "100%" } })
    );
}

function ExportGraphButton(props) {
    return React.createElement(
        'button',
        { onClick: props.export, className: 'button' },
        React.createElement('img', { src: '../../images/share-icon.webp', alt: 'Refresh Button', style: { width: "100%" } })
    );
}

var Header = function (_React$Component12) {
    _inherits(Header, _React$Component12);

    function Header(props) {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));
    }

    _createClass(Header, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'header' },
                React.createElement('img', { className: 'logo', src: '../../images/horizontal_main.PNG', alt: 'Knolist Logo' }),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h5',
                        { id: 'project-name' },
                        'Current Project: ',
                        this.props.projectName
                    )
                ),
                React.createElement(
                    'div',
                    { style: { width: "70px" } },
                    React.createElement(ProjectsSidebarButton, { showSidebar: this.props.showProjectsSidebar,
                        openProjectsSidebar: this.props.openProjectsSidebar,
                        closeProjectsSidebar: this.props.closeProjectsSidebar })
                )
            );
        }
    }]);

    return Header;
}(React.Component);

var ProjectsSidebarButton = function (_React$Component13) {
    _inherits(ProjectsSidebarButton, _React$Component13);

    function ProjectsSidebarButton(props) {
        _classCallCheck(this, ProjectsSidebarButton);

        return _possibleConstructorReturn(this, (ProjectsSidebarButton.__proto__ || Object.getPrototypeOf(ProjectsSidebarButton)).call(this, props));
    }

    _createClass(ProjectsSidebarButton, [{
        key: 'render',
        value: function render() {
            if (this.props.showSidebar) {
                return React.createElement(
                    'button',
                    { id: 'projects-sidebar-btn', onClick: this.props.closeProjectsSidebar },
                    React.createElement('img', { src: '../../images/close-icon-white.png', alt: 'Close', id: 'close-sidebar-btn' })
                );
            }
            return React.createElement(
                'button',
                { id: 'projects-sidebar-btn', onClick: this.props.openProjectsSidebar },
                React.createElement(
                    'p',
                    null,
                    'Your projects'
                )
            );
        }
    }]);

    return ProjectsSidebarButton;
}(React.Component);

ReactDOM.render(React.createElement(KnolistComponents, null), document.querySelector("#knolist-page"));