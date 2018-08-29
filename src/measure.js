import $ from 'jquery';

export class Measure
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
        let measurebarContainer = $('.measurebarContainer');
        let progressBar = $('<div class="progress-bar w-0" id="' + this.id + '" role="progressbar" style="transition:none" onclick="navigateToMeasure(\'' + this.id + '\')"></div>');
        measurebarContainer.append(progressBar);

        return;
    }
}