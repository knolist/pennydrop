/**
 * This is the file that contains the React components for the popup.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */
import Utils from "../utils.js"

// Global variables
const localServerURL = "http://127.0.0.1:5000/";
const deployedServerURL = "https://knolist.herokuapp.com/";

// Wrapper for all components in the popup
class PopupComponents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            graph: null,
            showNewNotesForm: false,
            localServer: false
        };

        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.switchShowNewNotesForm = this.switchShowNewNotesForm.bind(this);
    }

    // Verifies if the local server is being run
    checkIfLocalServer() {
        $.ajax(localServerURL, {
            complete: (jqXHR, textStatus) => {
                if (textStatus === "success") this.setState({localServer: true});
                else this.setState({localServer: false});
            }
        });
    }

    switchShowNewNotesForm() {
        document.getElementById("new-notes-form").reset();
        this.setState({showNewNotesForm: !this.state.showNewNotesForm}, () => {
            if (this.state.showNewNotesForm) document.getElementById("notes").focus();
        });
    }

    getDataFromServer() {
        getGraphFromDisk().then((graph) => {
            this.setState({graph: graph});
        })
    }

    componentDidMount() {
        this.getDataFromServer();
        this.checkIfLocalServer();
    }

    render() {
        return (
            <div id="popup">
                <Header/>
                <div id="popup-body">
                    <ProjectList graph={this.state.graph} refresh={this.getDataFromServer}/>
                    <NewNotesArea showForm={this.state.showNewNotesForm} switchShowForm={this.switchShowNewNotesForm}
                                  localServer={this.state.localServer}/>
                </div>
            </div>
        );
    }
}

// Header of the popup. Contains logo and home button
class Header extends React.Component {
    // If the home page is already opened, it simply refreshes and goes to that page
    // If it's not open, a new tab is opened next to the current active tab
    openHomePage() {
        chrome.tabs.query({
            title: "Knolist", currentWindow: true
        }, tabs => {
            // Check if a tab was found. If it was, it means the home page is already open
            if (tabs.length > 0) {
                const tab = tabs[0];
                // Reload if already active, switch to Knolist if not active
                if (tab.active) {
                    chrome.tabs.reload(tab.id);
                    window.close();
                } else chrome.tabs.update(tab.id, {active: true});
            } else { // Open a new tab for the home page
                chrome.tabs.query({
                    active: true, currentWindow: true
                }, tabs => {
                    let index = tabs[0].index;
                    chrome.tabs.create({
                        url: "../../html/Knolist.com.html",
                        index: index + 1
                    });
                });
            }
        });
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

        document.body.addEventListener("click", (event) => {
            if (!Utils.isDescendant(document.getElementById("projects-dropdown"), event.target)) {
                this.closeDropdown();
            }
        })
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

    closeDropdown() {
        if (this.state.dropdownOpen) this.switchDropdown();
    }

    switchShowNewProjectForm() {
        document.getElementById("new-project-form").reset();
        this.setState({
            showNewProjectForm: !this.state.showNewProjectForm,
            alertMessage: null,
            invalidTitle: null
        }, () => {
            // Set focus to input field
            if (this.state.showNewProjectForm) document.getElementById("newProjectTitle").focus();
        });
    }

    render() {
        if (this.props.graph === null) return null;

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
                <ProjectsDropdown dropdownOpen={this.state.dropdownOpen} switchDropdown={this.switchDropdown}
                                  graph={this.props.graph} refresh={this.props.refresh}/>
            </div>
        );
    }
}

// Button used to open the "create project" form
function NewProjectButton(props) {
    if (props.showForm) {
        return (
            <button className="button small-button button-with-text new-project-button" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button small-button new-project-button" onClick={props.switchShowForm}>
            <img src="../../images/add-icon-white.png" alt="New" style={{width: "100%"}}/>
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
        const title = Utils.trimString(event.target.newProjectTitle.value);
        const alertMessage = Utils.validateProjectTitle(title, this.props.projects);
        this.props.setAlertMessage(alertMessage);
        if (alertMessage == null) {
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
            this.props.setInvalidTitle(null);
        } else {
            this.props.setInvalidTitle(title);
        }
    }

    render() {
        let style = {display: "none"};
        if (this.props.showNewProjectForm) {
            style = {display: "block"};
        }
        return (
            <div style={style} id="new-project-form-area">
                <form id="new-project-form" onSubmit={this.handleSubmit} autoComplete="off">
                    <input type="text" id="newProjectTitle" name="newProjectTitle" defaultValue="New Project" required/>
                    <button className="button small-button button-with-text">Create</button>
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

function ProjectsDropdown(props) {
    // Define arrow icon to use based on whether dropdown is active
    // Hide or display the dropdown content
    let arrowIconURL = "../../images/down-chevron-icon-black.png";
    let dropdownStyle = {display: "none"};
    if (props.dropdownOpen) {
        arrowIconURL = "../../images/up-chevron-icon-black.png";
        dropdownStyle = {display: "block"};
    }

    return (
        <div className="dropdown" id="projects-dropdown">
            <div onClick={props.switchDropdown} id="current-project-area">
                <p>{props.graph.curProject}</p>
                <button className="dropdown-button">
                    <img src={arrowIconURL} alt="Dropdown"/>
                </button>
            </div>
            <div className="dropdown-content" style={dropdownStyle}>
                {Object.keys(props.graph).map((project) => <DropdownItem key={project}
                                                                         projectName={project}
                                                                         curProject={props.graph.curProject}
                                                                         refresh={props.refresh}
                                                                         switchDropdown={props.switchDropdown}/>)}
            </div>
        </div>
    );
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
            <NewNotesForm showForm={props.showForm} switchShowForm={props.switchShowForm}
                          localServer={props.localServer}/>
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
                let currentTab = tabs[0];

                // Call from server
                let baseServerURL = deployedServerURL;
                if (this.props.localServer) { // Use local server if it's active
                    baseServerURL = localServerURL;
                }
                const contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(currentTab.url);

                // Get previous url to add connection if it exists, then add notes
                chrome.runtime.sendMessage({command: "get_referrer"}, (response) => {
                    if (!response)
                        console.error("This was a fiasco :", chrome.runtime.lastError.message);

                    console.log(response.referrer);
                    // Create item based on the current page
                    $.getJSON(contentExtractionURL, (item) => {
                        addNotesToItemInGraph(item, notes, response.referrer);
                    });
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
                <button className="button small-button button-with-text" style={{marginTop: 0, marginBottom: 0}}>
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
            <button className="button small-button button-with-text" onClick={props.switchShowForm}>
                <p>Cancel</p>
            </button>
        );
    }
    return (
        <button className="button small-button button-with-text" onClick={props.switchShowForm}>
            <p>Add notes to this page</p>
        </button>
    );
}

ReactDOM.render(<PopupComponents/>, document.querySelector("#popup-wrapper"));