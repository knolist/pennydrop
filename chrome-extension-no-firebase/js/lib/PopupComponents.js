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
            graph: null
        };

        _this.getDataFromServer = _this.getDataFromServer.bind(_this);
        return _this;
    }

    _createClass(PopupComponents, [{
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
                    React.createElement(ProjectList, { graph: this.state.graph, refresh: this.getDataFromServer })
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
                    "a",
                    { onClick: function onClick() {
                            return _this4.openHomePage();
                        }, id: "home-button" },
                    React.createElement("img", { src: "../../images/home-icon-black.png", alt: "Home", style: { height: "100%", margin: "1px" } })
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
            dropdownOpen: false
        };

        _this5.switchDropdown = _this5.switchDropdown.bind(_this5);
        return _this5;
    }

    _createClass(ProjectList, [{
        key: "switchDropdown",
        value: function switchDropdown() {
            this.setState({ dropdownOpen: !this.state.dropdownOpen });
        }
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            if (this.props.graph === null) return null;

            // Define arrow icon to use based on whether dropdown is active
            var arrowIconURL = "../../images/down-chevron-icon-black.png";
            if (this.state.dropdownOpen) arrowIconURL = "../../images/up-chevron-icon-black.png";

            return React.createElement(
                "div",
                { id: "projects-list" },
                React.createElement(
                    "h4",
                    null,
                    "Current Project:"
                ),
                React.createElement(
                    "div",
                    { className: "dropdown" },
                    React.createElement(
                        "div",
                        { id: "current-project-area" },
                        React.createElement(
                            "p",
                            null,
                            this.props.graph.curProject
                        ),
                        React.createElement(
                            "button",
                            { onClick: this.switchDropdown, className: "dropdown-button" },
                            React.createElement("img", { src: arrowIconURL, alt: "Dropdown" })
                        )
                    ),
                    React.createElement(
                        "div",
                        { id: "myDropdown", className: "dropdown-content" },
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

// Each item in the project dropdown


var DropdownItem = function (_React$Component4) {
    _inherits(DropdownItem, _React$Component4);

    function DropdownItem(props) {
        _classCallCheck(this, DropdownItem);

        var _this7 = _possibleConstructorReturn(this, (DropdownItem.__proto__ || Object.getPrototypeOf(DropdownItem)).call(this, props));

        _this7.activateProject = _this7.activateProject.bind(_this7);
        return _this7;
    }

    _createClass(DropdownItem, [{
        key: "activateProject",
        value: function activateProject() {
            var _this8 = this;

            this.props.switchDropdown();
            setCurrentProjectInGraph(this.props.projectName).then(function () {
                return _this8.props.refresh();
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
                { href: "#", onClick: this.activateProject },
                this.props.projectName
            );
        }
    }]);

    return DropdownItem;
}(React.Component);

ReactDOM.render(React.createElement(PopupComponents, null), document.querySelector("#popup-wrapper"));