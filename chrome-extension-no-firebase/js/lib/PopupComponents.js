var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This is the file that contains the React components for the popup.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */

// Global variables
var localServerURL = "http://127.0.0.1:5000/";
var deployedServerURL = "https://knolist.herokuapp.com/";

// Wrapper for all components in the popup

var PopupComponents = function (_React$Component) {
    _inherits(PopupComponents, _React$Component);

    function PopupComponents(props) {
        _classCallCheck(this, PopupComponents);

        var _this = _possibleConstructorReturn(this, (PopupComponents.__proto__ || Object.getPrototypeOf(PopupComponents)).call(this, props));

        _this.state = {
            graph: null,
            showNewNotesForm: false,
            localServer: false
        };

        _this.getDataFromServer = _this.getDataFromServer.bind(_this);
        _this.switchShowNewNotesForm = _this.switchShowNewNotesForm.bind(_this);
        return _this;
    }

    // Verifies if the local server is being run


    _createClass(PopupComponents, [{
        key: "checkIfLocalServer",
        value: function checkIfLocalServer() {
            var _this2 = this;

            $.ajax(localServerURL, {
                complete: function complete(jqXHR, textStatus) {
                    if (textStatus === "success") _this2.setState({ localServer: true });else _this2.setState({ localServer: false });
                }
            });
        }
    }, {
        key: "switchShowNewNotesForm",
        value: function switchShowNewNotesForm() {
            document.getElementById("new-notes-form").reset();
            this.setState({ showNewNotesForm: !this.state.showNewNotesForm });
        }
    }, {
        key: "getDataFromServer",
        value: function getDataFromServer() {
            var _this3 = this;

            getGraphFromDisk().then(function (graph) {
                _this3.setState({ graph: graph });
            });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getDataFromServer();
            this.checkIfLocalServer();
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { id: "popup" },
                React.createElement(Header, null),
                React.createElement(
                    "div",
                    { id: "popup-body" },
                    React.createElement(ProjectList, { graph: this.state.graph, refresh: this.getDataFromServer }),
                    React.createElement(NewNotesArea, { showForm: this.state.showNewNotesForm, switchShowForm: this.switchShowNewNotesForm,
                        localServer: this.state.localServer })
                )
            );
        }
    }]);

    return PopupComponents;
}(React.Component);

// Header of the popup. Contains logo and home button


var Header = function (_React$Component2) {
    _inherits(Header, _React$Component2);

    function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
    }

    _createClass(Header, [{
        key: "openHomePage",

        // If the home page is already opened, it simply refreshes and goes to that page
        // If it's not open, a new tab is opened next to the current active tab
        value: function openHomePage() {
            chrome.tabs.query({
                title: "Knolist", currentWindow: true
            }, function (tabs) {
                // Check if a tab was found. If it was, it means the home page is already open
                if (tabs.length > 0) {
                    var tabId = tabs[0].id;
                    chrome.tabs.update(tabId, { active: true });
                } else {
                    // Open a new tab for the home page
                    chrome.tabs.query({
                        active: true, currentWindow: true
                    }, function (tabs) {
                        var index = tabs[0].index;
                        chrome.tabs.create({
                            url: "../../html/Knolist.com.html",
                            index: index + 1
                        });
                    });
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this5 = this;

            return React.createElement(
                "div",
                { className: "header", style: { height: "35px" } },
                React.createElement("img", { src: "../../images/horizontal_main.PNG", alt: "Knolist", style: { height: "100%" } }),
                React.createElement(
                    "div",
                    { style: { display: "flex" } },
                    React.createElement(ActivateProjectSwitch, null),
                    React.createElement(
                        "a",
                        { onClick: function onClick() {
                                return _this5.openHomePage();
                            }, id: "home-button" },
                        React.createElement("img", { src: "../../images/home-icon-black.png", alt: "Home", style: { height: "100%", margin: "1px" } })
                    )
                )
            );
        }
    }]);

    return Header;
}(React.Component);

// Dropdown list of all the projects, allows user to switch between them.


var ProjectList = function (_React$Component3) {
    _inherits(ProjectList, _React$Component3);

    function ProjectList(props) {
        _classCallCheck(this, ProjectList);

        var _this6 = _possibleConstructorReturn(this, (ProjectList.__proto__ || Object.getPrototypeOf(ProjectList)).call(this, props));

        _this6.state = {
            dropdownOpen: false,
            showNewProjectForm: false,
            alertMessage: null, // null for no issue, "invalid-title", or "repeated-title"
            invalidTitle: null
        };

        _this6.switchDropdown = _this6.switchDropdown.bind(_this6);
        _this6.switchShowNewProjectForm = _this6.switchShowNewProjectForm.bind(_this6);
        _this6.setAlertMessage = _this6.setAlertMessage.bind(_this6);
        _this6.setInvalidTitle = _this6.setInvalidTitle.bind(_this6);
        return _this6;
    }

    _createClass(ProjectList, [{
        key: "setAlertMessage",
        value: function setAlertMessage(value) {
            this.setState({ alertMessage: value });
        }
    }, {
        key: "setInvalidTitle",
        value: function setInvalidTitle(value) {
            this.setState({ invalidTitle: value });
        }
    }, {
        key: "switchDropdown",
        value: function switchDropdown() {
            this.setState({ dropdownOpen: !this.state.dropdownOpen });
        }
    }, {
        key: "switchShowNewProjectForm",
        value: function switchShowNewProjectForm() {
            document.getElementById("new-project-form").reset();
            this.setState({
                showNewProjectForm: !this.state.showNewProjectForm,
                alertMessage: null,
                invalidTitle: null
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this7 = this;

            if (this.props.graph === null) return null;

            // Define arrow icon to use based on whether dropdown is active
            var arrowIconURL = "../../images/down-chevron-icon-black.png";
            if (this.state.dropdownOpen) arrowIconURL = "../../images/up-chevron-icon-black.png";

            // Hide or display the dropdown content
            var dropdownStyle = { display: "none" };
            if (this.state.dropdownOpen) dropdownStyle = { display: "block" };

            return React.createElement(
                "div",
                { id: "projects-list" },
                React.createElement(
                    "div",
                    { style: { display: "flex", justifyContent: "space-between" } },
                    React.createElement(
                        "h4",
                        null,
                        "Current Project:"
                    ),
                    React.createElement(NewProjectButton, { showForm: this.state.showNewProjectForm,
                        switchShowForm: this.switchShowNewProjectForm })
                ),
                React.createElement(NewProjectForm, { showNewProjectForm: this.state.showNewProjectForm, refresh: this.props.refresh,
                    switchForm: this.switchShowNewProjectForm,
                    setAlertMessage: this.setAlertMessage,
                    setInvalidTitle: this.setInvalidTitle,
                    alertMessage: this.state.alertMessage,
                    invalidTitle: this.state.invalidTitle,
                    projects: Object.keys(this.props.graph) }),
                React.createElement(
                    "div",
                    { className: "dropdown" },
                    React.createElement(
                        "div",
                        { onClick: this.switchDropdown, id: "current-project-area" },
                        React.createElement(
                            "p",
                            null,
                            this.props.graph.curProject
                        ),
                        React.createElement(
                            "button",
                            { className: "dropdown-button" },
                            React.createElement("img", { src: arrowIconURL, alt: "Dropdown" })
                        )
                    ),
                    React.createElement(
                        "div",
                        { id: "myDropdown", className: "dropdown-content", style: dropdownStyle },
                        Object.keys(this.props.graph).map(function (project) {
                            return React.createElement(DropdownItem, { key: project,
                                projectName: project,
                                curProject: _this7.props.graph.curProject,
                                refresh: _this7.props.refresh,
                                switchDropdown: _this7.switchDropdown });
                        })
                    )
                )
            );
        }
    }]);

    return ProjectList;
}(React.Component);

// Button used to open the "create project" form


function NewProjectButton(props) {
    if (props.showForm) {
        return React.createElement(
            "button",
            { className: "button new-project-button cancel-new-project", onClick: props.switchShowForm },
            React.createElement(
                "p",
                null,
                "Cancel"
            )
        );
    }
    return React.createElement(
        "button",
        { className: "button new-project-button", onClick: props.switchShowForm },
        React.createElement("img", { src: "../../images/add-icon-black.png", alt: "New", style: { width: "100%" } })
    );
}

// Form to create a new project

var NewProjectForm = function (_React$Component4) {
    _inherits(NewProjectForm, _React$Component4);

    function NewProjectForm(props) {
        _classCallCheck(this, NewProjectForm);

        var _this8 = _possibleConstructorReturn(this, (NewProjectForm.__proto__ || Object.getPrototypeOf(NewProjectForm)).call(this, props));

        _this8.handleSubmit = _this8.handleSubmit.bind(_this8);
        return _this8;
    }

    _createClass(NewProjectForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this9 = this;

            // Prevent page from reloading
            event.preventDefault();

            // Data validation
            var title = event.target.newProjectTitle.value;
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
                createNewProjectInGraph(title).then(function () {
                    return _this9.props.refresh();
                });

                // Activate tracking
                document.getElementById("switch-tracking").checked = true;
                chrome.runtime.sendMessage({ command: "start-tracking" });

                // Reset entry and close form
                event.target.reset();
                // Close the form
                this.props.switchForm();
                // Hide alert message if there was one
                this.props.setAlertMessage(null);
                this.props.setInvalidTitle(null);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var style = { display: "none" };
            if (this.props.showNewProjectForm) {
                style = { display: "block" };
            }
            return React.createElement(
                "div",
                { style: style, id: "new-project-form-area" },
                React.createElement(
                    "form",
                    { id: "new-project-form", onSubmit: this.handleSubmit },
                    React.createElement("input", { type: "text", id: "newProjectTitle", name: "newProjectTitle", defaultValue: "New Project", required: true }),
                    React.createElement(
                        "button",
                        { className: "button create-project-button" },
                        "Create"
                    )
                ),
                React.createElement(AlertMessage, { alertMessage: this.props.alertMessage, projectTitle: this.props.invalidTitle })
            );
        }
    }]);

    return NewProjectForm;
}(React.Component);

/**
 * @return {null}
 */


function AlertMessage(props) {
    if (props.alertMessage === "invalid-title") {
        return React.createElement(
            "p",
            null,
            props.projectTitle,
            " is not a valid title."
        );
    }

    if (props.alertMessage === "repeated-title") {
        return React.createElement(
            "p",
            null,
            "You already have a project called ",
            props.projectTitle,
            "."
        );
    }

    return null;
}

// Each item in the project dropdown

var DropdownItem = function (_React$Component5) {
    _inherits(DropdownItem, _React$Component5);

    function DropdownItem(props) {
        _classCallCheck(this, DropdownItem);

        var _this10 = _possibleConstructorReturn(this, (DropdownItem.__proto__ || Object.getPrototypeOf(DropdownItem)).call(this, props));

        _this10.activateProject = _this10.activateProject.bind(_this10);
        return _this10;
    }

    _createClass(DropdownItem, [{
        key: "activateProject",
        value: function activateProject() {
            var _this11 = this;

            this.props.switchDropdown();
            setCurrentProjectInGraph(this.props.projectName).then(function () {
                return _this11.props.refresh();
            });
        }
    }, {
        key: "render",
        value: function render() {
            // Ignore properties that are not titles
            if (this.props.projectName === "curProject" || this.props.projectName === "version") return null;

            // Ignore current project
            if (this.props.projectName === this.props.curProject) return null;

            return React.createElement(
                "a",
                { onClick: this.activateProject },
                this.props.projectName
            );
        }
    }]);

    return DropdownItem;
}(React.Component);

var ActivateProjectSwitch = function (_React$Component6) {
    _inherits(ActivateProjectSwitch, _React$Component6);

    function ActivateProjectSwitch(props) {
        _classCallCheck(this, ActivateProjectSwitch);

        var _this12 = _possibleConstructorReturn(this, (ActivateProjectSwitch.__proto__ || Object.getPrototypeOf(ActivateProjectSwitch)).call(this, props));

        _this12.switchTracking = _this12.switchTracking.bind(_this12);
        return _this12;
    }

    _createClass(ActivateProjectSwitch, [{
        key: "switchTracking",
        value: function switchTracking() {
            if (document.getElementById("switch-tracking").checked) {
                chrome.runtime.sendMessage({ command: "start-tracking" });
            } else {
                chrome.runtime.sendMessage({ command: "stop-tracking" });
            }
        }
    }, {
        key: "setTrackingState",
        value: function setTrackingState() {
            chrome.runtime.sendMessage({ command: "get_tracking" }, function (response) {
                document.getElementById("switch-tracking").checked = response.trackBrowsing;
            });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setTrackingState();
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "label",
                { className: "switch" },
                React.createElement("input", { type: "checkbox", id: "switch-tracking", onClick: this.switchTracking }),
                React.createElement("span", { className: "switch-slider round" })
            );
        }
    }]);

    return ActivateProjectSwitch;
}(React.Component);

function NewNotesArea(props) {
    return React.createElement(
        "div",
        { style: { marginTop: "15px" } },
        React.createElement(NewNotesButton, { showForm: props.showForm, switchShowForm: props.switchShowForm }),
        React.createElement(NewNotesForm, { showForm: props.showForm, switchShowForm: props.switchShowForm,
            localServer: props.localServer })
    );
}

var NewNotesForm = function (_React$Component7) {
    _inherits(NewNotesForm, _React$Component7);

    function NewNotesForm(props) {
        _classCallCheck(this, NewNotesForm);

        var _this13 = _possibleConstructorReturn(this, (NewNotesForm.__proto__ || Object.getPrototypeOf(NewNotesForm)).call(this, props));

        _this13.handleSubmit = _this13.handleSubmit.bind(_this13);
        return _this13;
    }

    _createClass(NewNotesForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this14 = this;

            event.preventDefault();

            var notes = event.target.notes.value;

            this.props.switchShowForm(); // Hide the form
            event.target.reset(); // Clear the form entries

            // Get current page
            chrome.tabs.query({
                active: true, currentWindow: true
            }, function (tabs) {
                var currentURL = tabs[0].url;
                // Call from server
                var baseServerURL = deployedServerURL;
                if (_this14.props.localServer) {
                    // Use local server if it's active
                    baseServerURL = localServerURL;
                }
                var contentExtractionURL = baseServerURL + "extract?url=" + encodeURIComponent(currentURL);
                // Create item based on the current page
                $.getJSON(contentExtractionURL, function (item) {
                    addNotesToItemInGraph(item, notes);
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            // Hidden form for adding notes
            var style = { display: "none" };
            if (this.props.showForm) {
                style = { display: "flex" };
            }

            return React.createElement(
                "form",
                { id: "new-notes-form", onSubmit: this.handleSubmit, style: style },
                React.createElement("input", { id: "notes", name: "notes", type: "text", placeholder: "Insert Notes", required: true }),
                React.createElement(
                    "button",
                    { className: "button add-note-button", style: { marginTop: 0, marginBottom: 0 } },
                    "Add"
                )
            );
        }
    }]);

    return NewNotesForm;
}(React.Component);

// Button used to open the "create project" form


function NewNotesButton(props) {
    if (props.showForm) {
        return React.createElement(
            "button",
            { className: "button add-note-button", onClick: props.switchShowForm },
            React.createElement(
                "p",
                null,
                "Cancel"
            )
        );
    }
    return React.createElement(
        "button",
        { className: "button add-note-button", onClick: props.switchShowForm },
        React.createElement(
            "p",
            null,
            "Add notes to this page"
        )
    );
}

ReactDOM.render(React.createElement(PopupComponents, null), document.querySelector("#popup-wrapper"));