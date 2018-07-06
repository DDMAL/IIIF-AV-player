export default class ManifestObject 
{
    constructor () 
    {
        this.id;
        this.type;
        this.label;
        this.description;
        this.canvases;
    }

    getObject (responseData) 
    {
        this.parseManifest(responseData);
        return this;
    }

    // updates all attributes
    parseManifest (manifest)  
    {
        // parse the manifest and assign to attributes
        this.id = manifest.id;
        this.type = manifest.type;
        this.label = manifest.label;
        this.description = manifest.description;

        // get canvas stuff
        this.canvases = [];
        if (Array.isArray(manifest.sequences)) {
            this.canvases = manifest.sequences[0].canvases;
        } else if (manifest.type === 'Canvas') {
            this.canvases.push(manifest);
        } else {
            this.canvases = manifest.sequences.canvases;
        }
    }
}