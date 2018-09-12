// Variables for controlling the requestAnimationFrame frequency
var refreshInterval = 25;
var now, then, elapsed;

// Manifest fetching and callback actions
var manifestObject;
var activeCanvasIndex;
$('#getURL').click(function () 
{
    let url = $('#urlBox').val();

    // clear all previous canvases
    $('.canvas').remove();
    // clear all previous ranges
    $('.rangeContainer').empty();

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

        setTimelineRange(0);
        updateTimeline();

        setLoopMeasureRange(null, null);
        clearLoopbar();

        $("#timeline_controls").show();
        $("#player_controls").show();
        $("#range_controls").show();
        $("#measure_controls").show();

        then = Date.now();
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

    if (manifestObject.manifest.canvases[activeCanvasIndex].rendering && manifestObject.manifest.canvases[activeCanvasIndex].rendering.label.en[0] === "score")
        scoreFile = manifestObject.manifest.canvases[activeCanvasIndex].rendering.id;

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
            $('svg').attr("width", "100%");
            $('svg').attr("height", "100%");

            $('svg').attr("viewBox", "0 0 21000 29700");
            $('svg').attr("preserveAspectRatio", "xMinYMin meet");
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
    $('.score').children().hide();
    page = n;
    $('.score').children().eq(page).show();
}

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

    // update if canvas was previously looping
    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
        fillMeasureRange(loopMeasureStart, loopMeasureEnd);

    // fill measure if canvas was previously in progress
    let time = getMediaTime();
    findMeasure(time);

    clickSelect();
}

function clickSelect ()
{
    var clickMeasureInitial = null;
    var clickMeasureFinal = null;

    $('svg').on("mousedown", handler);

    // fill red and goto time in media 
    function handler (evt)
    {
        var container = document.getElementsByClassName("definition-scale")[page];
        let pt = container.createSVGPoint();
        let bbpt = container.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        pt = pt.matrixTransform(container.getScreenCTM().inverse());

        let measures = Array.from($(".measure.page"+(page+1)));
        let selectedMeasures = measures.filter((measure) => {
            let staves = Array.from($(measure).children(".staff"));
            let upperFound = false;
            let lowerFound = false;
            staves.forEach(staff => {
                let outerStaves = [];
                outerStaves.push($(staff).children("path").first()[0]);
                outerStaves.push($(staff).children("path").last()[0]);

                outerStaves.forEach(outerStaff => {
                    let box = outerStaff.getBBox();
                    let sctm = outerStaff.getCTM();
                    bbpt.x = box.x;
                    bbpt.y = box.y;
                    let leftPt = bbpt.matrixTransform(sctm);
                    bbpt.x = box.x + box.width;
                    let rightPt = bbpt.matrixTransform(sctm);

                    if (pt.x >= leftPt.x && pt.x <= rightPt.x)
                    {
                        if (pt.y <= leftPt.y)
                            lowerFound = true;
                        if (pt.y >= leftPt.y)
                            upperFound = true;
                    }
                });
            });
            return (upperFound && lowerFound);
        });

        // measure was clicked
        if (selectedMeasures.length === 1)
        {
            clearMeasures();
            fillMeasure(selectedMeasures[0]);

            // user selecting multiple measure for looping
            if (evt.shiftKey)
            {
                // second click in selection
                if (clickMeasureInitial !== null && !isMediaPlaying())
                {
                    clickMeasureFinal = selectedMeasures[0];

                    setMeasureRange(clickMeasureInitial, clickMeasureFinal);
                    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();

                    fillMeasureRange(loopMeasureStart, loopMeasureEnd);

                    let timeStart = $(loopMeasureStart).attr('timeStart');
                    let timeEnd = $(loopMeasureEnd).attr('timeStop');
                    setTimelineRange(timeStart);
                    setLoopbarRange(timeStart, timeEnd);
                    setMediaTime(timeStart);
                }
            }
            else // regular left-click
            {
                if (!isMediaPlaying())
                {
                    clickMeasureInitial = selectedMeasures[0];
                }

                setLoopMeasureRange(null, null);
                clearLoopbar();

                setMediaTime($(selectedMeasures[0]).attr('timeStart'));
                setTimelineRange(0);
            }

            updateTimeline();
        }
    }
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
        let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
        if (loopMeasureStart !== null && loopMeasureEnd !== null)
        {
            // loop back
            if (time >= $(loopMeasureEnd).attr('timeStop'))
            {
                time = $(loopMeasureStart).attr('timeStart');
                setMediaTime(time);
            }

            fillMeasureRange(loopMeasureStart, loopMeasureEnd);
        }
        else
        {
            clearMeasures();
        }

        findMeasure(time);
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
function getLoopMeasureRange()
{
    return([manifestObject.manifest.canvases[activeCanvasIndex].loopMeasureStart, manifestObject.manifest.canvases[activeCanvasIndex].loopMeasureEnd]);
}
function setLoopMeasureRange(startMeasure, endMeasure)
{
    manifestObject.manifest.canvases[activeCanvasIndex].loopMeasureStart = startMeasure;
    manifestObject.manifest.canvases[activeCanvasIndex].loopMeasureEnd = endMeasure;
}

// Measure highlighting functions
function findMeasure (time)
{
    if (time <= 0)
    {
        $('.measure').removeAttr('fill');
        goToPage(0);
    }
    else
    {
        // Update current measure in score
        $('.measure').each(function () {
            let lower = truncateNum($(this).attr('timeStart'), 3); 
            let upper = truncateNum($(this).attr('timeStop'), 3);

            if (time >= lower && time < upper && time !== 0)
            {
                fillMeasure(this);
            }
        });
    }
}
function fillMeasure (measure) 
{
    $(measure).attr('fill', '#DE0000');
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
            $(this).attr('fill', '#1976D2');
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
        setLoopMeasureRange(clickMeasureInitial, clickMeasureFinal);
        setMediaTime(measureFinalEndTime);
    }
    else
    {
        setLoopMeasureRange(clickMeasureFinal, clickMeasureInitial);
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

    // update if canvas was previously looping
    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
    {
        let timeStart = $(loopMeasureStart).attr('timeStart');
        let timeEnd = $(loopMeasureEnd).attr('timeStop');
        setLoopbarRange(timeStart, timeEnd);
        setTimelineRange(timeStart);
    }
    else
    {
        clearLoopbar();
        setTimelineRange(0);
    }

    updateTotalTime();
    updateTimeline();
    updateRangebar();
    updateMeasurebar();

    if (isMediaPlaying())
    {
        pauseMedia();
        $('#button_play i').attr('class', "fa fa-play");
        cancelAnimationFrame(animationID);
    }
}
function navigateToRange(rangeID) // jshint ignore:line
{
    let rangeCount = manifestObject.manifest.canvases[activeCanvasIndex].ranges.length;

    for (let i = 0; i < rangeCount; i++)
    {
        if (manifestObject.manifest.canvases[activeCanvasIndex].ranges[i].id === rangeID)
        {
            let newTime = manifestObject.manifest.canvases[activeCanvasIndex].ranges[i].startTimes[activeCanvasIndex];

            let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
            if (loopMeasureStart !== null && loopMeasureEnd !== null)
            {
                setTimelineRange(0);
                setLoopMeasureRange(null, null);
                clearLoopbar();
            }

            clearMeasures();
            findMeasure(newTime);
            setMediaTime(newTime);
            break;
        }
    }
}
function navigateToMeasure(measureID) // jshint ignore:line
{
    let measureCount = manifestObject.manifest.canvases[activeCanvasIndex].measures.length;

    for (let i = 0; i < measureCount; i++)
    {
        if (manifestObject.manifest.canvases[activeCanvasIndex].measures[i].id === measureID)
        {
            let newTime = manifestObject.manifest.canvases[activeCanvasIndex].measures[i].startTimes[activeCanvasIndex];

            let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
            if (loopMeasureStart !== null && loopMeasureEnd !== null)
            {
                setTimelineRange(0);
                setLoopMeasureRange(null, null);
                clearLoopbar();
            }

            clearMeasures();
            findMeasure(newTime);
            setMediaTime(newTime);
            break;
        }
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

    setTimelineRange(0);
    setLoopMeasureRange(null, null);
    clearLoopbar();

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
    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
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
    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
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

// Timeline controls
function scrubberTimeMouseDown (e) // jshint ignore:line
{
    let scrubber = $('#scrubber');
    let x = e.pageX - scrubber.offset().left;
    let percent = x / scrubber.width();
    let newTime = getCanvasDuration() * percent;

    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();

    clearMeasures();

    if (!isMediaPlaying() && e.shiftKey)
    {
        let currentTime = getMediaTime();
        var clickMeasureInitial = null;
        var clickMeasureFinal = null;

        // find corresponding measures
        $('.measure').each(function () {
            let lower = truncateNum($(this).attr('timeStart'), 3); 
            let upper = truncateNum($(this).attr('timeStop'), 3);
            if (currentTime >= lower && currentTime < upper)
                clickMeasureInitial = this;
            else if (newTime >= lower && newTime < upper)
            {
                clickMeasureFinal = this;
            }
        });

        setMeasureRange(clickMeasureInitial, clickMeasureFinal);
        [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
        fillMeasureRange(loopMeasureStart, loopMeasureEnd);

        let timeStart = $(loopMeasureStart).attr('timeStart');
        let timeEnd = $(loopMeasureEnd).attr('timeStop');
        setTimelineRange(timeStart);
        setLoopbarRange(timeStart, timeEnd);
        setMediaTime(timeStart);
    }
    else
    {
        // looping enabled
        if (loopMeasureStart !== null && loopMeasureEnd !== null)
        {
            setTimelineRange(0);
            setLoopMeasureRange(null, null);
            clearLoopbar();
        }

        findMeasure(newTime);
        setMediaTime(newTime);
    }

    updateTimeline();
}
function updateTimeline()
{
    // update scrubber
    let currentTime = getMediaTime();
    let totalTime = getCanvasDuration();
    let percent = 0;

    // looping enabled
    let [loopMeasureStart, loopMeasureEnd] = getLoopMeasureRange();
    if (loopMeasureStart !== null && loopMeasureEnd !== null)
    {
        let offsetTime = $(loopMeasureStart).attr('timeStart');
        percent = (currentTime - offsetTime) / totalTime;
        $('#scrubber_bar').css('width', percent*100+'%');

        let timeEnd = $(loopMeasureEnd).attr('timeStop');
        updateLoopbar(currentTime, timeEnd);
    }
    else
    {
        let percent = (currentTime) / totalTime;
        $('#scrubber_bar').css('width', percent*100+'%');
    }

    // update duration
    let current_minute = parseInt(currentTime / 60) % 60,
    current_seconds_long = currentTime % 60,
    current_seconds = current_seconds_long.toFixed(),
    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
    $('#current_time').html(current_time);

    highlightMeasurebar();
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
function setLoopbarRange(startTime, endTime)
{
    let totalTime = getCanvasDuration();
    let leftPercent = (startTime / totalTime) * 100;    
    let percent = (endTime - startTime) / totalTime;

    $('#loop_bar').css('position','relative');
    $('#loop_bar').css('left',leftPercent + "%");
    $('#loop_bar').css('width', percent*100+'%');
}
function updateLoopbar(startTime, endTime)
{
    let totalTime = getCanvasDuration();
    let percent = (endTime - startTime) / totalTime;

    $('#loop_bar').css('width', percent*100+'%');
}
function clearLoopbar()
{
    $('#loop_bar').css('width', 0+'%');
    $('#loop_bar').css('left', 0+"%");
}

function updateRangebar()
{
    let totalTime = getCanvasDuration();
    let rangeCount = manifestObject.manifest.canvases[activeCanvasIndex].ranges.length;

    let color_step = 1.0 / rangeCount;
    for (let i=0; i < rangeCount; i++)
    {
        let range = manifestObject.manifest.canvases[activeCanvasIndex].ranges[i];
        let rangeStartTime = range.startTimes[activeCanvasIndex];
        let rangeEndTime = range.endTimes[activeCanvasIndex];
        let rangePercent = (rangeEndTime - rangeStartTime) / totalTime;

        let hue = color_step * i;
        let color = generate_color(hue, 0.5, 0.75);
        $('#' + range.id).css("background-color", rgbToHex(color[0], color[1], color[2]));
        $('#' + range.id).css('width', rangePercent*100+'%');
    }
}

function updateMeasurebar()
{
    let totalTime = getCanvasDuration();
    let measureCount = manifestObject.manifest.canvases[activeCanvasIndex].measures.length;

    for (let i=0; i < measureCount; i++)
    {
        let measure = manifestObject.manifest.canvases[activeCanvasIndex].measures[i];
        let measureStartTime = measure.startTimes[activeCanvasIndex];
        let measureEndTime = measure.endTimes[activeCanvasIndex];
        let measurePercent = (measureEndTime - measureStartTime) / totalTime;

        let hue = Math.random();
        let color = generate_color(hue, 0.25, 0.8);
        measure.hue = hue;
        $('#' + measure.id).css("background-color", rgbToHex(color[0], color[1], color[2]));
        $('#' + measure.id).css('width', measurePercent*100+'%');
    }
}
function highlightMeasurebar()
{
    let currentTime = getMediaTime();
    let measureCount = manifestObject.manifest.canvases[activeCanvasIndex].measures.length;

    for (let i=0; i < measureCount; i++)
    {
        let measure = manifestObject.manifest.canvases[activeCanvasIndex].measures[i];
        let measureStartTime = measure.startTimes[activeCanvasIndex];
        let measureEndTime = measure.endTimes[activeCanvasIndex];

        if (currentTime >= measureStartTime && currentTime < measureEndTime && currentTime !== 0)
        {
            if (!measure.isActive)
            {
                measure.isActive = true;
                let color = generate_color(measure.hue, 0.3, 0.99);
                $('#' + measure.id).css("background-color", rgbToHex(color[0], color[1], color[2]));
            }
        }
        else
        {
            if (measure.isActive)
            {
                measure.isActive = false;
                let color = generate_color(measure.hue, 0.25, 0.8);
                $('#' + measure.id).css("background-color", rgbToHex(color[0], color[1], color[2]));
            }
        }
    }
}

function hideInstructions()  // jshint ignore:line
{
    let instructions = $('#instructions').hasClass("collapse show");

    if (instructions)
        $('#hide').html("Show Instructions");
    else
        $('#hide').html("Hide Instructions");
}

function truncateNum (num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}
// convert hue, saturation, value to RGB
function hsv_to_rgb (h, s, v)
{
    let h_i = parseInt(h * 6);
    let f = h * 6 - h_i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    let r, g, b;
    if (h_i === 0)
        r = v, g = t, b = p;
    if (h_i === 1)
        r = q, g = v, b = p;
    if (h_i === 2)
        r = p, g = v, b = t;
    if (h_i === 3)
        r = p, g = q, b = v;
    if (h_i === 4)
        r = t, g = p, b = v;
    if (h_i === 5)
        r = v, g = p, b = q;

    return([parseInt(r * 256), parseInt(g * 256), parseInt(b * 256)]);
}
// generate color
function generate_color (hue, saturation, value)
{
    let golden_ratio = 0.618033988749895;

    hue += golden_ratio;
    hue %= 1;
    let color = hsv_to_rgb(hue, saturation, value);

    return (color);
}
// convert RGB component to hex
function componentToHex (c)
{
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b)
{
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// attach event listeners
window.addEventListener('keyup', (e) =>
{
    if (e.keyCode === 32)
    {
        e.preventDefault();
        playButtonPress();
    }
    if (e.keyCode === 37)
    {
        e.preventDefault();
        backButtonPress();
    }
    if (e.keyCode === 39)
    {
        e.preventDefault();
        forwardButtonPress();
    }
});