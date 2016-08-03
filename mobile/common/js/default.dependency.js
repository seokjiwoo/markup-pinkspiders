if (typeof window.nhn === "undefined") {
    window.nhn = {}
};
jindo.Component = jindo.$Class({
    _htEventHandler: null,
    _htOption: null,
    $init: function() {
        var a = this.constructor.getInstance();
        a.push(this);
        this._htEventHandler = {};
        this._htOption = {};
        this._htOption._htSetter = {}
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
jindo.Component.factory = function(b, f) {
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
jindo.Component.getInstance = function() {
    if (typeof this._aInstance == "undefined") {
        this._aInstance = []
    }
    return this._aInstance
};
jindo.Component.VERSION = "1.9.0";
jindo.UIComponent = jindo.$Class({
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
}).extend(jindo.Component);
jindo.Calendar = jindo.$Class({
    $init: function(b, c) {
        var a = this.constructor.getToday();
        this.setToday(a.nYear, a.nMonth, a.nDate);
        this._elLayer = jindo.$(b);
        this._htDefaultOption = {
            sClassPrefix: "calendar-",
            nYear: this._htToday.nYear,
            nMonth: this._htToday.nMonth,
            nDate: this._htToday.nDate,
            sTitleFormat: "yyyy-mm",
            sYearTitleFormat: "yyyy",
            sMonthTitleFormat: "m",
            aMonthTitle: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
            bDrawOnload: true
        };
        this.option(this._htDefaultOption);
        this.option(c || {});
        this._assignHTMLElements();
        this.activate();
        this.setDate(this.option("nYear"), this.option("nMonth"), this.option("nDate"));
        if (this.option("bDrawOnload")) {
            this.draw()
        }
    },
    getBaseElement: function() {
        return this._elLayer
    },
    getDate: function() {
        return this._htDate
    },
    getDateOfElement: function(b) {
        var a = jindo.$A(this._aDateContainerElement).indexOf(b);
        if (a > -1) {
            return this._aMetaData[a]
        }
        return null
    },
    setToday: function(b, c, a) {
        if (!this._htToday) {
            this._htToday = {}
        }
        this._htToday.nYear = b;
        this._htToday.nMonth = c;
        this._htToday.nDate = a;
        return this
    },
    getToday: function() {
        return {
            nYear: this._htToday.nYear,
            nMonth: this._htToday.nMonth,
            nDate: this._htToday.nDate
        }
    },
    setDate: function(b, c, a) {
        this._htDate = {
            nYear: b,
            nMonth: (c * 1),
            nDate: (a * 1)
        }
    },
    getShownDate: function() {
        return this._getShownDate()
    },
    _getShownDate: function() {
        return this.htShownDate || this.getDate()
    },
    _setShownDate: function(a, b) {
        this.htShownDate = {
            nYear: a,
            nMonth: (b * 1),
            nDate: 1
        }
    },
    _assignHTMLElements: function() {
        var c = this.option("sClassPrefix"),
            b = this.getBaseElement();
        if ((this.elBtnPrevYear = jindo.$$.getSingle(("." + c + "btn-prev-year"), b))) {
            this.wfPrevYear = jindo.$Fn(function(d) {
                d.stop(jindo.$Event.CANCEL_DEFAULT);
                this.draw(-1, 0, true)
            }, this)
        }
        if ((this.elBtnPrevMonth = jindo.$$.getSingle(("." + c + "btn-prev-mon"), b))) {
            this.wfPrevMonth = jindo.$Fn(function(d) {
                d.stop(jindo.$Event.CANCEL_DEFAULT);
                this.draw(0, -1, true)
            }, this)
        }
        if ((this.elBtnNextMonth = jindo.$$.getSingle(("." + c + "btn-next-mon"), b))) {
            this.wfNextMonth = jindo.$Fn(function(d) {
                d.stop(jindo.$Event.CANCEL_DEFAULT);
                this.draw(0, 1, true)
            }, this)
        }
        if ((this.elBtnNextYear = jindo.$$.getSingle(("." + c + "btn-next-year"), b))) {
            this.wfNextYear = jindo.$Fn(function(d) {
                d.stop(jindo.$Event.CANCEL_DEFAULT);
                this.draw(1, 0, true)
            }, this)
        }
        this.elTitle = jindo.$$.getSingle(("." + c + "title"), b);
        this.elTitleYear = jindo.$$.getSingle(("." + c + "title-year"), b);
        this.elTitleMonth = jindo.$$.getSingle(("." + c + "title-month"), b);
        var a = jindo.$$.getSingle("." + c + "week", b);
        this.elWeekTemplate = a.cloneNode(true);
        this.elWeekAppendTarget = a.parentNode
    },
    _setCalendarTitle: function(b, c, f) {
        if (c < 10) {
            c = ("0" + (c * 1)).toString()
        }
        var d = this.elTitle,
            e = this.option("sTitleFormat"),
            a;
        if (typeof f != "undefined") {
            switch (f) {
                case "year":
                    d = this.elTitleYear;
                    e = this.option("sYearTitleFormat");
                    a = e.replace(/yyyy/g, b).replace(/y/g, (b).toString().substr(2, 2));
                    break;
                case "month":
                    d = this.elTitleMonth;
                    e = this.option("sMonthTitleFormat");
                    a = e.replace(/mm/g, c).replace(/m/g, (c * 1)).replace(/M/g, this.option("aMonthTitle")[c - 1]);
                    break
            }
        } else {
            a = e.replace(/yyyy/g, b).replace(/y/g, (b).toString().substr(2, 2)).replace(/mm/g, c).replace(/m/g, (c * 1)).replace(/M/g, this.option("aMonthTitle")[c - 1])
        }
        jindo.$Element(d).text(a)
    },
    draw: function(p, s, a) {
        var n = this.option("sClassPrefix"),
            l = this.getDate(),
            j = this._getShownDate();
        if (j && typeof a != "undefined" && a) {
            var w = this.constructor.getRelativeDate(p, s, 0, j);
            p = w.nYear;
            s = w.nMonth
        } else {
            if (typeof p == "undefined" && typeof s == "undefined" && typeof a == "undefined") {
                p = l.nYear;
                s = l.nMonth
            } else {
                p = p || j.nYear;
                s = s || j.nMonth
            }
        }
        if (this.fireEvent("beforeDraw", {
                nYear: p,
                nMonth: s
            })) {
            if (this.elTitle) {
                this._setCalendarTitle(p, s)
            }
            if (this.elTitleYear) {
                this._setCalendarTitle(p, s, "year")
            }
            if (this.elTitleMonth) {
                this._setCalendarTitle(p, s, "month")
            }
            this._clear(jindo.Calendar.getWeeks(p, s));
            this._setShownDate(p, s);
            var e = this.getToday(),
                k = this.constructor.getFirstDay(p, s),
                q = this.constructor.getLastDay(p, s),
                z = this.constructor.getLastDate(p, s),
                m = 0,
                d = this.constructor.getRelativeDate(0, -1, 0, {
                    nYear: p,
                    nMonth: s,
                    nDate: 1
                }),
                g = this.constructor.getRelativeDate(0, 1, 0, {
                    nYear: p,
                    nMonth: s,
                    nDate: 1
                }),
                v = this.constructor.getLastDate(d.nYear, d.nMonth),
                A = [],
                r, t, y, b, h, f, o, x, u;
            var c = this.constructor.getWeeks(p, s);
            for (u = 0; u < c; u++) {
                x = this.elWeekTemplate.cloneNode(true);
                jindo.$Element(x).appendTo(this.elWeekAppendTarget);
                this._aWeekElement.push(x)
            }
            this._aDateElement = jindo.$$("." + n + "date", this.elWeekAppendTarget);
            this._aDateContainerElement = jindo.$$("." + n + "week > *", this.elWeekAppendTarget);
            if (k > 0) {
                for (u = v - k; u < v; u++) {
                    A.push(u + 1)
                }
            }
            for (u = 1; u < z + 1; u++) {
                A.push(u)
            }
            o = A.length - 1;
            for (u = 1; u < 7 - q; u++) {
                A.push(u)
            }
            for (u = 0; u < A.length; u++) {
                r = false;
                t = false;
                y = jindo.$Element(this._aDateContainerElement[u]);
                b = p;
                h = s;
                if (u < k) {
                    r = true;
                    y.addClass(n + "prev-mon");
                    b = d.nYear;
                    h = d.nMonth
                } else {
                    if (u > o) {
                        t = true;
                        y.addClass(n + "next-mon");
                        b = g.nYear;
                        h = g.nMonth
                    } else {
                        b = p;
                        h = s
                    }
                }
                if (m === 0) {
                    y.addClass(n + "sun")
                }
                if (m == 6) {
                    y.addClass(n + "sat")
                }
                if (b == e.nYear && (h * 1) == e.nMonth && A[u] == e.nDate) {
                    y.addClass(n + "today")
                }
                f = {
                    elDate: this._aDateElement[u],
                    elDateContainer: y.$value(),
                    nYear: b,
                    nMonth: h,
                    nDate: A[u],
                    bPrevMonth: r,
                    bNextMonth: t,
                    sHTML: A[u]
                };
                jindo.$Element(f.elDate).html(f.sHTML.toString());
                this._aMetaData.push({
                    nYear: b,
                    nMonth: h,
                    nDate: A[u]
                });
                m = (m + 1) % 7;
                this.fireEvent("draw", f)
            }
            this.fireEvent("afterDraw", {
                nYear: p,
                nMonth: s
            })
        }
    },
    _clear: function(a) {
        this._aMetaData = [];
        this._aWeekElement = [];
        jindo.$Element(this.elWeekAppendTarget).empty()
    },
    attachEvent: function() {
        this.activate()
    },
    detachEvent: function() {
        this.deactivate()
    },
    _onActivate: function() {
        if (this.elBtnPrevYear) {
            this.wfPrevYear.attach(this.elBtnPrevYear, "click")
        }
        if (this.elBtnPrevMonth) {
            this.wfPrevMonth.attach(this.elBtnPrevMonth, "click")
        }
        if (this.elBtnNextMonth) {
            this.wfNextMonth.attach(this.elBtnNextMonth, "click")
        }
        if (this.elBtnNextYear) {
            this.wfNextYear.attach(this.elBtnNextYear, "click")
        }
    },
    _onDeactivate: function() {
        if (this.elBtnPrevYear) {
            this.wfPrevYear.detach(this.elBtnPrevYear, "click")
        }
        if (this.elBtnPrevMonth) {
            this.wfPrevMonth.detach(this.elBtnPrevMonth, "click")
        }
        if (this.elBtnNextMonth) {
            this.wfNextMonth.detach(this.elBtnNextMonth, "click")
        }
        if (this.elBtnNextYear) {
            this.wfNextYear.detach(this.elBtnNextYear, "click")
        }
    }
}).extend(jindo.UIComponent);
jindo.Calendar.setToday = function(b, c, a) {
    if (!this._htToday) {
        this._htToday = {}
    }
    this._htToday.nYear = b;
    this._htToday.nMonth = c;
    this._htToday.nDate = a;
    return this
};
jindo.Calendar.getToday = function() {
    var a = this._htToday || this.getDateHashTable(new Date());
    return {
        nYear: a.nYear,
        nMonth: a.nMonth,
        nDate: a.nDate
    }
};
jindo.Calendar.getDateObject = function(a) {
    if (arguments.length == 3) {
        return new Date(arguments[0], arguments[1] - 1, arguments[2])
    }
    return new Date(a.nYear, a.nMonth - 1, a.nDate)
};
jindo.Calendar.getDateHashTable = function(a) {
    if (arguments.length == 3) {
        return {
            nYear: arguments[0],
            nMonth: arguments[1],
            nDate: arguments[2]
        }
    }
    if (arguments.length <= 1) {
        a = a || new Date()
    }
    return {
        nYear: a.getFullYear(),
        nMonth: a.getMonth() + 1,
        nDate: a.getDate()
    }
};
jindo.Calendar.getTime = function(a) {
    return this.getDateObject(a).getTime()
};
jindo.Calendar.getFirstDay = function(a, b) {
    return new Date(a, b - 1, 1).getDay()
};
jindo.Calendar.getLastDay = function(a, b) {
    return new Date(a, b, 0).getDay()
};
jindo.Calendar.getLastDate = function(a, b) {
    return new Date(a, b, 0).getDate()
};
jindo.Calendar.getWeeks = function(a, c) {
    var d = this.getFirstDay(a, c),
        b = this.getLastDate(a, c);
    return Math.ceil((d + b) / 7)
};
jindo.Calendar.getRelativeDate = function(e, f, c, b) {
    var a = jindo.$Date(new Date(b.nYear, b.nMonth, b.nDate));
    var d = {
        "1": 31,
        "2": 28,
        "3": 31,
        "4": 30,
        "5": 31,
        "6": 30,
        "7": 31,
        "8": 31,
        "9": 30,
        "10": 31,
        "11": 30,
        "12": 31
    };
    if (a.isLeapYear()) {
        d = {
            "1": 31,
            "2": 29,
            "3": 31,
            "4": 30,
            "5": 31,
            "6": 30,
            "7": 31,
            "8": 31,
            "9": 30,
            "10": 31,
            "11": 30,
            "12": 31
        }
    }
    if (d[b.nMonth] == b.nDate) {
        b.nDate = d[b.nMonth + f]
    }
    var g = this.getDateHashTable(new Date(b.nYear + e, b.nMonth + f - 1, b.nDate + c));
    return this.getDateHashTable(new Date(b.nYear + e, b.nMonth + f - 1, b.nDate + c))
};
jindo.Calendar.isValidDate = function(b, c, a) {
    if (c <= 12 && a <= this.getLastDate(b, c)) {
        return true
    } else {
        return false
    }
};
jindo.Calendar.isPast = function(a, b) {
    if (this.getTime(a) < this.getTime(b)) {
        return true
    }
    return false
};
jindo.Calendar.isFuture = function(a, b) {
    if (this.getTime(a) > this.getTime(b)) {
        return true
    }
    return false
};
jindo.Calendar.isSameDate = function(a, b) {
    if (this.getTime(a) == this.getTime(b)) {
        return true
    }
    return false
};
jindo.Calendar.isBetween = function(a, c, b) {
    if (this.isFuture(a, b) || this.isPast(a, c)) {
        return false
    } else {
        return true
    }
};
jindo.LazyLoading = {
    _waLoading: jindo.$A([]),
    _waLoaded: jindo.$A([]),
    _whtScript: jindo.$H({}),
    _whtCallback: jindo.$H({})
};
jindo.LazyLoading.load = function(b, l, c) {
    if (typeof l != "function") {
        l = function() {}
    }
    if (b instanceof Array) {
        var e = arguments.callee;
        var a = true;
        var j = b.length;
        var h = j;
        for (var f = 0; f < j; f++) {
            a &= this.load(b[f], function() {
                h--;
                if (h === 0) {
                    l()
                }
            }, c)
        }
        return a
    }
    this._queueCallback(b, l);
    if (this._checkIsLoading(b)) {
        return false
    }
    if (this._checkAlreadyLoaded(b)) {
        this._doCallback(b);
        return true
    }
    this._waLoading.push(b);
    var k = this;
    var g = document.getElementsByTagName("head")[0];
    var d = document.createElement("script");
    d.type = "text/javascript";
    d.charset = c || "utf-8";
    d.src = b;
    this._whtScript.add(b, d);
    if ("onload" in d) {
        d.onload = function() {
            k._waLoaded.push(b);
            k._waLoading = k._waLoading.refuse(b);
            k._doCallback(b)
        }
    } else {
        d.onreadystatechange = function() {
            if (this.readyState == "complete" || this.readyState == "loaded") {
                k._waLoaded.push(b);
                k._waLoading = k._waLoading.refuse(b);
                k._doCallback(b);
                this.onreadystatechange = null
            }
        }
    }
    g.appendChild(d);
    return true
};
jindo.LazyLoading._queueCallback = function(b, c) {
    var a = this._whtCallback.$(b);
    if (a) {
        a.push(c)
    } else {
        this._whtCallback.$(b, [c])
    }
};
jindo.LazyLoading._doCallback = function(c) {
    var a = this._whtCallback.$(c).concat();
    for (var b = 0; b < a.length; b++) {
        this._whtCallback.$(c).splice(b, 1);
        a[b]()
    }
};
jindo.LazyLoading.abort = function(b) {
    if (this._checkIsLoading(b)) {
        var a = this.getScriptElement(b);
        this._waLoading = this._waLoading.refuse(b);
        if ("onload" in a) {
            a.onload = null
        } else {
            a.onreadystatechange = null
        }
        jindo.$Element(a).leave();
        this._whtScript.remove(b);
        this._whtCallback.remove(b);
        return true
    } else {
        return false
    }
};
jindo.LazyLoading._checkAlreadyLoaded = function(a) {
    return this._waLoaded.has(a)
};
jindo.LazyLoading._checkIsLoading = function(a) {
    return this._waLoading.has(a)
};
jindo.LazyLoading.getLoaded = function() {
    return this._waLoaded.$value()
};
jindo.LazyLoading.getLoading = function() {
    return this._waLoading.$value()
};
jindo.LazyLoading.getScriptElement = function(a) {
    return this._whtScript.$(a) || null
};
jindo.Timer = jindo.$Class({
    $init: function() {
        this._nTimer = null;
        this._nLatest = null;
        this._nRemained = 0;
        this._nDelay = null;
        this._fRun = null;
        this._bIsRunning = false
    },
    start: function(b, a) {
        this.abort();
        this._nRemained = 0;
        this._nDelay = a;
        this._fRun = b;
        this._bIsRunning = true;
        this._nLatest = this._getTime();
        this.fireEvent("wait");
        this._excute(this._nDelay, false);
        return true
    },
    isRunning: function() {
        return this._bIsRunning
    },
    _getTime: function() {
        return new Date().getTime()
    },
    _clearTimer: function() {
        var a = false;
        if (this._nTimer) {
            clearTimeout(this._nTimer);
            this._bIsRunning = false;
            a = true
        }
        this._nTimer = null;
        return a
    },
    abort: function() {
        this._clearTimer();
        if (this._fRun) {
            this.fireEvent("abort");
            this._fRun = null;
            return true
        }
        return false
    },
    pause: function() {
        var a = this._getTime() - this._nLatest;
        this._nRemained = Math.max(this._nDelay - a, 0);
        return this._clearTimer()
    },
    _excute: function(b, a) {
        var c = this;
        this._clearTimer();
        this._bIsRunning = true;
        var d = function(e) {
            if (!c._fRun) {
                return
            }
            if (c._nTimer || e) {
                c.fireEvent("run");
                var f = c._fRun();
                c._nLatest = c._getTime();
                if (!f) {
                    if (!e) {
                        clearTimeout(c._nTimer)
                    }
                    c._nTimer = null;
                    c._bIsRunning = false;
                    c.fireEvent("end");
                    return
                }
                c.fireEvent("wait");
                c._excute(c._nDelay, false)
            }
        };
        if (b > -1) {
            this._nTimer = setTimeout(d, b)
        } else {
            d(true)
        }
    },
    resume: function() {
        if (!this._fRun || this.isRunning()) {
            return false
        }
        this._bIsRunning = true;
        this.fireEvent("wait");
        this._excute(this._nRemained, true);
        this._nRemained = 0;
        return true
    }
}).extend(jindo.Component);
if (typeof nhn == "undefined") {
    nhn = {}
}
nhn.FlashObject = (function() {
    var d = {};
    var a = "F" + new Date().getTime() + parseInt(Math.random() * 1000000);
    var k = /MSIE/i.test(navigator.userAgent);
    var j = /FireFox/i.test(navigator.userAgent);
    var i = /Chrome/i.test(navigator.userAgent);
    var b = "className, style, __flashID, classid, codebase, class, width, height, name, src, align, id, type, object, embed, movie";
    var h = function(n, p, o) {
        if (typeof n.attachEvent != "undefined") {
            n.attachEvent("on" + p, o)
        } else {
            n.addEventListener(p, o, true)
        }
    };
    var f = function(n, q) {
        var r = "";
        var v = true;
        var o = "";
        var t;
        for (var u in n) {
            if (v) {
                v = false
            } else {
                r += q
            }
            t = n[u];
            switch (typeof(t)) {
                case "string":
                    r += u + "=" + encodeURIComponent(t);
                    break;
                case "number":
                    r += u + "=" + encodeURIComponent(t.toString());
                    break;
                case "boolean":
                    r += u + "=" + (t ? "true" : "false");
                    break;
                default:
            }
        }
        return r
    };
    var m = function() {
        obj = document.getElementsByTagName("OBJECT");
        for (var o = 0, n; n = obj[o]; o++) {
            n.style.display = "none";
            for (var q in n) {
                if (typeof(n[q]) == "function") {
                    try {
                        if (n.hasOwnProperty(q)) {
                            n[q] = null
                        }
                    } catch (p) {}
                }
            }
        }
    };
    var e = function(r) {
        r = r || window.event;
        var q = r.wheelDelta / (i ? 360 : 120);
        if (!q) {
            q = -r.detail / 3
        }
        var o = r.target || r.srcElement;
        if (!(new RegExp("(^|\b)" + a + "_([a-z0-9_$]+)(\b|$)", "i").test(o.className))) {
            return
        }
        var n = RegExp.$2;
        var t = "layerX" in r ? r.layerX : r.offsetX;
        var s = "layerY" in r ? r.layerY : r.offsetY;
        try {
            if (!o[n](q, t, s)) {
                if (r.preventDefault) {
                    r.preventDefault()
                } else {
                    r.returnValue = false
                }
            }
        } catch (p) {}
    };
    var g = function(o) {
        var p = null;
        var r = /Safari/.test(navigator.userAgent);
        var n = /MSIE/.test(navigator.userAgent);
        var s = function(u) {
            var t = {
                left: 0,
                top: 0
            };
            if (u.parentNode.tagName.toLowerCase() == "object") {
                u = u.parentNode
            }
            for (var w = u, v = w.offsetParent; w = w.parentNode;) {
                if (w.offsetParent) {
                    t.left -= w.scrollLeft;
                    t.top -= w.scrollTop
                }
                if (w == v) {
                    t.left += u.offsetLeft + w.clientLeft;
                    t.top += u.offsetTop + w.clientTop;
                    if (!w.offsetParent) {
                        t.left += w.offsetLeft;
                        t.top += w.offsetTop
                    }
                    v = w.offsetParent;
                    u = w
                }
            }
            return t
        };
        var q = function(u) {
            var t = {
                left: 0,
                top: 0
            };
            for (var v = u; v; v = v.offsetParent) {
                t.left += v.offsetLeft;
                t.top += v.offsetTop
            }
            for (var v = u.parentNode; v; v = v.parentNode) {
                if (v.tagName == "BODY") {
                    break
                }
                if (v.tagName == "TR") {
                    t.top += 2
                }
                t.left -= v.scrollLeft;
                t.top -= v.scrollTop
            }
            return t
        };
        return (r ? s : q)(o)
    };
    var c = function() {
        var n = /MSIE/.test(navigator.userAgent);
        if (n) {
            var p = document.documentElement.scrollLeft || document.body.scrollLeft;
            var o = document.documentElement.scrollTop || document.body.scrollTop;
            return {
                scrollX: p,
                scrollY: o
            }
        } else {
            return {
                scrollX: window.pageXOffset,
                scrollY: window.pageYOffset
            }
        }
    };
    var l = function() {
        var n = /MSIE/.test(navigator.userAgent);
        var o = {};
        if (n) {
            o.nInnerWidth = document.documentElement.clientWidth || document.body.clientWidth;
            o.nInnerHeight = document.documentElement.clientHeight || document.body.clientHeight
        } else {
            o.nInnerWidth = window.innerWidth;
            o.nInnerHeight = window.innerHeight
        }
        return o
    };
    d.showAt = function(n, o) {
        document.getElementById(n).innerHTML = o
    };
    d.show = function(q, r, s, t, v, n, u, p) {
        var o = d.generateTag(r, s, t, v, n, u, p);
        $Element(q).appendHTML(o)
    };
    d.generateTag = function(v, w, x, A, o, y, s) {
        x = x || "100%";
        A = A || "100%";
        s = s || "9,0,0,0";
        y = y || "middle";
        var z = d.getDefaultOption();
        var C = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000";
        var r = "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=" + s;
        var p = "position:relative !important;";
        var q = a;
        if (o) {
            if (o.flashVars) {
                if (typeof(o.flashVars) == "object") {
                    o.flashVars = f(o.flashVars, "&")
                }
                o.flashVars += "&"
            } else {
                o.flashVars = ""
            }
            o.flashVars += "__flashID=" + w;
            p = o.style || p;
            q = o.className || (q + "_" + o.wheelHandler);
            for (var B in o) {
                if (b.indexOf(B) >= 0) {
                    continue
                }
                z[B] = o[B]
            }
        }
        var t = [];
        var n = [];
        t.push('<object classid="' + C + '" codebase="' + r + '" class="' + q + '" style="' + p + '" width="' + x + '" height="' + A + '" id="' + w + '" align="' + y + '">');
        t.push('<param name="movie" value="' + v + '" />');
        n.push('<embed width="' + x + '" height="' + A + '" name="' + w + '" class="' + q + '" style="' + p + '" src="' + v + '" align="' + y + '" ');
        if (!k) {
            n.push('id="' + w + '" ')
        }
        for (var u in z) {
            t.push('<param name="' + u + '" value="' + z[u] + '" />');
            n.push(u + '="' + z[u] + '" ')
        }
        n.push('type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />');
        t.push(n.join(""));
        t.push("</object>");
        if (h) {
            h(window, "unload", m);
            h(document, !j ? "mousewheel" : "DOMMouseScroll", e);
            h = null
        }
        return (k) ? t.join("") : n.join("")
    };
    d.getDefaultOption = function() {
        return {
            quality: "high",
            bgColor: "#FFFFFF",
            allowScriptAccess: "always",
            wmode: "window",
            menu: "false",
            allowFullScreen: "true"
        }
    };
    d.find = function(o, n) {
        n = n || document;
        try {
            return n[o] || n.all[o]
        } catch (p) {
            return null
        }
    };
    d.setWidth = function(n, o) {
        d.find(n).width = o
    };
    d.setHeight = function(n, o) {
        d.find(n).height = o
    };
    d.setSize = function(p, o, n) {
        d.find(p).height = n;
        d.find(p).width = o
    };
    d.getPositionObj = function(o) {
        var p = d.find(o);
        if (p == null) {
            return null
        }
        var n = g(p);
        var q = c();
        var r = {};
        r.absoluteX = n.left;
        r.absoluteY = n.top;
        r.scrolledX = r.absoluteX - q.scrollX;
        r.scrolledY = r.absoluteY - q.scrollY;
        r.browserWidth = l().nInnerWidth;
        return r
    };
    d.getSSCLogParam = function() {
        var n = [];
        if (window.g_ssc) {
            n.push("ssc=" + g_ssc)
        } else {
            n.push("ssc=decide.me")
        }
        if (window.g_pid) {
            n.push("&p=" + g_pid)
        }
        if (window.g_query) {
            n.push("&q=" + encodeURIComponent(g_query))
        }
        if (window.g_sid) {
            n.push("&s=" + g_sid)
        }
        return n.join("")
    };
    return d
})();
if (typeof jsutility === "undefined") {
    jsutility = {}
}(function() {
    jsutility.changeNumberFormat = function(b) {
        var d = "";
        var c = b || 0;
        c = (typeof c != "String") ? String(c) : c;
        if (c.indexOf(".") > -1) {
            var a = c.split(".");
            c = a[0];
            d = "." + a[1]
        }
        return c.replace(/(\d)(?=(\d{3})+$)/igm, "$1,") + d
    }
})();
ArticleUtils = {
    requestCommentCount: function(b, c) {
        var a = jindo.$Element("comment_count");
        if (!a || !b || !c) {
            return
        }
        jindo.$Ajax("/api/comment/count.json?gno=news" + b + "%2C" + c, {
            onload: function(e) {
                var f = e.json();
                if (f.message.error || f.message.result.onOff !== "on") {
                    a.leave();
                    return
                }
                var d = jsutility.changeNumberFormat(f.message.result.count);
                a.html(d)
            }
        }).request()
    },
    scrollToTitle: function() {
        var a = jindo.$Element("articleTitle");
        if (!a) {
            return
        }
        window.scrollTo(0, a.offset().top)
    }
};
SocialCommentUtils = {
    sSocialCommentId: "social-comment",
    nLoadCheckLimit: 5,
    nLoadCheckCount: 0,
    nLoadCheckDelayTime: 50,
    pPathPattern: /\/comment\//,
    scrollToTop: function() {
        var b = document.location.href;
        var a = jindo.$Element(this.sSocialCommentId);
        if (!this.pPathPattern.test(b) || !a || this.nLoadCheckCount >= this.nLoadCheckLimit) {
            return
        }
        this._scrollToTopCheck(a)
    },
    _scrollToTopCheck: function(b) {
        if (!b.html()) {
            this.nLoadCheckCount++;
            var a = this;
            setTimeout(function() {
                a._scrollToTopCheck(b)
            }, a.nLoadCheckDelayTime);
            return
        }
        setTimeout(function() {
            window.scrollTo(0, b.offset().top)
        }, 300)
    }
};
if (typeof nhn === "undefined") {
    nhn = {}
}
nhn.m = nhn.m || {};
nhn.m.news = nhn.m.news || {};
(function() {
    nhn.m.news.util = {
        useTransitionTimingFunction: (function() {
            var b = jindo.m.getDeviceInfo();
            var a = jindo.$Agent();
            var c = null;
            c = !(a.navigator().mobile || a.os().ipad) ? true : c;
            c = (a.os().ios && parseFloat(b.version, 10) >= 4) ? true : c;
            c = (b.android && parseFloat(b.version, 10) >= 4) ? true : c;
            return function() {
                return c
            }
        })(),
        isMobileTablet: (function() {
            var a = jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad;
            return function() {
                return a
            }
        })(),
        randomInRange: function(a, b) {
            b = b || 0;
            return Math.floor(Math.random() * (a)) + b
        },
        isExistInViewportHeight: function(e) {
            var b = jindo.$Element(e);
            var f = document.body.scrollTop;
            var d = window.innerHeight;
            var c = b.offset().top,
                a = b.height();
            if (c + a >= f && c <= f + d) {
                return true
            }
            return false
        },
        getElementsInViewportHeight: function(e) {
            e = (e instanceof Array) ? e : [e];
            if (e.length === 0) {
                return []
            }
            var j = [];
            var f = document.body.scrollTop;
            var d = window.innerHeight;
            var a = null;
            var b = this.binarySearch(e, function(m) {
                var k = jindo.$Element(m);
                var l = k.offset().top,
                    i = k.height();
                if (l + i >= f && l <= f + d) {
                    return 0
                }
                if (l + i < f) {
                    return 1
                } else {
                    if (l > f + d) {
                        return -1
                    }
                }
            });

            function h(k) {
                a = jindo.$Element(e[k]);
                var l = a.offset().top,
                    i = a.height();
                if (l + i >= f && l <= f + d) {
                    return true
                }
                return false
            }
            var c = 0;
            if (b >= 0) {
                var g = e[b];
                j.push(g);
                for (c = b - 1; e[c] && h(c); c--) {
                    j.unshift(e[c])
                }
                for (c = b + 1; e[c] && h(c); c++) {
                    j.push(e[c])
                }
            }
            return j
        },
        binarySearch: function(b, d) {
            var f = 0,
                a = b.length - 1,
                c = Math.floor((a + f) / 2);
            while (b[c] && f < a) {
                var e = d(b[c]);
                if (e === 0) {
                    break
                }
                if (e < 0) {
                    a = c - 1
                } else {
                    if (e > 0) {
                        f = c + 1
                    }
                }
                c = Math.floor((a + f) / 2)
            }
            return (!b[c] || d(b[c]) !== 0) ? -1 : c
        },
        changeNumberFormat: function(b) {
            var d = "";
            var c = b || 0;
            c = (typeof c != "String") ? String(c) : c;
            if (c.indexOf(".") > -1) {
                var a = c.split(".");
                c = a[0];
                d = "." + a[1]
            }
            return c.replace(/(\d)(?=(\d{3})+$)/igm, "$1,") + d
        },
        convertGMTTimeToTimezoneOffsetTime: function(a) {
            var b = new Date(a);
            b.setTime(b.getTime() - b.getTimezoneOffset() * 60000);
            return b.getTime()
        },
        changeSecondToTimeObject: function(b) {
            b = (b || 0) * 1;
            b = Math.ceil(b);
            var c = 60,
                a = c * c;
            return {
                hour: parseInt(b / a, 10),
                min: parseInt((b % a) / c, 10),
                sec: (b % c)
            }
        },
        disableSelection: function(a) {
            var b = jindo.$Agent().navigator();
            if (b.ie || b.opera) {
                a.unselectable = "on"
            } else {
                if (b.safari || b.chrome) {
                    a.style.KhtmlUserSelect = "none"
                } else {
                    a.style.MozUserSelect = "-moz-none"
                }
            }
            jindo.$Fn(function(c) {
                c.stopDefault()
            }).attach(a, "selectstart")
        },
        noImage: function(a, b) {
            if (!a) {
                return
            }
            b = b || {};
            a.onerror = null;
            for (var c in b) {
                a[c] = b[c]
            }
        },
        addNewAnchorTargetForNotSupportPageCache: function(b, c) {
            var a = jindo.m.getDeviceInfo();
            var d = (a.bInapp && a.android && parseFloat(a.version, 10) >= 4.4) ? false : a.bInapp;
            if (d || !a.bChrome) {
                return
            }
            b = b || [];
            c = c || "_blank";
            jindo.$A(b).forEach(function(g, f, h) {
                var e = jindo.$Element(g);
                g = e.$value();
                if (g.tagName && g.tagName.toUpperCase() == "A") {
                    if (!e.attr("target") && (e.attr("href").search("://") >= 0 || e.attr("href").indexOf("/") == 0)) {
                        e.attr("target", c)
                    }
                }
            })
        }
    }
})();
(function(a) {
    a._rxClassName = function(b) {
        return new RegExp("(^|\\s+)" + b + "(\\(([^\\)]*)\\))?(\\s+|$)", "i")
    };
    a.setClass = function(d, b, c) {
        if (this.getClass(d, b)) {
            this.removeClass(d, b)
        }
        d.className += [(d.className ? " " : ""), b, (c instanceof Array ? "(" + c.join(",") + ")" : "")].join("");
        return d
    };
    a.getClass = function(e, c) {
        var d = this._rxClassName(c);
        if (!d.test(e.className)) {
            return null
        }
        var b = [];
        if (RegExp.$3) {
            RegExp.$3.replace(/(\{[^\}]+\}|\[[^\]]+\]|[\-\+\=\/\s\w\.\*가-힣]+)|,(,+)/g, function(g, k, j) {
                if (k) {
                    b.push(k)
                }
                if (j) {
                    for (var h = 0, f = j.length; h < f; h++) {
                        b.push("")
                    }
                }
            })
        }
        return b
    };
    a.removeClass = function(d, b) {
        var c = this._rxClassName(b);
        d.className = this.trim(d.className.replace(c, "$4"));
        return d
    };
    a.getParentByClass = function(h, b) {
        var d = this._rxClassName(b);
        var c = false;
        var f = "";
        try {
            c = "className" in h
        } catch (g) {}
        for (; h && c; h = h.parentNode) {
            f = typeof h.className == "object" ? h.className.baseVal : h.className;
            if (d.test(f)) {
                RegExp.$0 = RegExp.$3;
                return h
            }
        }
        return null
    }
})(nhn.m.news.util);
(function(a) {
    a.Bubbler = jindo.$Class({
        $init: function(b) {
            this._el = b;
            this._eventTypes = {};
            this._fpEventHandler = jindo.$Fn(this._eventHandler, this)
        },
        attach: function(h, d) {
            if (typeof h == "object") {
                var e = arguments.callee;
                jindo.$H(h).forEach(function(l, j) {
                    e.call(this, j, l)
                }, this);
                return this
            }
            var b = h.split(":");
            var c = b[0];
            var i = b[1].toLowerCase();
            var f = i;
            if (f == "mouseenter") {
                f = "mouseover"
            } else {
                if (f == "mouseleave") {
                    f = "mouseout"
                }
            }
            if (!(i in this._eventTypes)) {
                this._eventTypes[i] = jindo.$H();
                this._fpEventHandler.attach(this._el, f)
            }
            var g = this._eventTypes[i];
            if (!g.hasKey(c)) {
                g.$(c, jindo.$A())
            }
            g.$(c).push(d);
            return this
        },
        detach: function(c, h) {
            if (typeof c == "object") {
                var g = arguments.callee;
                jindo.$H(c).forEach(function(m, l) {
                    g.call(this, l, m)
                }, this);
                return this
            }
            var e = c.split(":");
            var d = e[0];
            var b = e[1].toLowerCase();
            var j = this._eventTypes[b];
            var i = j.$(d);
            if (i) {
                var f = i.indexOf(h);
                if (f != -1) {
                    i.splice(f, 1)
                }
            }
        },
        _eventHandler: function(d) {
            var g = d.type.toLowerCase();
            var f = null;
            if (g == "mouseover") {
                f = "mouseenter"
            } else {
                if (g == "mouseout") {
                    f = "mouseleave"
                }
            }
            var e = this._eventTypes[f || g];
            if (e) {
                var c = d.element;
                var b = d.relatedElement;
                e.forEach(function(h, i) {
                    var k = nhn.m.news.util.getParentByClass(c, i);
                    if (!k) {
                        jindo.$H.Continue()
                    }
                    if (f) {
                        var j = nhn.m.news.util.getParentByClass(b, i);
                        if (k === j) {
                            jindo.$H.Continue()
                        }
                    }
                    var l = nhn.m.news.util.getClass(k, i);
                    h.forEach(function(m) {
                        m(d, k, l)
                    });
                    k = null
                }, this)
            }
            d = null
        }
    })
})(nhn.m.news.util);
(function(a) {})(nhn.m.news.util);
var LnbScrollManager = jindo.$Class({
    $init: function(g) {
        var d = jindo.$Element(g);
        if (!d) {
            return
        }
        var a = d.query(".scroller");
        if (!a) {
            return
        }
        var f = new jindo.m.Scroll(d, {
            bAutoResize: false,
            bUseHScroll: true,
            bUseVScroll: false,
            bUseScrollbar: false,
            bUseCss3d: this._useCss3dPatch(),
            nHeight: a.height()
        });

        function i() {
            var j = a.query("li.selected");
            if (j) {
                var k = j.parent().offset().left - j.offset().left;
                k += parseInt((window.innerWidth - j.width()) / 2, 10);
                f.scrollTo(Math.min(0, k), 0)
            }
        }
        jindo.m.bindRotate(function() {
            f.refresh();
            i()
        });
        var h = this;
        var b = d.parent();
        var c = b.query(".grd_prev"),
            e = b.query(".grd_next");
        if (c && e) {
            f.attach({
                afterScroll: function(j) {
                    if (h._useGradientDimLayer()) {
                        c.visible(j.nLeft < 0, "block");
                        e.visible(j.nLeft > j.nMaxScrollLeft, "block")
                    }
                },
                scroll: function(j) {
                    var k = (j.nDistanceX < 0) ? "lnb.flne" : "lnb.flpr";
                    nclk(this, k, "", "")
                }
            })
        }
        jindo.$Fn(i).delay(0)
    },
    _useGradientDimLayer: function() {
        var b = jindo.m.getDeviceInfo();
        var a = jindo.$Agent();
        var c = false;
        c = (a.os().ios && parseFloat(b.version, 10) > 6) ? true : c;
        c = (b.android && parseFloat(b.version, 10) >= 4) ? true : c;
        return c
    },
    _useCss3dPatch: function() {
        var a = jindo.m.getDeviceInfo();
        return (a.android && parseFloat(a.version, 10) === 4) ? false : jindo.m.useCss3d(true)
    }
});
var CalendarManager = jindo.$Class({
    $init: function(a) {
        this.attr = {
            currentDate: undefined,
            startDate: undefined,
            endDate: undefined,
            callback: function(e, f, d) {},
            openCalendarCallback: function(d) {},
            prevBtnDimmed: "prev_dmm",
            nextBtnDimmed: "next_dmm",
            currentDateTemplate: '<a onclick=\'javascript:calendarManager.openCalendar(); nclk(this,"pap.copen","",""); \'>{=YEAR}.{=MONTH}.{=DATE} <em>{=DAY}요일</em><button class=\'ico_cal\'>달력보기</button></a>',
            calendarTemplate: '<a href=\'javascript:calendarManager.select({=YEAR},{=MONTH},{=DATE});\' onclick=\'nclk(this,"pap.cdate","","");\'>{=DATE}</a>'
        };
        for (var c in a) {
            this.attr[c] = a[c]
        }
        this.DAYS = ["일", "월", "화", "수", "목", "금", "토"];
        this.currentDateTemplate = this.attr.currentDateTemplate;
        this.calendarTemplate = this.attr.calendarTemplate;
        this.calendarNonclickTemplate = "{=DATE}";
        this.oToday = jindo.$Element("today");
        this.oDateLayer = jindo.$Element("date_layer");
        this.oCalendarLayer = jindo.$Element("calendar_layer");
        this.initCalendar();
        this.today = this.parseDate(this.attr.endDate);
        this.now = new Date();
        this.past = new Date();
        this.oPrevDateBtn = jindo.$Element("prev_date_btn");
        this.oNextDateBtn = jindo.$Element("next_date_btn");
        this.oPrevCalendarBtn = jindo.$Element("prev_calendar_btn");
        this.oNextCalendarBtn = jindo.$Element("next_calendar_btn");
        this.prevBlock = false;
        this.nextBlock = false;
        if (!this.attr.currentDate) {
            this.setCurrentDate()
        } else {
            var b = this.parseDate(this.attr.currentDate);
            this.now.setFullYear(b.getFullYear(), b.getMonth(), b.getDate());
            this.setCurrentDate()
        }
    },
    initCalendar: function() {
        this.oCalendar = new jindo.Calendar("calendar_layer", {
            sTitleFormat: "yyyy.mm"
        });
        var a = {};
        if (this.attr.startDate && this.attr.endDate) {
            this.setStart();
            this.setEnd();
            a.beforeDraw = jindo.$Fn(function(b) {
                this.setPrevBtnDmm(b);
                this.setNextBtnDmm(b)
            }, this).bind()
        } else {
            if (this.attr.startDate) {
                this.setStart();
                a.beforeDraw = jindo.$Fn(function(b) {
                    this.setPrevBtnDmm(b)
                }, this).bind()
            } else {
                if (this.attr.endDate) {
                    this.setEnd();
                    a.beforeDraw = jindo.$Fn(function(b) {
                        this.setNextBtnDmm(b)
                    }, this).bind()
                }
            }
        }
        a.draw = jindo.$Fn(function(b) {
            var e = new Date(b.nYear, b.nMonth - 1, b.nDate);
            var d = null;
            if (b.nDate == this.today.getDate() && b.nMonth - 1 == this.today.getMonth() && b.nYear == this.today.getFullYear()) {
                d = this.calendarTemplate
            } else {
                if (e < this.today) {
                    d = this.calendarTemplate
                } else {
                    d = this.calendarNonclickTemplate
                }
            }
            var c = jindo.$Template(d).process({
                YEAR: (b.nYear),
                MONTH: (b.nMonth),
                DATE: (b.nDate)
            });
            b.elDate.innerHTML = c;
            if (b.nMonth - 1 == this.current_month && b.nDate == this.current_date) {
                b.elDate.className += " cal_today"
            }
        }, this).bind();
        this.oCalendar.attach(a)
    },
    setPrevBtnDmm: function(a) {
        this.oPrevCalendarBtn.removeClass("bt_pv_dmm");
        if (a.nYear == this.startDate.year && a.nMonth == this.startDate.month) {
            this.oPrevCalendarBtn.addClass("bt_pv_dmm")
        }
        if ((a.nYear == this.startDate.year && a.nMonth < this.startDate.month) || (a.nYear + 1 == this.startDate.year && (a.nMonth % 12) < this.startDate.month)) {
            this.oPrevCalendarBtn.addClass("bt_pv_dmm");
            a.stop()
        }
    },
    setNextBtnDmm: function(a) {
        this.oNextCalendarBtn.removeClass("bt_nx_dmm");
        if (a.nYear == this.endDate.year && a.nMonth == this.endDate.month) {
            this.oNextCalendarBtn.addClass("bt_nx_dmm")
        }
        if ((a.nYear == this.endDate.year && a.nMonth > this.endDate.month) || (a.nYear - 1 == this.endDate.year && a.nMonth > (this.endDate.month % 12))) {
            this.oNextCalendarBtn.addClass("bt_nx_dmm");
            a.stop()
        }
    },
    setStart: function() {
        this.startDate = this.makeDateformText(this.attr.startDate);
        this.startDate.month++
    },
    setEnd: function() {
        this.endDate = this.makeDateformText(this.attr.endDate);
        this.endDate.month++
    },
    setCurrentDate: function() {
        this.current_year = this.now.getFullYear();
        this.current_month = this.now.getMonth();
        this.current_date = this.now.getDate();
        this.current_day = this.now.getDay();
        var b = (this.current_year).toString();
        var c = (this.current_month + 1).toString();
        var a = (this.current_date).toString();
        c = c.length < 2 ? "0" + c : c;
        a = a.length < 2 ? "0" + a : a;
        var d = jindo.$Template(this.currentDateTemplate).process({
            YEAR: (b),
            MONTH: (c),
            DATE: (a),
            DAY: (this.DAYS[this.current_day])
        });
        this.oToday.html(d);
        if (this.attr.startDate) {
            this.prevBlock = false;
            this.oPrevDateBtn.removeClass(this.attr.prevBtnDimmed);
            this.past.setFullYear(this.current_year, this.current_month, this.current_date - 1);
            if (this.startDate.timestamp > this.past.getTime()) {
                this.oPrevDateBtn.addClass(this.attr.prevBtnDimmed);
                this.prevBlock = true
            }
        }
        if (this.attr.endDate) {
            this.nextBlock = false;
            this.oNextDateBtn.removeClass(this.attr.nextBtnDimmed);
            this.past.setFullYear(this.current_year, this.current_month, this.current_date + 1);
            if (this.endDate.timestamp < this.past.getTime()) {
                this.oNextDateBtn.addClass(this.attr.nextBtnDimmed);
                this.nextBlock = true
            }
        }
        this.oCalendar.setDate(this.current_year, this.current_month + 1, this.current_date);
        this.oCalendar.draw()
    },
    makeDateformText: function(c) {
        var a = {};
        a.year = parseInt(c.substring(0, 4), 10);
        a.month = parseInt(c.substring(4, 6), 10) - 1;
        a.date = parseInt(c.substring(6), 10);
        if (this.attr.endDate == c) {
            a.date++
        }
        var b = new Date();
        b.setFullYear(a.year, a.month, a.date);
        b.setHours(0, 0, 0, 0);
        a.timestamp = b.getTime();
        return a
    },
    parseDate: function(c) {
        var a = {};
        a.year = parseInt(c.substring(0, 4), 10);
        a.month = parseInt(c.substring(4, 6), 10) - 1;
        a.date = parseInt(c.substring(6), 10);
        var b = new Date();
        b.setFullYear(a.year, a.month, a.date);
        b.setHours(0, 0, 0, 0);
        return b
    },
    prevDay: function() {
        if (this.prevBlock) {
            return
        }
        this.now.setFullYear(this.current_year, this.current_month, this.current_date - 1);
        this.setCurrentDate();
        this.getData(this.current_year, this.current_month + 1, this.current_date)
    },
    nextDay: function() {
        if (this.nextBlock) {
            return
        }
        this.now.setFullYear(this.current_year, this.current_month, this.current_date + 1);
        this.setCurrentDate();
        this.getData(this.current_year, this.current_month + 1, this.current_date)
    },
    openCalendar: function() {
        this.oDateLayer.css("display", "none");
        this.oCalendarLayer.css("display", "block");
        this.attr.openCalendarCallback(true)
    },
    closeCalendar: function() {
        this.oDateLayer.css("display", "block");
        this.oCalendarLayer.css("display", "none");
        this.attr.openCalendarCallback(false)
    },
    select: function(b, c, a) {
        this.past.setFullYear(b, c - 1, a);
        if (this.attr.startDate) {
            if (this.startDate.timestamp > this.past.getTime()) {
                return
            }
        }
        if (this.attr.endDate) {
            if (this.endDate.timestamp < this.past.getTime()) {
                return
            }
        }
        this.now.setFullYear(b, c - 1, a);
        this.setCurrentDate();
        this.getData(b, c, a)
    },
    getData: function(b, c, a) {
        this.attr.callback(b, c, a)
    },
    setNow: function() {
        this.now = new Date();
        this.setCurrentDate();
        this.getData(this.current_year, this.current_month + 1, this.current_date)
    },
    isStatus: function() {
        return this.oCalendarLayer.css("display") == "block"
    },
    update: function() {
        this.getData(this.current_year, this.current_month + 1, this.current_date)
    }
});
var FlickingManager = jindo.$Class({
    _bTouch: false,
    _bBlockFlickingNclkEvent: false,
    _pContextIndex: /[?&]?contextIndex=([0-9])/,
    $init: function(d, b, c, a) {
        this._sWrapperId = b;
        this._initOptions(a);
        this._initVar(d);
        this._elFlick = jindo.$(b);
        this._initPageButton(c);
        this._initFlicking(this._elFlick);
        if (this.nContentIndex > 0 || this.option("bInitSetting")) {
            this.update()
        }
    },
    _initOptions: function(a) {
        this.option({
            sPanelClass: "panel",
            sNumAreaClass: ".pg_num_area",
            sPrevBtnClass: ".pg_btn_prev",
            sNextBtnClass: ".pg_btn_next",
            nContextIndex: 1,
            bHistoryMemory: false,
            bInitSetting: false,
            sPrevNclkCode: undefined,
            sNextNclkCode: undefined,
            nMaxPageDot: null,
            fCallbackAfterFlicking: function() {},
            sCurrentPageCtrlTpl: ' <em title="현재 페이지" class="pg_num pg_num_on">{=pageNum}</em> ',
            sPageCtrlTpl: ' <span class="pg_num">{=pageNum}</span> '
        });
        this.option(a || {})
    },
    _getContextIndexParam: function() {
        var b = document.location.href;
        var a = b.match(this._pContextIndex);
        if (a) {
            return a[1]
        }
        return null
    },
    _initVar: function(b) {
        this.aContentsList = b;
        this._oHistoryMemory = new UserStorage({
            sNamespace: this._getStorageNameSpace()
        });
        var c = this._getContextIndexParam();
        if (c) {
            this.nContentIndex = parseInt(c, 10) - 1;
            return
        }
        if (this.option("bHistoryMemory") && historyManager && (historyManager.getState() == historyManager.oStateType.back)) {
            var a = this._oHistoryMemory.getItem("contentIndex");
            if (a <= this.aContentsList.length) {
                this.nContentIndex = this._oHistoryMemory.getItem("contentIndex")
            } else {
                this.nContentIndex = 0
            }
        } else {
            this.nContentIndex = this.option("nContextIndex") - 1
        }
    },
    _initPageButton: function(b) {
        var d = jindo.$Element(b);
        if (!d) {
            return
        }
        this.nMaxPageDot = this.option("nMaxPageDot");
        this.welPage = d.query(this.option("sNumAreaClass"));
        var a = d.query(this.option("sPrevBtnClass"));
        var c = d.query(this.option("sNextBtnClass"));
        a && a.attach("click", jindo.$Fn(this.movePrev, this).bind());
        c && c.attach("click", jindo.$Fn(this.moveNext, this).bind())
    },
    _initFlicking: function(a) {
        var c = {
            nTotalContents: this.aContentsList.length,
            bUseCircular: true,
            sContentClass: this.option("sPanelClass")
        };
        var b = this;
        this.oFlicking = new jindo.m.Flicking(a, c).attach({
            touchStart: function(d) {
                b._bTouch = true
            },
            touchEnd: function(d) {
                b._bTouch = false
            },
            afterFlicking: function(d) {
                if (d.bLeft) {
                    b.nContentIndex = b._getNextContentIndex(b.nContentIndex)
                } else {
                    b.nContentIndex = b._getPrevContentIndex(b.nContentIndex)
                }
                b.update(false);
                if (b._bBlockFlickingNclkEvent) {
                    b._bBlockFlickingNclkEvent = false;
                    return
                }
                if (d.bLeft && b.option("sNextNclkCode")) {
                    nclk(a, b.option("sNextNclkCode"), "", "")
                } else {
                    if (b.option("sPrevNclkCode")) {
                        nclk(a, b.option("sPrevNclkCode"), "", "")
                    }
                }
                b.option("fCallbackAfterFlicking")()
            }
        })
    },
    update: function(a) {
        a = (typeof a === "boolean") ? a : true;
        this._updatePanel(a);
        this._updatePageCtrl();
        this._updateHistory()
    },
    _updatePanel: function(b) {
        var a = this._getPrevContentIndex(this.nContentIndex);
        var c = this._getNextContentIndex(this.nContentIndex);
        if (b) {
            this.oFlicking.getElement().html(!!this.aContentsList[this.nContentIndex].html ? this.aContentsList[this.nContentIndex].html() : this.aContentsList[this.nContentIndex])
        }
        this.oFlicking.getNextElement().html(!!this.aContentsList[c].html ? this.aContentsList[c].html() : this.aContentsList[c]);
        this.oFlicking.getPrevElement().html(!!this.aContentsList[a].html ? this.aContentsList[a].html() : this.aContentsList[a])
    },
    _updatePageCtrl: function(b) {
        var h = [];
        var e = "";
        var f = "";
        if (this.nMaxPageDot && this.nMaxPageDot % 2 == 1) {
            var g = this.aContentsList.length < this.nMaxPageDot ? this.aContentsList.length : this.nMaxPageDot;
            var d = this.nContentIndex;
            var c = Math.floor(this.nMaxPageDot / 2);
            if (this.aContentsList.length > this.nMaxPageDot) {
                if (this.nContentIndex > c && this.nContentIndex < this.aContentsList.length - c) {
                    d = c
                } else {
                    if (this.nContentIndex >= this.aContentsList.length - c) {
                        d = this.nMaxPageDot - (this.aContentsList.length - this.nContentIndex)
                    }
                }
            }
            for (var a = 0; a < g; a++) {
                if (a == d) {
                    f = this.option("sCurrentPageCtrlTpl")
                } else {
                    f = this.option("sPageCtrlTpl")
                }
                e = jindo.$Template(f).process({
                    pageNum: (a + 1)
                });
                h.push(e)
            }
        } else {
            for (var a = 0; a < this.aContentsList.length; a++) {
                if (a == this.nContentIndex) {
                    f = this.option("sCurrentPageCtrlTpl")
                } else {
                    f = this.option("sPageCtrlTpl")
                }
                e = jindo.$Template(f).process({
                    pageNum: (a + 1)
                });
                h.push(e)
            }
        }
        if (this.welPage) {
            this.welPage.html(h.join(""))
        }
    },
    _updateHistory: function() {
        if (!this.option("bHistoryMemory")) {
            return
        }
        this._oHistoryMemory.setItem("contentIndex", this.nContentIndex)
    },
    movePrev: function(a) {
        if (a) {
            a.stopDefault()
        }
        this._bBlockFlickingNclkEvent = true;
        this.oFlicking.movePrev();
        this.option("fCallbackAfterFlicking")()
    },
    moveNext: function(a) {
        if (a) {
            a.stopDefault()
        }
        this._bBlockFlickingNclkEvent = true;
        this.oFlicking.moveNext();
        this.option("fCallbackAfterFlicking")()
    },
    _getPrevContentIndex: function(a) {
        a--;
        if (a < 0) {
            return this.aContentsList.length - 1
        }
        return a
    },
    _getNextContentIndex: function(a) {
        a++;
        if (a >= this.aContentsList.length) {
            return 0
        }
        return a
    },
    _getStorageNameSpace: function() {
        return this._sWrapperId + window.location.pathname
    },
    setContents: function(a) {
        this.aContentsList = a;
        this._updatePanel(true)
    },
    isActivating: function() {
        return this.oFlicking && this.oFlicking.isActivating()
    },
    isTouch: function() {
        return this._bTouch
    }
}).extend(jindo.m.Component);
var OfficeHomeManager = jindo.$Class({
    _wePressList: null,
    _aGroupTitle: null,
    _sUserStorageName: "category_group",
    _oUserStorage: null,
    $init: function() {
        this._initElement();
        this._attachEvent();
        this._setOfficeList()
    },
    _initElement: function() {
        this._wePressList = jindo.$Element(jindo.$$.getSingle(".prs_list_wrp .prs_inner"));
        this._aGroupTitle = jindo.$$(".prs_list .prl_tit a", this._wePressList);
        this._oUserStorage = new UserStorage({
            sNamespace: this._sUserStorageName
        })
    },
    _attachEvent: function() {
        jindo.$Fn(this._toggleOfficeList, this).attach(this._aGroupTitle, "click")
    },
    _setOfficeList: function() {
        var d = jindo.$$(".prs_group", this._wePressList);
        for (var c = 0; c < d.length; c++) {
            var b = jindo.$Element(d[c]);
            var a = this._oUserStorage.getItem(this._sUserStorageName + c);
            if (a == "true") {
                b.addClass("open")
            } else {
                if (a == "false") {
                    b.removeClass("open")
                }
            }
        }
    },
    _toggleOfficeList: function(b) {
        b.stopDefault();
        var a = jindo.$Element(b.currentElement);
        var c = a.parent().parent();
        c.toggleClass("open");
        this._setHeight();
        nclk(this, "prs.ctg", "", "");
        this._oUserStorage.setItem(c.$value().id, c.hasClass("open"))
    },
    _setHeight: function() {},
    getPressListElement: function() {
        return this._wePressList
    },
    getGroupTitleArray: function() {
        return this._aGroupTitle
    },
    getUserStorage: function() {
        return this._oUserStorage
    }
});
var OfficeMainManager = jindo.$Class({
    _bIsOpen: false,
    $init: function() {},
    _initElement: function() {
        this.$super._initElement();
        this._wePressList = this.$super.getPressListElement();
        this.weContent = jindo.$Element("contentId");
        this.weWrapper = jindo.$Element(jindo.$$.getSingle(".prs_wrp", this.weContent));
        this.aTabButtons = jindo.$$(".prs_btn_slide", this.weWrapper);
        this.oSlideEffect = new jindo.m.LayerEffect({
            nDuration: 280,
            sTransitionTimingFunction: "ease-in-out"
        });
        this.weNewsFlash = jindo.$Element(jindo.$$.getSingle(".prs_section_wrp .prs_inner", this.weWrapper));
        this.weSectionButton = jindo.$Element(jindo.$$.getSingle(".prs_select", this.weNewsFlash));
        this.weSectionList = jindo.$Element(jindo.$$.getSingle(".pr_cate_list", this.weNewsFlash));
        this.weContent.height(this.weNewsFlash.height() + 70)
    },
    _attachEvent: function() {
        this.$super._attachEvent();
        jindo.$Fn(this._onload, this).attach(window, "load");
        jindo.$Fn(this._toggleTab, this).attach(this.aTabButtons, "click");
        jindo.$Fn(this._toggleSectionLayer, this).attach(this.weSectionButton, "click");
        var a = jindo.$Fn(this._rotate, this).bind();
        jindo.m.bindRotate(a)
    },
    _onload: function(b) {
        var a = this;
        jindo.$Fn(function() {
            a._setFontSizeManagerCallback();
            a._setHeight()
        }).delay(0.3)
    },
    _setFontSizeManagerCallback: function() {
        var a = this;
        if (fontSizeManager && fontSizeManager.setCallback) {
            fontSizeManager.setCallback(function() {
                a._setHeight()
            })
        }
    },
    _setHeight: function() {
        var a;
        if (this._bIsOpen) {
            a = this._wePressList.height()
        } else {
            a = this.weNewsFlash.height()
        }
        this.weContent.height(a)
    },
    _toggleTab: function(a) {
        a.stopDefault();
        this._bIsOpen = !this._bIsOpen;
        this._setHeight();
        if (this._bIsOpen) {
            this._slide("left");
            this._loadSecondAd();
            nclk(this, "prs.index", "", "")
        } else {
            this._slide("right");
            nclk(this, "prs.close", "", "")
        }
    },
    _slide: function(b) {
        var a = this;
        this.oSlideEffect.slide(this.weWrapper.$value(), b, {
            nDuration: 280,
            sTransitionTimingFunction: "ease-in-out",
            nDistance: a.weNewsFlash.width()
        })
    },
    _loadSecondAd: function() {
        if (nbp_ad && nbp_ad.mobilenetwork) {
            nbp_ad.mobilenetwork.ad_div_id = "adw_da2";
            if (jindo && jindo.LazyLoading) {
                jindo.LazyLoading.load(nbp_ad.mobilenetwork._url, function() {})
            }
        }
    },
    _toggleSectionLayer: function(a) {
        a.stopDefault();
        this.weSectionButton.toggleClass("open");
        this.weSectionList.toggleClass("visible");
        this._setHeight();
        nclk(this, "prs.sort", "", "")
    },
    _rotate: function() {
        if (this._bIsOpen) {
            this.weWrapper.css("left", this.weNewsFlash.width() * (-1))
        }
        this._setHeight()
    }
}).extend(OfficeHomeManager);
nhn.FontSizeManager = jindo.$Class({
    _localStorageKey: "newsFontSize",
    _fontSizeStep: 0,
    _fontSizeClass: null,
    _fontSizeClassList: ["", "bfsize1", "bfsize2"],
    _oSmallFontSizeBox: null,
    _oBigFontSizeBox: null,
    _floatingLayer: null,
    _floatingLayerWidth: 0,
    _floatingLayerHeight: 0,
    _isBlockFloatingLayer: false,
    _body: null,
    _callback: function() {},
    $init: function(a) {
        this._oStorage = new UserStorage({
            sNamespace: "",
            sStorageType: "localStorage"
        });
        this._fontSizeClass = this._oStorage.getItem(this._localStorageKey);
        this._body = jindo.$Element(document.body);
        this._oSmallFontSizeBox = jindo.$Element("news_small_font");
        this._oBigFontSizeBox = jindo.$Element("news_big_font");
        this._floatingLayer = a;
        this._initializeFontSize();
        this._attachEvent();
        this._displayFontButton();
        this.oLayerEffect = new jindo.m.LayerEffect()
    },
    _initializeFontSize: function() {
        this._deleteBodyFontClass();
        if (this._fontSizeClass) {
            if (this._fontSizeClass == "bfsize1") {
                this._fontSizeStep = 1
            } else {
                if (this._fontSizeClass == "bfsize2") {
                    this._fontSizeStep = 2
                }
            }
            this._saveLocalStorage();
            this._changeFontSize()
        } else {
            this._fontSizeStep = 0
        }
        this._floatingLayer.show();
        this._floatingLayerWidth = this._floatingLayer.width();
        this._floatingLayerHeight = this._floatingLayer.height();
        this._floatingLayer.hide()
    },
    _increaseFontSize: function() {
        if (this._fontSizeStep == 2) {
            if (!this._isBlockFloatingLayer) {
                this._displayFontBiggerComment("가장 큰 글자 크기 입니다.")
            }
            this._isBlockFloatingLayer = true
        } else {
            this._deleteBodyFontClass();
            this._fontSizeStep++;
            this._saveLocalStorage();
            this._changeFontSize();
            this._displayFontBiggerComment("글자 크기가 커졌습니다.");
            this._isBlockFloatingLayer = false
        }
        this._displayFontButton()
    },
    _decreaseFontSize: function() {
        if (this._fontSizeStep === 0) {
            if (!this._isBlockFloatingLayer) {
                this._displayFontSmallerComment("가장 작은 글자 크기 입니다.")
            }
            this._isBlockFloatingLayer = true
        } else {
            this._deleteBodyFontClass();
            this._fontSizeStep--;
            this._saveLocalStorage();
            this._changeFontSize();
            this._displayFontSmallerComment("글자 크기가 작아졌습니다.");
            this._isBlockFloatingLayer = false
        }
        this._displayFontButton()
    },
    _saveLocalStorage: function() {
        this._oStorage.setItem(this._localStorageKey, this._fontSizeClassList[this._fontSizeStep])
    },
    _changeFontSize: function() {
        this._body.addClass(this._fontSizeClassList[this._fontSizeStep])
    },
    _displayFontButton: function() {
        if (this._fontSizeStep === 0) {
            this._oSmallFontSizeBox.html("<span>가-</span>");
            this._oBigFontSizeBox.html("<a>가+</a>")
        } else {
            if (this._fontSizeStep == 2) {
                this._oSmallFontSizeBox.html("<a>가-</a>");
                this._oBigFontSizeBox.html("<span>가+</span>")
            } else {
                this._oSmallFontSizeBox.html("<a>가-</a>");
                this._oBigFontSizeBox.html("<a>가+</a>")
            }
        }
        this._callback()
    },
    _deleteBodyFontClass: function() {
        this._body.removeClass("bfsize1 bfsize2")
    },
    _displayFontBiggerComment: function(a) {
        this._floatingLayer.text(a);
        this._showFloatingLayer()
    },
    _displayFontSmallerComment: function(a) {
        this._floatingLayer.text(a);
        this._showFloatingLayer()
    },
    _showFloatingLayer: function() {
        this._floatingLayer.css("left", this._getFloatingLayerXPosition());
        var a = jindo.$("newsFontLayer");
        this.oLayerEffect.fade(a, "out", {
            nDuration: 2000,
            sTransitionTimingFunction: "ease-in-out"
        })
    },
    _getFloatingLayerXPosition: function() {
        return (window.innerWidth - this._floatingLayerWidth) * 0.5
    },
    _getFloatingLayerYPosition: function() {
        return jindo.$Document().scrollSize().height - jindo.$Document().scrollPosition().top - jindo.$Document().clientSize().height + this._floatingLayerHeight
    },
    _attachEvent: function() {
        this._oSmallFontSizeBox.attach("click", jindo.$Fn(function(a) {
            a.stopDefault();
            if (this.oLayerEffect.isPlaying()) {
                this.oLayerEffect.stop()
            }
            this._decreaseFontSize();
            nclk(this, "fot.zout", "", "")
        }, this).bind());
        this._oBigFontSizeBox.attach("click", jindo.$Fn(function(a) {
            a.stopDefault();
            if (this.oLayerEffect.isPlaying()) {
                this.oLayerEffect.stop()
            }
            this._increaseFontSize();
            nclk(this, "fot.zin", "", "")
        }, this).bind())
    },
    setCallback: function(a) {
        this._callback = (typeof a === "function") ? a : function() {}
    }
});
var NewTimeline = jindo.$Class({
    $init: function(c, b, a) {
        this.attr = {
            nDuration: 110,
            callback: function() {},
            index: 0,
            date: undefined,
            nclkPartName: undefined
        };
        for (var d in a) {
            this.attr[d] = a[d]
        }
        this.blockFlickingNclkEvent = false;
        this.componentIndexMap = {};
        this.scrollFlag = false;
        this.timelineId = c;
        this.top = jindo.$Element(c).parent();
        this.oContainer = jindo.$Element(b);
        this.oLi = jindo.$Element(jindo.$$.getSingle("li", jindo.$(this.timelineId)));
        this.parent = this.oContainer.parent();
        this.htInfo = jindo.m.getDeviceInfo();
        this.setItemCount();
        this.setIndex();
        this._initResize();
        setTimeout(jindo.$Fn(function() {
            this.resize()
        }, this).bind(), 1)
    },
    setIndex: function() {
        this.index = this.attr.index;
        if (this.attr.date) {
            for (var a in this.componentIndexMap) {
                if (this.componentIndexMap[a] == this.attr.date) {
                    this.index = parseInt(a, 10);
                    break
                }
            }
        }
    },
    click: function(a) {
        if (this.attr.nclkPartName) {
            this.blockFlickingNclkEvent = true
        }
        this.moveTo(a)
    },
    moveTo: function(b) {
        var a = Math.abs(this.index - b) + 1;
        var c = this.liWidth * b;
        this.index = b;
        if (this.scrollFlag) {
            this.oScroll.scrollTo(c, 0, this.attr.nDuration * a);
            this.attr.callback(this.componentIndexMap[b])
        }
    },
    setScroll: function() {
        this.liWidth = this.oLi.width();
        this.firstPos = 13;
        this.oContainer.css("margin-left", this.firstPos + "px");
        this.parent.width(this.itemCount * this.liWidth + this.top.width() - this.liWidth + 1);
        if (!this.scrollFlag && this.parent.width() > 0) {
            this.liHeight = this.oLi.height();
            this.oScroll = new jindo.m.Scroll(this.timelineId, {
                bUseHScroll: true,
                bUseVScroll: false,
                bUseMomentum: true,
                nDeceleration: 0.0005,
                bUseScrollbar: false,
                nHeight: this.liHeight
            }).attach({
                touchMove: jindo.$Fn(function(a) {
                    this.blockFlickingNclkEvent = false
                }, this).bind(),
                touchEnd: jindo.$Fn(function(a) {
                    if (this.blockFlickingNclkEvent) {
                        this.blockFlickingNclkEvent = false;
                        nclk(this, this.attr.nclkPartName + ".itlsel", "", "")
                    } else {
                        if (this.attr.nclkPartName) {
                            nclk(this, this.attr.nclkPartName + ".itlfl", "", "")
                        }
                    }
                }, this).bind(),
                afterScroll: jindo.$Fn(function(a) {
                    if (this.parent.width() === 0) {
                        return
                    }
                    var b = this.getIndex(a.nLeft);
                    this.moveTo(b)
                }, this).bind()
            });
            this.scrollFlag = true
        }
    },
    setItemCount: function() {
        var a = this.oContainer.child();
        this.itemCount = 0;
        a.forEach(jindo.$Fn(function(d, c, e) {
            if (d.attr("id")) {
                var b = d.child()[0].attr("id").substring(4);
                this.componentIndexMap[c] = b;
                this.itemCount++
            }
        }, this).bind())
    },
    _initResize: function() {
        this.resize = jindo.$Fn(function() {
            this.setScroll(this.timelineId);
            this.moveTo(this.index)
        }, this).bind();
        jindo.$Fn(this.resize).attach(window, "resize")
    },
    getIndex: function(c) {
        var b, a = 0;
        if (c < 0 && this.htInfo.android) {
            b = Math.abs(c) / this.liWidth;
            a = Math.floor(b)
        }
        if (c < 0) {
            b = (Math.abs(c) + this.liWidth / 2) / this.liWidth;
            a = Math.floor(b)
        }
        if (a >= this.itemCount) {
            a = this.itemCount - 1
        }
        return a
    }
});
var UserStorage = jindo.$Class({
    $static: {
        _bSupported: null,
        isSupport: function() {
            if (typeof UserStorage._bSupported === "boolean") {
                return UserStorage._bSupported
            }
            return UserStorage._bSupported = (function() {
                if ((typeof(window.Storage) === "undefined")) {
                    return false
                }
                var b = "storage_test_key",
                    c = window.localStorage;
                try {
                    c.setItem(b, "1");
                    c.removeItem(b);
                    return true
                } catch (a) {
                    return false
                }
            })()
        }
    },
    $init: function(a) {
        this._initOptions(a);
        this._storage = this._getInstance()
    },
    _initOptions: function(a) {
        this.option({
            sNamespace: "",
            sStorageType: "sessionStorage"
        });
        this.option(a || {})
    },
    _getInstance: function() {
        return UserStorage.isSupport() ? (function(a) {
            return window[a]
        })(this.option("sStorageType")) : (function(b) {
            var a = jindo.$Cookie();
            var c = ("localStorage" === b) ? 365 : 0;
            return {
                setItem: function(d, e) {
                    return a.set(d, e, c)
                },
                getItem: function(d) {
                    return a.get(d)
                },
                removeItem: function(d) {
                    return a.remove(d)
                }
            }
        })(this.option("sStorageType"))
    },
    _getNamespace: function() {
        return this.option("sNamespace") ? this.option("sNamespace") + "_" : ""
    },
    setItem: function(a, b) {
        this._storage.setItem(this._getNamespace() + a, b)
    },
    getItem: function(a) {
        return this._storage.getItem(this._getNamespace() + a)
    },
    removeItem: function(a) {
        this._storage.removeItem(this._getNamespace() + a)
    }
}).extend(jindo.m.Component);
if (typeof window.nhn === "undefined") {
    window.nhn = {}
}(function() {
    function f(h, i) {
        if (!h && h !== false) {
            throw new Error("Invalidate" + (!!i ? i : ""))
        }
    }

    function d(i, h, j) {
        if (new jindo.$Date(i).time() >= new jindo.$Date(h).time()) {
            throw new Error("Not Before" + (!!j ? j : ""))
        }
    }

    function e(h, i) {
        if (!/\d{4}-\d{2}-\d{2}/.test(h)) {
            throw new Error("Invalidate" + (!!i ? i : ""))
        }
    }

    function b(h, i) {
        if (!/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(h)) {
            throw new Error("Invalidate" + (!!i ? i : ""))
        }
    }
    var c = {
        DAYS_OF_WEEK: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        closeDayOfWeekHasRepetition: function(j, k) {
            for (var h = 0; h < 7; h++) {
                if (j.repetition[c.DAYS_OF_WEEK[(k + h) % 7]] === true) {
                    return h
                }
            }
            throw nhn.util.CalendarRepetition.INVALID_REPETITION
        },
        hasDayOfWeek: function(h) {
            return jindo.$A(c.DAYS_OF_WEEK).some(function(i) {
                return h.repetition[i] === true
            })
        },
        between: function(i, j, h) {
            return (!!i && !!j && !!h && j <= h && i >= j && i <= h)
        }
    };
    var g = {
        week: function(h) {
            if (!c.hasDayOfWeek(h)) {
                throw new Error("Invalidate" + (!!msg ? msg : ""))
            }
        },
        "default": function() {},
        instance: function(h) {
            return !!this[h] ? this[h] : this["default"]
        }
    };
    var a = jindo.$Class({
        instance: function(h) {
            return !!this[h] ? this[h] : this["default"]
        }
    });
    closeRepeatDay = new a();
    closeRepeatDay.day = function(l, i) {
        var j = (!!i) ? new jindo.$Date(i).time() : new Date().getTime();
        var h = new jindo.$Date(l.startDate).time();
        var k = 1000 * 60 * 60 * 24 * l.repetition.repeatCycle;
        var m = j + ((k - ((j - h) % k)) % k);
        return new Date(m)
    };
    closeRepeatDay.week = function(n, j) {
        var k = (!!j) ? new jindo.$Date(j).time() : new Date().getTime();
        var i = new jindo.$Date(n.startDate);
        var h = i.time();
        h += (c.closeDayOfWeekHasRepetition(n, i.day()) * 1000 * 60 * 60 * 24);
        var m = 1000 * 60 * 60 * 24 * 7 * n.repetition.repeatCycle;
        var o = k + ((m - ((k - h) % m)) % m);
        var l = jindo.$Date(o).day();
        return new Date(o + c.closeDayOfWeekHasRepetition(n, l) * 1000 * 60 * 60 * 24)
    };
    nhn.Schedule = jindo.$Class({
        $init: function(h) {
            this._htSchedule = h
        },
        validate: function() {
            f(this._htSchedule.startDate, "startDate");
            b(this._htSchedule.startDate, "startDate");
            f(this._htSchedule.endDate, "endDate");
            b(this._htSchedule.endDate, "endDate");
            d(this._htSchedule.startDate, this._htSchedule.endDate);
            f(this._htSchedule.content, "content");
            f(this._htSchedule.pageInfo, "pageInfo");
            if (this._htSchedule.repetitive) {
                f(this._htSchedule.repetition);
                f(this._htSchedule.repetition.type);
                f(this._htSchedule.repetition.repeatCycle);
                f(this._htSchedule.repetition.infinite);
                if (!this._htSchedule.repetition.infinite) {
                    f(this._htSchedule.repetition.endDate);
                    e(this._htSchedule.repetition.endDate)
                }
                g.instance(this._htSchedule.repetition.type)(this._htSchedule)
            }
        },
        _isRepetitive: function() {
            return !!this._htSchedule.repetitive
        },
        _isInfinite: function() {
            return !!this._htSchedule.repetition.infinite
        },
        _getCloseRepeatDay: function(h) {
            return closeRepeatDay.instance(this._htSchedule.repetition.type)(this._htSchedule, h)
        },
        _getRepeatEndDateTime: function() {
            return new jindo.$Date(this._htSchedule.repetition.endDate + this._htSchedule.startDate.substr(10)).$value()
        },
        _getIntervalWithStartAndEndDate: function() {
            return new jindo.$Date(this._htSchedule.endDate).time() - new jindo.$Date(this._htSchedule.startDate).time()
        },
        adjustedSchedule: function(i) {
            if (!this._htSchedule.serviceCode) {
                this._htSchedule.serviceCode = "58"
            }
            if (!this._htSchedule.pageUrl) {
                this._htSchedule.pageUrl = location.href
            }
            if (!this._htSchedule.alarm) {
                this._htSchedule.notifiable = true;
                this._htSchedule.alarm = {
                    serviceCode: "58",
                    scheduleTime: "10M",
                    mediaType: {
                        mail: 1,
                        sms: 1
                    }
                }
            }
            this._htSchedule.stickerId = this._htSchedule.stickerId || 64;
            this._htSchedule.isAlldaySchedule = this._htSchedule.isAlldaySchedule || false;
            this._htSchedule.important = this._htSchedule.important || false;
            if (!!this._isRepetitive()) {
                var h = this._getCloseRepeatDay(i);
                if (!this._isInfinite() && h.getTime() > this._getRepeatEndDateTime().getTime()) {
                    throw new Error("")
                }
                var j = jindo.$Date(h).format("Y-m-d H:i:00");
                var k = jindo.$Date(h.getTime() + this._getIntervalWithStartAndEndDate()).format("Y-m-d H:i:00");
                this._htSchedule.startDate = j;
                this._htSchedule.endDate = k
            }
            return this._htSchedule
        }
    })
})();
if (typeof window.nhn === "undefined") {
    window.nhn = {}
}(function() {
    nhn.ImageLazyLoader = jindo.$Class({
        $init: function(a) {
            this.oOptions = a || {
                attribute: "data-src"
            }
        },
        load: function(k, j) {
            j = (typeof j === "function") ? {
                loadAll: j
            } : (j || {});
            var d = {
                load: function(i) {},
                error: function(i) {},
                loadAll: function(i) {}
            };
            for (var b in j) {
                d[b] = j[b]
            }
            var l = k ? k.length : 0;
            if (l === 0) {
                d.loadAll(k);
                return
            }
            var m = this;

            function h(o, p) {
                p();
                l--;
                if (l === 0) {
                    d.loadAll(k)
                }
                var i = jindo.$Element(o);
                if (!i) {
                    return
                }
                i.attr(m.oOptions.attribute, null);
                i.detach("load", c);
                i.detach("error", f)
            }

            function c(i) {
                h(i.element, function() {
                    d.load(i.element)
                })
            }

            function f(i) {
                h(i.element, function() {
                    d.error(i.element)
                })
            }
            var e, g, n = [];
            for (e = 0, g = k.length; e < g; e++) {
                var a = jindo.$Element(k[e]);
                if (!a) {
                    continue
                }
                a.attach("load", c);
                a.attach("error", f);
                n.push({
                    wel: a,
                    src_attr: a.attr(m.oOptions.attribute)
                })
            }
            for (e = 0, g = n.length; e < g; e++) {
                n[e].wel.attr("src", n[e].src_attr)
            }
        }
    }).extend(jindo.m.Component || jindo.Component)
})();
ReadingObserver = {
    _NABOUT_RELATED_ARTICLE_HEIGHT: 270,
    _NREADING_TIME_WEIGHT: 0.015,
    _SHIT_URL: "/hit.json",
    _SRECORD_URL: "/read.json",
    sContentsId: null,
    oOptions: {
        sRecordPrefixUrl: "http://s.news.naver.com/article",
        sContentBottomId: "adw_da",
        oid: null,
        aid: null,
        sid: null,
        articleType: null
    },
    bHalf: false,
    bRecorded: false,
    nConnectionTime: null,
    nScrollCount: 0,
    nBackgroundCount: 0,
    nAboutReadingTime: 1000000000,
    nContentHeight: 10000,
    nMinimumScrollCount: 100,
    start: function(b, a) {
        this.sContentsId = b;
        for (var c in a) {
            this.oOptions[c] = a[c]
        }
        this.nConnectionTime = this.getTime();
        this._initDocumentEvent();
        this._attachEvent();
        this._hit()
    },
    _initDocumentEvent: function() {
        if (!document.getElementsByClassName) {
            document.getElementsByClassName = function(g) {
                var f = new RegExp("\\b" + g + "\\b"),
                    d = document.getElementsByTagName("*"),
                    c = [],
                    e = 0,
                    b;
                while (b = d[e++]) {
                    if (b.className && b.className.indexOf(g) + 1) {
                        if (b.className === g) {
                            c[c.length] = b;
                            continue
                        }
                        f.test(b.className) ? (c[c.length] = b) : 0
                    }
                }
                return c
            }
        }
    },
    _attachEvent: function() {
        if (window.attachEvent) {
            window.attachEvent("onscroll", this.bind(this._scrollEnd, this));
            window.attachEvent("onload", this.bind(this._setAboutReadingTime, this))
        } else {
            if (document.addEventListener) {
                window.addEventListener("scroll", this.bind(this._scrollEnd, this), false);
                window.addEventListener("load", this.bind(this._setAboutReadingTime, this), false)
            }
        }
    },
    _scrollEnd: function() {
        if (!!rmcPlayer && rmcPlayer.isPlaying() && naver.dic.tooltip.main.isOpen()) {
            naver.dic.tooltip.main.close()
        }
        if (this.bRecorded) {
            return
        }
        this.nScrollCount++;
        this._checkReadStatus();
        setTimeout(this.bind(this._reconfirm, this), 3000);
        this.nBackgroundCount++
    },
    _setAboutReadingTime: function() {
        this.nAboutReadingTime = this._getAboutReadingTime()
    },
    _checkReadStatus: function() {
        this.nContentHeight = this._getContentHeight();
        this.nMinimumScrollCount = this._getMinimumScrollCount();
        if (this._isPassedContents() && this._isTimeOver() && this._iscountedScroll()) {
            this._recordingAll()
        }
    },
    _getAboutReadingTime: function() {
        var a = this.$(this.sContentsId).innerHTML.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/g, "");
        var c = "";
        var b = this.$$("link_news");
        if (b.length > 0) {
            c = b[0].innerHTML.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/g, "")
        }
        return ((a.length - c.length) * this._NREADING_TIME_WEIGHT) * 1000
    },
    _getContentHeight: function() {
        if (this.$(this.oOptions.sContentBottomId)) {
            return this.$(this.oOptions.sContentBottomId).offsetTop - this._NABOUT_RELATED_ARTICLE_HEIGHT - document.documentElement.clientHeight
        } else {
            return
        }
    },
    _getMinimumScrollCount: function() {
        return (this.nContentHeight / document.documentElement.clientHeight)
    },
    _hit: function() {
        (new Image()).src = this.oOptions.sRecordPrefixUrl + this._SHIT_URL + this._getParam()
    },
    _recordingAll: function() {
        (new Image()).src = this.oOptions.sRecordPrefixUrl + this._SRECORD_URL + this._getParam();
        this.bRecorded = true
    },
    _getParam: function() {
        var a = [];
        if (this.oOptions.oid) {
            a.push("officeId=" + this.oOptions.oid)
        }
        if (this.oOptions.aid) {
            a.push("articleId=" + this.oOptions.aid)
        }
        if (this.oOptions.sid) {
            a.push("sectionId=" + this.oOptions.sid)
        }
        if (this.oOptions.articleType) {
            a.push("articleType=" + this.oOptions.articleType)
        }
        if (this.oOptions.hitRefererType) {
            a.push("hitRefererType=" + this.oOptions.hitRefererType)
        }
        if (this.oOptions.gdid) {
            a.push("gdid=" + this.oOptions.gdid)
        }
        return "?" + a.join("&")
    },
    _reconfirm: function() {
        this.nBackgroundCount--;
        if (this.bRecorded || this.nBackgroundCount > 0) {
            return
        }
        this._checkReadStatus()
    },
    _isPassedContents: function() {
        return this.getScrollTop() >= this.nContentHeight
    },
    _isTimeOver: function() {
        return (this.nConnectionTime + this.nAboutReadingTime) <= this.getTime()
    },
    _iscountedScroll: function() {
        return this.nScrollCount >= this.nMinimumScrollCount
    },
    $: function(a) {
        return document.getElementById(a)
    },
    $$: function(a) {
        return document.getElementsByClassName(a)
    },
    bind: function(a, b) {
        return function() {
            a.apply(b, arguments)
        }
    },
    getScrollTop: function() {
        return document.all ? (!document.documentElement.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop) : (window.pageYOffset ? window.pageYOffset : window.scrollY)
    },
    getTime: function() {
        return (new Date()).getTime()
    }
};
DateCustomSelectbox = $Class({
    $init: function(b, a) {
        this._assignOption(b, a);
        this._assignMemberVariable();
        this._attachEventListener();
        this._startApplication()
    },
    _assignOption: function(b, a) {
        a = a || {};
        a.htScroll = a.htScroll || {};
        $Jindo.isBoolean(a.bSolar) ? 0 : a.bSolar = !0;
        $Jindo.isBoolean(a.htScroll.bUseScrollbar) ? 0 : a.htScroll.bUseScrollbar = !1;
        this.option(a);
        this.option("elRoot", b)
    },
    _assignMemberVariable: function() {
        var a = this._getToday();
        this._REAL_MIN_YEAR = 1898;
        this._DAYS = ["일", "월", "화", "수", "목", "금", "토"];
        this._oDate = new Date();
        this._nYear = a.year;
        this._nMonth = a.month;
        this._nDay = a.day;
        this._nHour = a.hour;
        this._nMinute = a.minute;
        this.welRoot = $Element(this.option("elRoot"));
        this.welSelector = this.welRoot.query("._selector");
        this.welStatus = this.welRoot.query("._selectorText");
        this.welListRoot = this.welRoot.query("._selectorLayer");
        this.welTimeSelector = this.welRoot.query("._time_selector");
        this.welTimeStatus = this.welRoot.query("._time_selectorText");
        this.welTimeListRoot = this.welRoot.query("._time_selectorLayer");
        this._aLunarMonthTable = [
            [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
            [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
            [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
            [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
            [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
            [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
            [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
            [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
            [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
            [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
            [1, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
            [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
            [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
            [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
            [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
            [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1],
            [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
            [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
            [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
            [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
            [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2]
        ];
        var e = this.welListRoot.query("._year");
        var c = this.welListRoot.query("._month");
        var f = this.welListRoot.query("._day");
        this._waWelScrollWrapper = $A([e, c, f]);
        this._welYearList = e.query("._list");
        this._welMonthList = c.query("._list");
        this._welDateList = f.query("._list");
        this._oYearScroll = this._getScrollComponent(e, this._selectYear);
        this._oMonthScroll = this._getScrollComponent(c, this._selectMonth);
        this._oDateScroll = this._getScrollComponent(f, this._selectDate);
        this._waScroll = $A([this._oYearScroll, this._oMonthScroll, this._oDateScroll]);
        if (this.welTimeSelector) {
            var b = this.welTimeListRoot.query("._hour");
            var d = this.welTimeListRoot.query("._minute");
            this._waWelScrollWrapper.push(b, d);
            this._welHourList = b.query("._list");
            this._welMinuteList = d.query("._list");
            this._oHourScroll = this._getScrollComponent(b, this._selectHour);
            this._oMinuteScroll = this._getScrollComponent(d, this._selectMinute);
            this._waScroll.push(this._oHourScroll, this._oMinuteScroll)
        }
    },
    _attachEventListener: function() {
        this.welSelector.attach("click", $Fn(this._onTriggerClick, this).bind(true));
        $Fn(this._onCloseBtnClick, this).attach(this.welRoot.queryAll("._close"), "click");
        $Fn(this._onTodayBtnClick, this).attach(this.welRoot.queryAll("._today"), "click");
        if (this.welRoot.query(".hn_prev_move")) {
            this.welRoot.query(".hn_prev").attach("click", $Fn(this._onPrevBtnClick, this).bind())
        }
        if (this.welRoot.query(".hn_next_move")) {
            this.welRoot.query(".hn_next").attach("click", $Fn(this._onNextBtnClick, this).bind())
        }
        if (this.welTimeSelector) {
            this.welTimeSelector.attach("click", $Fn(this._onTriggerClick, this).bind(false))
        }
    },
    _getScrollComponent: function(a, b) {
        return (new jindo.m.Scroll(a, this.option("htScroll"))).attach({
            touchStart: $Fn(function(c) {
                this._bIsTouchStart = !0
            }, this).bind(),
            touchMove: $Fn(function(c) {
                this._bIsTouchStart = !1
            }, this).bind(),
            touchEnd: $Fn(function(d) {
                var c = $Element(d.oEvent.element);
                this._bIsTouchStart && c.query("! ._list") && c.tag != "li" && (c = c.query("! li"), b.call(this, parseInt(c.attr("data-value"), 10)))
            }, this).bind()
        })
    },
    _selectYear: function(c, a) {
        typeof a == "undefined" ? a = !0 : 0, this._setYear(c), this._refreshDateList(), this._oDateScroll.refresh(), this._highlightItem(this._getItemByValue(this._welYearList, c)), this._updateSelector(this.getSelectedDate()), a && (this.fireEvent("yearSelect", {
            nYear: c
        }), this.fireEvent("updateYear", this._getDefaultEventParam()))
    },
    _selectMonth: function(c, a) {
        typeof a == "undefined" ? a = !0 : 0, this._setMonth(c), this._refreshDateList(), this._oDateScroll.refresh(), this._highlightItem(this._getItemByValue(this._welMonthList, c)), this._updateSelector(this.getSelectedDate()), a && (this.fireEvent("monthSelect", {
            nMonth: c
        }), this.fireEvent("updateMonth", this._getDefaultEventParam()))
    },
    _selectDate: function(c, a) {
        typeof a == "undefined" ? a = !0 : 0, this._setDate(c), this._highlightItem(this._getItemByValue(this._welDateList, c)), this._updateSelector(this.getSelectedDate()), a && (this.fireEvent("dateSelect", {
            nDate: c
        }), this.fireEvent("updateDay", this._getDefaultEventParam()))
    },
    _selectHour: function(c, a) {
        typeof a == "undefined" ? a = !0 : 0, this._setHour(c), this._highlightItem(this._getItemByValue(this._welHourList, c)), this._updateSelector(this.getSelectedDate()), a && (this.fireEvent("hourSelect", {
            nHour: c
        }), this.fireEvent("updateHour", this._getDefaultEventParam()))
    },
    _selectMinute: function(c, a) {
        typeof a == "undefined" ? a = !0 : 0, this._setMinute(c), this._highlightItem(this._getItemByValue(this._welMinuteList, c)), this._updateSelector(this.getSelectedDate()), a && (this.fireEvent("minuteSelect", {
            nMinute: c
        }), this.fireEvent("updateMinute", this._getDefaultEventParam()))
    },
    getDate: function() {
        return {
            year: this._nYear,
            month: this._nMonth,
            day: this._nDay,
            hour: this._nHour,
            minute: this._nMinute
        }
    },
    _getToday: function() {
        var a = new Date();
        return {
            year: a.getFullYear(),
            month: (a.getMonth() + 1),
            day: a.getDate(),
            hour: a.getHours(),
            minute: a.getMinutes()
        }
    },
    _getPrevday: function() {
        this._oDate.setFullYear(this._nYear, this._nMonth - 1, this._nDay);
        this._oDate.setDate(this._oDate.getDate() - 1);
        return {
            year: this._oDate.getFullYear(),
            month: (this._oDate.getMonth() + 1),
            day: this._oDate.getDate(),
            hour: this._nHour,
            minute: this._nMinute
        }
    },
    _getNextday: function() {
        this._oDate.setFullYear(this._nYear, this._nMonth - 1, this._nDay);
        this._oDate.setDate(this._oDate.getDate() + 1);
        return {
            year: this._oDate.getFullYear(),
            month: (this._oDate.getMonth() + 1),
            day: this._oDate.getDate(),
            hour: this._nHour,
            minute: this._nMinute
        }
    },
    setDateParam: function(d, e, b, a, f) {
        d < this.option("nMin") ? d = this.option("nMin") : 0;
        d > this.option("nMax") ? d = this.option("nMax") : 0;
        this._selectYear(d * 1, !1);
        e < 1 ? e = 1 : 0;
        e > 12 ? e = 12 : 0;
        this._selectMonth(e * 1, !1);
        var c = this._getLastDate(this._nYear, this._nMonth);
        b < 1 ? b = 1 : 0;
        b > c ? b = c : 0;
        this._selectDate(b * 1, !1);
        if (this.welTimeSelector) {
            a < 0 ? a = 0 : 0;
            a > 23 ? a = 23 : 0;
            this._selectHour(a * 1, !1);
            f < 0 ? f = 0 : 0;
            f > 59 ? f = 59 : 0;
            this._selectMinute(f * 1, !1)
        }
        this._scrollToTurnOnItems()
    },
    setDate: function(b) {
        b.year < this.option("nMin") ? b.year = this.option("nMin") : 0;
        b.year > this.option("nMax") ? b.year = this.option("nMax") : 0;
        this._selectYear(b.year * 1, !1);
        b.month < 1 ? b.month = 1 : 0;
        b.month > 12 ? b.month = 12 : 0;
        this._selectMonth(b.month * 1, !1);
        var a = this._getLastDate(this._nYear, this._nMonth);
        b.day < 1 ? b.day = 1 : 0;
        b.day > a ? b.day = a : 0;
        this._selectDate(b.day * 1, !1);
        if (this.welTimeSelector) {
            b.hour < 0 ? b.hour = 0 : 0;
            b.hour > 23 ? b.hour = 23 : 0;
            this._selectHour(b.hour * 1, !1);
            b.minute < 0 ? b.minute = 0 : 0;
            b.minute > 59 ? b.minute = 59 : 0;
            this._selectMinute(b.minute * 1, !1)
        }
        this._scrollToTurnOnItems();
        return this
    },
    showList: function(a) {
        typeof a == "undefined" ? a = !0 : 0;
        this.welListRoot.show();
        this._scrollToTurnOnItems();
        a && (this.fireEvent("showOption"), this.fireEvent("showSelector", this._getDefaultEventParam()));
        return this
    },
    hideList: function(a) {
        typeof a == "undefined" ? a = !0 : 0;
        this.welListRoot.hide();
        a && (this.fireEvent("hideOption"), this.fireEvent("hideSelector", this._getDefaultEventParam()));
        return this
    },
    showTimeList: function(a) {
        typeof a == "undefined" ? a = !0 : 0;
        this.welTimeListRoot.show();
        this._scrollToTurnOnItems();
        a && (this.fireEvent("showOption"), this.fireEvent("showSelector", this._getDefaultEventParam()));
        return this
    },
    hideTimeList: function(a) {
        if (this.welTimeListRoot) {
            typeof a == "undefined" ? a = !0 : 0;
            this.welTimeListRoot.hide();
            a && (this.fireEvent("hideOption"), this.fireEvent("hideSelector", this._getDefaultEventParam()))
        }
        return this
    },
    getCalendarType: function() {
        return this.option("bSolar")
    },
    setCalendarType: function(a) {
        return $Jindo.isBoolean(a) ? 0 : a = !0, this.option("bSolar", a)
    },
    refreshDateList: function() {
        return this._refreshDateList(), this._oDateScroll.refresh(), this._updateSelector(this.getSelectedDate()), this
    },
    refreshToToday: function() {
        return this.updateDate(this._getToday(), !1), this
    },
    isListShowed: function() {
        return this.welListRoot.visible()
    },
    updateToday: function() {
        this.refreshToToday()
    },
    showOptionList: function(a) {
        typeof a == "undefined" ? a = !1 : 0, this.showList(a)
    },
    hideOptionList: function(a) {
        typeof a == "undefined" ? a = !1 : 0, this.hideList(a)
    },
    setAutoDay: function() {
        this.refreshDateList()
    },
    updateDate: function(d, c) {
        this.setDate(d, c)
    },
    getSelectedDate: function() {
        return this.getDate()
    },
    setSolarType: function(a) {
        this.setCalendarType(a)
    },
    _startApplication: function() {
        this._renderLists(), this._updateSelector(this.getSelectedDate()), this.option("bDisplayOption") ? this.showList() : this.hideList()
    },
    _highlightItem: function(c) {
        var a = c ? c.query("! ._list .on") : null;
        a ? a.removeClass("on") : 0, c ? c.addClass("on") : 0
    },
    _updateSelector: function(a) {
        this.welStatus.attr("datetime", a.year + "-" + this._getDoubleFigureString(a.month) + "-" + this._getDoubleFigureString(a.day));
        this.welStatus.html(this._getStatusString(a));
        if (this.welTimeStatus) {
            this.welTimeStatus.attr("datetime", a.hour + ":" + this._getDoubleFigureString(a.minute));
            this.welTimeStatus.html(a.hour + ":" + this._getDoubleFigureString(a.minute))
        }
    },
    _getStatusString: function(a) {
        this._oDate.setFullYear(a.year, a.month - 1, a.day);
        return a.year + "." + a.month + "." + a.day + " <em>" + this._DAYS[this._oDate.getDay()] + "</em>"
    },
    _getDoubleFigureString: function(b) {
        return typeof b == "string" ? b.length == 1 ? "0" + b : b : b < 10 ? "0" + b : b
    },
    _refreshDateList: function() {
        var e = this._nDay,
            d = this._getLastDate(this._nYear, this._nMonth),
            f = e > d ? d : e;
        this._setDate(f), this._renderDateList(1, d, f)
    },
    _setYear: function(a) {
        this._nYear = a
    },
    _setMonth: function(a) {
        this._nMonth = a
    },
    _setDate: function(a) {
        this._nDay = a
    },
    _setHour: function(a) {
        this._nHour = a
    },
    _setMinute: function(a) {
        this._nMinute = a
    },
    _scrollToTurnOnItems: function() {
        this._waWelScrollWrapper.forEach($Fn(function(f, e, h) {
            var g = this._waScroll.get(e);
            g.refresh(), g.scrollTo(0, this._getTop(f))
        }, this).bind())
    },
    _renderLists: function() {
        this._welYearList.html(this._getListHTML(this.option("nMin"), this.option("nMax"), this._nYear, "년"));
        this._welMonthList.html(this._getListHTML(1, 12, this._nMonth, "월"));
        this._renderDateList(1, this._getLastDate(this._nYear, this._nMonth), this._nDay);
        if (this._welHourList) {
            this._welHourList.html(this._getListHTML(0, 23, this._nHour, "시"));
            this._welMinuteList.html(this._getListHTML(0, 59, this._nMinute, "분"))
        }
    },
    _renderDateList: function(e, d, f) {
        this._welDateList.html(this._getListHTML(e, d, f, "일"))
    },
    _getListHTML: function(h, f, l) {
        var k = [],
            j = h,
            i = $Template(this.option("sOptionTpl"));
        for (j; j <= f; j++) {
            k.push(i.process({
                idx: j,
                keyword: l
            }))
        }
        return k.join("")
    },
    _getItemByValue: function(b, c) {
        var a;
        return $A(b.queryAll("li")).forEach(function(e, f, d) {
            parseInt(e.attr("data-value"), 10) == c && (a = e, $A.Break())
        }), a
    },
    _getTop: function(b) {
        var f = b.query("li.on"),
            c = f ? f.$value().offsetTop * 1 : 0,
            h = f ? f.height() * 1 / 2 : 0,
            g = b.height() * 1 / 2,
            a = c > h * 2 ? c - g + h : 0;
        return a
    },
    _getDateOfLunarMonthType: function(d) {
        var c = {
            nMonthDate: 0,
            nLeapMonthDate: 0
        };
        switch (d) {
            case 1:
                c.nMonthDate = 29, c.nLeapMonthDate = 0;
                break;
            case 2:
                c.nMonthDate = 30, c.nLeapMonthDate = 0;
                break;
            case 3:
                c.nMonthDate = 29, c.nLeapMonthDate = 29;
                break;
            case 4:
                c.nMonthDate = 29, c.nLeapMonthDate = 30;
                break;
            case 5:
                c.nMonthDate = 30, c.nLeapMonthDate = 29;
                break;
            case 6:
                c.nMonthDate = 30, c.nLeapMonthDate = 30
        }
        return c
    },
    _getLastDate: function(h, g) {
        var l = 0,
            k, j, i, l;
        if (!this.option("bSolar")) {
            k = this._aLunarMonthTable[h - this._REAL_MIN_YEAR], j = this._getDateOfLunarMonthType(k[g - 1]), l = j.nMonthDate
        } else {
            if (g > 12 || g < 1) {
                i = new Date(h, g - 1, 1), h = i.getFullYear(), g = i.getMonth() + 1
            }
            l = 0;
            switch (g) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    l = 31;
                    break;
                case 4:
                case 6:
                case 9:
                case 11:
                    l = 30;
                    break;
                case 2:
                    h % 4 === 0 && h % 100 !== 0 || h % 400 === 0 ? l = 29 : l = 28
            }
        }
        return parseInt(l, 10)
    },
    _getDefaultEventParam: function() {
        return {
            elSelector: this.welSelector.$value(),
            elOption: this.welListRoot.$value()
        }
    },
    _onTriggerClick: function(a, c) {
        c.stopDefault();
        var b = "his_lst.";
        if (location.pathname == "/historyMainPanel.nhn") {
            b = "his_pan."
        }
        if (a) {
            this.welListRoot.visible() ? this.hideList() : (this.hideTimeList(), this.showList());
            b += "date"
        } else {
            this.welTimeListRoot.visible() ? this.hideTimeList() : (this.hideList(), this.showTimeList());
            b += "time"
        }
        nclk(this, b, "", "");
        this.fireEvent("clickSelector")
    },
    _onCloseBtnClick: function(b) {
        b.stopDefault();
        var a = "his_lst.";
        if (location.pathname == "/historyMainPanel.nhn") {
            a = "his_pan."
        }
        if (b.element.id == "timeClose") {
            a += "clkok"
        } else {
            a += "calok"
        }
        nclk(this, a, "", "");
        this.fireEvent("clickClose") && (this.hideList(), this.hideTimeList());
        this.fireEvent("hideClose", {
            elSelector: this.welSelector.$value()
        });
        location.href = location.pathname + "?searchYmdt=" + this._generateHistoryDateFormat()
    },
    _generateHistoryDateFormat: function() {
        return this._nYear + "-" + this._paddingZero(this._nMonth) + "-" + this._paddingZero(this._nDay) + " " + this._paddingZero(this._nHour) + ":" + this._paddingZero(this._nMinute)
    },
    _paddingZero: function(b) {
        var a = b;
        if (b < 10) {
            a = "0" + b
        }
        return a
    },
    _onTodayBtnClick: function(b) {
        b.stopDefault();
        var a = "his_lst.today";
        if (location.pathname == "/historyMainPanel.nhn") {
            a = "his_pan.today"
        }
        nclk(this, a, "", "");
        this.updateToday();
        location.href = location.pathname + "?searchYmdt=" + this._generateHistoryDateFormat()
    },
    _onPrevBtnClick: function(b) {
        b.stopDefault();
        var a = "his_lst.prev";
        if (location.pathname == "/historyMainPanel.nhn") {
            a = "his_pan.prev"
        }
        nclk(this, a, "", "");
        this.updateDate(this._getPrevday(), !1);
        location.href = location.pathname + "?searchYmdt=" + this._generateHistoryDateFormat()
    },
    _onNextBtnClick: function(b) {
        b.stopDefault();
        var a = "his_lst.next";
        if (location.pathname == "/historyMainPanel.nhn") {
            a = "his_pan.next"
        }
        nclk(this, a, "", "");
        this.updateDate(this._getNextday(), !1);
        location.href = location.pathname + "?searchYmdt=" + this._generateHistoryDateFormat()
    }
}).extend(jindo.m.Component);
var SafariPageNavigation = jindo.$Class({
    _requestMoreLook: null,
    _moreLook: null,
    _noMoreLook: null,
    _moreLookArea: null,
    _navigationArea: null,
    _page: 2,
    _url: "",
    _id: "",
    _callback: null,
    $init: function(d, g, c, b, e, a, f) {
        this._requestMoreLook = d;
        this._moreLook = g;
        this._noMoreLook = c;
        this._moreLookArea = b;
        this._navigationArea = e;
        this._url = a;
        this._callback = f == undefined ? function() {} : f
    },
    _clickEventHandler: function() {
        jindo.$Element("progress").show("block");
        var a = new jindo.$Ajax(this._url, {
            type: "xhr",
            method: "get",
            onload: jindo.$Fn(function(c) {
                var e = this._requestMoreLook.attr("id");
                var d = this._moreLook.attr("id");
                this._moreLook ? this._moreLookArea.remove(this._moreLook) : "";
                this._noMoreLook ? this._moreLookArea.remove(this._noMoreLook) : "";
                var b = c.text().split("<!--#DELIMITER#-->");
                this._moreLookArea.appendHTML(b[0]);
                this._navigationArea.appendHTML(b[1]);
                this._requestMoreLook = jindo.$Element(e);
                this._moreLook = jindo.$Element(d);
                this._requestMoreLook ? this.listenClickEvent() : "";
                this._page++;
                this._callback()
            }, this).bind(),
            async: true
        });
        a.request({
            page: this._page
        })
    },
    listenClickEvent: function() {
        jindo.$Fn(this._clickEventHandler, this).attach(this._requestMoreLook, "click")
    }
});
if (typeof nhn === "undefined") {
    nhn = {}
}
nhn.m = nhn.m || {};
nhn.m.news = nhn.m.news || {};
(function() {
    nhn.m.news.ScrollChangeDetecter = jindo.$Class({
        $init: function() {
            this._welDoc = jindo.$Document();
            this._oPosition = this._welDoc.scrollPosition();
            this._attachEvents()
        },
        _attachEvents: function() {
            var a = jindo.$Fn(this._onScrollHandler, this).bind();
            var b = jindo.$Fn(this._onResizeHandler, this).bind();
            if (nhn.m.news.util.isMobileTablet()) {
                jindo.$Element(document).attach("scroll", a);
                jindo.m.bindRotate(b)
            } else {
                jindo.$Element(document).attach("scroll", a);
                jindo.$Element(window).attach("resize", b)
            }
        },
        _onScrollHandler: function() {
            this.fireEvent("scroll", {});
            this._fireScrollChangedEvent()
        },
        _onResizeHandler: function() {
            this.fireEvent("resize", {});
            this._fireScrollChangedEvent()
        },
        _fireScrollChangedEvent: function() {
            var a = this._oPosition,
                c = this._welDoc.scrollPosition();
            var b = (a.top !== c.top || a.left !== c.left);
            if (b) {
                this.fireEvent("scrollChanged", {
                    prevPosition: a,
                    position: c,
                    changed: b
                });
                this._oPosition = c
            }
            this.fireEvent("scrollOrResize", {
                prevPosition: a,
                position: c,
                changed: b
            })
        }
    }).extend(jindo.m.Component)
})(nhn.m.news);
if (typeof nhn === "undefined") {
    nhn = {}
}
nhn.m = nhn.m || {};
nhn.m.news = nhn.m.news || {};
(function() {
    nhn.m.news.ElementInViewportFinder = jindo.$Class({
        $init: function(c, b) {
            this.wel = jindo.$Element(c);
            var a = {};
            this.option(a);
            this.option(b || {});
            this._attachEvents()
        },
        _attachEvents: function() {
            new nhn.m.news.ScrollChangeDetecter().attach("scrollOrResize", jindo.$Fn(function(a) {
                this.view()
            }, this).bind())
        },
        view: function() {
            if (this.isVisibleInViewport()) {
                this.fireEvent("find", {
                    el: this.wel.$value()
                })
            }
        },
        isVisibleInViewport: function() {
            return this.wel && this.wel.visible() && nhn.m.news.util.isExistInViewportHeight(this.wel.$value())
        }
    }).extend(jindo.m.Component)
})(nhn.m.news);
nhn.m.news.ResWebFontSizeManager = jindo.$Class({
    STORAGE_KEY: "newsFontSize",
    FONTSIZE_CLASSLIST: jindo.$A(["", "bfsize1", "bfsize2"]),
    $init: function(c, b) {
        this._welBody = jindo.$Element(document.body);
        this._welBase = jindo.$Element(c);
        this._oOption = b;
        this._welNotifyLayer = this._welBase.query(".lyr_fsize");
        this._welFontSize = this._welBase.query(".r_footer_fontsize");
        this._oLayerEffect = new jindo.m.LayerEffect().attach({
            afterEffect: jindo.$Fn(function(d) {
                jindo.$Element(d.elLayer).hide()
            }, this).bind()
        });
        this.oUserStorage = new UserStorage({
            sStorageType: "localStorage"
        });
        this._welTrigger = this._welFontSize.query(".fsize_trigger");
        this._waTriggerbuttonList = jindo.$A(this._welFontSize.queryAll("li"));
        var a = this.oUserStorage.getItem(this.STORAGE_KEY) || this.FONTSIZE_CLASSLIST.get(0);
        this._nFontSizeStep = Math.max(0, this.FONTSIZE_CLASSLIST.indexOf(a));
        this._changeFontSizeByStep(this._nFontSizeStep, true);
        this._attachEvent()
    },
    _attachEvent: function() {
        this._welFontSize.attach({
            "click@.smaller_size": jindo.$Fn(function(b) {
                b.stopDefault();
                var a = this._nFontSizeStep - 1;
                this._notifyMinFontSizeMsgLayer(a);
                this._changeFontSizeByStep(a, false)
            }, this).bind(),
            "click@.bigger_size": jindo.$Fn(function(b) {
                b.stopDefault();
                var a = this._nFontSizeStep + 1;
                this._notifyMinFontSizeMsgLayer(a);
                this._changeFontSizeByStep(a, false)
            }, this).bind(),
            "click@li[data-size]": jindo.$Fn(function(b) {
                b.stopDefault();
                var a = parseInt(jindo.$Element(b.element).data("size"), 10);
                this._notifyMinFontSizeMsgLayer(a);
                this._changeFontSizeByStep(a, false)
            }, this).bind()
        })
    },
    _changeFontSizeByStep: function(a, b) {
        a = Math.min(2, Math.max(0, a));
        this._nFontSizeStep = a;
        this.oUserStorage.setItem(this.STORAGE_KEY, this.FONTSIZE_CLASSLIST.get(this._nFontSizeStep));
        this._displayFontButton(this._nFontSizeStep, b)
    },
    _displayFontButton: function(a, c) {
        this._welBody.removeClass(this.FONTSIZE_CLASSLIST.$value().join(" "));
        this._welBody.addClass(this.FONTSIZE_CLASSLIST.get(a));
        var b = ["{if step <= 0}<span class='smaller_size'>가-</span>{else}<a href='#' class='smaller_size' onclick='nclk(this, \"{=prefix}.fctext\",\"\",\"\")'>가-</a>{/if}", "{if step >= 2}<span class='bigger_size'>가+</span>{else}<a href='#' class='bigger_size' onclick='nclk(this, \"{=prefix}.fctext\",\"\",\"\");'>가+</a>{/if}"].join("");
        this._welTrigger.html(jindo.$Template(b).process({
            step: a,
            prefix: this._oOption.prefix
        }));
        this._waTriggerbuttonList.forEach(function(d, e, f) {
            d[(e === a) ? "addClass" : "removeClass"]("on")
        });
        if (!c) {
            window.scrollTo(0, jindo.$Element("fontSize").offset().top)
        }
    },
    _notifyMinFontSizeMsgLayer: function(a) {
        a = Math.min(2, Math.max(0, a));
        var b = "";
        if (a === this._nFontSizeStep) {
            b = (a === 0) ? "가장 작은 글자 크기 입니다." : "가장 큰 글자 크기 입니다."
        } else {
            b = (a < this._nFontSizeStep) ? "글자 크기가 작아졌습니다." : "글자 크기가 커졌습니다."
        }
        this._oLayerEffect.stop();
        this._welNotifyLayer.html(b).show().css("position", "fixed").css("z-index", 1000).css("top", window.innerHeight - this._welNotifyLayer.height() - 90).css("left", (window.innerWidth - this._welNotifyLayer.width()) / 2);
        this._oLayerEffect.fade(this._welNotifyLayer.$value(), "out", {
            nDuration: 1500,
            sTransitionTimingFunction: "ease-in-out"
        })
    }
});
if (typeof nhn === "undefined") {
    nhn = {}
}
nhn.m = nhn.m || {};
nhn.m.news = nhn.m.news || {};
(function() {
    nhn.m.news.PageCacheFlicking = jindo.$Class({
        _initVar: function() {
            jindo.m.Flick.prototype._initVar.apply(this);
            if (!history || !history.state || !this.option("sPageCacheKey") || !history.state[this.option("sPageCacheKey")]) {
                return
            }
            this.option("nDefaultIndex", history.state[this.option("sPageCacheKey")])
        },
        _updateFlickInfo: function(a, b) {
            jindo.m.Flick.prototype._updateFlickInfo.apply(this, [a, b]);
            if (!history || !history.replaceState || !this.option("sPageCacheKey")) {
                return
            }
            var c = history.state || {};
            c[this.option("sPageCacheKey")] = this._nContentIndex;
            history.replaceState(c, null, null)
        }
    }).extend(jindo.m.SlideFlicking)
})(nhn.m.news);
if (typeof nhn === "undefined") {
    nhn = {}
}
nhn.m = nhn.m || {};
nhn.m.news = nhn.m.news || {};
(function() {
    nhn.m.news.CommentListCountManager = {
        _sMULTI_API_URL: "/api/comment/listCount.json",
        _oDEFALUT_OPTION: {
            base: document,
            isReload: false
        },
        _oTEMPLATES: {
            "default": jindo.$Template('<a href="/comment/list.nhn?gno=news{=oid}%2C{=aid}&oid={=oid}&aid={=aid}&tabFocusDisabled=true" class="r_ico_b r_cmt _template"{if nclk} onclick="nclk(this,\'{=nclk}\',\'\',\'\');"{/if}>{=count}<span class="r_symbol">+</span></a>'),
            headline: jindo.$Template('<a href="/comment/list.nhn?gno=news{=oid}%2C{=aid}&oid={=oid}&aid={=aid}&tabFocusDisabled=true" class="ico_cmt cmt _template"{if nclk} onclick="nclk(this,\'{=nclk}\',\'\',\'\');"{/if}>{=count}<span class="symbol">+</span></a>'),
            hotissue: jindo.$Template("<a href=\"/hotissue/comment/list.nhn?gno=news{=oid}%2C{=aid}&sid1={=params.sid1}&cid={=params.cid}&iid={=params.iid}&oid={=oid}&aid={=aid}&tabFocusDisabled=true\" class=\"ic_bf cmt\" onclick=\"nclk(this,'hot.artcmt','','');\">{=count}+</a>"),
            hotevent: jindo.$Template('<a href="/hotissue/group/comment/list.nhn?cid={=params.cid}&gno={=params.gno}&tabFocusDisabled=true">{=params.title}<span class="cmt_num"><span class="cmt_inr">{=count}</span></span></a>'),
            countOnly: jindo.$Template("{=count}")
        },
        init: function() {
            this._oAjax = new jindo.$Ajax(this._sMULTI_API_URL, {
                method: "post",
                timeout: 3,
                onload: jindo.$Fn(function(a) {
                    try {
                        var b = a.json();
                        this._injectCount(b.message.result)
                    } catch (c) {}
                }, this).bind(),
                onerror: function(a) {}
            });
            return this
        },
        view: function(a) {
            if (!this._oAjax.isIdle()) {
                return
            }
            this._htOption = this._oDEFALUT_OPTION;
            for (key in a) {
                this._htOption[key] = a[key]
            }
            this._findGnos();
            this._call()
        },
        _getElements: function() {
            return jindo.$A(jindo.$Element(this._htOption.base).queryAll("[data-comment]._rcount"))
        },
        _findGnos: function() {
            var a = [];
            this._waElements = this._getElements().filter(function(d, b, f) {
                var e = $Json(d.data("comment")).toObject();
                var c = e.gno;
                if (c && (c.length >= 10)) {
                    a.push(c);
                    return true
                } else {
                    d.removeClass("_rcount");
                    return false
                }
            });
            this._sGnos = a.join(";")
        },
        _call: function() {
            if (!this._sGnos) {
                return
            }
            this._oAjax.request({
                gnos: this._sGnos
            })
        },
        _injectCount: function(a) {
            jindo.$A(a).forEach(jindo.$Fn(function(j, h, i) {
                var b = this._waElements.get(h);
                b.removeClass("_rcount");
                var d = $Json(b.data("comment")).toObject();
                if (!d) {
                    return
                }
                if (d.callback) {
                    d.callback(b, j);
                    return
                }
                if (j.onOff == null || j.count == null || j.gno != d.gno || j.count < 0) {
                    return
                }
                var c = 999;
                if (d.type == "hotevent" || d.type == "countOnly") {
                    c = j.count
                } else {
                    if (j.count < 10) {
                        return
                    } else {
                        if (j.count < 30) {
                            c = 10
                        } else {
                            if (j.count < 50) {
                                c = 30
                            } else {
                                if (j.count < 100) {
                                    c = 50
                                } else {
                                    if (j.count < 1000) {
                                        c = parseInt(j.count / 100) * 100
                                    }
                                }
                            }
                        }
                    }
                }
                if (b.query("._template")) {
                    b.remove(b.query("._template"))
                }
                var g = d.type ? this._oTEMPLATES[d.type] : this._oTEMPLATES["default"];
                var e = j.gno.replace("news", "").split(",");
                var f = g.process({
                    oid: e[0],
                    aid: e[1],
                    count: c,
                    nclk: d.nclicks,
                    params: d.params
                });
                b.appendHTML(f)
            }, this).bind())
        }
    }.init()
})(nhn.m.news);
var CommentListCountManager = nhn.m.news.CommentListCountManager;
var RmcPlayer = jindo.$Class({
    $init: function() {
        this._welPlayer = $Element($Document().query(".u_rmcplayer"));
        if (!this._welPlayer) {
            return
        }
        this._sChannel = this._welPlayer.data("channel");
        this._oStorage = new UserStorage({
            sNamespace: "rmcplayer"
        });
        this._nQuality = this._oStorage.getItem("quality");
        if (!this._nQuality) {
            this._nQuality = 0
        }
        this._aButton = this._welPlayer.queryAll("LI");
        this._resetButton();
        this._welPlayer.attach("click@._play", $Fn(this._play, this).bind())
    },
    _resetButton: function() {
        for (i in this._aButton) {
            if ((i == 0 && this._nQuality == 2) || (i == 1 && this._nQuality == 1) || (i == 2 && this._nQuality == 0)) {
                this._aButton[i].addClass("on")
            } else {
                this._aButton[i].removeClass("on")
            }
        }
    },
    _play: function(c) {
        var a = jindo.m.getDeviceInfo();
        if (!a.android && !a.ipad && !a.iphone && !a.inapp) {
            alert("본 동영상의 재생을 지원하지 않는 기기입니다.");
            return
        }
        var d = $Element(c.element).data("quality");
        if (d) {
            this._nQuality = d;
            this._resetButton()
        } else {
            d = this._nQuality
        }
        this._oStorage.setItem("quality", d);
        var b = $Element(c.element).data("nclick");
        if (!b) {
            b = this._welPlayer.query("A[data-quality=" + d + "]").data("nclick")
        }
        if (b) {
            nclk(this, b, "", "")
        }
        nmp.play({
            chId: this._sChannel,
            videoIndex: d
        })
    }
});
var PullDownEffect = jindo.$Class({
    $init: function(a, b) {
        this.option({
            initMargin: -50
        });
        this.option(b || {});
        this._initElement(a);
        this._attachEvent()
    },
    _initElement: function(a) {
        this._welBase = jindo.$Element(a);
        this._welFrontMoreBar = this._welBase.query(".r_more");
        this._oTouch = new jindo.m.Touch(a);
        this._oMorph = new jindo.m.Morph({
            fEffect: jindo.m.Effect.linear
        });
        this._doc = jindo.$Document()
    },
    _attachEvent: function() {
        var a = this;
        this._oTouch.attach({
            touchStart: function(b) {
                a._touchStart()
            },
            touchEnd: function(b) {
                a.up()
            },
            touchMove: function(b) {
                a._pullDown(b)
            }
        })
    },
    _touchStart: function() {
        this._isActivate = this._doc.scrollPosition().top <= 2
    },
    _pullDown: function(b) {
        var a = parseInt(this._welFrontMoreBar.css("margin-top"));
        if (!this._oMorph.isPlaying() && this._isActivate && b.nDistanceY > 10 && a <= -10) {
            b.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
            this._welFrontMoreBar.css("margin-top", (a + 10) + "px")
        }
    },
    up: function() {
        var a = parseInt(this._welFrontMoreBar.css("margin-top"));
        if (a <= this.option("initMargin")) {
            return
        }
        if (a >= 0) {
            this._welFrontMoreBar.css("margin-top", "-10px");
            this._welFrontMoreBar.removeClass("r_more_stop");
            this._welFrontMoreBar.addClass("r_more_load");
            this._welFrontMoreBar.html("<p>새로고침 중</p>");
            this._oMorph.pushWait(600)
        }
        this._oMorph.pushAnimate(100, [this._welFrontMoreBar, {
            "@marginTop": this.option("initMargin") + "px"
        }]);
        if (a >= 0) {
            var b = this;
            this._oMorph.pushCall(function() {
                b.fireEvent("afterPullDown")
            })
        } else {
            this._oMorph.pushCall(jindo.$Fn(this._endUp, this))
        }
        this._oMorph.play()
    },
    _endUp: function() {
        this._welFrontMoreBar.removeClass("r_more_load");
        this._welFrontMoreBar.addClass("r_more_stop");
        this._welFrontMoreBar.html("<p>업데이트하려면 당겼다 놓으세요.</p>");
        this._oMorph.clear()
    },
    setInitMargin: function(a) {
        this.option("initMargin", a);
        this._welFrontMoreBar.css("margin-top", a + "px")
    }
}).extend(jindo.Component);
var NewsHomeManager = jindo.$Class({
    oHTML: ['<div class="r_group{if className} {=className}{/if}"><div class="r_group_lft"><ul class="r_news_normal">', "{for num:each in list}", "{if num < leftSize}", "<li class=\"_rcount{if each.isNew} animate{/if}\" data-comment=\"\\{gno:'news{=each.officeId}{=each.articleId}',nclicks:'hom.cardcmt'\\}\">", "<a class=\"r_news_drw\" href=\"{=each.linkUrl}\" onclick=\"nclk(this,'hom.card','00000{=each.officeId}_00000000000000{=each.articleId}','{=num+1}');\">", "{if each.viewPhoto}", '<div class="r_news_im">', '<img src="{=each.imageUrl}?type=nf154_120" width="77" height="60" alt="{=each.title}">', '{if each.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}', "</div>", "{/if}", '<div class="r_news_tx">', '<span class="r_news_tit"><strong>{=each.title}</strong></span>', '<span class="r_ico_b r_modify"><b>{=each.serviceTimeForCardList}</b></span><em class="r_press"><b>{=each.officeName}</b></em>', "</div>", "</a>", "</li>", "{/if}", "{/for}", "</ul></div>", '<div class="r_group_rgt"><ul class="r_news_normal">', "{for num:each in list}", "{if num >= leftSize}", "<li class=\"_rcount{if each.isNew} animate{/if}\" data-comment=\"\\{gno:'news{=each.officeId},{=each.articleId}',nclicks:'hom.cardcmt'\\}\">", "<a class=\"r_news_drw\" href=\"{=each.linkUrl}\" onclick=\"nclk(this,'hom.card','00000{=each.officeId}_00000000000000{=each.articleId}','{=num+1}');\">", "{if each.viewPhoto}", '<div class="r_news_im">', '<img src="{=each.imageUrl}?type=nf154_120" width="77" height="60" alt="{=each.title}">', '{if each.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}', "</div>", "{/if}", '<div class="r_news_tx">', '<span class="r_news_tit"><strong>{=each.title}</strong></span>', '<span class="r_ico_b r_modify"><b>{=each.serviceTimeForCardList}</b></span><em class="r_press"><b>{=each.officeName}</b></em>', "</div>", "</a>", "</li>", "{/if}", "{/for}", '</ul></div><div class="r_group_cl"></div></div>'].join(""),
    oOmbudsmanNoticeHTML: ['<div class="r_footer_noti">', '<a href="/ombudsman/noticeread.nhn?notiId={=ombudsmanNotice.notiId }"><strong>공지</strong> {=ombudsmanNotice.notiTitle }</a>', "</div>"].join(""),
    _oElementFinder: null,
    $init: function(a) {
        this._initElement(a)
    },
    _initElement: function(d) {
        var c = this;
        this._welBase = jindo.$Element(d);
        this._weMoreBar = jindo.$Element("moreLoad");
        this._weMoreCopymsg = jindo.$Element("moreCopymsg");
        this._welFrontMoreBar = this._welBase.query(".r_more");
        this._welPopular = this._welBase.query("._popular");
        this._welMemo = this._welBase.query("._memo");
        this._welFooter = this._welBase.query(".r_group_footer");
        this._welSectionNavi = this._welBase.query(".section_list_box");
        this._welPersistContent = jindo.$Element(document.body).query(".__persist_content");
        this._welLoading = jindo.$Element(document.body).query("._loading");
        this._oAjax = new jindo.$Ajax("/mainNews/moreMainNews.json", {
            onload: jindo.$Fn(this._viewContents, this).bind()
        });
        this._tpl = jindo.$Template(this.oHTML);
        this._oPullDown = new PullDownEffect(d, {
            initMargin: parseInt(this._welFrontMoreBar.css("margin-top"), 10)
        }).attach({
            afterPullDown: jindo.$Fn(this._frontAction, this).bind()
        });
        this._nPage = 2;
        this._nPageSize = 20;
        this._oFirstArticle = {
            articleId: this._welBase.data("first-articleid"),
            officeId: this._welBase.data("first-officeid")
        };
        this._oLastArticle = {
            articleId: this._welBase.data("last-articleid"),
            officeId: this._welBase.data("last-officeid"),
            itemId: this._welBase.data("last-itemid")
        };
        this._welBase.preventTapHighlight(true);
        this._oElementFinder = new nhn.m.news.ElementInViewportFinder(this._weMoreBar);
        jindo.$Fn(function() {
            this._oElementFinder.attach({
                find: jindo.$Fn(this._action, this).bind()
            })
        }, this).delay(0.5);
        jindo.m.bindPageshow(jindo.$Fn(function(j) {
            var i = (j._event.persisted) ? 0.5 : 0;
            jindo.$Fn(function() {
                if (c._oElementFinder.isVisibleInViewport()) {
                    this._action()
                }
            }, this).delay(i)
        }, this).bind());
        var a = jindo.$Agent(),
            h = false;
        if (a.os().android && (a.os().version >= 4.4 || a.navigator().chrome)) {
            jindo.$Element(document.body).delegate("click", "a", jindo.$Fn(this._linkClickEventHandler, this).bind());
            this._oPersist = new Persist();
            var g = this._oPersist.persist();
            if (g) {
                this._welLoading.leave();
                this._welPersistContent.html(g.list).show();
                this._weMoreBar.show();
                this._weMoreCopymsg.show();
                if (g.page > 2) {
                    this._nPage = g.page;
                    this._oLastArticle = g.lastArticle;
                    this._welMemo.leave();
                    this._welMemo = this._welBase.query("._memo")
                }
                if (g.page > 3) {
                    this._welFooter.leave();
                    this._welFooter = this._welBase.query(".r_group_footer");
                    var f = new nhn.m.news.ResWebFontSizeManager(jindo.$("fontSize"), {
                        prefix: "${mfn:toNclkPrefixTag(pageContext.request)}"
                    });
                    if (fontSizeManager._welNotifyLayer.visible()) {
                        fontSizeManager._welNotifyLayer.hide()
                    }
                }
                if (g.page > 4) {
                    this._welSectionNavi.leave();
                    this._welSectionNavi = this._welBase.query(".section_list_box")
                }
                var e = function() {
                        var j = c._welPersistContent.offset().top - g.persistContentOffsetTop,
                            i = g.scrollTop + j;
                        window.scrollTo(0, i);
                        document.body.scrollTop === i && clearInterval(b)
                    },
                    b = setInterval(e, 25);
                h = true
            }
        }
        if (!h) {
            this._welLoading.leave();
            this._welPersistContent.show();
            this._weMoreBar.show();
            this._weMoreCopymsg.show()
        }
    },
    _linkClickEventHandler: function(a) {
        this._oPersist.persist({
            list: this._welPersistContent.html(),
            lastArticle: this._oLastArticle,
            page: this._nPage,
            scrollTop: document.body.scrollTop,
            persistContentOffsetTop: this._welPersistContent.offset().top
        })
    },
    _frontAction: function() {
        nclk(this, "hom.pulldown", "", "");
        location.href = "/home.nhn?serviceTime=" + this._welBase.data("servicetime")
    },
    _action: function() {
        if (this._oAjax.isIdle()) {
            nclk(this, "hom.scroll", "", this._nPage);
            this._weMoreBar.query("img").show();
            this._oAjax.request({
                articleId: this._oLastArticle.articleId,
                officeId: this._oLastArticle.officeId,
                pageSize: this._nPageSize,
                page: this._nPage,
                itemId: this._oLastArticle.itemId
            })
        }
    },
    _viewContents: function(d) {
        this._weMoreBar.query("img").hide();
        var f = d.json().message;
        var a = f.itemList;
        this._oPullDown.up();
        if (f.success == false || a.length == 0) {
            this._weMoreBar.hide();
            return
        }
        var e = jindo.$Element(this._tpl.process({
            list: a,
            leftSize: 10
        }));
        this._oLastArticle = a[a.length - 1];
        if (f.page == 1) {
            if (!a[0]["new"]) {
                return
            }
            this._resetContents();
            this._welPersistContent.append(e);
            this._oFirstArticle = a[0];
            var g = this._welBase.queryAll(".r_group");
            if (this._welPopular) {
                g[g.length - 1].after(this._welPopular)
            }
        } else {
            if (f.page == 2) {
                this._welPersistContent.append(e);
                var g = this._welBase.queryAll(".r_group");
                if (this._welMemo) {
                    g[g.length - 1].after(this._welMemo.show("block"))
                }
            } else {
                if (f.page == 3) {
                    var b = f.ombudsmanNotice;
                    this._welPersistContent.append(e);
                    var g = this._welBase.queryAll(".r_group");
                    if (this._welFooter) {
                        g[g.length - 1].after(this._welFooter.show("block"));
                        if (b) {
                            var c = jindo.$Template(this.oOmbudsmanNoticeHTML).process({
                                ombudsmanNotice: b
                            });
                            this._welFooter.appendHTML(c)
                        }
                    }
                } else {
                    if (f.page == 4) {
                        this._welPersistContent.append(e);
                        var g = this._welBase.queryAll(".r_group");
                        if (this._welSectionNavi) {
                            g[g.length - 1].after(this._welSectionNavi.show("block"))
                        }
                    } else {
                        this._welPersistContent.append(e)
                    }
                }
            }
        }
        CommentListCountManager.view({
            base: e.$value()
        });
        this._nPage = f.page + 1
    },
    _resetContents: function() {
        this._welMemo.hide();
        this._welFooter.hide();
        jindo.$A(this._welBase.queryAll(".r_group")).forEach(function(c, d, b) {
            c.leave()
        })
    },
});
(function(b) {
    var a = jindo.$Class({
        $static: {
            TEMPLATES: {
                MAINNEWS_WRAP_TPL: '<div class="r_group"></div>',
                MAINNEWS_LIST_TPL: '<div class="r_group_lft">					<div class="r_sect_box">					<div class="r_main_box">					<ul class="r_news_normal">					{set leftItemList = (=articles.slice(0,10))}					{for idx:item in leftItemList}					<li class="_rcount" data-comment="\\{gno:\'news{=item.officeId},{=item.articleId}\',nclicks:\'{js =nclkprefix}.cardcmt\'\\}">					<a class="r_news_drw" href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.card\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">					{if item.imageUrl}					<div class="r_news_im">					<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60" alt="{=item.title}">					{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}					</div>					{/if}					<div class="r_news_tx">					<span class="r_news_tit"><strong>{=item.title}</strong></span>					<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>					</div>					</a>					</li>					{/for}					</ul>					</div>					</div>					</div>					<div class="r_group_rgt">					<div class="r_sect_box">					<div class="r_main_box">					<ul class="r_news_normal">					{set rightItemList = (=articles.slice(10,20))}					{for idx:item in rightItemList}					<li class="_rcount" data-comment="\\{gno:\'news{=item.officeId},{=item.articleId}\',nclicks:\'{js =nclkprefix}.cardcmt\'\\}">					<a class="r_news_drw" href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.card\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">					{if item.imageUrl}					<div class="r_news_im">					<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60" alt="{=item.title}">					{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}					</div>					{/if}					<div class="r_news_tx">					<span class="r_news_tit"><strong>{=item.title}</strong></span>					<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>					</div>					</a>					</li>					{/for}					</ul>					</div>					</div>					</div>					<div class="r_group_cl"></div>'
            }
        },
        _oElementFinder: null,
        $init: function(r) {
            var p = this;
            var c = jindo.$Element(document.body).queryAll(".r_group:not([data-empty])");
            this._nPage = 1 + c.length;
            for (var h = 0; h < this._nPage; h++) {
                jindo.$ElementList(jindo.$Element(document.body).queryAll("*[data-groupindex=" + h + "]")).show("block")
            }
            this.welContainer = r.wel.container;
            var q = r.wel.moreLoad;
            var f = jindo.$Element("moreLoad");
            this.welPersistContent = this.welContainer.query(".__persist_content");
            this.welLoading = jindo.$Element(document.body).query("._loading");
            this._oParams = r.api.params;
            this._oAjax = new jindo.$Ajax(r.api.url, {
                onload: jindo.$Fn(function(u) {
                    q.query("img").hide();
                    var t = u.json().message;
                    if (!t || !t.success) {
                        q.hide();
                        return
                    }
                    var w = t.contents;
                    if (w.articles.length === 0) {
                        q.hide();
                        return
                    }
                    var x = jindo.$Element(document.body).queryAll(".r_group[data-empty]");
                    var s = x[0];
                    if (!s) {
                        s = jindo.$Element(jindo.$Template(a.TEMPLATES.MAINNEWS_WRAP_TPL).process({}));
                        this.welPersistContent.append(s)
                    }
                    var i = jindo.$Template(a.TEMPLATES.MAINNEWS_LIST_TPL).process({
                        articles: w.articles,
                        nclkprefix: r.nclkprefix
                    });
                    s.html(i);
                    s.attr("data-empty", null);
                    CommentListCountManager.view({
                        base: s.$value()
                    });
                    var v = jindo.$Element(document.body).queryAll("*[data-groupindex=" + this._nPage + "]");
                    jindo.$ElementList(v).show("block");
                    this._oParams.itemId = w.articles[w.articles.length - 1].itemId;
                    this._oParams.componentId = w.componentId;
                    this._nPage++
                }, this).bind()
            });

            function g() {
                if (p._oAjax.isIdle()) {
                    nclk(this, r.nclkprefix + ".scroll", "", p._nPage);
                    q.query("img").show();
                    p._oAjax.request(p._oParams)
                }
            }
            this._oElementFinder = new nhn.m.news.ElementInViewportFinder(q);
            jindo.$Fn(function() {
                this._oElementFinder.attach({
                    find: function(i) {
                        g()
                    }
                })
            }, this).delay(0.5);
            jindo.m.bindPageshow(jindo.$Fn(function(s) {
                var i = (s._event.persisted) ? 0.5 : 0;
                jindo.$Fn(function() {
                    if (p._oElementFinder.isVisibleInViewport()) {
                        g()
                    }
                }).delay(i)
            }, this).bind());
            this.welContainer.preventTapHighlight(true);
            var e = jindo.$Agent(),
                n = false;
            if (e) {
                if (e.os().android && (e.os().version >= 4.4 || e.navigator().chrome)) {
                    jindo.$Element(document.body).delegate("click", "a, .u_hssbt", jindo.$Fn(this._linkClickEventHandler, this).bind());
                    this._oPersist = new Persist();
                    var m = this._oPersist.persist();
                    if (m) {
                        this.welLoading.leave();
                        this.welPersistContent.html(m.list).show();
                        q.show();
                        f.show();
                        var k = new nhn.m.news.ResWebFontSizeManager(jindo.$("fontSize"), {
                            prefix: "${mfn:toNclkPrefixTag(pageContext.request)}"
                        });
                        if (k._welNotifyLayer.visible()) {
                            k._welNotifyLayer.hide()
                        }
                        this._nPage = m.page;
                        this._oParams.itemId = m.lastItemId;
                        this._oParams.componentId = m.lastComponentId;
                        var o = this.welPersistContent.offset().top - m.persistContentOffsetTop,
                            l = m.scrollTop + o;
                        var j = function() {
                                b.scrollTo(0, l);
                                document.body.scrollTop === l && clearInterval(d)
                            },
                            d = setInterval(j, 25);
                        n = true
                    }
                }
            }
            if (!n) {
                this.welLoading.leave();
                this.welPersistContent.show();
                q.show();
                f.show()
            }
        },
        _linkClickEventHandler: function(c) {
            this._oPersist.persist({
                list: this.welPersistContent.html(),
                lastItemId: this._oParams.itemId,
                lastComponentId: this._oParams.componentId,
                page: this._nPage,
                scrollTop: document.body.scrollTop,
                persistContentOffsetTop: this.welPersistContent.offset().top
            })
        }
    });
    b.SectionHomeManager = a
})(window);
(function(a) {
    var b = jindo.$Class({
        $init: function(o) {
            var k = this;
            this.welMoreLoad = o.wel.moreLoad;
            this.welItemBunch = o.wel.itemBunch;
            this.htmlTemplate = o.html.OPINION_LIST_TPL;
            this.footer = jindo.$Element(document.body).query(".u_ft");
            this.largeFooter = jindo.$Element(document.body).query(".section_list_box");
            this.welPersistContent = jindo.$Element(document.body).query(".__persist_content");
            this.welContainer = o.wel.container;
            this.oParams = o.api.params;
            this.isLastPage = false;
            var g = new jindo.$Ajax(o.api.url, {
                type: "xhr",
                method: "get",
                onload: jindo.$Fn(function(r) {
                    this.welMoreLoad.query("img").hide();
                    var q = r.json().message;
                    if (!q || !q.success) {
                        this.welMoreLoad.hide();
                        return
                    }
                    var s = q.contents;
                    if (s.articles.length == 0) {
                        this.welMoreLoad.hide();
                        k.showFooter();
                        return
                    }
                    var p = jindo.$Template(this.htmlTemplate).process({
                        articles: s.articles
                    });
                    if (this.welItemBunch != null) {
                        this.welItemBunch.appendHTML(p);
                        CommentListCountManager.view()
                    }
                    this.isLastPage = q.contents.pageNavigation.lastPage;
                    if (!this.isLastPage) {
                        this.oParams.page = q.contents.pageNavigation.page + 1;
                        this.welMoreLoad.show()
                    } else {
                        this.welMoreLoad.hide();
                        k.showFooter()
                    }
                }, this).bind()
            });

            function f() {
                if (g.isIdle() && !this.isLastPage) {
                    k.welMoreLoad.query("img").show();
                    g.request(k.oParams)
                } else {
                    k.welMoreLoad.hide()
                }
            }
            var i = new nhn.m.news.ElementInViewportFinder(this.welMoreLoad);
            jindo.$Fn(function() {
                i.attach({
                    find: function(p) {
                        f()
                    }
                })
            }, this).delay(0.5);
            jindo.m.bindPageshow(function(q) {
                var p = (q._event.persisted) ? 0.5 : 0;
                jindo.$Fn(function() {
                    if (i.isVisibleInViewport()) {
                        f()
                    }
                }).delay(p)
            });
            var d = jindo.$Agent(),
                n = false;
            if (d.os().android && (d.os().version >= 4.4 || d.navigator().chrome)) {
                jindo.$Element(document.body).delegate("click", "a, .u_hssbt", jindo.$Fn(this._linkClickEventHandler, this).bind());
                this._oPersist = new Persist();
                var m = this._oPersist.persist();
                if (m) {
                    if (m.date) {
                        this.oParams.page = m.page;
                        this.oParams.date = m.date;
                        var j = m.date.substring(0, 4),
                            h = m.date.substring(4, 6),
                            e = m.date.substring(6);
                        if (h.indexOf("0") == 0) {
                            h = h.substring(1)
                        }
                        if (e.indexOf("0") == 0) {
                            e = e.substring(1)
                        }
                        calendarManager.select(j, h, e);
                        this.welPersistContent.html(m.list);
                        this.welItemBunch = jindo.$Element($$.getSingle("." + o.wel.itemBunch.className()));
                        this._showBase();
                        if (this.welItemBunch.visible()) {
                            jindo.$Element(document.body).query(".opinion_error").hide();
                            this.isLastPage = m.isLastPage;
                            if (!this.isLastPage) {
                                this.welMoreLoad.show()
                            } else {
                                this.welMoreLoad.hide();
                                k.showFooter()
                            }
                        }
                    } else {
                        this.welPersistContent.html(m.list);
                        this._showBase()
                    }
                    var l = function() {
                            a.scrollTo(0, m.scrollTop);
                            document.body.scrollTop === m.scrollTop && clearInterval(c)
                        },
                        c = setInterval(l, 25);
                    n = true
                }
            }!n && this._showBase()
        },
        _showBase: function() {
            this.welContainer.show()
        },
        _linkClickEventHandler: function(c) {
            this._oPersist.persist({
                list: this.welPersistContent.html(),
                page: this.oParams.page,
                date: this.oParams.date,
                scrollTop: document.body.scrollTop,
                isLastPage: this.isLastPage
            })
        },
        setRequestParams: function(c, d) {
            this.oParams.page = d;
            this.oParams.date = c
        },
        isLastPage: function(c) {
            this.isLastPage = c
        },
        getHtmlTemplate: function() {
            return this.htmlTemplate
        },
        setVisibility: function(c) {
            if (c) {
                this.welItemBunch.show();
                this.welMoreLoad.show()
            } else {
                this.welItemBunch.hide();
                this.welMoreLoad.hide()
            }
        },
        hideFooter: function() {
            this.footer.hide();
            if (this.largeFooter != null) {
                this.largeFooter.hide()
            }
        },
        showFooter: function() {
            this.footer.show();
            if (this.largeFooter != null) {
                this.largeFooter.show()
            }
        },
        insertHTML: function(c) {
            this.welItemBunch.html(c)
        }
    });
    a.OpinionManager = b
})(window);
var OpinionToggleManager = jindo.$Class({
    $init: function(a) {
        oSelf = this;
        this._initOptions(a);
        this._attachEvent();
        oAjax = new jindo.$Ajax(oSelf.option("url"), {
            type: "xhr",
            method: "get",
            onload: jindo.$Fn(function(d) {
                var c = d.json().message;
                if (!c || !c.success) {
                    return
                }
                var e = c.contents;
                var b = jindo.$Template(oSelf.option("htmlTemplate")).process({
                    articles: e
                });
                if (articleUlElement != null) {
                    articleUlElement.appendHTML(b);
                    this.doToggle()
                }
            }, this).bind()
        })
    },
    _initOptions: function(a) {
        this.option({
            topParentsName: "",
            subParentsName: "",
            toggleButtonName: "",
            articleListParentsName: "",
            url: "",
            params: "",
            htmlTemplate: "",
        });
        this.option(a || {})
    },
    _attachEvent: function() {
        jindo.$Element(this.option("topParentsName")).delegate("click", this.option("subParentsName"), this._toggleList)
    },
    _toggleList: function(a) {
        a.stopDefault();
        var b = jindo.$Element(a.element);
        oSelf._setToggleTag(b)
    },
    _setToggleTag: function(b) {
        if (b == null) {
            return
        }
        topicBtn = b.query(oSelf.option("toggleButtonName"));
        articleUlElement = b.parent().query(oSelf.option("articleListParentsName"));
        if (articleUlElement.child().length < 1 && oAjax.isIdle()) {
            var a = oSelf.option("params");
            a.componentId = articleUlElement.attr("id");
            oAjax.request(a)
        } else {
            oSelf.doToggle()
        }
    },
    doToggle: function() {
        if (topicBtn.hasClass("open")) {
            nclk(this, "oph.peunfold", "", "")
        } else {
            nclk(this, "oph.pefold", "", "")
        }
        topicBtn.toggleClass("open", "close");
        articleUlElement.toggleClass("hidden")
    }
}).extend(jindo.m.Component);
var OpinionFlickingManager = jindo.$Class({
    _bTouch: false,
    _bBlockFlickingNclkEvent: false,
    _pContextIndex: /[?&]?contextIndex=([0-9])/,
    $init: function(d, b, c, a) {
        this._sWrapperId = b;
        this._initOptions(a);
        this._initVar(d);
        this._elFlick = jindo.$(b);
        this._initPageButton(c);
        this._initFlicking(this._elFlick);
        if (this.nContentIndex > 0 || this.option("bInitSetting")) {
            this.update()
        }
    },
    _initOptions: function(a) {
        this.option({
            sPanelClass: "panel",
            sNumAreaClass: ".pg_num_area",
            sPrevBtnClass: ".pg_btn_prev",
            sNextBtnClass: ".pg_btn_next",
            nContextIndex: 1,
            nDuration: "100",
            movingInterval: "100",
            changingContentHeight: false,
            bHistoryMemory: false,
            bInitSetting: false,
            sPrevNclkCode: undefined,
            sNextNclkCode: undefined,
            nMaxPageDot: null,
            fCallbackAfterFlicking: function() {}
        });
        this.option(a || {})
    },
    _getContextIndexParam: function() {
        var b = document.location.href;
        var a = b.match(this._pContextIndex);
        if (a) {
            return a[1]
        }
        return null
    },
    _initVar: function(d) {
        this.aContentsList = d;
        this._oHistoryMemory = new UserStorage({
            sNamespace: this._getStorageNameSpace()
        });
        var e = this._getContextIndexParam();
        if (e) {
            this.nContentIndex = parseInt(e, 10) - 1;
            return
        }
        if (this.option("bHistoryMemory") && historyManager && (historyManager.getState() == historyManager.oStateType.back)) {
            var c = this._oHistoryMemory.getItem("contentIndex");
            if (c <= this.aContentsList.length) {
                this.nContentIndex = this._oHistoryMemory.getItem("contentIndex")
            } else {
                this.nContentIndex = 0
            }
        } else {
            this.nContentIndex = this.option("nContextIndex") - 1
        }
        if (this.option("changingContentHeight") == true) {
            var a = this;
            var b = jindo.$A(a.aContentsList);
            b.shuffle();
            b.forEach(function(g, f, h) {
                imageObject = g.query(".cartoon_thumb img");
                if (imageObject == null) {
                    return
                }
                imageWidth = imageObject.$value().naturalWidth / 2;
                imageHeight = imageObject.$value().naturalHeight / 2;
                if (imageObject.attr("width") == null) {
                    imageObject.attr("width", imageWidth);
                    imageObject.attr("height", imageHeight)
                }
            })
        }
    },
    _initPageButton: function(b) {
        var d = jindo.$Element(b);
        if (!d) {
            return
        }
        this.nMaxPageDot = this.option("nMaxPageDot");
        this.welPage = d.query(this.option("sNumAreaClass"));
        var a = d.query(this.option("sPrevBtnClass"));
        var c = d.query(this.option("sNextBtnClass"));
        a && a.attach("click", jindo.$Fn(this.movePrev, this).bind());
        c && c.attach("click", jindo.$Fn(this.moveNext, this).bind())
    },
    _initFlicking: function(a) {
        var c = {
            nTotalContents: this.aContentsList.length,
            bUseCircular: true,
            sContentClass: this.option("sPanelClass"),
            nDuration: this.option("nDuration"),
        };
        var b = this;
        this.oFlicking = new jindo.m.SlideFlicking(a, c).attach({
            touchStart: function(d) {
                b._bTouch = true
            },
            touchEnd: function(d) {
                b._bTouch = false
            },
            afterFlicking: function(d) {
                if (d.bLeft) {
                    b.nContentIndex = b._getNextContentIndex(b.nContentIndex)
                } else {
                    b.nContentIndex = b._getPrevContentIndex(b.nContentIndex)
                }
                b.update(false);
                if (b._bBlockFlickingNclkEvent) {
                    b._bBlockFlickingNclkEvent = false;
                    return
                }
                if (d.bLeft && b.option("sNextNclkCode")) {
                    nclk(a, b.option("sNextNclkCode"), "", "")
                } else {
                    if (b.option("sPrevNclkCode")) {
                        nclk(a, b.option("sPrevNclkCode"), "", "")
                    }
                }
                b.option("fCallbackAfterFlicking")()
            }
        })
    },
    update: function(a) {
        a = (typeof a === "boolean") ? a : true;
        this._updatePanel(a);
        this._updatePageCtrl();
        this._updateHistory()
    },
    _updatePanel: function(b) {
        var a = this._getPrevContentIndex(this.nContentIndex);
        var c = this._getNextContentIndex(this.nContentIndex);
        if (b) {
            this.oFlicking.getElement().html(!!this.aContentsList[this.nContentIndex].html ? this.aContentsList[this.nContentIndex].html() : this.aContentsList[this.nContentIndex])
        }
        this.oFlicking.getNextElement().html(!!this.aContentsList[c].html ? this.aContentsList[c].html() : this.aContentsList[c]);
        this.oFlicking.getPrevElement().html(!!this.aContentsList[a].html ? this.aContentsList[a].html() : this.aContentsList[a])
    },
    _updatePageCtrl: function(b) {
        var g = [];
        var e = "";
        if (this.nMaxPageDot && this.nMaxPageDot % 2 == 1) {
            var f = this.aContentsList.length < this.nMaxPageDot ? this.aContentsList.length : this.nMaxPageDot;
            var d = this.nContentIndex;
            var c = Math.floor(this.nMaxPageDot / 2);
            if (this.aContentsList.length > this.nMaxPageDot) {
                if (this.nContentIndex > c && this.nContentIndex < this.aContentsList.length - c) {
                    d = c
                } else {
                    if (this.nContentIndex >= this.aContentsList.length - c) {
                        d = this.nMaxPageDot - (this.aContentsList.length - this.nContentIndex)
                    }
                }
            }
            for (var a = 0; a < f; a++) {
                if (a == d) {
                    e = ' <em title="현재 페이지" class="pg_num pg_num_on">' + (a + 1) + "</em> "
                } else {
                    e = ' <span class="pg_num">' + (a + 1) + "</span>"
                }
                g.push(e)
            }
        } else {
            for (var a = 0; a < this.aContentsList.length; a++) {
                if (a == this.nContentIndex) {
                    e = ' <em title="현재 페이지" class="pg_num pg_num_on">' + (a + 1) + "</em> "
                } else {
                    e = ' <span class="pg_num">' + (a + 1) + "</span>"
                }
                g.push(e)
            }
        }
        if (this.welPage) {
            this.welPage.html(g.join(""))
        }
    },
    _updateHistory: function() {
        if (!this.option("bHistoryMemory")) {
            return
        }
        this._oHistoryMemory.setItem("contentIndex", this.nContentIndex)
    },
    movePrev: function(a) {
        if (a) {
            a.stopDefault()
        }
        this._bBlockFlickingNclkEvent = true;
        this.oFlicking.movePrev(this.option("movingInterval"));
        this.option("fCallbackAfterFlicking")()
    },
    moveNext: function(a) {
        if (a) {
            a.stopDefault()
        }
        this._bBlockFlickingNclkEvent = true;
        this.oFlicking.moveNext(this.option("movingInterval"));
        this.option("fCallbackAfterFlicking")()
    },
    _getPrevContentIndex: function(a) {
        a--;
        if (a < 0) {
            return this.aContentsList.length - 1
        }
        return a
    },
    _getNextContentIndex: function(a) {
        a++;
        if (a >= this.aContentsList.length) {
            return 0
        }
        return a
    },
    _getStorageNameSpace: function() {
        return this._sWrapperId + window.location.pathname
    },
    setContents: function(a) {
        this.aContentsList = a;
        this._updatePanel(true)
    },
    isActivating: function() {
        return this.oFlicking && this.oFlicking.isActivating()
    },
    isTouch: function() {
        return this._bTouch
    }
}).extend(jindo.m.Component);
var OpinionColumnOrderingManager = jindo.$Class({
    $init: function(a) {
        this._initOption(a);
        this._attach()
    },
    _initOption: function(a) {
        this.option({
            currentOrder: "",
            areaNclkCode: "",
            updateNclkCode: "",
            titleNclkCode: "",
            apiUrl: ""
        });
        this.option(a || {})
    },
    _attach: function() {
        this._updateButton = jindo.$Element("updateOrder");
        if (this._updateButton) {
            this._updateButton.attach("click", jindo.$Fn(this._orderButtonAction, this).bind())
        }
        this._titleButton = jindo.$Element("titleOrder");
        if (this._titleButton) {
            this._titleButton.attach("click", jindo.$Fn(this._orderButtonAction, this).bind())
        }
    },
    _orderButtonAction: function(a) {
        if (a.element) {
            var b = a.element.id.replace("Order", "");
            if (this.option("currentOrder") != b) {
                if (b == "update") {
                    nclk(this, this.option("areaNclkCode") + "." + this.option("updateNclkCode"), "", "")
                } else {
                    if (b == "title") {
                        nclk(this, this.option("areaNclkCode") + "." + this.option("titleNclkCode"), "", "")
                    }
                }
                location.href = this.option("apiUrl") + "?page=1&order=" + b
            }
        }
    }
}).extend(jindo.m.Component);
(function(b) {
    var a = jindo.$Class({
        $static: {
            TEMPLATES: {
                ISSUEGROUP_WRAP_TPL: '<div class="r_group"></div>',
                ISSUEGROUP_LIST_TPL: '<div class="r_group_lft">					<div class="r_sect_box">						<div class="r_main_box">						<ul class="r_news_normal">							{set sliceValue = (=articles.length / 2)}							{if (sliceValue%1) > 0}								{set sliceValue = (=sliceValue - (=sliceValue%1) + 1)}							{/if}							{set leftItemList = (=articles.slice(0,=sliceValue))}							{for idx:item in leftItemList}							<li{if item.lineOfDate} class="fir"{/if}>								{if item.lineOfDate}<strong class="r_news_h">{=item.lineOfDate}</strong>{/if}								<a class="r_news_drw" href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">									{if item.imageUrl}									<div class="r_news_im">										<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60" alt="{=item.title}">										{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}									</div>									{/if}									<div class="r_news_tx">										<span class="r_news_tit"><strong>{=item.title}</strong></span>										<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>									</div>								</a>							</li>							{/for}						</ul>						</div>						</div>					</div>					<div class="r_group_rgt">						<div class="r_sect_box">						<div class="r_main_box">						<ul class="r_news_normal">							{set rightItemList = (=articles.slice(=sliceValue,20))}							{for idx:item in rightItemList}							<li{if item.lineOfDate} class="fir"{/if}>								{if item.lineOfDate}<strong class="r_news_h">{=item.lineOfDate}</strong>{/if}								<a class="r_news_drw" href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">									{if item.imageUrl}									<div class="r_news_im">										<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60" alt="{=item.title}">										{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}									</div>									{/if}									<div class="r_news_tx">										<span class="r_news_tit"><strong>{=item.title}</strong></span>										<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>									</div>								</a>							</li>							{/for}						</ul>						</div>						</div>					</div>					<div class="r_group_cl"></div>',
                ENTERTAINMENT_ISSUEGROUP_LIST_TPL: '<div class="r_group_lft">						<div class="r_sect_box">							<ul class="block">								{set sliceValue = (=articles.length / 2)}								{if (sliceValue%1) > 0}									{set sliceValue = (=sliceValue - (=sliceValue%1) + 1)}								{/if}								{set leftItemList = (=articles.slice(0,=sliceValue))}								{for idx:item in leftItemList}								<li class="type_b">									<a href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">										<b class="case_elip">{=item.title}<span class="by">{=item.officeName}</span></b>									</a>									{if item.imageUrl}									<a href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">										<img src="{=item.imageUrl}?type=nf104" width="60" height="60" alt="{=item.title}" class="size10">										{if item.videoType}<span class="mov"><span class="u_vc">[동영상]</span></span>{/if}										{if item.photoSlideOpt == \'Y\'}<span class="pht"><span class="u_vc">포토 슬라이드</span></span>{/if}									</a>									{/if}								</li>								{/for}							</ul>							</div>						</div>						<div class="r_group_rgt">							<div class="r_sect_box">							<ul class="block">								{set rightItemList = (=articles.slice(=sliceValue,20))}								{for idx:item in rightItemList}								<li class="type_b">									<a href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">										<b class="case_elip">{=item.title}<span class="by">{=item.officeName}</span></b>									</a>									{if item.imageUrl}									<a href="{=item.linkUrl}" onclick="nclk(this,\'{js =nclkprefix}.tlist\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">										<img src="{=item.imageUrl}?type=nf104" width="60" height="60" alt="{=item.title}" class="size10">										{if item.videoType}<span class="mov"><span class="u_vc">[동영상]</span></span>{/if}										{if item.photoSlideOpt == \'Y\'}<span class="pht"><span class="u_vc">포토 슬라이드</span></span>{/if}									</a>									{/if}								</li>								{/for}							</ul>							</div>						</div>						<div class="r_group_cl"></div>'
            }
        },
        $init: function(q) {
            var c = jindo.$Element(document.body).queryAll(".r_group:not([data-empty])");
            var g = 1 + c.length;
            for (var h = 0; h < g; h++) {
                jindo.$ElementList(jindo.$Element(document.body).queryAll("*[data-groupindex=" + h + "]")).show("block")
            }
            var m = q.wel.container;
            var p = q.wel.moreLoad;
            var d = q.wel.moreCopymsg;
            var k = true;
            var l = q.api.params;
            var e = jindo.$Element(document.body).query(".ico_hotissue");
            var o = "aiscroll";
            if (!!e && e.text().indexOf("연재") > -1) {
                o = "asscroll"
            }
            var j = new jindo.$Ajax(q.api.url, {
                onload: jindo.$Fn(function(t) {
                    var s = t.json().message;
                    if (!s || !s.success) {
                        p.hide();
                        d.hide();
                        return
                    }
                    var u = s.contents;
                    if (u.articles.length === 0) {
                        p.hide();
                        d.hide();
                        return
                    }
                    var v = jindo.$Element(document.body).queryAll(".r_group[data-empty]");
                    var r = v[0];
                    if (!r) {
                        r = jindo.$Element(jindo.$Template(SectionHomeManager.TEMPLATES.MAINNEWS_WRAP_TPL).process({}));
                        jindo.$Element("moreLoad").before(r)
                    }
                    var i = jindo.$Template((s.section == "ENTERTAINMENTS") ? a.TEMPLATES.ENTERTAINMENT_ISSUEGROUP_LIST_TPL : a.TEMPLATES.ISSUEGROUP_LIST_TPL).process({
                        articles: u.articles,
                        nclkprefix: q.nclkprefix
                    });
                    r.html(i);
                    if (s.contents.pageNavigation.displayedCount >= s.contents.pageNavigation.totalCount) {
                        k = false;
                        jindo.$Element("moreLoad").hide();
                        jindo.$Element("moreCopymsg").hide();
                        return
                    }
                    l.itemId = u.articles[u.articles.length - 1].itemId;
                    l.componentId = u.componentId;
                    g++
                }, this).bind()
            });

            function f() {
                if (j.isIdle()) {
                    j.request(l)
                }
            }
            var n = new nhn.m.news.ElementInViewportFinder(p);
            n.attach({
                find: function(i) {
                    nclk(this, q.nclkprefix + "." + o, "", "");
                    f()
                }
            });
            jindo.m.bindPageshow(function(r) {
                var i = (r._event.persisted) ? 0.5 : 0;
                jindo.$Fn(function() {
                    if (n.isVisibleInViewport()) {
                        f()
                    }
                }).delay(i)
            })
        }
    });
    b.IssueGroupManager = a
})(window);
nhn.FlashAudioPlayer = $Class({
    _term: 0,
    _uniqid: "mp3_swf",
    _mp3_url: null,
    _document_id: null,
    _flash_obj: "/statics/tts/mp3_nhn.swf",
    $static: {
        supportFlash: function() {
            return ((typeof navigator.plugins !== "undefined" && typeof navigator.plugins["Shockwave Flash"] === "object") || (typeof window.ActiveXObject !== "undefined" && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) !== false))
        }
    },
    $init: function(b) {
        var a = this;
        this._document_id = b;
        this._uniqid = "mp3_swf";
        this._loadFlash();
        window.flashSoundStart = function() {
            a.fireEvent("start")
        };
        window.flashSoundEnd = function() {
            a.fireEvent("end")
        }
    },
    _loadFlash: function() {
        var a = {};
        a.wmode = "window";
        a.bgColor = "#888888";
        a.allowAccessScript = "always";
        nhn.FlashObject.show(this._document_id, this._flash_obj, this._uniqid, 1, 1, a)
    },
    _getFlash: function() {
        return nhn.FlashObject.find(this._uniqid)
    },
    play: function(a) {
        this._mp3_url = a;
        try {
            this._getFlash().callback_play(this._mp3_url)
        } catch (b) {}
    },
    resume: function() {
        try {
            if (!this._mp3_url) {
                this._mp3_url = ""
            }
            this._getFlash().callback_play(this._mp3_url)
        } catch (a) {}
    },
    pause: function() {
        try {
            this._getFlash().callback_pause()
        } catch (a) {}
    },
    stop: function() {
        try {
            this._getFlash().callback_stop()
        } catch (a) {}
    },
    setTerm: function(a) {
        try {
            if (typeof a !== "undefined") {
                this._term = a
            }
            this._getFlash().flashSetTerm(this._term)
        } catch (b) {}
    }
}).extend(jindo.Component);
nhn.Html5AudioPlayer = jindo.$Class({
    $static: {
        canPlayMp3: function() {
            var b = document.createElement("audio");
            return !!(b.canPlayType && b.canPlayType("audio/mpeg;").replace(/no/, ""))
        }
    },
    $init: function() {
        this.playing = false;
        this.loading = false;
        this.loaded = false;
        this.stoped = false;
        this.playCount = 0;
        this.term = 0;
        var b = (document.createDocumentFragment) ? document.createDocumentFragment() : document.createElement("div");
        var a = document.createElement("div");
        a.id = "nhn_html_stack";
        b.appendChild(a);
        a.innerHTML = "<audio></audio>";
        this.audio = a.firstChild;
        this._hTimeout = null;
        this._loopTimeout = null;
        this._attachEvents()
    },
    play: function(a) {
        this._mp3_url = a;
        this.pause();
        this.playCount = 0;
        this.stoped = false;
        this._loadAudio()
    },
    resume: function() {
        this.loading = true;
        this.playing = false;
        this.audio.play()
    },
    pause: function() {
        this.stoped = true;
        this._clearLoopTimeout();
        if (this.loading || this.playing) {
            this.audio.pause();
            this._playEnd()
        }
    },
    stop: function() {
        this.stoped = true;
        this._clearLoopTimeout();
        this.audio.src = "";
        this.loaded = false;
        this.audio.load();
        this.loading = false;
        this.playing = false;
        this._playEnd()
    },
    setTerm: function(a) {
        if (typeof a !== "undefined") {
            this.term = a
        }
    },
    _loadAudio: function() {
        this.loaded = false;
        if (this._mp3_url == "") {
            this.audio.pause();
            this._playEnd()
        } else {
            if (this.audio.src !== this._mp3_url || !this.loaded) {
                this.audio.src = this._mp3_url;
                this.loaded = false;
                this.audio.load();
                this.loading = true;
                this.playing = false;
                this._delayLoading()
            } else {
                try {
                    this.audio.currentTime = 0
                } catch (a) {}
                this.loading = true;
                this.playing = false;
                this.audio.play()
            }
        }
    },
    _attachEvents: function() {
        jindo.$Fn(this._canplay, this).attach(this.audio, "canplay");
        jindo.$Fn(this._load, this).attach(this.audio, "loadstart");
        jindo.$Fn(this._playStart, this).attach(this.audio, "play");
        jindo.$Fn(this._playEnd, this).attach(this.audio, "ended");
        jindo.$Fn(this._playError, this).attach(this.audio, "error");
        jindo.$Fn(this._playWait, this).attach(this.audio, "waiting");
        if (!this._btnStatusTimeout) {
            this._btnStatusTimeout = setInterval(jindo.$Fn(function() {
                if (this.audio.ended === true && !this.loading && this.playing) {
                    this._playEnd()
                }
            }, this).bind(), 300)
        }
    },
    _canplay: function() {
        if (0.1 > this.audio.volume) {
            this.audio.volume = 1
        }
        this.audio.play()
    },
    _load: function() {
        this.loading = true
    },
    _playStart: function() {
        this.loading = false;
        this.playing = true;
        this.loaded = true;
        this.playCount++;
        if (this.playCount == 1) {
            this.fireEvent("start")
        }
    },
    _playWait: function() {
        this.audio.pause();
        this._playEnd()
    },
    _playError: function(a) {
        this.audio.pause();
        this._playEnd()
    },
    _playEnd: function(a) {
        this.loading = false;
        this.playing = false;
        this.fireEvent("end");
        sendToJavaScript("end")
    },
    _clearLoopTimeout: function() {
        if (this._loopTimeout !== null) {
            clearTimeout(this._loopTimeout);
            this._loopTimeout = null;
            this._playEnd()
        }
    },
    _clearTimeout: function() {
        if (this._hTimeout !== null) {
            clearTimeout(this._hTimeout);
            this._hTimeout = null
        }
    },
    _delayLoading: function() {
        this._clearTimeout();
        this._hTimeout = setTimeout(jindo.$Fn(function() {
            if (this.loading && !this.playing) {
                alert("로딩이 지연되었습니다.\n다시 시도해 주시기 바랍니다.");
                this._playEnd()
            }
        }, this).bind(), 30000)
    }
}).extend(jindo.Component);
nhn.NewsTTSPlayer = $Class({
    _localStorageKey: "playbackRateNew",
    _start_comment: "이동통신망을 이용하여 음성을 재생하면 별도의 데이터 통화료가 부과될 수 있습니다.",
    _end_comment: "음성 서비스가 제공중입니다. 종료하시겠습니까?",
    _player: null,
    _tts_btn_female: null,
    _playback_rate: null,
    _documentId: null,
    _oAjax: null,
    _office_id: null,
    _article_id: null,
    $init: function(a) {
        this.RATE_TYPE = {
            MAX: 3,
            MIN: 0,
            DEFAULT: 2
        };
        this._document_id = a.document_id;
        this._office_id = a.office_id;
        this._article_id = a.article_id;
        this._player = nhn.Html5AudioPlayer.canPlayMp3() ? new nhn.Html5AudioPlayer() : (nhn.FlashAudioPlayer.supportFlash() ? new nhn.FlashAudioPlayer(this._document_id) : null);
        this._tts_box = $Element($$.getSingle(".tts_box"));
        this._tts_btn_female = $Element("tts_btn_female");
        this._tts_btn_spd = $Element($$.getSingle(".tts_btn_spd"));
        this._tts_btn_spd.addClass("tts_btn_on");
        this._playback_rate = parseInt(window.localStorage.getItem(this._localStorageKey), 10);
        this._playback_rate = isNaN(this._playback_rate) ? this.RATE_TYPE.DEFAULT : this._playback_rate;
        var b = 1;
        if (this._playback_rate == 3) {
            b = 0
        } else {
            if (this._playback_rate == 0) {
                b = 2
            }
        }
        this._setPlaybackRate($A($$(".spdbar_btn")).get(b));
        this._attachEvents()
    },
    stop: function() {
        if (this._tts_btn_female.hasClass("tts_btn_on")) {
            if (confirm(this._end_comment)) {
                this._player.stop();
                this._tts_btn_female.removeClass("tts_btn_on")
            }
        }
    },
    play: function(e, d, a) {
        var c = "http://tts.news.naver.net/tts.nhn?from=mobile&speaker=clara&oid=" + this._office_id + "&aid=" + this._article_id + "&speed=" + this._playback_rate;
        var f = this._tts_btn_female.hasClass("tts_btn_on");
        if (d) {
            this._playback_rate = parseInt(d, 10)
        }
        var b = this;
        if (f) {
            if (a) {
                if (confirm("재생속도를 변경하시겠습니까? 다시 처음으로 돌아갑니다.")) {
                    this.stopSilent();
                    this._player.play(c);
                    this._tts_btn_female.addClass("tts_btn_on");
                    return true
                }
            } else {
                this.stop()
            }
        } else {
            if (!a && confirm(this._start_comment)) {
                this._player.play(c);
                this._tts_btn_female.addClass("tts_btn_on");
                nclk(this, "art.wtts", "", "")
            } else {
                return true
            }
        }
    },
    _buttonOn: function() {
        femaleOnBtn = this._tts_btn_female.hasClass("tts_btn_on");
        if (femaleOnBtn) {
            this._tts_btn_female.addClass("tts_btn_on");
            return true
        } else {
            return false
        }
    },
    _buttonOff: function() {
        femaleOnBtn = this._tts_btn_female.hasClass("tts_btn_on");
        if (femaleOnBtn) {
            this._tts_btn_female.removeClass("tts_btn_on");
            return true
        } else {
            return false
        }
    },
    pause: function() {
        if (this._buttonOff()) {
            this._player.pause()
        }
    },
    resume: function() {
        if (this._buttonOn()) {
            this._player.resume()
        }
    },
    stopSilent: function() {
        this._player.pause();
        this._tts_btn_female.removeClass("tts_btn_on")
    },
    end: function() {
        this.stopSilent()
    },
    _controlLayer: function() {
        this._tts_box.toggleClass("lyr_spd_open");
        this._tts_btn_spd.toggleClass("tts_btn_open")
    },
    controlSpeed: function(a) {
        this._playback_rate = a.value;
        if (this.play(this._gender_type, this._playback_rate, true)) {
            this._setPlaybackRate(a)
        }
    },
    _attachEvents: function() {
        this._tts_btn_female.attach("click", $Fn(function(a) {
            a.stopDefault();
            this.play("f")
        }, this).bind());
        if ($$.getSingle(".tts_btn_spd.tts_btn_on")) {
            $Element($$.getSingle(".tts_btn_spd.tts_btn_on")).attach("click", $Fn(function(a) {
                a.stopDefault();
                this._controlLayer()
            }, this).bind());
            $Element($$.getSingle(".tts_spdbar")).delegate("click", ".spdbar_btn", $Fn(function(a) {
                this.controlSpeed(a.element)
            }, this).bind())
        }
    },
    _setPlaybackRate: function(a) {
        this._initPlaybackRate();
        var b = $Element(a);
        b.addClass("sbb_on");
        var c = b.html();
        b.html(c + " 현재속도");
        window.localStorage.setItem(this._localStorageKey, this._playback_rate)
    },
    _initPlaybackRate: function() {
        var a = $Element($$.getSingle(".sbb_on"));
        a.removeClass("sbb_on");
        var b = a.html();
        a.html(b.substring(0, 2))
    }
}).extend(jindo.Component);
var setNotFoundTvImage = function(b, a, c) {
    jindo.$(b).src = "${env.staticImageDomain}news/m/2011/renew/preparing_97x60.png";
    jindo.$(b).onerror = ""
};
var HeadlineFlickingManager = jindo.$Class({
    $init: function(e, a, d, c, b) {
        this._initOptions(b);
        this.aContentsList = e;
        this.aTitleList = a;
        this.sContentId = d;
        this.sTitleId = c;
        this._bBlockFlickingNclkEvent = false;
        this.nContentIndex = this.oOptions.nContextIndex - 1;
        this._initElements();
        this._initFlicking();
        this._initButton();
        this.update();
        this._initAutoPlay()
    },
    _initOptions: function(a) {
        this.oOptions = {
            bAutoPlay: true,
            nAutoDuration: 5,
            sPrevBtnClass: ".prev",
            sNextBtnClass: ".next",
            sPageClass: ".cnt",
            pageTemplate: "<span>{=PAGE}</span> / <span>{=max}</span>",
            nContextIndex: 1,
            sPanelClass: "panel",
            sNclkPrev: undefined,
            sNclkNext: undefined
        };
        for (var b in a) {
            this.oOptions[b] = a[b]
        }
    },
    _initElements: function() {
        this.oFlick = jindo.$(this.sContentId);
        this.oPage = jindo.$Element(jindo.$$.getSingle(this.oOptions.sPageClass, this.oFlick))
    },
    _initFlicking: function() {
        var a = this;
        this.oFlicking = new jindo.m.Flicking(this.oFlick, {
            bUseCircular: true,
            sContentClass: this.oOptions.sPanelClass
        }).attach({
            afterFlicking: function(b) {
                if (b.bLeft) {
                    a.nContentIndex = a._getNextContentIndex(a.nContentIndex);
                    if (a._bBlockFlickingNclkEvent) {
                        a._bBlockFlickingNclkEvent = false
                    } else {
                        if (a.oOptions.sNclkNext) {
                            nclk(this, a.oOptions.sNclkNext, "", "")
                        }
                    }
                } else {
                    a.nContentIndex = a._getPrevContentIndex(a.nContentIndex);
                    if (a._bBlockFlickingNclkEvent) {
                        a._bBlockFlickingNclkEvent = false
                    } else {
                        if (a.oOptions.sNclkPrev) {
                            nclk(this, a.oOptions.sNclkPrev, "", "")
                        }
                    }
                }
                a.update();
                if (a.oOptions.bAutoPlay) {
                    a._nLastMotionTimes = (new Date()).getTime()
                }
            }
        });
        if (this.oOptions.bAutoPlay) {
            this.oFlicking.attach({
                touchStart: function(b) {
                    clearInterval(a.nAutoPlayIntervalId);
                    if (a.nTouchMoveCheckId === 0) {
                        a.nTouchMoveCheckId = setInterval(jindo.$Fn(function() {
                            if ((new Date()).getTime() >= (a._nLastMotionTimes + 300)) {
                                a._watchTouch();
                                clearInterval(a.nTouchMoveCheckId);
                                a.nTouchMoveCheckId = 0
                            }
                        }, a).bind(), 100)
                    }
                },
                touchMove: function(b) {
                    a._nLastMotionTimes = (new Date()).getTime()
                }
            })
        }
    },
    _initButton: function() {
        var b = jindo.$$(this.oOptions.sPrevBtnClass, this.oFlick);
        if (b.length === 0) {
            b = jindo.$$(this.oOptions.sPrevBtnClass, jindo.$Element(this.sContentId).parent())
        }
        jindo.$Fn(function() {
            this._bBlockFlickingNclkEvent = true;
            this.oFlicking.movePrev()
        }, this).attach(b, "click");
        var a = jindo.$$(this.oOptions.sNextBtnClass, this.oFlick);
        if (a.length === 0) {
            a = jindo.$$(this.oOptions.sNextBtnClass, jindo.$Element(this.sContentId).parent())
        }
        jindo.$Fn(function() {
            this._bBlockFlickingNclkEvent = true;
            this.oFlicking.moveNext()
        }, this).attach(a, "click")
    },
    _initAutoPlay: function() {
        if (this.oOptions.bAutoPlay) {
            this.nTouchMoveCheckId = 0;
            this.nAutoDuration = this.oOptions.nAutoDuration * 1000;
            this.startPlay()
        }
    },
    _watchTouch: function() {
        clearInterval(this.nAutoPlayIntervalId);
        this.nAutoPlayIntervalId = setInterval(jindo.$Fn(function() {
            if (((new Date()).getTime() >= (this._nLastMotionTimes + this.nAutoDuration)) && this.oOptions.bAutoPlay) {
                this._bBlockFlickingNclkEvent = true;
                this.oFlicking.moveNext()
            }
        }, this).bind(), 500)
    },
    startPlay: function() {
        this._nLastMotionTimes = (new Date()).getTime();
        this._watchTouch()
    },
    stopPlay: function() {
        clearInterval(this.nAutoPlayIntervalId)
    },
    setContents: function(c, a, b) {
        if (typeof b !== "undefined") {
            this.nContentIndex = b
        }
        this.aContentsList = c;
        this.aTitleList = a;
        this.update()
    },
    setNclk: function(b, a) {
        this.oOptions.sPrevBtnClass = b;
        this.oOptions.sNextBtnClass = a
    },
    update: function() {
        this._updatePanel();
        this._updatePageCtrl();
        this._updateTitle()
    },
    _updatePanel: function() {
        var a = this._getPrevContentIndex(this.nContentIndex);
        var b = this._getNextContentIndex(this.nContentIndex);
        this.oFlicking.getElement().html(this.aContentsList[this.nContentIndex]);
        this.oFlicking.getNextElement().html(this.aContentsList[b]);
        this.oFlicking.getPrevElement().html(this.aContentsList[a])
    },
    _updatePageCtrl: function() {
        if (!this.oPage) {
            return
        }
        var a = jindo.$Template(this.oOptions.pageTemplate).process({
            PAGE: this.nContentIndex + 1,
            max: this.aContentsList.length
        });
        this.oPage.html(a)
    },
    _updateTitle: function() {
        jindo.$Element(this.sTitleId).replace(this.aTitleList[this.nContentIndex])
    },
    _getPrevContentIndex: function(a) {
        a--;
        if (a < 0) {
            return this.aContentsList.length - 1
        }
        return a
    },
    _getNextContentIndex: function(a) {
        a++;
        if (a >= this.aContentsList.length) {
            return 0
        }
        return a
    }
});
var ModalsAssistor = jindo.$Class({
    $init: function() {
        this._oScroll = null;
        this._fnOnMove = jindo.$Fn(this._onMove, this).bind()
    },
    init: function() {
        this.deactivate();
        return this
    },
    _onActivate: function() {
        jindo.$Element(document).attach("touchmove", this._fnOnMove)
    },
    _onDeactivate: function() {
        jindo.$Element(document).detach("touchmove", this._fnOnMove);
        if (null !== this._oScroll) {
            this._oScroll.destroy();
            this._oScroll = null
        }
    },
    applyScroll: function(a) {
        this._oScroll = new jindo.m.Scroll(a, {
            bActivateOnload: true,
            bUseHScroll: false,
            bUseVScroll: true,
            bUseScrollbar: true,
            bUseFixedScrollbar: true,
            bAutoResize: true
        })
    },
    _onMove: function(a) {
        a.stop()
    }
}).extend(jindo.m.UIComponent);
(function(b) {
    var a = jindo.$Class({
        commentSeq: "",
        officeId: "",
        articleId: "",
        groupId: "",
        personalId: "",
        originalContent: "",
        content: "",
        content2: "",
        nickname: "",
        modDate: null,
        $init: function(d) {
            if (typeof d == "object") {
                this.commentSeq = d.seq.toString();
                this.officeId = d.officeId;
                this.articleId = d.articleId;
                this.groupId = d.groupId;
                this.personalId = d.personalId;
                this.originalContent = d.content;
                this.content = this.originalContent.replace(/&#92;n/gi, "\n").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#92;/gi, "\\");
                this.content2 = d.content2;
                this.nickname = d.nickname;
                this.modDate = jindo.$Date(d.modDate)
            }
        },
        getFullGroupId: function() {
            if (this.groupId && this.personalId) {
                return this.groupId + "." + this.personalId
            } else {
                return ""
            }
        },
        isOwnerComment: function(d) {
            var e = d.split(".");
            return (this.groupId == e[0])
        },
        getModDateFormat: function() {
            var d = this.modDate.format("Y.m.d ");
            if (this.modDate.format("A") == "AM") {
                d += "오전"
            } else {
                if (this.modDate.format("A") == "PM") {
                    d += "오후"
                }
            }
            d += this.modDate.format(" H:i");
            return d
        }
    });
    b.StakeholderComment = a;
    var c = jindo.$Class({
        commentMap: {},
        hasExposureNContent: false,
        isBlackId: false,
        $static: {
            TEMPLATES: {
                LIST: ' 					<p class="stakeholder_p">{if isGroupUser == true}기사 관련된 의견을 직접 작성하실 수 있습니다.{elseif length > 0}기사 관련된 이해당사자나 언론사(기자)의 <br>의견이 있습니다.{/if}</p> 					{if length > 0} 					<div class="stakeholder_group"> 						{for idx:comment in commentList} 						<a class="stakeholder_group_name" data-id="{=comment.seq}">{=comment.nickname}</a> 						{/for} 					</div> 					{/if} 					{if isGroupUser == true} <div class="stakeholder_footer"><a class="stakeholder_txbtn stakeholder_txbtn-write">글쓰기</a></div> {/if} ',
                HELP: " 					{if isGroupUser == true} 						<em>공식 의견</em>은 기사와 관련된 이해당사자나 <br>언론사(기자)가 의견을 직접 작성할 수 있는 공간입니다. <br>이해당사자는 본문에 명시된 단체로, 언론사(기자)는 본문을 <br>작성한 매체로 제한되며 이에 부합하지 않을 경우 삭제됩니다. <br>본문 내용과 관계없는 단체 또는 관련없는 내용을 작성할 <br>경우 해당 단체 ID로 의견 작성이 제한됩니다. 					{else} 						<em>공식 의견</em>은 기사 본문에 명시된 이해당사자나 <br>언론사(기자)가 의견을 작성할 수 있는 공간입니다. <br>글 게시는 확인절차를 거친 단체 ID에 한해 허용됩니다. 					{/if}"
            },
            APIS: {
                COMMENT_LIST: "/api/stakeholder/list.json",
                COMMENT_WRITE: "/api/stakeholder/write.json",
                COMMENT_UPDATE: "/api/stakeholder/update.json",
                COMMENT_DELETE: "/api/stakeholder/delete.json",
                NAVER_ME_PROFILE: "/api/common/getMyProfile.json"
            },
            CONSTANTS: {
                MAX_COMMENT_LENGTH: 1000,
                MIN_COMMENT_LENGTH: 10,
                SERVER_NEW_LINE: "&#92;n",
                CLIENT_NEW_LINE: "\n"
            }
        },
        $init: function(h, e, g, f, d) {
            this.welPage = jindo.$Element("stakeholderArea");
            this.contentWelPage = jindo.$Element("stakeholderContentArea");
            this.detailLayerWelPage = jindo.$Element("stakeholderDetailLayer");
            this.writeLayerWelPage = jindo.$Element("stakeholderWriteLayer");
            this.bodyWelPage = jindo.$Element($$.getSingle("body"));
            this.modalsAssistor = new ModalsAssistor();
            this.inputGuideArea = null;
            this.inputTextArea = null;
            this.countLabelArea = null;
            this.saveButton = null;
            this.scrollPosition;
            this.bodyClassName;
            this.officeId = h;
            this.articleId = e;
            this.articleTitle = g;
            this.sectionId = f;
            this.naverMeNickname = "";
            this.ajax = null;
            this.textareaInputTimer = new jindo.Timer();
            this.initOption(d);
            this.attach()
        },
        initOption: function(d) {
            this.option({
                groupId: "",
                groupName: ""
            });
            this.option(d || {});
            this.naverMeNickname = this.option("groupName")
        },
        attach: function() {
            this.welPage.delegate("click", ".stakeholder_btn.stakeholder_btn-help", jindo.$Fn(this.showHelp, this).bind());
            var d = jindo.$Element("stakeholderHelpArea");
            d.delegate("click", ".stakeholder_btn.stakeholder_btn-closehelp", jindo.$Fn(function() {
                if (this.isGroupUser() == true) {
                    nclk(this, "ocm.ghclose", "", "")
                } else {
                    nclk(this, "ocm.phclose", "", "")
                }
                d.hide()
            }, this).bind());
            this.detailLayerWelPage.delegate("click", ".stakeholder_txbtn-edit", jindo.$Fn(this.showUpdateComment, this).bind());
            this.detailLayerWelPage.delegate("click", ".stakeholder_txbtn-delete", jindo.$Fn(this.showDeleteComment, this).bind());
            this.detailLayerWelPage.delegate("click", "._btn_has_scroll_layer_close", jindo.$Fn(function() {
                nclk(this, "ocm.cmtclose", "", "");
                this.toggleDetailLayer(false)
            }, this).bind());
            this.contentWelPage.delegate("click", ".stakeholder_group_name", jindo.$Fn(this.showDetailComment, this).bind());
            this.contentWelPage.delegate("click", ".stakeholder_txbtn.stakeholder_txbtn-write", jindo.$Fn(this.showWriteComment, this).bind());
            this.writeLayerWelPage.delegate("click", ".stakeholder_write_submit", jindo.$Fn(this.saveComment, this).bind());
            this.writeLayerWelPage.delegate("click", ".stakeholder_write_here", jindo.$Fn(this.clickInputTextArea, this).bind());
            this.writeLayerWelPage.delegate("focusin", ".stakeholder_write_here", jindo.$Fn(this.focusInputTextArea, this).bind());
            this.writeLayerWelPage.delegate("focusout", ".stakeholder_write_here", jindo.$Fn(this.showInputGuide, this).bind());
            this.writeLayerWelPage.delegate("keyup", ".stakeholder_write_here", jindo.$Fn(this.checkChracterCount, this).bind());
            this.writeLayerWelPage.delegate("click", ".stakeholder_btn.stakeholder_btn-closecomment", jindo.$Fn(this.closeWriteLayer, this).bind())
        },
        isGroupUser: function() {
            var d = this.option("groupId");
            return (d != null && d.length > 0)
        },
        getGroupInformation: function() {
            var d = this.option("groupId").split(".");
            return {
                groupId: d[0],
                groupName: d[1]
            }
        },
        existComment: function() {
            var f = jindo.$A(Object.keys(this.commentMap));
            var d = false;
            var e = this;
            f.forEach(function(h, g, j) {
                var i = e.commentMap[h];
                if (i.isOwnerComment(e.option("groupId")) == true) {
                    d = true;
                    return
                }
            });
            return d
        },
        callStakeholderControlAPI: function(e, f, d) {
            if (this.ajax == null) {
                this.ajax = new jindo.$Ajax(e, {
                    method: "post",
                    onload: jindo.$Fn(d, this).bind()
                })
            } else {
                this.ajax.url(e);
                this.ajax.option({
                    method: "post",
                    onload: jindo.$Fn(d, this).bind()
                })
            }
            if (this.ajax.isIdle()) {
                if (f != null) {
                    this.ajax.request(f)
                } else {
                    this.ajax.request()
                }
            }
        },
        afterCallAPI: function(e) {
            var d = e.json().message;
            if (!d || d.success == false) {
                if (d.errorMessage != null && d.errorMessage.length > 0) {
                    alert(d.errorMessage)
                }
                return
            }
            this.displayStakeholderComment();
            this.closeWriteLayer()
        },
        saveComment: function(j) {
            nclk(this, "ocm.writeok", "", "");
            var i = this.inputTextArea.text();
            var d = i.replace(/^\s+|\s+$/g, "");
            var h = d.length;
            if (h < c.CONSTANTS.MIN_COMMENT_LENGTH) {
                alert("내용을 최소 10자 이상 입력해주세요.");
                return
            }
            d = d.replace(/\n/gi, "\\n");
            var k = this.saveButton.attr("data-id");
            var f = c.APIS.COMMENT_WRITE;
            if (k != null && k.length > 0) {
                f = c.APIS.COMMENT_UPDATE
            }
            var e = this.getGroupInformation();
            var g = {
                officeId: this.officeId,
                articleId: this.articleId,
                title: this.articleTitle,
                sectionId: this.sectionId,
                content: d,
                groupId: e.groupId,
                personalId: e.groupName,
                nickname: this.naverMeNickname,
                seq: k
            };
            this.callStakeholderControlAPI(f, g, this.afterCallAPI)
        },
        deleteComment: function() {
            var e = this.detailLayerWelPage.query(".stakeholder_txbtn.stakeholder_txbtn-delete").attr("data-id");
            if (e != null && e.length > 0) {
                this.toggleDetailLayer(false);
                var d = this.getGroupInformation();
                this.callStakeholderControlAPI(c.APIS.COMMENT_DELETE, {
                    seq: e,
                    officeId: this.officeId,
                    articleId: this.articleId,
                    groupId: d.groupId
                }, this.afterCallAPI)
            }
        },
        checkChracterCount: function(f) {
            try {
                this.textareaInputTimer.abort()
            } catch (g) {}
            if (this.inputTextArea) {
                var h = this.inputTextArea.text();
                var d = h.length;
                if (d > c.CONSTANTS.MAX_COMMENT_LENGTH) {
                    this.inputTextArea.text(h.substring(0, c.CONSTANTS.MAX_COMMENT_LENGTH));
                    d = c.CONSTANTS.MAX_COMMENT_LENGTH
                }
                this.countLabelArea.text(d + "/" + c.CONSTANTS.MAX_COMMENT_LENGTH)
            }
        },
        clickInputTextArea: function() {
            if (this.inputTextArea) {
                this.inputGuideArea.hide()
            }
        },
        showInputGuide: function() {
            if (this.inputTextArea) {
                if (this.inputTextArea.text().length == 0) {
                    this.inputGuideArea.show()
                } else {
                    this.inputGuideArea.hide()
                }
            }
        },
        focusInputTextArea: function() {
            this.clickInputTextArea();
            this.textareaInputTimer.start(jindo.$Fn(function() {
                this.checkChracterCount();
                return true
            }, this).bind(), 2000)
        },
        updateCommentListView: function(g) {
            var e = g.json().message;
            if (!e || e.success == false) {
                return
            }
            var h = e.stakeHolderList;
            var f = this;
            this.commentMap = {};
            jindo.$A(h).forEach(function(j, i, l) {
                var k = new a(j);
                f.commentMap[k.commentSeq] = k
            });
            this.hasExposureNContent = e.hasExposureNContent;
            this.isBlackId = e.isBlackId;
            if (this.isGroupUser() == true || h.length > 0) {
                var d = jindo.$Template(c.TEMPLATES.LIST).process({
                    isGroupUser: this.isGroupUser(),
                    commentList: h,
                    length: h.length
                });
                this.contentWelPage.html(d);
                this.welPage.show()
            } else {
                this.welPage.hide()
            }
        },
        displayStakeholderComment: function() {
            var d = new jindo.$Ajax(c.APIS.COMMENT_LIST, {
                method: "post",
                onload: jindo.$Fn(this.updateCommentListView, this).bind()
            });
            var e = this.getGroupInformation();
            if (d.isIdle()) {
                d.request({
                    officeId: this.officeId,
                    articleId: this.articleId,
                    groupId: e.groupId
                })
            }
        },
        showWriteComment: function(f) {
            var e = null;
            if (typeof f == "string" && f != null) {
                e = this.commentMap[f]
            }
            if (e == null) {
                nclk(this, "ocm.write", "", "")
            }
            if (this.isBlackId == true) {
                alert("해당 ID가 서비스 이용중지된 상태입니다.");
                return
            }
            if (e == null) {
                if (this.existComment() == true) {
                    alert("이미 작성된 의견이 있습니다.\n의견글은 1회만 작성할 수 있습니다.");
                    return
                }
            }
            if (this.hasExposureNContent == true) {
                alert("게시가 중단된 의견글이 있습니다. 의견글은 1회만 작성할 수 있습니다.");
                return
            }
            var d = new jindo.$Ajax(c.APIS.NAVER_ME_PROFILE, {
                method: "post",
                onload: jindo.$Fn(function(h) {
                    var g = h.json();
                    if (g.result == "success") {
                        this.naverMeNickname = g.returnValue.nickName
                    }
                    this.layoutWriteComment(e)
                }, this).bind()
            });
            d.request()
        },
        layoutWriteComment: function(f) {
            this.inputGuideArea = this.writeLayerWelPage.query(".stakeholder_write_guide");
            this.inputTextArea = this.writeLayerWelPage.query(".stakeholder_write_here");
            this.countLabelArea = this.writeLayerWelPage.query(".stakeholder_write_count");
            this.saveButton = this.writeLayerWelPage.query(".stakeholder_write_submit");
            var d = this.option("groupId");
            var e = this.naverMeNickname;
            jindo.$Element(jindo.$$.getSingle(".stakeholder_write_name", this.writeLayerWelPage)).html("<strong>" + e + "</strong> <i>(" + d + ")</i>");
            jindo.$Element(jindo.$$.getSingle(".stakeholder_write_title", this.writeLayerWelPage)).html((f ? "공식 의견 수정하기" : "공식 의견 작성하기"));
            this.saveButton.attr("value", (f ? "수정" : "등록"));
            this.inputTextArea.text((f ? f.content : ""));
            if (f) {
                this.countLabelArea.text(this.inputTextArea.text().length + "/" + c.CONSTANTS.MAX_COMMENT_LENGTH);
                jindo.$Element(jindo.$$.getSingle(".stakeholder_write_guide", this.writeLayerWelPage)).hide();
                this.saveButton.attr("data-id", f.commentSeq)
            } else {
                this.countLabelArea.text("0/" + c.CONSTANTS.MAX_COMMENT_LENGTH);
                jindo.$Element(jindo.$$.getSingle(".stakeholder_write_guide", this.writeLayerWelPage)).show();
                this.saveButton.attr("data-id", "")
            }
            this.scrollPosition = jindo.$Document().scrollPosition();
            this.bodyClassName = this.bodyWelPage.className();
            this.bodyWelPage.removeClass(this.bodyClassName);
            this.bodyWelPage.addClass("stakeholder_layer_wrap");
            this.writeLayerWelPage.show();
            if (f) {
                this.toggleDetailLayer(false)
            }
        },
        showUpdateComment: function(f) {
            nclk(this, "ocm.cmtmod", "", "");
            var e = jindo.$Element(f.element);
            var d = e.attr("data-id");
            var g = this.commentMap[d];
            if (g != null) {
                this.showWriteComment(g.commentSeq)
            }
        },
        showDeleteComment: function(e) {
            nclk(this, "ocm.cmtdel", "", "");
            if (this.isBlackId == true) {
                alert("해당 ID가 서비스 이용중지된 상태입니다.");
                return
            }
            var d = b.confirm("삭제 후 복구가 불가능합니다.\n삭제하시겠습니까?");
            if (d == true) {
                this.deleteComment()
            }
        },
        showDetailComment: function(e) {
            nclk(this, "ocm.cmt", "", "");
            var h = jindo.$Element(e.element);
            var d = h.attr("data-id");
            var g = this.commentMap[d];
            if (g != null) {
                var l = g.isOwnerComment(this.option("groupId"));
                var f = jindo.$A(["stakeholder_layer"]);
                if (this.isGroupUser() == true) {
                    f.set(1, "as_corporate")
                } else {
                    f.set(1, "as_general")
                }
                f.set(2, "_layer_has_scroll");
                this.detailLayerWelPage.removeClass(this.detailLayerWelPage.className());
                var k = this;
                f.forEach(function(n, m, o) {
                    k.detailLayerWelPage.addClass(n)
                });
                jindo.$Element("commentNickname").html(g.nickname);
                jindo.$Element("commentModDate").html(g.getModDateFormat());
                jindo.$Element("commentContent").html(g.content2);
                if (l == true) {
                    jindo.$Element(jindo.$$.getSingle(".stakeholder_txbtn-edit", this.detailLayerWelPage)).attr("data-id", g.commentSeq);
                    jindo.$Element(jindo.$$.getSingle(".stakeholder_txbtn-delete", this.detailLayerWelPage)).attr("data-id", g.commentSeq);
                    jindo.$Element("commentControl").show();
                    jindo.$Element("commentSource").hide()
                } else {
                    jindo.$Element("commentControl").hide();
                    var i = jindo.$Element("commentSource");
                    var j = "본 글은 <em>" + g.nickname + "</em>(이)가 직접 작성한 글입니다.";
                    i.html(j);
                    i.show()
                }
                this.toggleDetailLayer(true)
            } else {
                this.toggleDetailLayer(false)
            }
        },
        showHelp: function() {
            var e = jindo.$Template(c.TEMPLATES.HELP).process({
                isGroupUser: this.isGroupUser()
            });
            var d = jindo.$Element("stakeholderHelpArea");
            d.query(".stakeholder_help_p").html(e);
            if (this.isGroupUser() == true) {
                nclk(this, "ocm.ghopen", "", "")
            } else {
                nclk(this, "ocm.phclose", "", "")
            }
            d.show()
        },
        closeWriteLayer: function(d) {
            if (d) {
                d.stopDefault()
            }
            nclk(this, "ocm.writeclose", "", "");
            try {
                this.bodyWelPage.removeClass("stakeholder_layer_wrap");
                this.bodyWelPage.addClass(this.bodyClassName);
                this.bodyWelPage.attr("style", "")
            } catch (f) {}
            try {
                b.scrollTo(0, this.scrollPosition.top)
            } catch (f) {}
            this.writeLayerWelPage.hide()
        },
        toggleDetailLayer: function(e) {
            var d = jindo.$Element(jindo.$$.getSingle(".responsive_wrap", this.bodyWelPage));
            if (e == true) {
                this.detailLayerWelPage.show();
                this.modalsAssistor.init({
                    sLayerSelector: "._layer_has_scroll",
                    sContentsSelector: "._contents_has_scroll"
                }).activate();
                this.modalsAssistor.applyScroll(jindo.$$.getSingle("._scroll_view_in_layer", this.detailLayerWelPage));
                if (d) {
                    d.attr("style", "z-index:2020")
                }
            } else {
                var f = jindo.$Element(jindo.$$.getSingle(".__scroll_for_scrollbar__", this.detailLayerWelPage));
                if (f) {
                    f.leave()
                }
                if (d) {
                    d.attr("style", "")
                }
                this.detailLayerWelPage.hide();
                this.modalsAssistor.deactivate()
            }
        },
        showDebug: function(e, d) {
            console.debug(e + " ------------------------------------------------------------");
            console.debug(d);
            console.debug("// " + e + " ------------------------------------------------------------")
        }
    }).extend(jindo.m.Component);
    b.StakeholderManager = c
})(window);
var JournalistMoreViewManager = jindo.$Class({
    $static: {
        TEMPLATES: {
            MAINNEWS_WRAP_TPL: '<div class="r_group"></div>',
            MAINNEWS_LIST_TPL: '<div class="r_group_lft">				<ul class="r_news_normal">				{set leftItemList = (=articles.slice(0,10))}				{for idx:item in leftItemList}				<li class="_rcount" data-comment="\\{gno:\'news{=item.officeId},{=item.articleId}\',nclicks:\'{js =nclkprefix}.cardcmt\'\\}">				<a class="r_news_drw" href="/read.nhn?oid={=item.officeId}&aid={=item.articleId}&sid1={=item.sectionId}&mode=LSD" onclick="nclk(this,\'{js =nclkprefix}.card\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">				{if item.viewPhoto}				<div class="r_news_im">				<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60">				{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}				</div>				{/if}				<div class="r_news_tx">				<span class="r_news_tit"><strong>{=item.title}</strong></span>				<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>				</div>				</a>				</li>				{/for}				</ul>				</div>				<div class="r_group_rgt">				<ul class="r_news_normal">				{set rightItemList = (=articles.slice(10,20))}				{for idx:item in rightItemList}				<li class="_rcount" data-comment="\\{gno:\'news{=item.officeId},{=item.articleId}\',nclicks:\'{js =nclkprefix}.cardcmt\'\\}">				<a class="r_news_drw" href="/read.nhn?oid={=item.officeId}&aid={=item.articleId}&sid1={=item.sectionId}&mode=LSD" onclick="nclk(this,\'{js =nclkprefix}.card\',\'00000{=item.officeId}_00000000000000{=item.articleId}\',\'{js =idx+1}\');">				{if item.viewPhoto}				<div class="r_news_im">				<img src="{=item.imageUrl}?type=nf154_120" width="77" height="60">				{if item.videoType}<span class="r_ico r_vod">동영상뉴스</span>{/if}				</div>				{/if}				<div class="r_news_tx">				<span class="r_news_tit"><strong>{=item.title}</strong></span>				<span class="r_ico_b r_modify"><b>{=item.serviceTimeForCardList}</b></span><em class="r_press"><b>{=item.officeName}</b></em>				</div>				</a>				</li>				{/for}				</ul>				</div>				<div class="r_group_cl"></div>'
        }
    },
    $init: function(o) {
        var h = o.wel.container,
            n = o.wel.moreLoad,
            g = jindo.$Element(document.body).queryAll(".r_group"),
            d = h.query(".__persist_content");
        var i = o.api.params;
        i.page = 1 + g.length;
        var f = new jindo.$Ajax(o.api.url, {
            onload: jindo.$Fn(function(s) {
                n.query("img").hide();
                var r = s.json().message;
                if (!r || !r.success) {
                    n.hide();
                    return
                }
                if (r.list.length === 0) {
                    n.hide();
                    return
                }
                var q = jindo.$Element(jindo.$Template(JournalistMoreViewManager.TEMPLATES.MAINNEWS_WRAP_TPL).process({}));
                d.append(q);
                var p = jindo.$Template(JournalistMoreViewManager.TEMPLATES.MAINNEWS_LIST_TPL).process({
                    articles: r.list,
                    nclkprefix: o.nclkprefix
                });
                q.html(p);
                CommentListCountManager.view({
                    base: q.$value()
                });
                i.page++
            }, this).bind()
        });

        function e() {
            if (f.isIdle()) {
                n.query("img").show();
                f.request(i)
            }
        }
        var j = new nhn.m.news.ElementInViewportFinder(n);
        jindo.$Fn(function() {
            j.attach({
                find: function(p) {
                    e()
                }
            })
        }, this).delay(0.5);
        jindo.m.bindPageshow(function(q) {
            var p = (q._event.persisted) ? 0.5 : 0;
            jindo.$Fn(function() {
                if (j.isVisibleInViewport()) {
                    e()
                }
            }).delay(p)
        });
        var b = jindo.$Agent(),
            m = false;
        if (b) {
            if (b.os().android && (b.os().version >= 4.4 || b.navigator().chrome)) {
                jindo.$Element(document.body).delegate("click", "a", function(p) {
                    c.persist({
                        list: d.html(),
                        page: i.page,
                        scrollTop: document.body.scrollTop
                    })
                });
                var c = new Persist(),
                    l = c.persist();
                if (l) {
                    d.html(l.list).show();
                    i.page = l.page;
                    var k = function() {
                            window.scrollTo(0, l.scrollTop);
                            document.body.scrollTop === l.scrollTop && clearInterval(a)
                        },
                        a = setInterval(k, 25);
                    m = true
                }
            }
        }!m && d.show()
    }
});
(function(a) {
    var b = jindo.$Class({
        $static: {
            TEMPLATES: {
                POST_TPL: ' 					{for idx:article in articles} 					<li class="techplus_item"> 						<a href="{=article.postUrl }" class="techplus_summary" onclick="nclk(this,\'itn_tec.title\',\'\',\'\');"> 							<div class="techplus_thumb"><img src="{=article.postFullImageUrl }" width="95" height="83" alt=""></div> 							<div class="techplus_title"> 								<strong class="techplus_headline">{=article.title }</strong> 							<p class="techplus_preview">{=article.summary }</p> 						</div> 					</a> 					<div class="techplus_profile"> 						<a href="{=article.authorHomeUrl }" onclick="nclk(this,\'itn_tech.author\',\'\',\'\');"> 							<span class="techplus_authorphoto"><img src="{=article.authorImageUrl }" width="25" height="25" alt=""></span> 							<strong class="techplus_author">{=article.authorName }</strong> 							</a> 							<a href="#" class="follow author_no_{=article.authorNo } __follow_new" onclick="nclk(this,\'itn_tec.subs\',\'\',\'\');" data-author-no="{=article.authorNo }"><i class="follow_ico"></i><span class="author_no_{=article.authorNo }">팔로우</span></a>						</div> 					</li> 					{/for}'
            }
        },
        $init: function(c) {
            var f = this;
            this.wcPostFollowManager = c;
            this.welContainer = jindo.$Element(document.body).query(".techplus");
            this.welListContainer = jindo.$Element("techplusList");
            this.welPersistContent = jindo.$Element(document.body).query(".__persist_content");
            this.welMoreLoad = jindo.$Element("moreLoad");
            this.welCopyMsg = jindo.$Element("moreCopymsg");
            this.page = 1;
            this.ajax = new jindo.$Ajax("/moreTechPlus.json", {
                onload: jindo.$Fn(function(l) {
                    this.welMoreLoad.query("img").hide();
                    this.welCopyMsg.hide();
                    var k = l.json().message;
                    if (!k || !k.success) {
                        this.welMoreLoad.hide();
                        this.welCopyMsg.hide();
                        return
                    }
                    var n = k.contents;
                    if (n.articles.length === 0) {
                        this.welMoreLoad.hide();
                        this.welCopyMsg.hide();
                        return
                    }
                    var m = jindo.$Template(b.TEMPLATES.POST_TPL).process({
                        articles: n.articles
                    });
                    if (this.welListContainer != null) {
                        this.welListContainer.appendHTML(m)
                    }
                    c.setCheckFollow()
                }, this).bind()
            });

            function g() {
                if (f.ajax.isIdle()) {
                    f.page++;
                    f.welMoreLoad.query("img").show();
                    f.welCopyMsg.show();
                    f.ajax.request({
                        page: f.page
                    })
                }
            }
            this.elementFinder = new nhn.m.news.ElementInViewportFinder(this.welMoreLoad);
            jindo.$Fn(function() {
                this.elementFinder.attach({
                    find: function(k) {
                        g()
                    }
                })
            }, this).delay(0.5);
            jindo.m.bindPageshow(jindo.$Fn(function(l) {
                var k = (l._event.persisted) ? 0.5 : 0;
                jindo.$Fn(function() {
                    if (f.elementFinder.isVisibleInViewport()) {
                        g()
                    }
                }).delay(k)
            }, this).bind());
            this.welContainer.preventTapHighlight(true);
            var d = jindo.$Agent(),
                j = false;
            if (d.os().android && (d.os().version >= 4.4 || d.navigator().chrome)) {
                jindo.$Element(document.body).delegate("click", "a, .u_hssbt", jindo.$Fn(this._linkClickEventHandler, this).bind());
                this._oPersist = new Persist();
                var i = this._oPersist.persist();
                if (i) {
                    this.welPersistContent.html(i.list).show();
                    this.page = i.page;
                    var h = function() {
                            a.scrollTo(0, i.scrollTop);
                            document.body.scrollTop === i.scrollTop && clearInterval(e)
                        },
                        e = setInterval(h, 25);
                    c.setCheckFollow();
                    j = true
                }
            }
            if (!j) {
                this.welPersistContent.show()
            }
        },
        _linkClickEventHandler: function(c) {
            this._oPersist.persist({
                list: this.welPersistContent.html(),
                page: this.page,
                scrollTop: document.body.scrollTop
            })
        }
    });
    a.TechPlusHomeManager = b
})(window);
(function(window) {
    var PostFollowManager = jindo.$Class({
        $init: function() {
            this._setIsNaverUser();
            this._initElement(this._checkFollow);
            this.oLayerEffect = new jindo.m.LayerEffect();
            this.welFollowTicker = jindo.$Element("techplusFollowTicker");
            this.welUnfollowDiv = jindo.$Element("techpulsUnfollowDiv");
            this.welUnfollowCancelBtn = jindo.$Element(jindo.$$.getSingle(".__cancel_btn"));
            this.welUnfollowSignUpBtn = jindo.$Element(jindo.$$.getSingle(".__sign_up_btn"));
            this._attach()
        },
        _setIsNaverUser: function() {
            var cookie = jindo.$Cookie();
            this.isNaverUser = false;
            if (cookie.get("NID_SES") != null && cookie.get("NID_AUT") != null) {
                this.isNaverUser = true
            }
        },
        _callAjax: function(params, callback) {
            var self = this;
            var oAjax = new jindo.$Ajax("/techapi/getPostApiUrl.json", {
                timeout: 5,
                onload: function(res) {
                    try {
                        var oResult = res.json();
                        var sResult = oResult.message.result;
                        if (sResult != null && sResult != "") {
                            var oJsonResult = eval("(" + sResult + ")");
                            if (oJsonResult.resultStatus == "error") {
                                if (self._isAlertErrorCode(oJsonResult.result.errorCode)) {
                                    alert(oJsonResult.result.errorMessage)
                                }
                                return
                            }
                            callback(self, oJsonResult)
                        }
                    } catch (e) {}
                }
            });
            oAjax.request(params)
        },
        setCheckFollow: function() {
            this._initElement()
        },
        _initElement: function() {
            if (!this.isNaverUser) {
                jindo.$A(jindo.$$("a.follow")).forEach(function(value, index, array) {
                    jindo.$Element(value).attr("href", "https://nid.naver.com/nidlogin.login?svctype=262144")
                })
            } else {
                var oParams = {
                    apiType: "checkFollow",
                    authorNoList: this._getPostAuthorIds()
                };
                this._callAjax(oParams, this._checkFollow)
            }
            return
        },
        _attach: function() {
            if (!this.isNaverUser) {
                return
            }
            var self = this;
            jindo.$Element("techplusList").delegate("click", "a.follow", function(eEvent) {
                var el = jindo.$Element(eEvent.element);
                if (el.hasClass("on")) {
                    self._removeFollow(eEvent, el.data("author-no"))
                } else {
                    self._addFollow(eEvent)
                }
            });
            this.welUnfollowCancelBtn.attach("click", jindo.$Fn(self._cancelUnfollow, self).bind());
            this.welUnfollowSignUpBtn.attach("click", jindo.$Fn(self._signUpUnfollow, self).bind())
        },
        _cancelUnfollow: function(eEvent) {
            var self = this;
            eEvent.stopDefault();
            self.welUnfollowDiv.hide()
        },
        _signUpUnfollow: function(eEvent) {
            var self = this;
            eEvent.stopDefault();
            self.welUnfollowDiv.hide();
            var oParams = {
                apiType: "removeFollow",
                followTarget: self.welUnfollowDiv.data("author-no")
            };
            self._callAjax(oParams, self._offFollow)
        },
        _addFollow: function(oEvent) {
            var self = this;
            oEvent.stopDefault();
            var authorNo = jindo.$Element(oEvent.element).data("author-no");
            var oParams = {
                apiType: "addFollow",
                followTarget: authorNo
            };
            this._callAjax(oParams, self._onFollow)
        },
        _onFollow: function(self, followInfo) {
            var sFollowTarget = followInfo.result.followTarget;
            self._toggleFollowBtn("follow", sFollowTarget);
            var htOption = {};
            htOption.nDuration = 2000;
            self.oLayerEffect.fade(self.welFollowTicker.$value(), "out", htOption)
        },
        _removeFollow: function(oEvent, authorNo) {
            var self = this;
            oEvent.stopDefault();
            self.welUnfollowDiv.data("author-no", authorNo);
            self.welUnfollowDiv.show()
        },
        _offFollow: function(self, followInfo) {
            var sFollowTarget = followInfo.result.followTarget;
            self._toggleFollowBtn("unfollow", sFollowTarget)
        },
        _checkFollow: function(self, followInfo) {
            var aAuthorInfo = jindo.$A(followInfo.result.authors);
            aAuthorInfo.forEach(function(value, index, array) {
                if (array[index].isFollowed) {
                    self._toggleFollowBtn("follow", array[index].authorNo)
                } else {
                    self._toggleFollowBtn("unfollow", array[index].authorNo)
                }
            })
        },
        _toggleFollowBtn: function(type, authorNo) {
            if (type == "follow") {
                jindo.$ElementList("a.author_no_" + authorNo).addClass("on");
                jindo.$ElementList("span.author_no_" + authorNo).text("팔로잉")
            } else {
                if (type == "unfollow") {
                    jindo.$ElementList("a.author_no_" + authorNo).removeClass("on");
                    jindo.$ElementList("span.author_no_" + authorNo).text("팔로우")
                }
            }
        },
        _getPostAuthorIds: function() {
            var elAtuthorIds = jindo.$A(jindo.$Element(document.body).queryAll("[data-author-no].follow"));
            var aAuthorNos = jindo.$A([]);
            elAtuthorIds.filter(function(value, index, array) {
                var sAuthorNo = value.data("author-no");
                if (!aAuthorNos.has(sAuthorNo)) {
                    aAuthorNos.push(sAuthorNo)
                }
            });
            return aAuthorNos.toString()
        },
        _isAlertErrorCode: function(errorCode) {
            var validErrorCode = jindo.$A(["ALREADY_FOLLOWED", "NOT_FOLLOWED", "FOLLOW_DAILY_LIMIT"]);
            var result = false;
            if (validErrorCode.has(errorCode)) {
                result = true
            }
            return result
        }
    });
    window.PostFollowManager = PostFollowManager
})(window);
var nmp = nmp || {};
nmp.isAddr = "is1.ncast.gscdn.com";
nmp.isPort = 11310;
nmp.minAppVersionAndroid = 1410;
nmp.minAppVersionIos = 1;
nmp.liveInfoUrl = "http://rapi.live.navercorp.com/liveInfo.nhn", nmp.secReqUrlBase = "http://rapi.live.navercorp.com/sUrl.nhn";
nmp.addPvUrl = "http://vapi.live.navercorp.com/addpv", nmp.geoIpUrl = "http://rapi.live.navercorp.com/userLoc.nhn";
nmp.hlsHostUrl = "http://hls.live.m.nhn.gscdn.com";
nmp.rtspHostUrl = "rtsp://rtsp.live.m.nhn.gscdn.com";
nmp.appStoreUrl = "https://itunes.apple.com/kr/app/neibeo-midieo-peulleieo-naver/id925205585?l=ko&ls=1&mt=8";
nmp.androidIntentSchemeExtra = "#Intent;scheme=naverplayer;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.naverplayer;end";
nmp.message = {
    errParam: "잘못된 요청입니다",
    errForeign: "해외에서는 이용이 불가능합니다",
    errNetwork: "잠시 후 다시 시도해주세요",
    errOffAir: "방송시간이 아닙니다",
    playAnd: "고화질 이상은 네이버 미디어 플레이어로 재생합니다. 해당 앱이 없으면 구글 플레이 스토어로 이동합니다.\nWi-Fi가 아닌 경우 데이터 과금에 각별히 주의하세요",
    playIos: "고화질 이상은 네이버 미디어 플레이어로 재생합니다. 해당 앱이 없으면 애플 앱스토어로 이동합니다.\nWi-Fi가 아닌 경우 데이터 과금에 각별히 주의하세요",
    playWeb: "Wi-Fi가 아닌 경우 데이터 과금에 각별히 주의하세요"
};
nmp.failAlert = function(a) {
    alert(nmp.message[a])
};
nmp.liveInfo = function(b, a, e) {
    var c = jindo.$Ajax(nmp.liveInfoUrl, {
        type: "jsonp",
        callbackname: "callback",
        onload: function(f) {
            e(f.json())
        },
        onerror: function(f) {
            nmp.failAlert("errNetwork")
        }
    });
    var d = {};
    d[b] = a;
    c.request(d)
};
nmp.geoip = function(b) {
    var a = jindo.$Ajax(nmp.geoIpUrl, {
        type: "jsonp",
        callbackname: "callback",
        onload: function(c) {
            b(c.json().countryCode)
        },
        onerror: function(c) {
            nmp.failAlert("errNetwork")
        },
        timeout: 3,
        ontimeout: function() {
            nmp.failAlert("errNetwork")
        }
    });
    a.request()
};
nmp.addPv = function(e, b, d) {
    var a = this;
    var c = jindo.$Ajax(nmp.addPvUrl, {
        type: "jsonp",
        callbackname: "callback",
        onload: function(f) {
            if (!f.json().success) {
                nmp.failAlert("errNetwork")
            } else {
                d(f.json())
            }
        },
        onerror: function(f) {
            nmp.failAlert("errNetwork")
        },
        timeout: 3,
        ontimeout: function() {
            nmp.failAlert("errNetwork")
        }
    });
    c.request({
        l: e,
        n: b
    })
};
nmp.secUrl = function(b, a, e, d) {
    var c = jindo.$Ajax(nmp.secReqUrlBase, {
        type: "jsonp",
        callbackname: "callback",
        onload: function(f) {
            d(f.json().secUrl)
        },
        onerror: function(f) {
            nmp.failAlert("errNetwork")
        },
        timeout: 3,
        ontimeout: function() {
            nmp.failAlert("errNetwork")
        }
    });
    c.request({
        ch: b,
        q: a,
        p: e
    })
};
nmp.getAndroidVersion = function() {
    if (!nmp.androidVersion) {
        var b = navigator.userAgent;
        var a = b.indexOf("Android ");
        if (a == -1) {
            nmp.androidVersion = -1
        } else {
            var d = a + "Android ".length;
            var c = b.slice(d, d + 3);
            nmp.androidVersion = parseFloat(c)
        }
    }
    return nmp.androidVersion
};
nmp.isHlsPlayable = function(b, a) {
    if (b.android) {
        if (a >= 4 || nmp.isHlsPlayableAndroidDevice()) {
            return true
        } else {
            return false
        }
    } else {
        return true
    }
};
nmp.isHlsPlayableAndroidDevice = function() {
    var a = navigator.userAgent;
    if (a.search(/shw-m250/i) > 0) {
        return true
    } else {
        if (a.search(/shv-e110/i) > 0) {
            return true
        } else {
            if (a.search(/shv-e120/i) > 0) {
                return true
            } else {
                if (a.search(/shv-e160/i) > 0) {
                    return true
                } else {
                    return false
                }
            }
        }
    }
};
nmp.Player = function(a) {
    this.liveId = a.liveId;
    this.chId = a.chId;
    this.videoIndex = a.videoIndex;
    this.os = jindo.$Agent().os()
};
nmp.Player.prototype = {
    consturctor: nmp.Player,
    requestPlay: function() {
        this.getProgramData()
    },
    getProgramData: function() {
        if (this.liveId == null && this.chId == null) {
            nmp.failAlert("errParam");
            return
        }
        var b = this.liveId != null ? "liveId" : "ch";
        var a = this.liveId != null ? this.liveId : this.chId;
        var c = this;
        var d = function(e) {
            if (e.program == null) {
                nmp.failAlert("errOffAir")
            } else {
                c.program = e.program;
                c.channel = e.channel.mo;
                if (c.videoIndex < 0 || c.videoIndex >= c.channel.length) {
                    c.videoIndex = c.channel.length - 1
                }
                c.checkOnAir()
            }
        };
        nmp.liveInfo(b, a, d)
    },
    checkOnAir: function() {
        if (this.program.onStatus == 2) {
            nmp.failAlert("errOffAir")
        } else {
            this.checkKoreaOnly()
        }
    },
    checkKoreaOnly: function() {
        if (this.program.koreaOnly) {
            var a = this;
            var b = function(c) {
                if (c === "KR") {
                    a.playStart()
                } else {
                    nmp.failAlert("errForeign")
                }
            };
            nmp.geoip(b)
        } else {
            this.playStart()
        }
    },
    addPv: function(b) {
        var a = this.isP2pStream(this.videoIndex) ? 1 : 2;
        nmp.addPv(this.program.liveId, a, b)
    },
    playStart: function() {
        if (this.os.ios) {
            if (this.isP2pStream(this.videoIndex)) {
                var a = this.makeUrlScheme();
                this.playNmpInIos(a)
            } else {
                this.playSecUrl(this.program.chId, this.videoIndex)
            }
        } else {
            if (this.os.android) {
                if (!this.isP2pStream(this.videoIndex)) {
                    this.playSecUrl(this.program.chId, this.videoIndex)
                } else {
                    if (!this.isNmpPlayableAndroid()) {
                        this.playSecUrl(this.program.chId, this.videoIndex)
                    } else {
                        var a = this.makeUrlScheme();
                        this.playNmpInAndroid(a)
                    }
                }
            } else {
                this.playSecUrl(this.program.chId, this.videoIndex)
            }
        }
    },
    isP2pStream: function(a) {
        return this.channel[a].p2p != undefined && this.channel[a].p2p != null
    },
    isNmpPlayableAndroid: function() {
        var a = nmp.getAndroidVersion();
        if (a >= 2.3 && a < 3) {
            return true
        } else {
            if (a >= 4) {
                return true
            }
        }
        return false
    },
    playNmpInAndroid: function(a) {
        if (!confirm(nmp.message.playAnd)) {
            return
        }
        this.addPv(function() {
            location.href = a
        })
    },
    playNmpInIos: function(a) {
        if (!confirm(nmp.message.playIos)) {
            return
        }
        this.addPv(function() {
            var g, f, d;
            if (typeof document.hidden !== "undefined") {
                g = "hidden";
                d = "visibilitychange";
                f = "visibilityState"
            } else {
                if (typeof document.mozHidden !== "undefined") {
                    g = "mozHidden";
                    d = "mozvisibilitychange";
                    f = "mozVisibilityState"
                } else {
                    if (typeof document.msHidden !== "undefined") {
                        g = "msHidden";
                        d = "msvisibilitychange";
                        f = "msVisibilityState"
                    } else {
                        if (typeof document.webkitHidden !== "undefined") {
                            g = "webkitHidden";
                            d = "webkitvisibilitychange";
                            f = "webkitVisibilityState"
                        }
                    }
                }
            }
            var h = document[f] == "visible";
            document.addEventListener(d, function() {
                h = document[f] == "visible"
            }, false);
            var j = document.getElementById("naverMediaPlayer");
            if (j) {
                document.body.removeChild(j)
            }
            var e = +new Date;
            try {
                var b = document.createElement("iframe");
                b.style.display = "none";
                b.id = "naverMediaPlayer";
                b.src = a;
                document.body.appendChild(b)
            } catch (i) {
                window.location = nmp.appStoreUrl;
                return
            }
            setTimeout(function() {
                if (+new Date - e < 1500 && h) {
                    window.location = nmp.appStoreUrl;
                    return
                }
            }, 1000)
        })
    },
    playSecUrl: function(a, c) {
        if (!confirm(nmp.message.playWeb)) {
            return
        }
        var e = nmp.isHlsPlayable(this.os, nmp.getAndroidVersion()) ? "hls" : "rtsp";
        var b = this;
        var d = function(f) {
            b.addPv(function() {
                location.href = f
            })
        };
        nmp.secUrl(a, this.channel[c].id, e, d)
    },
    makeCdnUrl: function(b, a) {
        if (nmp.isHlsPlayable(this.os, nmp.getAndroidVersion())) {
            return nmp.hlsHostUrl + "/" + b + "/_definst_/" + b + "_" + a + ".stream/playlist.m3u8"
        } else {
            return nmp.rtspHostUrl + "/" + b + "/" + b + "_" + a + ".stream"
        }
    },
    makeUrlScheme: function() {
        if (!this.os.ios && !this.os.android) {
            return ""
        }
        var f = this.os.ios ? "naverplayer" : "intent";
        var e = this.os.ios ? nmp.minAppVersionIos : nmp.minAppVersionAndroid;
        var g = this.program.moAdUrl ? this.program.moAdUrl : "";
        var c = this.os.ios ? "" : nmp.androidIntentSchemeExtra;
        var k = f + "://nlc_play?minAppVersion=" + e + "&is_addr=" + nmp.isAddr + "&is_port=" + nmp.isPort + "&serviceId=" + this.program.svcId + "&liveId=" + this.program.liveId + "&qualityId=" + this.channel[this.videoIndex].id + "&title=" + encodeURIComponent(this.program.title);
        for (var d = 0; d < this.channel.length;
            ++d) {
            var j = this.channel[d];
            var h = j.p2p ? "nlivecast" : "cdn";
            var a = j.p2p ? j.p2p : this.makeCdnUrl(this.program.chId, j.id);
            var b = "selected=" + (this.videoIndex == d) + "&&id=" + j.id + "&&title=" + j.name + "&&type=" + h + "&&url=" + a;
            k += "&video" + (d + 1) + "=" + encodeURIComponent(b)
        }
        k += "&ad=" + encodeURIComponent(g);
        k += c;
        return k
    }
};
nmp.play = function(b) {
    var a = new nmp.Player(b);
    a.requestPlay()
};