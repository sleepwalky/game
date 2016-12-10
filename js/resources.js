'use strict';

const resources = (function () {
    const resourceCache = {};
    const loading = [];
    const readyCallbacks = [];

    function get(url) {
        return resourceCache[url];
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            const img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function isReady() {
        let ready = true;
        for(let k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    // Load an image url or an array of image urls
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    return {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

})();


