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
    let back = $('<button>', {'type': 'button', 'id': 'button_bw'});
    let play = $('<button>', {'type': 'button', 'id': 'button_play'});
    let stop = $('<button>', {'type': 'button', 'id': 'button_stop'});
    let forward = $('<button>', {'type': 'button', 'id': 'button_fw'});
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
    let pageBack = $('<button>', {'class': 'page_back'});
    let pageNext = $('<button>', {'class': 'page_next'});
    pageBack.text('<');
    pageNext.text('>');
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

        // link score
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
            toolkit.renderData(data, {});
            for (var i = 1; i <= toolkit.getPageCount(); i++) // verovio pages are 1-indexed
            {
                let svg = toolkit.renderPage(i, {});
                $('.score').append(svg);
            }
            $('.score').children().not($('.score').children().first()).hide(); // hide other pages
            $('svg').width("100%");
            $('svg').height("100%");
        }
    });
    linkScore();
}
$('#page_next').click(function ()
{
    if (page === toolkit.getPageCount()-1)
        return;
    $('.score').children().eq(page).hide();
    page++;
    $('.score').children().eq(page).show();
});
$('#page_back').click(function ()
{
    if (page === 0)
        return;
    $('.score').children().eq(page).hide();
    page--;
    $('.score').children().eq(page).show();
});


// score and player syncing
function linkScore ()
{
    let increment = manifestObject.manifest.canvases[0].duration / $('.measure').length;
    let time = 0;
    // assign a time to every measure
    $('.measure').each(function () {
        $(this).attr('time', time);
        time += increment;
    });
    // fill red and goto time in video 
    $('.measure').click(function () {
        fillMeasure(this);
        $('video')[0].currentTime = $(this).attr('time');
        $('video')[0].play();
    });
}
// track video progress and move score highlight
var currentMeasure;
function trackVideo ()
{
    setInterval(function () 
    {
        let time = $('video')[0].currentTime;
        $('.measure').each(function () {
            if (truncateNum(time, 3) >= truncateNum($(this).attr('time'), 3) && time !== 0) {
                currentMeasure = $(this);
                fillMeasure(this);
            } else if (time === 0) {
                $('.measure').removeAttr('fill');
            }
        });
    }, 300);
}
function fillMeasure (measure) 
{
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
}


// video and score control 
$('#button_play').click(function () 
{
    if ($('video')[0].paused) {
        $('video')[0].play();
        $('#button_play').text('Pause');
    } else {
        $('video')[0].pause();
        $('#button_play').text('Play');
    }
});
$('#button_stop').click(function ()
{
    $('#button_play').text('Play');

	$('video')[0].pause();
	$('video')[0].currentTime = 0;

	$('.measure').removeAttr('fill');
});
$('#button_bw').click(function ()
{
	let measureFound = false;
	let time = truncateNum($('video')[0].currentTime, 3);

    // iterate backwards until current measure and get next one back
    $($('.measure').get().reverse()).each(function () {
        let measureTime = truncateNum($(this).attr('time'), 3);

        if (measureTime <= time) {
        	if (measureFound) {
        		$('video')[0].currentTime = $(this).attr('time');
        		return false;
        	}
        	measureFound = true;
        }
    });
});
$('#button_fw').click(function ()
{
    let time = truncateNum($('video')[0].currentTime, 3);

    // iterate forward until next measure from current
    $('.measure').each(function () {
    	let measureTime = truncateNum($(this).attr('time'), 3);

        if (measureTime > time) {
            $('video')[0].currentTime = $(this).attr('time');
            return false;
        }
    });
});

// truncate decimal places
function truncateNum(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}
