const path = require('path');

module.exports = 
{
    mode: 'development',
    entry: './src/parser.js',
    output: { 
        path: path.join(__dirname, 'static'),
        filename: 'parser.js'
    }
};