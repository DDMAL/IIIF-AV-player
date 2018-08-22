import $ from 'jquery';

export class Range
{
    constructor (label)
    {
        this.label = label;
        this.startTimes = [];
        this.endTimes = [];
    }

    render () 
    {   
        let rangeContainer = $('.rangeContainer');

        let row = $('<div class="row" style="padding-bottom:5px"></div>');
        let column = $('<div class="col-md-6 offset-md-3"></div>');
        let progress = $('<div class="progress" style="height:8px"></div>');
        let progressBar = $('<div class="progress-bar bg-info w-0" role="progressbar" style="transition:none"></div>');

        progress.append(progressBar);
        column.append(progress);
        row.append(column);

        rangeContainer.append(row);

        return;
    }
}