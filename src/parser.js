// import ImageManifest from './image-manifest';

class Parser 
{
    constructor () 
    {
        this.manifest = null;
    }

    print () 
    {
        console.log('This is a print method!');
    }
}

(function (global)
{
    global.Parser = global.Parser || Parser;
}) (window);