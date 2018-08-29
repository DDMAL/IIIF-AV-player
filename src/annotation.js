import $ from 'jquery';

export class Annotation
{
    constructor (info)
    {
        this.mediaElement;
        this.source = info.source;
        this.type = info.type;
        this.leftPosition = info.left;
        this.topPosition = info.top;
        this.height = info.height;
        this.width = info.width;
        this.startTime = info.start;
        this.endTime = info.end;
        this.isActive = false;
    }

    render () 
    {   
        switch(this.type) 
        {
            case 'Image':
                this.mediaElement = $('<img src="' + this.source + '" />');
                break;
            case 'Video':
                this.mediaElement = $('<video src="' + this.source + '"ontimeupdate=\"updateTimeline()\" />');
                break;
            case 'Audio':
                this.mediaElement = $('<audio src="' + this.source + '"ontimeupdate=\"updateTimeline()\" />');
                break;
            default:
                return null;
        }
        this.mediaElement.css({
            top: this.topPostion + '%',
            left: this.leftPosition + '%',
            width: this.width + '%',
            height: this.height + '%'
        }).hide();
    }

    getMediaTime()
    {
        return (this.mediaElement[0].currentTime);
    }
    setMediaTime(time)
    {
        this.mediaElement[0].currentTime = time;
    }
    getMediaDuration()
    {
        return (this.mediaElement[0].duration);
    }
    playMedia()
    {
        this.mediaElement[0].play();
    }
    pauseMedia()
    {
        this.mediaElement[0].pause();
    }
}