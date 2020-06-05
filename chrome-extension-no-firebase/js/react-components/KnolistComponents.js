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

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graph: createNewGraph(),
            selectedNode: null,
            displayExport: false,
            showNewNodeForm: false,
            newNodeData: null,
            newNodeCallback: null
        };
        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.exportData = this.exportData.bind(this);
        this.handleClickedNode = this.handleClickedNode.bind(this);
        this.handleDeletedNode = this.handleDeletedNode.bind(this);
        this.addNode = this.addNode.bind(this);
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

    getDataFromServer() {
        // All the websites as a graph
        getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place

        // window.setTimeout(() => {
        //     this.getDataFromServer();
        // }, 200);
    }

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

    handleClickedNode(id) {
        const visCloseButton = document.getElementsByClassName("vis-close")[0];
        // Only open modal outside of edit mode
        if (getComputedStyle(visCloseButton).display === "none") {
            const curProject = this.state.graph.curProject;
            this.setState({selectedNode: this.state.graph[curProject][id]});
        }
    }

    handleDeletedNode(data, callback) {
        const nodeId = data.nodes[0];
        removeItemFromGraph(nodeId, this.state.graph);
        saveGraphToDisk(this.state.graph);
        callback(data);
    }

    addNode(nodeData, callback) {
        this.setState(
            {
                showNewNodeForm: !this.state.showNewNodeForm,
                newNodeData: nodeData,
                newNodeCallback: callback
            });
    }

    switchShowNewNodeForm() {
        this.setState({showNewNodeForm: !this.state.showNewNodeForm});
    }

    setupVisGraph() {
        let nodes = [];
        let edges = [];
        const curProject = this.state.graph.curProject;
        for (let index in this.state.graph[curProject]) {
            let node = this.state.graph[curProject][index];
            nodes.push({id: node.source, label: node.title});
            for (let nextIndex in node.nextURLs) {
                edges.push({from: node.source, to: node.nextURLs[nextIndex]})
            }
        }
        console.log(nodes);
        console.log(edges);

        // create a network
        // TODO: Store the positions of each node to always render in the same way (allow user to move them around)
        // TODO: Consider using hierarchical layout mode (commented out in the options)
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
                // physics: false,
                chosen: true
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true
                    }
                },
                color: "black"
            },
            // layout: {
            //     hierarchical: true
            // },
            interaction: {
                navigationButtons: true,
                selectConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: this.handleDeletedNode,
                addNode: this.addNode
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -0.001,
                    centralGravity: 0,
                    springLength: 230,
                    springConstant: 0,
                    avoidOverlap: 1
                },
                maxVelocity: 146,
                solver: "forceAtlas2Based",
                timestep: 0.35,
                stabilization: { iterations: 150 }
            }
        };
        const network = new vis.Network(container, data, options);
        network.on("click", (params) => {
          if (params.nodes !== undefined && params.nodes.length > 0 ) {
              const nodeId = params.nodes[0];
              this.handleClickedNode(nodeId);
          }
        });
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
                             callback={this.state.newNodeCallback} switchForm={this.switchShowNewNodeForm} refresh={this.getDataFromServer}/>
                <PageView graph={this.state.graph[curProject]} selectedNode={this.state.selectedNode} resetSelectedNode={this.resetSelectedNode}/>
                <ExportView bibliographyData={getTitlesFromGraph(this.state.graph)} shouldShow={this.state.displayExport} resetDisplayExport={this.resetDisplayExport} />
            </div>
        );
    }
}

class NewNodeForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault(); // Stop page from reloading
        const contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(event.target.url.value);
        $.getJSON(contextExtractionURL, (item) => {
            updateItemInGraph(item, "", this.props.graph);
            saveGraphToDisk(this.props.graph);
        });

        // let nodeData = this.props.nodeData;
        // const curProject = this.props.graph.curProject;
        // nodeData.id = event.target.url.value;
        // nodeData.label = this.props.graph[curProject][event.target.url.value].title;
        // this.props.callback(nodeData);
        this.props.switchForm();
        setTimeout(this.props.refresh, 1000); // Timeout to allow graph to be updated //TODO remove after implementing coordinates and autorefresh
        event.target.reset(); // Clear the form entries
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewNodeForm) { style = {display: "block"} }
        return (
            <div className="modal" style={style}>
                <div className="modal-content">
                    <button className="close-modal button" onClick={this.props.switchForm}>&times;</button>
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

class PageView extends React.Component {
    constructor(props) {
        super(props);
        // When the user clicks anywhere outside of the modal, close it
        // TODO: make this work
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
