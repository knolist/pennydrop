document.addEventListener('DOMContentLoaded', function () {
    const bg = chrome.extension.getBackgroundPage();
    Object.keys(bg.urls).forEach(function (url) {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
    });
}, false);