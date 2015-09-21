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
;(function(global, definition){
    'use strict';

    if(typeof exports === 'object'){
        module.exports = definition();

    }else if(typeof define === 'function' && define.amd){
        define(definition);

    } else {
        global.DrawSvgLine = definition();
    }

})(this, function(){

    'use strict';

    var requestAnimation = 
        requestAnimationFrame ||
        mozRequestAnimationFrame ||
        webkitRequestAnimationFrame ||
        msRequestAnimationFrame ||
        setTimeout;

    var cancelAnimation = 
        cancelAnimationFrame ||
        mozCancelAnimationFrame ||
        webkitCancelAnimationFrame ||
        msCancelAnimationFrame ||
        clearTimeout;

    var FPS = 1000 / 60 | 0;
    var RATIO = 60 / 1000;

    function DrawSvgLine(elm, options){
        if(!(this instanceof DrawSvgLine)){
            return new DrawSvgLine(elm);
        }

        var _this = this;
        var o = options || {};

        _this.elm = typeof elm === 'string' ? document.querySelector(elm) : elm;
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
            var len = _this.paths[i].getTotalLength() + 30;

            //Firefox対策
            if(isNaN(len)) len = _this.fixfox;
            
            _this.totalLength[i] = len;
            _this.paths[i].style.strokeDasharray = len + ' ' + len;
            _this.paths[i].style.strokeDashoffset = len;
            _this.paths[i].style.fillOpacity = 0;
        }
    }

    DrawSvgLine.prototype.draw = function(){
        var _this = this;
        _this._stroke();

        return _this;
    };

    DrawSvgLine.prototype._stroke = function(){
        var _this = this,
            progress = _this.currentFrame / _this.strokeSpeed,
            handle = null;

        if (progress > 1) {
            cancelAnimation(handle);
            _this.currentFrame = 0;
            setTimeout(_this._fill(), _this.delay);
        } else {
            _this.currentFrame++;
            for(var i = 0; i < _this.pathsLen; i++){
                _this.paths[i].style.strokeDashoffset = _this.totalLength[i] * (1 - progress) | 0;
            }
            handle = requestAnimation(_this._stroke(), FPS);
        }
    };

    DrawSvgLine.prototype._fill = function(){
        var _this = this,
            progress = _this.currentFrame / _this.fillSpeed,
            handle = null;

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
            handle = requestAnimation(_this._fill(), FPS);
        }
    };

    DrawSvgLine.prototype.compleat = function(func){
        if(typeof func !== 'function') return;
        this.callback = func;
    };

    return DrawSvgLine;
});