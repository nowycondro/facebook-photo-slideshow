/* global chrome */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {changeInfo})
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

chrome.webRequest.onCompleted.addListener((details) => {
  const imageUrl = details.url
  const isImageUrl = imageUrl.indexOf('https://scontent-') === 0 && imageUrl.indexOf('/v/t1.0-0') > 0
  if (isImageUrl) {
    chrome.tabs.sendMessage(details.tabId, {imageUrl})
  }
}, {urls: ['https://*.fbcdn.net/*']})

chrome.tabs.onActivated.addListener(({tabId, windowId} = {}) => {
  chrome.tabs.query({windowId, 'active': true, 'lastFocusedWindow': true}, ([tab]) => {
    const isFBtab = tab.url.indexOf('https://www.facebook.com') === 0
    if (isFBtab) {
      chrome.tabs.sendMessage(tabId, {updateBadgeTextRequest: true})
      chrome.browserAction.setIcon({path: 'img/icon24.png'})
    } else {
      chrome.browserAction.setIcon({path: 'img/icon24-gray.png'})
      chrome.browserAction.setBadgeText({text: ''})
    }
  })
})
