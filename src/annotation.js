import $ from 'jquery';

export class Annotation
{
    constructor (info)
    {
        this.mediaElement;
        this.source = info.source;
        this.type = info.type;
        this.height = info.height;
        this.width = info.width;
    }

    render () 
    {   
        switch(this.type) 
        {
            case 'Image':
                this.mediaElement = $('<img src="' + this.source + '" />');
                break;
            case 'Video':
                this.mediaElement = $('<video src="' + this.source + '" />');
                break;
            case 'Audio':
                this.mediaElement = $('<audio controls src="' + this.source + '" />');
                break;
            default:
                return null;
        }
        this.mediaElement.css({
            width: this.width + '%',
            height: this.height + '%'
        });
    }
}