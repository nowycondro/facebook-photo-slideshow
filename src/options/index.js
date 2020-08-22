/* global Swiper, Image, $, LZString */
(() => {
  const ASSETS_LINK = 'https://raw.githubusercontent.com/nowycondro/facebook-photo-slideshow/master/assets/'
  const randomFromTo = (from, to) => Math.floor(Math.random() * (to - from + 1) + from)
  const urlParams = window.location.search.substring(1)
    .split('&')
    .map(item => item.split('='))
    .reduce((prev, [key, value]) => {
      prev[key] = key === 'LZSsrc' ? decodeURIComponent(LZString.decompressFromEncodedURIComponent(value)) : decodeURIComponent(value)
      return prev
    }, {})

  const imageSrc = urlParams.src || urlParams.LZSsrc

  const getImageUrl = (bodyText) => {
    const left = '<link rel="preload" href="';
    const right = '" as="image" data-preloader="adp_CometPhotoRootQueryRelayPreloader_';
    let imgUrl = bodyText.slice(0, bodyText.indexOf(right));
    imgUrl = imgUrl.slice(imgUrl.lastIndexOf(left) + left.length).replace(/&amp;/gi, "&");
    return imgUrl;
  }

  const fetchPage = (url) => {
    return fetch(url, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      }
    })
      .then(res => res.text())
      .then(bodyText => getImageUrl(bodyText))
  }

  const cleanUrls = (urls) => {
    return [...new Set(urls.map(src => src.slice(0, src.indexOf("&set"))).filter(src => !!src))];
  }

  const fetchPages = (pageUrls) => {
    let loadCount = 0
    const cleanedUrl = cleanUrls(pageUrls)

    const promises = cleanedUrl.map(pageUrl => {
      return new Promise((resolve) => {
        const next = (error, imgUrl) => {
          loadCount++
          $('#slidershow').html(`Loading ${loadCount} of ${cleanedUrl.length} image(s)`)
          if (error) {
            $('#slidershow').html(`Invalid URL ${pageUrl}`)
            resolve()
          } else {
            resolve(imgUrl)
          }
        }

        try {
          fetchPage(pageUrl)
            .then(imgUrl => next(null, imgUrl))
            .catch(e => next(true));
        } catch (e) {
          next(true)
        }
      })
    })
    return Promise.all(promises)
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

    fetchPages(sources)
      .then(images => images.filter(image => image && image.startsWith('https://')))
      .then(images => images.map(image => ({image})))
      .then(dataSource => {
        Galleria.loadTheme('./galleria.twelve.js');
        Galleria.run('.galleria', {
          dataSource: dataSource,
          autoplay: true,
          imageCrop: 'height',
          fullscreenTransition: 'fade',
          dummy: '../img/icon.png'
        });
      })
      .then(playMusic)
  }
})()
