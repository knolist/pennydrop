/**
 * This is the file that contains the React components for the web application page.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */

// Wrapper class for the web application
class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Header/>
                <div className="main-body">
                    <MindMap/>
                </div>
            </div>
        );
    }
}

// Wrapper for all the components inside the mindmap
class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: createNewGraph(), // All the graph data
            selectedNode: null, // Node that's clicked for the detailed view
            displayExport: false,
            showNewNodeForm: false,
            // autoRefresh: true, // Will be set to false on drag
            newNodeData: null, // Used when creating a new node
            visNetwork: null // The vis-network object
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
        this.resetSelectedNode = this.resetSelectedNode.bind(this);
        this.resetDisplayExport = this.resetDisplayExport.bind(this);
    }

    titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }

    // Calls graph.js function to pull the graph from the Chrome storage
    getDataFromServer() {
        // All the websites as a graph
        getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place

        // window.setTimeout(() => {
        //     if (this.state.autoRefresh) this.getDataFromServer();
        // }, 200);
    }

    // Used for the export bibliography button
    exportData() {
      const visCloseButton = document.getElementsByClassName("vis-close")[0];
      // Only open modal outside of edit mode
      if (getComputedStyle(visCloseButton).display === "none") {
          const curProject = this.state.graph.curProject;
          this.setState({displayExport: true});
      }
    }

    resetSelectedNode() {
        this.setState({selectedNode: null});
    }

    resetDisplayExport() {
        this.setState({displayExport: false});
    }

    // Set selected node for the detailed view
    handleClickedNode(id) {
        const visCloseButton = document.getElementsByClassName("vis-close")[0];
        // Only open modal outside of edit mode
        if (getComputedStyle(visCloseButton).display === "none") {
            const curProject = this.state.graph.curProject;
            this.setState({selectedNode: this.state.graph[curProject][id]});
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

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = [];
        let edges = [];
        const curProject = this.state.graph.curProject;
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.graph[curProject]) {
            let node = this.state.graph[curProject][index];
            // Deal with positions
            if (node.x === null || node.y === null || node.x === undefined || node.y === undefined) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const x = Math.floor(Math.random() * 600 - 300);
                const y = Math.floor(Math.random() * 600 - 300);
                nodes.push({id: node.source, label: node.title, x: x, y: y});
            } else {
                nodes.push({id: node.source, label: node.title, x: node.x, y: node.y});
            }
            // Deal with edges
            for (let nextIndex in node.nextURLs) {
                edges.push({from: node.source, to: node.nextURLs[nextIndex]})
            }
        }
        // console.log(nodes);
        // console.log(edges);
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
        const network = new vis.Network(container, data, options);
        network.fit(); // Zoom in or out to fit entire network on screen
        // Store all positions
        const positions = network.getPositions();
        for (let index in positions) {
            const x = positions[index]["x"];
            const y = positions[index]["y"];
            updatePositionOfNode(index, x, y)
        }
        saveGraphToDisk(this.state.graph); // Store the updated positions
        // Handle click vs drag
        network.on("click", (params) => {
          if (params.nodes !== undefined && params.nodes.length > 0 ) {
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
           const url = network.getSelectedNodes()[0];
           const position = network.getPosition(url);
           const x = position["x"];
           const y = position["y"];
           updatePositionOfNode(url, x, y);
           // saveGraphToDisk(this.state.graph);
           // this.setState({autoRefresh: true});
        });
        // Store the network
        this.setState({visNetwork: network});
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    render() {
        if (this.state.graph === null) {
            return null;
        }
        const curProject = this.state.graph.curProject;
        return (
            <div>
                <div id="title-bar">
                    <RefreshGraphButton refresh={this.getDataFromServer}/>
                    <h2 style={{margin: "auto auto"}}>Current Project: {this.titleCase(this.state.graph.curProject)}</h2>
                    <ExportGraphButton export={this.exportData}/>
                </div>
                <div id="graph"/>
                <NewNodeForm showNewNodeForm={this.state.showNewNodeForm} nodeData={this.state.newNodeData} graph={this.state.graph}
                            switchForm={this.switchShowNewNodeForm} refresh={this.getDataFromServer}/>
                <PageView graph={this.state.graph[curProject]} selectedNode={this.state.selectedNode} resetSelectedNode={this.resetSelectedNode}/>
                <ExportView bibliographyData={getTitlesFromGraph()} shouldShow={this.state.displayExport} resetDisplayExport={this.resetDisplayExport} />
            </div>
        );
    }
}

// Form that allows the user to manually add nodes
class NewNodeForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.closeForm = this.closeForm.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault(); // Stop page from reloading
        // Call from server
        const contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(event.target.url.value);
        $.getJSON(contextExtractionURL, (item) => {
            updateItemInGraph(item, "").then(() => {
                return updatePositionOfNode(item["source"], this.props.nodeData.x, this.props.nodeData.y);
            }).then(() => this.props.refresh());
        });

        this.props.switchForm();
        event.target.reset(); // Clear the form entries
    }

    closeForm() {
        document.getElementById("new-node-form").reset();
        this.props.switchForm();
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewNodeForm) { style = {display: "block"} }
        return (
            <div className="modal" style={style}>
                <div className="modal-content">
                    <button className="close-modal button" onClick={this.closeForm}>&times;</button>
                    <h1>Add new node</h1>
                    <form id="new-node-form" onSubmit={this.handleSubmit}>
                        <label htmlFor="url">Page URL</label><br/>
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
        // When the user clicks anywhere outside of the modal, close it
        // TODO: make this work (CU-8cgf5y)
        window.onclick = function(event) {
            if (event.target === document.getElementById("page-view")) {
                props.resetSelectedNode();
            }
        }
    }

    render() {
        if (this.props.selectedNode === null) {
            return null;
        }
        return (
            <div id="page-view" className="modal">
                <div className="modal-content">
                    <button className="close-modal button" id="close-page-view" onClick={this.props.resetSelectedNode}>&times;</button>
                    <a href={this.props.selectedNode.source} target="_blank"><h1>{this.props.selectedNode.title}</h1></a>
                    <HighlightsList highlights={this.props.selectedNode.highlights}/>
                    <div style={{display: "flex"}}>
                        <ListURL type={"prev"} graph={this.props.graph} selectedNode={this.props.selectedNode}/>
                        <ListURL type={"next"} graph={this.props.graph} selectedNode={this.props.selectedNode}/>
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
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target === document.getElementById("page-view")) {
                props.resetDisplayExport();
            }
        }
    }

    render() {
        if (this.props.shouldShow === false) {
            return null;
        }
        return (
            <div id="page-view" className="modal">
                <div className="modal-content">
                    <button className="close-modal button" id="close-page-view" onClick={this.props.resetDisplayExport}>&times;</button>
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
        if (this.props.type === "prev") {
            return (
                <div className="url-column">
                    <h2 style={{textAlign: "center"}}>Previous Connections</h2>
                    <ul>{this.props.selectedNode.prevURLs.map((url, index) =>
                        <li key={index}><a href={this.props.graph[url].source} target="_blank">{this.props.graph[url].title}</a></li>)}
                    </ul>
                </div>
            );
        } else if (this.props.type === "next") {
            return (
                <div className="url-column">
                    <h2 style={{textAlign: "center"}}>Next Connections</h2>
                    <ul>{this.props.selectedNode.nextURLs.map((url, index) =>
                        <li key={index}><a href={this.props.graph[url].source} target="_blank">{this.props.graph[url].title}</a></li>)}
                    </ul>
                </div>
            );
        } else return null;
    }
}

// List of highlights in the detailed page view
class HighlightsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.highlights.length !== 0) {
            return (
                <div>
                    <h2>My Highlights</h2>
                    <ul>{this.props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul>
                </div>
            );
        }
        return (
            <h2>You haven't added any highlights yet.</h2>
        );
    }
}

class RefreshGraphButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.refresh} className="button"><img src="../../images/refresh-icon.png" alt="Refresh Button" style={{width: "100%"}}/></button>
        );
    }
}

class ExportGraphButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.export} className="button"><img src="../../images/share-icon.webp" alt="Refresh Button" style={{width: "100%"}}/></button>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div className="header">
                <img className="logo" src="../../images/full_main.PNG" alt="Knolist Logo"/>
            </div>
        );
    }
}


ReactDOM.render(<KnolistComponents/>, document.querySelector("#knolist-page"));
