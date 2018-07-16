import $ from 'jquery';

export class Player 
{
    constructor ()
    {
        this.mediaElement;
    }

    render (info) 
    {   
        if ($('.playerContainer').length) // if media already exists on page
        {
            $('.playerContainer').remove();
        }     
        let container = $('<div class="playerContainer"></div>');
        $('.player').append(container);
        switch(info.type) 
        {
            case 'Image':
                this.mediaElement = $('<img src="' + info.source + '" />');
                break;
            case 'Video':
                this.mediaElement = $('<video controls src="' + info.source + '" />');
                break;
            case 'Audio':
                this.mediaElement = $('<audio src="' + info.source + '" />');
                break;
            default:
                return null;
        }
        this.mediaElement.css({
            width: '100%', // temporary - should be based on media dimensions eventually
            height: '100%'
        });
        $('.playerContainer').append(this.mediaElement);
    }
}