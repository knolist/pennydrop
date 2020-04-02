chrome.runtime.sendMessage({
    url: window.location.href,
    prevURL: document.referrer
});
