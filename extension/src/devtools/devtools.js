'use strict';

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

/**
 * Proxy to be used to send log messages to the background script fom where they can be read.
 *
 * @param {String} message - Message to be printed into the background.js console
 * @param {Object} [obj]     - Object to log into the console.
 */
function log(message, obj){
  var logMessage = {
    task: 'log',
    text: message
  };

  if (!!obj){
    logMessage.obj = obj;
  }

  backgroundPageConnection.postMessage(logMessage);
}

backgroundPageConnection.onMessage.addListener(function (message) {

  // We only want to build the panel if angular was detected in the page
  if (message.task === 'initDevToolPanel'){
    log('building panel');
    chrome.devtools.panels.create(
      'Angular',
      'images/AngularJS-Shield-small.png',
      'src/panel/panel.html'
    );
    // Once the panel is built, this is not useful anymore, we disconnect to free resources
    backgroundPageConnection.disconnect();
  } else {
    log('Unknown task ', message.task);
  }
});

// Tell the background script to include this into the dispatch
backgroundPageConnection.postMessage({
  task: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.postMessage({
  task: 'injectContentScript',
  tabId: chrome.devtools.inspectedWindow.tabId
});