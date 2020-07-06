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
            graph: null,
            showNewNotesForm: false
        };

        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.switchShowNewNotesForm = this.switchShowNewNotesForm.bind(this);
    }

    switchShowNewNotesForm() {
        document.getElementById("new-notes-form").reset();
        this.setState({showNewNotesForm: !this.state.showNewNotesForm});
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
                    <NewNotesArea showForm={this.state.showNewNotesForm} switchShowForm={this.switchShowNewNotesForm}/>
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
                <div style={{display: "flex"}}>
                    <ActivateProjectSwitch/>
                    <a onClick={() => this.openHomePage()} id="home-button">
                        <img src="../../images/home-icon-black.png" alt="Home" style={{height: "100%", margin: "1px"}}/>
                    </a>
                </div>
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
            showNewProjectForm: false,
            alertMessage: null, // null for no issue, "invalid-title", or "repeated-title"
            invalidTitle: null
        };

        this.switchDropdown = this.switchDropdown.bind(this);
        this.switchShowNewProjectForm = this.switchShowNewProjectForm.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);
        this.setInvalidTitle = this.setInvalidTitle.bind(this);
    }

    setAlertMessage(value) {
        this.setState({alertMessage: value});
    }

    setInvalidTitle(value) {
        this.setState({invalidTitle: value});
    }

    switchDropdown() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }

    switchShowNewProjectForm() {
        document.getElementById("new-project-form").reset();
        this.setState({
            showNewProjectForm: !this.state.showNewProjectForm,
            alertMessage: null,
            invalidTitle: null
        });
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
                                setAlertMessage={this.setAlertMessage}
                                setInvalidTitle={this.setInvalidTitle}
                                alertMessage={this.state.alertMessage}
                                invalidTitle={this.state.invalidTitle}
                                projects={Object.keys(this.props.graph)}/>
                <div className="dropdown">
                    <div onClick={this.switchDropdown} id="current-project-area">
                        <p>{this.props.graph.curProject}</p>
                        <button className="dropdown-button">
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

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        // Prevent page from reloading
        event.preventDefault();

        // Data validation
        const title = event.target.newProjectTitle.value;
        if (title === "curProject" || title === "version") {
            // Invalid options (reserved words for the graph structure)
            this.props.setInvalidTitle(title);
            this.props.setAlertMessage("invalid-title");
        } else if (this.props.projects.includes(title)) {
            // Don't allow repeated project names
            this.props.setInvalidTitle(title);
            this.props.setAlertMessage("repeated-title");
        } else {
            // Valid name
            createNewProjectInGraph(title).then(() => this.props.refresh());

            // Activate tracking
            document.getElementById("switch-tracking").checked = true;
            chrome.runtime.sendMessage({command: "start-tracking"});

            // Reset entry and close form
            event.target.reset();
            // Close the form
            this.props.switchForm();
            // Hide alert message if there was one
            this.props.setAlertMessage(null);
            this.props.setInvalidTitle(null);
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
                <AlertMessage alertMessage={this.props.alertMessage} projectTitle={this.props.invalidTitle}/>
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

class ActivateProjectSwitch extends React.Component {
    constructor(props) {
        super(props);

        this.switchTracking = this.switchTracking.bind(this);
    }

    switchTracking() {
        if (document.getElementById("switch-tracking").checked) {
            chrome.runtime.sendMessage({command: "start-tracking"});
        } else {
            chrome.runtime.sendMessage({command: "stop-tracking"});
        }
    };

    setTrackingState() {
        chrome.runtime.sendMessage({command: "get_tracking"}, function (response) {
            document.getElementById("switch-tracking").checked = response.trackBrowsing;
        });
    };

    componentDidMount() {
        this.setTrackingState();
    }

    render() {
        return (
            <label className="switch">
                <input type="checkbox" id="switch-tracking" onClick={this.switchTracking}/>
                <span className="switch-slider round"/>
            </label>
        );
    }
}

function NewNotesArea(props) {
    return (
        <div style={{marginTop: "15px"}}>
            <NewNotesButton showForm={props.showForm} switchShowForm={props.switchShowForm}/>
            <NewNotesForm showForm={props.showForm} switchShowForm={props.switchShowForm}/>
        </div>
    )
}

class NewNotesForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        const notes = event.target.notes.value;

        this.props.switchShowForm(); // Hide the form
        event.target.reset(); // Clear the form entries

        // Get current page
        chrome.tabs.query({
                active: true, currentWindow: true
            }, tabs => {
                let currentURL = tabs[0].url;
                const contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(currentURL);
                // Create item based on the current page
                $.getJSON(contextExtractionURL, (item) => {
                    addNotesToItemInGraph(item, notes);
                });
            }
        );
    }

    render() {
        // Hidden form for adding notes
        let style = {display: "none"};
        if (this.props.showForm) {
            style = {display: "flex"}
        }

        return (
            <form id="new-notes-form" onSubmit={this.handleSubmit} style={style}>
                <input id="notes" name="notes" type="text" placeholder="Insert Notes" required/>
                <button className="button add-note-button" style={{marginTop: 0, marginBottom: 0}}>
                    Add
                </button>
            </form>
        );
    }
}

// Button used to open the "create project" form
function NewNotesButton(props) {
    if (props.showForm) {
        return (
            <button className="button add-note-button" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button add-note-button" onClick={props.switchShowForm}>
            <p>Add notes to this page</p>
        </button>
    );
}

ReactDOM.render(<PopupComponents/>, document.querySelector("#popup-wrapper"));