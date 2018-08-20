// Variables for controlling the requestAnimationFrame frequency
var refreshInterval = 50;
var now, then, elapsed;

// Manifest fetching and callback actions
var manifestObject;
var activeCanvasIndex;
$('#getURL').click(function () 
{
    let url = $('#urlBox').val();

    // clear all previous canvases
    $('.canvas').remove();

    manifestObject = new ManifestObject(url); // jshint ignore:line
    manifestObject.fetchManifest(function ()
    {
        // callback once manifest is fetched
        // set title
        let title = manifestObject.manifest.item_title;
        if (typeof title !== 'string')  
            title = title.en[0];
        $('#title').html(title);

        // load list of canvas names
        loadCanvasList();

        // display canvas 0 on load
        activeCanvasIndex = 0;
        navigateToCanvas(activeCanvasIndex);

        $("#timeline_controls").show();
        $("#player_controls").show();
    });
});


function loadPreset (url) // jshint ignore:line
{
    $('#urlBox').val(url);
    $('#getURL').click();
}

// Verovio score rendering and score manipulation
var toolkit = new verovio.toolkit(); // jshint ignore:line 
var page = 0; 
async function renderVerovio () // jshint ignore:line 
{
    let scoreFile = "static/mei/demo.mei";

    if (manifestObject.manifest.canvases[activeCanvasIndex].rendering)
    {
        scoreFile = manifestObject.manifest.canvases[activeCanvasIndex].rendering.id;
    }

    await $.ajax({ // jshint ignore:line
        url: scoreFile,
        dataType: "text", 
        success: function (data) 
        {
            $('.score').empty(); // clear previous verovio renderings
            toolkit.loadData(data, {});
            for (var i = 1; i <= toolkit.getPageCount(); i++) // verovio pages are 1-indexed
            {
                let svg = toolkit.renderToSVG(i, {});
                $('.score').append(svg);
                $('.score').children().last().find('.measure').attr('class', 'measure page'+ i);
                $('.score').children().hide();
            }
            $('.score').children().first().show(); // show first page
            $('svg').width("100%");
            $('svg').height("100%");
        }
    });
    linkScore();
}
function pagePrev () // jshint ignore:line
{
    if (page === 0)
        return;
    $('.score').children().eq(page).hide();
    page--;
    $('.score').children().eq(page).show();
}
function pageNext () // jshint ignore:line
{
    if (page === toolkit.getPageCount()-1)
        return;
    $('.score').children().eq(page).hide();
    page++;
    $('.score').children().eq(page).show();
}
function goToPage (n)
{
    if (n < 0 || n >= toolkit.getPageCount())
        return;
    $('.score').children().eq(page).hide();
    page = n;
    $('.score').children().eq(page).show();
}

function navigateToCanvas(canvasIndex) // jshint ignore:line
{
    activeCanvasIndex = canvasIndex;
    $('.canvasContainer .canvas').hide();

    manifestObject.manifest.canvases[activeCanvasIndex].canvasElement.show();

    if (manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].type === 'Audio')
        $('#media_icon').show();
    else
        $('#media_icon').hide();

    renderVerovio();
    updateTotalTime();
    stopButtonPress();
}


// Score and player syncing
var loopMeasureStart = null;
var loopMeasureEnd = null;
function linkScore ()
{
    let count = 0;
    let max = manifestObject.manifest.canvases[activeCanvasIndex].measureStarts.length;
    // assign a start and end time to every measure
    $('.measure').each(function () 
    {
        let timeStart = parseFloat(manifestObject.manifest.canvases[activeCanvasIndex].measureStarts[count]);
        let timeEnd = parseFloat(manifestObject.manifest.canvases[activeCanvasIndex].measureEnds[count]);
        if (count >= max)
            timeStart = timeEnd = 0;
        $(this).attr('timeStart', timeStart);
        $(this).attr('timeStop', timeEnd);
        count++;
    });
    // fill red and goto time in media 
    var clickMeasureInitial = null;
    var clickMeasureFinal = null;
    $('.measure').click(function (event) 
    {
        clearMeasures();
        fillMeasure(this);

        // user selecting multiple measure for looping
        if (event.shiftKey)
        {
            // second click in selection
            if (clickMeasureInitial !== null && !isMediaPlaying())
            {
                clickMeasureFinal = this;

                setMeasureRange(clickMeasureInitial, clickMeasureFinal);

                fillMeasureRange(loopMeasureStart, loopMeasureEnd);
                setTimelineRange($(loopMeasureStart).attr('timeStart'));
            }
        }
        else // regular left-click
        {
            if (!isMediaPlaying())
            {
                clickMeasureInitial = this;
            }

            loopMeasureStart = null;
            loopMeasureEnd = null;

            setMediaTime($(this).attr('timeStart'));
            setTimelineRange(0);
            updateTimeline();
        }
    });
}

// Media functions
var animationID;
function trackMedia ()
{
    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > refreshInterval)
    {
        then = now - (elapsed % refreshInterval);

        let time = getMediaTime();

        // looping is enabled
        if (loopMeasureStart !== null && loopMeasureEnd !== null)
        {
            // loop back
            if (time >= $(loopMeasureEnd).attr('timeStop'))
            {
                setMediaTime($(loopMeasureStart).attr('timeStart'));
                time = $(loopMeasureStart).attr('timeStart');
            }

            fillMeasureRange(loopMeasureStart, loopMeasureEnd);
        }
        else
        {
            clearMeasures();
        }

        // Update current measure in score
        $('.measure').each(function () {
            let lower = truncateNum($(this).attr('timeStart'), 3); 
            let upper = truncateNum($(this).attr('timeStop'), 3);
            if (time >= lower && time < upper && time !== 0)
            {
                fillMeasure(this);
            }
            else if (time === 0)
                $('.measure').removeAttr('fill');
        });
    }

    if (isMediaPlaying())
        animationID = requestAnimationFrame(trackMedia);
}
function playMedia()
{
    manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].mediaElement[0].play();
}
function pauseMedia()
{
    manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].mediaElement[0].pause();
}
function setMediaTime(time)
{
    manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].mediaElement[0].currentTime = time;
}
function getMediaTime()
{
    return (manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].mediaElement[0].currentTime);
}
function isMediaPlaying()
{
    return (!manifestObject.manifest.canvases[activeCanvasIndex].annotationItems[0].mediaElement[0].paused);
}
function getCanvasDuration()
{
    return (manifestObject.manifest.canvases[activeCanvasIndex].duration);
}

// Measure highlighting functions
function fillMeasure (measure) 
{
    $(measure).attr('fill', '#dd0000');
    goToPage($(measure).attr('class').split(' ')[1].slice(-1) - 1);
}
function fillMeasureRange(measureStart, measureEnd)
{
    let loopStartTime = $(measureStart).attr('timeStart');
    let loopEndTime = $(measureEnd).attr('timeStart');

    $('.measure').each(function () 
    {
        let measureTime = truncateNum($(this).attr('timeStart'), 3);

        if (measureTime >= loopStartTime && measureTime <= loopEndTime ) 
        {
            $(this).attr('fill', '#000080');
        }
    });
}
function clearMeasures ()
{
    $('.measure').removeAttr('fill');
}
function setMeasureRange(clickMeasureInitial, clickMeasureFinal)
{
    let measureInitialStartTime = truncateNum($(clickMeasureInitial).attr('timeStart'), 3);
    let measureFinalStartTime = truncateNum($(clickMeasureFinal).attr('timeStart'), 3);
    let measureInitialEndTime = truncateNum($(clickMeasureInitial).attr('timeStop'), 3);
    let measureFinalEndTime = truncateNum($(clickMeasureFinal).attr('timeStop'), 3);

    // find if second click is before or after initial click in the score 
    if (measureInitialStartTime <= measureFinalStartTime)
    {

        loopMeasureStart = clickMeasureInitial;
        loopMeasureEnd = clickMeasureFinal;
        setMediaTime(measureFinalEndTime);
    }
    else
    {
        loopMeasureStart = clickMeasureFinal;
        loopMeasureEnd = clickMeasureInitial;
        setMediaTime(measureInitialEndTime);
    }
}

function loadCanvasList ()
{
    let canvases = $('#canvas_list');
    canvases.empty();

    let canvasCount = manifestObject.manifest.canvases.length;
    for (var i = 0; i < canvasCount; i++)
    {
        let text = manifestObject.manifest.canvases[i].label.en[0];
        canvases.append(new Option(text, i));
    } 
}

// Media and score control 
function playButtonPress () // jshint ignore:line
{
    if (isMediaPlaying())
    {
        pauseMedia();
        $('#button_play i').attr('class', "fa fa-play");

        cancelAnimationFrame(animationID);
    }
    else
    {
        playMedia();
        $('#button_play i').attr('class', "fa fa-pause");

        then = Date.now();
        trackMedia();
    }
}
function stopButtonPress () // jshint ignore:line
{
    $('#button_play i').attr('class', "fa fa-play");

    pauseMedia();
    setMediaTime(0);

    $('.measure').removeAttr('fill');

    loopMeasureStart = null;
    loopMeasureEnd = null;

    setTimelineRange(0);
    updateTimeline();

    if (page !== 0)
        goToPage(0);

    cancelAnimationFrame(animationID);
}
function backButtonPress () // jshint ignore:line
{
	let measureFound = false;
	let time = truncateNum(getMediaTime(), 3);

    let measureTimeMin = 0;
    // looping is enabled
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
        measureTimeMin = $(loopMeasureStart).attr('timeStart');

    // iterate backwards until current measure and get next one back
    $($('.measure').get().reverse()).each(function () {
        let measureTime = truncateNum($(this).attr('timeStart'), 3);

        if (measureTime <= time && measureTime >= measureTimeMin) {
        	if (measureFound) {
        		setMediaTime($(this).attr('timeStart'));
        		return false;
        	}
        	measureFound = true;
        }
    });

    updateTimeline();
    trackMedia();
}
function forwardButtonPress () // jshint ignore:line
{
    let time = truncateNum(getMediaTime(), 3);

    let measureTimeMax = $('.measure').last().attr('timeStart');
    // looping is enabled
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
        measureTimeMax = $(loopMeasureEnd).attr('timeStart');

    // iterate forward until next measure from current
    $('.measure').each(function () 
    {
    	let measureTime = truncateNum($(this).attr('timeStart'), 3);

        if (measureTime > time && measureTime <= measureTimeMax) 
        {
            setMediaTime($(this).attr('timeStart'));
            return false;
        }
    });

    updateTimeline();
    trackMedia();
}

// Timeline controls
function scrubberTimeMouseDown (e) // jshint ignore:line
{
    let scrubber = $('#scrubber');
    let x = e.pageX - scrubber.offset().left;
    let percent = x / scrubber.width();
    let newTime = getCanvasDuration() * percent;

    $('#scrubber_bar').width(percent*100 + "%");

    loopMeasureStart = null;
    loopMeasureEnd = null;

    setTimelineRange(0);
    clearMeasures();

    if (!isMediaPlaying())
    {
        // enable looping
        if (e.shiftKey)
        {
            let currentTime = getMediaTime();
            var clickMeasureInitial = null;
            var clickMeasureFinal = null;

            // find corresponding measures
            $('.measure').each(function () {
                let lower = truncateNum($(this).attr('timeStart'), 3); 
                let upper = truncateNum($(this).attr('timeStop'), 3);
                if (currentTime > lower && currentTime <= upper)
                    clickMeasureInitial = this;
                else if (newTime > lower && newTime <= upper)
                {
                    clickMeasureFinal = this;
                }
            });

            setMeasureRange(clickMeasureInitial, clickMeasureFinal);
            fillMeasureRange(loopMeasureStart, loopMeasureEnd);
            setTimelineRange($(loopMeasureStart).attr('timeStart'));
            newTime = truncateNum($(clickMeasureFinal).attr('timeStop'), 3);
        }
        else
        {
            $('.measure').each(function () {
                let lower = truncateNum($(this).attr('timeStart'), 3); 
                let upper = truncateNum($(this).attr('timeStop'), 3);
                if (newTime > lower && newTime <= upper)
                {
                    fillMeasure(this);
                }
            });
        }
    }

    setMediaTime(newTime);
    updateTimeline();
}
function updateTimeline()
{
    // update scrubber
    let currentTime = getMediaTime();
    let totalTime = getCanvasDuration();
    let offsetTime = 0;

    // looping enabled
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
        offsetTime = $(loopMeasureStart).attr('timeStart');

    let percent = (currentTime - offsetTime) / totalTime;
    $('#scrubber_bar').css('width', percent*100+'%');

    // update duration
    let current_minute = parseInt(currentTime / 60) % 60,
    current_seconds_long = currentTime % 60,
    current_seconds = current_seconds_long.toFixed(),
    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
    $('#current_time').html(current_time);
}
function updateTotalTime()
{
    let totalTime = getCanvasDuration();

    let minutes = Math.floor(totalTime / 60),
    seconds_int = totalTime - minutes * 60,
    seconds_str = seconds_int.toString(),
    seconds = seconds_str.substr(0, 2),
    time = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    $('#total_time').html(time);
}
function setTimelineRange(startTime)
{
    let totalTime = getCanvasDuration();
    let leftPercent = (startTime / totalTime) * 100;
    $('#scrubber_bar').css('position','relative');
    $('#scrubber_bar').css('left',leftPercent + "%");
}

function truncateNum(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}
