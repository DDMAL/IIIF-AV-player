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

        this.clock = 0;
        this.clockStart = 0;
        this.isPlaying = false;
        this.annotationItems = [];
        this.canvasElement;
        this.rendering;
        this.measureStarts = [];
        this.measureEnds = [];
        this.ranges = [];
        this.loopMeasureStart = null;
        this.loopMeasureEnd = null;

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
        let containerWidth = canvasContainer.width();

        let canvas = $('<div class="canvas"></div>');
        canvas.width(containerWidth);
        canvas.height(this.height * (containerWidth/this.width));
        canvas.append(annotationContainer);
        canvasContainer.append(canvas);

        this.canvasElement = canvas;

        return;
    }

    play()
    {
        this.isPlaying = true;
        this.clockStart = Date.now();
    }
    pause()
    {
        this.isPlaying = false;

        let annotation;
        for (let i=0; i<this.annotationItems.length; i++)
        {
            annotation = this.annotationItems[i];
            annotation.pauseMedia();
        }
    }
    updateClock()
    {
        this.clock = (Date.now() - this.clockStart) / 1000;

        if (this.clock >= this.duration)
        {
            this.clock = this.duration;
            this.pause();
        }
    }
    checkMediaStates()
    {
        let annotation;
        for (let i=0; i<this.annotationItems.length; i++)
        {
            annotation = this.annotationItems[i];

            if (annotation.startTime <= this.clock && annotation.endTime >= this.clock)
            {
                if (!annotation.isActive)
                {
                    if (annotation.type === 'Video' || annotation.type === 'Audio')
                        annotation.playMedia();

                    annotation.isActive = true;
                    annotation.mediaElement.show();
                }
                else
                {
                    if ((annotation.type === 'Video' || annotation.type === 'Audio') && (annotation.getMediaTime() > annotation.getMediaDuration()))
                        annotation.pauseMedia();
                }
            }
            else
            {
                if (annotation.isActive)
                {
                    if (annotation.type === 'Video' || annotation.type === 'Audio')
                        annotation.pauseMedia();

                    annotation.isActive = false;
                    annotation.mediaElement.hide();
                }
            }
        }
    }
    synchronizeMedia()
    {
        
    }
}