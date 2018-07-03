import ImageManifest from './image-manifest';

class Parser 
{
    constructor () 
    {
        this.manifest = null;
    }

    print ()
    {
        alert('Testing if this shit works');
    }
}

export default Parser;

(function (global)
{
    global.Diva = global.Parser || Parser;
})(window);