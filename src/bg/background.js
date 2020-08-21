/* global chrome */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {changeInfo, tabUrl: tab.url})
  }
})

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  if (data.ready) {
    sendResponse(data)
  }

  if (typeof data.badgeText === 'string') {
    chrome.browserAction.setBadgeText({text: `${data.badgeText}`})
  }

  if (typeof data.optionsPage === 'string') {
    const optionsURL = chrome.runtime.getURL('options/index.html')
    chrome.windows.create({url: `${optionsURL}?LZSsrc=${data.optionsPage}`, state: 'fullscreen'})
  }
})

chrome.tabs.onActivated.addListener(({tabId, windowId} = {}) => {
  chrome.tabs.query({windowId, 'active': true, 'lastFocusedWindow': true}, ([tab]) => {
    const isFBtab = tab && tab.url && tab.url.indexOf('https://www.facebook.com') === 0

    if (isFBtab) {
      chrome.tabs.sendMessage(tabId, {updateBadgeTextRequest: true})
      chrome.browserAction.setIcon({path: 'img/icon24.png'})
    } else {
      chrome.browserAction.setIcon({path: 'img/icon24-gray.png'})
    }
  })
})

chrome.webRequest.onCompleted.addListener((details) => {
  chrome.tabs.sendMessage(details.tabId, {pageCompleted: true, tabUrl: 'https://www.facebook.com'})
}, {urls: ['https://*.facebook.com/*']})
