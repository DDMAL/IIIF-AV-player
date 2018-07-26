import $ from 'jquery';

var defaultCanvasWidth = 600,
    defaultCanvasHeight = 400;

export class Canvas
{
    constructor (canvasInfo)
    {
        this.playerElement;
        this.mediaElements = [];

        if (!canvasInfo.width)
        {
            this.width = defaultCanvasWidth;
        }
        else
        {
            this.width = canvasInfo.width;
        }
        
        if (!canvasInfo.height)
        {
            this.height = defaultCanvasHeight;
        }
        else
        {
            this.height = canvasInfo.height;
        }
    }

    render(info)
    {
        let canvasContainer = $('<div>', {'class': 'canvasContainer', 'style': 'width:100%'});

        canvasContainer.width(this.width);
        canvasContainer.height(this.height);

        this.playerElement = $('.player');
        this.mediaElements.push(info);

        return (canvasContainer);
    }
}