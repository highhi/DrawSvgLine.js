 /*
 *  drawSvgLine.js
 *
 * https://github.com/highhi/DrawSvgLine.js
 *
 * Copyright (c) 2015 Kazuya Mizuno
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function(definition){
    'use strict';

    if(typeof exports === 'object'){
        module.exports = definition();

    }else if(typeof define === 'function' && define.amd){
        define(definition);

    } else {
        window.DrawSvgLine = definition();
    }

})(function(){

    'use strict';

    var requestAnimation = 
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.setTimeout;

    var cancelAnimation = 
        window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.clearTimeout;

    var FPS = 1000 / 60 | 0;
    var RATIO = 60 / 1000;

    function DrawSvgLine(elm, options){
        if(!(this instanceof DrawSvgLine)){
            return new DrawSvgLine(elm);
        }

        var _this = this,
            o = options || {};

        _this.elm = typeof elm === 'string' ? document.getElementById(elm) : elm;
        _this.paths = _this.elm.querySelectorAll('path');
        _this.pathsLen = _this.paths.length;
        _this.totalLength = [];
        _this.currentFrame = 0;

        //options
        _this.strokeSpeed = o.strokeSpeed ? o.strokeSpeed * RATIO : 1000 * RATIO;
        _this.fillSpeed = o.fillSpeed ? o.fillSpeed * RATIO : 1000 * RATIO;
        _this.delay = o.delay ? o.delay : 0;
        _this.fixfox = o.fixfox ? o.fixfox : 300;

        for(var i = 0; i < _this.pathsLen; i++){
            var L = _this.paths[i].getTotalLength() + 30;

            //Firefox対策
            if(isNaN(L)) L = _this.fixfox;
            
            _this.totalLength[i] = L;
            _this.paths[i].style.strokeDasharray = L + ' ' + L;
            _this.paths[i].style.strokeDashoffset = L;
            _this.paths[i].style.fillOpacity = 0;
        }
    }

    DrawSvgLine.prototype.draw = function(){
        var _this = this;

        _this._order();

        return _this;
    };

    DrawSvgLine.prototype._stroke = function(){
        var _this = this,
            progress = _this.currentFrame / _this.strokeSpeed;

        if (progress > 1) {
            cancelAnimation(handle);
            _this.currentFrame = 0;
            setTimeout(_this._fill.bind(_this), _this.delay);
        } else {
            _this.currentFrame++;
            for(var i = 0; i < _this.pathsLen; i++){
                _this.paths[i].style.strokeDashoffset = _this.totalLength[i] * (1 - progress) | 0;
            }
            var handle = requestAnimation(_this._stroke.bind(_this), FPS);
        }
    };

    DrawSvgLine.prototype._order = function(){
        var _this = this,
            progress = _this.currentFrame / _this.strokeSpeed;

        if (progress > 1) {
            cancelAnimation(handle);
            _this.currentFrame = 0;
            setTimeout(_this._fill.bind(_this), _this.delay);
        } else {
            _this.paths[0].style.strokeDashoffset = _this.totalLength[0] * (1 - progress) | 0;
            var handle = requestAnimation(_this._order.bind(_this), FPS);
        }
    };

    DrawSvgLine.prototype._fill = function(){
        var _this = this,
            progress = _this.currentFrame / _this.fillSpeed;

        if (progress > 1){
            cancelAnimation(handle);
            _this.currentFrame = 0;
            if(this.callback){
                this.callback();
            }
        }else {
            _this.currentFrame++;
            for(var i = 0; i < _this.pathsLen; i++){
                _this.paths[i].style.fillOpacity = progress;
            }
            var handle = requestAnimation(_this._fill.bind(_this), FPS);
        }
    };

    DrawSvgLine.prototype.compleat = function(func){
        if(typeof func !== 'function') return;
        this.callback = func;
    };

    return DrawSvgLine;
});