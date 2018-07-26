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
        let canvasContainer = $('.canvasContainer');

        var containerWidth = canvasContainer.width();

        var resizeFactorY = containerWidth / this.width,
        newHeight = this.height * resizeFactorY;
        canvasContainer.height(newHeight);

        this.playerElement = $('.player');
        this.mediaElements.push(info);
    }
}