FPS.log("main");

if (typeof observer === "function") {
    observer.disconnect();
}
if (typeof pageletTimelineMedleyPhotosObserver === "function") {
    pageletTimelineMedleyPhotosObserver.disconnect();
}

// FPS
var FPS = FPS || {};

FPS.config = {
    totalBackgroundMusic: 10,
    animationDuration: 10,
    randomSequence: true,
    enableSound: true,
    scrollTopPosition: 350,
    numberOfLeaves: 30,
    // assetsLink: "https://www.googledrive.com/host/0B92bfhwVuwZufjN3Si1KQ2NySVpTa0J2b1NxNm10bzg0ZTAtb0tyWDRVYUxMQk1JeEdWN00/assets/fps/",
    // assetsLink: "https://dl.dropboxusercontent.com/u/11065495/assets/fps/",
    assetsLink: "https://raw.githubusercontent.com/nowycheung/facebook-photo-slideshow/master/assets/",
    leavesSize: {
        w: 48,
        h: 48
    },
    autoPlay: false,
    enableBackgroundLeaf: false
};

FPS.data = {
    timer: false,
    showSettingTimer: false,
    currentImageIndex: 0,
    imageList: [],
    audio: document.createElement('audio'),
    fpsGallery: document.createElement('div'),
    fpsGalleryWrapper: document.createElement('div'),
    fpsGalleryExpand: document.createElement('div'),
    fpsGalleryExpandWrapper: document.createElement('div'),
    fpsOverlay: document.createElement('div'),
    fpsSnow: document.createElement('div'),
    fpsCurrentSlide: new Image(),
    fpsCurrentSlideExpand: new Image(),
    buttonList: {},
    imageCounter: document.createElement("div"),
    zoomed: false,
    loadingIcon: false,
    startTimeExpandedGallery: false,
    startTimeGallery: false,
    startTimeAudio: false,
    music_cache: []
};

FPS.imagesBuffer = new(function() {
    this._data = {
        candidate: [],
        buffer: [],
        timer: false
    };

    this.getList = function(index) {
        if (typeof index === "number") {
            return this._data.buffer[index];
        } else {
            return this._data.buffer;
        }
    };

    this.setList = function(array, cb) {
        var self = this;

        if (!array || (array && array.length === 0)) {
            this._data.candidate = [];
            this._data.buffer = [];
        } else {
            this._data.candidate = array;
            clearTimeout(this._data.timer);
            this._data.timer = setTimeout(function() {
                self._init(cb);
            }, 100);
        }
    };

    this.isExist = function(name) {
        return this._data.buffer.map(function(item) {
            return item.src;
        }).indexOf(name) >= 0;
    };

    this._init = function(cb) {
        var self = this;
        var started = false;

        this._data.candidate.forEach(function(cand, idx) {

            if (self.isExist(cand)) {
                if (!started) {
                    started = true;
                    FPS.utils.changeBackground(FPS.data.currentImageIndex, FPS.data);
                }
            } else {

                var img = new Image();
                img.src = cand;
                img.onload = function() {

                    if (!self.isExist(cand)) {
                        self._data.buffer.push({
                            src: this.src,
                            width: this.width,
                            height: this.height
                        });
                        FPS.data.imageCounter.innerHTML = self._data.buffer.length + "&nbsp;";
                    }

                    // Faster loaded
                    if (self._data.buffer.length === 1 && !started) {
                        started = true;
                        if (cb) {
                            cb();
                        }
                    }
                };
                img.onerror = function() {
                    FPS.log("Error loading img", this.src);
                };
            }
        });
    };
})();

FPS.init = function(data, utils, config, plugins) {
    data.fpsGallery.className = "fps-gallery";
    data.fpsGallery.style.width = data.fpsGalleryWrapper.style.width;
    data.fpsGallery.style.overflow = "hidden";
    data.fpsGallery.appendChild(data.fpsCurrentSlide);


    data.fpsGalleryWrapper.className = "fps-gallery-wrapper";
    data.fpsGalleryWrapper.appendChild(data.fpsGallery);
    data.fpsGalleryWrapper.style.display = "none";

    data.fpsGalleryExpand.className = "big-gallery";
    data.fpsGalleryExpand.style.cssText = "position:absolute; width:100%; height:100%;";
    data.fpsGalleryExpand.style.overflow = "hidden";
    data.fpsGalleryExpand.appendChild(data.fpsCurrentSlideExpand);

    data.fpsGalleryExpandWrapper.className = "fps-gallery-big-wrapper";
    data.fpsGalleryExpandWrapper.appendChild(data.fpsGalleryExpand);
    data.fpsGalleryExpandWrapper.style.display = "none";


    data.fpsCurrentSlide.style.position = "absolute";
    data.fpsCurrentSlideExpand.style.position = "absolute";

    data.fpsGalleryExpandWrapper.onclick = function() {
        this.style.display = 'none';
        data.zoomed = false;
        data.fpsGalleryWrapper.style.display = "block";
        data.fpsOverlay.style.display = "block";
        document.querySelector("body").style.overflow = 'auto';

        utils.track("send", "event", {
            "eventCategory": "fullscreen",
            "eventAction": "stop-1",
            "eventLabel": Math.abs(((new Date()) - data.startTimeExpandedGallery) / 1000)
        });
    };

    data.buttonList.fullScreenButton = FPS.createFullScreenButton(data);
    data.buttonList.audioButton = FPS.createAudioButton(data);
    data.buttonList.playButton = FPS.createPlayButton(data);
    data.buttonList.settingButton = FPS.createSettingButton(data);

    data.loadingIcon = new Image();
    data.loadingIcon.src = config.assetsLink + 'loading.gif';

    data.imageCounter.className = "img-counter";

    data.fpsOverlay.className = 'fps-overlay';

    if (config.enableBackgroundLeaf) {
        config.numberOfLeaves.forEach(() => {
            var leaf = plugins.createALeaf(config, utils);
            data.fpsOverlay.appendChild(leaf);
        })
    }

    utils.track('create', 'UA-22076179-7', 'auto');
    utils.track('set', 'checkProtocolTask', function() {});
    utils.track('require', 'displayfeatures');
    // utils.track('send', 'event', 'app', 'init');
};

FPS.startTimer = function(start) {
    clearTimeout(FPS.data.timer);

    FPS.utils.changeBackground("stop", FPS.data);
    if (!start) {
        return;
    }

    FPS.utils.track('send', 'event', {
        'eventCategory': 'load-image',
        'eventAction': 'length',
        'eventLabel': FPS.imagesBuffer.getList().length
    });

    var internalCallback = (function() {
        return function() {
            var listLength = FPS.imagesBuffer.getList().length;
            if (listLength <= 0) {
                FPS.log("imagesBuffer list length is 0", new Date());
                return;
            }

            FPS.data.currentImageIndex++;

            if (FPS.data.currentImageIndex >= listLength) {
                FPS.data.currentImageIndex = 0;
            }
            FPS.log("Play image number ", FPS.data.currentImageIndex, "of", listLength, FPS.config.animationDuration, new Date());
            FPS.utils.changeBackground(FPS.data.currentImageIndex, FPS.data);

            FPS.data.timer = window.setTimeout(internalCallback, FPS.config.animationDuration * 1000);
        };
    })();
    setTimeout(internalCallback, FPS.config.animationDuration * 1000);
};

FPS.dectector = function(mutations) {
    var href = window.location.href;
    if (/photos/.test(href)) {  // TODO : /media_set/.test(pathname)
        var photoGalleryNode = document.querySelector('body #pagelet_timeline_medley_photos [id^=collection_wrapper]:not([class~="hidden_elem"])') || document.querySelector("body #fbTimelinePhotosContent") || document.querySelector("body #set_photos_pagelet");

        if (photoGalleryNode) {
            if (!photosDectectorIsRunning) {
                photosDectectorIsRunning = true;
                pageletTimelineMedleyPhotosObserver.observe(photoGalleryNode, {
                    attributes: true,
                    childList: true,
                    characterData: false,
                    subtree: true
                });
                FPS.photosDectector();
            }
        } else {
            pageletTimelineMedleyPhotosObserver.disconnect();
            photosDectectorIsRunning = false;
        }   
    }
};

FPS.stopPlay = function (argument) {
    if (FPS.data.buttonList.playButton.innerText === "Stop") {
        FPS.data.buttonList.playButton.click();
    }
}

FPS.photosDectector = function() {
    var photoGalleryParentNode = document.querySelector('body #pagelet_timeline_medley_photos') || document.querySelector("body #album_header_pagelet") || document.querySelector("body #set_photos_pagelet"),
        photoGalleryNode = document.querySelector('body #pagelet_timeline_medley_photos [id^=pagelet_timeline_app_collection]:not([class~="hidden_elem"])') || document.querySelector("body #fbTimelinePhotosContent") || document.querySelector("body #set_photos_pagelet"),
        urlList = [],
        pageletDock = document.querySelector("body #pagelet_dock"),
        pageletDockWrapper = document.querySelector("body #pagelet_dock .fbDockWrapper");

    if (photoGalleryNode) {
        urlList = FPS.utils.getUrl(photoGalleryNode);

        // If random
        if (FPS.config.randomSequence) {
            urlList = FPS.utils.shuffleArray(urlList);
        }

        if (!photoGalleryParentNode) {
            photoGalleryParentNode = photoGalleryNode.parentNode;
        }
    }

    FPS.data.imageList = urlList;

    FPS.imagesBuffer.setList(FPS.data.imageList, function() {
        FPS.utils.changeBackground(0, FPS.data);
        if (urlList.length > 0 && FPS.data.buttonList.playButton.innerText === "Play" && FPS.config.autoPlay) {
            // FPS.config.autoPlay = false;
            FPS.data.buttonList.playButton.click();
        } else {
            FPS.stopPlay();
        }
    });

    if (pageletDock) {
        if (urlList.length > 0) {
            pageletDock.className = FPS.utils.addClass("hasGallery", pageletDock.className);
        } else {
            pageletDock.className = FPS.utils.removeClass("hasGallery", pageletDock.className);
        }
    }

    // Button checking
    if (pageletDockWrapper) {
        Object.keys(FPS.data.buttonList).forEach(function(name) {
            var button = FPS.data.buttonList[name];
            if (!pageletDockWrapper.contains(button)) {
                pageletDockWrapper.appendChild(button);
            }
        });
    }

    // Gallery element checking
    if (photoGalleryParentNode) {
        FPS.config.scrollTopPosition = photoGalleryParentNode.offsetTop - 55;
        if (urlList.length > 0) {
            if (!photoGalleryParentNode.contains(FPS.data.fpsGalleryWrapper)) {
                if (photoGalleryParentNode.firstChild) {
                    photoGalleryParentNode.insertBefore(FPS.data.fpsGalleryWrapper, photoGalleryParentNode.firstChild);
                } else {
                    photoGalleryParentNode.appendChild(FPS.data.fpsGalleryWrapper);
                }
            }
            if (!document.querySelector('body').contains(FPS.data.fpsGalleryExpandWrapper)) {
                // photoGalleryParentNode.appendChild(FPS.data.fpsGalleryExpandWrapper);
                document.querySelector('body').appendChild(FPS.data.fpsGalleryExpandWrapper);
            }
            if (!document.querySelector('body').contains(FPS.data.fpsOverlay)) {
                document.body.insertBefore(FPS.data.fpsOverlay, document.body.childNodes[0]);
            }
        } else {
            if (photoGalleryParentNode.contains(FPS.data.fpsGalleryWrapper)) {
                photoGalleryParentNode.removeChild(FPS.data.fpsGalleryWrapper);
            }
            if (photoGalleryParentNode.contains(FPS.data.fpsGalleryExpandWrapper)) {
                photoGalleryParentNode.removeChild(FPS.data.fpsGalleryExpandWrapper);
            }
            FPS.data.audio.pause();
        }
    } else {
        FPS.data.audio.pause();
    }
};

FPS.createPlayButton = function(data) {
    var elem = document.createElement("div"),
        pageletDock = document.querySelector("body #pagelet_dock");

    elem.className = "play-btn";
    elem.textContent = "Play";

    if (!FPS.utils.getCookie("fps_user")) {
        elem.style.zoom = "2.5";
        FPS.utils.setCookie("fps_user", "fps", 14);
    }

    data.buttonList.fullScreenButton.style.display = "none";
    data.buttonList.audioButton.style.display = "none";

    elem.addEventListener("click", function(e) {
        elem.style.zoom = "1";

        // User stop playing
        if (e.currentTarget.textContent === "Stop") {

            FPS.startTimer();

            e.currentTarget.textContent = "Play";

            data.buttonList.fullScreenButton.style.display = "none";
            data.buttonList.audioButton.style.display = "none";

            data.audio.pause();

            data.audio.src = `${FPS.config.assetsLink}bg_music${FPS.utils.randomFromTo(1, FPS.config.totalBackgroundMusic)}.mp3`;

            data.fpsGalleryWrapper.style.display = "none";
            data.fpsOverlay.style.display = "none";

            // Hide the settings
            pageletDock.className = FPS.utils.removeClass("showSettings", pageletDock.className);

            // Make sure the overflow is set to default
            document.querySelector("body").style.overflow = "auto";

            // document.querySelector('body').className = FPS.utils.removeClass("black_overlay", document.querySelector('body').className);

            FPS.utils.track("send", "event", {
                "eventCategory": "play",
                "eventAction": "stop",
                "eventLabel": Math.abs(((new Date()) - data.startTimeGallery) / 1000)
            });
        } else {

            FPS.startTimer(true);

            e.currentTarget.textContent = "Stop";
            e.currentTarget.className = FPS.utils.addClass("try-me" + FPS.utils.randomFromTo(1, 2), e.currentTarget.className);

            data.buttonList.fullScreenButton.style.display = "inline";
            data.buttonList.audioButton.style.display = "inline";
            data.fpsGalleryWrapper.style.display = "block";
            data.fpsOverlay.style.display = "block";

            data.audio.play();

            // document.querySelector('body').className = FPS.utils.addClass("black_overlay", document.querySelector('body').className);

            // Show the settings
            pageletDock.className = FPS.utils.addClass("showSettings", pageletDock.className);


            FPS.imagesBuffer.setList(data.imageList, () => {
                FPS.utils.changeBackground(0, data);
            });

            // localStorage.setItem('fps-play-date', +new Date());
            window.scrollTo(0, FPS.config.scrollTopPosition);

            data.startTimeGallery = new Date();
        }
    }, false);

    elem.onmouseover = function(e) {
        // While play the gallery
        if (e.currentTarget.textContent === "Stop") {
            window.clearTimeout(data.showSettingTimer);

            var pageletDock = document.querySelector("body #pagelet_dock");
            pageletDock.className = FPS.utils.addClass("showSettings", pageletDock.className);
        }
    };
    elem.onmouseout = function(e) {
        data.showSettingTimer = setTimeout(function() {
            var pageletDock = document.querySelector("body #pagelet_dock");

            pageletDock.className = FPS.utils.removeClass("showSettings", pageletDock.className);
        }, 400);
    };

    FPS.log("createPlayButton");
    return elem;
};

FPS.createFullScreenButton = function(data) {
    var elem = document.createElement("div");
    elem.className = "fullscr-btn";

    elem.addEventListener("click", function(e) {
        if (!data.zoomed) {
            data.zoomed = true;

            var viewport = FPS.utils.getViewport();

            Object.assign(data.fpsGalleryExpandWrapper.style, {
                top: `${viewport.t}px`,
                left: `${viewport.l}px`,
                display: "block"
            });

            data.fpsOverlay.style.display = "none";

            document.querySelector('body').style.overflow = 'hidden';

            data.startTimeExpandedGallery = new Date();
        } else {
            data.fpsOverlay.style.display = "block";
            data.fpsGalleryWrapper.style.display = "block";
            data.fpsGalleryExpandWrapper.style.display = "none";
            data.zoomed = false;

            document.querySelector('body').style.overflow = 'auto';
        }
    }, false);

    FPS.log("createFullScreenButton");
    return elem;
};

FPS.createAudioButton = function(data) {
    var audioWrapper = document.createElement('div'),
        buttonBG = document.createElement('span'),
        trackNumber = FPS.utils.randomFromTo(1, FPS.config.totalBackgroundMusic);

    // data.audio.src = FPS.config.assetsLink + 'bg_music' + trackNumber + '.mp3';
    if (data.music_cache[trackNumber]) {
        data.audio.src = data.music_cache[trackNumber];
    }else {
        FPS.utils.XMLHttpRequest(`${FPS.config.assetsLink}bg_music${trackNumber}.mp3`, function(response) {
            var objectURL = window.URL.createObjectURL(response);
            data.music_cache[trackNumber] = objectURL;
            data.audio.src = objectURL;
        }, "blob");
    }

    data.audio.preload = "auto";
    data.audio.trackNumber = trackNumber;
    data.audio.onended = function() {
        var self = this;
        self.trackNumber = FPS.utils.randomFromTo(1, FPS.config.totalBackgroundMusic, this.trackNumber);

        // self.src = FPS.config.assetsLink + 'bg_music' + self.trackNumber + '.mp3';
        if (data.music_cache[self.trackNumber]) {
            self.src = data.music_cache[self.trackNumber];
            self.load();
            self.play();
        }else {
            FPS.utils.XMLHttpRequest(`${FPS.config.assetsLink}bg_music${self.trackNumber}.mp3`, function(response) {
                var objectURL = window.URL.createObjectURL(response);
                data.music_cache[self.trackNumber] = objectURL;
                self.src = objectURL;
                self.load();
                self.play();
            }, "blob");
        }
    };

    data.audio.onplay = function() {
        buttonBG.style.WebkitAnimation = "flipX 8s ease infinite";
        data.startTimeAudio = new Date();
    };

    data.audio.onpause = function() {
        buttonBG.style.WebkitAnimation = "";

        FPS.utils.track("send", "event", {
            "eventCategory": "audio",
            "eventAction": "stop",
            "eventLabel": Math.abs(((new Date()) - data.startTimeAudio) / 1000)
        });
    };

    buttonBG.className = "btn-bg";

    audioWrapper.className = "fps-audio-btn";
    audioWrapper.appendChild(data.audio);
    audioWrapper.appendChild(buttonBG);
    audioWrapper.addEventListener("click", function(e) {
        // Not started
        if (data.audio.played.length === 0) {
            data.audio.play();
        } else {
            if (data.audio.paused) {
                data.audio.play();
            } else {
                data.audio.pause();
            }
        }
    }, false);

    FPS.log("createAudioButton");
    return audioWrapper;
};

FPS.createSettingButton = function(data) {
    var elem = document.createElement("div");
    var slider = document.createElement("input");
    var slower = document.createElement("span");
    var faster = document.createElement("span");
    var checkbox = document.createElement("input");
    var checkboxLabel = document.createElement("label");
    var pageletDock = document.querySelector("body #pagelet_dock");

    elem.className = "setting-btn";

    elem.onmouseover = () => {
        clearTimeout(data.showSettingTimer);
        
        pageletDock.className = FPS.utils.addClass("showSettings", pageletDock.className);
    };
    elem.onmouseout = () => {
        data.showSettingTimer = setTimeout(() => {
            pageletDock.className = FPS.utils.removeClass("showSettings", pageletDock.className);
        }, 400);
    };
    slider.oninput = function() {
        var input = (parseInt(slider.max, 10) * 2) - parseInt(slider.value);
        input = (input - 9) * 2;
        FPS.config.animationDuration = input;
    };
    slider.onchange = function() {
        FPS.utils.track("send", "event", {
            "eventCategory": "speed",
            "eventAction": "change",
            "eventLabel": slider.value
        });
    };

    checkbox.onchange = function(e) {
        FPS.utils.track("send", "event", {
            "eventCategory": "overlayToggle",
            "eventAction": "change",
            "eventLabel": this.checked.toString()
        });
        if (!this.checked) {
            data.fpsOverlay.style.backgroundColor = "transparent";
        } else {
            data.fpsOverlay.style.backgroundColor = "rgba(51, 51, 51, 0.8)";
        }
    };

    slider.className = "speed";
    slider.type = "range";
    slider.min = 3;
    slider.max = 10;
    slider.value = parseInt(slider.max, 10) - (FPS.config.animationDuration / 2);

    checkbox.type = "checkbox";
    checkbox.id = "overlayToggle";
    checkbox.checked = true;

    checkboxLabel.htmlFor = "overlayToggle";
    checkboxLabel.className = "overlayToggleLabel";

    slower.innerHTML = "Slow";
    faster.innerHTML = "Fast";

    elem.appendChild(checkbox);
    elem.appendChild(checkboxLabel);
    elem.appendChild(slower);
    elem.appendChild(slider);
    elem.appendChild(faster);
    elem.appendChild(data.imageCounter);

    return elem;
};


FPS.init(FPS.data, FPS.utils, FPS.config, FPS.plugins);


// create an observer instance
var observer = new MutationObserver(FPS.dectector);
var pageletTimelineMedleyPhotosObserver =  new MutationObserver(FPS.photosDectector);
var photosDectectorIsRunning = false;

// pass in the target node, as well as the observer options
observer.observe(document.querySelector("body"), {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
});

// later, you can stop observing
// observer.disconnect();


FPS.utils.injectCSStoIndex('style.css', false);