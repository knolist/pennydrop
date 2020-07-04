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
            graph: null
        };

        this.getDataFromServer = this.getDataFromServer.bind(this);
    }

    getDataFromServer() {

    }

    render() {
        return (
            <div id="popup">
                <Header/>
            </div>
        );
    }
}

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
                <a onClick={() => this.openHomePage()} id="home-button">
                    <img src="../../images/home-icon-black.png" alt="Home" style={{height: "100%", margin: "1px"}}/>
                </a>
            </div>
        );
    }
}

// class ProjectList extends React.Component {
//
// }

ReactDOM.render(<PopupComponents/>, document.querySelector("#popup-wrapper"));