class BackgroundComponents extends React.Component {
    render() {
        return (
            <div>
                <p>Hello, world!</p>
            </div>
        );
    }
}


ReactDOM.render(<BackgroundComponents/>, document.querySelector("#background-page"));