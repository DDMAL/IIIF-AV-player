import parseIIIFManifest from './parse-iiif-manifest';

class ManifestObject 
{
    constructor (url) 
    {
        this.manifest;
        this.url = url;
    }

    fetchManifest (callback)
    {
        fetch(this.url, {
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
        this.manifest = parseIIIFManifest(responseData);

        callback(this.manifest);
    }
}

(function (global)
{
    global.ManifestObject = global.ManifestObject || ManifestObject;
}) (window);