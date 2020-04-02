// This page runs whenever a new tab or website is opened.
// We wait 1 second because some pages like to redirect... especially wikipedia

window.onload = () => {
    window.setTimeout(() => {
      chrome.runtime.sendMessage({
        url: window.location.href,
        prevURL: document.referrer
      });
    }, 1000);
}
