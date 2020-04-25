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
            graph: createNewGraph()
        };
        _this2.getDataFromServer = _this2.getDataFromServer.bind(_this2);
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
        key: "setupVisGraph",
        value: function setupVisGraph() {
            var nodes = [];
            var edges = [];
            for (var index in this.state.graph.default) {
                var node = this.state.graph.default[index];
                nodes.push({ id: node.source, label: node.title });
                for (var nextIndex in node.nextURLs) {
                    edges.push({ from: node.source, to: node.nextURLs[nextIndex] });
                }
            }
            console.log(nodes);
            console.log(edges);

            // create a network
            // TODO: Store the positions of each node to always render in the same way (allow user to move them around)
            var container = document.getElementById("graph");
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
                nodes: {
                    shape: "box",
                    size: 16,
                    margin: 10
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true
                        }
                    }
                },
                interaction: {
                    navigationButtons: true,
                    selectConnectedEdges: false
                },
                manipulation: {
                    enabled: true
                },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -10,
                        centralGravity: 0.005,
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
            this.setupVisGraph();
        }
    }, {
        key: "render",
        value: function render() {
            if (this.state.graph === null) {
                return 0;
            }
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
                React.createElement("div", { id: "graph" })
            );
        }
    }]);

    return MindMap;
}(React.Component);

var RefreshGraphButton = function (_React$Component3) {
    _inherits(RefreshGraphButton, _React$Component3);

    function RefreshGraphButton(props) {
        _classCallCheck(this, RefreshGraphButton);

        return _possibleConstructorReturn(this, (RefreshGraphButton.__proto__ || Object.getPrototypeOf(RefreshGraphButton)).call(this, props));
    }

    _createClass(RefreshGraphButton, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "button",
                { onClick: this.props.refresh, id: "refresh-button" },
                React.createElement("img", { src: "../../images/refresh-icon.png", alt: "Refresh Button", style: { width: "100%" } })
            );
        }
    }]);

    return RefreshGraphButton;
}(React.Component);

var Header = function (_React$Component4) {
    _inherits(Header, _React$Component4);

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