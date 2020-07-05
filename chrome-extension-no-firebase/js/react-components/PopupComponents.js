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
            dropdownOpen: false,
            showNewProjectForm: false
        };

        this.switchDropdown = this.switchDropdown.bind(this);
        this.switchShowNewProjectForm = this.switchShowNewProjectForm.bind(this);
    }

    switchDropdown() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }

    switchShowNewProjectForm() {
        document.getElementById("new-project-form").reset();
        this.setState({showNewProjectForm: !this.state.showNewProjectForm});
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
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <h4>Current Project:</h4>
                    <NewProjectButton showForm={this.state.showNewProjectForm}
                                      switchShowForm={this.switchShowNewProjectForm}/>
                </div>
                <NewProjectForm showNewProjectForm={this.state.showNewProjectForm} refresh={this.props.refresh}
                                switchForm={this.switchShowNewProjectForm}
                                projects={Object.keys(this.props.graph)}/>
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

// Button used to open the "create project" form
function NewProjectButton(props) {
    if (props.showForm) {
        return (
            <button className="button new-project-button cancel-new-project" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button new-project-button" onClick={props.switchShowForm}>
            <img src="../../images/add-icon-black.png" alt="New" style={{width: "100%"}}/>
        </button>
    );
}

// Form to create a new project
class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alertMessage: null, // null for no issue, "invalid-title", or "repeated-title"
            invalidTitle: null
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);
        this.setInvalidTitle = this.setInvalidTitle.bind(this);
    }

    setAlertMessage(value) {
        this.setState({alertMessage: value});
    }

    setInvalidTitle(value) {
        this.setState({invalidTitle: value});
    }

    handleSubmit(event) {
        // Prevent page from reloading
        event.preventDefault();

        // Data validation
        const title = event.target.newProjectTitle.value;
        if (title === "curProject" || title === "version") {
            // Invalid options (reserved words for the graph structure)
            this.setInvalidTitle(title);
            this.setAlertMessage("invalid-title");
        } else if (this.props.projects.includes(title)) {
            // Don't allow repeated project names
            this.setInvalidTitle(title);
            this.setAlertMessage("repeated-title");
        } else {
            // Valid name
            createNewProjectInGraph(title).then(() => this.props.refresh());

            // Reset entry and close form
            event.target.reset();
            // Close the form
            this.props.switchForm();
            // Hide alert message if there was one
            this.setAlertMessage(null);
            this.setInvalidTitle(null);
        }
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewProjectForm) {
            style = {display: "block"};
        }
        return (
            <div style={style} id="new-project-form-area">
                <form id="new-project-form" onSubmit={this.handleSubmit}>
                    <input type="text" id="newProjectTitle" name="newProjectTitle" defaultValue="New Project" required/>
                    <button className="button create-project-button">Create</button>
                </form>
                <AlertMessage alertMessage={this.state.alertMessage} projectTitle={this.state.invalidTitle}/>
            </div>
        );
    }
}

/**
 * @return {null}
 */
function AlertMessage(props) {
    if (props.alertMessage === "invalid-title") {
        return (
            <p>{props.projectTitle} is not a valid title.</p>
        );
    }

    if (props.alertMessage === "repeated-title") {
        return (
            <p>You already have a project called {props.projectTitle}.</p>
        );
    }

    return null;
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