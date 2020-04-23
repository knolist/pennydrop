class KnolistComponents extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <MindMap/>
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
        // let trackBrowsing = false; //default to not tracking

        window.setTimeout(() => {
            this.getDataFromServer();
        }, 2000);
    }

    setupVisGraph() {
        let nodes = [];
        let edges = [];
        for (let index in this.state.graph.default) {
            let node = this.state.graph.default[index];
            nodes.push(node);
            for (let nextIndex in node.nextURLs) {
                edges.push({source: node.source, target: node.nextURLs[nextIndex]})
            }
        }

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
        this.setupVisGraph();
    }

    // componentDidUpdate() {
    //     this.setupVisGraph();
    // }

    render() {
        if (this.state.graph === null) {
            return 0;
        }
        return (
            <div id="graph"/>
        );
    }
}


ReactDOM.render(<KnolistComponents/>, document.querySelector("#knolist-page"));
