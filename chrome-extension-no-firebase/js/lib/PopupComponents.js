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

// Wrapper for all components in the popup
var PopupComponents = function (_React$Component) {
    _inherits(PopupComponents, _React$Component);

    function PopupComponents(props) {
        _classCallCheck(this, PopupComponents);

        var _this = _possibleConstructorReturn(this, (PopupComponents.__proto__ || Object.getPrototypeOf(PopupComponents)).call(this, props));

        _this.state = {
            graph: null,
            showNewNotesForm: false
        };

        _this.getDataFromServer = _this.getDataFromServer.bind(_this);
        _this.switchShowNewNotesForm = _this.switchShowNewNotesForm.bind(_this);
        return _this;
    }

    _createClass(PopupComponents, [{
        key: "switchShowNewNotesForm",
        value: function switchShowNewNotesForm() {
            document.getElementById("new-notes-form").reset();
            this.setState({ showNewNotesForm: !this.state.showNewNotesForm });
        }
    }, {
        key: "getDataFromServer",
        value: function getDataFromServer() {
            var _this2 = this;

            getGraphFromDisk().then(function (graph) {
                _this2.setState({ graph: graph });
            });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getDataFromServer();
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
                    React.createElement(NewNotesArea, { showForm: this.state.showNewNotesForm, switchShowForm: this.switchShowNewNotesForm })
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
        value: function openHomePage() {
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
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

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
                                return _this4.openHomePage();
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

        var _this5 = _possibleConstructorReturn(this, (ProjectList.__proto__ || Object.getPrototypeOf(ProjectList)).call(this, props));

        _this5.state = {
            dropdownOpen: false,
            showNewProjectForm: false,
            alertMessage: null, // null for no issue, "invalid-title", or "repeated-title"
            invalidTitle: null
        };

        _this5.switchDropdown = _this5.switchDropdown.bind(_this5);
        _this5.switchShowNewProjectForm = _this5.switchShowNewProjectForm.bind(_this5);
        _this5.setAlertMessage = _this5.setAlertMessage.bind(_this5);
        _this5.setInvalidTitle = _this5.setInvalidTitle.bind(_this5);
        return _this5;
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
            var _this6 = this;

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
                                curProject: _this6.props.graph.curProject,
                                refresh: _this6.props.refresh,
                                switchDropdown: _this6.switchDropdown });
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

        var _this7 = _possibleConstructorReturn(this, (NewProjectForm.__proto__ || Object.getPrototypeOf(NewProjectForm)).call(this, props));

        _this7.handleSubmit = _this7.handleSubmit.bind(_this7);
        return _this7;
    }

    _createClass(NewProjectForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            var _this8 = this;

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
                    return _this8.props.refresh();
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

        var _this9 = _possibleConstructorReturn(this, (DropdownItem.__proto__ || Object.getPrototypeOf(DropdownItem)).call(this, props));

        _this9.activateProject = _this9.activateProject.bind(_this9);
        return _this9;
    }

    _createClass(DropdownItem, [{
        key: "activateProject",
        value: function activateProject() {
            var _this10 = this;

            this.props.switchDropdown();
            setCurrentProjectInGraph(this.props.projectName).then(function () {
                return _this10.props.refresh();
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

        var _this11 = _possibleConstructorReturn(this, (ActivateProjectSwitch.__proto__ || Object.getPrototypeOf(ActivateProjectSwitch)).call(this, props));

        _this11.switchTracking = _this11.switchTracking.bind(_this11);
        return _this11;
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
        { style: { marginTop: "10px" } },
        React.createElement(NewNotesButton, { showForm: props.showForm, switchShowForm: props.switchShowForm }),
        React.createElement(NewNotesForm, { showForm: props.showForm, switchShowForm: props.switchShowForm })
    );
}

var NewNotesForm = function (_React$Component7) {
    _inherits(NewNotesForm, _React$Component7);

    function NewNotesForm(props) {
        _classCallCheck(this, NewNotesForm);

        var _this12 = _possibleConstructorReturn(this, (NewNotesForm.__proto__ || Object.getPrototypeOf(NewNotesForm)).call(this, props));

        _this12.handleSubmit = _this12.handleSubmit.bind(_this12);
        return _this12;
    }

    _createClass(NewNotesForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            event.preventDefault();

            var notes = event.target.notes.value;

            this.props.switchShowForm(); // Hide the form
            event.target.reset(); // Clear the form entries

            // Get current page
            chrome.tabs.query({
                active: true, currentWindow: true
            }, function (tabs) {
                var currentURL = tabs[0].url;
                var contextExtractionURL = "http://127.0.0.1:5000/extract?url=" + encodeURIComponent(currentURL);
                // Create item based on the current page
                $.getJSON(contextExtractionURL, function (item) {
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