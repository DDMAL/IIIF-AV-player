import ImageManifest from './image-manifest';

class Parser 
{
    constructor () 
    {
        this.manifest = null;
    }

    fetchManifest (manifestURL)
    {
        fetch(manifestURL, {
            headers: {
                "Accept": "application/json"
            }
        }).then( (response) =>
        {
            if (!response.ok)
            {
                alert('Could not get manifest! Make sure you provide a proper link.');
            }
            return response.json();
        }).then( (responseData) =>
        {
            this.setManifest(responseData);
        });
    }

    setManifest (responseData)
    {
        this.manifest = ImageManifest.fromIIIF(responseData);
    }
}

(function (global)
{
    global.Parser = global.Parser || Parser;
}) (window);