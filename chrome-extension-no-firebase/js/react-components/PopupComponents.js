/**
 * This is the file that contains the React components for the popup.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */

// Wrapper for all components in the popup
class PopupComponents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            graph: null
        };

        this.getDataFromServer = this.getDataFromServer.bind(this);
    }

    getDataFromServer() {
        getGraphFromDisk().then((graph) => {
            this.setState({graph: graph});
        })
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    render() {
        return (
            <div id="popup">
                <Header/>
                <div id="popup-body">
                    <ProjectList graph={this.state.graph} refresh={this.getDataFromServer}/>
                </div>
            </div>
        );
    }
}

// Header of the popup. Contains logo and home button
class Header extends React.Component {
    openHomePage() {
        chrome.tabs.query({
                active: true, currentWindow: true
            }, tabs => {
                let index = tabs[0].index;
                chrome.tabs.create({
                    url: "../../html/Knolist.com.html",
                    index: index + 1
                });
            }
        );
    }

    render() {
        return (
            <div className="header" style={{height: "35px"}}>
                <img src="../../images/horizontal_main.PNG" alt="Knolist" style={{height: "100%"}}/>
                <a onClick={() => this.openHomePage()} id="home-button">
                    <img src="../../images/home-icon-black.png" alt="Home" style={{height: "100%", margin: "1px"}}/>
                </a>
            </div>
        );
    }
}

// Dropdown list of all the projects, allows user to switch between them.
class ProjectList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false
        };

        this.switchDropdown = this.switchDropdown.bind(this);
    }

    switchDropdown() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }

    render() {
        if (this.props.graph === null) return null;

        // Define arrow icon to use based on whether dropdown is active
        let arrowIconURL = "../../images/down-chevron-icon-black.png";
        if (this.state.dropdownOpen) arrowIconURL = "../../images/up-chevron-icon-black.png";

        // Hide or display the dropdown content
        let dropdownStyle = {display: "none"};
        if (this.state.dropdownOpen) dropdownStyle = {display: "block"};

        return (
            <div id="projects-list">
                <h4>Current Project:</h4>
                <div className="dropdown">
                    <div id="current-project-area">
                        <p>{this.props.graph.curProject}</p>
                        <button onClick={this.switchDropdown} className="dropdown-button">
                            <img src={arrowIconURL} alt="Dropdown"/>
                        </button>
                    </div>
                    <div id="myDropdown" className="dropdown-content" style={dropdownStyle}>
                        {Object.keys(this.props.graph).map((project) => <DropdownItem key={project}
                                                                                      projectName={project}
                                                                                      curProject={this.props.graph.curProject}
                                                                                      refresh={this.props.refresh}
                                                                                      switchDropdown={this.switchDropdown}/>)}
                    </div>
                </div>
            </div>
        );
    }
}

// Each item in the project dropdown
class DropdownItem extends React.Component {
    constructor(props) {
        super(props);

        this.activateProject = this.activateProject.bind(this);
    }

    activateProject() {
        this.props.switchDropdown();
        setCurrentProjectInGraph(this.props.projectName).then(() => this.props.refresh());
    }

    render() {
        // Ignore properties that are not titles
        if (this.props.projectName === "curProject" || this.props.projectName === "version") return null;

        // Ignore current project
        if (this.props.projectName === this.props.curProject) return null;

        return (
            <a onClick={this.activateProject}>{this.props.projectName}</a>
        );
    }
}

ReactDOM.render(<PopupComponents/>, document.querySelector("#popup-wrapper"));