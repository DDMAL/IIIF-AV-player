const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gulp-util');
const webpackConf = require('./webpack.config');

function server ()
{
    let config = Object.create(webpackConf);
    config.entry = "webpack-dev-server/client?http://localhost:9001/";
    config.mode = "development";
    config.devtool = "source-map";
    config.devServer = {
        inline: true
    };

    new WebpackDevServer(webpack(config),
        {
            publicPath: config.output.publicPath,
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

gulp.task('develop:server', server);
gulp.task('default', gulp.series('develop:server'));