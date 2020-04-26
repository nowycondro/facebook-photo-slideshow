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

  const fetchPage = (url) => {
    return fetch(url)
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
