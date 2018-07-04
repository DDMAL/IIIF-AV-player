// import ImageManifest from './image-manifest';

class Parser 
{
    constructor () 
    {
        this.manifest = null;
    }

    print () 
    {
        console.log('Testing if this works');
    }
}

(function (global)
{
    global.Parser = global.Parser || Parser;
}) (window);