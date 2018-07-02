/* global Swiper, Image, $, LZString */
(() => {
  const ASSETS_LINK = 'https://raw.githubusercontent.com/nowycheung/facebook-photo-slideshow/master/assets/'
  const generateMosaicImage = (urls) => urls.map(url => `<img src="${url}"/>`).join('')
  const randomFromTo = (from, to) => Math.floor(Math.random() * (to - from + 1) + from)
  const generateSlide = (url) => `
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="${url}" class="swiper-lazy">
      </div>
    </div>
  `
  const generateSwiperContainer = (slides) => `
    <div class="swiper-container">
      <div class="swiper-wrapper">
        ${slides.join('')}
      </div>
      <div class="swiper-pagination swiper-pagination-white"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  `

  const root = document.querySelector('#slidershow')
  const mosaicRoot = document.querySelector('#mosaic')

  const urlParams = window.location.search.substring(1)
    .split('&')
    .map(item => item.split('='))
    .reduce((prev, [key, value]) => {
      prev[key] = key === 'LZSsrc' ? decodeURIComponent(LZString.decompressFromEncodedURIComponent(value)) : decodeURIComponent(value)
      return prev
    }, {})

  const imageSrc = urlParams.src || urlParams.LZSsrc

  const fetchImages = (urls) => {
    let loadCount = 0
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const next = (error, url) => {
          loadCount++
          root.innerHTML = `Loading ${loadCount} of ${urls.length} image(s)`
          if (error) {
            root.innerHTML = `Invalid URL ${url}`
            resolve()
          } else {
            resolve(url)
          }
        }

        try {
          const img = new Image()
          img.src = url
          img.onload = () => next(null, url)
          img.onerror = () => next(true, url)
        } catch (e) {
          next(true, url)
        }
      })
    })
    return Promise.all(promises)
  }

  const initSwiper = () => new Swiper('.swiper-container', {
    speed: 1300,
    autoHeight: true,
    keyboard: {
      enabled: true
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    mousewheel: {
      invert: true
    },
    grabCursor: true,
    effect: 'coverflow',
    centeredSlides: true,
    slidesPerView: 2,
    coverflowEffect: {
      rotate: 50,
      stretch: 10,
      depth: 100,
      modifier: 2,
      slideShadows: false
    },
    pagination: {
      el: '.swiper-pagination',
      dynamicBullets: true,
      dynamicMainBullets: 2
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  })
  const initMosaic = () => $('#mosaic').Mosaic({innerGap: 20, outerMargin: 30, refitOnResizeDelay: 100})
  const initViewSwitcher = () => {
    $('#viewSwitch').click(() => {
      root.classList.toggle('hide')
      mosaicRoot.classList.toggle('hide')
    })
  }

  const playMusic = () => {
    const audio = document.createElement('audio')
    audio.src = `${ASSETS_LINK}bg_music${randomFromTo(1, 10)}.mp3`
    audio.preload = 'auto'
    audio.play()
    audio.onended = () => {
      audio.src = `${ASSETS_LINK}bg_music${randomFromTo(1, 10)}.mp3`
      audio.play()
    }
  }

  if (imageSrc) {
    const sources = imageSrc.split(',')
    root.innerHTML = `Loading ${sources.length} image(s) ...`
    fetchImages(sources)
      .then(urls => urls.filter(url => url))
      .then((urls) => {
        return {
          mosaic: generateMosaicImage(urls),
          swiper: generateSwiperContainer(urls.map(generateSlide))
        }
      })
      .then(container => {
        root.innerHTML = container.swiper
        mosaicRoot.innerHTML = container.mosaic
      })
      .then(initSwiper)
      .then(initMosaic)
      .then(playMusic)
      .then(initViewSwitcher)
  }
})()
