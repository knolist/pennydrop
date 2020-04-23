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
                React.createElement(MindMap, null)
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
        key: "getDataFromServer",
        value: function getDataFromServer() {
            var _this3 = this;

            // All the websites as a graph
            getGraphFromDiskToReact(this.state.graph, this); // This method updates the passed in graph variable in place
            // let trackBrowsing = false; //default to not tracking

            window.setTimeout(function () {
                _this3.getDataFromServer();
            }, 2000);
        }
    }, {
        key: "setupVisGraph",
        value: function setupVisGraph() {
            var nodes = [];
            var edges = [];
            for (var index in this.state.graph.default) {
                var node = this.state.graph.default[index];
                nodes.push(node);
                for (var nextIndex in node.nextURLs) {
                    edges.push({ source: node.source, target: node.nextURLs[nextIndex] });
                }
            }

            // create a network
            var container = document.getElementById("graph");
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
                nodes: {
                    shape: "dot",
                    size: 16
                },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 230,
                        springConstant: 0.18
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
            this.setupVisGraph();
        }

        // componentDidUpdate() {
        //     this.setupVisGraph();
        // }

    }, {
        key: "render",
        value: function render() {
            if (this.state.graph === null) {
                return 0;
            }
            return React.createElement("div", { id: "graph" });
        }
    }]);

    return MindMap;
}(React.Component);

ReactDOM.render(React.createElement(KnolistComponents, null), document.querySelector("#knolist-page"));