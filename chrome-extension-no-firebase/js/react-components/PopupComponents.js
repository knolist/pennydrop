/**
 * This is the file that contains the React components for the popup.
 * You must only edit this file, not the one in the `lib` directory.
 * This file uses JSX, so it's necessary to compile the code into plain JS using Babel. Instructions on how to do this
 * are in the README
 */

// Wrapper for all components in the popup
class PopupComponents extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div id="popup">
                <Header/>
            </div>
        );
    }
}

function Header() {
    return (
        <div className="header" style={{height: "35px"}}>
            <img src="../../images/horizontal_main.PNG" alt="Knolist" style={{height: "100%"}}/>
        </div>
    );
}

ReactDOM.render(<PopupComponents/>, document.querySelector("#popup-wrapper"));