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

    if( typeof exports === 'object' ){
        module.exports = definition();

    }else if ( typeof define === 'function' && define.amd ){
        define( definition );

    } else {
        global.drawSvgLine = definition();
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
            return new DrawSvgLine( elm, conf );
        }

        //options
        var options = extend({
            strokeSpeed : 1000,
            fillSpeed   : 1000,
            delay       : 0
        }, conf );

        this.elm          = typeof elm === 'string' ? doc.getElementById( elm ) : elm;
        this.paths        = toArray( this.elm.getElementsByTagName( 'path' ) );
        this.pathsLen     = this.paths.length;
        this.totalLength  = [];
        this.currentFrame = 0;
        this.context      = null;
        this.callback     = null;
        this.nextCallback = null;

        this.options      = options;
        this.strokeSpeed  = options.strokeSpeed * RATIO;
        this.fillSpeed    = options.fillSpeed * RATIO;
        this.delay        = options.delay;

        for( var i = this.pathsLen; i--; ){
            var totalLength = this.paths[i].getTotalLength() + 30 + 1 | 0;
            
            this.totalLength[i] = totalLength;
            this.paths[i].style.strokeDasharray = totalLength + ' ' + totalLength;
            this.paths[i].style.strokeDashoffset = totalLength;
            this.paths[i].style.fillOpacity = 0;
        }
    }

    fillProto( DrawSvgLine.prototype, {
        draw : draw,
        turn : turn
    });

    function draw( callback ){
        if ( typeof callback !== 'undefined' ) {
            if ( typeof callback !== 'function' ) {
                throw new TypeError( 'Argument must be a Function.' );
            } else {
                this.callback = callback;
            }
        }
        
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

            if ( this.context ) {
                this.context.draw();
            }

        } else {
            this.currentFrame++;
            for( var i = this.pathsLen; i--; ) {
                this.paths[i].style.fillOpacity = progress;
            }
            handle = requestAnimation( fill.bind( this ), FPS );
        }
    }

    function turn( context, callback ) {
        if ( context.constructor.name !== 'DrawSvgLine' ) {
            throw new Error( 'The first argument must be an DrawSvgLine object.' );
        } else {
            this.context = context;
        }

        if ( typeof callback !== 'undefined' ) {
            if ( typeof callback !== 'function' ) {
                throw new TypeError( 'The second argument must be a Function.' );
            } else {
                this.context.callback = callback;
            }
        }

        return context;
    }

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