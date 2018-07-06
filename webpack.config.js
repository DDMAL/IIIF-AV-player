const path = require('path');

module.exports = 
{
    mode: 'development',
    entry: './src/manifest-object.js',
    output: { 
        path: path.resolve(__dirname, 'static'),
        filename: 'main.js'
    }
};