import ManifestObject from './manifest-object';

class Parser 
{
    constructor () 
    {
        this.manifest = null;
    }

    fetchManifest (manifestURL, callback)
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
            this.setManifest(responseData, callback);
        });
    }

    setManifest (responseData, callback)
    {
        let mo = new ManifestObject();
        this.manifest = mo.getObject(responseData);

        callback(this.manifest);
    }
}

(function (global)
{
    global.Parser = global.Parser || Parser;
}) (window);