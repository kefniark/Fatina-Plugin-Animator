(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("FatinaPluginAnimator", [], factory);
	else if(typeof exports === 'object')
		exports["FatinaPluginAnimator"] = factory();
	else
		root["FatinaPluginAnimator"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var animatorManager_1 = __webpack_require__(1);
var tickerManager_1 = __webpack_require__(3);
var stats = __webpack_require__(4);
function Get() {
    return new FatinaPluginAnimator();
}
exports.Get = Get;
var FatinaPluginAnimator = (function () {
    function FatinaPluginAnimator() {
        this.name = 'fatina-plugin-animator';
        this.init = false;
        this.counter = 0;
        this.running = 0;
    }
    Object.defineProperty(FatinaPluginAnimator.prototype, "TickerManager", {
        get: function () {
            return this.fatina.plugin.TickerManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatinaPluginAnimator.prototype, "AnimatorManager", {
        get: function () {
            return this.fatina.plugin.AnimatorManager;
        },
        enumerable: true,
        configurable: true
    });
    FatinaPluginAnimator.prototype.Init = function (fatina) {
        var _this = this;
        if (this.init) {
            throw new Error('Try to init the plugin twice : ' + name);
        }
        if (fatina === undefined || fatina === null || fatina.plugin === null) {
            throw new Error('Try to init the plugin without fatina : ' + name);
        }
        this.fatina = fatina;
        this.init = true;
        fatina.plugin.AnimatorManager = new animatorManager_1.AnimatorManager(this);
        fatina.plugin.TickerManager = new tickerManager_1.TickerManager(this);
        fatina.plugin.StatPanel = new stats.Panel('Tweens', '#ff8', '#221');
        fatina.AddListenerCreated(function (tween) {
            tween.OnStart(function () { return _this.running++; });
            tween.OnComplete(function () { return _this.running--; });
            tween.OnKilled(function () { return _this.running--; });
            _this.counter++;
        });
        fatina.SetInterval(function () {
            fatina.plugin.StatPanel.update('instantiate', _this.counter);
            fatina.plugin.StatPanel.update('running', _this.running);
        }, 16);
    };
    return FatinaPluginAnimator;
}());
exports.FatinaPluginAnimator = FatinaPluginAnimator;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var animator_1 = __webpack_require__(2);
var AnimatorManager = (function () {
    function AnimatorManager(plugin) {
        this.animations = {};
        this.tickerMap = {};
        this.plugin = plugin;
    }
    Object.defineProperty(AnimatorManager.prototype, "Animations", {
        get: function () {
            return Object.keys(this.animations);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorManager.prototype, "Labels", {
        get: function () {
            var _this = this;
            return Object.keys(this.tickerMap).map(function (x) { return _this.tickerMap[x]; }).filter(function (piece, index, self) { return self.indexOf(piece) === index; });
        },
        enumerable: true,
        configurable: true
    });
    AnimatorManager.prototype.Register = function (name, onCreate, tickerName) {
        if (this.animations[name] && this.tickerMap[name]) {
            delete this.tickerMap[name];
        }
        this.animations[name] = onCreate;
        if (tickerName) {
            this.tickerMap[name] = tickerName;
        }
        return this;
    };
    AnimatorManager.prototype.Instantiate = function (name, object, params) {
        if (!(name in this.animations)) {
            throw new Error('this animation doesnt exist ' + name);
        }
        var tween = this.animations[name](object, params);
        if (this.tickerMap[name]) {
            tween.SetParent(this.plugin.TickerManager.Get(this.tickerMap[name]));
        }
        return tween;
    };
    AnimatorManager.prototype.AddAnimatorTo = function (obj) {
        if (!obj.Animator) {
            obj.Animator = new animator_1.Animator(obj, this);
        }
        return obj.Animator;
    };
    return AnimatorManager;
}());
exports.AnimatorManager = AnimatorManager;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Animator = (function () {
    function Animator(obj, animatorManager) {
        this.animations = {};
        this.current = {};
        this.groups = ['default'];
        this.currentAnimName = {};
        this.animGroupMap = {};
        this.animTransitionMap = {};
        this.animFinalValueMap = {};
        this.animUnstoppableMap = {};
        this.eventStart = {};
        this.eventOnceStart = {};
        this.eventComplete = {};
        this.eventOnceComplete = {};
        this.object = obj;
        this.animatorManager = animatorManager;
    }
    Animator.prototype.AddAnimation = function (name, animationName, options, params) {
        var anim = this.animatorManager.Instantiate(animationName, this.object, params);
        return this.AddCustomAnimation(name, options || {}, anim);
    };
    Animator.prototype.AddCustomAnimation = function (name, options, tween) {
        var _this = this;
        var anim = tween;
        anim.OnStart(function () {
            _this.EmitEvent(_this.eventStart[name]);
            if (name in _this.eventOnceStart) {
                _this.EmitEvent(_this.eventOnceStart[name]);
                _this.eventOnceStart[name] = [];
            }
        });
        anim.OnKilled(function () {
            anim.Recycle();
            _this.EmitEvent(_this.eventComplete[name]);
            if (name in _this.eventOnceComplete) {
                _this.EmitEvent(_this.eventOnceComplete[name]);
                _this.eventOnceComplete[name] = [];
            }
        });
        anim.OnComplete(function () {
            anim.Recycle();
            _this.EmitEvent(_this.eventComplete[name]);
            if (name in _this.eventOnceComplete) {
                _this.EmitEvent(_this.eventOnceComplete[name]);
                _this.eventOnceComplete[name] = [];
            }
            if (name in _this.animTransitionMap) {
                _this.Play(_this.animTransitionMap[name]);
            }
        });
        this.animations[name] = anim;
        this.animFinalValueMap[name] = options ? !!options.finalValue : false;
        this.animUnstoppableMap[name] = options ? !!options.unstoppable : false;
        this.animGroupMap[name] = (options && options.group) ? options.group : 'default';
        if (options && options.next) {
            this.animTransitionMap[name] = options.next;
        }
        if (this.groups.indexOf(this.animGroupMap[name]) === -1) {
            this.groups.push(this.animGroupMap[name]);
        }
        return this;
    };
    Animator.prototype.Emit = function (func, args) {
        try {
            func.apply(this, args);
        }
        catch (e) {
            console.warn(e);
        }
    };
    Animator.prototype.EmitEvent = function (listeners, args) {
        if (!listeners) {
            return;
        }
        for (var i = 0; i < listeners.length; i++) {
            this.Emit(listeners[i], args);
        }
    };
    Animator.prototype.OnStartAll = function (name, cb) {
        if (name in this.eventStart) {
            this.eventStart[name].push(cb);
        }
        else {
            this.eventStart[name] = [cb];
        }
        return this;
    };
    Animator.prototype.OnStart = function (name, cb) {
        if (name in this.eventOnceStart) {
            this.eventOnceStart[name].push(cb);
        }
        else {
            this.eventOnceStart[name] = [cb];
        }
        return this;
    };
    Animator.prototype.OnCompleteAll = function (name, cb) {
        if (name in this.eventComplete) {
            this.eventComplete[name].push(cb);
        }
        else {
            this.eventComplete[name] = [cb];
        }
        return this;
    };
    Animator.prototype.OnComplete = function (name, cb) {
        if (name in this.eventOnceComplete) {
            this.eventOnceComplete[name].push(cb);
        }
        else {
            this.eventOnceComplete[name] = [cb];
        }
        return this;
    };
    Animator.prototype.Play = function (name, onComplete) {
        if (!(name in this.animations)) {
            throw new Error('this animation doesnt exist ' + name);
        }
        var layerName = this.animGroupMap[name];
        var current = this.current[layerName];
        if (current && current.IsRunning() && this.animUnstoppableMap[this.currentAnimName[layerName]]) {
            console.log('This animation already run and is unstoppable', this.currentAnimName[layerName], '->', name);
            return;
        }
        if (current && (current.IsRunning() || current.IsPaused())) {
            var currentAnimName = this.currentAnimName[layerName];
            current.Skip(this.animFinalValueMap[currentAnimName]);
            this.current[layerName] = undefined;
        }
        current = this.animations[name];
        this.current[layerName] = current;
        this.currentAnimName[layerName] = name;
        if (onComplete) {
            this.OnComplete(name, onComplete);
        }
        current.Start();
        return;
    };
    Animator.prototype.Pause = function (group) {
        var layerName = !group ? 'default' : group;
        var current = this.current[layerName];
        if (current && current.IsRunning()) {
            current.Pause();
        }
    };
    Animator.prototype.PauseAll = function () {
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var layerId = _a[_i];
            this.Pause(layerId);
        }
    };
    Animator.prototype.Resume = function (group) {
        var layerName = !group ? 'default' : group;
        var current = this.current[layerName];
        if (current && current.IsPaused()) {
            current.Resume();
        }
    };
    Animator.prototype.ResumeAll = function () {
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var layerId = _a[_i];
            this.Resume(layerId);
        }
    };
    Animator.prototype.Stop = function (group) {
        var layerName = !group ? 'default' : group;
        var current = this.current[layerName];
        if (current && !current.IsFinished()) {
            var currentAnimName = this.currentAnimName[layerName];
            current.Skip(this.animFinalValueMap[currentAnimName]);
            this.current[layerName] = undefined;
        }
    };
    Animator.prototype.StopAll = function () {
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var layerId = _a[_i];
            this.Stop(layerId);
        }
    };
    Animator.prototype.Destroy = function () {
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var layerId = _a[_i];
            var current = this.current[layerId];
            if (current && !current.IsFinished()) {
                current.Kill();
            }
        }
        this.animations = {};
        this.animGroupMap = {};
        this.animFinalValueMap = {};
        this.animUnstoppableMap = {};
        this.current = {};
        this.currentAnimName = {};
        delete this.object.Animator;
    };
    return Animator;
}());
exports.Animator = Animator;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TickerManager = (function () {
    function TickerManager(plugin) {
        this.tickers = {};
        this.plugin = plugin;
    }
    TickerManager.prototype.Get = function (name) {
        if (this.tickers[name]) {
            return this.tickers[name];
        }
        this.tickers[name] = this.plugin.fatina.Ticker();
        return this.tickers[name];
    };
    TickerManager.prototype.PauseAll = function (name) {
        if (this.tickers[name]) {
            this.tickers[name].Pause();
        }
    };
    TickerManager.prototype.ResumeAll = function (name) {
        if (this.tickers[name]) {
            this.tickers[name].Resume();
        }
    };
    TickerManager.prototype.KillAll = function (name) {
        if (this.tickers[name]) {
            this.tickers[name].Kill();
            delete this.tickers[name];
        }
    };
    return TickerManager;
}());
exports.TickerManager = TickerManager;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// stats.js - http://github.com/mrdoob/stats.js
(function(f,e){ true?module.exports=e():"function"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();
u(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel("FPS","#0ff","#002")),h=e(new f.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var t=e(new f.Panel("MB","#f08","#201"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/
1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=h;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);
b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+" "+e+" ("+g(c)+"-"+g(k)+")",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});


/***/ })
/******/ ]);
});
//# sourceMappingURL=fatina-plugin-animator.js.map