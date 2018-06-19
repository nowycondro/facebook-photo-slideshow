/* global chrome, ga, LZString */
const PHOTO_PATH = ['/photos', '/photos/', '/photos_all', 'photos_of', '/media_set']
const PLAY_BTN_ID = 'slider-play-btn'

let imageUrl = []

const isPhotoPage = () => !!PHOTO_PATH.find(path => {
  const pathname = document.location.pathname
  const index = pathname.lastIndexOf(path)
  if (index < 0) { return false }

  return index === (pathname.length - path.length)
})

const isMediaSetPage = () => {
  const mediaSet = '/media_set'
  const pathname = document.location.pathname
  const index = pathname.lastIndexOf(mediaSet)
  if (index < 0) { return false }

  return index === (pathname.length - mediaSet.length)
}

const createPlayButton = () => {
  const playBtn = document.querySelector(`#${PLAY_BTN_ID}`)
  if (playBtn) {
    if (isPhotoPage()) {
      playBtn.classList.add('is-photo-page')
    } else {
      playBtn.classList.remove('is-photo-page')
    }
  } else {
    const elem = document.createElement('div')

    elem.id = PLAY_BTN_ID
    elem.textContent = 'Play'

    elem.addEventListener('click', () => {
      if (imageUrl.length > 0) {
        const optionsPage = LZString.compressToEncodedURIComponent(imageUrl.join(','))
        chrome.runtime.sendMessage({optionsPage})
        ga('send', 'event', {
          'eventCategory': 'play-btn',
          'eventAction': 'play',
          'eventLabel': imageUrl.length
        })
      }
    }, false)

    document.body.appendChild(elem)
  }
}

const getUrlFromAttribute = () => {
  // const selector = 'a.uiMediaThumb:not([class~="albumThumbLink"])'
  const selector = '#pagelet_timeline_medley_photos div:not([class~="hidden_elem"]) > ul > li.fbPhotoStarGridElement'
  const nodeList = document.querySelectorAll(selector)
  return Array.from(nodeList)
    .map(node => encodeURIComponent(node.attributes['data-starred-src'].value))
}

chrome.runtime.onMessage.addListener((data) => {
  if (data.imageUrl && isPhotoPage()) {
    if (isMediaSetPage()) {
      imageUrl.push(encodeURIComponent(data.imageUrl))
    } else {
      const urlFromAttribute = getUrlFromAttribute()
      if (urlFromAttribute.length > 0) {
        imageUrl = urlFromAttribute
      } else {
        imageUrl.push(encodeURIComponent(data.imageUrl))
      }
    }
  }

  if (data.changeInfo && data.changeInfo.status === 'complete') {
    if (!isPhotoPage()) {
      imageUrl = []
    }
    createPlayButton()
  }

  const badgeText = imageUrl.length > 0 ? imageUrl.length.toString() : ''

  if (data.updateBadgeTextRequest) {
    chrome.runtime.sendMessage({badgeText})
  }

  chrome.runtime.sendMessage({badgeText})
})

chrome.runtime.sendMessage({ready: true}, (data) => {
  if (data.ready) {
    ga('create', 'UA-22076179-7', 'auto')
    ga('set', 'checkProtocolTask', () => {})
    ga('require', 'displayfeatures')
  }
})

document.addEventListener('DOMContentLoaded', () => createPlayButton())
