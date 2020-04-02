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
          var token = result.credential.accessToken;
          var user = result.user;
          _sendResponse({uid: user.uid});
        }).catch(function(error) {
          // haha, error handling
        });
    }
    else if (message.url != undefined && user) {
        contextExtractionURL = "http://boilerpipe-web.appspot.com/extract?output=json&url=" + encodeURIComponent(message.url);
        $.get(contextExtractionURL, function( data ) {
            if (data["status"] == "success") {
              websiteItem = {
                ...data["response"],
                prevURL: message.prevURL
              }
            }
            else {
              websiteItem = data["error"]
            }
            firebase.database().ref('sitesVisited/' + user.uid).push(websiteItem);
        });
    }
    else if (message.command == "reset") {
        firebase.database().ref('sitesVisited/').child(user.uid).remove();
    }

});
