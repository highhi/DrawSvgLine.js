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

;(function( global, definition){
    'use strict';

    if(typeof exports === 'object'){
        module.exports = definition();

    }else if(typeof define === 'function' && define.amd){
        define(definition);

    } else {
        global.DrawSvgLine = definition();
    }

})( this, function(){

    'use strict';

    var win = window,
        doc = document;

    var requestAnimation = 
        win.requestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.msRequestAnimationFrame ||
        win.setTimeout;

    var cancelAnimation = 
        win.cancelAnimationFrame ||
        win.mozCancelAnimationFrame ||
        win.webkitCancelAnimationFrame ||
        win.msCancelAnimationFrame ||
        win.clearTimeout;

    var FPS   = 1000 / 60 | 0;
    var RATIO = 60 / 1000;

    function DrawSvgLine( elm, conf ){
        if( !( this instanceof DrawSvgLine ) ) {
            return new DrawSvgLine( elm );
        }

        var options = extend({
            strokeSpeed : 1000,
            fillSpeed   : 1000,
            delay       : 0
        }, conf );

        this.elm = typeof elm === 'string' ? doc.getElementById( elm ) : elm;
        this.paths = toArray( this.elm.getElementsByTagName( 'path' ) );
        this.pathsLen = this.paths.length;
        this.totalLength = [];
        this.currentFrame = 0;

        //options
        this.strokeSpeed = options.strokeSpeed * RATIO;
        this.fillSpeed   = options.fillSpeed * RATIO;
        this.delay       = options.delay;
        this.fixfox      = options.fixfox;

        for( var i = this.pathsLen; i--; ){
            var totalLength = this.paths[i].getTotalLength() + 30;
            
            this.totalLength[i] = totalLength;
            this.paths[i].style.strokeDasharray = totalLength + ' ' + totalLength;
            this.paths[i].style.strokeDashoffset = totalLength;
            this.paths[i].style.fillOpacity = 0;
        }
    }

    fillProto( DrawSvgLine.prototype, {
        draw     : draw,
        compleat : compleat
    });

    function draw(){
        stroke.call( this );
        return this;
    }

    function stroke() {
        var progress = this.currentFrame / this.strokeSpeed,
            handle;

        if ( progress > 1 ) {
            cancelAnimation(handle);
            this.currentFrame = 0;
            setTimeout( fill.bind( this ), this.delay );
        } else {
            this.currentFrame++;
            for ( var i = this.pathsLen; i--; ) {
                this.paths[i].style.strokeDashoffset = this.totalLength[i] * (1 - progress) | 0;
            }
            handle = requestAnimation( stroke.bind(this), FPS );
        }
    };

    function fill(){
        var progress = this.currentFrame / this.fillSpeed,
            handle;

        if ( progress > 1 ){
            cancelAnimation( handle );
            this.currentFrame = 0;

            if ( this.callback ){
                this.callback();
            }
        } else {
            this.currentFrame++;
            for( var i = this.pathsLen; i--; ) {
                this.paths[i].style.fillOpacity = progress;
            }
            handle = requestAnimation( fill.bind( this ), FPS );
        }
    }

    function compleat( func ){
        if( typeof func !== 'function' ) return;
        this.callback = func;
    };

    //
    // helpaers
    //============================================
    function fillProto( a, b ) {
        var key
        for ( key in b ) {
            if ( b.hasOwnProperty( key ) && !( key in a ) ) {
                a[key] = b[key];
            }
        }
    }

    function extend( a, b ) {
        if ( typeof b === 'undefined' ) {
            return a;
        }
        var key;
        for ( key in b ) {
            if ( b.hasOwnProperty( key ) && a.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function toArray( obj ) {
        return Array.prototype.slice.call( obj );
    }

    return DrawSvgLine;
});