/* global Swiper, Image, $, LZString */
(() => {
  const ASSETS_LINK = 'https://raw.githubusercontent.com/nowycondro/facebook-photo-slideshow/master/assets/'
  const generateMosaicImage = (images) => images.map(({url, width, height}) => {
    return `<img src="${url}" width="${width}" height="${height}"/>`;
  }).join('')
  const randomFromTo = (from, to) => Math.floor(Math.random() * (to - from + 1) + from)
  const generateSlide = (image) => `
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="${image.url}" class="swiper-lazy">
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

  const getImageDimension = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve({url, height: img.naturalHeight, width: img.naturalWidth})
      img.onerror = () => resolve({url: false})
    })
  }

  const fetchImage = (url) => {
    return fetch(url).then(res => res.text()).then(result => {
      result = result.slice(result.indexOf("scaledImageFitWidth img\" src=\"") + 30);
      result = result.slice(0, result.indexOf('"'));
      result = result.split("&amp;").join("&");
      return result;
    }).then(imgUrl => getImageDimension(imgUrl));
  }

  const fetchImages = (urls) => {
    let loadCount = 0
    const promises = urls.map(url => {
      return new Promise((resolve) => {
        const next = (error, images) => {
          loadCount++
          $('#slidershow').html(`Loading ${loadCount} of ${urls.length} image(s)`)
          if (error) {
            $('#slidershow').html(`Invalid URL ${url}`)
            resolve()
          } else {
            resolve(images)
          }
        }

        try {
          fetchImage(url)
            .then(images => next(null, images))
            .catch(e => next(true));
        } catch (e) {
          next(true)
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
    centeredSlides: true,
    slidesPerView: 1,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    pagination: {
      el: '.swiper-pagination',
      dynamicBullets: true,
      dynamicMainBullets: 2
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
      hideOnClick: true
    }
  })

  const initMosaic = () => $('#mosaic').Mosaic({
    innerGap: 10,
    outerMargin: 10,
    refitOnResizeDelay: 100
  })

  const initViewSwitcher = () => {
    $('#viewSwitch').click(() => {
      root.classList.toggle('hide')
      mosaicRoot.classList.toggle('hide')

      if (!mosaicRoot.classList.contains('hide')) {
        initMosaic()
        document.documentElement.requestFullscreen()
      }
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
    const sources = imageSrc.split('___')
    $('#slidershow').html(`Loading ${sources.length} image(s) ...`)
    fetchImages(sources)
      .then(images => images.filter(image => image.url))
      .then(images => {
        return {
          mosaic: generateMosaicImage(images),
          swiper: generateSwiperContainer(images.map(generateSlide))
        }
      })
      .then(container => {
        $('#slidershow').html(container.swiper)
        $('#mosaic').html(container.mosaic)
      })
      .then(initSwiper)
      .then(playMusic)
      .then(initViewSwitcher)
      .then(initMosaic)
  }
})()
