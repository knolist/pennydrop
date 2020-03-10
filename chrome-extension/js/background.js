window.urls = {};
chrome.runtime.onMessage.addListener(function(request) {
    window.urls[request.url] = request.url;
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({url: '../html/popup.html'})
});