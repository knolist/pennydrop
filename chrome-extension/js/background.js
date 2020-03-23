window.urls = {};
chrome.runtime.onMessage.addListener(function(request) {
    if (request.url !== null) {
        window.urls[request.url] = request.url;
    }
    if (request.command === "reset") {
        window.urls = {};
    }
});
