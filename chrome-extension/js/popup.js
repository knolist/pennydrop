document.addEventListener('DOMContentLoaded', function () {

    // Add the urls to the page
    const bg = chrome.extension.getBackgroundPage();
    Object.keys(bg.urls).forEach(function (url) {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
    });

    // Reset button functionality
    document.getElementById('reset-button').addEventListener('click', onclick, false);
    function onclick () {
        chrome.runtime.sendMessage({command: "reset"});
        chrome.tabs.reload();
    }

}, false);