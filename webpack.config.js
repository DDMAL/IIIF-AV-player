const path = require('path');

module.exports = 
{
    mode: 'development',
    entry: './src/parser.js',
    output: { 
        path: path.resolve(__dirname, 'static'),
        filename: 'parser.js'
    }
};