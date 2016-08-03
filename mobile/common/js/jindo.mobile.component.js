var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
if (raf && !caf) {
    var keyInfo = {};
    var oldraf = raf;
    raf = function(c) {
        function b() {
            if (keyInfo[a]) {
                c()
            }
        }
        var a = oldraf(b);
        keyInfo[a] = true;
        return a
    };
    caf = function(a) {
        delete keyInfo[a]
    }
} else {
    if (!(raf && caf)) {
        raf = function(a) {
            return window.setTimeout(a, 16)
        };
        caf = window.clearTimeout
    }
}
window.requestAnimationFrame = raf;
window.cancelAnimationFrame = caf;
jindo.m = (function() {
    var _isVertical = null,
        _nPreWidth = -1,
        _nRotateTimer = null,
        _htHandler = {},
        _htDeviceInfo = {},
        _htAddPatch = {},
        _htOsInfo = {},
        _htBrowserInfo = {},
        _htTouchEventName = {
            start: "mousedown",
            move: "mousemove",
            end: "mouseup",
            cancel: null
        },
        _htDeviceList = {
            galaxyTab: ["SHW-M180"],
            galaxyTab2: ["SHW-M380"],
            galaxyS: ["SHW-M110"],
            galaxyS2: ["SHW-M250", "GT-I9100"],
            galaxyS2LTE: ["SHV-E110"],
            galaxyS3: ["SHV-E210", "SHW-M440", "GT-I9300"],
            galaxyNote: ["SHV-E160"],
            galaxyNote2: ["SHV-E250"],
            galaxyNexus: ["Galaxy Nexus"],
            optimusLte2: ["LG-F160"],
            optimusVu: ["LG-F100"],
            optimusLte: ["LG-LU6200", "LG-SU640", "LG-F120K"]
        };

    function _initTouchEventName() {
        if ("ontouchstart" in window) {
            _htTouchEventName.start = "touchstart";
            _htTouchEventName.move = "touchmove";
            _htTouchEventName.end = "touchend";
            _htTouchEventName.cancel = "touchcancel"
        } else {
            if (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
                _htTouchEventName.start = "MSPointerDown";
                _htTouchEventName.move = "MSPointerMove";
                _htTouchEventName.end = "MSPointerUp";
                _htTouchEventName.cancel = "MSPointerCancel"
            }
        }
    }

    function _getOrientationChangeEvt() {
        var bEvtName = "onorientationchange" in window ? "orientationchange" : "resize";
        if ((_htOsInfo.android && _htOsInfo.version === "2.1")) {
            bEvtName = "resize"
        }
        return bEvtName
    }

    function _getVertical() {
        var bVertical = null,
            sEventType = _getOrientationChangeEvt();
        if (sEventType === "resize") {
            var screenWidth = document.documentElement.clientWidth;
            if (_nPreWidth == -1) {
                bVertical = screenWidth < document.documentElement.clientHeight
            } else {
                if (screenWidth < _nPreWidth) {
                    bVertical = true
                } else {
                    if (screenWidth == _nPreWidth) {
                        bVertical = _isVertical
                    } else {
                        bVertical = false
                    }
                }
            }
            _nPreWidth = screenWidth
        } else {
            var windowOrientation = window.orientation;
            if (windowOrientation === 0 || windowOrientation == 180) {
                bVertical = true
            } else {
                if (windowOrientation == 90 || windowOrientation == -90) {
                    bVertical = false
                }
            }
        }
        return bVertical
    }

    function _attachEvent() {
        var fnOrientation = jindo.$Fn(_onOrientationChange, this).attach(window, _getOrientationChangeEvt()).attach(window, "load");
        var fnPageShow = jindo.$Fn(_onPageshow, this).attach(window, "pageshow")
    }

    function _initDeviceInfo() {
        _setOsInfo();
        _setBrowserInfo();
        var sName = navigator.userAgent;
        var ar = null;

        function f(s, h) {
            return ((h || "").indexOf(s) > -1)
        }
        _htDeviceInfo = {
            iphone: _htOsInfo.iphone,
            ipad: _htOsInfo.ipad,
            android: _htOsInfo.android,
            win: f("Windows Phone", sName),
            galaxyTab: /SHW-M180/.test(sName),
            galaxyTab2: /SHW-M380/.test(sName),
            galaxyS: /SHW-M110/.test(sName),
            galaxyS2: /SHW-M250|GT-I9100/.test(sName),
            galaxyS2LTE: /SHV-E110/.test(sName),
            galaxyS3: /SHV-E210|SHW-M440|GT-I9300/.test(sName),
            galaxyNote: /SHV-E160/.test(sName),
            galaxyNote2: /SHV-E250/.test(sName),
            galaxyNexus: /Galaxy Nexus/.test(sName),
            optimusLte2: /LG-F160/.test(sName),
            optimusVu: /LG-F100/.test(sName),
            optimusLte: /LG-LU6200|LG-SU640|LG-F120K'/.test(sName),
            galaxyS4: /SHV-E300|GT-I9500|GT-I9505|SGH-M919|SPH-L720|SGH-I337|SCH-I545/.test(sName),
            bChrome: _htBrowserInfo.chrome,
            bSBrowser: _htBrowserInfo.bSBrowser,
            bInapp: false,
            version: _htOsInfo.version,
            browserVersion: _htBrowserInfo.version
        };
        for (var x in _htDeviceInfo) {
            if (typeof _htDeviceInfo[x] == "boolean" && _htDeviceInfo[x] && _htDeviceInfo.hasOwnProperty(x)) {
                if (x[0] !== "b") {
                    _htDeviceInfo.name = x
                }
            }
        }
        _htDeviceInfo.samsung = /GT-|SCH-|SHV-|SHW-|SPH|SWT-|SGH-|EK-|Galaxy Nexus|SAMSUNG/.test(sName);
        _htDeviceInfo.lg = /LG-/.test(sName);
        _htDeviceInfo.pantech = /IM-/.test(sName);
        if (_htDeviceInfo.iphone || _htDeviceInfo.ipad) {
            if (!f("Safari", sName)) {
                _htDeviceInfo.bInapp = true
            }
        } else {
            if (_htDeviceInfo.android) {
                sName = sName.toLowerCase();
                if (f("inapp", sName) || f("app", sName.replace("applewebkit", ""))) {
                    _htDeviceInfo.bInapp = true
                }
            }
        }
    }

    function _setOsInfo() {
        _htOsInfo = jindo.$Agent().os();
        _isInapp();
        _htOsInfo.version = _htOsInfo.version || _getOsVersion();
        _htOsInfo.ios = typeof _htOsInfo.ios == "undefined" ? (_htOsInfo.ipad || _htOsInfo.iphone) : _htOsInfo.ios
    }

    function _setBrowserInfo() {
        _htBrowserInfo = jindo.$Agent().navigator();
        if (_htOsInfo.ios && /CriOS/.test(navigator.userAgent)) {
            _htBrowserInfo.chrome = true
        }
        if (typeof _htBrowserInfo.firefox == "undefined") {
            _htBrowserInfo.firefox = /Firefox/.test(navigator.userAgent)
        }
        _isSBrowser();
        _updateUnderVersion()
    }

    function _updateUnderVersion() {
        if (_htBrowserInfo.msafari && _htBrowserInfo.chrome) {
            if (_htOsInfo.ios) {
                _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/CriOS[ \/]([0-9.]+)/)[1])
            } else {
                _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Chrome[ \/]([0-9.]+)/)[1])
            }
        } else {
            if (_htBrowserInfo.firefox) {
                _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Firefox[ \/]([0-9.]+)/)[1])
            }
        }
    }

    function _isInapp() {
        var sName = navigator.userAgent;
        _htOsInfo.bInapp = false;
        if (_htOsInfo.ios) {
            if (sName.indexOf("Safari") == -1) {
                _htOsInfo.bInapp = true
            }
        } else {
            if (_htOsInfo.android) {
                sName = sName.toLowerCase();
                if (sName.indexOf("inapp") != -1 || sName.replace("applewebkit", "").indexOf("app") != -1) {
                    _htOsInfo.bInapp = true
                }
            }
        }
    }

    function _isSBrowser() {
        _htBrowserInfo.bSBrowser = false;
        var sUserAgent = navigator.userAgent;
        var aMatchReturn = sUserAgent.match(/(SAMSUNG|Chrome)/gi) || "";
        if (aMatchReturn.length > 1) {
            _htBrowserInfo.bSBrowser = true
        }
    }

    function _getOsVersion() {
        if (!_htOsInfo.version) {
            var sName = navigator.userAgent,
                sVersion = "",
                ar;
            if (_htOsInfo.iphone || _htOsInfo.ipad) {
                ar = sName.match(/OS\s([\d|\_]+\s)/i);
                if (ar !== null && ar.length > 1) {
                    sVersion = ar[1]
                }
            } else {
                if (_htOsInfo.android) {
                    ar = sName.match(/Android\s([^\;]*)/i);
                    if (ar !== null && ar.length > 1) {
                        sVersion = ar[1]
                    }
                } else {
                    if (_htOsInfo.mwin) {
                        ar = sName.match(/Windows Phone\s([^\;]*)/i);
                        if (ar !== null && ar.length > 1) {
                            sVersion = ar[1]
                        }
                    }
                }
            }
            return sVersion.replace(/\_/g, ".").replace(/\s/g, "")
        }
    }

    function _onOrientationChange(we) {
        var self = this;
        if (we.type === "load") {
            _nPreWidth = document.documentElement.clientWidth;
            if (!_htOsInfo.bInapp && (_htOsInfo.iphone || _htOsInfo.ipad || _getOrientationChangeEvt() !== "resize")) {
                _isVertical = _getVertical()
            } else {
                if (_nPreWidth > document.documentElement.clientHeight) {
                    _isVertical = false
                } else {
                    _isVertical = true
                }
            }
            return
        }
        if (_getOrientationChangeEvt() === "resize") {
            setTimeout(function() {
                _orientationChange(we)
            }, 0)
        } else {
            var screenWidth = jindo.$Document().clientSize().width;
            var nTime = 300;
            if (_htDeviceInfo.android) {
                if (we.type == "orientationchange" && screenWidth == _nPreWidth) {
                    setTimeout(function() {
                        _onOrientationChange(we)
                    }, 500);
                    return false
                }
                _nPreWidth = screenWidth
            }
            clearTimeout(_nRotateTimer);
            _nRotateTimer = setTimeout(function() {
                _orientationChange(we)
            }, nTime)
        }
    }

    function _orientationChange(we) {
        var nPreVertical = _isVertical;
        _isVertical = _getVertical();
        if (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
            if (nPreVertical !== _isVertical) {
                we.sType = "rotate";
                we.isVertical = _isVertical;
                _fireEvent("mobilerotate", we)
            }
        }
    }

    function _onPageshow(we) {
        _isVertical = _getVertical();
        we.sType = "pageShow";
        setTimeout(function() {
            _fireEvent("mobilePageshow", we)
        }, 300)
    }

    function _getTranslateOffsetFromCSSMatrix(element) {
        var curTransform = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
        return {
            top: curTransform.m42,
            left: curTransform.m41
        }
    }

    function _fireEvent(sType, ht) {
        if (_htHandler[sType]) {
            var aData = _htHandler[sType].concat();
            for (var i = 0, len = aData.length; i < len; i++) {
                aData[i].call(this, ht)
            }
        }
    }

    function _getTranslateOffsetFromStyle(element) {
        var nTop = 0,
            nLeft = 0,
            aTemp = [],
            aTransValue = [],
            s = element.style[jindo.m.getCssPrefix() == "" ? "transform" : jindo.m.getCssPrefix() + "Transform"];
        if (!!s && s.length > 0) {
            if (/translate[XY]/.test(s)) {
                var aTx = s.match(/translateX\(([-0-9px]*)\)/);
                var aTy = s.match(/translateY\(([-0-9px]*)\)/);
                aTransValue.push(!!aTx && aTx.length > 1 ? aTx[1] : "0px");
                aTransValue.push(!!aTy && aTy.length > 1 ? aTy[1] : "0px");
                aTemp[1] = aTransValue.join(",")
            } else {
                aTemp = s.match(/translate.{0,2}\((.*)\)/)
            }
            if (!!aTemp && aTemp.length > 1) {
                var a = aTemp[1].split(",");
                if (!!a && a.length > 1) {
                    nTop = parseInt(a[1], 10);
                    nLeft = parseInt(a[0], 10)
                }
            }
        }
        return {
            top: nTop,
            left: nLeft
        }
    }
    var __M__ = {
        MOVETYPE: {
            0: "hScroll",
            1: "vScroll",
            2: "dScroll",
            3: "tap",
            4: "longTap",
            5: "doubleTap",
            6: "pinch",
            7: "rotate",
            8: "pinch-rotate"
        },
        KITKAT_HIGHLIGHT_CLASS: "_jmc_no_tap_highlight_",
        KITKAT_HIGHLIGHT_ID: "_jmc_no_tap_highlight_tag_",
        sVersion: "unknown",
        $init: function() {
            _initDeviceInfo();
            _initTouchEventName();
            _attachEvent();
            var elStyleTag = jindo.$(this.KITKAT_HIGHLIGHT_ID);
            if (!elStyleTag) {
                elStyleTag = document.createElement("style");
                var elHTML = document.getElementsByTagName("html")[0];
                elStyleTag.type = "text/css";
                elStyleTag.id = this.KITKAT_HIGHLIGHT_ID;
                elHTML.insertBefore(elStyleTag, elHTML.firstChild);
                var oSheet = elStyleTag.sheet || elStyleTag.styleSheet;
                oSheet.insertRule("." + this.KITKAT_HIGHLIGHT_CLASS + " { -webkit-tap-highlight-color: rgba(0,0,0,0); }", 0);
                oSheet.insertRule("." + this.KITKAT_HIGHLIGHT_CLASS + " * { -webkit-tap-highlight-color: rgba(0,0,0,0); }", 0)
            }
        },
        bindRotate: function(fHandlerToBind) {
            var aHandler = _htHandler.mobilerotate;
            if (typeof aHandler == "undefined") {
                aHandler = _htHandler.mobilerotate = []
            }
            aHandler.push(fHandlerToBind)
        },
        unbindRotate: function(fHandlerToUnbind) {
            var aHandler = _htHandler.mobilerotate;
            if (aHandler) {
                for (var i = 0, fHandler;
                    (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        break
                    }
                }
            }
        },
        bindPageshow: function(fHandlerToBind) {
            var aHandler = _htHandler.mobilePageshow;
            if (typeof aHandler == "undefined") {
                aHandler = _htHandler.mobilePageshow = []
            }
            aHandler.push(fHandlerToBind)
        },
        unbindPageshow: function(fHandlerToUnbind) {
            var aHandler = _htHandler.mobilePageshow;
            if (aHandler) {
                for (var i = 0, fHandler;
                    (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        break
                    }
                }
            }
        },
        getDeviceInfo: function() {
            return _htDeviceInfo
        },
        getOsInfo: function() {
            return _htOsInfo
        },
        getBrowserInfo: function() {
            return _htBrowserInfo
        },
        isVertical: function() {
            if (_isVertical === null) {
                _isVertical = _getVertical();
                return _isVertical
            } else {
                return _isVertical
            }
        },
        getNodeElement: function(el) {
            while (el.nodeType != 1) {
                el = el.parentNode
            }
            return el
        },
        getTranslateOffset: function(wel) {
            wel = jindo.$Element(wel);
            var element = wel.$value(),
                htOffset;
            if (_htOsInfo.android && parseInt(_htOsInfo.version, 10) === 3) {
                htOffset = _getTranslateOffsetFromStyle(element)
            } else {
                if ("WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix()) {
                    htOffset = _getTranslateOffsetFromCSSMatrix(element)
                } else {
                    htOffset = _getTranslateOffsetFromStyle(element)
                }
            }
            return htOffset
        },
        getStyleOffset: function(wel) {
            var nLeft = parseInt(wel.css("left"), 10),
                nTop = parseInt(wel.css("top"), 10);
            nLeft = isNaN(nLeft) ? 0 : nLeft;
            nTop = isNaN(nTop) ? 0 : nTop;
            return {
                left: nLeft,
                top: nTop
            }
        },
        attachTransitionEnd: function(element, fHandlerToBind) {
            var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
            if (nVersion > 230) {
                element._jindo_fn_ = jindo.$Fn(fHandlerToBind, this).attach(element, "transitionend")
            } else {
                var sEvent = ((this.getCssPrefix() === "ms") ? "MS" : this.getCssPrefix()) + "TransitionEnd";
                element.addEventListener(sEvent, fHandlerToBind, false)
            }
        },
        detachTransitionEnd: function(element, fHandlerToUnbind) {
            var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
            if (nVersion > 230) {
                if (element._jindo_fn_) {
                    element._jindo_fn_.detach(element, "transitionend");
                    delete element._jindo_fn_
                }
            } else {
                var sEvent = ((this.getCssPrefix() === "ms") ? "MS" : this.getCssPrefix()) + "TransitionEnd";
                element.removeEventListener(sEvent, fHandlerToUnbind, false)
            }
        },
        _attachFakeJindo: function(element, fn, sEvent) {
            var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
            var wfn = null;
            if (nVersion < 230 && (typeof _notSupport !== "undefined")) {
                wfn = _notSupport.$Fn(fn).attach(element, sEvent)
            } else {
                wfn = jindo.$Fn(fn).attach(element, sEvent)
            }
            return wfn
        },
        _getTouchEventName: function() {
            return _htTouchEventName
        },
        getCssPrefix: function() {
            var sCssPrefix = "";
            if (typeof document.body.style.webkitTransition !== "undefined") {
                sCssPrefix = "webkit"
            } else {
                if (typeof document.body.style.transition !== "undefined") {} else {
                    if (typeof document.body.style.MozTransition !== "undefined") {
                        sCssPrefix = "Moz"
                    } else {
                        if (typeof document.body.style.OTransition !== "undefined") {
                            sCssPrefix = "O"
                        } else {
                            if (typeof document.body.style.msTransition !== "undefined") {
                                sCssPrefix = "ms"
                            }
                        }
                    }
                }
            }
            jindo.m.getCssPrefix = function() {
                return sCssPrefix
            };
            return sCssPrefix
        },
        getClosest: function(sSelector, elBaseElement) {
            var elClosest;
            var welBaseElement = jindo.$Element(elBaseElement);
            var reg = /<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig;
            if (reg.test(sSelector)) {
                if ("<" + elBaseElement.tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
                    elClosest = elBaseElement
                } else {
                    elClosest = welBaseElement.parent(function(v) {
                        if ("<" + v.$value().tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
                            return v
                        }
                    });
                    elClosest = elClosest.length ? elClosest[0].$value() : false
                }
            } else {
                if (sSelector.indexOf(".") == 0) {
                    sSelector = sSelector.substring(1, sSelector.length)
                }
                if (welBaseElement.hasClass(sSelector)) {
                    elClosest = elBaseElement
                } else {
                    elClosest = welBaseElement.parent(function(v) {
                        if (v.hasClass(sSelector)) {
                            return v
                        }
                    });
                    elClosest = elClosest.length ? elClosest[0].$value() : false
                }
            }
            return elClosest
        },
        useCss3d: function() {
            if (_htAddPatch.useCss3d && typeof _htAddPatch.useCss3d == "function") {
                switch (_htAddPatch.useCss3d()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            var bRet = false;
            if (_htBrowserInfo.chrome && _htBrowserInfo.version < "25" && !_htBrowserInfo.bSBrowser) {
                return bRet
            }
            if (_htOsInfo.ios) {
                bRet = true
            } else {
                if (_htBrowserInfo.firefox) {
                    bRet = true
                } else {
                    if (_htOsInfo.android) {
                        var s = navigator.userAgent.match(/\(.*\)/);
                        if (s instanceof Array && s.length > 0) {
                            s = s[0]
                        }
                        if (_htOsInfo.version >= "4.1.0") {
                            if (/EK-GN120|SM-G386F/.test(s)) {
                                bRet = false
                            } else {
                                bRet = true
                            }
                        } else {
                            if (_htOsInfo.version >= "4.0") {
                                bRet = true
                            }
                            if (_htOsInfo.version >= "4.0.3" && /SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(s) && !/SHW-M420|SHW-M200|GT-S7562/.test(s)) {
                                bRet = true
                            }
                        }
                    }
                }
            }
            return bRet
        },
        patch: function(ver) {
            _htAddPatch.ver = ver;
            return this
        },
        _checkPatchVersion: function() {
            var aVer = jindo.m.Component.VERSION.split("."),
                sVer = aVer.slice(0, 3).join(".");
            if (_htAddPatch.ver >= sVer) {
                return true
            }
            return false
        },
        add: function(htOption) {
            if (this._checkPatchVersion()) {
                for (var i in htOption) {
                    _htAddPatch[i] = htOption[i]
                }
            }
            return this
        },
        getDeviceName: function() {
            if (_htAddPatch.getDeviceName && typeof _htAddPatch.getDeviceName == "function") {
                if (_htAddPatch.getDeviceName()) {
                    return _htAddPatch.getDeviceName()
                }
            }
            var sUserAgent = navigator.userAgent;
            for (var i in _htDeviceList) {
                if (eval("/" + _htDeviceList[i].join("|") + "/").test(sUserAgent)) {
                    return i;
                    break
                }
            }
            var htInfo = jindo.$Agent().os();
            for (var x in htInfo) {
                if (htInfo[x] === true && htInfo.hasOwnProperty(x)) {
                    return x;
                    break
                }
            }
        },
        useFixed: function() {
            if (_htAddPatch.useFixed && typeof _htAddPatch.useFixed == "function") {
                switch (_htAddPatch.useFixed()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            var isFixed = false;
            if (_htBrowserInfo.chrome || _htBrowserInfo.firefox || (_htOsInfo.android && parseInt(_htOsInfo.version, 10) >= 3) || (_htOsInfo.ios && parseInt(_htOsInfo.version, 10) >= 5) || (_htOsInfo.mwin && parseInt(_htOsInfo.version, 10) >= 8)) {
                isFixed = true
            }
            return isFixed
        },
        useTimingFunction: function() {
            if (_htAddPatch.useTimingFunction && typeof _htAddPatch.useTimingFunction == "function" && _htAddPatch.useTimingFunction()) {
                switch (_htAddPatch.useTimingFunction()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            var bUse = this.useCss3d();
            if (_htOsInfo.android) {
                bUse = false
            } else {
                if (_htOsInfo.ios && parseInt(_htOsInfo.version, 10) >= 6) {
                    bUse = false
                }
            }
            return bUse
        },
        _cacheMaxClientSize: {},
        _fullSizeCheckElement: null,
        _allEventStop: function(fp, type) {
            if (!this._htEvent) {
                this._htEvent = {}
            }
            if (type == "detach") {
                this._htEvent.touchstart.detach(document.body, "touchstart").detach(document.body, "touchmove");
                this._htEvent = {}
            } else {
                if (!this._htEvent.touchstart && type == "attach") {
                    this._htEvent.touchstart = jindo.$Fn(fp, this).attach(document.body, "touchstart").attach(document.body, "touchmove")
                }
            }
        },
        _stopDefault: function(e) {
            e.stop()
        },
        _hasOrientation: window.orientation !== undefined,
        _maxClientSize: function(fpCallBack, bInit) {
            var _htOsInfo = this.getOsInfo();
            this._allEventStop(this._stopDefault, "attach");
            if (!this._fullSizeCheckElement) {
                this._fullSizeCheckElement = document.createElement("div")
            }
            var delay = _htOsInfo.android ? 500 : 100;
            delay = bInit ? 1 : delay;
            var type;
            if (this._hasOrientation) {
                type = Math.abs(window.orientation / 90) % 2;
                delay = this._cacheMaxClientSize[type] !== undefined ? 0 : delay
            }
            var that = this;
            if (document.body.scrollTop <= 1) {
                document.body.appendChild(that._fullSizeCheckElement);
                that._fullSizeCheckElement.style.cssText = "position:absolute; top: 0px; width:100%;height:" + parseInt(window.innerHeight + 200, 10) + "px;";
                window.scrollTo(0, 1);
                setTimeout(function() {
                    that._checkSize(that._hasOrientation, that._cacheMaxClientSize, type, fpCallBack, that, delay)
                }, delay)
            } else {
                this._fullSizeCheckElement.style.height = window.innerHeight + "px";
                this._checkSize(this._hasOrientation, this._cacheMaxClientSize, type, fpCallBack, that, delay)
            }
        },
        _checkSize: function(hasOrientation, cacheMaxClientSize, type, fpCallBack, that, delay) {
            var _htOsInfo = this.getOsInfo();
            var _htBrowserInfo = this.getBrowserInfo();
            this._allEventStop(this._stopDefault, "attach");
            var size;
            if (hasOrientation && cacheMaxClientSize[type]) {
                size = cacheMaxClientSize[type]
            } else {
                that._fullSizeCheckElement.style.cssText = "position:absolute; top: 0px; width:100%;height:" + window.innerHeight + "px;overflow:hidden";
                size = _htBrowserInfo.mobile || _htOsInfo.ipad ? {
                    width: window.innerWidth,
                    height: window.innerHeight
                } : {
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight
                };
                if (hasOrientation) {
                    cacheMaxClientSize[type] = size
                }
            }
            fpCallBack.call(that, size);
            var self = this;
            this._allEventStop(this._stopDefault, "detach");
            if (delay === 0) {
                this._fullSizeCheckElement.style.height = "0px"
            } else {
                setTimeout(function() {
                    self._fullSizeCheckElement.style.height = "0px"
                }, delay)
            }
        },
        hasOffsetBug: function() {
            if (_htAddPatch.hasOffsetBug && typeof _htAddPatch.hasOffsetBug == "function") {
                switch (_htAddPatch.hasOffsetBug()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            var bResult = false;
            if (_htOsInfo.android) {
                if (_htBrowserInfo.chrome || _htBrowserInfo.firefox) {
                    bResult = false
                } else {
                    if (_htOsInfo.version < "4") {
                        bResult = true
                    } else {
                        bResult = false
                    }
                }
            } else {
                bResult = false
            }
            return bResult
        },
        hasClickBug: function() {
            if (_htAddPatch.hasClickBug && typeof _htAddPatch.hasClickBug == "function") {
                switch (_htAddPatch.hasClickBug()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            return (_htOsInfo.ios || (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || false)
        },
        _getTranslate: function(sX, sY, bUseCss3d) {
            bUseCss3d = (typeof bUseCss3d == "undefined" ? true : bUseCss3d);
            return "translate" + (bUseCss3d ? "3d(" : "(") + sX + "," + sY + (bUseCss3d ? ",0)" : ")")
        },
        _toPrefixStr: function(str) {
            if (str.length <= 0) {
                return str
            }
            str = this.getCssPrefix() == "" ? str.charAt(0).toLowerCase() + str.substr(1) : str.charAt(0).toUpperCase() + str.substr(1);
            return this.getCssPrefix() + str
        },
        _hasJindoOffsetBug: function() {
            var version = jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION;
            if (parseInt(version.replace(/\D/gi, "")) >= 2100) {
                return false
            } else {
                return true
            }
        },
        _hasKitkatHighlightBug: function() {
            if (_htAddPatch._hasKitkatHighlightBug && typeof _htAddPatch._hasKitkatHighlightBug == "function") {
                switch (_htAddPatch._hasKitkatHighlightBug()) {
                    case -1:
                        return false;
                    case 1:
                        return true
                }
            }
            return (_htBrowserInfo.chrome && !_htBrowserInfo.bSBrowser && _htBrowserInfo.version < 35)
        }
    };
    __M__._isUseFixed = __M__.useFixed;
    __M__._isUseTimingFunction = __M__.useTimingFunction;
    __M__._isUseCss3d = __M__.useCss3d;
    __M__.getCssOffset = __M__.getTranslateOffset;
    __M__.$init();
    return __M__
})();
if (!("mixin" in jindo.$Jindo)) {
    jindo.$Jindo.mixin = function(d, a) {
        var c = {};
        for (var b in d) {
            c[b] = d[b]
        }
        for (b in a) {
            if (a.hasOwnProperty(b) && typeof a[b] != "undefined") {
                c[b] = a[b]
            }
        }
        return c
    }
}
jindo.m.Component = jindo.$Class({
    _htEventHandler: null,
    _htOption: null,
    $init: function() {
        this._htEventHandler = {};
        this._htOption = {};
        this._htOption._htSetter = {};
        this.constructor.$count = (this.constructor.$count || 0) + 1
    },
    option: function(e, c) {
        switch (typeof e) {
            case "undefined":
                var d = {};
                for (var a in this._htOption) {
                    if (!(a == "htCustomEventHandler" || a == "_htSetter")) {
                        d[a] = this._htOption[a]
                    }
                }
                return d;
            case "string":
                if (typeof c != "undefined") {
                    if (e == "htCustomEventHandler") {
                        if (typeof this._htOption[e] == "undefined") {
                            this.attach(c)
                        } else {
                            return this
                        }
                    }
                    this._htOption[e] = c;
                    if (typeof this._htOption._htSetter[e] == "function") {
                        this._htOption._htSetter[e](c)
                    }
                } else {
                    return this._htOption[e]
                }
                break;
            case "object":
                for (var b in e) {
                    if (b == "htCustomEventHandler") {
                        if (typeof this._htOption[b] == "undefined") {
                            this.attach(e[b])
                        } else {
                            continue
                        }
                    }
                    if (b !== "_htSetter") {
                        this._htOption[b] = e[b]
                    }
                    if (typeof this._htOption._htSetter[b] == "function") {
                        this._htOption._htSetter[b](e[b])
                    }
                }
                break
        }
        return this
    },
    optionSetter: function(c, a) {
        switch (typeof c) {
            case "undefined":
                return this._htOption._htSetter;
            case "string":
                if (typeof a != "undefined") {
                    this._htOption._htSetter[c] = jindo.$Fn(a, this).bind()
                } else {
                    return this._htOption._htSetter[c]
                }
                break;
            case "object":
                for (var b in c) {
                    this._htOption._htSetter[b] = jindo.$Fn(c[b], this).bind()
                }
                break
        }
        return this
    },
    fireEvent: function(b, k) {
        k = k || {};
        var d = this["on" + b],
            c = this._htEventHandler[b] || [],
            h = typeof d == "function",
            g = c.length > 0;
        if (!h && !g) {
            return true
        }
        c = c.concat();
        k.sType = b;
        if (typeof k._aExtend == "undefined") {
            k._aExtend = [];
            k.stop = function() {
                if (k._aExtend.length > 0) {
                    k._aExtend[k._aExtend.length - 1].bCanceled = true
                }
            }
        }
        k._aExtend.push({
            sType: b,
            bCanceled: false
        });
        var f = [k],
            e, j;
        for (e = 2, j = arguments.length; e < j; e++) {
            f.push(arguments[e])
        }
        if (h) {
            d.apply(this, f)
        }
        if (g) {
            var a;
            for (e = 0, a;
                (a = c[e]); e++) {
                a.apply(this, f)
            }
        }
        return !k._aExtend.pop().bCanceled
    },
    attach: function(c, a) {
        if (arguments.length == 1) {
            jindo.$H(arguments[0]).forEach(jindo.$Fn(function(d, e) {
                this.attach(e, d)
            }, this).bind());
            return this
        }
        var b = this._htEventHandler[c];
        if (typeof b == "undefined") {
            b = this._htEventHandler[c] = []
        }
        b.push(a);
        return this
    },
    detach: function(e, b) {
        if (arguments.length == 1) {
            jindo.$H(arguments[0]).forEach(jindo.$Fn(function(f, g) {
                this.detach(g, f)
            }, this).bind());
            return this
        }
        var d = this._htEventHandler[e];
        if (d) {
            for (var a = 0, c;
                (c = d[a]); a++) {
                if (c === b) {
                    d = d.splice(a, 1);
                    break
                }
            }
        }
        return this
    },
    detachAll: function(c) {
        var b = this._htEventHandler;
        if (arguments.length) {
            if (typeof b[c] == "undefined") {
                return this
            }
            delete b[c];
            return this
        }
        for (var a in b) {
            delete b[a]
        }
        return this
    }
});
jindo.m.Component.factory = function(b, f) {
    var c = [],
        a;
    if (typeof f == "undefined") {
        f = {}
    }
    for (var d = 0, e;
        (e = b[d]); d++) {
        a = new this(e, f);
        c[c.length] = a
    }
    return c
};
jindo.m.Component.getInstance = function() {
    throw new Error("JC 1.11.0 or JMC 1.13.0 later, getInstance method of Component is not longer supported.")
};
jindo.m.Component.VERSION = "1.17.0";
jindo.m.UIComponent = jindo.$Class({
    $init: function() {
        this._bIsActivating = false
    },
    isActivating: function() {
        return this._bIsActivating
    },
    activate: function() {
        if (this.isActivating()) {
            return this
        }
        this._bIsActivating = true;
        if (arguments.length > 0) {
            this._onActivate.apply(this, arguments)
        } else {
            this._onActivate()
        }
        return this
    },
    deactivate: function() {
        if (!this.isActivating()) {
            return this
        }
        this._bIsActivating = false;
        if (arguments.length > 0) {
            this._onDeactivate.apply(this, arguments)
        } else {
            this._onDeactivate()
        }
        return this
    }
}).extend(jindo.m.Component);
jindo.m.Effect = function(i) {
    if (this instanceof arguments.callee) {
        throw new Error("You can't create a instance of this")
    }
    var e = /^(\-?[0-9\.]+)(%|\w+)?$/,
        a = /^rgb\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+)\)$/i,
        j = /^rgba\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+),\s?([0-9\.]+)\)$/i,
        f = /^hsl\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%\)$/i,
        h = /^hsla\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%,\s?([0-9\.]+)\)$/i,
        c = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
        g = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/i;
    var d = function(o) {
        var p = o,
            n;
        if (e.test(o)) {
            p = parseFloat(o);
            n = RegExp.$2 || ""
        } else {
            if (a.test(o)) {
                p = {
                    rgb: [parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), 1]
                };
                n = "color"
            } else {
                if (j.test(o)) {
                    p = {
                        rgb: [parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), parseFloat(RegExp.$4)]
                    };
                    n = "color"
                } else {
                    if (f.test(o)) {
                        p = {
                            hsl: [parseFloat(RegExp.$1), parseFloat(RegExp.$2) / 100, parseFloat(RegExp.$3) / 100, 1]
                        };
                        p.rgb = m.apply(this, p.hsl);
                        n = "color"
                    } else {
                        if (h.test(o)) {
                            p = {
                                hsl: [parseFloat(RegExp.$1), parseFloat(RegExp.$2) / 100, parseFloat(RegExp.$3) / 100, parseFloat(RegExp.$4)]
                            };
                            p.rgb = m.apply(this, p.hsl);
                            n = "color"
                        } else {
                            if (c.test(o = o.replace(g, "#$1$1$2$2$3$3"))) {
                                p = {
                                    rgb: [parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16), 1]
                                };
                                n = "color"
                            } else {
                                throw new Error("unit error (" + o + ")")
                            }
                        }
                    }
                }
            }
        }
        return {
            nValue: p,
            sUnit: n
        }
    };
    var l = function(n) {
        var o = [];
        n.replace(/([^\s]+\([^\)]*\)|[^\s]+)\s?/g, function(q, p) {
            o.push(p)
        });
        return o
    };
    var k = function(n) {
        var o = l(n ? n + "" : "0");
        var q = [];
        for (var p = 0, r = o.length; p < r; p++) {
            q.push(d(o[p]))
        }
        return q
    };
    var b = function(n) {
        if (typeof n === "object") {
            return {
                nValue: n.nValue,
                sUnit: n.sUnit
            }
        }
        return n
    };
    var m = function(v, t, u, r) {
        v = (v % 360) / 60;
        var n = (1 - Math.abs((2 * u) - 1)) * t;
        var o = n * (1 - Math.abs((v % 2) - 1));
        var s = 0,
            p = 0,
            w = 0;
        if (v >= 5 || v < 1) {
            s = n;
            w = o
        } else {
            if (v >= 4) {
                s = o;
                w = n
            } else {
                if (v >= 3) {
                    p = o;
                    w = n
                } else {
                    if (v >= 2) {
                        p = n;
                        w = o
                    } else {
                        if (v >= 1) {
                            s = o;
                            p = n
                        }
                    }
                }
            }
        }
        var q = u - (n / 2);
        return [Math.round((s + q) * 255), Math.round((p + q) * 255), Math.round((w + q) * 255), r]
    };
    return function(n, q) {
        var s, p;
        var o = function() {
            var t = false;
            if (r.start !== n) {
                s = k(r.start);
                n = r.start;
                t = true
            }
            if (r.end !== q) {
                p = k(r.end);
                q = r.end;
                t = true
            }
            if (t) {
                var x = Math.max(s.length, p.length);
                var w, v;
                if (s.length !== p.length && x > 1) {
                    switch (s.length) {
                        case 1:
                            s[1] = b(s[0]);
                        case 2:
                            s[2] = b(s[0]);
                        case 3:
                            s[3] = b(s[1]);
                            break
                    }
                    switch (p.length) {
                        case 1:
                            p[1] = b(p[0]);
                        case 2:
                            p[2] = b(p[0]);
                        case 3:
                            p[3] = b(p[1]);
                            break
                    }
                }
                for (var u = 0; u < x; u++) {
                    w = s[u];
                    v = p[u];
                    if (w.nValue === 0) {
                        w.sUnit = v.sUnit
                    } else {
                        if (v.nValue === 0) {
                            v.sUnit = w.sUnit
                        }
                    }
                    if (w.sUnit != v.sUnit) {
                        throw new Error("unit error (" + n + " ~ " + q + ")")
                    }
                }
            }
        };
        var r = function(B) {
            var D = [];
            o();
            var u, t;
            var L, I, E;
            var v;
            for (var F = 0, y = Math.max(s.length, p.length); F < y; F++) {
                u = s[F];
                t = p[F];
                L = u.nValue;
                I = t.nValue;
                E = u.sUnit;
                var x = i(B),
                    w = function(N, O, M) {
                        return Math.round(((O - N) * x + N) * 1000000) / 1000000 + (M || 0)
                    };
                if (E !== "color") {
                    D.push(w(L, I, E));
                    continue
                }
                if (L.hsl && I.hsl) {
                    L = L.hsl;
                    I = I.hsl;
                    var G = Math.round(w(L[0], I[0]));
                    var z = Math.max(0, Math.min(1, w(L[1], I[1]))) * 100;
                    var C = Math.max(0, Math.min(1, w(L[2], I[2]))) * 100;
                    v = w(L[3], I[3]);
                    if (v === 1) {
                        D.push("hsl(" + [G, z + "%", C + "%"].join(",") + ")")
                    } else {
                        D.push("hsla(" + [G, z + "%", C + "%", v].join(",") + ")")
                    }
                } else {
                    L = L.rgb;
                    I = I.rgb;
                    var A = Math.max(0, Math.min(255, Math.round(w(L[0], I[0]))));
                    var H = Math.max(0, Math.min(255, Math.round(w(L[1], I[1]))));
                    var J = Math.max(0, Math.min(255, Math.round(w(L[2], I[2]))));
                    v = w(L[3], I[3]);
                    if (v === 1) {
                        var K = ((A << 16) | (H << 8) | J).toString(16).toUpperCase();
                        D.push("#" + Array(7 - K.length).join("0") + K)
                    } else {
                        D.push("rgba(" + [A, H, J, v].join(",") + ")")
                    }
                }
            }
            return D.join(" ")
        };
        switch (arguments.length) {
            case 0:
                break;
            case 1:
                q = n || "0";
                n = "0";
                r.setStart = function(t) {
                    this.start = t
                };
                break
        }
        r.start = n;
        r.end = q;
        r.effectConstructor = arguments.callee;
        n = q = null;
        if (arguments.length > 1) {
            o()
        }
        return r
    }
};
jindo.m.Effect.linear = jindo.m.Effect(function(a) {
    return a
});
jindo.m.Effect.linear.toString = function() {
    return "linear"
};
jindo.m.Effect.easeInSine = jindo.m.Effect(function(a) {
    return (a == 1) ? 1 : -Math.cos(a * (Math.PI / 2)) + 1
});
jindo.m.Effect.easeOutSine = jindo.m.Effect(function(a) {
    return Math.sin(a * (Math.PI / 2))
});
jindo.m.Effect.easeInOutSine = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInSine(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutSine(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInSine = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutSine(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInSine(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInQuad = jindo.m.Effect(function(a) {
    return a * a
});
jindo.m.Effect.easeOutQuad = jindo.m.Effect(function(a) {
    return -(a * (a - 2))
});
jindo.m.Effect.easeInOutQuad = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInQuad(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutQuad(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInQuad = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutQuad(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInQuad(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInCubic = jindo.m.Effect(function(a) {
    return Math.pow(a, 3)
});
jindo.m.Effect.easeOutCubic = jindo.m.Effect(function(a) {
    return Math.pow((a - 1), 3) + 1
});
jindo.m.Effect.easeInOutCubic = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeIn(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOut(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInCubic = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOut(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeIn(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInQuart = jindo.m.Effect(function(a) {
    return Math.pow(a, 4)
});
jindo.m.Effect.easeOutQuart = jindo.m.Effect(function(a) {
    return -(Math.pow(a - 1, 4) - 1)
});
jindo.m.Effect.easeInOutQuart = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInQuart(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutQuart(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInQuart = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutQuart(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInQuart(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInQuint = jindo.m.Effect(function(a) {
    return Math.pow(a, 5)
});
jindo.m.Effect.easeOutQuint = jindo.m.Effect(function(a) {
    return Math.pow(a - 1, 5) + 1
});
jindo.m.Effect.easeInOutQuint = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInQuint(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutQuint(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInQuint = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutQuint(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInQuint(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInCircle = jindo.m.Effect(function(a) {
    return -(Math.sqrt(1 - (a * a)) - 1)
});
jindo.m.Effect.easeOutCircle = jindo.m.Effect(function(a) {
    return Math.sqrt(1 - (a - 1) * (a - 1))
});
jindo.m.Effect.easeInOutCircle = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInCircle(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutCircle(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInCircle = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutCircle(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInCircle(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInBack = jindo.m.Effect(function(a) {
    var b = 1.70158;
    return (a == 1) ? 1 : (a / 1) * (a / 1) * ((1 + b) * a - b)
});
jindo.m.Effect.easeOutBack = jindo.m.Effect(function(a) {
    var b = 1.70158;
    return (a === 0) ? 0 : (a = a / 1 - 1) * a * ((b + 1) * a + b) + 1
});
jindo.m.Effect.easeInOutBack = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInBack(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutBack(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInElastic = jindo.m.Effect(function(c) {
    var d = 0,
        b = 0,
        e;
    if (c === 0) {
        return 0
    }
    if ((c /= 1) == 1) {
        return 1
    }
    if (!d) {
        d = 0.3
    }
    if (!b || b < 1) {
        b = 1;
        e = d / 4
    } else {
        e = d / (2 * Math.PI) * Math.asin(1 / b)
    }
    return -(b * Math.pow(2, 10 * (c -= 1)) * Math.sin((c - 1) * (2 * Math.PI) / d))
});
jindo.m.Effect.easeOutElastic = jindo.m.Effect(function(c) {
    var d = 0,
        b = 0,
        e;
    if (c === 0) {
        return 0
    }
    if ((c /= 1) == 1) {
        return 1
    }
    if (!d) {
        d = 0.3
    }
    if (!b || b < 1) {
        b = 1;
        e = d / 4
    } else {
        e = d / (2 * Math.PI) * Math.asin(1 / b)
    }
    return (b * Math.pow(2, -10 * c) * Math.sin((c - e) * (2 * Math.PI) / d) + 1)
});
jindo.m.Effect.easeInOutElastic = jindo.m.Effect(function(c) {
    var d = 0,
        b = 0,
        e;
    if (c === 0) {
        return 0
    }
    if ((c = c / (1 / 2)) == 2) {
        return 1
    }
    if (!d) {
        d = (0.3 * 1.5)
    }
    if (!b || b < 1) {
        b = 1;
        e = d / 4
    } else {
        e = d / (2 * Math.PI) * Math.asin(1 / b)
    }
    if (c < 1) {
        return -0.5 * (b * Math.pow(2, 10 * (c -= 1)) * Math.sin((c - e) * (2 * Math.PI) / d))
    }
    return b * Math.pow(2, -10 * (c -= 1)) * Math.sin((c - e) * (2 * Math.PI) / d) * 0.5 + 1
});
jindo.m.Effect.easeOutBounce = jindo.m.Effect(function(a) {
    if (a < (1 / 2.75)) {
        return (7.5625 * a * a)
    } else {
        if (a < (2 / 2.75)) {
            return (7.5625 * (a -= (1.5 / 2.75)) * a + 0.75)
        } else {
            if (a < (2.5 / 2.75)) {
                return (7.5625 * (a -= (2.25 / 2.75)) * a + 0.9375)
            } else {
                return (7.5625 * (a -= (2.625 / 2.75)) * a + 0.984375)
            }
        }
    }
});
jindo.m.Effect.easeInBounce = jindo.m.Effect(function(a) {
    return 1 - jindo.m.Effect.easeOutBounce(0, 1)(1 - a)
});
jindo.m.Effect.easeInOutBounce = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInBounce(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutBounce(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeInExpo = jindo.m.Effect(function(a) {
    return (a === 0) ? 0 : Math.pow(2, 10 * (a - 1))
});
jindo.m.Effect.easeOutExpo = jindo.m.Effect(function(a) {
    return (a == 1) ? 1 : -Math.pow(2, -10 * a / 1) + 1
});
jindo.m.Effect.easeInOutExpo = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeInExpo(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeOutExpo(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect.easeOutInExpo = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.easeOutExpo(0, 1)(2 * a) * 0.5 : jindo.m.Effect.easeInExpo(0, 1)((2 * a) - 1) * 0.5 + 0.5
});
jindo.m.Effect._cubicBezier = function(b, d, a, c) {
    return function(n) {
        var k = 3 * b,
            m = 3 * (a - b) - k,
            e = 1 - k - m,
            j = 3 * d,
            l = 3 * (c - d) - j,
            o = 1 - j - l;

        function i(p) {
            return ((e * p + m) * p + k) * p
        }

        function h(p) {
            return ((o * p + l) * p + j) * p
        }

        function f(p) {
            return (3 * e * p + 2 * m) * p + k
        }

        function g(p, w) {
            var v, u, s, q, t, r;
            for (s = p, r = 0; r < 8; r++) {
                q = i(s) - p;
                if (Math.abs(q) < w) {
                    return s
                }
                t = f(s);
                if (Math.abs(t) < 0.000001) {
                    break
                }
                s = s - q / t
            }
            v = 0;
            u = 1;
            s = p;
            if (s < v) {
                return v
            }
            if (s > u) {
                return u
            }
            while (v < u) {
                q = i(s);
                if (Math.abs(q - p) < w) {
                    return s
                }
                if (p > q) {
                    v = s
                } else {
                    u = s
                }
                s = (u - v) * 0.5 + v
            }
            return s
        }
        return h(g(n, 1 / 200))
    }
};
jindo.m.Effect.cubicBezier = function(b, e, a, c) {
    var g = jindo.m.Effect(jindo.m.Effect._cubicBezier(b, e, a, c));
    var d = "cubic-bezier(" + [b, e, a, c].join(",") + ")";
    g.toString = function() {
        return d
    };
    return g
};
jindo.m.Effect.cubicEase = jindo.m.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
jindo.m.Effect.cubicEase.toString = function() {
    return "ease"
};
jindo.m.Effect.cubicEaseIn = jindo.m.Effect.cubicBezier(0.42, 0, 1, 1);
jindo.m.Effect.cubicEaseIn.toString = function() {
    return "ease-in"
};
jindo.m.Effect.cubicEaseOut = jindo.m.Effect.cubicBezier(0, 0, 0.58, 1);
jindo.m.Effect.cubicEaseOut.toString = function() {
    return "ease-out"
};
jindo.m.Effect.cubicEaseInOut = jindo.m.Effect.cubicBezier(0.42, 0, 0.58, 1);
jindo.m.Effect.cubicEaseInOut.toString = function() {
    return "ease-in-out"
};
jindo.m.Effect.cubicEaseOutIn = jindo.m.Effect.cubicBezier(0, 0.42, 1, 0.58);
jindo.m.Effect.overphase = jindo.m.Effect(function(a) {
    a /= 0.652785;
    return (Math.sqrt((2 - a) * a) + (0.1 * a)).toFixed(5)
});
jindo.m.Effect.sinusoidal = jindo.m.Effect(function(a) {
    return (-Math.cos(a * Math.PI) / 2) + 0.5
});
jindo.m.Effect.mirror = jindo.m.Effect(function(a) {
    return (a < 0.5) ? jindo.m.Effect.sinusoidal(0, 1)(a * 2) : jindo.m.Effect.sinusoidal(0, 1)(1 - (a - 0.5) * 2)
});
jindo.m.Effect.pulse = function(a) {
    return jindo.m.Effect(function(b) {
        return (-Math.cos((b * (a - 0.5) * 2) * Math.PI) / 2) + 0.5
    })
};
jindo.m.Effect.wave = function(b, a) {
    return jindo.m.Effect(function(c) {
        return (a || 1) * (Math.sin(b * (c * 360) * Math.PI / 180)).toFixed(5)
    })
};
jindo.m.Effect.stepStart = jindo.m.Effect(function(a) {
    return a === 0 ? 0 : 1
});
jindo.m.Effect.stepEnd = jindo.m.Effect(function(a) {
    return a === 1 ? 1 : 0
});
jindo.m.Effect.easeIn = jindo.m.Effect.easeInCubic;
jindo.m.Effect.easeOut = jindo.m.Effect.easeOutCubic;
jindo.m.Effect.easeInOut = jindo.m.Effect.easeInOutCubic;
jindo.m.Effect.easeOutIn = jindo.m.Effect.easeOutInCubic;
jindo.m.Effect.bounce = jindo.m.Effect.easeOutBounce;
jindo.m.Effect.elastic = jindo.m.Effect.easeInElastic;
jindo.m.Morph = jindo.$Class({
    $init: function(c) {
        this.option({
            fEffect: jindo.m.Effect.linear,
            bUseTransition: true
        }).option(c);
        var b = document.body.style;
        this._bTransitionSupport = ("transition" in b || "webkitTransition" in b || "MozTransition" in b || "OTransition" in b || "msTransition" in b);
        var a = jindo.$Agent();
        var e = a.os();
        var d = a.navigator();
        this._bHasTransformRenderBug = e.ios && parseInt(e.version, 10) === 5 && d.msafari;
        this._aQueue = [];
        this._aIngItem = null;
        this._oRAF = null;
        this._bPlaying = null;
        this._nPtr = 0;
        this._nPausePassed = 0;
        this._aRepeat = [];
        this._sTransitionEnd = (("webkitTransition" in b && "webkitTransitionEnd") || ("transition" in b && "transitionend") || ("MozTransition" in b && "transitionend") || ("OTransition" in b && "oTransitionEnd") || ("msTransition" in b && "MSTransitionEnd"))
    },
    pushAnimate: function(b, a) {
        if (a && !(a instanceof Array)) {
            throw Error("aLists should be a instance of Array")
        }
        a = [].concat(a);
        a.duration = b;
        this._aQueue.push(a);
        return this
    },
    pushKeyframe: function(b, a) {
        this._aQueue.push({
            action: "keyframe",
            args: {
                duration: b,
                keyframe: a
            }
        });
        return this
    },
    pushWait: function(e) {
        var a;
        for (var b = 0, d = arguments.length; b < d; b++) {
            var c = arguments[b];
            if (c instanceof this.constructor) {
                this._aQueue.push(c)
            } else {
                this.pushAnimate(c, [])
            }
        }
        return this
    },
    pushCall: function(a) {
        this._aQueue.push(a);
        return this
    },
    pushRepeatStart: function(b) {
        if (typeof b === "undefined") {
            b = 1
        }
        var a = "L" + Math.round(new Date().getTime() * Math.random());
        this._aRepeat.push(a);
        this._pushLabel(a, b);
        return this
    },
    _pushLabel: function(b, a) {
        if (typeof a === "undefined") {
            a = Infinity
        }
        this._aQueue.push({
            action: "label",
            args: {
                label: b,
                times: a,
                loops: 0
            }
        });
        return this
    },
    pushRepeatEnd: function() {
        var a = this;
        var b = this._aRepeat.pop();
        this._aQueue.push({
            action: "goto",
            args: {
                label: b
            }
        });
        return this
    },
    _waitMorph: function(b) {
        var a = this;
        if (!b.isPlaying()) {
            return true
        }
        var c = function() {
            b.detach("end", c).detach("pause", c);
            a._flushQueue()
        };
        b.attach("end", c).attach("pause", c);
        return false
    },
    _getLabelIndex: function(c) {
        var a = null;
        for (var b = 0, d = this._aQueue.length; b < d; b++) {
            a = this._aQueue[b];
            if (a.action === "label" && a.args.label === c) {
                return b
            }
        }
        return -1
    },
    _getRepeatEndIndex: function(c, e) {
        var a = null;
        for (var b = e || 0, d = this._aQueue.length; b < d; b++) {
            a = this._aQueue[b];
            if (a.action === "goto" && a.args.label === c) {
                return b
            }
        }
        return -1
    },
    _flushQueue: function() {
        var c, g;
        var j = this;
        var d, e, f;
        do {
            c = false;
            g = this._aIngItem = this._aQueue[this._nPtr];
            if (!g) {
                this._bPlaying = false;
                if (!g) {
                    this.fireEvent("end")
                }
                return
            }
            this._nPtr++;
            if (g instanceof Function) {
                g.call(this);
                c = true;
                continue
            } else {
                if (g instanceof this.constructor) {
                    c = this._waitMorph(g);
                    continue
                } else {
                    if (typeof g === "number") {
                        setTimeout(function() {
                            j._flushQueue()
                        }, g);
                        continue
                    } else {
                        if (g.action === "label") {
                            if (++g.args.loops > g.args.times) {
                                var a = this._getRepeatEndIndex(g.args.label, this._nPtr);
                                g.args.loops = 0;
                                if (a > -1) {
                                    this._goto(a + 1)
                                }
                            }
                            c = true;
                            continue
                        } else {
                            if (g.action === "goto") {
                                this._goto(g.args.label);
                                c = true;
                                continue
                            } else {
                                if (g.action === "keyframe") {
                                    d = g.args.keyframe;
                                    e = this._nPausePassed;
                                    f = this._aCompiledItem = g.args;
                                    c = f.duration < 0;
                                    if (c) {
                                        this._processKeyframe(1, d);
                                        continue
                                    }
                                    this._playKeyframe(e, d);
                                    this._nPausePassed = 0;
                                    continue
                                }
                            }
                        }
                    }
                }
            }
            f = this._aCompiledItem;
            e = this._nPausePassed;
            if (!e) {
                f = this._aCompiledItem = this._compileItem(g)
            } else {
                for (var b = 0, h = f.length; b < h; b++) {
                    f[b].sTimingFunc = ""
                }
                f.allCSS = false
            }
            if (f.length === 0) {
                setTimeout(function() {
                    j._flushQueue()
                }, f.duration);
                continue
            }
            c = f.duration < 0;
            if (c) {
                this._processItem(1, true);
                continue
            }
            this._playAnimate(e);
            this._nPausePassed = 0
        } while (c)
    },
    _playKeyframe: function(c, e) {
        var d = this;
        this._nStart = new Date().getTime() - c;
        var a = this._aCompiledItem;
        var f = a.duration;
        (function b() {
            d._oRAF = d._requestAnimationFrame(function() {
                var g = d._nStart;
                if (d._oRAF === null) {
                    return
                }
                d._oRAF = null;
                var h = Math.min(1, Math.max(0, (new Date().getTime() - g) / f));
                e.frame(h);
                if (h < 1) {
                    b()
                } else {
                    d.fireEvent("timerEnd");
                    d._flushQueue()
                }
            })
        })()
    },
    _processKeyframe: function(a, b) {
        b.preprocess().frame(a)
    },
    _playAnimate: function(b) {
        var c = this;
        this._nStart = new Date().getTime() - b;
        this._nIng = 2;
        if (!b) {
            this._processItem(0, true, 3, true)
        }
        var a = this._aCompiledItem;
        if (a.allCSS) {
            this._nIng--
        } else {
            this._animationLoop(true)
        }(function() {
            var g = c._processItem(1, true, 1).transitionCache;
            if (!g || a.duration === 0) {
                if (--c._nIng === 0) {
                    c._flushQueue()
                }
                return
            }
            var h = g.length;
            var f = h ? g[0] : null;
            var e = function(k) {
                var l;
                var j = [];
                while (l = g.pop()) {
                    l.css(c._getCSSKey("transitionDuration"), "0.0001ms");
                    j.push(l)
                }
                g = null;
                (window.requestAnimationFrame || window.setTimeout)(function() {
                    while (l = j.pop()) {
                        l.css(c._getCSSKey("transitionDuration"), "0");
                        l.css(c._getCSSKey("transitionProperty"), "none")
                    }
                    j = null
                }, 0);
                c.fireEvent("transitionEnd");
                if (--c._nIng === 0 && !k) {
                    c._requestAnimationFrame(function() {
                        c._flushQueue()
                    })
                }
            };
            if (!f) {
                e();
                return
            }
            var d = f.$value();
            var i = function(j) {
                d.removeEventListener(c._sTransitionEnd, c._fpOnTransitionEnd, true);
                c._fpOnTransitionEnd = null;
                e(j === true)
            };
            c._fpOnTransitionEnd = function(j) {
                i(j)
            };
            d.addEventListener(c._sTransitionEnd, c._fpOnTransitionEnd, true)
        })()
    },
    _animationLoop: function(b) {
        var a = this;
        this._oRAF = this._requestAnimationFrame(function() {
            var c = a._nStart;
            var e = a._aCompiledItem.duration;
            if (a._oRAF === null) {
                return
            }
            a._oRAF = null;
            var d = Math.min(1, Math.max(0, (new Date().getTime() - c) / e));
            a._processItem(d, b, 2);
            if (d < 1) {
                a._animationLoop()
            } else {
                a.fireEvent("timerEnd");
                if (--a._nIng === 0) {
                    a._flushQueue()
                }
            }
        })
    },
    _processItem: function(d, m, h, q) {
        var w = {
            normalPropsToPause: [],
            transitionCache: []
        };
        var o = w.normalPropsToPause;
        var f = w.transitionCache;
        var s = this;
        var j = this._aCompiledItem;
        var p = j.duration;
        if (p === 0) {
            p = 1
        } else {
            if (p < 0) {
                p = 0
            }
        }
        var l, x, c;
        var g, k;
        var t;
        var v = this._bHasTransformRenderBug;
        h = h || (1 | 2);
        if (!this.fireEvent("beforeProgress", {
                nRate: d
            })) {
            return
        }
        var a = [],
            e;
        for (var u = 0, r; r = j[u]; u++) {
            l = r.oObj;
            x = r.welObj;
            c = r.oProps;
            var b = r.sTimingFunc;
            if (b && (h & 1)) {
                x && x.$value().clientHeight;
                if (!("@transition" in c) && !q) {
                    if (!("@transitionProperty" in c)) {
                        x.css(this._getCSSKey("transitionProperty"), "all")
                    }
                    if (!("@transitionDuration" in c)) {
                        x.css(this._getCSSKey("transitionDuration"), (p / 1000).toFixed(3) + "s")
                    }
                    if (!("@transitionTimingFunction" in c)) {
                        x.css(this._getCSSKey("transitionTimingFunction"), b)
                    }
                }
                f.push(x)
            }
            e = {};
            a.push(l, e);
            if (q && d === 1 && "@transform" in c && /AppleWebKit\/534\.30/.test(navigator.userAgent)) {
                x.css(this._getCSSKey("transform"), "");
                l.clientHeight
            }
            for (var n in c) {
                if (c.hasOwnProperty(n)) {
                    g = c[n];
                    t = /^@(.*)$/.test(n) && RegExp.$1;
                    k = b && t ? 1 : 2;
                    if (!(h & k)) {
                        continue
                    }
                    if (typeof g === "function") {
                        g = g(d)
                    } else {
                        if (!m) {
                            continue
                        }
                    }
                    if (t) {
                        if (/transition/.test(n)) {
                            g = this._getCSSVal(g)
                        }
                        if (v && "@transform" === n && ("@left" in c || "@top" in c)) {
                            l.clientHeight
                        }
                        x.css(this._getCSSKey(t), g)
                    } else {
                        if (q) {
                            o.push([l, n, g])
                        } else {
                            l[n] = g
                        }
                    }
                    e[n] = g
                }
            }
        }
        this.fireEvent("progress", {
            aLists: a,
            nRate: d
        });
        return w
    },
    _compileItem: function(y) {
        var d = y.length == 0;
        var q = [];
        q.duration = y.duration;
        var g, t, b;
        var u, m;
        var x;
        var v, n;
        var p = this.option("fEffect");
        for (var r = 0, l = y.length; r < l; r += 2) {
            var h, a = null;
            g = y[r];
            t = jindo.$Element(g);
            b = y[r + 1];
            x = {};
            var j = false;
            for (var k in b) {
                if (b.hasOwnProperty(k)) {
                    var w, c;
                    m = b[k];
                    v = /^@(.*)$/.test(k);
                    n = RegExp.$1;
                    if (m instanceof Array) {
                        u = m[0];
                        m = m[1]
                    } else {
                        if (v) {
                            u = t.css(this._getCSSKey(n))
                        } else {
                            u = g[k]
                        }
                    }
                    u = (u === 0 ? u : u || "");
                    w = typeof m === "function" ? m.effectConstructor : p;
                    c = this._getEffectCSS(w) || "";
                    if (/^@transform$/.test(k)) {
                        if (typeof m === "function") {
                            m = m.end
                        }
                        x[k] = this._getTransformFunction(u, m, w, g);
                        if (jindo.m) {
                            var o = jindo.m.getOsInfo();
                            if (/matrix/.test(u) || /matrix/.test(m)) {
                                if (o.android && parseFloat(o.version) < 3) {
                                    c = ""
                                }
                            }
                        }
                    } else {
                        if (typeof m === "function") {
                            if ("setStart" in m) {
                                m.setStart(u)
                            }
                            x[k] = m
                        } else {
                            try {
                                x[k] = w(u, m)
                            } catch (s) {
                                if (!/^unit error/.test(s.message)) {
                                    throw s
                                }
                                x[k] = m
                            }
                        }
                    }
                    var f = x[k];
                    if (typeof f === "function" && f(0) === f(1)) {
                        delete x[k];
                        continue
                    }
                    if (v) {
                        if (a === null) {
                            a = c
                        } else {
                            if (a !== c) {
                                a = ""
                            }
                        }
                    } else {
                        c = ""
                    }
                    d = d || !c;
                    j = true
                }
            }
            if (!t.visible()) {
                a = null, d = true
            }
            j && q.push({
                oObj: g,
                welObj: t,
                oProps: x,
                sTimingFunc: a
            })
        }
        q.allCSS = !d;
        return q
    },
    play: function() {
        if (!this._bPlaying) {
            this._bPlaying = true;
            this.fireEvent("play");
            this._flushQueue()
        }
        return this
    },
    reset: function() {
        return this._goto(0)
    },
    pause: function(c) {
        if (!this._bPlaying) {
            return this
        }
        this._cancelAnimationFrame(this._oRAF);
        this._oRAF = null;
        var b = this._aCompiledItem;
        var h = b.duration;
        if (typeof c === "undefined") {
            var a = new Date().getTime() - this._nStart;
            c = a / h
        }
        c = Math.max(0, Math.min(1, c));
        var f = null;
        if (b.keyframe) {
            this._processKeyframe(c, b.keyframe)
        } else {
            f = this._processItem(c, true, 3, true).normalPropsToPause
        }
        this._nPtr--;
        this._nPausePassed = Math.round(h * c);
        if (this._fpOnTransitionEnd) {
            this._fpOnTransitionEnd(true)
        }
        if (f) {
            for (var e = 0, g = f.length; e < g; e++) {
                var d = f[e];
                d[0][d[1]] = d[2]
            }
        }
        this._bPlaying = false;
        this.fireEvent("pause");
        return this
    },
    _goto: function(a) {
        var b = a;
        if (typeof a === "number") {
            a = a || 0
        } else {
            a = this._getLabelIndex(b);
            if (a === -1) {
                throw "Label not found"
            }
        }
        this._nPtr = a;
        this._nPausePassed = 0;
        return this
    },
    isPlaying: function() {
        return this._bPlaying || false
    },
    clear: function() {
        this._aQueue.length = 0;
        this._aRepeat.length = 0;
        this._nPtr = 0;
        this._nPausePassed = 0;
        return this
    },
    _getPointer: function() {
        return this._nPtr
    },
    _getEffectCSS: function(a) {
        var b = this.option("bUseTransition") && this._bTransitionSupport;
        if (!b) {
            return null
        }
        if ((this._htEventHandler.progress && this._htEventHandler.progress.length) || (this._htEventHandler.beforeProgress && this._htEventHandler.beforeProgress.length)) {
            return null
        }
        if (a.hasOwnProperty("toString")) {
            return a.toString()
        }
        switch (a) {
            case jindo.m.Effect.linear:
                return "linear";
                break;
            case jindo.m.Effect.cubicEase:
                return "ease";
                break;
            case jindo.m.Effect.cubicEaseIn:
                return "ease-in";
                break;
            case jindo.m.Effect.cubicEaseOut:
                return "ease-out";
                break;
            case jindo.m.Effect.cubicEaseInOut:
                return "ease-in-out";
                break;
            default:
                if (a.cubicBezier && Math.max.apply(Math, a.cubicBezier) <= 1 && Math.min.apply(Math, a.cubicBezier) >= 0) {
                    return "cubic-bezier(" + a.cubicBezier.join(",") + ")"
                }
                break
        }
        return null
    },
    _requestAnimationFrame: function(d) {
        var b;
        var a = this;
        var c = function() {
            if (b === a._oLastRAF) {
                a._oLastRAF = null;
                d()
            }
        };
        if (window.requestAnimationFrame) {
            b = requestAnimationFrame(c)
        } else {
            b = setTimeout(c, 1000 / 60)
        }
        return (this._oLastRAF = b)
    },
    _cancelAnimationFrame: function(b) {
        var a;
        if (window.cancelAnimationFrame) {
            a = cancelAnimationFrame(b)
        } else {
            a = clearTimeout(b)
        }
        this._oLastRAF = null;
        return a
    },
    _oProperPrefix: {},
    _getProperPrefix: function(a) {
        var h = this._oProperPrefix;
        if (a in h) {
            return h[a]
        }
        var g = document.body.style;
        var e = ["webkit", "", "Moz", "O", "ms"];
        var b, d;
        var c = function(i) {
            return i.toUpperCase()
        };
        for (var f = 0, j = e.length; f < j; f++) {
            b = e[f];
            d = b + (b ? a.replace(/^[a-z]/, c) : a);
            if (d in g) {
                return (h[a] = b)
            }
        }
        return (h[a] = "")
    },
    _getCSSKey: function(d) {
        var c = this;
        var b = "";
        var a = d.replace(/^(\-(webkit|o|moz|ms)\-)?([a-z]+)/, function(e, f, g, h) {
            b = g || c._getProperPrefix(h);
            if (b) {
                h = h.replace(/^[a-z]/, function(i) {
                    return i.toUpperCase()
                })
            }
            return h
        }).replace(/\-(\w)/g, function(e, f) {
            return f.toUpperCase()
        });
        return (({
            o: "O",
            moz: "Moz",
            webkit: "Webkit"
        })[b] || b) + a
    },
    _getCSSVal: function(c) {
        var b = this;
        var a = c.replace(/(^|\s)(\-(webkit|moz|o|ms)\-)?([a-z]+)/g, function(e, g, f, d, h) {
            d = d || b._getProperPrefix(h);
            return g + (d && "-" + d + "-") + h
        });
        return a
    },
    _getMatrixObj: function(j, k) {
        j = j.replace(/\b(translate(3d)?)\(\s*([^,]+)\s*,\s*([^,\)]+)/g, function(r, p, q, o, s) {
            if (/%$/.test(o)) {
                o = parseFloat(o) / 100 * k.offsetWidth + "px"
            }
            if (/%$/.test(s)) {
                s = parseFloat(s) / 100 * k.offsetHeight + "px"
            }
            return p + "(" + o + "," + s
        }).replace(/\b(translate([XY]))\(\s*([^\)]+)/g, function(o, p, q, r) {
            if (q === "X" && /%$/.test(r)) {
                r = parseFloat(r) / 100 * k.offsetWidth + "px"
            } else {
                if (q === "Y" && /%$/.test(r)) {
                    r = parseFloat(r) / 100 * k.offsetHeight + "px"
                }
            }
            return p + "(" + r
        });
        var h;
        var c = window.WebKitCSSMatrix || window.MSCSSMatrix || window.OCSSMatrix || window.MozCSSMatrix || window.CSSMatrix;
        if (c) {
            h = function(o) {
                return new c(o).toString()
            }
        } else {
            var m = "M" + Math.round(new Date().getTime() * Math.random());
            var e = jindo.$Agent().navigator();
            var a = e.firefox ? "moz" : (e.ie ? "ms" : "o");
            var d = "-" + a + "-transform";
            var l = document.createElement("style");
            l.type = "text/css";
            var n = document.getElementsByTagName("html")[0];
            n.insertBefore(l, n.firstChild);
            var g = l.sheet || l.styleSheet;
            var b = document.createElement("div");
            b.id = m;
            var i = window.getComputedStyle(b, null);
            h = function(p) {
                var o = null;
                g.insertRule("#" + m + " { " + d + ": " + p + " !important; }", 0);
                document.body.insertBefore(b, document.body.firstChild);
                o = i.getPropertyValue(d);
                document.body.removeChild(b);
                g.deleteRule(0);
                return o
            }
        }
        var f = h(j);
        if (/^([^\(]+)\(([^\)]*)\)$/.test(f)) {
            return {
                key: RegExp.$1,
                val: RegExp.$2.replace(/\s*,\s*/g, " ")
            }
        }
        return {
            key: "matrix",
            val: "1 0 0 1 0 0"
        }
    },
    _convertMatrix3d: function(b) {
        if (b.key === "matrix3d") {
            return b
        }
        var a = b.val.split(" ");
        b.key = "matrix3d";
        a.splice(2, 0, "0");
        a.splice(3, 0, "0");
        a.splice(6, 0, "0");
        a.splice(7, 0, "0");
        a.splice(8, 0, "0");
        a.splice(9, 0, "0");
        a.splice(10, 0, "1");
        a.splice(11, 0, "0");
        a.splice(14, 0, "0");
        a.splice(15, 0, "1");
        b.val = a.join(" ");
        return b
    },
    _parseTransformText: function(a) {
        a = a || "";
        var b = {};
        a.replace(/([\w\-]+)\(([^\)]*)\)/g, function(e, f, d) {
            var c = d.split(/\s*,\s*/);
            switch (f) {
                case "translate3d":
                case "scale3d":
                case "skew3d":
                    f = f.replace(/3d$/, "");
                    b[f + "Z"] = c[2];
                case "translate":
                case "scale":
                case "skew":
                    b[f + "X"] = c[0];
                    if (typeof c[1] === "undefined") {
                        if (f === "scale") {
                            b[f + "Y"] = c[0]
                        }
                    } else {
                        b[f + "Y"] = c[1]
                    }
                    break;
                default:
                    b[f] = c.join(",");
                    break
            }
        });
        return b
    },
    _getTransformFunction: function(a, c, g, f) {
        var i;
        var d, e;
        if (/matrix/.test(a + c)) {
            d = this._getMatrixObj(a, f);
            e = this._getMatrixObj(c, f);
            if (d.key !== e.key) {
                d = this._convertMatrix3d(d);
                e = this._convertMatrix3d(e)
            }
            g = g(d.val, e.val);
            return function(j) {
                return j === 1 ? c : d.key + "(" + g(j).replace(/ /g, ",") + ")"
            }
        }
        d = this._parseTransformText(a);
        e = this._parseTransformText(c);
        var h = {};
        for (i in d) {
            if (d.hasOwnProperty(i)) {
                h[i] = g(d[i], e[i] || (/^scale/.test(i) ? 1 : 0))
            }
        }
        for (i in e) {
            if (e.hasOwnProperty(i) && !(i in d)) {
                h[i] = g(d[i] || (/^scale/.test(i) ? 1 : 0), e[i])
            }
        }
        var b = function(j) {
            var k = [];
            for (var l in h) {
                if (h.hasOwnProperty(l)) {
                    k.push(l + "(" + h[l](j) + ")")
                }
            }
            return k.join(" ")
        };
        return b
    }
}).extend(jindo.m.Component);
jindo.m.Animation = jindo.$Class({
    $init: function(a) {
        this.option({
            bUseH: true,
            bHasOffsetBug: false,
            fEffect: jindo.m.Effect.cubicEaseOut,
            bUseCss3d: jindo.m.useCss3d(),
            bUseTimingFunction: jindo.m.useTimingFunction()
        });
        this.option(a || {});
        this._initVar()
    },
    _initVar: function(a) {
        this.sCssPrefix = jindo.m.getCssPrefix();
        this._htTans = this.option("bUseCss3d") ? {
            open: "3d(",
            end: ",0)"
        } : {
            open: "(",
            end: ")"
        };
        this._oMorph = new jindo.m.Morph({
            fEffect: this.option("fEffect"),
            bUseTransition: this.option("bUseTimingFunction")
        }).attach({
            end: jindo.$Fn(function(b) {
                this._oMorph.clear();
                this.fireEvent("end", b)
            }, this).bind()
        });
        this._welTarget = null
    },
    setStyle: function() {},
    move: function(d, b, c, a) {},
    getTarget: function(a) {
        if (a) {
            return this._welTarget
        } else {
            return this._welTarget.$value()
        }
    },
    p: function(a) {
        return jindo.m._toPrefixStr(a)
    },
    getTranslate: function(b, a) {
        return "translate" + this._htTans.open + b + "," + a + this._htTans.end
    },
    toCss: function(b) {
        var e, d, c, a = {};
        for (e in b) {
            d = e;
            if (/^@/.test(e)) {
                e.match(/^(@\w)/);
                c = RegExp.$1;
                if (/transition|transform/.test(d)) {
                    if (this.sCssPrefix == "") {
                        d = e.replace(c, c.toLowerCase())
                    } else {
                        d = e.replace(c, c.toUpperCase())
                    }
                    d = d.replace("@", this.sCssPrefix)
                } else {
                    d = d.replace("@", "")
                }
            }
            a[d] = b[e]
        }
        return a
    },
    isPlaying: function() {
        return this._oMorph.isPlaying()
    },
    stop: function(a) {
        if (typeof a === "undefined") {
            a = 0
        }
        this._oMorph.pause(a).clear()
    },
    destroy: function() {
        this._oMorph.detachAll("end")
    }
}).extend(jindo.m.UIComponent);
jindo.m.CheckRadioCore = jindo.$Class({
    $init: function(a, b) {},
    _initVar: function(c, b) {
        this._sFormType = c;
        this._sFormFixClass = b;
        this._sUnitClass = this.option("sClassPrefix") + b + "-unit";
        this._sOnClass = this.option("sClassPrefix") + b + "-on";
        this._sFormClass = this.option("sClassPrefix") + b;
        this._sDisableClass = this.option("sClassPrefix") + b + "-disable";
        var a = jindo.m.getDeviceInfo();
        this._bMobile = (a.iphone || a.ipad || a.android);
        this._sClickEvent = (this._bMobile) ? "touchend" : "click";
        this._bMove = false
    },
    _setWrapperElement: function(c, a) {
        this._htWElement = {};
        this._aWElUnitList = [];
        this._aWElFormList = [];
        c = (typeof c == "string" ? jindo.$(c) : c);
        this._htWElement.base = jindo.$Element(c);
        this._htWElement.container = jindo.$Element(jindo.$$.getSingle("." + a + this._sFormFixClass + "-cont", c));
        var d = this._htWElement.container.queryAll("." + this._sUnitClass);
        var e = this._htWElement.container.queryAll("." + this._sFormClass);
        for (var b = 0; b < d.length; b++) {
            this._aWElUnitList[b] = jindo.$Element(d[b]);
            this._aWElFormList[b] = jindo.$Element(e[b])
        }
    },
    _onActivate: function() {
        this._attachEvent()
    },
    _onDeactivate: function() {
        this._detachEvent()
    },
    _attachEvent: function() {
        this._htEvent = {};
        this._htEvent.form_touchmove = {
            el: this._htWElement.container.$value(),
            ref: jindo.$Fn(this._onTouchMove, this).attach(this._htWElement.container.$value(), "touchmove")
        };
        this._htEvent["form_" + this._sClickEvent] = {
            el: this._htWElement.container.$value(),
            ref: jindo.$Fn(this._onCheck, this).attach(this._htWElement.container.$value(), this._sClickEvent)
        };
        if (this._bMobile) {
            for (var a = 0; a < this._aWElFormList.length; a++) {
                this._htEvent["form" + a + "_click"] = {
                    el: this._aWElFormList[a].$value(),
                    ref: jindo.$Fn(this._onFormClick, this).attach(this._aWElFormList[a].$value(), "click")
                }
            }
        }
    },
    _detachEvent: function() {
        for (var b in this._htEvent) {
            var a = this._htEvent[b];
            a.ref.detach(a.el, b.substring(b.lastIndexOf("_") + 1))
        }
        this._htEvent = null
    },
    _onTouchMove: function(a) {
        this._bMove = true
    },
    _onFormClick: function(c) {
        var a = this._sUnitClass;
        var f = jindo.$Element(c.element);
        f = f.parent(function(g) {
            return g.hasClass(a)
        })[0];
        var d = c.element.checked;
        var b = f.attr("data-cb-checked");
        var e = (b && b == "on") ? true : false;
        if (d != e) {
            c.element.checked = e
        }
    },
    _onCheck: function(d) {
        d.stopDefault();
        if (d.element && !this._bMove) {
            var b = jindo.m.getNodeElement(d.element);
            var g = jindo.$Element(b);
            var a = this._sUnitClass;
            var c = b.tagName.toLowerCase();
            var f = b.getAttribute("type");
            f = (f) ? f : "";
            if (this._htWElement.container.isParentOf(g) && !g.hasClass(a)) {
                g = g.parent(function(h) {
                    return h.hasClass(a)
                })[0]
            } else {
                if ((g.$value() === this._htWElement.container.$value())) {
                    return false
                }
            }
            if ((g.hasClass(this._sDisableClass))) {
                return false
            }
            var e = false;
            if (c == "input" && f.toLowerCase() == this._sFormType) {
                e = true
            }
            this._afterCheck(g, e)
        }
        this._bMove = false
    },
    _afterCheck: function(b, a) {},
    _getFormIdx: function(j) {
        var f = [];
        var g = [];
        var b = this._sUnitClass;
        var a = this._sFormClass;
        var h = jindo.$A(this._aWElUnitList);
        var d = jindo.$A(this._aWElFormList);
        if (j instanceof Array) {
            g = j
        } else {
            if (typeof j == "object") {
                g.push(j)
            } else {
                if (!j || j === null) {
                    var k = this._aWElUnitList.length;
                    for (var e = 0; e < k; e++) {
                        f.push(e)
                    }
                }
            }
        }
        var c = -1;
        if (g.length > 0) {
            h.forEach(function(n, l) {
                for (var m = 0; m < g.length; m++) {
                    if (g[m] === n.$value()) {
                        f.push(l)
                    }
                }
            });
            if (g.length > f.length) {
                d.forEach(function(n, l) {
                    for (var m = 0; m < g.length; m++) {
                        if (g[m] === n.$value()) {
                            f.push(l)
                        }
                    }
                })
            }
        }
        return f
    },
    _useSettingForm: function(b, a) {
        var c = this._getFormIdx(b);
        var f = [];
        var e = [];
        var g = (a) ? "enable" : "disable";
        for (var d = 0; d < c.length; d++) {
            this._setUsedForm(a, this._aWElFormList[c[d]].$value(), this._aWElUnitList[c[d]]);
            f[d] = this._aWElFormList[c[d]].$value();
            e[d] = this._aWElUnitList[c[d]].$value()
        }
        return {
            aFormList: f,
            aUnitList: e
        }
    },
    _setUsedForm: function(b, a, c) {
        if (!b) {
            c.addClass(this._sDisableClass);
            a.disabled = true
        } else {
            c.removeClass(this._sDisableClass);
            a.disabled = false
        }
    },
    destroy: function() {
        this.deactivate();
        for (var a in this._htWElement) {
            this._htWElement[a] = null
        }
        this._htWElement = null;
        this._sUnitClass = null;
        this._sOnClass = null;
        this._sFormClass = null;
        this._sDisableClass = null;
        this._aWElUnitList = null;
        this._aWElFormList = null
    }
}).extend(jindo.m.UIComponent);
jindo.m.CorePagination = jindo.$Class({
    _nCurrentPage: 1,
    $init: function(a) {
        this.option({
            nItem: 10,
            nItemPerPage: 10,
            nPage: 1,
            bActivateOnload: true
        });
        this.option(a || {});
        this._nCurrentPage = this.option("nPage")
    },
    getItemCount: function() {
        return this.option("nItem")
    },
    getItemPerPage: function() {
        return this.option("nItemPerPage")
    },
    getCurrentPage: function() {
        return this._nCurrentPage
    },
    setItemCount: function(a) {
        this.option("nItem", a)
    },
    setItemPerPage: function(a) {
        this.option("nItemPerPage", a)
    },
    movePageTo: function(c) {
        var b = this._nCurrentPage;
        var a = this._convertToAvailPage(c);
        if (a != this._nCurrentPage) {
            this._nCurrentPage = a
        }
    },
    nextPageTo: function() {
        var a = this._nCurrentPage + 1;
        this.movePageTo(a)
    },
    previousPageTo: function() {
        var a = this._nCurrentPage - 1;
        this.movePageTo(a)
    },
    hasNextPage: function() {
        var b = this.getCurrentPage(),
            a = this.getTotalPages();
        return b && (b < a)
    },
    hasPreviousPage: function() {
        return (this.getCurrentPage() > 1)
    },
    getTotalPages: function() {
        var b = this.option("nItem"),
            a = this.option("nItemPerPage");
        if (!a) {
            return null
        }
        return Math.ceil(b / a)
    },
    getPageItemIndex: function(d) {
        d = this._convertToAvailPage(d);
        var c = this.option("nItem"),
            b = this.option("nItemPerPage"),
            e, a;
        if (!d || !b) {
            return null
        }
        e = (d - 1) * b;
        a = Math.min(e + b, c) - 1;
        return {
            nStart: e,
            nEnd: a
        }
    },
    getPageOfItem: function(a) {
        return Math.ceil(a / this.getItemPerPage())
    },
    _convertToAvailPage: function(a) {
        var b = this.getTotalPages();
        a = Math.max(a, 1);
        a = Math.min(a, b);
        return a
    }
}).extend(jindo.m.UIComponent);
jindo.m.LayerEffect = jindo.$Class({
    $init: function(b, a) {
        this.option({
            nDuration: 250,
            fEffect: jindo.m.Effect.linear,
            bActivateOnload: true
        });
        this._initVar();
        if (arguments[0] && (typeof arguments[0] == "string" || arguments[0].nodeType == 1)) {
            this.setLayer(b);
            this.option(a || {})
        } else {
            this.option(arguments[0] || {})
        }
        this._initTransition();
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    _htEffect: {
        expand: "jindo.m.ExpandEffect",
        contract: "jindo.m.ContractEffect",
        fade: "jindo.m.FadeEffect",
        pop: "jindo.m.PopEffect",
        slide: "jindo.m.SlideEffect",
        flip: "jindo.m.FlipEffect"
    },
    _initVar: function() {
        this._htEffectInstance = {};
        this._htLayerInfo = {};
        this._htWElement = {};
        this._htCurrentTask = {};
        this.bAndroid = jindo.m.getDeviceInfo().android;
        this.sClassHighligting = "_effct_hide_highlighting_tmp"
    },
    _initTransition: function() {
        this._oMorph = new jindo.m.Morph({
            fEffect: this.option("fEffect") || (this.option("sEffect") ? this._getEffect(this.option("sEffect")) : null),
            bUseTransition: jindo.m.useTimingFunction()
        })
    },
    _getEffect: function(b) {
        var a = jindo.m.Effect.cubicEaseInOut;
        switch (b) {
            case "linear":
                a = jindo.m.Effect.linear;
                break;
            case "ease":
                a = jindo.m.Effect.cubicEase;
                break;
            case "ease-in":
                a = jindo.m.Effect.cubicEaseIn;
                break;
            case "ease-out":
                a = jindo.m.Effect.cubicEaseOut;
                break;
            case "ease-in-out":
                a = jindo.m.Effect.cubicEaseInOut;
                break
        }
        return a
    },
    _createEffect: function(sType) {
        if (this._htEffect[sType] && !this._htEffectInstance[sType]) {
            try {
                this._htEffectInstance[sType] = eval("new " + this._htEffect[sType] + "()")
            } catch (e) {}
            this._htEffectInstance[sType].setLayerInfo(this._htLayerInfo)
        }
    },
    _createFunc: function() {
        var a = ["slide", "pop", "flip", "fade", "expand", "contract"];
        for (var c = 0, b = a.length; c < b; c++) {
            this[a[c]] = (function(d) {
                return function(f) {
                    var g = d;
                    if (typeof arguments[0] == "string" || arguments[0].nodeType == 1) {
                        this.setLayer(arguments[0]);
                        var e = arguments[2] || {};
                        e.sDirection = arguments[1];
                        this._run(g, e)
                    } else {
                        this._run(g, f)
                    }
                }
            })(a[c])
        }
    },
    isPlaying: function() {
        return this._oMorph.isPlaying()
    },
    _fireCustomEvent: function(b, a) {
        return this.fireEvent(b, a)
    },
    _run: function(h, d) {
        if (!this._isAvailableEffect()) {
            return
        }
        this._createEffect(h);
        if (typeof d === "undefined") {
            d = {}
        }
        var f = this._htEffectInstance[h];
        var c = this.getLayer();
        var g = (typeof d.nDuration === "undefined") ? this.option("nDuration") : parseInt(d.nDuration, 10);
        var e = f.getBeforeCommand(c, d);
        var a = f.getCommand(c, d);
        this._htCurrentTask = d;
        this._htCurrentTask.elLayer = c;
        this._htCurrentTask.sTaskName = a.sTaskName;
        this._htCurrentTask.nDuration = g;
        if (!this._fireCustomEvent("beforeEffect", {
                elLayer: c,
                sEffect: a.sTaskName,
                nDuration: g
            })) {
            return
        }
        if (e) {
            this._oMorph.pushAnimate(-1, [this.getLayer(), e.htStyle])
        }
        var b = this;
        if (d.sEffect) {
            this._oMorph.pushCall(function() {
                this.option({
                    fEffect: b._getEffect(d.sEffect)
                })
            })
        }
        g = g == 0 ? -1 : g;
        this._oMorph.pushAnimate(g, [this.getLayer(), a.htStyle]);
        if (a.fCallback) {
            if (typeof a.fCallback == "function") {
                this._oMorph.pushCall(function() {
                    a.fCallback()
                })
            } else {
                if (typeof a.fCallback == "object") {
                    this._oMorph.pushAnimate(-1, [this.getLayer(), a.fCallback.htStyle || {}])
                }
            }
        }
        this._oMorph.play()
    },
    setLayer: function(b) {
        this._htWElement.el = jindo.$(b);
        this._htWElement.wel = jindo.$Element(this._htWElement.el);
        var a;
        if (!!this.bAndroid) {
            a = jindo.$$.getSingle("." + this.sClassHighligting, this._htWElement.el);
            if (!a) {
                var c = '<a href="javascript:void(0)" style="position:absolute" class="' + this.sClassHighligting + '"></a>';
                a = jindo.$(c);
                this._htWElement.wel.append(a);
                a.style.opacity = "0";
                a.style.width = 0;
                a.style.height = 0;
                a.style.left = "-1000px";
                a.style.top = "-1000px"
            }
        }
        this.setSize()
    },
    stop: function(a) {
        if (typeof a === "undefined") {
            a = true
        }
        if (this._oMorph) {
            this._oMorph.pause(a)
        }
    },
    clearEffect: function(a) {
        if (this._oMorph) {
            this.stop(a);
            this._oMorph.clear()
        }
    },
    getLayer: function() {
        return this._htWElement.el
    },
    setSize: function() {
        var c = this._htWElement.el.cloneNode(true);
        var a = jindo.$Element(c);
        a.opacity(0);
        this._htWElement.wel.after(a);
        a.show();
        this._htLayerInfo.nWidth = this._htWElement.wel.width();
        this._htLayerInfo.nHeight = this._htWElement.wel.height();
        a.css({
            position: "absolute",
            top: "0px",
            left: "0px"
        });
        this._htLayerInfo.nMarginLeft = parseInt(a.css("marginLeft"), 10);
        this._htLayerInfo.nMarginTop = parseInt(a.css("marginTop"), 10);
        this._htLayerInfo.nMarginLeft = isNaN(this._htLayerInfo.nMarginLeft) ? 0 : this._htLayerInfo.nMarginLeft;
        this._htLayerInfo.nMarginTop = isNaN(this._htLayerInfo.nMarginTop) ? 0 : this._htLayerInfo.nMarginTop;
        this._htLayerInfo.nOpacity = this._htWElement.wel.opacity();
        this._htLayerInfo.sPosition = this._htWElement.wel.css("position");
        var b = this._htWElement.wel.css("display");
        b = ((b === "none") || (b.length === 0)) ? "block" : b;
        this._htLayerInfo.sDisplay = b;
        this._htLayerInfo.sClassHighligting = this.sClassHighligting;
        a.leave();
        this._setEffectLayerInfo()
    },
    _setEffectLayerInfo: function() {
        for (var a in this._htEffectInstance) {
            this._htEffectInstance[a].setLayerInfo(this._htLayerInfo)
        }
    },
    _onTransitionEnd: function(a) {
        if (this._htCurrentTask) {
            this._fireCustomEvent("afterEffect", {
                elLayer: this._htCurrentTask.elLayer,
                sEffect: this._htCurrentTask.sTaskName,
                nDuration: this._htCurrentTask.nDuration
            })
        }
    },
    _onTransitionStop: function(a) {
        if (a.sTaskName) {
            this._fireCustomEvent("stop", {
                elLayer: this._htCurrentTask.elLayer,
                sEffect: this._htCurrentTask.sTaskName,
                nDuration: this._htCurrentTask.nDuration
            })
        }
    },
    _isAvailableEffect: function() {
        return this.isActivating()
    },
    _onActivate: function() {
        this._attachEvent();
        this._createFunc()
    },
    _onDeactivate: function() {
        this._detachEvent()
    },
    _attachEvent: function() {
        this._htEvent = {};
        this._htEvent.end = jindo.$Fn(this._onTransitionEnd, this).bind();
        this._htEvent.stop = jindo.$Fn(this._onTransitionStop, this).bind();
        if (this._oMorph) {
            this._oMorph.attach({
                end: this._htEvent.end,
                stop: this._htEvent.stop
            })
        }
    },
    _detachEvent: function() {
        this._htEvent = null
    },
    destroy: function() {
        this.deactivate();
        for (var a in this._htWElement) {
            this._htWElement[a] = null
        }
        this._htWElement = null
    }
}).extend(jindo.m.UIComponent);
jindo.m._Effect_ = jindo.$Class({
    $init: function() {
        this._sCssPrefix = jindo.m.getCssPrefix();
        var a = jindo.m.getDeviceInfo();
        this.bIos = (a.iphone || a.ipad);
        this.bIos3 = a.iphone && (a.version.length > 0) && (a.version.substring(0, 1) == "3");
        this.bAndroid = a.android;
        this.bAndroid3Up = a.android && (a.version.length > 0) && (a.version.substring(0, 1) >= "3");
        this.bAndroid2_1 = a.android && (a.version.length > 0) && (a.version === "2.1");
        this.sTranOpen = (this.bIos) ? "translate3d(" : "translate(";
        this.sTranEnd = (this.bIos) ? ",0px)" : ")";
        this._initVar()
    },
    _initVar: function() {
        this._htLayerInfo = {}
    },
    setLayerInfo: function(a) {
        this._htLayerInfo = {};
        for (var b in a) {
            this._htLayerInfo[b] = a[b]
        }
    },
    getTranslateStyle: function(c, d) {
        var b = d || {};
        for (var a in c) {
            b["@" + a] = c[a]
        }
        return b
    },
    getTransitionTask: function() {
        return null
    },
    getBeforeCommand: function() {
        return null
    },
    getCommand: function() {
        return null
    }
});
jindo.m.SlideEffect = jindo.$Class({
    sEffectName: "slide",
    getCommand: function(f, o) {
        if (o.nDistance) {
            o.nSize = o.nDistance
        }
        var c = o.sDirection ? o.sDirection : "left";
        var n = jindo.m.getCssOffset(f);
        var k = n.left;
        var j = n.top;
        var p, i, a;
        p = (typeof o.nSize != "undefined") ? o.nSize : this._htLayerInfo.nWidth;
        i = (typeof o.nSize != "undefined") ? o.nSize : this._htLayerInfo.nHeight;
        if (c == "up" || c == "down") {
            j += ((c == "up") ? i * -1 : i)
        }
        if (c == "left" || c == "right") {
            k += ((c == "left") ? p * -1 : p)
        }
        if (typeof o.elBaseLayer != "undefined") {
            k = 0;
            j = 0;
            var q = jindo.$Element(o.elBaseLayer);
            a = jindo.$Element(f);
            i = (typeof o.nSize != "undefined") ? o.nSize : q.height();
            p = (typeof o.nSize != "undefined") ? o.nSize : q.width();
            if (c == "up" || c == "down") {
                j = (c == "down") ? i * -1 : i
            }
            if (c == "left" || c == "right") {
                k = (c == "left") ? p : p * -1
            }
            k = k * -1;
            j = j * -1
        }
        var m = this._htLayerInfo.sPosition;
        var e = this.bAndroid;
        var b = this.bAndroid3Up;
        var h = this._htLayerInfo.sClassHighligting;
        var d = this.bAndroid2_1;
        a = jindo.$Element(f);
        var l = o.htTo || {};
        l.transform = this.sTranOpen + k + "px, " + j + "px" + this.sTranEnd;
        var g = {};
        this.getTranslateStyle(l, g);
        return {
            sTaskName: this.sEffectName + "-" + c,
            htStyle: g,
            fCallback: function() {
                var v = jindo.m.getCssOffset(f);
                var u = a.css("top").replace("px", "") * 1;
                var t = a.css("left").replace("px", "") * 1;
                u = isNaN(u) ? 0 : u;
                t = isNaN(t) ? 0 : t;
                if (m == "relative") {
                    a.css("position", "relative")
                } else {
                    a.css("position", "absolute")
                }
                var s = jindo.m.getCssPrefix();
                a.css(s + "Transform", "");
                if (b) {
                    a.offset()
                }
                a.$value().style.top = parseInt((u + v.top), 10) + "px";
                a.$value().style.left = parseInt((v.left + t), 10) + "px";
                if (e && !b) {
                    var r = jindo.$$.getSingle("." + h, a.$value());
                    if (r) {
                        if (d) {
                            setTimeout(function() {
                                r.focus()
                            }, 5)
                        } else {
                            r.focus()
                        }
                    }
                }
            }
        }
    },
    getBeforeCommand: function(c, i) {
        var b = i.sDirection ? i.sDirection : "left";
        var k = i.htFrom || {};
        var a = jindo.$Element(c);
        if (typeof i.elBaseLayer != "undefined") {
            var l = jindo.$Element(i.elBaseLayer);
            if (!l.isParentOf(a)) {
                l.append(a);
                var h = a.css("position");
                if (!(h == "relative" || h == "absolute")) {
                    a.css("position", "absolute")
                }
                a.css("opacity", 0)
            }
            var g = 0,
                f = 0;
            var e = l.height();
            var j = l.width();
            if (b == "up" || b == "down") {
                f = (b == "down") ? e * -1 : e
            }
            if (b == "left" || b == "right") {
                g = (b == "left") ? j : j * -1
            }
            l.css("overflow", "hidden");
            k.left = g + "px";
            k.top = f + "px";
            k.opacity = this._htLayerInfo.nOpacity
        }
        var d = {};
        this.getTranslateStyle(k, d);
        return {
            htStyle: d
        }
    }
}).extend(jindo.m._Effect_);
jindo.m.PopEffect = jindo.$Class({
    sEffectName: "pop",
    getCommand: function(c, g) {
        var a = g.sDirection ? g.sDirection : "in";
        var b = g.htTo || {};
        if (typeof b.opacity === "undefined") {
            b.opacity = (a == "in") ? 1 : 0.1
        }
        var f = (a == "in") ? 1 : ((this.bIos3 || this.bAndroid3Up) ? 0.1 : 0);
        var e = {};
        if (a == "out") {
            e.htStyle = {};
            e.htStyle["@display"] = "none";
            e.htStyle["@opacity"] = this._htLayerInfo.nOpacity;
            e.htStyle["@transform"] = "scale(1)"
        }
        var h = "scale(" + f + ")";
        if (this.bAndroid3Up) {}
        b.transformOrigin = "50% 50%";
        b.transform = h;
        var d = {};
        this.getTranslateStyle(b, d);
        return {
            sTaskName: this.sEffectName + "-" + a,
            htStyle: d,
            fCallback: e
        }
    },
    getBeforeCommand: function(c, e) {
        var a = e.sDirection ? e.sDirection : "in";
        var g = e.htFrom || {};
        if (typeof g.opacity === "undefined") {
            g.opacity = (a == "in") ? 0.1 : 1
        }
        g.display = this._htLayerInfo.sDisplay;
        var d = (a == "in") ? ((this.bIos3 || this.bAndroid3Up) ? 0.1 : 0) : 1;
        var f = "scale(" + d + ")";
        if (this.bAndroid3Up) {}
        g.transformOrigin = "50% 50%";
        g.transform = f;
        var b = {};
        this.getTranslateStyle(g, b);
        return {
            htStyle: b
        }
    }
}).extend(jindo.m._Effect_);
jindo.m.FlipEffect = jindo.$Class({
    sEffectName: "flip",
    getCommand: function(c, j) {
        var b = j.sDirection ? j.sDirection : "left";
        var g = "Y";
        if (b == "up" || b == "down") {
            g = "X"
        }
        var i = j.htTo || {};
        var e = j.elFlipFrom ? jindo.$Element(j.elFlipFrom) : jindo.$Element(c);
        var h = j.elFlipTo ? jindo.$Element(j.elFlipTo) : null;
        var a = this._getCssRotate(this._getCssTransform(e));
        a[g] = a[g] + ((b == "left" || b == "down") ? 180 * -1 : 180);
        var f = "rotateX(" + a.X + "deg) rotateY(" + a.Y + "deg)";
        if (h) {
            h.$value().style[this._sCssPrefix + "Transform"] = "rotate" + g + "(0deg)";
            f = "rotate" + g + "(0deg)"
        }
        i.transformStyle = "preserve-3d";
        i.transform = f;
        var d = {};
        this.getTranslateStyle(i, d);
        if (j && j.elBack) {
            j.elBack.style[this._sCssPrefix + "BackfaceVisibility"] = "hidden";
            j.elBack.style[this._sCssPrefix + "Transform"] = "rotate" + g + "( 180deg )";
            e.$value().style[this._sCssPrefix + "BackfaceVisibility"] = "hidden"
        }
        return {
            sTaskName: this.sEffectName + "-" + b,
            htStyle: d
        }
    },
    getBeforeCommand: function(b, j) {
        var a = j.sDirection ? j.sDirection : "left";
        var k = j.htFrom || {};
        var h = "Y",
            g = 0;
        if (a == "up" || a == "down") {
            h = "X"
        }
        var c = j.elFlipFrom ? jindo.$Element(j.elFlipFrom) : jindo.$Element(b);
        var i = j.elFlipTo ? jindo.$Element(j.elFlipTo) : null;
        var d = c.$value().parentNode;
        d.style.webkitPerspective = "1200";
        var l = this._getCssRotate(this._getCssTransform(c));
        var e = "rotateX(" + l.X + "deg) rotateY(" + l.Y + "deg)";
        if (i) {
            i.$value().style[this._sCssPrefix + "Transform"] = "rotate" + h + "(-180deg)";
            e = "rotate" + h + "(-180deg)"
        }
        k.perspective = "1200";
        k.transformStyle = "preserve-3d";
        k.transform = e;
        var f = {};
        this.getTranslateStyle(k, f);
        return {
            htStyle: f
        }
    },
    _getCssRotate: function(d) {
        var b = d;
        var a = {
            X: 0,
            Y: 0
        };
        if (!b) {
            return a
        }
        var c = b.match(/rotateX\((\-?\d*)deg/);
        if (c && c.length > 1) {
            a.X = c[1] * 1;
            if (a.X % 360 == 0) {
                a.X = 0
            }
        }
        c = b.match(/rotateY\((\-?\d*)deg/);
        if (c && c.length > 1) {
            a.Y = c[1] * 1;
            if (a.Y % 360 == 0) {
                a.Y = 0
            }
        }
        return a
    },
    _getCssTransform: function(a) {
        return a.css(this._sCssPrefix + "Transform") || ""
    }
}).extend(jindo.m._Effect_);
jindo.m.Dialog = jindo.$Class({
    $init: function(a) {
        var b = {
            bActivateOnload: true,
            sClassPrefix: "dialog-",
            sPosition: "center",
            bUseEffect: true,
            bAutoClose: false,
            bAutoReposition: true,
            sFoggyColor: "gray",
            nFoggyOpacity: 0.5,
            sEffectType: "pop",
            nEffectDuration: 500,
            sDialogColor: "white"
        };
        this.option(b);
        this.option(a || {});
        this._setWrapperElement();
        this._initVar();
        this._setDeviceSize();
        this._initElement();
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    _setWrapperElement: function() {
        this._htWElement = {};
        this._htWElement.dialog_container = jindo.$Element('<div class="' + this.option("sClassPrefix") + 'container"></div>');
        this._htWElement.dialog_foggy = jindo.$Element('<div class="' + this.option("sClassPrefix") + 'fog"></div>');
        this._htWElement.dialog_layer = jindo.$Element('<div class="' + this.option("sClassPrefix") + 'layer"></div>');
        this._htWElement.dialog_clone = jindo.$Element('<div class="' + this.option("sClassPrefix") + 'clone"></div>')
    },
    _initVar: function() {
        this._htDialogSize = {
            width: 0,
            height: 0
        };
        this._sTemplate = null;
        this._bIsShown = false;
        this._bProcessingShow = false;
        this._bProcessingHide = false;
        this._htDeviceInfo = jindo.m.getDeviceInfo();
        this._bIOS = (this._htDeviceInfo.iphone || this._htDeviceInfo.ipad) ? true : false;
        this._bIsRenderBug = true;
        this._bAndroid = this._htDeviceInfo.android ? true : false
    },
    _setDeviceSize: function() {
        if (this._bIOS || (this._bAndroid) || !jindo.$Agent().navigator().mobile) {
            this._htDeviceSize = jindo.$Document().clientSize()
        } else {
            this._htDeviceSize = {
                width: window.screen.width,
                height: window.screen.height
            }
        }
    },
    _initContainerTop: function() {
        var b = 0;
        var a = this.option("bUseEffect");
        var c = this.option("sEffectType");
        if (a && (c == "slide-up" || c == "slide-down")) {
            b = this._htDeviceSize.height * ((c == "slide-up") ? 1 : -1)
        }
        b += window.pageYOffset;
        this._htWElement.dialog_container.css("top", b + "px")
    },
    _initElement: function() {
        this._htWElement.dialog_foggy.css({
            position: "absolute",
            padding: "0px",
            margin: "0px",
            border: "0px",
            backgroundColor: this.option("sFoggyColor"),
            opacity: this.option("nFoggyOpacity"),
            width: this._htDeviceSize.width + "px",
            height: this._htDeviceSize.height + "px",
            left: "0px",
            top: "0px"
        });
        this._htWElement.dialog_foggy.appendTo(this._getContainer());
        this._htWElement.dialog_layer.css({
            position: "relative",
            backgroundColor: this.option("sDialogColor")
        });
        this._htWElement.dialog_layer.appendTo(this._getContainer());
        this._htWElement.dialog_container.css({
            position: "absolute",
            overflow: "hidden",
            width: this._htDeviceSize.width + "px",
            height: this._htDeviceSize.height + "px",
            left: "0px",
            zIndex: 2050
        });
        this._initContainerTop();
        this._htWElement.dialog_container.hide();
        this._htWElement.dialog_container.appendTo(document.body);
        if (this.option("bUseEffect")) {
            this._oLayerEffect = new jindo.m.LayerEffect(this._getContainer())
        }
        this._htWElement.dialog_clone.css({
            position: "absolute",
            left: "-1000px",
            top: "-1000px"
        });
        this._htWElement.dialog_clone.appendTo(document.body);
        this._htWElement.dialog_clone.hide()
    },
    _onActivate: function() {
        this._attachEvent()
    },
    _onDeactivate: function() {
        this._detachEventAll()
    },
    _attachEvent: function() {
        this._htEvent = {};
        this._htEvent.click = {
            ref: jindo.$Fn(this._onClick, this).attach(this.getDialog(), "click"),
            el: this.getDialog()
        };
        this._htEvent.touchend = {
            ref: jindo.$Fn(this._onClick, this).attach(this._getFoggy(), "touchend"),
            el: this._getFoggy()
        };
        this._htEvent.touchmove = {
            ref: jindo.$Fn(this._onTouchMove, this).attach(this._getContainer(), "touchmove"),
            el: this._getContainer()
        };
        if (this.option("bAutoReposition")) {
            this._htEvent.rotate = jindo.$Fn(this._onResize, this).bind();
            jindo.m.bindRotate(this._htEvent.rotate)
        }
    },
    _detachEvent: function(a) {
        if (a) {
            var b = this._htEvent[a];
            if (b.ref) {
                b.ref.detach(b.el, a)
            }
        }
    },
    _detachEventAll: function() {
        for (var a in this._htEvent) {
            this._detachEvent(a)
        }
        jindo.m.unbindRotate(this._htEvent.rotate);
        this._htEvent = null
    },
    _onClick: function(c) {
        var d = this.option("sClassPrefix");
        var f, a, g, b, e;
        if ((f = jindo.m.getClosest(("." + d + "close"), c.element))) {
            if (this.fireEvent("close", {
                    sType: "close",
                    elLayer: this.getDialog()
                })) {
                this.hide()
            }
        } else {
            if ((a = jindo.m.getClosest(("." + d + "confirm"), c.element))) {
                if (this.fireEvent("confirm", {
                        sType: "confirm",
                        elLayer: this.getDialog()
                    })) {
                    this.hide()
                }
            } else {
                if ((g = jindo.m.getClosest(("." + d + "cancel"), c.element))) {
                    if (this.fireEvent("cancel", {
                            sType: "cancel",
                            elLayer: this.getDialog()
                        })) {
                        this.hide()
                    }
                } else {
                    if ((b = jindo.m.getClosest(("." + d + "layer"), c.element))) {
                        if ((e = jindo.m.getClosest(("a"), c.element))) {
                            return false
                        }
                    } else {
                        if (this.option("bAutoClose")) {
                            this.hide()
                        }
                    }
                }
            }
        }
        c.stop();
        return false
    },
    _onTouchStart: function(b) {
        var c = this.option("sClassPrefix");
        var a;
        if (!(a = jindo.m.getClosest(("." + c + "layer"), b.element))) {
            b.stop(jindo.$Event.CANCEL_ALL);
            return false
        }
    },
    _onTouchMove: function(a) {
        a.stop(jindo.$Event.CANCEL_ALL);
        return false
    },
    _onResize: function(a) {
        if (this._bProcessingShow || this._bProcessingHide) {
            if (this.option("bUseEffect")) {
                this._getLayerEffect().stop()
            } else {
                if (this._bProcessingShow) {
                    this._endShowEffect()
                } else {
                    this._endHideEffect()
                }
            }
        }
        if (this._oTimeout) {
            clearTimeout(this._oTimeout);
            this._oTimeout = null
        }
        if (this.isShown() && this._bIsRenderBug) {
            this._htWElement.dialog_container.hide()
        }
        this._oTimeout = setTimeout(jindo.$Fn(function() {
            this._resizeDocument();
            if (this.isShown() && this._bIsRenderBug) {
                this._htWElement.dialog_container.show()
            }
            if (this.option("bUseEffect")) {
                this._getLayerEffect().setSize()
            }
        }, this).bind(), 300)
    },
    _resizeDocument: function() {
        this._setDeviceSize();
        this._htWElement.dialog_container.css({
            width: this._htDeviceSize.width + "px",
            height: this._htDeviceSize.height + "px"
        });
        this._htWElement.dialog_foggy.css({
            width: this._htDeviceSize.width + "px",
            height: this._htDeviceSize.height + "px"
        });
        this._resizeDialog(true);
        if (this.option("bUseEffect")) {
            this._getLayerEffect().setSize()
        }
    },
    _resizeDialog: function(a) {
        if (this._setDialogSize() || a) {
            this._repositionDialog()
        }
    },
    _getLayerEffect: function() {
        return this._oLayerEffect
    },
    _getContainer: function() {
        return this._htWElement.dialog_container.$value()
    },
    _getFoggy: function() {
        return this._htWElement.dialog_foggy.$value()
    },
    getDialog: function() {
        return this._htWElement.dialog_layer.$value()
    },
    setTemplate: function(a) {
        this._sTemplate = a;
        this._oTemplate = jindo.$Template(this._sTemplate);
        this._htWElement.dialog_clone.html(a);
        this._resizeDialog()
    },
    getTemplate: function() {
        return this._sTemplate
    },
    _setDialogSize: function() {
        var a;
        var b;
        if (this.option("sPosition") == "all") {
            a = this._htDeviceSize.width;
            b = this._htDeviceSize.height
        } else {
            this._htWElement.dialog_clone.show();
            a = Math.min(this._htWElement.dialog_clone.width(), this._htDeviceSize.width);
            b = Math.min(this._htWElement.dialog_clone.height(), this._htDeviceSize.height);
            this._htWElement.dialog_clone.hide()
        }
        if (this._htDialogSize.width == a && this._htDialogSize.height == b) {
            return false
        }
        this._htDialogSize = {
            width: a,
            height: b
        };
        this._htWElement.dialog_layer.css({
            width: a + "px",
            height: b + "px"
        });
        return this._htDialogSize
    },
    _getDialogSize: function() {
        return this._htDialogSize
    },
    _repositionDialog: function() {
        var a = this._getDialogPosition();
        this._htWElement.dialog_layer.css({
            top: a.top + "px",
            left: a.left + "px"
        });
        this._htWElement.dialog_container.css({
            top: window.pageYOffset + "px",
            left: window.pageXOffset + "px"
        });
        if (!this.isShown()) {
            var b = this.option("sEffectType");
            if (b == "slide-up" || b == "slide-down") {
                this._initContainerTop()
            }
        }
    },
    _getDialogPosition: function() {
        var c = this._htDeviceSize.width;
        var b = this._htDeviceSize.height;
        var d = this._getDialogSize().width;
        var e = this._getDialogSize().height;
        var a = {};
        switch (this.option("sPosition")) {
            case "top":
                a.top = 0;
                a.left = parseInt((c - d) / 2, 10);
                break;
            case "center":
                a.top = parseInt((b - e) / 2, 10);
                a.left = parseInt((c - d) / 2, 10);
                break;
            case "bottom":
                a.top = parseInt(b - e, 10);
                a.left = parseInt((c - d) / 2, 10);
                break;
            case "all":
                a.top = 0;
                a.left = 0;
                break
        }
        return a
    },
    setPosition: function(a) {
        if (a == "top" || a == "center" || a == "bottom" || a == "all") {
            this.option("sPosition", a)
        }
        this._resizeDialog()
    },
    useEffect: function() {
        if (this.option("bUseEffect")) {
            return false
        }
        this.option("bUseEffect", true);
        this._initContainerTop()
    },
    unuseEffect: function() {
        if (!this.option("bUseEffect")) {
            return false
        }
        this.option("bUseEffect", false);
        this._initContainerTop()
    },
    setEffectType: function(a) {
        this.useEffect();
        if (a == "pop" || a == "slide-up" || a == "slide-down" || a == "flip") {
            this.option("sEffectType", a);
            this._initContainerTop()
        }
    },
    setEffectDuration: function(a) {
        this.useEffect();
        if (a && a > 99) {
            this.option("nEffectDuration", a)
        }
    },
    setEffect: function(a) {
        this.useEffect();
        if (a.type) {
            this.setEffectType(a.type)
        }
        if (a.duration) {
            this.setEffectDuration(a.duration)
        }
    },
    isShown: function() {
        return this._bIsShown
    },
    show: function(a, b) {
        if (this.isShown()) {
            return false
        }
        this._bProcessingShow = true;
        this._htEvent.touchstart = {
            ref: jindo.$Fn(this._onTouchStart, this).attach(document, "touchstart"),
            el: document
        };
        if (b) {
            this._showAttachedEvent = b;
            this.attach(b)
        }
        this._resizeDocument();
        if (typeof a == "undefined") {
            a = {}
        } else {
            this._htWElement.dialog_clone.html(this._oTemplate.process(a));
            this._resizeDialog()
        }
        this._htWElement.dialog_layer.html(this._oTemplate.process(a));
        if (!this.fireEvent("beforeShow", {
                sType: "beforeShow",
                elLayer: this.getDialog()
            })) {
            return
        }
        this._showDialogLayer()
    },
    _showDialogLayer: function() {
        if (this.option("bUseEffect")) {
            this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endShowEffect, this).bind());
            this._startShowEffect()
        } else {
            this._htWElement.dialog_container.show();
            this._endShowEffect()
        }
    },
    _startShowEffect: function() {
        var b = this.option("sEffectType");
        var a = this.option("nEffectDuration");
        switch (b) {
            case "slide-up":
                this._htWElement.dialog_container.show();
                this._getLayerEffect().setSize();
                this._getLayerEffect().slide({
                    sDirection: "up",
                    nDuration: a
                });
                break;
            case "slide-down":
                this._htWElement.dialog_container.show();
                this._getLayerEffect().setSize();
                this._getLayerEffect().slide({
                    sDirection: "down",
                    nDuration: a
                });
                break;
            case "pop":
                this._getLayerEffect().pop({
                    sDirection: "in",
                    nDuration: a,
                    htFrom: {
                        opacity: 1
                    }
                });
                break;
            case "flip":
                this._htWElement.dialog_container.show();
                this._getLayerEffect().flip({
                    nDuration: a,
                    elFlipFrom: this._getContainer(),
                    elFlipTo: this._getContainer(),
                    htFrom: {
                        opacity: 0
                    },
                    htTo: {
                        opacity: 1
                    }
                });
                break
        }
    },
    _endShowEffect: function() {
        if (this.option("bUseEffect")) {
            this._getLayerEffect().detachAll("afterEffect")
        }
        this.fireEvent("show", {
            sType: "show",
            elLayer: this.getDialog()
        });
        this._bIsShown = true;
        this._bProcessingShow = false
    },
    hide: function() {
        if (!this.isShown()) {
            return false
        }
        this._bProcessingHide = true;
        if (!this.fireEvent("beforeHide", {
                sType: "beforeHide",
                elLayer: this.getDialog()
            })) {
            return
        }
        this._hideDialogLayer()
    },
    _hideDialogLayer: function() {
        if (this.option("bUseEffect")) {
            this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endHideEffect, this).bind());
            this._startHideEffect()
        } else {
            this._htWElement.dialog_container.hide();
            this._endHideEffect()
        }
    },
    _startHideEffect: function() {
        var b = this.option("sEffectType");
        var a = this.option("nEffectDuration");
        switch (b) {
            case "slide-up":
                this._getLayerEffect().slide({
                    sDirection: "down",
                    nDuration: a
                });
                break;
            case "slide-down":
                this._getLayerEffect().slide({
                    sDirection: "up",
                    nDuration: a
                });
                break;
            case "pop":
                this._getLayerEffect().pop({
                    sDirection: "out",
                    nDuration: a,
                    htTo: {
                        opacity: 0
                    }
                });
                break;
            case "flip":
                this._getLayerEffect().flip({
                    nDuration: a,
                    elFlipFrom: this._getContainer(),
                    elFlipTo: this._getContainer(),
                    htTo: {
                        opacity: 0
                    }
                });
                break
        }
    },
    _endHideEffect: function() {
        if (this.option("bUseEffect")) {
            this._getLayerEffect().detachAll("afterEffect")
        }
        this.fireEvent("hide", {
            sType: "hide",
            elLayer: this.getDialog()
        });
        if (this._showAttachedEvent) {
            for (var a in this._showAttachedEvent) {
                this.detachAll(a)
            }
            this._showAttachedEvent = null
        }
        this._detachEvent("touchstart");
        this._htWElement.dialog_container.hide();
        this._htWElement.dialog_container.css("opacity", 1);
        if (window.pageYOffset || window.pageXOffset) {
            this._htWElement.dialog_container.css({
                top: "0px",
                left: "0px"
            })
        }
        this._bIsShown = false;
        this._bProcessingHide = false
    },
    destroy: function() {
        this._detachEventAll();
        if (this.option("bUseEffect")) {
            this._getLayerEffect().destroy();
            this._oLayerEffect = null
        }
        this._htWElement.dialog_container.leave();
        this._htWElement.dialog_clone.leave();
        this._htWElement = null;
        this._htDeviceSize = null;
        this._htDialogSize = null;
        this._sTemplate = null;
        this._oTemplate = null;
        this._bIsShown = null;
        this._bProcessingShow = null;
        this._bProcessingHide = null;
        this._oTimeout = null;
        this._htDeviceInfo = null;
        this._bIOS = null;
        this._bIsRenderBug = null;
        this._bAndroid = null
    }
}).extend(jindo.m.UIComponent);
jindo.m.FadeEffect = jindo.$Class({
    sEffectName: "fade",
    getCommand: function(d, g) {
        if (!g.htTo) {
            g.htTo = {}
        }
        if (g.nDistance) {
            g.htTo.opacity = g.nDistance
        }
        var a = g.sDirection ? g.sDirection : "in";
        var c = g.htTo || {};
        var b = (a == "in") ? 1 : 0;
        c.opacity = (typeof c.opacity !== "undefined") ? c.opacity : b;
        var f = {};
        if (a == "out") {
            f.htStyle = {};
            f.htStyle["@display"] = "none";
            f.htStyle["@opacity"] = this._htLayerInfo.nOpacity
        }
        var e = {};
        this.getTranslateStyle(c, e);
        return {
            sTaskName: this.sEffectName + "-" + a,
            htStyle: e,
            fCallback: f
        }
    },
    getBeforeCommand: function(d, e) {
        var a = e.sDirection ? e.sDirection : "in";
        var f = e.htFrom || {};
        var c = (a == "in") ? 0 : 1;
        f.display = this._htLayerInfo.sDisplay;
        f.opacity = (typeof f.opacity == "undefined") ? c : f.opacity;
        var b = {};
        this.getTranslateStyle(f, b);
        return {
            htStyle: b,
            htTransform: {}
        }
    }
}).extend(jindo.m._Effect_);
jindo.m.Touch = jindo.$Class({
    $init: function(b, a) {
        this._el = jindo.$Element(b).$value();
        var c = {
            nMomentumDuration: 350,
            nMoveThreshold: 7,
            nSlopeThreshold: 25,
            nLongTapDuration: 1000,
            nDoubleTapDuration: 400,
            nTapThreshold: 6,
            nPinchThreshold: 0.1,
            nRotateThreshold: 5,
            bActivateOnload: true,
            bUseAutoDirection: false,
            nUseDiagonal: 0,
            bVertical: true,
            bHorizental: false
        };
        this.option(c);
        this.option(a || {});
        if (this.option("nUseDiagonal") > 0) {
            this.option({
                bVertical: true,
                bHorizental: true
            })
        }
        this._initVariable();
        this._initTouchEventName();
        this._initPreventSystemEvent();
        this._setSlope();
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    $static: {
        MOVETYPE: {
            0: "hScroll",
            1: "vScroll",
            2: "dScroll",
            3: "tap",
            4: "longTap",
            5: "doubleTap",
            6: "pinch",
            7: "rotate",
            8: "pinch-rotate"
        }
    },
    _initTouchEventName: function() {
        if ("ontouchstart" in window) {
            this._htEventName.start = "touchstart";
            this._htEventName.move = "touchmove";
            this._htEventName.end = "touchend";
            this._htEventName.cancel = "touchcancel";
            this._hasTouchEvent = true
        } else {
            if (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
                this._htEventName.start = "MSPointerDown";
                this._htEventName.move = "MSPointerMove";
                this._htEventName.end = "MSPointerUp";
                this._htEventName.cancel = "MSPointerCancel";
                this._hasTouchEvent = false
            }
        }
    },
    _initPreventSystemEvent: function() {
        if (this._el.style && typeof this._el.style.msTouchAction != "undefined") {
            var a = "none";
            if (this.option("bHorizental") && !this.option("bVertical")) {
                a = "pan-x"
            }
            if (this.option("bVertical") && !this.option("bHorizental")) {
                a = "pan-y"
            }
            this._el.style.msTouchAction = a
        }
    },
    _preventSystemEvent: function(a, b) {
        var c = this.nMoveType;
        switch (c) {
            case 0:
                if (this.option("bHorizental") || this.option("bUseAutoDirection")) {}
                break;
            case 1:
                if (this.option("bVertical") || this.option("bUseAutoDirection")) {}
                break;
            case 2:
                if (this.option("bUseAutoDirection") || this.option("bVertical") || this.option("bHorizental")) {}
                break;
            default:
                break
        }
        return true
    },
    _initVariable: function() {
        this._htEventName = {
            start: "mousedown",
            move: "mousemove",
            end: "mouseup",
            cancel: null
        };
        this._hasTouchEvent = false;
        this._radianToDegree = 180 / Math.PI;
        this._htMoveInfo = {
            nStartX: 0,
            nStartY: 0,
            nBeforeX: 0,
            nBeforeY: 0,
            nStartTime: 0,
            nBeforeTime: 0,
            nStartDistance: 0,
            nBeforeDistance: 0,
            nStartAngle: 0,
            nLastAngle: 0,
            nBeforeScale: 0,
            aPos: []
        };
        this.htEndInfo = {
            nX: 0,
            nY: 0
        };
        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1;
        this._nVSlope = 0;
        this._nHSlope = 0;
        this.bSetSlope = false
    },
    _attachEvents: function() {
        this._htEvent = {};
        var b = this._hasTouchEvent;
        this._htEvent[this._htEventName.start] = {
            fn: jindo.$Fn(this._onStart, this).bind(),
            el: this._el
        };
        this._htEvent[this._htEventName.move] = {
            fn: jindo.$Fn(this._onMove, this).bind(),
            el: this._el
        };
        this._htEvent[this._htEventName.end] = {
            fn: jindo.$Fn(this._onEnd, this).bind(),
            el: this._el
        };
        this._htEvent.rotate = jindo.$Fn(this._onResize, this).bind();
        jindo.m.bindRotate(this._htEvent.rotate);
        if (this._htEventName.cancel) {
            this._htEvent[this._htEventName.cancel] = {
                fn: jindo.$Fn(this._onCancel, this).bind(),
                el: this._el
            }
        }
        for (var a in this._htEvent) {
            if (this._htEvent[a].fn) {
                this._htEvent[a].ref = this._attachFakeJindo(this._htEvent[a].el, this._htEvent[a].fn, a)
            }
        }
    },
    _attachFakeJindo: function(c, d, e) {
        var a = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
        var b = null;
        if (a < 230 && (typeof _notSupport !== "undefined")) {
            b = _notSupport.$Fn(d).attach(c, e)
        } else {
            b = jindo.$Fn(d).attach(c, e)
        }
        return b
    },
    _detachEvents: function() {
        for (var b in this._htEvent) {
            var a = this._htEvent[b];
            if (a.ref) {
                a.ref.detach(a.el, b)
            }
        }
        jindo.m.unbindRotate(this._htEvent.rotate);
        this._htEvent = null
    },
    _onCancel: function(a) {
        this._onEnd(a)
    },
    _onStart: function(a) {
        var b = this._getTouchInfo(a);
        this.nStart = b.length;
        if (b.length > 1) {
            return
        } else {
            if (this.bMove) {
                this._resetTouchInfo()
            }
        }
        var c = {
            element: b[0].el,
            nX: b[0].nX,
            nY: b[0].nY,
            oEvent: a
        };
        if (!this._fireCustomEvent("touchStart", c)) {
            return
        }
        this._updateTouchInfo(b, "start");
        this._startLongTapTimer(b, a)
    },
    _onMove: function(k) {
        if (this.nStart <= 0) {
            return
        }
        this.bMove = true;
        var c = this._getTouchInfo(k);
        if (c.length === 1) {
            if (this.nMoveType < 0 || this.nMoveType == 3 || this.nMoveType == 4) {
                var d = this._getMoveType(c);
                if (!((this.nMoveType == 4) && (d == 3))) {
                    if (this.option("nUseDiagonal") == 2 && (d == 0 || d == 1)) {
                        this._nStartMoveType = d;
                        this.nMoveType = 2
                    } else {
                        this.nMoveType = this._nStartMoveType = d
                    }
                }
            }
        } else {
            if (this.nMoveType !== 8) {
                this.nMoveType = this._nStartMoveType = this._getMoveType(c)
            }
        }
        var a = this._getCustomEventParam(c, false, k);
        (this.nMoveType != 3) && this._deleteLongTapTimer();
        var e = 0;
        if (this.nMoveType == 0) {
            e = Math.abs(a.nDistanceX)
        } else {
            if (this.nMoveType == 1) {
                e = Math.abs(a.nDistanceY)
            } else {
                e = Math.abs(Math.sqrt(Math.pow(a.nDistanceX, 2) + Math.pow(a.nDistanceY, 2)))
            }
        }
        if ((e < this.option("nMoveThreshold") || e < this.option("nSlopeThreshold")) && (this.nMoveType < 0 || this.nMoveType > 2)) {
            return
        }
        this._updateTouchInfo(c, "move");
        a.sMoveTypeAgree = false;
        var h = a.sMoveType;
        var i = Math.abs(a.nVectorX);
        var f = (this.option("bHorizental") && h == jindo.m.Touch.MOVETYPE[0]);
        var j = (this.option("bVertical") && h == jindo.m.Touch.MOVETYPE[1]);
        var g = (this.option("nUseDiagonal") == 1 && h == jindo.m.Touch.MOVETYPE[2]);
        var b = this.option("nUseDiagonal") == 2;
        if ((f || j || g) || b) {
            a.sMoveTypeAgree = true
        }
        if (!this.fireEvent("touchMove", a)) {
            this.nStart = 0;
            return
        }
    },
    _onEnd: function(b) {
        var c = this._getTouchInfo(b);
        this.nStart -= c.length;
        if (this.nStart > 0) {
            return
        }
        var a = this;
        this._deleteLongTapTimer();
        if (!this.bMove && (this.nMoveType != 4)) {
            this.nMoveType = 3
        }
        if (this._isDblTap(c[0].nX, c[0].nY, c[0].nTime)) {
            clearTimeout(this._nTapTimer);
            this._nTapTimer = -1;
            this.nMoveType = 5
        }
        this._updateTouchInfo(c, "end");
        var e = this._getCustomEventParam(c, true, b);
        var d = e.sMoveType;
        if ((typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[5]] != "undefined" && (this._htEventHandler[jindo.m.Touch.MOVETYPE[5]].length > 0)) && (this.nMoveType == 3)) {
            this._nTapTimer = setTimeout(function() {
                a._fireCustomEvent(d, e);
                a.fireEvent("touchEnd", e);
                delete a._nTapTimer
            }, this.option("nDoubleTapDuration"))
        } else {
            this.fireEvent("touchEnd", e);
            if (this.nMoveType != 4) {
                if (this.nMoveType === 8) {
                    e.sMoveType = jindo.m.Touch.MOVETYPE[6];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[6], e);
                    e.sMoveType = jindo.m.Touch.MOVETYPE[7];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[7], e)
                } else {
                    setTimeout(function() {
                        a._fireCustomEvent(d, e)
                    }, 0)
                }
            }
        }
        this._updateTouchEndInfo(c);
        this._resetTouchInfo()
    },
    _fireCustomEvent: function(b, a) {
        return this.fireEvent(b, a)
    },
    _getCustomEventParam: function(h, b, d) {
        var r = this._htMoveInfo.aPos[(this._htMoveInfo.aPos.length > 0 && !b ? this._htMoveInfo.aPos.length - 1 : 0)];
        var q = jindo.m.Touch.MOVETYPE[this.nMoveType],
            g = jindo.m.Touch.MOVETYPE[this._nStartMoveType],
            f = h[0].nTime - this._htMoveInfo.nStartTime,
            u = 0,
            s = 0,
            l = 0,
            k = 0,
            x = 0,
            w = 0,
            n = 0,
            m = 0,
            c = (this.nMoveType === 1) ? 0 : h[0].nX - this._htMoveInfo.nStartX,
            a = (this.nMoveType === 0) ? 0 : h[0].nY - this._htMoveInfo.nStartY,
            v = (this.nMoveType === 1) ? 0 : h[0].nX - r.nX,
            t = (this.nMoveType === 0) ? 0 : h[0].nY - r.nY,
            p = h[0].nTime - r.nTime,
            j = {
                element: h[0].el,
                nX: h[0].nX,
                nY: h[0].nY,
                nVectorX: h[0].nX - this._htMoveInfo.nBeforeX,
                nVectorY: h[0].nY - this._htMoveInfo.nBeforeY,
                nDistanceX: c,
                nDistanceY: a,
                sMoveType: q,
                sStartMoveType: g,
                nStartX: this._htMoveInfo.nStartX,
                nStartY: this._htMoveInfo.nStartY,
                nStartTimeStamp: this._htMoveInfo.nStartTime,
                htMomentum: {
                    nDistanceX: v,
                    nDistanceY: t,
                    nDuration: p
                },
                oEvent: d || {}
            };
        if ((h.length) > 1 || (this.nMoveType >= 6)) {
            j.nScale = this._getScale(h);
            j.nRotation = this._getRotation(h);
            (j.nScale === null) && (j.nScale = this._htMoveInfo.nBeforeScale);
            (j.nRotation === null) && (j.nRotation = this._htMoveInfo.nBeforeRotation)
        }
        if (h.length >= 1) {
            j.aX = [];
            j.aY = [];
            j.aElement = [];
            for (var o = 0, e = h.length; o < e; o++) {
                j.aX.push(h[o].nX);
                j.aY.push(h[o].nY);
                j.aElement.push(h[o].el)
            }
        }
        if (b) {
            if (this.nMoveType == 0 || this.nMoveType == 1 || this.nMoveType == 2) {
                if (f <= this.option("nMomentumDuration")) {}
                if (f <= this.option("nMomentumDuration")) {
                    l = Math.abs(c) / f;
                    u = (l * l) / 2;
                    k = Math.abs(a) / f;
                    s = (k * k) / 2
                }
                if (p <= this.option("nMomentumDuration")) {
                    n = Math.abs(v) / p;
                    x = (n * n) / 2;
                    m = Math.abs(t) / p;
                    w = (m * m) / 2
                }
            }
            j.nMomentumX = u;
            j.nMomentumY = s;
            j.nSpeedX = l;
            j.nSpeedY = k;
            j.nDuration = f;
            j.htMomentum.nMomentumX = x;
            j.htMomentum.nMomentumY = w;
            j.htMomentum.nSpeedX = n;
            j.htMomentum.nSpeedY = m
        }
        return j
    },
    _updateTouchEndInfo: function(a) {
        this.htEndInfo = {
            element: a[0].el,
            time: a[0].nTime,
            movetype: this.nMoveType,
            nX: a[0].nX,
            nY: a[0].nY
        }
    },
    _deleteLongTapTimer: function() {
        if (typeof this._nLongTapTimer != "undefined") {
            clearTimeout(this._nLongTapTimer);
            delete this._nLongTapTimer
        }
    },
    _startLongTapTimer: function(c, b) {
        var a = this;
        if ((typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[4]] != "undefined") && (this._htEventHandler[jindo.m.Touch.MOVETYPE[4]].length > 0)) {
            a._nLongTapTimer = setTimeout(function() {
                a.fireEvent("longTap", {
                    element: c[0].el,
                    oEvent: b,
                    nX: c[0].nX,
                    nY: c[0].nY
                });
                a.nMoveType = 4
            }, a.option("nLongTapDuration"))
        }
    },
    _onResize: function() {
        this._setSlope()
    },
    _isDblTap: function(d, c, a) {
        if ((typeof this._nTapTimer != "undefined") && this.nMoveType == 3) {
            var b = this.option("nTapThreshold");
            if ((Math.abs(this.htEndInfo.nX - d) <= b) && (Math.abs(this.htEndInfo.nY - c) <= b)) {
                return true
            }
        }
        return false
    },
    _setSlope: function() {
        if (!this.bSetSlope) {
            this._nHSlope = ((window.innerHeight / 2) / window.innerWidth).toFixed(2) * 1;
            this._nVSlope = (window.innerHeight / (window.innerWidth / 2)).toFixed(2) * 1
        }
    },
    setSlope: function(a, b) {
        this._nHSlope = b;
        this._nVSlope = a;
        this.bSetSlope = true
    },
    getSlope: function() {
        return {
            nVSlope: this._nVSlope,
            nHSlope: this._nHSlope
        }
    },
    _resetTouchInfo: function() {
        for (var a in this._htMoveInfo) {
            if (a != "aPos") {
                this._htMoveInfo[a] = 0
            } else {
                this._htMoveInfo.aPos.length = 0
            }
        }
        this._deleteLongTapTimer();
        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1
    },
    _updateTouchInfo: function(a, b) {
        if (b == "end") {
            this.htEndInfo = {
                nX: a[0].nX,
                nY: a[0].nY
            };
            if (this._htMoveInfo.aPos.length > 3) {
                this._htMoveInfo.aPos.pop()
            }
        } else {
            if (b == "start") {
                this._htMoveInfo.nStartX = a[0].nX;
                this._htMoveInfo.nStartY = a[0].nY;
                this._htMoveInfo.nStartTime = a[0].nTime
            } else {
                this._htMoveInfo.nBeforeTime = a[0].nTime
            }
            this._htMoveInfo.nBeforeX = a[0].nX;
            this._htMoveInfo.nBeforeY = a[0].nY;
            this._htMoveInfo.aPos.push({
                nX: a[0].nX,
                nY: a[0].nY,
                nTime: a[0].nTime
            });
            (this._htMoveInfo.aPos.length > 5) && this._htMoveInfo.aPos.shift()
        }
    },
    _getMoveTypeBySingle: function(a, h) {
        var b = this.nMoveType;
        var g = Math.abs(this._htMoveInfo.nStartX - a);
        var f = Math.abs(this._htMoveInfo.nStartY - h);
        var e = g + f;
        var c = this.option("nTapThreshold");
        if ((g <= c) && (f <= c)) {
            b = 3
        } else {
            b = -1
        }
        if (this.option("nSlopeThreshold") <= e) {
            var d = parseFloat((f / g).toFixed(2), 10);
            if ((this._nHSlope === -1) && (this._nVSlope === -1) && this.option("nUseDiagonal") > 0) {
                b = 2
            } else {
                if (d <= this._nHSlope) {
                    b = 0
                } else {
                    if (d >= this._nVSlope) {
                        b = 1
                    } else {
                        if (this.option("nUseDiagonal") > 1) {
                            b = 2
                        } else {
                            b = 2
                        }
                    }
                }
            }
        }
        return b
    },
    _getMoveTypeByMulti: function(a) {
        var b = -1;
        if ((this.nMoveType === 6) || Math.abs(1 - this._htMoveInfo.nBeforeScale) >= this.option("nPinchThreshold")) {
            b = 6
        }
        if ((this.nMoveType === 7) || Math.abs(0 - this._htMoveInfo.nBeforeRotation) >= this.option("nRotateThreshold")) {
            if (b === 6) {
                b = 8
            } else {
                b = 7
            }
        }
        if (b === -1) {
            return this.nMoveType
        }
        return b
    },
    _getScale: function(b) {
        var c = -1;
        var a = this._getDistance(b);
        if (a <= 0) {
            return null
        }
        if (this._htMoveInfo.nStartDistance === 0) {
            c = 1;
            this._htMoveInfo.nStartDistance = a
        } else {
            c = a / this._htMoveInfo.nStartDistance
        }
        this._htMoveInfo.nBeforeScale = c;
        return c
    },
    _getRotation: function(a) {
        var c = -1;
        var b = this._getAngle(a);
        if (b === null) {
            return null
        }
        if (this._htMoveInfo.nStartAngle === 0) {
            this._htMoveInfo.nStartAngle = b;
            c = 0
        } else {
            c = b - this._htMoveInfo.nStartAngle
        }
        this._htMoveInfo.nLastAngle = b;
        this._htMoveInfo.nBeforeRotation = c;
        return c
    },
    _getMoveType: function(a) {
        var b = this.nMoveType;
        if (a.length === 1) {
            b = this._getMoveTypeBySingle(a[0].nX, a[0].nY)
        } else {
            if (a.length === 2) {
                b = this._getMoveTypeByMulti(a)
            }
        }
        return b
    },
    _getDistance: function(a) {
        if (a.length === 1) {
            return -1
        }
        return Math.sqrt(Math.pow(Math.abs(a[0].nX - a[1].nX), 2) + Math.pow(Math.abs(a[0].nY - a[1].nY), 2))
    },
    _getAngle: function(c) {
        if (c.length === 1) {
            return null
        }
        var b = c[0].nX - c[1].nX,
            a = c[0].nY - c[1].nY;
        var g = Math.atan2(a, b) * this._radianToDegree;
        if (this._htMoveInfo.nLastAngle !== null) {
            var f = Math.abs(this._htMoveInfo.nLastAngle - g);
            var d = g + 360;
            var e = g - 360;
            if (Math.abs(d - this._htMoveInfo.nLastAngle) < f) {
                g = d
            } else {
                if (Math.abs(e - this._htMoveInfo.nLastAngle) < f) {
                    g = e
                }
            }
        }
        return g
    },
    _getTouchInfo: function(b) {
        var a = [];
        var d = b.$value().timeStamp;
        var e = null;
        if (this._hasTouchEvent) {
            e = b.$value().touches;
            e = e.length > 1 ? e : b.$value().changedTouches;
            for (var c = 0, f = e.length; c < f; c++) {
                a.push({
                    el: jindo.m.getNodeElement(e[c].target),
                    nX: e[c].pageX,
                    nY: e[c].pageY,
                    nTime: d
                })
            }
        } else {
            a.push({
                el: b.element,
                nX: b.pos().pageX,
                nY: b.pos().pageY,
                nTime: d
            })
        }
        return a
    },
    getBaseElement: function(a) {
        return this._el
    },
    _onDeactivate: function() {
        this._detachEvents()
    },
    _onActivate: function() {
        this._attachEvents()
    },
    destroy: function() {
        var a;
        this.deactivate();
        this._el = null;
        for (a in this._htMoveInfo) {
            this._htMoveInfo[a] = null
        }
        this._htMoveInfo = null;
        for (a in this.htEndInfo) {
            this.htEndInfo[a] = null
        }
        this.htEndInfo = null;
        this.nStart = 0;
        this.bMove = null;
        this.nMoveType = null;
        this._nStartMoveType = null;
        this._nVSlope = null;
        this._nHSlope = null;
        this.bSetSlope = null
    }
}).extend(jindo.m.UIComponent);
jindo.m.SwipeCommon = jindo.$Class({
    $init: function(b, a) {
        this.option({
            bActivateOnload: true,
            bUseHighlight: true,
            bUseDiagonalTouch: true,
            bUseMomentum: true,
            nDeceleration: 0.0006,
            bAutoResize: true,
            fEffect: jindo.m.Effect.cubicEaseOut,
            bUseCss3d: jindo.m.useCss3d(),
            bUseTimingFunction: jindo.m.useTimingFunction(),
            nZIndex: 2000
        })
    },
    _getAnimationOption: function(a) {
        return jindo.$Jindo.mixin({
            bUseH: this._bUseH,
            bHasOffsetBug: this._hasOffsetBug(),
            fEffect: this.option("fEffect"),
            bUseCss3d: this.option("bUseCss3d"),
            bUseTimingFunction: this.option("bUseTimingFunction")
        }, a || {})
    },
    _initVar: function() {
        this._htWElement = {};
        this._bUseH = false;
        this._bUseV = false;
        this._nX = 0;
        this._nY = 0;
        this._bUseDiagonalTouch = this.option("bUseDiagonalTouch");
        this._bClickBug = jindo.m.hasClickBug();
        this._htOffsetBug = {
            hasBug: jindo.m.hasOffsetBug() && this.option("bUseHighlight"),
            timer: -1,
            elDummyTag: null
        };
        this._htSize = {
            viewWidth: 0,
            viewHeight: 0,
            contWidth: 0,
            contHeight: 0,
            maxX: 0,
            maxY: 0
        };
        this._isStop = false;
        this._oTouch = null;
        this._oAnimation = null
    },
    _setWrapperElement: function(a) {
        this._htWElement.view = jindo.$Element(a);
        this._htWElement.base = jindo.$Element(this._htWElement.view.query("." + this.option("sClassPrefix") + "base"));
        if (this._htWElement.base) {
            this._htWElement.container = this._htWElement.base.query("." + this.option("sClassPrefix") + "container")
        } else {
            this._htWElement.container = this._htWElement.view.query("." + this.option("sClassPrefix") + "container") || this._htWElement.view.first()
        }
        this._htWElement.container = jindo.$Element(this._htWElement.container);
        this._htWElement.view.css({
            overflow: "hidden",
            zIndex: this.option("nZIndex")
        });
        if (this._htWElement.base) {
            this._htWElement.base.css({
                position: "relavite"
            })
        }
        this._htWElement.container.css({
            left: "0px",
            top: "0px"
        });
        this._createOffsetBugDummyTag()
    },
    _onActivate: function() {
        if (!this._oTouch) {
            this._oTouch = new jindo.m.Touch(this._htWElement.view.$value(), {
                nMoveThreshold: 0,
                nUseDiagonal: 0,
                bVertical: this.bUseH,
                bHorizental: !this.bUseH,
                nMomentumDuration: 200,
                nTapThreshold: 1,
                nSlopeThreshold: 5,
                nEndEventThreshold: (jindo.m.getDeviceInfo().win8 ? 100 : 0),
                bActivateOnload: false
            })
        }
        this._attachEvent();
        this._attachAniEvent();
        this._oTouch.activate()
    },
    _onDeactivate: function() {
        this._detachEvent();
        this._detachAniEvent();
        this._oTouch.deactivate();
        if (this._oAnimation) {
            this._oAnimation.deactivate()
        }
    },
    _attachEvent: function() {
        this._htEvent = {};
        this._htEvent.touchStart = jindo.$Fn(this._onStart, this).bind();
        this._htEvent.touchMove = jindo.$Fn(this._onMove, this).bind();
        this._htEvent.touchEnd = jindo.$Fn(this._onEnd, this).bind();
        this._oTouch.attach({
            touchStart: this._htEvent.touchStart,
            touchMove: this._htEvent.touchMove,
            touchEnd: this._htEvent.touchEnd
        });
        if (this.option("bAutoResize")) {
            this._htEvent.resize = jindo.$Fn(this._onResize, this).bind();
            jindo.m.bindRotate(this._htEvent.resize);
            jindo.m.bindPageshow(this._htEvent.resize)
        }
    },
    _detachEvent: function() {
        this._oTouch.detachAll();
        if (this.option("bAutoResize")) {
            jindo.m.unbindRotate(this._htEvent.resize);
            jindo.m.unbindPageshow(this._htEvent.resize)
        }
    },
    _getX: function(a) {
        return (a >= 0 ? 0 : (a <= this._htSize.maxX ? this._htSize.maxX : a))
    },
    _getY: function(a) {
        return (a >= 0 ? 0 : (a <= this._htSize.maxY ? this._htSize.maxY : a))
    },
    _attachAniEvent: function() {
        if (this._oAnimation) {
            this._htEvent.endAni = jindo.$Fn(this._onEndAniImpl, this).bind();
            this._oAnimation.attach({
                end: this._htEvent.endAni
            })
        }
    },
    _detachAniEvent: function() {
        if (this._oAnimation) {
            this._oAnimation.detachAll()
        }
    },
    set: function() {
        var a = Array.prototype.slice.apply(arguments);
        if (a.length >= 1) {
            this._oAnimation = a.shift();
            this._oAnimation.setStyle(a);
            this._attachAniEvent()
        }
        return this._oAnimation
    },
    getAnimation: function() {
        return this._oAnimation
    },
    isPlaying: function() {
        if (this._oAnimation) {
            return this._oAnimation.isPlaying()
        }
        return false
    },
    isAnimating: this.isPlaying,
    refresh: function() {},
    resize: function() {
        var c = this._htWElement.view,
            b = this._htWElement.container,
            f = parseInt(c.css("borderLeftWidth"), 10),
            a = parseInt(c.css("borderRightWidth"), 10),
            e = parseInt(c.css("borderTopWidth"), 10),
            d = parseInt(c.css("borderBottomWidth"), 10);
        f = isNaN(f) ? 0 : f;
        a = isNaN(a) ? 0 : a;
        e = isNaN(e) ? 0 : e;
        d = isNaN(d) ? 0 : d;
        this._htSize.viewWidth = c.width() - f - a;
        this._htSize.viewHeight = c.height() - e - d;
        this._htSize.contWidth = b.width();
        this._htSize.contHeight = b.height()
    },
    _calcMomentum: function(c, g, f, i, d, h) {
        var j = this.option("nDeceleration"),
            a = f / j,
            e = 0,
            b = 0;
        if (c > 0 && a > i) {
            b = h / (6 / (a / g * j));
            i = i + b;
            g = g * i / a;
            a = i
        } else {
            if (c < 0 && a > d) {
                b = h / (6 / (a / g * j));
                d = d + b;
                g = g * d / a;
                a = d
            }
        }
        a = a * (c < 0 ? -1 : 1);
        e = g / j;
        return {
            nDist: a,
            nTime: Math.round(e)
        }
    },
    _onStart: function(a) {
        if (this.isPlaying()) {
            a.oEvent.stop();
            return
        }
        this._clearOffsetBug();
        if (this.fireEvent("beforeTouchStart", a)) {
            this._isStop = false;
            this._startImpl(a);
            if (!this.fireEvent("touchStart", jindo.$Jindo.mixin(a, {}))) {
                a.stop()
            }
        } else {
            a.stop()
        }
    },
    _onMove: function(a) {
        this._clearOffsetBug();
        this._bClickBug && this._htWElement.container.css("pointerEvents", "none");
        if (this.fireEvent("beforeTouchMove", a)) {
            var b = this._preventSystemEvent(a);
            if (b && !this.isPlaying()) {
                this._moveImpl(a)
            }
            if (!b) {
                this.fireEvent("scroll")
            }
            var c = jindo.$Jindo.mixin(a, {});
            c.bPreventDefaultEvent = b;
            if (!this.fireEvent("touchMove", c)) {
                a.stop()
            }
        } else {
            a.stop()
        }
    },
    _onEnd: function(a) {
        if (this.isPlaying()) {
            return
        }
        if (!this._isStop) {
            this._clearOffsetBug()
        }
        if (this.fireEvent("beforeTouchEnd", a)) {
            if (a.sMoveType === jindo.m.MOVETYPE[3] || a.sMoveType === jindo.m.MOVETYPE[4] || a.sMoveType === jindo.m.MOVETYPE[5]) {
                if (this._isStop) {
                    a.oEvent.stop(jindo.$Event.CANCEL_ALL)
                } else {
                    this._tapImpl && this._tapImpl()
                }
            } else {
                this._endImpl(a)
            }
            if (!this.fireEvent("touchEnd", jindo.$Jindo.mixin(a, {}))) {
                a.stop()
            }
        } else {
            a.stop()
        }
        this._bClickBug && this._htWElement.container.css("pointerEvents", "auto")
    },
    _preventSystemEvent: function(b) {
        var a = b.oEvent;
        if (b.sMoveType === jindo.m.MOVETYPE[0]) {
            if (this._bUseH) {
                a.stop();
                return true
            } else {
                return false
            }
        } else {
            if (b.sMoveType === jindo.m.MOVETYPE[1]) {
                if (this._bUseV) {
                    a.stop();
                    return true
                } else {
                    return false
                }
            } else {
                if (b.sMoveType === jindo.m.MOVETYPE[2]) {
                    if (this._bUseDiagonalTouch) {
                        a.stop();
                        return true
                    } else {
                        return false
                    }
                } else {
                    if (b.sMoveType === jindo.m.MOVETYPE[6] || b.sMoveType === jindo.m.MOVETYPE[7] || b.sMoveType === jindo.m.MOVETYPE[8]) {
                        a.stop();
                        return true
                    } else {
                        a.stop();
                        return true
                    }
                }
            }
        }
    },
    _onResize: function(a) {
        if (a.sType === "rotate") {
            if (this.fireEvent("rotate", {
                    isVertical: a.isVertical
                })) {
                this._resizeImpl(a)
            }
        } else {
            this._resizeImpl(a)
        }
    },
    _getMomentumData: function(f, c, e) {
        var b = {
                nDist: 0,
                nTime: 0
            },
            a = {
                nDist: 0,
                nTime: 0
            },
            d = {
                momentumX: f.nMomentumX,
                momentumY: f.nMomentumY,
                distanceX: f.nDistanceX,
                distanceY: f.nDistanceY,
                x: this._nX,
                y: this._nY,
                nextX: this._nX,
                nextY: this._nY
            };
        if (this.option("bUseMomentum") && ((f.nMomentumX && f.nMomentumX > c) || (f.nMomentumY && f.nMomentumY > c))) {
            if (this._bUseH) {
                b = this._calcMomentum(f.nDistanceX, f.nSpeedX, f.nMomentumX, -this._nX, -this._htSize.maxX + this._nX, e ? this._htSize.viewWidth : 0)
            }
            if (this._bUseV) {
                a = this._calcMomentum(f.nDistanceY, f.nSpeedY, f.nMomentumY, -this._nY, -this._htSize.maxY + this._nY, e ? this._htSize.viewHeight : 0)
            }
            d.nextX = this._nX + b.nDist;
            d.nextY = this._nY + a.nDist;
            d.duration = Math.max(Math.max(b.nTime, a.nTime), 10);
            d.duration = jindo.m.getOsInfo().android ? d.duration * 0.7 : d.duration
        } else {
            d.duration = 0
        }
        return d
    },
    _makeStylePos: function(c) {
        var d = this.getAnimation(),
            e = jindo.m.getTranslateOffset(c),
            b = jindo.m.getStyleOffset(c),
            a = {
                top: (e.top + b.top) + "px",
                left: (e.left + b.left) + "px"
            };
        a[d.p("Transform")] = d.getTranslate("0px", "0px");
        c.css(a);
        this._htOffsetBug.elDummyTag.focus()
    },
    _createOffsetBugDummyTag: function() {
        if (this._hasOffsetBug()) {
            this._htOffsetBug.elDummyTag = jindo.$$.getSingle("._offsetbug_dummy_atag_", this._htWElement.view.$value());
            if (!this._htOffsetBug.elDummyTag) {
                this._htOffsetBug.elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_offsetbug_dummy_atag_'></a>");
                this._htWElement.view.append(this._htOffsetBug.elDummyTag)
            }
        }
    },
    _clearOffsetBug: function() {
        if (this._hasOffsetBug()) {
            clearTimeout(this._htOffsetBug.timer);
            this._htOffsetBug.timer = -1
        }
    },
    _fixOffsetBugImpl: function() {
        if (this._hasOffsetBug()) {
            var a = this;
            var b = this.getAnimation().getTarget(true);
            this._clearOffsetBug();
            this._htOffsetBug.timer = setTimeout(function() {
                if (b) {
                    a._makeStylePos(b)
                }
            }, 200)
        }
    },
    _hasOffsetBug: function() {
        return this._htOffsetBug.hasBug
    },
    destroy: function() {
        var a;
        this.deactivate();
        for (a in this._htWElement) {
            this._htWElement[a] = null
        }
        this._htWElement = null;
        for (a in this._htEvent) {
            this._htEvent[a] = null
        }
        this._htEvent = null;
        if (this._oTouch) {
            this._oTouch.destroy()
        }
        if (this._oAnimation) {
            this._oAnimation.destroy()
        }
    }
}).extend(jindo.m.UIComponent);
jindo.m.Flick = jindo.$Class({
    $init: function(b, a) {
        this.option({
            bHorizontal: true,
            sClassPrefix: "flick-",
            sContentClass: "ct",
            bUseCircular: false,
            nTotalContents: 3,
            nFlickThreshold: 40,
            nDuration: 100,
            nBounceDuration: 100,
            fpPanelEffect: jindo.m.Effect.cubicEaseIn,
            nDefaultIndex: 0,
            bFitContentSize: true,
            nDeceleration: 0.001,
            bUseMomentum: false
        })
    },
    _initVar: function() {
        jindo.m.SwipeCommon.prototype._initVar.apply(this);
        this._bUseH = this.option("bHorizontal");
        this._bUseV = !this._bUseH;
        this._bUseCircular = this.option("bUseCircular");
        this._nContentIndex = 0;
        this._welElement = null;
        this._aPos = [];
        this._nRange = null;
        this._nDefaultPanel = 3;
        this._hasKitkatHighlightBug = jindo.m._hasKitkatHighlightBug();
        this._nKitkatHighlightBug = -1
    },
    _setWrapperElement: function(b) {
        jindo.m.SwipeCommon.prototype._setWrapperElement.call(this, b);
        var a = this.option("bHorizontal") ? "height" : "width";
        this._htWElement.aPanel = this._htWElement.container.queryAll("." + this.option("sClassPrefix") + this.option("sContentClass"));
        var c = jindo.$A(this._htWElement.aPanel);
        if (!this._bUseCircular) {
            c = c.filter(function(e, f, d) {
                return jindo.$Element(e).visible()
            })
        }
        this._htWElement.container.css({
            position: "relative"
        }).css(a, "100%");
        this._htWElement.aPanel = c.forEach(function(e, f, d) {
            d[f] = jindo.$Element(e).css(a, "100%")
        }).$value()
    },
    _checkIndex: function(c) {
        var a = true,
            b = this.getTotalContents() - 1;
        if (isNaN((c * 1)) || c < 0) {
            a = false
        }
        if (c > b) {
            a = false
        }
        return a
    },
    _refreshPanelInfo: function() {
        var a = 0;
        this._aPos = [0];
        for (var b = 0, d = this._bUseH ? "width" : "height", c = this.getTotalContents(); b < c; b++) {
            if (this._nRange != null) {
                a -= this._nRange
            } else {
                a -= this._htWElement.aPanel[b][d]()
            }
            this._aPos.push(a)
        }
    },
    _onActivate: function() {
        jindo.m.SwipeCommon.prototype._onActivate.apply(this)
    },
    _onDeactivate: function() {
        jindo.m.SwipeCommon.prototype._onDeactivate.apply(this)
    },
    set: function() {
        if (!this._oAnimation) {
            jindo.m.SwipeCommon.prototype.set.apply(this, Array.prototype.slice.apply(arguments));
            if (this._bUseCircular) {
                this.option("nTotalContents", parseInt(this.option("nTotalContents"), 10))
            } else {
                this.option("nTotalContents", this._htWElement.aPanel.length)
            }
            var a = this.option("nDefaultIndex");
            if (!this._checkIndex(a)) {
                a = 0
            }
            this.resize();
            this.refresh(a)
        }
        return this._oAnimation
    },
    refresh: function(c, a, b) {
        jindo.m.SwipeCommon.prototype.refresh.call(this);
        c = typeof c === "undefined" ? this.getContentIndex() : c;
        this._hasKitkatHighlightBug && this._htWElement.container.addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
        this._moveTo(c, {
            duration: 0,
            fireEvent: a,
            fireMoveEvent: b,
            corrupt: true
        })
    },
    resize: function() {
        jindo.m.SwipeCommon.prototype.resize.call(this);
        if (!this.option("bFitContentSize") && !this._bUseCircular) {
            this._nRange = null
        } else {
            this._nRange = this._bUseH ? this._htSize.viewWidth : this._htSize.viewHeight;
            if (this._nRange == 0) {
                this._nRange = this._htWElement.view[this._bUseH ? "width" : "height"]()
            }
        }
        this._refreshPanelInfo();
        if (this._nRange != null) {
            if (this._bUseH) {
                this._htSize.maxX = (this.option("nTotalContents") - 1) * -this._nRange;
                this._nX = this._aPos[this.getContentIndex()]
            } else {
                this._htSize.maxY = (this.option("nTotalContents") - 1) * -this._nRange;
                this._nY = this._aPos[this.getContentIndex()]
            }
        }
    },
    getElement: function() {
        var a = this.getContentIndex();
        if (this._bUseCircular) {
            if (this._welElement) {
                return this._welElement
            } else {
                a %= this._nDefaultPanel;
                return this._htWElement.aPanel[a]
            }
        } else {
            return this._htWElement.aPanel[a]
        }
    },
    getNextElement: function() {
        var a;
        if (this._bUseCircular) {
            a = this._getIndexByElement(this.getElement());
            a = ((((a + 1) % this._nDefaultPanel) > this._nDefaultPanel - 1) ? 0 : (a + 1)) % this._nDefaultPanel
        } else {
            a = this.getNextIndex()
        }
        return this._htWElement.aPanel[a]
    },
    getPrevElement: function() {
        var a;
        if (this._bUseCircular) {
            a = this._getIndexByElement(this.getElement());
            a = ((a - 1) < 0) ? this._nDefaultPanel - 1 : (a - 1)
        } else {
            a = this.getPrevIndex()
        }
        return this._htWElement.aPanel[a]
    },
    _getIndexByElement: function(a) {
        var b = -1;
        jindo.$A(this._htWElement.aPanel).forEach(function(d, e, c) {
            if (d.isEqual(a)) {
                b = e
            }
        });
        return b
    },
    getContentIndex: function() {
        return parseInt(this._nContentIndex, 10)
    },
    getNextIndex: function() {
        var b = this.getContentIndex() + 1,
            a = this.getTotalContents() - 1;
        if (this._bUseCircular && (b > a)) {
            b = 0
        }
        return Math.min(a, b)
    },
    getPrevIndex: function() {
        var a = this.getContentIndex() - 1;
        if (this._bUseCircular && a < 0) {
            a = this.getTotalContents() - 1
        }
        return Math.max(0, a)
    },
    getTotalContents: function() {
        if (this._bUseCircular) {
            return this.option("nTotalContents")
        } else {
            return this._htWElement.aPanel.length
        }
    },
    setTotalContents: function(a) {
        if (isNaN(a) || a < 1) {
            return
        }
        a = parseInt(a, 10);
        if ((this.getContentIndex() + 1) > a) {
            this._moveTo(a - 1, {
                duration: 0,
                fireEvent: true,
                fireMoveEvent: true
            })
        }
        this.option("nTotalContents", a);
        this.resize()
    },
    getTotalPanels: function() {
        return this._htWElement.aPanel.length
    },
    getPanels: function() {
        return this._htWElement.aPanel
    },
    moveTo: function(a, b) {
        if (a == this.getContentIndex()) {
            return
        }
        return this._moveTo(a, {
            duration: b
        })
    },
    _moveTo: function(a, c) {
        if ((this._nRange == null) && (this._aPos.indexOf(this._bUseH ? this._htSize.maxX : this._htSize.maxY)) < a) {
            return
        }
        var e = {
            duration: typeof c.duration === "undefined" ? this.option("nDuration") : c.duration,
            fireEvent: typeof c.fireEvent === "undefined" ? true : c.fireEvent,
            fireMoveEvent: typeof c.fireMoveEvent === "undefined" ? false : c.fireMoveEvent,
            corrupt: typeof c.corrupt == "undefined" ? false : c.corrupt,
            direct: typeof c.direct == "undefined" ? false : c.direct
        };
        if (this.isPlaying() || isNaN(a) || a < 0 || a >= this.getTotalContents()) {
            return
        }
        var g = this._bUseH ? this._nX : this._nY,
            h = this._getPos(a);
        if (this._bUseCircular) {
            var d = this._posToIndex(g),
                f = this.getTotalContents();
            if (d == 0 && a == f - 1) {
                if (this.option("nTotalContents") >= 3) {
                    h = this._nRange
                }
            } else {
                if (d == f - 1 && a == 0) {
                    h = this._getPos(d) - this._nRange
                }
            }
        }
        if (g == h) {
            if (e.duration === 0 && e.fireEvent) {
                if (e.fireMoveEvent) {
                    if (this._fireMoveEvent(a)) {
                        this._fireMoveEvent()
                    }
                } else {
                    var b = {
                        next: null,
                        moveCount: 0,
                        corrupt: e.corrupt,
                        contentsNextIndex: a
                    };
                    if (this._fireFlickingEvent("beforeFlicking", b)) {
                        this._fireFlickingEvent("flicking", b);
                        this._fireFlickingEvent("afterFlicking", b)
                    }
                }
            }
            return
        }
        this._move(g, h, {
            duration: e.duration,
            contentsNextIndex: a,
            fireEvent: e.fireEvent,
            fireMoveEvent: e.fireMoveEvent,
            corrupt: e.corrupt,
            direct: c.direct
        })
    },
    moveNext: function(c) {
        var b = {
            duration: c,
            direct: false
        };
        if (this._bUseCircular && this.option("nTotalContents") < 3) {
            var a = this.getContentIndex();
            if (this._bUseH) {
                this._nX = a == 0 ? 1 : this._nX - 1
            } else {
                this._nY = a == 0 ? 1 : this._nY - 1
            }
            b.direct = true
        }
        this._moveTo(this.getNextIndex(), b)
    },
    movePrev: function(c) {
        var b = {
            duration: c,
            direct: false
        };
        if (this._bUseCircular && this.option("nTotalContents") < 3) {
            var a = this.getContentIndex();
            b.direct = true;
            if (this._bUseH) {
                this._nX = a == 0 ? this._aPos[this.getTotalContents() - 1] - 1 : this._nX + 1
            } else {
                this._nY = a == 0 ? this._aPos[this.getTotalContents() - 1] - 1 : this._nY + 1
            }
            this._moveTo(this.getNextIndex(), b)
        } else {
            this._moveTo(this.getPrevIndex(), b)
        }
    },
    _startImpl: function(a) {
        if (this.isPlaying()) {
            return
        }
        this._nPosToIndex = this._posToIndex(this._bUseH ? this._nX : this._nY)
    },
    _moveImpl: function(b) {
        var a = this._bUseH ? b.nVectorX : b.nVectorY,
            f = this._bUseH ? b.nDistanceX : b.nDistanceY,
            e = f < 0,
            d = this._bUseH ? this._nX : this._nY,
            c = e ? this.getNextIndex() : this.getPrevIndex();
        if (this._bUseCircular) {
            d += a
        } else {
            d += (c == this.getContentIndex() ? a / 2 : a)
        }
        this._nX = this._bUseH ? d : 0;
        this._nY = this._bUseV ? d : 0;
        b.bNext = e;
        this._moveAfterCall && this._moveAfterCall(b);
        return e
    },
    _endImpl: function(c) {
        var i = null,
            d = (this._bUseH ? c.nDistanceX : c.nDistanceY) < 0,
            f = this.getContentIndex(),
            g = d ? this.getNextIndex() : this.getPrevIndex(),
            h = this._getPos(f),
            e = Math.abs((this._bUseH ? this._nX : this._nY) - h),
            b = (f === g) || (e < parseInt(this.option("nFlickThreshold"), 10) || (this._aPos.indexOf(this._bUseH ? this._htSize.maxX : this._htSize.maxY)) < g);
        if (e == 0) {
            return
        }
        if (b) {
            this._restore()
        } else {
            i = this._getMomentumData(c, 1.5);
            if (i.duration === 0 || (d && f === this.getTotalContents() - 1) || (!d && f === 0)) {
                var a = this._bUseH ? this._nX : this._nY;
                if ((d && (a < this._aPos[g])) || (!d && (a > this._aPos[g]))) {
                    if (this._bUseCircular && this.option("nTotalContents") < 3) {
                        if (f == 0 && g == 1 && !d) {
                            if (this._bUseH) {
                                this._nX = this._aPos[this.getTotalContents() - 1] - 1
                            } else {
                                this._nY = this._aPos[this.getTotalContents() - 1] - 1
                            }
                        }
                    } else {
                        this._setCurrentPos(f, d)
                    }
                }
                this._moveTo(this._nRange == null ? this._getNextIndexByView(f, d) : g, {
                    duration: this.option("nDuration"),
                    direct: true
                })
            } else {
                var j = this._posToIndex(this._bUseH ? i.nextX : i.nextY);
                if (j == f) {
                    this._restore()
                } else {
                    if (this._bUseCircular) {
                        f += d ? 1 : -1;
                        this._setCurrentPos(f, d)
                    } else {
                        this._setCurrentPos(f, d)
                    }
                    this._moveTo(j, {
                        duration: i.duration
                    })
                }
            }
        }
    },
    _getNextIndexByView: function(a, b) {
        return b ? this.getNextIndex() : this.getPrevIndex()
    },
    _setCurrentPos: function(a, b) {
        if (this._bUseH) {
            this._nX = this._aPos[a]
        } else {
            this._nY = this._aPos[a]
        }
    },
    _resizeImpl: function(a) {
        this.resize()
    },
    _restore: function() {
        if (!this._bUseH && !this._bUseV) {
            return
        }
        var a = this._getPos(this.getContentIndex()),
            b;
        if (jindo.m.SlideFlicking && this instanceof jindo.m.SlideFlicking) {
            var c = jindo.m.getTranslateOffset(this._htWElement.container);
            b = this._bUseH ? c.left : c.top
        } else {
            b = this._bUseH ? this._nX : this._nY
        }
        if (a === b) {
            return
        } else {
            this._move(b, a, {
                duration: this.option("nBounceDuration"),
                restore: true
            })
        }
    },
    _getRevisionNo: function(a) {
        var b = this.getTotalContents();
        if (a < 0) {
            a += b
        } else {
            if (a > b - 1) {
                a = a % b
            }
        }
        return a
    },
    _fireCustomBeforeEvent: function(a) {
        if (a.restore) {
            if (!this._fireRestoreEvent("beforeRestore", a)) {
                return false
            }
        } else {
            if (a.fireMoveEvent) {
                if (a.moveIndex == 0) {
                    if (!this._fireMoveEvent(a.contentsNextIndex)) {
                        return false
                    }
                }
            } else {
                if (!this._fireFlickingEvent("beforeFlicking", a)) {
                    return false
                }
            }
        }
        return true
    },
    _setPanelEndInfo: function(a) {
        if (a.restore) {
            this._nX = this._bUseH ? this._getPos(a.no) : 0;
            this._nY = this._bUseV ? this._getPos(a.no) : 0
        } else {
            a.no = this._getRevisionNo(a.no);
            this._updateFlickInfo(a.no, a.next ? this.getNextElement() : this.getPrevElement())
        }
    },
    _fireCustomEvent: function(a) {
        if (a.restore) {
            this._fireRestoreEvent("restore", a)
        } else {
            if (a.fireMoveEvent) {
                if (a.duration === 0 || a.moveCount == (a.moveIndex + 1)) {
                    this._fireMoveEvent()
                }
            } else {
                this._fireFlickingEvent("flicking", a);
                this._fireFlickingEvent("afterFlicking", a)
            }
        }
    },
    _fireFlickingEvent: function(c, d) {
        if (typeof this._htEventHandler[c] == "undefined") {
            return true
        }
        var b = {
                nContentsIndex: this.getContentIndex(),
                bNext: d.next
            },
            a = null;
        if (/before/.test(c)) {
            if (d.direct || (d.duration === 0 && d.moveCount > 1)) {
                b.nContentsNextIndex = d.contentsNextIndex
            } else {
                b.nContentsNextIndex = d.next ? this.getNextIndex() : this.getPrevIndex()
            }
        }
        b.nMoveCount = d.moveCount;
        b.bCorrupt = d.corrupt;
        b[this._bUseH ? "bLeft" : "bTop"] = b.bNext;
        return this.fireEvent(c, b)
    },
    _fireRestoreEvent: function(a, b) {
        return this.fireEvent(a, {
            nContentsIndex: this.getContentIndex()
        })
    },
    _fireMoveEvent: function(a) {
        if (typeof a === "undefined") {
            return this.fireEvent("move", {
                nContentsIndex: this.getContentIndex()
            })
        } else {
            return this.fireEvent("beforeMove", {
                nContentsIndex: this.getContentIndex(),
                nContentsNextIndex: a
            })
        }
    },
    _updateFlickInfo: function(a, b) {
        this._nContentIndex = typeof a === "undefined" ? this.getContentIndex() : a;
        b = typeof b === "undefined" ? this.getElement() : b;
        this._nX = this._bUseH ? this._getPos(this._nContentIndex) : 0;
        this._nY = this._bUseV ? this._getPos(this._nContentIndex) : 0;
        this._welElement = b
    },
    _onEndAniImpl: function(a) {
        if (this._bUseCircular) {}
    },
    _makeOption: function(b) {
        var a = jindo.$Jindo.mixin({
            duration: 0,
            restore: false,
            fireEvent: true,
            fireMoveEvent: false,
            moveCount: 1,
            moveIndex: 0,
            corrupt: false,
            useCircular: this._bUseCircular,
            range: this._nRange
        }, b || {});
        a.restore && (a.moveCount = 0);
        (a.moveCount > 1 && a.duration === 0) && (a.corrupt = true);
        a.direct = a.direct || (jindo.m.SlideFlicking && this instanceof jindo.m.SlideFlicking && typeof this._htEventHandler.beforeFlicking == "undefined" && typeof this._htEventHandler.flicking == "undefined" && typeof this._htEventHandler.afterFlicking == "undefined");
        return a
    },
    _moveWithEvent: function(c, e, b) {
        var a = this,
            d = {};
        b.no = this._posToIndex(c);
        d = jindo.$Jindo.mixin(b, {});
        if (!d.fireMoveEvent && d.moveCount > 1) {
            d.contentsNextIndex = d.no
        }
        a._panelEndBeforeCall && a._panelEndBeforeCall(d);
        this._oAnimation._oMorph.pushCall(function() {
            if (d.fireEvent && !a._fireCustomBeforeEvent(d)) {
                this.clear();
                a._restore()
            }
        });
        this._oAnimation.move(this._bUseH ? c : 0, this._bUseV ? c : 0, e, d);
        this._oAnimation._oMorph.pushCall(function() {
            a._setPanelEndInfo(d);
            a._panelEndAfterCall && a._panelEndAfterCall(d);
            d.fireEvent && a._fireCustomEvent(d)
        });
        return this._oAnimation._oMorph
    },
    _move: function(g, h, l) {
        if (!this._bUseCircular) {
            var a = this._bUseH ? this._htSize.maxX : this._htSize.maxY;
            h = h < a ? a : h
        }
        if (g === h) {
            return
        }
        this._clearOffsetBug();
        var d = g > h,
            k = this._getStepCount(g, h);
        l = l || {};
        l.moveCount = k;
        l.next = d;
        l = this._makeOption(l);
        if (l.restore) {
            this._moveWithEvent(h, l.duration, l).play();
            return
        }
        if (l.duration == 0) {
            this._moveWithEvent(h, 0, l).play()
        } else {
            if (l.direct) {
                this._moveWithEvent(h, l.duration, l).play()
            } else {
                var j = 0,
                    b = g,
                    c = 0,
                    f = this.option("fpPanelEffect")(0, l.duration);
                for (var e = 0; e < k; e++) {
                    l.moveIndex = e;
                    c = this._getPanelEndPos(b, h, d);
                    j = f((e + 1) / k) - f(e / k);
                    this._moveWithEvent(c, j, l);
                    b = c
                }
            }
            this._oAnimation._oMorph.play()
        }
    },
    _getPos: function(a) {
        if (a < 0 || a >= this._aPos.length) {
            console.error("wrong index", a);
            return 0
        } else {
            return this._aPos[a]
        }
    },
    _isPosPoint: function(a) {
        return this._aPos.indexOf(a) != -1
    },
    _getStepCount: function(d, f) {
        var c = d > f;
        var e = this._posToIndex(d),
            b = this._posToIndex(f),
            a = Math.abs(b - e);
        if (!c && !this._isPosPoint(d) && this._isPosPoint(f)) {
            a++
        }
        return a
    },
    _posToIndex: function(d) {
        for (var c = 0, a = -1, b, e = this._aPos.length; c < e; c++) {
            b = this._aPos[c];
            if (d < b) {
                a++
            } else {
                if (d == b) {
                    a++;
                    break
                } else {
                    break
                }
            }
        }
        return a
    },
    _getPanelEndPos: function(d, e, c) {
        var a = this._posToIndex(d),
            b;
        (!c && !this._isPosPoint(d)) && (a++);
        a += c ? 1 : -1;
        if (this._bUseCircular && a < 0) {
            b = d + e
        } else {
            b = this._getPos(a)
        }((this._nRange == null) && c) && (b = e > b ? e : b);
        return b
    },
    _getTranslate: function(a) {
        return this._oAnimation.getTranslate(this._bUseH ? a : 0, this._bUseV ? a : 0)
    },
    _tapImpl: function() {
        if (this._hasKitkatHighlightBug) {
            this._htWElement.container.removeClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
            this._htWElement.container._element.clientHeight;
            var a = this;
            clearTimeout(this._nKitkatHighlightBug);
            this._nKitkatHighlightBug = setTimeout(function() {
                a._htWElement.container.addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS)
            }, 200)
        }
    },
    destroy: function() {
        jindo.m.SwipeCommon.prototype.destroy.apply(this)
    }
}).extend(jindo.m.SwipeCommon);
jindo.m.Flicking = jindo.$Class({
    $init: function(b, a) {
        this.option({
            bHorizontal: true,
            nDefaultIndex: 0,
            sClassPrefix: "flick-",
            sContentClass: "ct",
            nDuration: 100,
            nFlickThreshold: 40,
            bUseCircular: false,
            sAnimation: "slide",
            nFlickDistanceOffset: null,
            bAutoResize: true,
            nBounceDuration: 100,
            bSetNextPanelPos: false,
            bUseCss3d: jindo.m.useCss3d(),
            bUseTimingFunction: jindo.m.useTimingFunction(),
            bUseTranslate: true,
            bActivateOnload: true,
            bUseDiagonalTouch: false,
            nDefaultScale: 0.94,
            nZIndex: 2000
        });
        this.option(a || {});
        this._initVar(b);
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    $static: {
        _htAnimation: {
            flip: "_FlipFlicking_",
            "circular-flip": "_FlipFlicking_",
            alignFlip: "_AlignFlipFlicking_",
            "circular-alignFlip": "_AlignFlipFlicking_",
            "circular-slide": "SlideFlicking",
            slide: "SlideFlicking",
            "circular-cover": "CoverFlicking",
            cover: "CoverFlicking"
        }
    },
    _initVar: function(a) {
        this._el = jindo.$(a);
        this._oFlickingImpl = null;
        if (/slide|cover/.test(this.option("sAnimation"))) {
            this._isSwipeType = true
        } else {
            this._isSwipeType = false
        }
    },
    _createFlicking: function() {
        var c = this.option("sAnimation");
        if (this.option("bUseCircular")) {
            c = "circular-" + c
        }
        try {
            var a = this.option();
            a.bActivateOnload = false;
            this._oFlickingImpl = new jindo.m[jindo.m.Flicking._htAnimation[c]](this._el, a)
        } catch (b) {
            console.error("_createFlicking ERROR ! " + b)
        }
    },
    refresh: function(c, a, b) {
        if (this._oFlickingImpl) {
            if (this._isSwipeType) {
                this._oFlickingImpl.resize();
                this._oFlickingImpl.refresh(c, b, true)
            } else {
                this._oFlickingImpl.refresh(c, a, b)
            }
        }
    },
    getIndexByElement: function(a) {
        if (this._oFlickingImpl) {
            if (this._isSwipeType) {
                return this._oFlickingImpl._getIndexByElement(a)
            } else {
                return this._oFlickingImpl.getIndexByElement(a)
            }
        } else {
            return -1
        }
    },
    getElement: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getElement()
        } else {
            return null
        }
    },
    getContentElement: function() {
        return this.getElement()
    },
    getContentIndex: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getContentIndex()
        } else {
            return null
        }
    },
    getNextElement: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getNextElement()
        } else {
            return null
        }
    },
    getPrevElement: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getPrevElement()
        } else {
            return null
        }
    },
    getTotalContents: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getTotalContents()
        } else {
            return null
        }
    },
    getTotalPanels: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getTotalPanels()
        } else {
            return null
        }
    },
    getPanels: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl._htWElement.aPanel
        } else {
            return null
        }
    },
    getPrevIndex: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getPrevIndex()
        } else {
            return null
        }
    },
    getNextIndex: function() {
        if (this._oFlickingImpl) {
            return this._oFlickingImpl.getNextIndex()
        } else {
            return null
        }
    },
    moveNext: function(a) {
        if (!this.isActivating()) {
            return
        }
        if (this._oFlickingImpl) {
            this._oFlickingImpl.moveNext(a)
        }
    },
    movePrev: function(a) {
        if (!this.isActivating()) {
            return
        }
        if (this._oFlickingImpl) {
            this._oFlickingImpl.movePrev(a)
        }
    },
    moveTo: function(a, c, b) {
        if ((typeof a === "undefined") || (a == this.getContentIndex())) {
            return
        }
        if (a < 0 || a >= this.getTotalContents()) {
            return
        }
        if (this._oFlickingImpl) {
            if (this._isSwipeType) {
                this._oFlickingImpl._moveTo(a, {
                    duration: typeof c === "undefined" ? 0 : c,
                    fireEvent: b,
                    fireMoveEvent: true
                })
            } else {
                this._oFlickingImpl.moveTo(a, c, b)
            }
        }
    },
    isAnimating: function() {
        if (this._oFlickingImpl) {
            if (this._isSwipeType) {
                return this._oFlickingImpl.isPlaying()
            } else {
                return this._oFlickingImpl._doFlicking
            }
        }
    },
    _onActivate: function() {
        if (!this._oFlickingImpl) {
            this._createFlicking()
        }
        if (this._oFlickingImpl && !this._oFlickingImpl.isActivating()) {
            this._oFlickingImpl.activate();
            this._attachEvent();
            if (!this._isSwipeType) {
                this.refresh(this.getContentIndex(), true, false)
            }
        }
    },
    _onDeactivate: function() {
        this._oFlickingImpl.deactivate();
        this._detachEvent()
    },
    _attachEvent: function() {
        if (!this._oFlickingImpl) {
            return
        }
        var a = this;
        this._oFlickingImpl.attach({
            touchStart: function(b) {
                if (!a.fireEvent("touchStart", b)) {
                    b.stop()
                }
            },
            touchMove: function(b) {
                a.fireEvent("touchMove", b)
            },
            touchEnd: function(b) {
                a.fireEvent("touchEnd", b)
            },
            beforeFlicking: function(b) {
                if (!a.fireEvent("beforeFlicking", b)) {
                    b.stop()
                }
            },
            afterFlicking: function(b) {
                a.fireEvent("afterFlicking", b)
            },
            beforeMove: function(b) {
                if (!a.fireEvent("beforeMove", b)) {
                    b.stop()
                }
            },
            move: function(b) {
                a.fireEvent("move", b)
            },
            scroll: function(b) {
                a.fireEvent("scroll")
            },
            beforeRestore: function(b) {
                if (!a.fireEvent("beforeRestore", b)) {
                    b.stop()
                }
            },
            restore: function(b) {
                a.fireEvent("restore", b)
            },
            rotate: function(b) {
                a.fireEvent("rotate", b)
            }
        })
    },
    _detachEvent: function() {
        if (this._oFlickingImpl) {
            this._oFlickingImpl.detachAll()
        }
    },
    destroy: function() {
        this.deactivate();
        this._el = null;
        this._oFlickingImpl = null;
        this._isSwipeType = false
    }
}).extend(jindo.m.UIComponent);
jindo.m.MoreContentButton = jindo.$Class({
    $init: function(a, b) {
        this.option({
            sClassPrefix: "more_",
            nTotalItem: 10,
            nShowMaxItem: 10,
            nItemPerPage: 10,
            nPage: 1,
            bActivateOnload: true,
            htAjax: {}
        });
        this.option(b || {});
        this.option("nItem", this.option("nShowMaxItem"));
        this._initVar();
        this._setWrapperElement(a);
        if (this.option("bActivateOnload")) {
            this.activate();
            this._nCurrentPage = this.option("nPage");
            this.updateInfo()
        }
    },
    _initVar: function() {
        var b = {
            sApi: null,
            htAjaxOption: {
                type: "xhr"
            },
            htQuery: {},
            sStart: "start",
            sDisplay: "display"
        };
        var a = this.option("htAjax");
        if (!a) {
            this.option("htAjax", b);
            return
        }
        for (var c in b) {
            if (typeof a[c] == "undefined") {
                a[c] = b[c]
            }
        }
        for (c in b.htAjaxOption) {
            if (typeof a.htAjaxOption[c] == "undefined") {
                a.htAjaxOption[c] = b.htAjaxOption[c]
            }
        }
        for (c in b.htQuery) {
            if (typeof a.htQuery[c] == "undefined") {
                a.htQuery[c] = b.htQuery[c]
            }
        }
        if (!!a.sApi) {
            this.oAjax = new jindo.$Ajax(a.sApi, a.htAjaxOption)
        }
    },
    _setWrapperElement: function(a) {
        this._htWElement = {};
        var b = "." + this.option("sClassPrefix");
        this._htWElement.elBase = jindo.$Element(a);
        this._htWElement.elMoreButton = jindo.$Element(this._htWElement.elBase.query(b + "button"));
        this._htWElement.elTop = jindo.$Element(this._htWElement.elBase.query(b + "top"));
        this._htWElement.elLoading = jindo.$Element(this._htWElement.elBase.query(b + "loading"));
        this._htWElement.elMoreCnt = jindo.$Element(this._htWElement.elBase.query(b + "moreCnt"));
        this._htWElement.elTotal = jindo.$Element(this._htWElement.elBase.query(b + "total"));
        this._htWElement.elCurrent = jindo.$Element(this._htWElement.elBase.query(b + "current"));
        this._htWElement.elRemainder = jindo.$Element(this._htWElement.elBase.query(b + "remainder"));
        this._htWElement.elLast = jindo.$Element(this._htWElement.elBase.query(b + "last"));
        if (!!this._htWElement.elLast) {
            this._htWElement.elLastTotal = jindo.$Element(this._htWElement.elLast.query(b + "total"));
            this._htWElement.elLastCurrent = jindo.$Element(this._htWElement.elLast.query(b + "current"));
            this._htWElement.elLastRemainder = jindo.$Element(this._htWElement.elLast.query(b + "remainder"))
        }
    },
    _onClickMore: function(a) {
        a.stop(jindo.$Event.CANCEL_DEFAULT);
        if (this.hasNextPage()) {
            this.more()
        }
    },
    _onClickTop: function(a) {
        a.stop(jindo.$Event.CANCEL_DEFAULT);
        this.fireEvent("goTop", {
            element: a.element
        })
    },
    more: function(d) {
        if (typeof d == "undefined") {
            d = true
        }
        var c = this._nCurrentPage + 1;
        var b = this.getCurrentPage();
        if (d) {
            if (!this.fireEvent("beforeMore", {
                    nPage: c,
                    nCurrentPage: b
                })) {
                return
            }
        }
        var a = this.getPageItemIndex(c);
        if (!a) {
            this.updateInfo();
            return
        }
        this.showLoadingImg();
        if (!!this.option("htAjax").sApi) {
            this._callAjax(c, true, d)
        } else {
            this._move(c);
            if (d) {
                this.fireEvent("more", {
                    nPage: c,
                    nStartIndex: a.nStart,
                    nEndIndex: a.nEnd
                })
            }
            this.updateInfo()
        }
    },
    movePageTo: function(c, d) {
        if (typeof d == "undefined") {
            d = true
        }
        var b = this.getCurrentPage();
        if (d) {
            if (!this.fireEvent("beforeMovePage", {
                    nPage: c,
                    nCurrentPage: b
                })) {
                return
            }
        }
        var a = this.getPageItemIndex(c);
        if (!a) {
            this.updateInfo();
            return
        }
        this.showLoadingImg();
        if (!!this.option("htAjax").sApi) {
            this._callAjax(c, false, d)
        } else {
            this._move(c);
            if (d) {
                this.fireEvent("movePage", {
                    nPage: c,
                    nBeforePage: b,
                    nStartIndex: 0,
                    nEndIndex: a.nEnd
                })
            }
            this.updateInfo()
        }
    },
    _move: function(a) {
        var b = this._convertToAvailPage(a);
        if (b != this._nCurrentPage) {
            this._nCurrentPage = b
        }
    },
    updateInfo: function() {
        var d = this.getCurrentPage(),
            b = this.getPageItemIndex(d);
        this.hideLoadingImg();
        if (d >= this.getTotalPages()) {
            if (this._htWElement.elBase) {
                this._htWElement.elBase.addClass("u_pg_end")
            }
            if (this._htWElement.elMoreButton) {
                this._htWElement.elMoreButton.hide()
            }
            if (this._htWElement.elLast) {
                this._htWElement.elLast.show("block")
            }
        } else {
            if (this._htWElement.elBase) {
                this._htWElement.elBase.removeClass("u_pg_end")
            }
            if (this._htWElement.elMoreButton) {
                this._htWElement.elMoreButton.show("block")
            }
            if (this._htWElement.elLast) {
                this._htWElement.elLast.hide()
            }
        }
        if (!!this._htWElement.elCurrent && !!b) {
            var c = b.nEnd + 1;
            this._htWElement.elCurrent.text(this._setNumberFormat(c))
        }
        if (typeof this._htWElement.elLastCurrent != "undefined" && this._htWElement.elLastCurrent && !!b) {
            this._htWElement.elLastCurrent.text(this._setNumberFormat(b.nEnd + 1))
        }
        if (!!this._htWElement.elRemainder && !!b) {
            this._htWElement.elRemainder.text(this._setNumberFormat(parseInt(this.option("nTotalItem"), 10) - (b.nEnd + 1)))
        }
        if (!!this._htWElement.elLastRemainder && !!b) {
            this._htWElement.elLastRemainder.text(this._setNumberFormat(parseInt(this.option("nTotalItem"), 10) - (b.nEnd + 1)))
        }
        if (!!this._htWElement.elTotal) {
            this._htWElement.elTotal.text(this._setNumberFormat(this.option("nTotalItem")))
        }
        if (typeof this._htWElement.elLastTotal != "undefined" && this._htWElement.elLastTotal) {
            this._htWElement.elLastTotal.text(this._setNumberFormat(this.option("nTotalItem")))
        }
        if (!!this._htWElement.elMoreCnt && !!b) {
            var a = Math.min(this.getItemPerPage(), this.getItemCount() - b.nEnd - 1);
            this._htWElement.elMoreCnt.text(this._setNumberFormat(a))
        }
    },
    _callAjax: function(b, c, d) {
        var a = this;
        this.oAjax.option("onload", null);
        this.oAjax.option("onload", function(e) {
            a._onAjaxResponse(e, b, c, d)
        });
        this.oAjax.request(this._getQueryString(b, c))
    },
    _onAjaxResponse: function(c, b, d, e) {
        if (e) {
            this._move(b);
            var f = d ? "more" : "movePage";
            var a = this.getPageItemIndex(b);
            this.fireEvent(f, {
                oResponse: c,
                nPage: b,
                nStartIndex: d ? a.nStart : 0,
                nEndIndex: a.nEnd
            })
        }
        this.updateInfo()
    },
    _getQueryString: function(b, d) {
        if (typeof d === "undefined") {
            d = true
        }
        var c = this.option("htAjax").htQuery || {};
        var a = this.getPageItemIndex(b);
        c[this.option("htAjax").sStart] = d ? a.nStart : 0;
        c[this.option("htAjax").sDisplay] = Math.min(this.getItemPerPage(), (this.getShowMaxItem() - a.nStart));
        return c
    },
    _setNumberFormat: function(a) {
        a = a.toString();
        var d = "";
        var f = 0;
        var c = a.length;
        for (var b = c; b >= 0; b--) {
            var e = a.charAt(b);
            if (b > c) {
                d = e + d;
                continue
            }
            if (/[0-9]/.test(e)) {
                if (f >= 3) {
                    d = "," + d;
                    f = 0
                }
                f++;
                d = e + d
            }
        }
        return d
    },
    showLoadingImg: function() {
        if (!!this._htWElement.elLoading) {
            this._htWElement.elLoading.show()
        }
    },
    hideLoadingImg: function() {
        if (!!this._htWElement.elLoading) {
            this._htWElement.elLoading.hide()
        }
    },
    reset: function(a) {
        if (typeof a == "undefined") {
            a = this.option("nShowMaxItem")
        }
        this.setShowMaxItem(a);
        this.movePageTo(1, false)
    },
    getTotalItem: function() {
        return this.option("nTotalItem")
    },
    setTotalItem: function(a) {
        this.option("nTotalItem", a)
    },
    getShowMaxItem: function() {
        return this.option("nShowMaxItem")
    },
    setShowMaxItem: function(a) {
        this.option("nShowMaxItem", a);
        this.option("nItem", a)
    },
    _onActivate: function() {
        this._attachEvent()
    },
    _onDeactivate: function() {
        this._detachEvent()
    },
    _attachEvent: function() {
        this._htEvent = {};
        if (!!this._htWElement.elMoreButton) {
            this._htEvent.click_More = {
                ref: jindo.$Fn(this._onClickMore, this).attach(this._htWElement.elMoreButton, "click"),
                el: this._htWElement.elMoreButton.$value()
            }
        }
        if (!!this._htWElement.elTop) {
            this._htEvent.click_Top = {
                ref: jindo.$Fn(this._onClickTop, this).attach(this._htWElement.elTop, "click"),
                el: this._htWElement.elTop.$value()
            }
        }
    },
    _detachEvent: function() {
        for (var b in this._htEvent) {
            var a = this._htEvent[b];
            a.ref.detach(a.el, b.substring(0, b.indexOf("_")))
        }
        this._htEvent = null
    },
    header: function(a, b) {
        if (this.oAjax) {
            return this.oAjax.header(a, b)
        }
    },
    destroy: function() {
        this._detachEvent();
        for (var a in this._htWElement) {
            this._htWElement[a] = null
        }
        this._htWElement = null
    }
}).extend(jindo.m.CorePagination);
jindo.m.Scroll = jindo.$Class({
    $init: function(b, a) {
        this.option({
            bActivateOnload: true,
            bUseHScroll: false,
            bUseVScroll: true,
            bUseMomentum: true,
            nDeceleration: 0.0006,
            nOffsetTop: 0,
            nOffsetBottom: 0,
            nHeight: 0,
            nWidth: 0,
            bUseBounce: true,
            bUseHighlight: true,
            sClassPrefix: "scroll_",
            bUseCss3d: jindo.m.useCss3d(true),
            bUseTimingFunction: jindo.m.useTimingFunction(true),
            bAutoResize: false,
            bUseDiagonalTouch: true,
            fEffect: jindo.m.Effect.cubicBezier(0.18, 0.35, 0.56, 1),
            nZIndex: 2000,
            sListElement: "",
            nRatio: 1.5,
            bUseScrollbar: true,
            nScrollbarHideThreshold: 0,
            bUseFixedScrollbar: false,
            sScrollbarBorder: "1px solid white",
            sScrollbarColor: "#8e8e8e",
            bUseScrollBarRadius: true,
            bUsePullDown: false,
            bUsePullUp: false,
            fnPullDownIdle: null,
            fnPullDownBeforeUpdate: null,
            fnPullDownUpdating: null,
            fnPullUpIdle: null,
            fnPullUpBeforeUpdate: null,
            fnPullUpUpdating: null
        });
        this.option(a || {});
        this._initVar();
        this._setWrapperElement(b);
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    $static: {
        SCROLLBAR_CLASS: "__scroll_for_scrollbar__"
    },
    _initVar: function() {
        this.isPositionBug = jindo.m.hasOffsetBug();
        this.isClickBug = jindo.m.hasClickBug();
        this.nVersion = parseFloat(jindo.m.getDeviceInfo().version.substr(0, 3));
        this.sCssPrefix = jindo.m.getCssPrefix();
        this._bUseCss3d = this.option("bUseCss3d");
        this.nWrapperW = null;
        this.nWrapperH = null;
        this.nScrollW = null;
        this.nScrollH = null;
        this.nMaxScrollLeft = null;
        this.nMaxScrollTop = null;
        this.nMinScrollTop = 0;
        this.bUseHScroll = null;
        this.bUseVScroll = null;
        this.bUseHighlight = this.option("bUseHighlight");
        this._nPropHScroll = null;
        this._nPropVScroll = null;
        this._nLeft = 0;
        this._nTop = 0;
        this._aAni = [];
        this._htTimer = {
            ani: -1,
            fixed: -1,
            touch: -1,
            scrollbar: -1
        };
        this._htPlugin = {
            dynamic: {},
            pull: {}
        };
        this._oTouch = null;
        this._isAnimating = false;
        this._isControling = false;
        this._isStop = false;
        this._hasJindoOffsetBug = jindo.m._hasJindoOffsetBug();
        if (this.option("sListElement")) {
            this.option("bUseTimingFunction", false)
        }
        if (this.bUseHighlight) {
            this._hasKitkatHighlightBug = jindo.m._hasKitkatHighlightBug();
            this._nHightlightBug = -1;
            if (this.isPositionBug) {
                this._elDummyTag = null
            }
        }
        this._nUpdater = -1;
        this._oMoveData = {
            nLeft: 0,
            nTop: 0
        }
    },
    getCurrentPos: function() {
        return {
            nTop: this._nTop,
            nLeft: this._nLeft
        }
    },
    setLayer: function(a) {
        this._htWElement.wrapper = jindo.$Element(a);
        this._htWElement.wrapper.css({
            overflow: "hidden",
            zIndex: this.option("nZIndex")
        });
        if (this._htWElement.wrapper.css("position") == "static") {
            this._htWElement.wrapper.css("position", "relative")
        }
        if (!this.bUseHighlight) {
            this._htWElement.wrapper.css(jindo.m._toPrefixStr("TapHighlightColor"), "rgba(0,0,0,0)")
        }
        this.setScroller()
    },
    setScroller: function() {
        this._htWElement.scroller = this._htWElement.wrapper.first();
        this._htWElement.scroller.css({
            position: "absolute",
            zIndex: 1,
            left: 0,
            top: 0
        });
        this._htWElement.scroller.css(jindo.m._toPrefixStr("TransitionProperty"), this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform").css(this.sCssPrefix + "Transform", jindo.m._getTranslate(0, 0, this._bUseCss3d));
        if (this.option("bUseTimingFunction")) {
            this._htWElement.scroller.css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString())
        }
        if (this.isPositionBug && this.bUseHighlight && this.nVersion < 3) {
            this._elDummyTag = this._htWElement.scroller.query("._scroller_dummy_atag_");
            if (!this._elDummyTag) {
                this._elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_scroller_dummy_atag_'></a>");
                this._htWElement.scroller.append(this._elDummyTag)
            } else {
                this._elDummyTag = this._elDummyTag.$value()
            }
        }
    },
    width: function(a) {
        if (a) {
            this.option("nWidth", a);
            this.refresh()
        } else {
            if (this.option("nWidth")) {
                return parseInt(this.option("nWidth"), 10)
            } else {
                return this._htWElement.wrapper.width()
            }
        }
    },
    height: function(a) {
        if (a) {
            this.option("nHeight", a);
            this.refresh()
        } else {
            if (this.option("nHeight")) {
                return parseInt(this.option("nHeight"), 10)
            } else {
                return this._htWElement.wrapper.height()
            }
        }
    },
    _setWrapperElement: function(a) {
        this._htWElement = {};
        this.setLayer(a)
    },
    hasHScroll: function() {
        return this.bUseHScroll
    },
    hasVScroll: function() {
        return this.bUseVScroll
    },
    _createDynamicPlugin: function(a) {
        var b = {
            nRatio: this.option("nRatio"),
            sListElement: this.option("sListElement"),
            sDirection: a
        };
        if (this._inst("dynamic")) {
            this._inst("dynamic").option(b)
        } else {
            this._htPlugin.dynamic.o = new jindo.m.DynamicPlugin(this._htWElement.wrapper, b)
        }
        this._inst("dynamic").refresh(a == "V" ? this._nTop : this._nLeft);
        this.option("bUseTimingFunction", false);
        this._htPlugin.dynamic.bUse = true
    },
    _refreshDynamicPlugin: function() {
        this._htPlugin.dynamic.bUse = false;
        if (this.option("sListElement") && !(this.bUseVScroll && this.bUseHScroll)) {
            var a = this.option("nRatio") * 2;
            if (this.bUseVScroll && (this.nScrollH > (this.nWrapperH * a))) {
                this._createDynamicPlugin("V")
            } else {
                if (this.bUseHScroll && (this.nScrollW > (this.nWrapperW * a))) {
                    this._createDynamicPlugin("H")
                }
            }
        }
    },
    _refreshPullPlugin: function() {
        this._htPlugin.pull.bUse = this.option("bUsePullDown") || this.option("bUsePullUp");
        if (!this._isUse("pull")) {
            return false
        }
        if (!this._inst("pull")) {
            this._htPlugin.pull.o = new jindo.m.PullPlugin(this)
        }
        this._inst("pull").refresh();
        return true
    },
    refresh: function(e) {
        if (!this.isActivating()) {
            return
        }
        this._hasKitkatHighlightBug && this._htWElement.wrapper.addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
        this.option("nWidth") && this._htWElement.wrapper.width(parseInt(this.option("nWidth"), 10));
        this.option("nHeight") && this._htWElement.wrapper.height(parseInt(this.option("nHeight"), 10));
        var d = parseInt(this._htWElement.wrapper.css("border-left-width"), 10),
            a = parseInt(this._htWElement.wrapper.css("border-right-width"), 10),
            c = parseInt(this._htWElement.wrapper.css("border-top-width"), 10),
            b = parseInt(this._htWElement.wrapper.css("border-bottom-width"), 10);
        d = isNaN(d) ? 0 : d;
        a = isNaN(a) ? 0 : a;
        c = isNaN(c) ? 0 : c;
        b = isNaN(b) ? 0 : b;
        this.nWrapperW = this._htWElement.wrapper.width() - d - a;
        this.nWrapperH = this._htWElement.wrapper.height() - c - b;
        if (!this._refreshPullPlugin()) {
            this.nScrollW = this._htWElement.scroller.width();
            this.nScrollH = this._htWElement.scroller.height() - this.option("nOffsetBottom");
            this.nMinScrollTop = -this.option("nOffsetTop");
            this.nMaxScrollTop = this.nWrapperH - this.nScrollH
        }
        this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;
        this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW <= this.nScrollW);
        this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH <= this.nScrollH);
        if (this.bUseHScroll && !this.bUseVScroll) {
            this._htWElement.scroller.$value().style.height = "100%"
        }
        if (!this.bUseHScroll && this.bUseVScroll) {
            this._htWElement.scroller.$value().style.width = "100%"
        }
        this._refreshDynamicPlugin();
        if (this.option("bUseScrollbar")) {
            this._refreshScroll("V");
            this._refreshScroll("H")
        }(!this.bUseHScroll && !this.bUseVScroll) && this._fixPositionBug();
        (!e) && this.restorePos(0)
    },
    _setPos: function(d, c) {
        var b;
        d = this.bUseHScroll ? parseInt(d, 10) : 0;
        c = this.bUseVScroll ? parseInt(c, 10) : 0;
        this._isUse("dynamic") && (b = this._checkDirection(d, c));
        var e = {
            nLeft: this._nLeft,
            nTop: this._nTop,
            nNextLeft: d,
            nNextTop: c,
            nVectorX: d - this._nLeft,
            nVectorY: c - this._nTop,
            nMaxScrollLeft: this.nMaxScrollLeft,
            nMaxScrollTop: this.nMaxScrollTop
        };
        if (this.fireEvent("beforePosition", e)) {
            this._isControling = true;
            this._nLeft = d = e.nNextLeft;
            this._nTop = c = e.nNextTop;
            this._isUse("dynamic") && this._inst("dynamic").updateListStatus(b, this.bUseVScroll ? this._nTop : this._nLeft);
            if (this.bUseHighlight && this.isPositionBug) {
                var a = this.getStyleOffset(this._htWElement.scroller);
                d -= a.left;
                c -= a.top
            }
            this._htWElement.scroller.css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(d + "px", c + "px", this._bUseCss3d));
            if (this.option("bUseScrollbar")) {
                this._setScrollBarPos("V", this._nTop);
                this._setScrollBarPos("H", this._nLeft)
            }
            this._oMoveData = {
                nLeft: this._nLeft,
                nTop: this._nTop
            };
            this.fireEvent("position", {
                nLeft: this._nLeft,
                nTop: this._nTop,
                nMaxScrollLeft: this.nMaxScrollLeft,
                nMaxScrollTop: this.nMaxScrollTop
            })
        } else {
            this._isAnimating = false
        }
    },
    _isUse: function(a) {
        return this._htPlugin[a].bUse
    },
    _inst: function(a) {
        return this._htPlugin[a].o
    },
    _checkDirection: function(e, d) {
        var b = this.bUseVScroll ? this._nTop : this._nLeft,
            c = this.bUseVScroll ? d : e,
            a;
        if (b > c) {
            a = "forward"
        } else {
            a = "backward"
        }
        return a
    },
    restorePos: function(c) {
        var b = this.getPosLeft(this._nLeft),
            a = this.getPosTop(this._nTop);
        if (b === this._nLeft && a === this._nTop) {
            this._isControling = false;
            this._isStop = false;
            this._fireAfterScroll();
            this._fixPositionBug();
            return
        } else {
            this._scrollTo(b, a, c)
        }
    },
    _getMomentum: function(c, g, f, h, i, d) {
        var j = this.option("nDeceleration"),
            a = f / j,
            e = 0,
            b = 0;
        if (c < 0 && a > i) {
            b = h / (6 / (a / g * j));
            i = i + b;
            g = g * i / a;
            a = i
        } else {
            if (c > 0 && a > d) {
                b = h / (6 / (a / g * j));
                d = d + b;
                g = g * d / a;
                a = d
            }
        }
        a = a * (c > 0 ? -1 : 1);
        e = g / j;
        return {
            nDist: a,
            nTime: Math.round(e)
        }
    },
    _stop: function() {
        if (this.option("bUseTimingFunction")) {
            jindo.m.detachTransitionEnd(this._htWElement.scroller.$value(), this._htEvent.TransitionEnd);
            this._transitionTime(0)
        } else {
            cancelAnimationFrame(this._htTimer.ani);
            this._stopUpdater()
        }
        if (this._isAnimating) {
            this._setPos(this._nLeft, this._nTop)
        }
        this._aAni = [];
        this._isAnimating = false;
        this._isStop = true
    },
    _scrollTo: function(b, a, c) {
        this._stop();
        b = this.bUseHScroll ? b : 0;
        a = this.bUseVScroll ? a : 0;
        this._aAni.push({
            nLeft: b,
            nTop: a,
            nDuration: c || 0
        });
        this._animate()
    },
    scrollTo: function(b, a, c) {
        c = c || 0;
        b = -Math.abs(b);
        a = -Math.abs(a);
        a += this.getTop();
        this._scrollTo((b >= this.getLeft() ? this.getLeft() : (b <= this.getRight() ? this.getRight() : b)), (a >= this.getTop() ? this.getTop() : (a <= this.getBottom() ? this.getBottom() : a)), c)
    },
    getRight: function() {
        return this.nMaxScrollLeft
    },
    getLeft: function() {
        return 0
    },
    getBottom: function() {
        return this.nMaxScrollTop
    },
    getTop: function() {
        return this.nMinScrollTop
    },
    isMoving: function() {
        return this._isControling
    },
    _animate: function() {
        var b = this,
            g;
        if (this._isAnimating) {
            return
        }
        if (!this._aAni.length) {
            this.restorePos(300);
            return
        }
        do {
            g = this._aAni.shift();
            if (!g) {
                return
            }
        } while (g.nLeft == this._nLeft && g.nTop == this._nTop);
        if (g.nDuration == 0) {
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(0)
            }
            this._setPos(g.nLeft, g.nTop);
            this._animate()
        } else {
            this._isAnimating = true;
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(g.nDuration);
                this._setPos(g.nLeft, g.nTop);
                this._isAnimating = false;
                jindo.m.attachTransitionEnd(this._htWElement.scroller.$value(), this._htEvent.TransitionEnd)
            } else {
                b._startUpdater();
                var e = (new Date()).getTime(),
                    f = this.bUseHScroll ? this.option("fEffect")(this._nLeft, g.nLeft) : null,
                    d = this.bUseVScroll ? this.option("fEffect")(this._nTop, g.nTop) : null,
                    c;
                (function a() {
                    c = (new Date()).getTime();
                    if (c >= e + g.nDuration) {
                        b._stopUpdater();
                        b._setPos(g.nLeft, g.nTop);
                        b._isAnimating = false;
                        b._animate();
                        return
                    }
                    c = (c - e) / g.nDuration;
                    b._oMoveData = {
                        nLeft: f && f(c),
                        nTop: d && d(c)
                    };
                    if (b._isAnimating) {
                        b._htTimer.ani = requestAnimationFrame(a)
                    } else {
                        b._stopUpdater()
                    }
                })()
            }
        }
    },
    _onRotate: function(a) {
        if (this.fireEvent("rotate", {
                isVertical: a.isVertical
            })) {
            this.refresh()
        }
    },
    _transitionTime: function(a) {
        a += "ms";
        this._htWElement.scroller.css(jindo.m._toPrefixStr("TransitionDuration"), a);
        if (this.option("bUseScrollbar")) {
            this._setScrollbarDuration(a)
        }
    },
    _setScrollbarDuration: function(a) {
        if (this.bUseHScroll && this._htWElement.HscrollbarIndicator) {
            this._htWElement.HscrollbarIndicator.css(jindo.m._toPrefixStr("TransitionDuration"), a)
        }
        if (this.bUseVScroll && this._htWElement.VscrollbarIndicator) {
            this._htWElement.VscrollbarIndicator.css(jindo.m._toPrefixStr("TransitionDuration"), a)
        }
    },
    _stopScroll: function() {
        var a = jindo.m.getTranslateOffset(this._htWElement.scroller.$value()),
            b = {
                left: 0,
                top: 0
            },
            c, d;
        if (this.isPositionBug && this.bUseHighlight) {
            b = this.getStyleOffset(this._htWElement.scroller)
        }
        d = a.left + b.left;
        c = a.top + b.top;
        if (!this.option("bUseFixedScrollbar")) {
            this._hideScrollBar("V");
            this._hideScrollBar("H")
        }
        this._stopUpdater();
        this._stop();
        this._setPos(this.getPosLeft(d), this.getPosTop(c));
        this._isControling = false;
        this._fireAfterScroll();
        this._fixPositionBug()
    },
    getStyleOffset: function(a) {
        var c = parseInt(a.css("left"), 10),
            b = parseInt(a.css("top"), 10);
        c = isNaN(c) ? 0 : c;
        b = isNaN(b) ? 0 : b;
        return {
            left: c,
            top: b
        }
    },
    getPosLeft: function(a) {
        if (this.bUseHScroll) {
            return (a >= 0 ? 0 : (a <= this.nMaxScrollLeft ? this.nMaxScrollLeft : a))
        } else {
            return 0
        }
    },
    getPosTop: function(a) {
        if (this.bUseVScroll) {
            return (a >= this.nMinScrollTop ? this.nMinScrollTop : (a <= this.nMaxScrollTop ? this.nMaxScrollTop : a))
        } else {
            return 0
        }
    },
    _hideScrollBar: function(b) {
        if (!this._htWElement) {
            return
        }
        var a = this._htWElement[b + "scrollbar"],
            c = (b === "H" ? this.bUseHScroll : this.bUseVScroll);
        if (c && a) {
            a.hide();
            a.$value().offsetHeight;
            if (this.isPositionBug && this.bUseHighlight) {
                this.makeStylePos(this._htWElement[b + "scrollbarIndicator"])
            }
        }
    },
    _fireAfterScroll: function() {
        if (this.option("bUseScrollbar")) {
            var a = this;
            this._htTimer.scrollbar = setTimeout(function() {
                if (!a.option("bUseFixedScrollbar")) {
                    a._hideScrollBar("V");
                    a._hideScrollBar("H")
                }
            }, this.option("nScrollbarHideThreshold"))
        }
        this._fireEvent("afterScroll")
    },
    _fireEvent: function(a) {
        return this.fireEvent(a, this._getNowPosition())
    },
    _fireTouchEvent: function(b, a) {
        return this.fireEvent(b, this._getNowPosition(a))
    },
    _getNowPosition: function(a) {
        return {
            nLeft: this._nLeft,
            nTop: this._nTop,
            nMaxScrollLeft: this.nMaxScrollLeft,
            nMaxScrollTop: this.nMaxScrollTop,
            oEvent: a || {}
        }
    },
    setUsePullDown: function(a) {
        if (this._isUse("pull")) {
            this.option("bUsePullDown", a);
            this.refresh()
        }
    },
    setUsePullUp: function(a) {
        if (this._isUse("pull")) {
            this.option("bUsePullUp", a);
            this.refresh()
        }
    },
    _onUpdater: function(a) {
        if (this._oMoveData.nLeft != this._nLeft || this._oMoveData.nTop != this._nTop) {
            this._setPos(this._oMoveData.nLeft, this._oMoveData.nTop)
        }
        this._startUpdater()
    },
    _startUpdater: function() {
        this._stopUpdater();
        this._nUpdater = window.requestAnimationFrame(this._htEvent.updater)
    },
    _stopUpdater: function() {
        window.cancelAnimationFrame(this._nUpdater);
        this._nUpdater = -1
    },
    _onStart: function(a) {
        this._clearPositionBug();
        this._isStop = false;
        if (this._fireTouchEvent("beforeTouchStart", a)) {
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(0)
            }
            this._isAnimating && this._stopScroll() && (this._isAnimating = false);
            this._isControling = true;
            if (!this._fireTouchEvent("touchStart", a)) {
                a.stop()
            }
        } else {
            a.stop()
        }
    },
    _onMove: function(d) {
        var e = 0,
            c = 0;
        this._clearTouchEnd();
        this._clearPositionBug();
        this.isClickBug && this._htWElement.scroller.css("pointerEvents", "none");
        if (this._fireTouchEvent("beforeTouchMove", d)) {
            if (this._isUse("pull")) {
                this._inst("pull").touchMoveForUpdate(d, this.nMaxScrollTop)
            }
            var b = d.oEvent;
            if (d.sMoveType === jindo.m.MOVETYPE[0]) {
                if (this.bUseHScroll) {
                    if (!this.option("bUseBounce") && ((this._nLeft >= 0 && d.nVectorX > 0) || (this._nLeft <= this.nMaxScrollLeft && d.nVectorX < 0))) {
                        this._forceRestore(d);
                        return
                    } else {
                        b.stop(jindo.$Event.CANCEL_ALL)
                    }
                } else {
                    return true
                }
            } else {
                if (d.sMoveType === jindo.m.MOVETYPE[1]) {
                    if (this.bUseVScroll) {
                        if (!this.option("bUseBounce") && ((this._nTop >= this.nMinScrollTop && d.nVectorY > 0) || (this._nTop <= this.nMaxScrollTop && d.nVectorY < 0))) {
                            this._forceRestore(d);
                            return
                        } else {
                            b.stop(jindo.$Event.CANCEL_ALL)
                        }
                    } else {
                        return true
                    }
                } else {
                    if (d.sMoveType === jindo.m.MOVETYPE[2]) {
                        if (this.option("bUseDiagonalTouch")) {
                            b.stop(jindo.$Event.CANCEL_ALL)
                        } else {
                            return
                        }
                    } else {
                        b.stop(jindo.$Event.CANCEL_ALL);
                        return true
                    }
                }
            }
            if (this.option("bUseBounce")) {
                if (this.bUseHScroll) {
                    e = this._nLeft + (this._nLeft >= 0 || this._nLeft <= this.nMaxScrollLeft ? d.nVectorX / 2 : d.nVectorX)
                }
                if (this.bUseVScroll) {
                    c = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? d.nVectorY / 2 : d.nVectorY)
                }
                var a = this;
                this._htTimer.touch = setTimeout(function() {
                    a._forceRestore(d)
                }, 500)
            } else {
                e = this.getPosLeft(this._nLeft + d.nVectorX);
                c = this.getPosTop(this._nTop + d.nVectorY)
            }
            this._setPos(e, c);
            if (!this._fireTouchEvent("touchMove", d)) {
                d.stop()
            }
        } else {
            d.stop()
        }
    },
    _onEnd: function(a) {
        if (this._isUse("pull")) {
            this._inst("pull").pullUploading()
        }
        if (this._fireTouchEvent("beforeTouchEnd", a)) {
            this._clearPositionBug();
            this._clearTouchEnd();
            if (a.sMoveType === jindo.m.MOVETYPE[0] || a.sMoveType === jindo.m.MOVETYPE[1] || a.sMoveType === jindo.m.MOVETYPE[2]) {
                this._endForScroll(a);
                if (this.nVersion < 4.1) {
                    a.oEvent.stop(jindo.$Event.CANCEL_DEFAULT)
                }
            } else {
                this._isControling = false;
                if (!this._isStop) {
                    this._tapHighlight()
                }
            }
            if (!this._fireTouchEvent("touchEnd", a)) {
                a.stop()
            }
        } else {
            a.stop()
        }
        this.isClickBug && this._htWElement.scroller.css("pointerEvents", "auto")
    },
    _tapHighlight: function() {
        if (this._hasKitkatHighlightBug) {
            this._htWElement.wrapper.removeClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
            this._htWElement.wrapper._element.clientHeight;
            var a = this;
            clearTimeout(this._nHightlightBug);
            this._nHightlightBug = setTimeout(function() {
                a._htWElement.wrapper.addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS)
            }, 200)
        }
    },
    _forceRestore: function(a) {
        a.nMomentumX = a.nMomentumY = null;
        this._endForScroll(a);
        this._clearPositionBug();
        this._clearTouchEnd()
    },
    _endForScroll: function(c) {
        clearTimeout(this._nFixedDubbleEndBugTimer);
        var b = {
                nDist: 0,
                nTime: 0
            },
            a = {
                nDist: 0,
                nTime: 0
            },
            d = {
                nMomentumX: c.nMomentumX,
                nMomentumY: c.nMomentumY,
                nDistanceX: c.nDistanceX,
                nDistanceY: c.nDistanceY,
                nLeft: this._nLeft,
                nTop: this._nTop,
                nMaxScrollLeft: this.nMaxScrollLeft,
                nMaxScrollTop: this.nMaxScrollTop
            };
        if (this.option("bUseMomentum") && (c.nMomentumX || c.nMomentumY)) {
            if (this.bUseHScroll) {
                b = this._getMomentum(-c.nDistanceX, c.nSpeedX, c.nMomentumX, this.nWrapperW, -this._nLeft, -this.nMaxScrollLeft + this._nLeft)
            }
            if (this.bUseVScroll) {
                a = this._getMomentum(-c.nDistanceY, c.nSpeedY, c.nMomentumY, this.nWrapperH, -this._nTop, -this.nMaxScrollTop + this._nTop)
            }
            d.nNextLeft = this._nLeft + b.nDist;
            d.nNextTop = this._nTop + a.nDist;
            d.nTime = Math.max(Math.max(b.nTime, a.nTime), 10);
            if (this.fireEvent("beforeScroll", d)) {
                if (this.option("bUseBounce")) {
                    this._scrollTo(d.nNextLeft, d.nNextTop, d.nTime)
                } else {
                    this._scrollTo(this.getPosLeft(d.nNextLeft), this.getPosTop(d.nNextTop), d.nTime)
                }
            }
        } else {
            d.nNextLeft = this._nLeft;
            d.nNextTop = this._nTop;
            d.nTime = 0;
            if (this.fireEvent("beforeScroll", d)) {
                if (this._nLeft !== d.nNextLeft || this._nTop !== d.nNextTop) {
                    this._scrollTo(d.nNextLeft, d.nNextTop, d.nTime)
                } else {
                    this.restorePos(300)
                }
            }
        }
    },
    _onTransitionEnd: function(a) {
        jindo.m.detachTransitionEnd(this._htWElement.scroller.$value(), this._htEvent.TransitionEnd);
        this._animate()
    },
    _onDocumentStart: function(a) {
        if (this._htWElement.wrapper.visible()) {
            if (this._htWElement.wrapper.isChildOf(a.element)) {
                return true
            } else {
                if (this._isAnimating && this._isControling) {
                    this._stopScroll()
                }
            }
        }
    },
    _onActivate: function() {
        if (!this._oTouch) {
            this._oTouch = new jindo.m.Touch(this._htWElement.wrapper.$value(), {
                nMoveThreshold: 0,
                nMomentumDuration: (jindo.m.getDeviceInfo().android ? 500 : 200),
                nUseDiagonal: 0,
                nTapThreshold: 1,
                nSlopeThreshold: 5,
                nEndEventThreshold: (jindo.m.getDeviceInfo().win8 ? 100 : 0),
                bHorizental: this.option("bUseHScroll"),
                bVertical: this.option("bUseVScroll")
            })
        } else {
            this._oTouch.activate()
        }
        this._attachEvent();
        this.refresh()
    },
    _onDeactivate: function() {
        this._detachEvent();
        this._oTouch.deactivate()
    },
    _attachEvent: function() {
        this._htEvent = {};
        this._htEvent.touchStart = jindo.$Fn(this._onStart, this).bind();
        this._htEvent.touchMove = jindo.$Fn(this._onMove, this).bind();
        this._htEvent.touchEnd = jindo.$Fn(this._onEnd, this).bind();
        this._htEvent.TransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
        this._htEvent.document = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
        this._oTouch.attach({
            touchStart: this._htEvent.touchStart,
            touchMove: this._htEvent.touchMove,
            touchEnd: this._htEvent.touchEnd
        });
        if (this.option("bAutoResize")) {
            this._htEvent.rotate = jindo.$Fn(this._onRotate, this).bind();
            jindo.m.bindRotate(this._htEvent.rotate)
        }
        if (!this.option("bUseTimingFunction")) {
            this._htEvent.updater = jindo.$Fn(this._onUpdater, this).bind()
        }
    },
    _fixPositionBug: function() {
        if (this.isPositionBug && this.bUseHighlight) {
            var a = this;
            this._clearPositionBug();
            this._htTimer.fixed = setTimeout(function() {
                if (a._htWElement && a._htWElement.scroller) {
                    a.makeStylePos(a._htWElement.scroller);
                    if (a.nVersion <= 3) {
                        a._elDummyTag.focus()
                    }
                }
            }, 200)
        }
    },
    makeStylePos: function(b) {
        var c = b.$value();
        var a = jindo.m.getTranslateOffset(c);
        var d = b.offset();
        if (this.nVersion >= 4) {
            c.style[jindo.m._toPrefixStr("Transform")] = jindo.m._getTranslate(0, 0, this._bUseCss3d)
        } else {
            c.style[jindo.m._toPrefixStr("Transform")] = null
        }
        c.style[jindo.m._toPrefixStr("TransitionDuration")] = null;
        if (this._hasJindoOffsetBug) {
            b.offset(a.top + d.top, a.left + d.left)
        } else {
            b.offset(d.top, d.left)
        }
    },
    _clearPositionBug: function() {
        if (this.isPositionBug && this.bUseHighlight) {
            clearTimeout(this._htTimer.fixed);
            this._htTimer.fixed = -1
        }
    },
    _clearTouchEnd: function() {
        clearTimeout(this._htTimer.touch);
        this._htTimer.touch = -1
    },
    _detachEvent: function() {
        jindo.m.detachTransitionEnd(this._htWElement.scroller.$value(), this._htEvent.TransitionEnd);
        this._htEvent.document.detach(document, "touchstart");
        if (this.option("bAutoResize")) {
            jindo.m.unbindRotate(this._htEvent.rotate)
        }
        this._oTouch.detachAll();
        if (this._elDummyTag) {
            this._htWElement.scroller.remove(this._elDummyTag)
        }
        if (!this.option("bUseTimingFunction")) {
            this._stopUpdater()
        }
    },
    _createScroll: function(a) {
        if (!(a === "H" ? this.bUseHScroll : this.bUseVScroll)) {
            return
        }
        var c = this._htWElement.wrapper,
            d = jindo.$Element(c.query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
            b;
        if (d) {
            c.remove(d);
            d = this._htWElement[a + "scrollbar"] = this._htWElement[a + "scrollbarIndicator"] = null
        }
        d = this._createScrollbar(a);
        b = this._createScrollbarIndicator(a);
        this._htWElement[a + "scrollbar"] = d;
        this._htWElement[a + "scrollbarIndicator"] = b;
        d.append(b);
        c.append(d)
    },
    _createScrollbar: function(a) {
        var b = jindo.$Element("<div class='" + jindo.m.Scroll.SCROLLBAR_CLASS + "'>");
        b.css({
            position: "absolute",
            zIndex: 100,
            bottom: (a === "H" ? "1px" : (this.bUseHScroll ? "7" : "2") + "px"),
            right: (a === "H" ? (this.bUseVScroll ? "7" : "2") + "px" : "1px"),
            pointerEvents: "none"
        });
        if (this.option("bUseFixedScrollbar")) {
            b.show()
        } else {
            b.hide()
        }
        if (a === "H") {
            b.css({
                height: "5px",
                left: "2px"
            })
        } else {
            b.css({
                width: "5px",
                top: "2px"
            })
        }
        return b
    },
    _createScrollbarIndicator: function(a) {
        var b = jindo.$Element("<div>").css({
            position: "absolute",
            zIndex: 100,
            border: this.option("sScrollbarBorder"),
            pointerEvents: "none",
            left: 0,
            top: 0,
            backgroundColor: this.option("sScrollbarColor")
        });
        if (jindo.m.getOsInfo().ios && this.option("bUseScrollBarRadius")) {
            b.css(jindo.m._toPrefixStr("BorderRadius"), "12px")
        }
        b.css(jindo.m._toPrefixStr("TransitionProperty"), this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform").css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(0, 0, this._bUseCss3d));
        if (this.option("bUseTimingFunction")) {
            b.css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString())
        }
        if (a === "H") {
            b.height(5)
        } else {
            b.width(5)
        }
        return b
    },
    _refreshScroll: function(b) {
        if (b === "H") {
            if (!this.bUseHScroll || this.nWrapperW == this.nScrollW) {
                return
            }
        } else {
            if (!this.bUseVScroll || this.nWrapperH == this.nScrollH) {
                return
            }
        }
        if (!this._htWElement[b + "scrollbar"]) {
            this._createScroll(b)
        }
        var d = this._htWElement[b + "scrollbar"],
            c = this._htWElement[b + "scrollbarIndicator"],
            a = 0;
        if (b === "H") {
            a = Math.max(Math.round(Math.pow(this.nWrapperW, 2) / this.nScrollW), 8);
            this._nPropHScroll = (this.nWrapperW - a) / this.nMaxScrollLeft;
            d.width(this.nWrapperW);
            c.width(isNaN(a) ? 0 : a)
        } else {
            a = Math.max(Math.round(Math.pow(this.nWrapperH, 2) / this.nScrollH), 8);
            this._nPropVScroll = (this.nWrapperH - a) / this.nMaxScrollTop;
            d.height(this.nWrapperH);
            c.height(isNaN(a) ? 0 : a)
        }
    },
    _setScrollBarPos: function(a, c) {
        if (!(a === "H" ? this.bUseHScroll : this.bUseVScroll)) {
            return
        }
        var b = this._htWElement[a + "scrollbarIndicator"],
            e = this._htWElement[a + "scrollbar"];
        if (!b || !e) {
            return
        }
        c = this["_nProp" + a + "Scroll"] * c;
        if (!this.option("bUseFixedScrollbar") && e && !e.visible()) {
            e.show();
            if (this.option("bUseTimingFunction")) {
                e.$value().clientHeight
            }
        }
        if (b) {
            if (this.isPositionBug && this.bUseHighlight) {
                var d = parseInt((a === "H" ? b.css("left") : b.css("top")), 10);
                c -= isNaN(d) ? 0 : d
            }
            b.css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(a == "H" ? c + "px" : 0, a == "H" ? 0 : c + "px", this._bUseCss3d))
        }
    },
    destroy: function() {
        this.deactivate();
        this.detachAll();
        for (var a in this._htWElement) {
            this._htWElement[a] = null
        }
        this._htWElement = null;
        this._oTouch.destroy();
        delete this._oTouch
    }
}).extend(jindo.m.UIComponent);
jindo.m.PullPlugin = jindo.$Class({
    $init: function(a) {
        this.option(a.option());
        this._initVar(a);
        this._initPullDownFunc();
        this._initPullUpFunc()
    },
    _initVar: function(a) {
        this._oParent = a;
        this._htWElement = a._htWElement;
        this._isPullDown = false;
        this._isPullUp = false;
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;
        this._htWElement.pullDown = jindo.$Element(this._htWElement.wrapper.query("." + this.option("sClassPrefix") + "pullDown"));
        this._htWElement.pullUp = jindo.$Element(this._htWElement.wrapper.query("." + this.option("sClassPrefix") + "pullUp"))
    },
    refresh: function() {
        this.option(this._oParent.option());
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;
        this._isPullDown = this.option("bUsePullDown") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement.pullDown !== null);
        this._isPullUp = this.option("bUsePullUp") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement.pullUp !== null);
        if (this._isPullDown && this.option("fnPullDownIdle")) {
            this._htWElement.pullDown._isReady_ = false;
            this._htWElement.pullDown.show();
            this.option("fnPullDownIdle")(this._htWElement.pullDown)
        }
        if (this._isPullUp && this.option("fnPullUpIdle")) {
            this._htWElement.pullUp._isReady_ = false;
            this._htWElement.pullUp.show();
            this.option("fnPullUpIdle")(this._htWElement.pullUp)
        }
        if (!this.option("bUseVScroll")) {
            if (this._htWElement.pullDown !== null) {
                this._htWElement.pullDown.hide()
            }
            if (this._htWElement.pullUp !== null) {
                this._htWElement.pullUp.hide()
            }
        }
        this._oParent.nScrollW = this._htWElement.scroller.width();
        this._oParent.nScrollH = this._htWElement.scroller.height() - this._getBottomMargin();
        this._oParent.nMinScrollTop = -this._getTopMargin();
        this._oParent.nMaxScrollTop = this._oParent.nWrapperH - this._oParent.nScrollH
    },
    _getTopMargin: function() {
        return (this._isPullDown ? this._htWElement.pullDown.height() : 0) + this.option("nOffsetTop")
    },
    _getBottomMargin: function() {
        return (this._isPullUp ? this._htWElement.pullUp.height() : 0) + this.option("nOffsetBottom")
    },
    _initPullDownFunc: function() {
        if (this.option("bUsePullDown") === true) {
            if (!this.option("fnPullDownIdle")) {
                this.option("fnPullDownIdle", function(a) {
                    a.html("업데이트하시려면 아래로 내려주세요")
                })
            }
            if (!this.option("fnPullDownBeforeUpdate")) {
                this.option("fnPullDownBeforeUpdate", function(a) {
                    a.html("업데이트 합니다")
                })
            }
            if (!this.option("fnPullDownUpdating")) {
                this.option("fnPullDownUpdating", function(a) {
                    a.html("업데이트 중입니다...")
                })
            }
        }
    },
    _initPullUpFunc: function() {
        if (this.option("bUsePullUp") === true) {
            if (!this.option("fnPullUpIdle")) {
                this.option("fnPullUpIdle", function(a) {
                    a.html("더 보시려면 위로 올려주세요")
                })
            }
            if (!this.option("fnPullUpBeforeUpdate")) {
                this.option("fnPullUpBeforeUpdate", function(a) {
                    a.html("로드 합니다")
                })
            }
            if (!this.option("fnPullUpUpdating")) {
                this.option("fnPullUpUpdating", function(a) {
                    a.html("로드 중...")
                })
            }
        }
    },
    touchMoveForUpdate: function(c, a) {
        if (this._isUpdating) {
            return
        }
        var b = this._getTopMargin(),
            d = this._getBottomMargin();
        a = this._nOrgMaxScrollTop || a;
        if (this._isPullDown) {
            if (this._htWElement.pullDown._isReady_) {
                if (b > this._oParent._nTop) {
                    this._htWElement.pullDown._isReady_ = false;
                    if (this.option("fnPullDownIdle")) {
                        this.option("fnPullDownIdle")(this._htWElement.pullDown);
                        this._oParent.nMinScrollTop = -b
                    }
                }
            } else {
                if (this._oParent._nTop > b) {
                    this._htWElement.pullDown._isReady_ = true;
                    if (this.option("fnPullDownBeforeUpdate")) {
                        this.option("fnPullDownBeforeUpdate")(this._htWElement.pullDown);
                        this._oParent.nMinScrollTop = 0
                    }
                }
            }
        }
        if (this._isPullUp) {
            if (this._htWElement.pullUp._isReady_) {
                if (this._oParent._nTop >= (a - d)) {
                    this._htWElement.pullUp._isReady_ = false;
                    if (this.option("fnPullUpIdle")) {
                        this.option("fnPullUpIdle")(this._htWElement.pullUp);
                        this._oParent.nMaxScrollTop = a
                    }
                }
            } else {
                if (this._oParent._nTop < (this._oParent.nMaxScrollTop - d)) {
                    this._htWElement.pullUp._isReady_ = true;
                    if (this.option("fnPullUpBeforeUpdate")) {
                        this.option("fnPullUpBeforeUpdate")(this._htWElement.pullUp);
                        this._nOrgMaxScrollTop = a;
                        this._oParent.nMaxScrollTop = a - d
                    }
                }
            }
        }
    },
    pullUploading: function() {
        var d = null,
            b = null;
        if (this._isPullDown && this._htWElement.pullDown._isReady_) {
            b = this._htWElement.pullDown;
            d = d || false
        }
        if (this._isPullUp && this._htWElement.pullUp._isReady_) {
            b = this._htWElement.pullUp;
            d = d || true
        }
        if (!b) {
            return false
        }
        var c = d ? this.option("fnPullUpUpdating") : this.option("fnPullDownUpdating"),
            a = this;
        this._isUpdating = true;
        b._isReady_ = false;
        if (c) {
            setTimeout(function() {
                c(b);
                if (d) {
                    a._fireEventPullUp()
                } else {
                    a._fireEventPullDown()
                }
            }, 0)
        }
    },
    _fireEventPullDown: function() {
        if (!this._htWElement) {
            return
        }
        this._oParent.fireEvent("pullDown", {
            welElement: this._htWElement.pullDown,
            oScroll: this._oParent
        })
    },
    _fireEventPullUp: function() {
        if (!this._htWElement) {
            return
        }
        this._oParent.fireEvent("pullUp", {
            welElement: this._htWElement.pullUp,
            oScroll: this._oParent
        })
    }
}).extend(jindo.m.Component);
jindo.m.RadioButton = jindo.$Class({
    $init: function(a, b) {
        this.option({
            sClassPrefix: "frb-",
            sType: "v",
            bActivateOnload: true,
            sUncheckBgColor: "transparent"
        });
        this.option(b || {});
        this._initVar();
        this._setWrapperElement(a, this.option("sClassPrefix"));
        this._initRadioLoad();
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    _initVar: function() {
        this.$super._initVar("radio", "radiobtn");
        this._nPreSelectIdx = -1
    },
    _initRadioLoad: function() {
        var b = this._aWElFormList;
        for (var a = 0; a < b.length; a++) {
            if (b[a].$value().checked) {
                this._setChecked(a);
                break
            }
        }
    },
    _afterCheck: function(c, b) {
        var a = -1;
        a = this._htWElement.container.indexOf(c);
        this._setChecked(a)
    },
    _onFormClick: function(c) {
        var a = this._sUnitClass;
        var e = jindo.$Element(c.element);
        e = e.parent(function(f) {
            return f.hasClass(a)
        })[0];
        var b = e.attr("data-cb-checked");
        c.element.checked = (b && b == "on") ? true : false;
        var d = this._htWElement.container.indexOf(e);
        if (c.element.checked) {
            if (this._nPreSelectIdx != d) {
                this._onCheck(c)
            }
        }
    },
    _setChecked: function(d) {
        var e = this._aWElFormList[d].$value();
        var a = this._aWElUnitList[d];
        if (e.disabled) {
            return false
        }
        var c = this.option("sCheckBgColor");
        var b = null;
        var f = null;
        if (this._nPreSelectIdx > -1) {
            c = (c) ? this.option("sUncheckBgColor") : null;
            b = this._aWElUnitList[this._nPreSelectIdx].$value();
            f = this._aWElFormList[this._nPreSelectIdx].$value();
            this._aWElUnitList[this._nPreSelectIdx].removeClass(this._sOnClass);
            f.checked = false;
            if (c) {
                this._aWElUnitList[this._nPreSelectIdx].css("backgroundColor", c + " !important")
            }
        }
        a.addClass(this._sOnClass);
        a.attr("data-cb-checked", "on");
        e.checked = true;
        c = this.option("sCheckBgColor");
        if (c) {
            a.css("backgroundColor", c + " !important")
        }
        this._nPreSelectIdx = d;
        this.fireEvent("checked", {
            elPreRadioButtonUnit: b,
            elPreRadioButton: f,
            elRadioButtonUnit: a.$value(),
            elRadioButton: e
        })
    },
    getCheckedValue: function() {
        var a = "";
        if (this._nPreSelectIdx > -1) {
            if (!this._aWElFormList[this._nPreSelectIdx].$value().disabled) {
                a = this._aWElFormList[this._nPreSelectIdx].$value().value
            }
        }
        return a
    },
    setCheckedButton: function(a) {
        var b = this._getFormIdx(a);
        if (b.length > 0) {
            this._setChecked(b[0])
        }
    },
    enable: function(a) {
        var b = this._useSettingForm(a, true);
        this.fireEvent("enable", {
            aRadioButtonList: b.aFormList,
            aRadioButtonUnitList: b.aUnitList
        })
    },
    disable: function(a) {
        var b = this._useSettingForm(a, false);
        this.fireEvent("disable", {
            aRadioButtonList: b.aFormList,
            aRadioButtonUnitList: b.aUnitList
        })
    },
    getElementByIndex: function(a) {
        return {
            elRadioButton: this._aWElFormList[a].$value(),
            elRadioButtonUnit: this._aWElUnitList[a].$value()
        }
    },
    destroy: function() {
        this.$super.destroy()
    }
}).extend(jindo.m.CheckRadioCore);
jindo.m.Slide = jindo.$Class({
    $init: function(a) {
        this.option({});
        this.option(a || {})
    },
    setStyle: function(b) {
        var a = {};
        a[this.p("TransitionProperty")] = this.sCssPrefix == "" ? "tranform" : "-" + this.sCssPrefix + "-transform";
        a[this.p("TransitionDuration")] = "0ms";
        a[this.p("Transform")] = this.getTranslate(0, 0);
        this._welTarget = b[0].css(a);
        this.fireEvent("set", {
            css: a
        });
        return a
    },
    move: function(g, e, f, d) {
        d = d || {};
        var c = this.getTarget(true),
            a;
        if (d.useCircular) {
            if (this.option("bUseH")) {
                g = this._getPos(g, d)
            } else {
                e = this._getPos(e, d)
            }
        } else {
            if (this.option("bHasOffsetBug")) {
                var b = jindo.m.getStyleOffset(c);
                g -= b.left;
                e -= b.top
            }
        }
        a = {
            "@transitionProperty": this.sCssPrefix == "" ? "tranform" : "-" + this.sCssPrefix + "-transform",
            "@transform": this.getTranslate(g + "px", e + "px")
        };
        if (!!f) {
            this._oMorph.pushAnimate(f, [c, a])
        } else {
            c.css(this.toCss(a))
        }
        return this._oMorph
    },
    _getPos: function(c, b) {
        var f = c,
            d = b.next,
            e = b.range;
        if (b.restore) {
            f = 0
        } else {
            if (b.duration != 0 && c % e === 0) {
                f = d ? -e : e
            } else {
                if (typeof b.startIndex != "undefined") {
                    var a = parseInt(f / e, 10) * -1;
                    if (a == b.startIndex || a > b.startIndex) {
                        d = true
                    } else {
                        d = false
                    }
                    f = (f % e) + ((d ? -1 : 1) * (Math.abs(a - b.startIndex) * e))
                } else {
                    f = (f % e) + (d ? 0 : 2 * e);
                    f %= e
                }
            }
        }
        return f
    }
}).extend(jindo.m.Animation);
jindo.m.SlideFlicking = jindo.$Class({
    $init: function(b, a) {
        this.option(a || {});
        this._initVar();
        this._oDocFragment = document.createDocumentFragment();
        this._setWrapperElement(b);
        if (this.option("bActivateOnload")) {
            this.activate()
        }
    },
    _onActivate: function() {
        jindo.m.Flick.prototype._onActivate.apply(this);
        var a = this;
        this.set(new jindo.m.Slide(this._getAnimationOption()).attach({
            set: function(b) {
                a._setStyle(b.css)
            }
        }), this._htWElement.container)
    },
    _setStyle: function(a) {
        var b = {},
            e = 0,
            d = this._bUseH ? "width" : "height",
            c = this._bUseH ? "left" : "top";
        jindo.$Jindo.mixin(b, a);
        if (this._bUseCircular) {
            b[d] = "100%";
            b[c] = "-100%";
            a.position = "absolute";
            a[d] = "100%";
            a.left = 0;
            a.top = 0
        }
        if (this._bUseH) {
            b.clear = "both";
            a["float"] = "left"
        }
        this._htWElement.container.css(b);
        jindo.$A(this._htWElement.aPanel).forEach(function(f, g) {
            if (this._bUseCircular) {
                e = (((g + 1) % (this._nDefaultPanel)) * 100) + "%";
                if (this._hasOffsetBug()) {
                    a[c] = e
                } else {
                    a[jindo.m._toPrefixStr("Transform")] = this._getTranslate(e)
                }
            }
            f.css(a)
        }, this)
    },
    resize: function() {
        jindo.m.Flick.prototype.resize.call(this);
        var b = this._bUseH ? "width" : "height",
            a = this._htWElement.view[b]();
        this._oTouch._resetTouchInfo();
        if (!this._bUseCircular) {
            this._htWElement.container.css(b, -this._aPos[this._aPos.length - 1] + "px");
            if (this.option("bFitContentSize")) {
                jindo.$A(this._htWElement.aPanel).forEach(function(d) {
                    d.css(b, a + "px")
                })
            } else {
                var c = this._aPos[this._aPos.length - 1] + a;
                if (c < 0) {
                    jindo.$A(this._aPos).forEach(function(d, e) {
                        if (d < c) {
                            this._aPos.length = e;
                            jindo.$A.Break()
                        }
                    }, this);
                    this._aPos.push(c);
                    if (this._bUseH) {
                        this._htSize.maxX = c
                    } else {
                        this._htSize.maxY = c
                    }
                    if (this._aPos.length <= this.getContentIndex()) {
                        this._nContentIndex = this._aPos.length - 1
                    }
                }
            }
            this._updateFlickInfo();
            this._oAnimation.move(this._nX, this._nY)
        } else {
            if (this._bUseCircular && jindo.m.getOsInfo().ios) {
                this._updateFlickInfo(0);
                this._oAnimation.move(this._nX, this._nY)
            }
        }
    },
    _restorePanel: function(c) {
        c = c || this.getElement();
        var f = this._getIndexByElement(c),
            e = this._hasOffsetBug() ? (this._bUseH ? "left" : "top") : jindo.m._toPrefixStr("Transform"),
            d = (((f - 1) < 0) ? (this._nDefaultPanel - 1) : (f - 1)) % (this._nDefaultPanel),
            b = ((((f + 1) % (this._nDefaultPanel)) > (this._nDefaultPanel - 1)) ? 0 : (f + 1)) % (this._nDefaultPanel),
            a = f % (this._nDefaultPanel);
        this._welElement = this._htWElement.aPanel[a];
        this._htWElement.container.css(jindo.m._toPrefixStr("Transform"), this._getTranslate(0));
        this._welElement.css(e, this._getPosValue("100%")).css("zIndex", 10);
        this._htWElement.aPanel[d].css(e, this._getPosValue("0%")).css("zIndex", 1);
        this._htWElement.aPanel[b].css(e, this._getPosValue("200%")).css("zIndex", 1);
        if (jindo.m.getOsInfo().ios && this._bUseCircular) {
            this._oDocFragment.appendChild(this._htWElement.aPanel[d].$value());
            this._oDocFragment.appendChild(this._htWElement.aPanel[b].$value());
            this._htWElement.container.$value().appendChild(this._oDocFragment)
        }
    },
    _getPosValue: function(a) {
        return this._hasOffsetBug() ? a : this._getTranslate(a)
    },
    _panelEndAfterCall: function() {
        if (this._bUseCircular) {
            this._restorePanel()
        }
    },
    _moveAfterCall: function(a) {
        this._oAnimation.move(this._nX, this._nY, 0, this._makeOption({
            next: a.bNext
        }))
    },
    _onEndAniImpl: function() {
        jindo.m.Flick.prototype._onEndAniImpl.apply(this);
        if (!this._bUseCircular) {
            this._fixOffsetBugImpl()
        }
    },
    destroy: function() {
        jindo.m.Flick.prototype.destroy.apply(this)
    }
}).extend(jindo.m.Flick);
jindo.m.patch(jindo.m.Component.VERSION).add({
    useCss3d: function() {
        var b = jindo.m.getOsInfo();
        var a = jindo.m.getBrowserInfo();
        if (b.bInapp && b.android && b.version >= "5" && a.chrome && a.version == 42) {
            return -1
        } else {
            return 0
        }
    }
});
jindo.m.patch("1.13.0").add({
    useCss3d: function() {
        if (/LG-F370|LG-D329/.test(navigator.userAgent)) {
            return -1
        } else {
            return 0
        }
    }
});
if (jindo && jindo.$Element && !jindo.$Element.prototype.preventTapHighlight) {
    jindo.$Element.prototype.preventTapHighlight = function() {
        if (/(iPhone|iPod|Mobile|Tizen|Android|Nokia|webOS|BlackBerry|Opera Mobi|Opera Mini)/.test(navigator.userAgent)) {
            var b = "no_tap_highlight" + new Date().getTime();
            var d = document.createElement("style");
            var c = document.getElementsByTagName("html")[0];
            d.type = "text/css";
            c.insertBefore(d, c.firstChild);
            var a = d.sheet || d.styleSheet;
            a.insertRule("." + b + " { -webkit-tap-highlight-color: rgba(0,0,0,0); }", 0);
            a.insertRule("." + b + " * { -webkit-tap-highlight-color: rgba(0,0,0,.25); }", 0);
            jindo.$Element.prototype.preventTapHighlight = function(e) {
                return this[e ? "addClass" : "removeClass"](b)
            }
        } else {
            jindo.$Element.prototype.preventTapHighlight = function() {
                return this
            }
        }
        return this.preventTapHighlight.apply(this, arguments)
    }
}!(function(g) {
    if (!g.jindo) {
        return
    }
    var f = g.jindo,
        e, b, h;
    if (f.$Element.prototype.attach) {
        e = f.$Element.eventManager;
        b = e.test();
        h = "_jindo_event_none";
        for (var a in b) {
            if (b[a].ele === window && (b = b[a].event.unload)) {
                b = b.type[h].normal;
                for (var d = 0, c; c = b[d]; d++) {
                    if (~c.toString().indexOf("$Element.eventManager.cleanUpAll")) {
                        e.removeEventListener(a, "unload", h, "normal", "", c);
                        break
                    }
                }
                break
            }
        }
    } else {
        if (e = f.$Fn.gc.pool["$0"]) {
            b = e._events[0];
            if (b.element === window && b.event === "unload") {
                e.detach(b.element, b.event)
            }
        }
    }
})(window);
(function(c, a, i) {
    var g = a.performance,
        f = a.history,
        j = a.location,
        k = a.JSON,
        h = "___persist___",
        d = "KEY" + h,
        l = (g && g.navigation && (g.navigation.type === (g.navigation.TYPE_BACK_FORWARD || 2))),
        b = "replaceState" in f && "state" in f,
        e = (function() {
            if (!b) {
                if ("sessionStorage" in a) {
                    var m = "__tmp__" + h;
                    sessionStorage.setItem(m, h);
                    return sessionStorage.getItem(m) === h ? sessionStorage : localStorage
                } else {
                    return localStorage
                }
            }
        })();
    a.Persist = c.$Class({
        $init: function() {
            this._isPersisted = a[h] === true;
            !l && this._reset();
            c.$Fn(this._onPageShow, this).attach(a, "pageshow")
        },
        _onPageShow: function(m) {
            this._isPersisted = this._isPersisted || (m.$value() && m.$value().persisted);
            if (!this._isPersisted && l) {
                this.fireEvent("persist", {
                    state: this._getStateByKey(d)
                })
            } else {
                this._reset()
            }
        },
        _reset: function() {
            this._setState(null)
        },
        _getState: function() {
            if (b) {
                return k.parse(f.state)
            } else {
                var m = e.getItem(j.href + h);
                return (m && m.length > 0) ? k.parse(m) : null
            }
        },
        _getStateByKey: function(n) {
            var m = this._getState();
            return m ? m[n] : null
        },
        _setState: function(m) {
            if (b) {
                f.replaceState(k.stringify(m), i.title, j.href)
            } else {
                if (m) {
                    e.setItem(j.href + h, k.stringify(m))
                } else {
                    e.removeItem(j.href + h)
                }
            }
            a[h] = m ? true : null
        },
        _setStateByKey: function(n, o) {
            var m = this._getState();
            if (!m) {
                m = {};
                m[d] = null
            }
            m[n] = o;
            this._setState(m)
        },
        persist: function(o) {
            var m, n;
            if (typeof o === "string") {
                m = o;
                n = arguments.length === 2 ? arguments[1] : null
            } else {
                m = d;
                n = arguments.length === 1 ? o : null
            }
            if (n) {
                this._setStateByKey(m, n)
            }
            return this._getStateByKey(m)
        }
    }).extend(c.m.Component)
}(jindo, window, document));
/*! A fix for the iOS orientationchange zoom bug.
Script by @scottjehl, rebound by @wilto.
MIT / GPLv2 License.
*/
(function(k) {
    var t = k.document;
    if (!t.querySelector) {
        return
    }
    var m = t.querySelector("meta[name=viewport]"),
        d = m && m.getAttribute("content");
    if (!m) {
        return
    }
    var p = navigator.userAgent;
    if ((p.indexOf("Android") > -1) && /Android 4\.([1-4|\.]+)/.test(p)) {
        var h = null,
            o = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes";

        function n(u) {
            m.setAttribute("content", o);
            if (!h) {
                k.clearTimeout(h);
                h = null
            }
            h = k.setTimeout(function() {
                m.setAttribute("content", d);
                h = null
            }, u)
        }
        k.addEventListener("pageshow", function(u) {
            if (u.persisted) {
                n(0)
            }
        }, false)
    }
    var b = (/iPhone|iPad|iPod/.test(navigator.platform) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(p) && p.indexOf("AppleWebKit") > -1);
    var l = ((p.indexOf("Android") > -1) && /Android 4\.([1-3|\.]+)/.test(p) && p.indexOf("AppleWebKit") > -1);
    if (!b && !l) {
        return
    }
    if (/IM-A890/.test(p.match(/\(.*\)/)[0]) && l) {
        return
    }
    var r = d + ",maximum-scale=1",
        g = d + ",maximum-scale=10",
        f = true,
        j, i, e, c;

    function q() {
        m.setAttribute("content", g);
        f = true
    }

    function s() {
        m.setAttribute("content", r);
        f = false
    }

    function a(u) {
        c = u.accelerationIncludingGravity;
        j = Math.abs(c.x);
        i = Math.abs(c.y);
        e = Math.abs(c.z);
        if ((!k.orientation || k.orientation === 180) && (j > 7 || ((e > 6 && i < 8 || e < 8 && i > 6) && j > 5))) {
            if (f) {
                s()
            }
        } else {
            if (!f) {
                q()
            }
        }
    }
    k.addEventListener("orientationchange", q, false)
})(this);