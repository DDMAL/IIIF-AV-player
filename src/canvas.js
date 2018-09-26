import $ from 'jquery';

var defaultCanvasWidth = 600,
    defaultCanvasHeight = 400;

export class Canvas
{
    constructor (canvasInfo)
    {
        this.url = canvasInfo.id;
        this.type = canvasInfo.type;
        this.label = canvasInfo.label || "Label";
        this.duration = canvasInfo.duration;

        this.annotationItems = [];
        this.isActive = false;
        this.canvasElement;
        this.rendering;
        this.measureStarts = [];
        this.measureEnds = [];
        this.ranges = [];
        this.loopMeasureStart = null;
        this.loopMeasureEnd = null;
        this.measures = [];

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

        let renderings = canvasInfo.rendering;
        if (renderings)
        {
            let numRenderings = renderings.length;

            for (var r = 0; r < numRenderings; r++) 
            {
                this.rendering = renderings[r];

                if (this.rendering.id.search(".mei") !== -1) 
                    break;
            }
        }
    }

    render()
    {
        let annotationContainer = $('<div class="annotationContainer"></div>');
        for (var i = 0; i < this.annotationItems.length; i++)
        {
            this.annotationItems[i].render();
            annotationContainer.append(this.annotationItems[i].mediaElement);
        }

        let canvasContainer = $('.canvasContainer');

        let canvas = $('<div class="canvas"></div>');
        canvas.css({
            width: '100%',
            height: 'auto'
        });
        canvas.append(annotationContainer);
        canvasContainer.append(canvas);

        this.canvasElement = canvas;

        return;
    }
}