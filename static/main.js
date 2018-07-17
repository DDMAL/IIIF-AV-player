function createUI ()
{
    let main = $('<main>', {'class': 'main'});

    // search manifest box
    let searchBox = $('<form>');
    let input = $('<input>', {'type': 'search', 'placeholder': 'Search', 'id': 'urlBox'});
    let button = $('<button>', {'type': 'button', 'id': 'getURL'});
    button.text('Get Manifest');
    searchBox.append(input, button);
    main.append(searchBox);

    // player controls
    let playerControls = $('<div>', {'class': 'player_controls', 'style': 'text-align:center; padding-bottom: 10px'}).hide();
    let back = $('<button>', {'type': 'button', 'id': 'button_bw', 'onclick': 'backButtonPress()'});
    let play = $('<button>', {'type': 'button', 'id': 'button_play', 'onclick': 'playButtonPress()'});
    let stop = $('<button>', {'type': 'button', 'id': 'button_stop', 'onclick': 'stopButtonPress()'});
    let forward = $('<button>', {'type': 'button', 'id': 'button_fw', 'onclick': 'forwardButtonPress()'});
    back.text('<');
    play.text('Play');
    stop.text('Stop');
    forward.text('>');
    playerControls.append(back, play, stop, forward);
    main.append(playerControls);
    // player
    let player = $('<div>', {'class': 'player', 'style': 'float:left; width:50%;'});
    main.append(player);

    // score controls
    let scoreControls = $('<div>', {'class': 'score_controls', 'style': 'text-align:center;'}).hide();
    let pageBack = $('<button>', {'class': 'page_back', 'onclick': 'pagePrev()'});
    let pageNext = $('<button>', {'class': 'page_next', 'onclick': 'pageNext()'});
    pageBack.text('[');
    pageNext.text(']');
    scoreControls.append(pageBack, pageNext);
    main.append(scoreControls);
    // score
    let score = $('<div>', {'class': 'score', 'style': 'float:right; width:50%'});
    main.append(score);

    $('body').append(main);
}
createUI();


// Manifest fetching and callback actions
var manifestObject; 
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

        renderVerovio();
        trackVideo();

        $(".player_controls").show();
        $(".score_controls").show();
    });
});


// Verovio score rendering and score manipulation
var toolkit = new verovio.toolkit(); // jshint ignore:line 
var page = 0; 
async function renderVerovio () // jshint ignore:line 
{
    await $.ajax({ // jshint ignore:line
        url: "static/mei/demo.mei", 
        dataType: "text", 
        success: function (data) 
        {
            $('.score').empty(); // clear previous verovio renderings
            toolkit.loadData(data, {});
            for (var i = 1; i <= toolkit.getPageCount(); i++) // verovio pages are 1-indexed
            {
                let svg = toolkit.renderToSVG(i, {});
                $('.score').append(svg);
                $('.measure:visible').attr('class', 'measure page'+i);
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


// score and player syncing
function linkScore ()
{
    let count = 0;
    let max = manifestObject.manifest.timeStarts.length;
    // assign a start and end time to every measure
    $('.measure').each(function () 
    {
        let timeStart = parseInt(manifestObject.manifest.timeStarts[count]);
        let timeEnd = parseInt(manifestObject.manifest.timeEnds[count]);
        if (count >= max)
            timeStart = timeEnd = 0;
        $(this).attr('timeStart', timeStart);
        $(this).attr('timeStop', timeEnd);
        count++;
    });
    // fill red and goto time in video 
    $('.measure').click(function () 
    {
        fillMeasure(this);
        $('video')[0].currentTime = $(this).attr('timeStart');
        $('video')[0].play();
    });
}
// track video progress and move score highlight
function trackVideo ()
{
    $('video').on('timeupdate', function () 
    {
        let time = $('video')[0].currentTime;
        $('.measure').each(function () {
            let lower = truncateNum($(this).attr('timeStart'), 3); 
            let upper = truncateNum($(this).attr('timeStop'), 3);
            if (time >= lower && time < upper)
                fillMeasure(this);
        });
    });
}
function fillMeasure (measure) 
{
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
    goToPage($(measure).attr('class').split(' ')[1].slice(-1) - 1);
}


// video and score control 
function playButtonPress () // jshint ignore:line
{
    if ($('video')[0].paused) 
    {
        $('video')[0].play();
        $('#button_play').text('Pause');
    } 
    else 
    {
        $('video')[0].pause();
        $('#button_play').text('Play');
    }
}
function stopButtonPress () // jshint ignore:line
{
    $('#button_play').text('Play');

	$('video')[0].pause();
	$('video')[0].currentTime = 0;

	$('.measure').removeAttr('fill');
}
function backButtonPress () // jshint ignore:line
{
	let measureFound = false;
	let time = truncateNum($('video')[0].currentTime, 3);

    // iterate backwards until current measure and get next one back
    $($('.measure').get().reverse()).each(function () {
        let measureTime = truncateNum($(this).attr('timeStart'), 3);

        if (measureTime <= time) {
        	if (measureFound) {
        		$('video')[0].currentTime = $(this).attr('timeStart');
        		return false;
        	}
        	measureFound = true;
        }
    });
}
function forwardButtonPress () // jshint ignore:line
{
    let time = truncateNum($('video')[0].currentTime, 3);

    // iterate forward until next measure from current
    $('.measure').each(function () 
    {
    	let measureTime = truncateNum($(this).attr('timeStart'), 3);

        if (measureTime > time) 
        {
            $('video')[0].currentTime = $(this).attr('timeStart');
            return false;
        }
    });
}

function truncateNum(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}