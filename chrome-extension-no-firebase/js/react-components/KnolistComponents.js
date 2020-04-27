class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Header/>
                <div className="main-body">
                    <div style={{display: "flex"}}>
                        <p style={{fontSize: 20}}>Welcome to Knolist.com. You're already logged in :)</p>
                    </div>
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
            selectedNode: null
        };
        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.handleClickedNode = this.handleClickedNode.bind(this);
        this.resetSelectedNode = this.resetSelectedNode.bind(this);
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

    resetSelectedNode() {
        this.setState({selectedNode: null});
    }


    handleClickedNode(values, id, selected, hovering) {
        const visCloseButton = document.getElementsByClassName("vis-close")[0];
        // Only open modal outside of edit mode
        if (getComputedStyle(visCloseButton).display === "none") {
            this.setState({selectedNode: this.state.graph.default[id]});
        }
    }

    setupVisGraph() {
        let nodes = [];
        let edges = [];
        for (let index in this.state.graph.default) {
            let node = this.state.graph.default[index];
            nodes.push({id: node.source, label: node.title});
            for (let nextIndex in node.nextURLs) {
                edges.push({from: node.source, to: node.nextURLs[nextIndex]})
            }
        }
        console.log(nodes);
        console.log(edges);

        // create a network
        // TODO: Store the positions of each node to always render in the same way (allow user to move them around)
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
                chosen: {
                    node: this.handleClickedNode
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true
                    }
                },
                color: "black"
            },
            interaction: {
                navigationButtons: true,
                selectConnectedEdges: false
            },
            manipulation: {
                enabled: true
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
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    componentDidUpdate(prevProps, prevState) {
        // Don't refresh the graph if we only changed the selected node
        // TODO: this won't be necessary once we store the positions of the nodes

        const bothNull = (prevState.selectedNode === null && this.state.selectedNode === null);
        const notNullButEqual = (
            prevState.selectedNode !== null &&
            this.state.selectedNode !== null &&
            prevState.selectedNode.source === this.state.selectedNode.source
        );

        if (bothNull || notNullButEqual) {
            this.setupVisGraph();
        }
    }

    render() {
        if (this.state.graph === null) {
            return null;
        }
        return (
            <div>
                <div id="title-bar">
                    <RefreshGraphButton refresh={this.getDataFromServer}/>
                    <h2 style={{margin: "auto auto"}}>Current Project: {this.titleCase(this.state.graph.curProject)}</h2>
                </div>
                <div id="graph"/>
                <PageView selectedNode={this.state.selectedNode} resetSelectedNode={this.resetSelectedNode}/>
            </div>
        );
    }
}

class PageView extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.selectedNode !== null) {
            // Get the modal
            const modal = document.getElementById("page-view");

            // Get the <span> element that closes the modal
            const span = document.getElementById("close-page-view");
            console.log(span);

            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
                this.props.resetSelectedNode();
                console.log("clicked");
            };

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
                if (event.target === modal) {
                    this.props.resetSelectedNode();
                }
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
                    <p>{this.props.selectedNode.title}</p>
                    <p>{this.props.selectedNode.content}</p>
                    <p>{this.props.selectedNode.highlights}</p>
                    <p>{this.props.selectedNode.prevURLs}</p>
                    <p>{this.props.selectedNode.nextURLs}</p>
                </div>

            </div>
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
