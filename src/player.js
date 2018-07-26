import $ from 'jquery';

export class Player 
{
    constructor ()
    {
        this.mediaElement;
    }

    render (info, canvasContainer) 
    {   
        let player = $('<div class="player"></div>');
        player.append(canvasContainer);
        $('.playerContainer').append(player);
        
        switch(info.type) 
        {
            case 'Image':
                this.mediaElement = $('<img src="' + info.source + '" />');
                break;
            case 'Video':
                this.mediaElement = $('<video src="' + info.source + '" />');
                break;
            case 'Audio':
                this.mediaElement = $('<audio controls src="' + info.source + '" />');
                break;
            default:
                return null;
        }
        this.mediaElement.css({
            width: '100%', // temporary - should be based on media dimensions eventually
            height: '100%'
        });
        canvasContainer.append(this.mediaElement);
    }
}