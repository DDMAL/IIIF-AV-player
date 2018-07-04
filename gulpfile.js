const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gulp-util');
const webpackConf = require('./webpack.config');

function webpackDevServer ()
{
    let compiler = webpack(webpackConf);

    new WebpackDevServer(compiler, {
        publicPath: webpackConf.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(9001, 'localhost', function (err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:9001/index.html');
    });
}

gulp.task('develop:server', webpackDevServer);
gulp.task('default', gulp.series('develop:server'));