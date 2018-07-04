const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gulp-util');
const webpackConf = require('./webpack.config');
const jshint = require('gulp-jshint');

function webpackDevServer () 
{
    let compiler = webpack(webpackConf);

    new WebpackDevServer(compiler, 
    {
        stats: {
            colors: true
        }
    }).listen(9001, 'localhost', function (err) 
    {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:9001/index.html');
    });
}

function lint (files)
{
    return gulp.src(files)
        .pipe(jshint({lookup: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail')); // fails task if error
}

function lintSrc ()
{
    return lint('src/*.js');
}

function build (done)
{
    webpack(webpackConf).run(done);
}

gulp.task('develop:lintSrc', lintSrc);
gulp.task('develop:lint', gulp.series('develop:lintSrc'));

gulp.task('develop:build', build);
gulp.task('develop:server', webpackDevServer);
gulp.task('develop', gulp.series('develop:lint', 'develop:build', 'develop:server'));
gulp.task('default', gulp.series('develop'));