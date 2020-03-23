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

window.urls = {};
chrome.runtime.onMessage.addListener(function(message, _sender, _sendResponse) {
    if (message.type == "knolistPopupLoaded") {
        //Get current authentication state and tell popup
        let user = firebase.auth().currentUser;
        if (user) {
          _sendResponse({type: "loggedIn"});
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
          // ...
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
    else if (message.url !== null) {
        window.urls[message.url] = message.url;
    }
    else if (message.command === "reset") {
        window.urls = {};
    }
});
