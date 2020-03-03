/* global Swiper, Image, $, LZString */
(() => {
  const ASSETS_LINK = 'https://raw.githubusercontent.com/nowycondro/facebook-photo-slideshow/master/assets/'
  const generateMosaicImage = (images) => images.map(({url, width, height}) => `<img src="${url}" width="${width}" height="${height}"/>`).join('')
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

  const decodeImageUrl = (bodyText) => {
    bodyText = bodyText.slice(bodyText.indexOf("scaledImageFitWidth img\" src=\"") + 30);
    bodyText = bodyText.slice(0, bodyText.indexOf('"'));
    bodyText = bodyText.split("&amp;").join("&");
    return bodyText;
  }

  const getImageUrl = (bodyText) => {
    let hyperfeedStoryId = bodyText.slice(bodyText.indexOf('<script>bigPipe.beforePageletArrive("hyperfeed_story_id_') + 37);
    hyperfeedStoryId = hyperfeedStoryId.slice(0, hyperfeedStoryId.indexOf('")</script>'));

    const selector = `{${hyperfeedStoryId}:{container_id:"`;
    let containerID = bodyText.slice(bodyText.indexOf(selector) + selector.length);
    containerID = containerID.slice(0, containerID.indexOf(`"}}`));

    let imageContainer = bodyText.slice(bodyText.indexOf(`<code id="${containerID}"><!--`));
    imageContainer = imageContainer.slice(0, imageContainer.indexOf(`--></code>`));

    return decodeImageUrl(imageContainer);
  }

  const getImageDimension = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve({url, height: img.naturalHeight, width: img.naturalWidth})
      img.onerror = () => resolve({url: false})
    })
  }

  const fetchImage = (url) => {
    return fetch(url)
      .then(res => res.text())
      .then(bodyText => getImageUrl(bodyText))
      .then(imgUrl => getImageDimension(imgUrl));
  }

  const cleanUrls = (urls) => {
    return [...new Set(urls.map(src => src.slice(0, src.indexOf("&set"))).filter(src => !!src))];
  }

  const fetchImages = (urls) => {
    let loadCount = 0
    const cleanedUrl = cleanUrls(urls)

    const promises = cleanedUrl.map(url => {
      return new Promise((resolve) => {
        const next = (error, images) => {
          loadCount++
          $('#slidershow').html(`Loading ${loadCount} of ${cleanedUrl.length} image(s)`)
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
