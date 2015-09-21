'use strict'

# PLUGINS
gulp = require 'gulp'
sync = require 'browser-sync'

# サーバ起動
gulp.task 'sync', ->
    sync.init null,
        server :
            baseDir : './'

gulp.task 'default', ['sync']