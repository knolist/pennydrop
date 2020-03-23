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

// Get a reference to the database service
var database = firebase.database();

addWebpageToDatabase = (userId, url) => {
    firebase.database().ref('sitesVisited/' + userId).push(url);
}

window.urls = {};
chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    let user = firebase.auth().currentUser;
    if (message.type == "knolistPopupLoaded") {
        if (user) {
          _sendResponse({type: "loggedIn", uid: user.uid});
        } else {
          _sendResponse({type: "loggedOut"});
        };
    } else if (message.type == "attemptLogin") {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          _sendResponse({uid: user.uid});
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
    }
    else if (message.url !== null && user) {
        addWebpageToDatabase(user.uid, message.url)
    }
    else if (message.command === "reset") {
        window.urls = {};
    }
});
