resetButtonClicked = () => {
    chrome.runtime.sendMessage({command: "reset"});
    chrome.tabs.reload();
}

viewFullWebsiteButtonClicked = () => {
    chrome.tabs.create({url: 'http://nolist.com'})
}

document.addEventListener('DOMContentLoaded', function () {

    // Add the urls to the page
    const bg = chrome.extension.getBackgroundPage();
    Object.keys(bg.urls).forEach(function (url) {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
    });

    // Button Listeners
    document.getElementById('reset-button').addEventListener('click', resetButtonClicked, false);
    document.getElementById('full-website-button').addEventListener('click', viewFullWebsiteButtonClicked, false);
}, false);
