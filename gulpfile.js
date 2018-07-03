const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gulp-util');
const webpackConf = require('./webpack.config');

function server ()
{
    let devConfig = Object.create(webpackConf);
    devConfig.entry = ("webpack-dev-server/client?http://localhost:9001/");
    devConfig.devtool = "source-map";
    devConfig.devServer = {
        inline: true
    };

    new WebpackDevServer(webpack(devConfig),
        {
            publicPath: devConfig.output.publicPath,
            stats: {
                colors: true
            }
        }).listen(9001, 'localhost', function (err)
    {
        if (err)
            throw new gutil.PluginError('dev-server', err);
        gutil.log('dev-server', "http://localhost:9001/index.html");
    });
}

function parser (done)
{
    var config = Object.create(webpackConf);
    webpack(config).run(done);
}

gulp.task('develop:build-parser', parser);
gulp.task('develop:server', server);
gulp.task('default', gulp.series('develop:build-parser', 'develop:server'));