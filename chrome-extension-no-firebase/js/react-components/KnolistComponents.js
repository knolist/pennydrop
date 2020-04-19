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
            graph: null
        };
        console.log("constructed");
    }

    getDataFromServer() {
        // All the websites as a graph
        let itemGraph = createNewGraph();
        getGraphFromDisk(itemGraph); // This method updates the passed in graph variable in place
        // let trackBrowsing = false; //default to not tracking

        this.setState({graph: itemGraph});
        console.log(itemGraph);

        window.setTimeout(() => {
            this.getDataFromServer();
        }, 2000);
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    render() {
        if (this.state.graph === null) {
            return 0;
        }
        console.log("trying to render");
        console.log(this.state.graph);
        console.log(this.state.graph.default);
        console.log(JSON.stringify(this.state.graph, undefined, 2));
        console.log(JSON.stringify(this.state.graph.default, undefined, 2));
        return (
            <div>
                <pre>{JSON.stringify(this.state.graph, undefined, 2)}</pre>
                {/*<div id="slide-out" className="sidenav teal lighten-1" style={{width: "30%"}}>*/}
                {/*    <ul>{this.state.courses.map(course => <Course key={course.courseId} course={course} userID={this.props.userID}/>)}</ul>*/}
                {/*</div>*/}
            </div>
        );
    }
}


ReactDOM.render(<KnolistComponents/>, document.querySelector("#knolist-page"));