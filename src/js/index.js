/* global chrome, LZString */
const PLAY_BTN_ID = 'slider-play-btn'
const SUPPORTED_PATH = {
  "/photos": {
    containers: [
      {
        name: "#pagelet_main_column_personal",
        suffix: 'div:not([class~="hidden_elem"]) > ul > li > a[ajaxify]'
      },
      { name: "#group_photoset", suffix: "a[ajaxify]" }
    ]
  },
  "/photos/": {
    containers: [
      {
        name: "#pagelet_main_column_personal",
        suffix: 'div:not([class~="hidden_elem"]) > ul > li > a[ajaxify]'
      },
      { name: "#group_photoset", suffix: "a[ajaxify]" }
    ]
  },
  "/photos_all": {
    containers: [
      {
        name: "#pagelet_main_column_personal",
        suffix: 'div:not([class~="hidden_elem"]) > ul > li > a[ajaxify]'
      }
    ]
  },
  "/photos_of": {
    containers: [
      {
        name: "#pagelet_main_column_personal",
        suffix: 'div:not([class~="hidden_elem"]) > ul > li > a[ajaxify]'
      }
    ]
  },
  "/media_set": {
    containers: [
      { name: "#album_photos_pagelet", suffix: "a[ajaxify]" },
      { name: "#fbTimelinePhotosContent", suffix: "a[ajaxify]" }
    ]
  },
  "/media/set/": {
    containers: [
      {
        name: "#set_photos_pagelet",
        suffix: 'a[ajaxify]'
      }
    ]
  }
};
const CACHE = {}

const getQuery = () => document.location.search
  .substring(1)
  .split('&')
  .map(item => item.split('='))
  .reduce((prev, [key, value]) => ({
    ...prev,
    [key]: value
  }), {})

const getNormalizedPath = (pathname) => Object.keys(SUPPORTED_PATH).find(path => pathname.endsWith(path));
const isFriendsProfilePage = (query, pathname) => pathname === '/profile.php' && !!query.sk
const isPhotoPage = (query, pathname) => isFriendsProfilePage(query, pathname) || !!getNormalizedPath(pathname)
const isMediaSetPage = () => document.location.pathname.endsWith('/media_set')
const getAjaxifySelector = (query, pathname) => {
  const path = isFriendsProfilePage(query, pathname) ? getNormalizedPath('/' + query.sk) : getNormalizedPath(document.location.pathname)
  const supportedPaths = SUPPORTED_PATH[path]

  if (!supportedPaths) return {}

  const container = supportedPaths.containers.find(container => document.querySelector(container.name)) || {}

  return {
    name: container.name,
    suffix: container.suffix
  };
};

const getAllAjaxifyLink = () => {
  const {name, suffix} = getAjaxifySelector(getQuery(), document.location.pathname)

  if (!name) return []

  const ajaxifyLink = [...document.querySelectorAll(`${name} ${suffix}`)]
    .map(a => a.getAttributeNode("ajaxify").value)
    .filter(link => !!link && link.indexOf("https://www.facebook.com/photo.php?") >= 0);

  return [...new Set(ajaxifyLink)];
}

const createPlayButton = (cacheKey) => {
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

const getUrlFromAttribute = () => {
  const selector = '#pagelet_timeline_medley_photos div:not([class~="hidden_elem"]) > ul > li.fbPhotoStarGridElement'
  const nodeList = document.querySelectorAll(selector)
  const encode = (attributes) => encodeURIComponent(attributes['data-starred-src'].value)

  return Array.from(nodeList).map(({attributes}) => encode(attributes))
}

const createKeys = ({pathname}) => {
  const query = getQuery()
  if (!isPhotoPage(query, pathname)) {
    return null
  }

  const {id = '', photos = '', collection_token = '', filter = ''} = query
  const set = query.set || ''
  const path = pathname.replace('photos_of', 'photos')

  return `${path}-${id}-${photos}-${collection_token}-${set}-${filter}`/* eslint camelcase: 0 */
}

const handleImage = (cacheKey) => {
  if (!cacheKey) { 
    return;
  }

  CACHE[cacheKey] = CACHE[cacheKey] || new Set()

  const set = CACHE[cacheKey]

  if (isMediaSetPage()) {
    getAllAjaxifyLink().forEach(link => set.add(link))
  } else {
    const urlFromAttribute = getUrlFromAttribute()
    if (urlFromAttribute.length > 0) {
      CACHE[cacheKey] = new Set(urlFromAttribute)
    } else {
      getAllAjaxifyLink().forEach(link => set.add(link))
    }
  }
}

const updateBadgeText = (cacheKey, playBtn) => {
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
  const cacheKey = createKeys(document.location)
  const playBtn = createPlayButton(cacheKey)

  updateBadgeText(cacheKey, playBtn)
})

chrome.runtime.sendMessage({ready: true}, (data) => {
  if (data.ready) {}
})

document.addEventListener('DOMContentLoaded', () => createPlayButton())
