import $ from 'jquery';

export class Range
{
    constructor (label)
    {
        this.label = label;
        this.id = label.replace(/ /g,"_");
        this.startTimes = [];
        this.endTimes = [];
    }

    render () 
    {   
        let rangeContainer = $('.rangeContainer');
        let progressBar = $('<div class="progress-bar w-0" id="' + this.id + '" role="progressbar" style="transition:none"></div>');
        rangeContainer.append(progressBar);

        return;
    }
}