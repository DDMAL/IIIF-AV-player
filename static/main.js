// Manifest fetching and callback actions
var manifestObject;
var activeCanvasIndex;
$('#getURL').click(function () 
{
    let url = $('#urlBox').val();

    manifestObject = new ManifestObject(url); // jshint ignore:line
    manifestObject.fetchManifest(function ()
    {
        // callback once manifest is fetched
        // set title
        let title = manifestObject.manifest.item_title;
        if (typeof title !== 'string')  
            title = title.en[0];
        $('#title').html(title);

        activeCanvasIndex = 0;

        renderVerovio();

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

    if (manifestObject.manifest.rendering)
    {
        scoreFile = manifestObject.manifest.rendering.id;
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
                $('.score').children().last().find('.measure').attr('class', 'measure page'+i);
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
}


// Score and player syncing
var loopMeasureStart = null;
var loopMeasureEnd = null;
function linkScore ()
{
    let count = 0;
    let max = manifestObject.manifest.timeStarts.length;
    // assign a start and end time to every measure
    $('.measure').each(function () 
    {
        let timeStart = parseFloat(manifestObject.manifest.timeStarts[count]);
        let timeEnd = parseFloat(manifestObject.manifest.timeEnds[count]);
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

                let measureInitialTime = truncateNum($(clickMeasureInitial).attr('timeStart'), 3);
                let measureFinalTime = truncateNum($(clickMeasureFinal).attr('timeStart'), 3);

                // find if second click is before or after initial click in the score 
                if (measureInitialTime <= measureFinalTime)
                {

                    loopMeasureStart = clickMeasureInitial;
                    loopMeasureEnd = clickMeasureFinal;
                    setMediaTime(measureInitialTime);
                }
                else
                {
                    loopMeasureStart = clickMeasureFinal;
                    loopMeasureEnd = clickMeasureInitial;
                    setMediaTime(measureFinalTime);
                }

                fillMeasureRange(loopMeasureStart, loopMeasureEnd);
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
        }
    });
}

// Media functions
var animationID;
function trackMedia ()
{
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

    trackMedia();
}

function truncateNum(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}
