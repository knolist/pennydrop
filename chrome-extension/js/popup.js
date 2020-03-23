resetButtonClicked = () => {
    chrome.runtime.sendMessage({command: "reset"});
    //chrome.tabs.reload();
}

viewFullWebsiteButtonClicked = () => {
    chrome.tabs.create({url: 'http://nolist.com'})
}

tryToLogin = () => {
    chrome.runtime.sendMessage({type: "attemptLogin"});
    //chrome.tabs.reload();
}

createClickListeners = () => {
    // Add the urls to the page
    const bg = chrome.extension.getBackgroundPage();
    Object.keys(bg.urls).forEach(function (url) {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
    });
    chrome.runtime.sendMessage({type: "knolistPopupLoaded"}, function (response) {
        if (response.type == "loggedIn") {
            document.querySelector("#loginSection").style.display = "none";
            document.querySelector("#alreadyLoggedInSection").style.display = "block";
        } else if (response.type == "loggedOut") {
            document.querySelector("#loginSection").style.display = "block";
            document.querySelector("#alreadyLoggedInSection").style.display = "none";
        };
    });
    // Button Listeners
    document.getElementById('reset-button').addEventListener('click', resetButtonClicked, false);
    document.getElementById('login-button').addEventListener('click', tryToLogin, false);
    document.getElementById('full-website-button').addEventListener('click', viewFullWebsiteButtonClicked, false);
}

document.addEventListener('DOMContentLoaded', createClickListeners, false);

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyB5EjYw_uhjZjgZYxsK_JongqAPkupo270",
  authDomain: "penny-flop.firebaseapp.com",
  databaseURL: "https://penny-flop.firebaseio.com",
  projectId: "penny-flop",
  storageBucket: "penny-flop.appspot.com",
  messagingSenderId: "230720099647",
  appId: "1:230720099647:web:29fe3da92922d6b81b6f8a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
