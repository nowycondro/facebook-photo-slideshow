if (typeof observer === "function") {
    observer.disconnect();
}
console = {
    log: function() {}
}

// FPS
var _FPS = {};

_FPS.config = {
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
    autoPlay: true,
    enableBackgroundLeaf: true
};

_FPS.data = {
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

_FPS.utils = {
    getUrl: function(nodeList) {
        var imageList = nodeList.querySelectorAll('a.uiMediaThumb:not([class~="albumThumbLink"])'),
            result = [],
            currentNode,
            i,
            link,
            dataFbId,
            downloadButton;

        for (i = 0; i < imageList.length; i++) {
            currentNode = imageList[i].parentNode;
            // dataFbId = currentNode.attributes["data-fbid"];
            // if (dataFbId.value && dataFbId.value) {
            //     result.push('https://www.facebook.com/photo/download/?fbid=' + dataFbId.value);
            // }
            link = currentNode.attributes["data-starred-src"];
            // downloadButton = currentNode.querySelector(".fbPhotoCurationControl a[data-tooltip-content='Edit or remove']");
            // downloadButton.click();
            // console.log(downloadButton);
            if (link.value) {
                result.push(link.value);
            }
        }
        return result;
    },
    getParameter: function(sParam, url) {
        var sPageURL = url;
        var sURLVariables = sPageURL.split('&');
        var result = "";
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                result = sParameterName[1];
                break;
            }
        }
        return result;
    },
    injectCSStoIndex: function(name, fn) {
        var s = document.createElement('style');
        s.type = 'text/css';
        s.rel = "stylesheet";
        s.href = chrome.extension.getURL(name);
        (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
    },
    removeClass: function(name, classes) {
        var index = -1;
        if (classes) {
            classes = classes.split(" ");
            index = classes.indexOf(name);
            if (index > -1) {
                classes.splice(index, 1);
            }
            return classes.join(" ");
        } else {
            return classes;
        }
    },
    addClass: function(name, classes) {
        var index = -1;
        if (classes) {
            classes = classes.split(" ");
            index = classes.indexOf(name);
            if (index < 0) {
                classes.push(name);
            }
            return classes.join(" ");
        } else {
            return name;
        }
    },
    randomFromTo: function(from, to, prevNum) {
        if (!prevNum) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        } else {
            var num = _FPS.utils.randomFromTo(from, to);
            var maxIteration = 10;
            var iteration = 0;
            while (prevNum === num) {
                num = _FPS.utils.randomFromTo(from, to);
                if (iteration > maxIteration)
                    break;
                iteration++;
            }
            return num;
        }
    },
    randomFloat: function(low, high) {
        return low + Math.random() * (high - low);
    },
    changeBackground: function(index) {

        if (index === "stop") {
            _FPS.data.currentImageIndex++;

            _FPS.utils.resetGallery();

            _FPS.data.fpsGallery.style.background = "#000 url(" + _FPS.data.loadingIcon.src + ") no-repeat 50% 50%";
            _FPS.data.fpsGalleryExpand.style.background = "#000 url(" + _FPS.data.loadingIcon.src + ") no-repeat 50% 50%";

        } else {

            var img, animationID;
            img = _FPS.imagesBuffer.getList(index);

            if (typeof img === "undefined" || typeof img.src === "undefined") {
                console.log("img.src === undefined");
                return;
            }

            animationID = ((index % 4) + 1);

            // portrait mode
            if (img.height > img.width) {
                animationID += "p";
            }

            _FPS.utils.changeAnimation(img.src, animationID, img);
        }
    },
    changeAnimation: function(url, animationID, img) {
        // console.log("_FPS.data.zoomed", _FPS.data.zoomed);
        // if (_FPS.data.zoomed) {
        // _FPS.data.fpsGalleryExpand.style.background = "";
        // _FPS.data.fpsGalleryExpand.style.backgroundImage = "url(" + url + ")";
        // _FPS.data.fpsGalleryExpand.style.webkitAnimation = "animatedRandom" + animationID + " " + _FPS.config.animationDuration + "s ease infinite";
        // } else {

        // _FPS.data.fpsGallery.style.background = "";
        // _FPS.data.fpsGallery.style.backgroundImage = "url(" + url + ")";
        // _FPS.data.fpsGallery.style.webkitAnimation = "animatedRandom" + animationID + " " + _FPS.config.animationDuration + "s ease infinite";
        // }



        _FPS.data.fpsGallery.style.backgroundImage = "";
        _FPS.data.fpsGalleryExpand.style.backgroundImage = "";

        _FPS.data.fpsCurrentSlide.src = url;
        _FPS.data.fpsCurrentSlideExpand.src = url;


        // portrait mode
        if (img.height > img.width) {
            console.log("PORTRAIT");

            /* Regular gallery */
            var ratio = img.height / _FPS.data.fpsGalleryWrapper.offsetHeight;
            _FPS.data.fpsCurrentSlide.style.height = _FPS.data.fpsGalleryWrapper.offsetHeight + "px";
            _FPS.data.fpsCurrentSlide.style.width = img.width / ratio + "px";
            _FPS.data.fpsCurrentSlide.style.top = ((_FPS.data.fpsGalleryWrapper.offsetHeight - _FPS.data.fpsCurrentSlide.offsetHeight) / 2) + "px";
            _FPS.data.fpsCurrentSlide.style.left = ((_FPS.data.fpsGalleryWrapper.offsetWidth - _FPS.data.fpsCurrentSlide.offsetWidth) / 2) + "px";


            /* Expanded gallery */
            var ratioExpand = img.height / window.innerHeight;
            _FPS.data.fpsCurrentSlideExpand.style.height = window.innerHeight + "px";
            _FPS.data.fpsCurrentSlideExpand.style.width = img.width / ratioExpand + "px";
            _FPS.data.fpsCurrentSlideExpand.style.top = ((_FPS.data.fpsGalleryExpandWrapper.offsetHeight - _FPS.data.fpsCurrentSlideExpand.offsetHeight) / 2) + "px";
            _FPS.data.fpsCurrentSlideExpand.style.left = ((_FPS.data.fpsGalleryExpandWrapper.offsetWidth - _FPS.data.fpsCurrentSlideExpand.offsetWidth) / 2) + "px";

            // console.log(img.height, img.width, ratio, _FPS.data.fpsGalleryWrapper.offsetHeight, _FPS.data.fpsGalleryWrapper.offsetWidth, _FPS.data.fpsCurrentSlide.style.height, _FPS.data.fpsCurrentSlide.style.width, _FPS.data.fpsCurrentSlide.style.top, _FPS.data.fpsCurrentSlide.style.position, ((_FPS.data.fpsGalleryWrapper.offsetHeight - parseInt(_FPS.data.fpsCurrentSlide.style.height, 10)) / 2));

        } else {

            /* Regular gallery */
            var ratio = img.width / _FPS.data.fpsGalleryWrapper.offsetWidth;
            _FPS.data.fpsCurrentSlide.style.height = img.height / ratio + "px";
            _FPS.data.fpsCurrentSlide.style.width = _FPS.data.fpsGalleryWrapper.offsetWidth + "px";
            _FPS.data.fpsCurrentSlide.style.top = ((_FPS.data.fpsGalleryWrapper.offsetHeight - _FPS.data.fpsCurrentSlide.offsetHeight) / 2) + "px";
            _FPS.data.fpsCurrentSlide.style.left = ((_FPS.data.fpsGalleryWrapper.offsetWidth - _FPS.data.fpsCurrentSlide.offsetWidth) / 2) + "px";

            /* Expanded gallery */
            var ratioExpand = img.width / window.innerWidth;
            _FPS.data.fpsCurrentSlideExpand.style.height = img.height / ratioExpand + "px";
            _FPS.data.fpsCurrentSlideExpand.style.width = window.innerWidth + "px";
            _FPS.data.fpsCurrentSlideExpand.style.top = ((window.innerHeight - _FPS.data.fpsCurrentSlideExpand.offsetHeight) / 2) + "px";
            _FPS.data.fpsCurrentSlideExpand.style.left = ((window.innerWidth - _FPS.data.fpsCurrentSlideExpand.offsetWidth) / 2) + "px";

            // console.log(img.height, img.width, ratio, _FPS.data.fpsGalleryWrapper.offsetHeight, _FPS.data.fpsGalleryWrapper.offsetWidth, _FPS.data.fpsCurrentSlide.style.height, _FPS.data.fpsCurrentSlide.style.width, _FPS.data.fpsCurrentSlide.style.top, _FPS.data.fpsCurrentSlide.style.position, ((_FPS.data.fpsGalleryWrapper.offsetHeight - parseInt(_FPS.data.fpsCurrentSlide.style.height, 10)) / 2));
        }

        _FPS.data.fpsCurrentSlide.style.webkitAnimation = "animatedRandom" + animationID + " " + _FPS.config.animationDuration + "s ease infinite";
        _FPS.data.fpsCurrentSlideExpand.style.webkitAnimation = "animatedRandom" + animationID + " " + _FPS.config.animationDuration + "s ease infinite";

    },
    getViewport: function() {
        return {
            l: window.pageXOffset,
            t: window.pageYOffset,
            w: window.innerWidth,
            h: window.innerHeight
        };
    },
    createALeaf: function() {
        /* Start by creating a wrapper div, and an empty img element */
        var leafDiv = document.createElement('div');
        var image = document.createElement('img');

        /* Randomly choose a leaf image and assign it to the newly created element */
        image.src = _FPS.config.assetsLink + 'realLeaf' + _FPS.utils.randomFromTo(1, 5) + '.png';
        // image.width = _FPS.config.leavesSize.w;
        // image.height = _FPS.config.leavesSize.h;

        leafDiv.style.top = "-100px";

        /* Position the leaf at a random location along the screen */
        leafDiv.style.left = _FPS.utils.randomFromTo(0, window.innerWidth) + "px";

        /* Randomly choose a spin animation */
        var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';

        /* Set the -webkit-animation-name property with these values */
        leafDiv.style.webkitAnimationName = 'fade, drop';
        image.style.webkitAnimationName = spinAnimationName;

        /* Figure out a random duration for the fade and drop animations */
        var fadeAndDropDuration = _FPS.utils.randomFloat(5, 11) + "s";

        /* Figure out another random duration for the spin animation */
        var spinDuration = _FPS.utils.randomFloat(4, 8) + "s";
        /* Set the -webkit-animation-duration property with these values */
        leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;

        var leafDelay = _FPS.utils.randomFloat(0, 5) + "s";
        leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;

        image.style.webkitAnimationDuration = spinDuration;

        // add the <img> to the <div>
        leafDiv.appendChild(image);

        /* Return this img element so it can be added to the document */
        return leafDiv;
    },
    resetGallery: function() {
        _FPS.data.fpsGallery.style.webkitAnimation = "";
        _FPS.data.fpsGallery.style.background = "#000 url(" + _FPS.data.loadingIcon.src + ") no-repeat 50% 50%";

        _FPS.data.fpsGalleryWrapper.style.display = "none";

        _FPS.data.fpsGalleryExpand.style.webkitAnimation = "";
        _FPS.data.fpsGalleryExpand.style.background = "#000 url(" + _FPS.data.loadingIcon.src + ") no-repeat 50% 50%";
        _FPS.data.fpsGalleryExpandWrapper.style.display = "none";


        _FPS.data.fpsCurrentSlide.src = "";
        _FPS.data.fpsCurrentSlideExpand.src = "";
        _FPS.data.imageCounter.innerHTML = "";

        _FPS.data.buttonList.playButton.innerHTML = "Play";
        _FPS.data.buttonList.playButton.className = _FPS.utils.removeClass("try-me1", _FPS.data.buttonList.playButton.className);
        _FPS.data.buttonList.playButton.className = _FPS.utils.removeClass("try-me2", _FPS.data.buttonList.playButton.className);

        _FPS.data.audio.pause();

        _FPS.imagesBuffer.setList();

        _FPS.data.fpsOverlay.style.display = "none";
        _FPS.data.buttonList.audioButton.style.display = "none";
        _FPS.data.buttonList.fullScreenButton.style.display = "none";
    },
    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    },
    shuffleArray: function(array) {
        var m = array.length,
            t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }
};

_FPS.imagesBuffer = new(function() {
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

        if (!array) {
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
                    _FPS.utils.changeBackground(_FPS.data.currentImageIndex);
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
                        _FPS.data.imageCounter.innerHTML = self._data.buffer.length + "&nbsp;";
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
                    console.log("Error loading img", this.src);
                };
            }
        });
    };
})();

_FPS.init = function() {
    _FPS.data.fpsGallery.className = 'fps-gallery';
    _FPS.data.fpsGallery.style.width = _FPS.data.fpsGalleryWrapper.style.width;
    _FPS.data.fpsGallery.style.overflow = "hidden";
    _FPS.data.fpsGallery.appendChild(_FPS.data.fpsCurrentSlide);


    _FPS.data.fpsGalleryWrapper.className = 'fps-gallery-wrapper';
    _FPS.data.fpsGalleryWrapper.appendChild(_FPS.data.fpsGallery);
    _FPS.data.fpsGalleryWrapper.style.display = "none";

    _FPS.data.fpsGalleryExpand.className = 'big-gallery';
    _FPS.data.fpsGalleryExpand.style.cssText = 'position:absolute; width:100%; height:100%;';
    _FPS.data.fpsGalleryExpand.style.overflow = "hidden";
    _FPS.data.fpsGalleryExpand.appendChild(_FPS.data.fpsCurrentSlideExpand);

    _FPS.data.fpsGalleryExpandWrapper.className = 'fps-gallery-big-wrapper';
    _FPS.data.fpsGalleryExpandWrapper.appendChild(_FPS.data.fpsGalleryExpand);
    _FPS.data.fpsGalleryExpandWrapper.style.display = "none";


    _FPS.data.fpsCurrentSlide.style.position = "absolute";
    _FPS.data.fpsCurrentSlideExpand.style.position = "absolute";

    _FPS.data.fpsGalleryExpandWrapper.onclick = function() {
        this.style.display = 'none';
        _FPS.data.zoomed = false;
        _FPS.data.fpsGalleryWrapper.style.display = "block";
        _FPS.data.fpsOverlay.style.display = "block";
        document.querySelector('body').style.overflow = 'auto';
        ga('send', 'event', {
            'eventCategory': 'fullscreen',
            'eventAction': 'stop-1',
            'eventLabel': Math.abs(((new Date()) - _FPS.data.startTimeExpandedGallery) / 1000)
        });
    };

    _FPS.data.buttonList.fullScreenButton = _FPS.createFullScreenButton();
    _FPS.data.buttonList.audioButton = _FPS.createAudioButton();
    _FPS.data.buttonList.playButton = _FPS.createPlayButton();
    _FPS.data.buttonList.settingButton = _FPS.createSettingButton();

    _FPS.data.loadingIcon = new Image();
    _FPS.data.loadingIcon.src = _FPS.config.assetsLink + 'loading.gif';

    _FPS.data.imageCounter.className = "img-counter";

    _FPS.data.fpsOverlay.className = 'fps-overlay';

    if (_FPS.config.enableBackgroundLeaf) {
        for (var i = 0; i < _FPS.config.numberOfLeaves; i++) {
            _FPS.data.fpsOverlay.appendChild(_FPS.utils.createALeaf());
        }
    }

    ga('create', 'UA-22076179-7', 'auto');
    ga('set', 'checkProtocolTask', function() {});
    ga('require', 'displayfeatures');
    // ga('send', 'event', 'app', 'init');

};

_FPS.startTimer = function(start) {
    clearTimeout(_FPS.data.timer);
    _FPS.utils.changeBackground("stop");
    if (!start) {
        return;
    }

    ga('send', 'event', {
        'eventCategory': 'load-image',
        'eventAction': 'length',
        'eventLabel': _FPS.imagesBuffer.getList().length
    });

    var internalCallback = (function() {
        return function() {
            var listLength = _FPS.imagesBuffer.getList().length;
            if (listLength <= 0) {
                console.log("imagesBuffer list length is 0", new Date());
                return;
            }

            _FPS.data.currentImageIndex++;

            if (_FPS.data.currentImageIndex >= listLength) {
                _FPS.data.currentImageIndex = 0;
            }
            console.log("Play image number ", _FPS.data.currentImageIndex, "of", listLength, _FPS.config.animationDuration, new Date());
            _FPS.utils.changeBackground(_FPS.data.currentImageIndex);

            _FPS.data.timer = window.setTimeout(internalCallback, _FPS.config.animationDuration * 1000);
        };
    })();
    setTimeout(internalCallback, _FPS.config.animationDuration * 1000);
};

_FPS.dectector = function(mutations) {
    // mutations.forEach(function(mutation) {});
    var photoGalleryParentNode = document.querySelector('body #pagelet_timeline_medley_photos') || document.querySelector("body #album_header_pagelet") || document.querySelector("body #set_photos_pagelet"),
        photoGalleryNode = document.querySelector('body #pagelet_timeline_medley_photos [id^=pagelet_timeline_app_collection]:not([class~="hidden_elem"])') || document.querySelector("body #fbTimelinePhotosContent") || document.querySelector("body #set_photos_pagelet"),
        urlList = [],
        pageletDock = document.querySelector("body #pagelet_dock"),
        pageletDockWrapper = document.querySelector("body #pagelet_dock .fbDockWrapper");

    if (photoGalleryNode) {
        urlList = _FPS.utils.getUrl(photoGalleryNode);

        // If random
        if (_FPS.config.randomSequence) {
            urlList = _FPS.utils.shuffleArray(urlList);
        }

        if (!photoGalleryParentNode) {
            photoGalleryParentNode = photoGalleryNode.parentNode;
        }
    } else {
        _FPS.utils.resetGallery();
    }

    // console.log(urlList.length);

    _FPS.data.imageList = urlList;
    _FPS.imagesBuffer.setList(_FPS.data.imageList, function() {
        _FPS.utils.changeBackground(0);
        if (urlList.length > 0 &&
            _FPS.data.buttonList.playButton.innerText === "Play" &&
            _FPS.config.autoPlay) {
            _FPS.config.autoPlay = false;
            _FPS.data.buttonList.playButton.click();
        }
    });

    if (pageletDock) {
        if (urlList.length > 0) {
            pageletDock.className = _FPS.utils.addClass("hasGallery", pageletDock.className);
        } else {
            pageletDock.className = _FPS.utils.removeClass("hasGallery", pageletDock.className);
        }
    }

    // Button checking
    if (pageletDockWrapper) {
        Object.keys(_FPS.data.buttonList).forEach(function(name) {
            var button = _FPS.data.buttonList[name];
            if (!pageletDockWrapper.contains(button)) {
                pageletDockWrapper.appendChild(button);
            }
        });
    }

    // Gallery element checking
    if (photoGalleryParentNode) {
        _FPS.config.scrollTopPosition = photoGalleryParentNode.offsetTop - 55;
        if (urlList.length > 0) {
            if (!photoGalleryParentNode.contains(_FPS.data.fpsGalleryWrapper)) {
                if (photoGalleryParentNode.firstChild) {
                    photoGalleryParentNode.insertBefore(_FPS.data.fpsGalleryWrapper, photoGalleryParentNode.firstChild);
                } else {
                    photoGalleryParentNode.appendChild(_FPS.data.fpsGalleryWrapper);
                }
            }
            if (!document.querySelector('body').contains(_FPS.data.fpsGalleryExpandWrapper)) {
                // photoGalleryParentNode.appendChild(_FPS.data.fpsGalleryExpandWrapper);
                document.querySelector('body').appendChild(_FPS.data.fpsGalleryExpandWrapper);
            }
            if (!document.querySelector('body').contains(_FPS.data.fpsOverlay)) {
                document.body.insertBefore(_FPS.data.fpsOverlay, document.body.childNodes[0]);
            }
        } else {
            if (photoGalleryParentNode.contains(_FPS.data.fpsGalleryWrapper)) {
                photoGalleryParentNode.removeChild(_FPS.data.fpsGalleryWrapper);
            }
            if (photoGalleryParentNode.contains(_FPS.data.fpsGalleryExpandWrapper)) {
                photoGalleryParentNode.removeChild(_FPS.data.fpsGalleryExpandWrapper);
            }
            _FPS.data.audio.pause();
        }
    } else {
        _FPS.data.audio.pause();
    }

};

_FPS.createPlayButton = function() {
    var elem = document.createElement("div"),
        pageletDock = document.querySelector("body #pagelet_dock");

    elem.className = 'play-btn';
    elem.innerHTML = 'Play';

    if (!_FPS.utils.getCookie("fps_user")) {
        elem.style.zoom = "2.5";
        _FPS.utils.setCookie("fps_user", "fps", 14);
    }

    _FPS.data.buttonList.fullScreenButton.style.display = "none";
    _FPS.data.buttonList.audioButton.style.display = "none";

    // if(showTryMe()){
    //  elem.className = 'play-btn try-me';
    // }

    elem.addEventListener('click', function(e) {
        elem.style.zoom = "1";

        // User stop playing
        if (e.currentTarget.textContent === "Stop") {

            _FPS.startTimer();

            e.currentTarget.textContent = "Play";
            e.currentTarget.className = _FPS.utils.removeClass("try-me1", e.currentTarget.className);
            e.currentTarget.className = _FPS.utils.removeClass("try-me2", e.currentTarget.className);

            _FPS.data.buttonList.fullScreenButton.style.display = "none";
            _FPS.data.buttonList.audioButton.style.display = "none";

            _FPS.data.audio.pause();


            _FPS.data.audio.src = _FPS.config.assetsLink + 'bg_music' + _FPS.utils.randomFromTo(1, _FPS.config.totalBackgroundMusic) + '.mp3';

            // var trackNumber = _FPS.utils.randomFromTo(1, _FPS.config.totalBackgroundMusic);            
            // if (_FPS.data.music_cache[trackNumber]) {
            //     _FPS.data.audio.src = _FPS.data.music_cache[trackNumber];
            // }else {
            //     _FPS.XMLHttpRequestBlob(_FPS.config.assetsLink + 'bg_music' + trackNumber + '.mp3', function(data) {
            //         _FPS.data.music_cache[trackNumber] = data;
            //         _FPS.data.audio.src = data;
            //     });
            // }
            
            _FPS.data.fpsGalleryWrapper.style.display = "none";
            _FPS.data.fpsOverlay.style.display = "none";

            // Hide the settings
            pageletDock.className = _FPS.utils.removeClass("showSettings", pageletDock.className);

            // Make sure the overflow is set to default
            document.querySelector('body').style.overflow = 'auto';

            // document.querySelector('body').className = _FPS.utils.removeClass("black_overlay", document.querySelector('body').className);

            ga('send', 'event', {
                'eventCategory': 'play',
                'eventAction': 'stop',
                'eventLabel': Math.abs(((new Date()) - _FPS.data.startTimeGallery) / 1000)
            });
        } else {

            _FPS.startTimer(true);

            e.currentTarget.textContent = "Stop";
            e.currentTarget.className = _FPS.utils.addClass("try-me" + _FPS.utils.randomFromTo(1, 2), e.currentTarget.className);

            _FPS.data.buttonList.fullScreenButton.style.display = "inline";
            _FPS.data.buttonList.audioButton.style.display = "inline";
            _FPS.data.fpsGalleryWrapper.style.display = "block";
            _FPS.data.fpsOverlay.style.display = "block";

            _FPS.data.audio.play();

            // document.querySelector('body').className = _FPS.utils.addClass("black_overlay", document.querySelector('body').className);

            // Show the settings
            pageletDock.className = _FPS.utils.addClass("showSettings", pageletDock.className);


            _FPS.imagesBuffer.setList(_FPS.data.imageList,
                function() {
                    _FPS.utils.changeBackground(0);
                });

            // localStorage.setItem('fps-play-date', +new Date());
            window.scrollTo(0, _FPS.config.scrollTopPosition);

            _FPS.data.startTimeGallery = new Date();
        }
    }, false);

    elem.onmouseover = function(e) {
        // While play the gallery
        if (e.currentTarget.textContent === "Stop") {
            clearTimeout(_FPS.data.showSettingTimer);
            var pageletDock = document.querySelector("body #pagelet_dock");
            pageletDock.className = _FPS.utils.addClass("showSettings", pageletDock.className);
        }
    };
    elem.onmouseout = function(e) {
        _FPS.data.showSettingTimer = setTimeout(function() {
            var pageletDock = document.querySelector("body #pagelet_dock");
            pageletDock.className = _FPS.utils.removeClass("showSettings", pageletDock.className);
        }, 400);
    };
    console.log("createPlayButton");
    return elem;
};

_FPS.createFullScreenButton = function() {
    var elem = document.createElement("div");
    elem.className = 'fullscr-btn';
    // elem.innerHTML = 'Expand';

    elem.addEventListener('click', function(e) {
        if (!_FPS.data.zoomed) {
            _FPS.data.zoomed = true;

            // _FPS.data.fpsGalleryWrapper.style.display = "none";

            var v = _FPS.utils.getViewport();
            _FPS.data.fpsGalleryExpandWrapper.style.display = "block";
            _FPS.data.fpsGalleryExpandWrapper.style.top = v.t + "px";
            _FPS.data.fpsGalleryExpandWrapper.style.left = v.l + "px";
            _FPS.data.fpsGalleryExpandWrapper.style.width = "100%";
            _FPS.data.fpsGalleryExpandWrapper.style.height = "100%";
            _FPS.data.fpsGalleryExpandWrapper.style.position = "absolute";
            _FPS.data.fpsGalleryExpandWrapper.style.zIndex = "9999";
            _FPS.data.fpsGalleryExpandWrapper.style.display = "block";
            _FPS.data.fpsGalleryExpandWrapper.style.backgroundColor = "#000";

            _FPS.data.fpsOverlay.style.display = "none";

            document.querySelector('body').style.overflow = 'hidden';

            _FPS.data.startTimeExpandedGallery = new Date();
        } else {
            _FPS.data.fpsOverlay.style.display = "block";
            _FPS.data.fpsGalleryWrapper.style.display = "block";

            _FPS.data.fpsGalleryExpandWrapper.style.display = "none";
            _FPS.data.zoomed = false;

            document.querySelector('body').style.overflow = 'auto';
        }
    }, false);
    console.log("createFullScreenButton");
    return elem;
};


_FPS.XMLHttpRequestBlob = function(url, cb, responseType) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = responseType || 'blob';
    xhr.onload = function(e) {
        if (xhr.responseType === 'blob') {
            cb(window.URL.createObjectURL(this.response))
        } else {
            cb(this.response);
        }
    };
    xhr.send();
};

_FPS.createAudioButton = function() {

    var audioWrapper = document.createElement('div'),
        buttonBG = document.createElement('span'),
        trackNumber = _FPS.utils.randomFromTo(1, _FPS.config.totalBackgroundMusic);

    // _FPS.data.audio.src = _FPS.config.assetsLink + 'bg_music' + trackNumber + '.mp3';
    if (_FPS.data.music_cache[trackNumber]) {
        _FPS.data.audio.src = _FPS.data.music_cache[trackNumber];
    }else {
        _FPS.XMLHttpRequestBlob(_FPS.config.assetsLink + 'bg_music' + trackNumber + '.mp3', function(data) {
            _FPS.data.music_cache[trackNumber] = data;
            _FPS.data.audio.src = data;
        });
    }

    // _FPS.data.audio.autoPlay = true;
    _FPS.data.audio.preload = "auto";
    _FPS.data.audio.trackNumber = trackNumber;
    _FPS.data.audio.onended = function() {
        var self = this;
        self.trackNumber = _FPS.utils.randomFromTo(1, _FPS.config.totalBackgroundMusic, this.trackNumber);

        // self.src = _FPS.config.assetsLink + 'bg_music' + self.trackNumber + '.mp3';
        if (_FPS.data.music_cache[self.trackNumber]) {
            self.src = _FPS.data.music_cache[self.trackNumber];
            self.load();
            self.play();
        }else {
            _FPS.XMLHttpRequestBlob(_FPS.config.assetsLink + 'bg_music' + self.trackNumber + '.mp3', function(data) {
                _FPS.data.music_cache[self.trackNumber] = data;
                self.src = data;
                self.load();
                self.play();
            });
        }
    };

    _FPS.data.audio.onplay = function() {
        buttonBG.style.WebkitAnimation = "flipX 8s ease infinite";
        _FPS.data.startTimeAudio = new Date();
    };

    _FPS.data.audio.onpause = function() {
        buttonBG.style.WebkitAnimation = "";
        ga('send', 'event', {
            'eventCategory': 'audio',
            'eventAction': 'stop',
            'eventLabel': Math.abs(((new Date()) - _FPS.data.startTimeAudio) / 1000)
        });
    };

    buttonBG.className = "btn-bg";

    audioWrapper.className = "fps-audio-btn";
    audioWrapper.appendChild(_FPS.data.audio);
    audioWrapper.appendChild(buttonBG);
    audioWrapper.addEventListener('click', function(e) {
        // Not started
        if (_FPS.data.audio.played.length === 0) {
            _FPS.data.audio.play();
        } else {
            if (_FPS.data.audio.paused) {
                _FPS.data.audio.play();
            } else {
                _FPS.data.audio.pause();
            }
        }
    }, false);
    console.log("createAudioButton");
    return audioWrapper;
};

_FPS.createSettingButton = function() {
    var elem = document.createElement("div");
    var slider = document.createElement("input");
    var slower = document.createElement("span");
    var faster = document.createElement("span");
    var checkbox = document.createElement("input");
    var checkboxLabel = document.createElement("label");

    elem.className = 'setting-btn';

    elem.onmouseover = function(e) {
        clearTimeout(_FPS.data.showSettingTimer);
        var pageletDock = document.querySelector("body #pagelet_dock");
        pageletDock.className = _FPS.utils.addClass("showSettings", pageletDock.className);
    };
    elem.onmouseout = function(e) {
        _FPS.data.showSettingTimer = setTimeout(function() {
            var pageletDock = document.querySelector("body #pagelet_dock");
            pageletDock.className = _FPS.utils.removeClass("showSettings", pageletDock.className);
        }, 400);
    };
    slider.oninput = function(e) {
        var c = (parseInt(slider.max, 10) * 2) - parseInt(this.value);
        c = (c - 9) * 2;
        _FPS.config.animationDuration = c;
    };
    slider.onchange = function(e) {
        ga('send', 'event', {
            'eventCategory': 'speed',
            'eventAction': 'change',
            'eventLabel': this.value
        });
    };

    checkbox.onchange = function(e) {
        ga('send', 'event', {
            'eventCategory': 'overlayToggle',
            'eventAction': 'change',
            'eventLabel': this.checked.toString()
        });
        if (!this.checked) {
            _FPS.data.fpsOverlay.style.backgroundColor = "transparent";
        } else {
            _FPS.data.fpsOverlay.style.backgroundColor = "rgba(51, 51, 51, 0.8)";
        }
    };

    slider.className = "speed";
    slider.type = "range";
    slider.min = 3;
    slider.max = 10;
    slider.value = parseInt(slider.max, 10) - (_FPS.config.animationDuration / 2);

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
    elem.appendChild(_FPS.data.imageCounter);

    return elem;
};


_FPS.init();

// select the target node
var target = document.querySelector('body');

// configuration of the observer:
var config = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
};

// create an observer instance
var observer = new MutationObserver(_FPS.dectector);

// pass in the target node, as well as the observer options
observer.observe(target, config);

// later, you can stop observing
// observer.disconnect();


_FPS.utils.injectCSStoIndex('style.css', false);