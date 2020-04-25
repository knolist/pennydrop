class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Header/>
                <div className="main-body">
                    <p style={{fontSize: 20}}>Welcome to Knolist.com. You're already logged in :)</p>
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
            graph: createNewGraph()
        };
        this.getDataFromServer = this.getDataFromServer.bind(this);
    }

    getDataFromServer() {
        // All the websites as a graph
        getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place

        // window.setTimeout(() => {
        //     this.getDataFromServer();
        // }, 200);
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
        const container = document.getElementById("graph");
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {
            nodes: {
                shape: "dot",
                size: 16
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true
                    }
                }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
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
        this.setupVisGraph();
    }

    render() {
        if (this.state.graph === null) {
            return 0;
        }
        return (
            <div id="graph"/>
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
