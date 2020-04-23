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
    }

    getDataFromServer() {
        // All the websites as a graph
        getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place
        // let trackBrowsing = false; //default to not tracking

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
