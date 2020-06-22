resetButtonClicked = () => {
    chrome.runtime.sendMessage({command: "reset"});
};

notesButtonClicked = () => {
    var txt;
    var person = prompt("Please enter your name:", "Harry Potter");
};

viewFullWebsiteButtonClicked = () => {
    chrome.tabs.query({
            active: true, currentWindow: true
        }, tabs => {
            let index = tabs[0].index;
            chrome.tabs.create({
                url: '../html/Knolist.com.html',
                index: index + 1
            });
        }
    );
    //chrome.tabs.create({url: '../html/Knolist.com.html'})
};

setTrackingState = () => {
    chrome.runtime.sendMessage({command: "get_tracking"}, function(response) {
        document.getElementById("switch-tracking").checked = response.trackBrowsing;
    });
};

window.onload = setTrackingState;

switchTracking = () => {
    if (document.getElementById("switch-tracking").checked) {
        chrome.runtime.sendMessage({command: "start", project: "default"});
    } else {
        chrome.runtime.sendMessage({command: "stop"});
    }
};

createListenerToListSitesVisited = (userId) => {
    console.log(firebase.database())
    var visitedSitesDatabase = firebase.database().ref('sitesVisited/' + userId);
    console.log(visitedSitesDatabase)
    visitedSitesDatabase.on('value', function (snapshot) {
      console.log(snapshot.val())
      websites = snapshot.val();
      websites = Object.values(websites);
      websites.forEach((url) => {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
      });
    });
}

findSomethingSimilarButtonClicked = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "find_similar"}, function(selectedText) {
      chrome.runtime.sendMessage({command: "find_similar_msg", selectedText: selectedText, currentURL: tabs[0].url});
    });
  });
};

createListeners = () => {
    // Button Listeners
    $( "#reset-button" ).click(resetButtonClicked);
    $( "#notes-botton" ).click(notesButtonClicked);
    $( "#full-website-button" ).click(viewFullWebsiteButtonClicked);
    $( "#find-something-similar-button" ).click(findSomethingSimilarButtonClicked);
    $( "#switch-tracking" ).click(switchTracking)
};

document.addEventListener('DOMContentLoaded', createListeners, false);
