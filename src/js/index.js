/* global chrome, ga, LZString */
const PHOTO_PATH = ['/photos', '/photos/', '/photos_all', 'photos_of', '/media_set']
const PLAY_BTN_ID = 'slider-play-btn'

const CACHE = {}

const getQuery = (search) => search
  .substring(1)
  .split('&')
  .map(item => item.split('='))
  .reduce((prev, [key, value]) => ({
    ...prev,
    [key]: value
  }), {})

const isLegacyProfile = (query, pathname) => pathname === '/profile.php' && query.sk === 'photos'
const isPhotoPage = (query, pathname) => isLegacyProfile(query, pathname) || !!PHOTO_PATH.find(path => pathname.endsWith(path))
const isMediaSetPage = () => document.location.pathname.endsWith('/media_set')

const createPlayButton = (cacheKey) => {
  const playBtn = document.querySelector(`#${PLAY_BTN_ID}`)

  if (playBtn) {
    const set = CACHE[cacheKey]

    if (set && set.size > 0) {
      playBtn.classList.add('is-photo-page')
    } else {
      playBtn.classList.remove('is-photo-page')
    }

    return
  }

  const elem = document.createElement('div')

  elem.id = PLAY_BTN_ID
  elem.textContent = 'Play'

  elem.addEventListener('click', () => {
    const cacheKey = createKeys(document.location)
    const set = CACHE[cacheKey]
    const photoCount = set && set.size

    if (!photoCount) {
      return
    }

    const optionsPage = LZString.compressToEncodedURIComponent(Array.from(set).join(','))

    chrome.runtime.sendMessage({optionsPage})

    ga('send', 'event', {
      'eventCategory': 'play-btn',
      'eventAction': 'play',
      'eventLabel': photoCount
    })
  }, false)

  document.body.appendChild(elem)
}

const getUrlFromAttribute = () => {
  // const selector = 'a.uiMediaThumb:not([class~="albumThumbLink"])'
  const selector = '#pagelet_timeline_medley_photos div:not([class~="hidden_elem"]) > ul > li.fbPhotoStarGridElement'
  const nodeList = document.querySelectorAll(selector)
  const encode = (attributes) => encodeURIComponent(attributes['data-starred-src'].value)

  return Array.from(nodeList).map(({attributes}) => encode(attributes))
}

const createKeys = ({pathname, search}) => {
  const query = getQuery(search)
  if (!isPhotoPage(query, pathname)) {
    return null
  }

  const {id = '', photos = '', collection_token = ''} = query
  const set = query.set || ''
  const path = pathname.replace('photos_of', 'photos')

  return `${path}-${id}-${photos}-${collection_token}-${set}`/* eslint camelcase: 0 */
}

const handleImage = (imageUrl, cacheKey) => {
  if (!imageUrl || !cacheKey) { return }

  CACHE[cacheKey] = CACHE[cacheKey] || new Set()

  const set = CACHE[cacheKey]

  if (isMediaSetPage()) {
    set.add(encodeURIComponent(imageUrl))
  } else {
    const urlFromAttribute = getUrlFromAttribute()
    if (urlFromAttribute.length > 0) {
      CACHE[cacheKey] = new Set(urlFromAttribute)
    } else {
      set.add(encodeURIComponent(imageUrl))
    }
  }
}

const updateBadgeText = (cacheKey) => {
  const set = CACHE[cacheKey]
  const photoCount = set ? set.size : 0
  const badgeText = photoCount > 0 ? `${photoCount}` : ''

  chrome.runtime.sendMessage({badgeText})
}

const handleChangeInfo = (changeInfo, cacheKey) => {
  if (!changeInfo || !cacheKey) { return }

  if (changeInfo.status === 'complete') {
    updateBadgeText(cacheKey)
  }
}

const handleBadgeText = (updateBadgeTextRequest, cacheKey) => {
  if (updateBadgeTextRequest) {
    updateBadgeText(cacheKey)
  }
}
chrome.runtime.onMessage.addListener((data) => {
  const cacheKey = createKeys(document.location)

  handleImage(data.imageUrl, cacheKey)

  handleChangeInfo(data.changeInfo, cacheKey)

  createPlayButton(cacheKey)

  handleBadgeText(data.updateBadgeTextRequest, cacheKey)

  updateBadgeText(cacheKey)
})

chrome.runtime.sendMessage({ready: true}, (data) => {
  if (data.ready) {
    ga('create', 'UA-22076179-7', 'auto')
    ga('set', 'checkProtocolTask', () => {})
    ga('require', 'displayfeatures')
  }
})

document.addEventListener('DOMContentLoaded', () => createPlayButton())
