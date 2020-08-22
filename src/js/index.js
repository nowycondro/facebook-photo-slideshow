/* global chrome, LZString */
const PLAY_BTN_ID = 'slider-play-btn'
const getAllAjaxifyLink = () => {
  return [...document.querySelectorAll("a")]
    .filter(({href}) => href.indexOf("https://www.facebook.com/photo") === 0)
    .map(({href}) => href);
}

const createPlayButton = () => {
  const playBtn = document.querySelector(`#${PLAY_BTN_ID}`)

  if (playBtn) {
    return playBtn
  }

  const elem = document.createElement('div')

  elem.id = PLAY_BTN_ID
  elem.textContent = 'Play'
  elem.addEventListener('click', () => {
    const ajaxifyLink = getAllAjaxifyLink()

    if (ajaxifyLink.length > 0) {
      const optionsPage = LZString.compressToEncodedURIComponent(ajaxifyLink.join('___'))
      chrome.runtime.sendMessage({optionsPage})
    }
  }, false)

  if(document.body) {
    document.body.appendChild(elem)
  }

  return elem
}

const updateBadgeText = (playBtn) => {
  const ajaxifyLink = getAllAjaxifyLink()
  const photoCount = ajaxifyLink.length
  const badgeText = photoCount > 0 ? `${photoCount}` : ''

  if (playBtn) {
    if (photoCount > 0) {
      playBtn.textContent = `Play ${photoCount}`
      playBtn.classList.add('is-photo-page')
    } else {
      playBtn.textContent = 'Play'
      playBtn.classList.remove('is-photo-page')
    }
  }

  chrome.runtime.sendMessage({badgeText})
}

chrome.runtime.onMessage.addListener((data) => {
  updateBadgeText(createPlayButton())
})

chrome.runtime.sendMessage({ready: true}, (data) => {
  if (data.ready) {}
})

document.addEventListener('DOMContentLoaded', () => createPlayButton())
