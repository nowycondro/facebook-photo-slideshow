var FPS = FPS || {};

FPS.log = (...arguments) => {
    console.log.apply(null, arguments);
};

FPS.utils = {
    track: (...arguments) => {
        ga.apply(null, arguments);
    },
    getUrl: (nodeList) => {
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
            // FPS.log(downloadButton);

            if (link.value) {
                result.push(link.value);
            }
        }

        console.log("getUrl", result);
        return result;
    },
    changeBackground: (index, data) => {

        if (index === "stop") {
            data.currentImageIndex++;

            FPS.utils.resetGallery(data);

            data.fpsGallery.style.background = "#000 url(" + data.loadingIcon.src + ") no-repeat 50% 50%";
            data.fpsGalleryExpand.style.background = "#000 url(" + data.loadingIcon.src + ") no-repeat 50% 50%";

        } else {

            var img, animationID;
            img = FPS.imagesBuffer.getList(index);

            if (typeof img === "undefined" || typeof img.src === "undefined") {
                FPS.log("img.src === undefined");
                return;
            }

            animationID = ((index % 4) + 1);

            // portrait mode
            if (img.height > img.width) {
                animationID += "p";
            }

            FPS.utils.changeAnimation(img.src, animationID, img, data);
        }
    },
    changeAnimation: (url, animationID, img, data) => {
        // FPS.log("data.zoomed", data.zoomed);
        // if (data.zoomed) {
        // data.fpsGalleryExpand.style.background = "";
        // data.fpsGalleryExpand.style.backgroundImage = "url(" + url + ")";
        // data.fpsGalleryExpand.style.webkitAnimation = "animatedRandom" + animationID + " " + FPS.config.animationDuration + "s ease infinite";
        // } else {

        // data.fpsGallery.style.background = "";
        // data.fpsGallery.style.backgroundImage = "url(" + url + ")";
        // data.fpsGallery.style.webkitAnimation = "animatedRandom" + animationID + " " + FPS.config.animationDuration + "s ease infinite";
        // }



        data.fpsGallery.style.backgroundImage = "";
        data.fpsGalleryExpand.style.backgroundImage = "";

        data.fpsCurrentSlide.src = url;
        data.fpsCurrentSlideExpand.src = url;


        // portrait mode
        if (img.height > img.width) {
            FPS.log("PORTRAIT");

            /* Regular gallery */
            var ratio = img.height / data.fpsGalleryWrapper.offsetHeight;
            data.fpsCurrentSlide.style.height = data.fpsGalleryWrapper.offsetHeight + "px";
            data.fpsCurrentSlide.style.width = img.width / ratio + "px";
            data.fpsCurrentSlide.style.top = ((data.fpsGalleryWrapper.offsetHeight - data.fpsCurrentSlide.offsetHeight) / 2) + "px";
            data.fpsCurrentSlide.style.left = ((data.fpsGalleryWrapper.offsetWidth - data.fpsCurrentSlide.offsetWidth) / 2) + "px";


            /* Expanded gallery */
            var ratioExpand = img.height / window.innerHeight;
            data.fpsCurrentSlideExpand.style.height = window.innerHeight + "px";
            data.fpsCurrentSlideExpand.style.width = img.width / ratioExpand + "px";
            data.fpsCurrentSlideExpand.style.top = ((data.fpsGalleryExpandWrapper.offsetHeight - data.fpsCurrentSlideExpand.offsetHeight) / 2) + "px";
            data.fpsCurrentSlideExpand.style.left = ((data.fpsGalleryExpandWrapper.offsetWidth - data.fpsCurrentSlideExpand.offsetWidth) / 2) + "px";

            // FPS.log(img.height, img.width, ratio, data.fpsGalleryWrapper.offsetHeight, data.fpsGalleryWrapper.offsetWidth, data.fpsCurrentSlide.style.height, data.fpsCurrentSlide.style.width, data.fpsCurrentSlide.style.top, data.fpsCurrentSlide.style.position, ((data.fpsGalleryWrapper.offsetHeight - parseInt(data.fpsCurrentSlide.style.height, 10)) / 2));

        } else {

            /* Regular gallery */
            var ratio = img.width / data.fpsGalleryWrapper.offsetWidth;
            data.fpsCurrentSlide.style.height = img.height / ratio + "px";
            data.fpsCurrentSlide.style.width = data.fpsGalleryWrapper.offsetWidth + "px";
            data.fpsCurrentSlide.style.top = ((data.fpsGalleryWrapper.offsetHeight - data.fpsCurrentSlide.offsetHeight) / 2) + "px";
            data.fpsCurrentSlide.style.left = ((data.fpsGalleryWrapper.offsetWidth - data.fpsCurrentSlide.offsetWidth) / 2) + "px";

            /* Expanded gallery */
            var ratioExpand = img.width / window.innerWidth;
            data.fpsCurrentSlideExpand.style.height = img.height / ratioExpand + "px";
            data.fpsCurrentSlideExpand.style.width = window.innerWidth + "px";
            data.fpsCurrentSlideExpand.style.top = ((window.innerHeight - data.fpsCurrentSlideExpand.offsetHeight) / 2) + "px";
            data.fpsCurrentSlideExpand.style.left = ((window.innerWidth - data.fpsCurrentSlideExpand.offsetWidth) / 2) + "px";

            // FPS.log(img.height, img.width, ratio, data.fpsGalleryWrapper.offsetHeight, data.fpsGalleryWrapper.offsetWidth, data.fpsCurrentSlide.style.height, data.fpsCurrentSlide.style.width, data.fpsCurrentSlide.style.top, data.fpsCurrentSlide.style.position, ((data.fpsGalleryWrapper.offsetHeight - parseInt(data.fpsCurrentSlide.style.height, 10)) / 2));
        }

        data.fpsCurrentSlide.style.webkitAnimation = "animatedRandom" + animationID + " " + FPS.config.animationDuration + "s ease infinite";
        data.fpsCurrentSlideExpand.style.webkitAnimation = "animatedRandom" + animationID + " " + FPS.config.animationDuration + "s ease infinite";

    },
    resetGallery: (data) => {
        data.fpsGallery.style.webkitAnimation = "";
        data.fpsGallery.style.background = "#000 url(" + data.loadingIcon.src + ") no-repeat 50% 50%";

        data.fpsGalleryWrapper.style.display = "none";

        data.fpsGalleryExpand.style.webkitAnimation = "";
        data.fpsGalleryExpand.style.background = "#000 url(" + data.loadingIcon.src + ") no-repeat 50% 50%";
        data.fpsGalleryExpandWrapper.style.display = "none";


        data.fpsCurrentSlide.src = "";
        data.fpsCurrentSlideExpand.src = "";
        data.imageCounter.innerHTML = "";

        data.buttonList.playButton.innerHTML = "Play";
        data.buttonList.playButton.className = FPS.utils.removeClass("try-me1", data.buttonList.playButton.className);
        data.buttonList.playButton.className = FPS.utils.removeClass("try-me2", data.buttonList.playButton.className);

        data.audio.pause();

        FPS.imagesBuffer.setList();

        data.fpsOverlay.style.display = "none";
        data.buttonList.audioButton.style.display = "none";
        data.buttonList.fullScreenButton.style.display = "none";
    },
    XMLHttpRequest: (url, callback, responseType) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = responseType || "text";
        xhr.onload = () => callback(xhr.response);
        xhr.send();
    },
    shuffleArray: (array) => {
        var arrayLength = array.length;
        var temp, random;
        while (arrayLength) {
            random = Math.floor(Math.random() * arrayLength--);
            temp = array[arrayLength];
            array[arrayLength] = array[random];
            array[random] = temp;
        }
        return array;
    },

    injectCSStoIndex: (name) => {
        var style = document.createElement("style");
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = chrome.extension.getURL(name);
        (document.head || document.getElementsByTagName("head")[0] || document.documentElement).appendChild(style);
    },
    removeClass: (name, classNameString = "") => {
        return classNameString.split(" ").filter((className)  => className !== name).join(" ");
    },
    addClass: (name, classNameString) => {
        return FPS.utils.removeClass(name, classNameString) + " " + name;
    },
    randomFromTo: (fromNumber, toNumber, prevNumber) => {
        if (!prevNumber) {
            return Math.floor(Math.random() * (toNumber - fromNumber + 1) + fromNumber);
        } else {
            var num = FPS.utils.randomFromTo(fromNumber, toNumber);
            var maxIteration = 10;
            var iteration = 0;
            while (prevNumber === num) {
                num = FPS.utils.randomFromTo(fromNumber, toNumber);
                if (iteration > maxIteration)
                    break;
                iteration++;
            }
            return num;
        }
    },
    randomFloat: (low, high) => {
        return low + Math.random() * (high - low);
    },
    getViewport: () => ({
        l: window.pageXOffset,
        t: window.pageYOffset,
        w: window.innerWidth,
        h: window.innerHeight
    }),
    setCookie: (cname, cvalue, exdays) => {
        var date = new Date();
        date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = `expires=${date.toUTCString()}`;
        document.cookie = `${cname}=${cvalue}; ${expires}`;
    },
    getCookie: (cname) => {
        var name = cname + "=";
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            while (cookie.charAt(0) === " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) >= 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return "";
    },
    getParameter: (name, url) => {
        var parameters = url.split("&");
        var result = "";
        parameters.find((parameter) => {
            var [parameterName, parameterValue] = parameter.split("=");
            if (parameterName === name) {
                result = parameterValue;
                return true;
            }
            return false;
        });
        return result;
    }
}