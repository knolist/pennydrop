// This page runs whenever a new tab or website is opened.
// We wait 1 second because some pages like to redirect... especially wikipedia

window.setTimeout(() => {
    chrome.runtime.sendMessage({
        url: window.location.href,
        prevURL: document.referrer
    });
}, 1000);

// listener = (message, _sender, _sendResponse) => {
//     if (message.command === "find_similar") {
//         const selectedText = window.getSelection().toString();
//         if (selectedText === "") {
//             _sendResponse("Nothing is selected");
//         } else {
//             _sendResponse(selectedText);
//         }
//     }
// };
//
// chrome.runtime.onMessage.addListener(listener);
