var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KnolistComponents = function (_React$Component) {
    _inherits(KnolistComponents, _React$Component);

    function KnolistComponents(props) {
        _classCallCheck(this, KnolistComponents);

        return _possibleConstructorReturn(this, (KnolistComponents.__proto__ || Object.getPrototypeOf(KnolistComponents)).call(this, props));
    }

    _createClass(KnolistComponents, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(Header, null),
                React.createElement(
                    "div",
                    { className: "main-body" },
                    React.createElement(
                        "div",
                        { style: { display: "flex" } },
                        React.createElement(
                            "p",
                            { style: { fontSize: 20 } },
                            "Welcome to Knolist.com. You're already logged in :)"
                        )
                    ),
                    React.createElement(MindMap, null)
                )
            );
        }
    }]);

    return KnolistComponents;
}(React.Component);

var MindMap = function (_React$Component2) {
    _inherits(MindMap, _React$Component2);

    function MindMap(props) {
        _classCallCheck(this, MindMap);

        var _this2 = _possibleConstructorReturn(this, (MindMap.__proto__ || Object.getPrototypeOf(MindMap)).call(this, props));

        _this2.state = {
            graph: createNewGraph(),
            selectedNode: null
        };
        _this2.getDataFromServer = _this2.getDataFromServer.bind(_this2);
        _this2.handleClickedNode = _this2.handleClickedNode.bind(_this2);
        _this2.resetSelectedNode = _this2.resetSelectedNode.bind(_this2);
        return _this2;
    }

    _createClass(MindMap, [{
        key: "titleCase",
        value: function titleCase(str) {
            str = str.toLowerCase().split(' ');
            for (var i = 0; i < str.length; i++) {
                str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
            }
            return str.join(' ');
        }
    }, {
        key: "getDataFromServer",
        value: function getDataFromServer() {
            // All the websites as a graph
            getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place

            // window.setTimeout(() => {
            //     this.getDataFromServer();
            // }, 200);
        }
    }, {
        key: "resetSelectedNode",
        value: function resetSelectedNode() {
            this.setState({ selectedNode: null });
        }
    }, {
        key: "handleClickedNode",
        value: function handleClickedNode(values, id, selected, hovering) {
            var visCloseButton = document.getElementsByClassName("vis-close")[0];
            // Only open modal outside of edit mode
            if (getComputedStyle(visCloseButton).display === "none") {
                var curProject = this.state.graph.curProject;
                this.setState({ selectedNode: this.state.graph[curProject][id] });
            }
        }
    }, {
        key: "setupVisGraph",
        value: function setupVisGraph() {
            var nodes = [];
            var edges = [];
            var curProject = this.state.graph.curProject;
            for (var index in this.state.graph[curProject]) {
                var node = this.state.graph[curProject][index];
                nodes.push({ id: node.source, label: node.title });
                for (var nextIndex in node.nextURLs) {
                    edges.push({ from: node.source, to: node.nextURLs[nextIndex] });
                }
            }
            console.log(nodes);
            console.log(edges);

            // create a network
            // TODO: Store the positions of each node to always render in the same way (allow user to move them around)
            // TODO: Consider using hierarchical layout mode (commented out in the options)
            var container = document.getElementById("graph");
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
                nodes: {
                    shape: "box",
                    size: 16,
                    margin: 10,
                    // physics: false,
                    chosen: {
                        node: this.handleClickedNode
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true
                        }
                    },
                    color: "black"
                },
                // layout: {
                //     hierarchical: true
                // },
                interaction: {
                    navigationButtons: true,
                    selectConnectedEdges: false
                },
                manipulation: {
                    enabled: true
                },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -0.001,
                        centralGravity: 0,
                        springLength: 230,
                        springConstant: 0,
                        avoidOverlap: 1
                    },
                    maxVelocity: 146,
                    solver: "forceAtlas2Based",
                    timestep: 0.35,
                    stabilization: { iterations: 150 }
                }
            };
            var network = new vis.Network(container, data, options);
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getDataFromServer();
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            // Don't refresh the graph if we only changed the selected node
            // TODO: this won't be necessary once we store the positions of the nodes

            var bothNull = prevState.selectedNode === null && this.state.selectedNode === null;
            var notNullButEqual = prevState.selectedNode !== null && this.state.selectedNode !== null && prevState.selectedNode.source === this.state.selectedNode.source;

            if (bothNull || notNullButEqual) {
                this.setupVisGraph();
            }
        }
    }, {
        key: "render",
        value: function render() {
            if (this.state.graph === null) {
                return null;
            }
            var curProject = this.state.graph.curProject;
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { id: "title-bar" },
                    React.createElement(RefreshGraphButton, { refresh: this.getDataFromServer }),
                    React.createElement(
                        "h2",
                        { style: { margin: "auto auto" } },
                        "Current Project: ",
                        this.titleCase(this.state.graph.curProject)
                    )
                ),
                React.createElement("div", { id: "graph" }),
                React.createElement(PageView, { graph: this.state.graph[curProject], selectedNode: this.state.selectedNode, resetSelectedNode: this.resetSelectedNode })
            );
        }
    }]);

    return MindMap;
}(React.Component);

var PageView = function (_React$Component3) {
    _inherits(PageView, _React$Component3);

    function PageView(props) {
        _classCallCheck(this, PageView);

        // When the user clicks anywhere outside of the modal, close it
        var _this3 = _possibleConstructorReturn(this, (PageView.__proto__ || Object.getPrototypeOf(PageView)).call(this, props));

        window.onclick = function (event) {
            if (event.target === document.getElementById("page-view")) {
                props.resetSelectedNode();
            }
        };
        return _this3;
    }

    _createClass(PageView, [{
        key: "render",
        value: function render() {
            if (this.props.selectedNode === null) {
                return null;
            }
            return React.createElement(
                "div",
                { id: "page-view", className: "modal" },
                React.createElement(
                    "div",
                    { className: "modal-content" },
                    React.createElement(
                        "button",
                        { className: "close-modal button", id: "close-page-view", onClick: this.props.resetSelectedNode },
                        "\xD7"
                    ),
                    React.createElement(
                        "a",
                        { href: this.props.selectedNode.source, target: "_blank" },
                        React.createElement(
                            "h1",
                            null,
                            this.props.selectedNode.title
                        )
                    ),
                    React.createElement(HighlightsList, { highlights: this.props.selectedNode.highlights }),
                    React.createElement(
                        "div",
                        { style: { display: "flex" } },
                        React.createElement(ListURL, { type: "prev", graph: this.props.graph, selectedNode: this.props.selectedNode }),
                        React.createElement(ListURL, { type: "next", graph: this.props.graph, selectedNode: this.props.selectedNode })
                    )
                )
            );
        }
    }]);

    return PageView;
}(React.Component);

var ListURL = function (_React$Component4) {
    _inherits(ListURL, _React$Component4);

    function ListURL(props) {
        _classCallCheck(this, ListURL);

        return _possibleConstructorReturn(this, (ListURL.__proto__ || Object.getPrototypeOf(ListURL)).call(this, props));
    }

    _createClass(ListURL, [{
        key: "render",
        value: function render() {
            var _this5 = this;

            if (this.props.type === "prev") {
                return React.createElement(
                    "div",
                    { className: "url-column" },
                    React.createElement(
                        "h2",
                        { style: { textAlign: "center" } },
                        "Previous Connections"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.selectedNode.prevURLs.map(function (url, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                React.createElement(
                                    "a",
                                    { href: _this5.props.graph[url].source, target: "_blank" },
                                    _this5.props.graph[url].title
                                )
                            );
                        })
                    )
                );
            } else if (this.props.type === "next") {
                return React.createElement(
                    "div",
                    { className: "url-column" },
                    React.createElement(
                        "h2",
                        { style: { textAlign: "center" } },
                        "Next Connections"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.selectedNode.nextURLs.map(function (url, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                React.createElement(
                                    "a",
                                    { href: _this5.props.graph[url].source, target: "_blank" },
                                    _this5.props.graph[url].title
                                )
                            );
                        })
                    )
                );
            } else return null;
        }
    }]);

    return ListURL;
}(React.Component);

var HighlightsList = function (_React$Component5) {
    _inherits(HighlightsList, _React$Component5);

    function HighlightsList(props) {
        _classCallCheck(this, HighlightsList);

        return _possibleConstructorReturn(this, (HighlightsList.__proto__ || Object.getPrototypeOf(HighlightsList)).call(this, props));
    }

    _createClass(HighlightsList, [{
        key: "render",
        value: function render() {
            if (this.props.highlights.length !== 0) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "h2",
                        null,
                        "My Highlights"
                    ),
                    React.createElement(
                        "ul",
                        null,
                        this.props.highlights.map(function (highlight, index) {
                            return React.createElement(
                                "li",
                                { key: index },
                                highlight
                            );
                        })
                    )
                );
            }
            return React.createElement(
                "h2",
                null,
                "You haven't added any highlights yet."
            );
        }
    }]);

    return HighlightsList;
}(React.Component);

var RefreshGraphButton = function (_React$Component6) {
    _inherits(RefreshGraphButton, _React$Component6);

    function RefreshGraphButton(props) {
        _classCallCheck(this, RefreshGraphButton);

        return _possibleConstructorReturn(this, (RefreshGraphButton.__proto__ || Object.getPrototypeOf(RefreshGraphButton)).call(this, props));
    }

    _createClass(RefreshGraphButton, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "button",
                { onClick: this.props.refresh, className: "button" },
                React.createElement("img", { src: "../../images/refresh-icon.png", alt: "Refresh Button", style: { width: "100%" } })
            );
        }
    }]);

    return RefreshGraphButton;
}(React.Component);

var Header = function (_React$Component7) {
    _inherits(Header, _React$Component7);

    function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
    }

    _createClass(Header, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "header" },
                React.createElement("img", { className: "logo", src: "../../images/full_main.PNG", alt: "Knolist Logo" })
            );
        }
    }]);

    return Header;
}(React.Component);

ReactDOM.render(React.createElement(KnolistComponents, null), document.querySelector("#knolist-page"));