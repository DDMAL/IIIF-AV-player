// Manifest fetching and callback actions
var manifestObject; 
$('#getURL').click(function () 
{
    let url = $('#urlBox').val();
    manifestObject = new ManifestObject(url); 
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

        $("#player_controls").show();
        $("#score_controls").show();
    });
});


// Verovio score rendering and score manipulation
var toolkit = new verovio.toolkit();
var page = 0; 
var pageMeasures = [];
async function renderVerovio () 
{
    await $.ajax({
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
                pageMeasures.push($(svg).find('.measure'));
            }
            $('.score').children().not($('.score').children().first()).hide(); // hide other pages
            $('svg').width("100%");
            $('svg').height("100%");
        }
    });
    linkScore();
};
function nextPage ()
{
    if (page === toolkit.getPageCount()-1)
        return;
    $('.score').children().eq(page).hide();
    page++;
    $('.score').children().eq(page).show();
}
function prevPage ()
{
    if (page === 0)
        return;
    $('.score').children().eq(page).hide();
    page--;
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
};
// track video progress and move score highlight
var currentMeasure;
function trackVideo ()
{
    setInterval(function () 
    {
        let time = $('video')[0].currentTime;
        $('.measure').each(function () {
            if (truncateNum(time, 3) >= truncateNum($(this).attr('time'), 3) && time != 0) {
                currentMeasure = $(this);
                fillMeasure(this);
            } else if (time == 0) {
                $('.measure').removeAttr('fill');
            }
        });
    }, 300);
}
function fillMeasure (measure) 
{
    // following for block causes performance issues
    for (var i = 0; i < toolkit.getPageCount(); i++) 
    {
        let ids = $.map(pageMeasures[i], measure => measure.id);
        if (ids.indexOf(measure.id) !== -1) 
        {
            goToPage(i);
            break;
        }
    }
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
}


// video and score control 
function buttonPlayPress()
{
	if ($('video')[0].paused) {
		$('video')[0].play();
        $('#button_play i').attr('class', "fa fa-pause");
	} else {
		$('video')[0].pause();
        $('#button_play i').attr('class', "fa fa-play");
	}
}
function buttonStopPress()
{
    $('#button_play i').attr('class', "fa fa-play");

	$('video')[0].pause();
	$('video')[0].currentTime = 0;

	$('.measure').removeAttr('fill');
}
function buttonBackPress()
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
}
function buttonForwardPress()
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
}

// truncate decimal places
function truncateNum(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}

// toggle jumbotron visibility
$('#hide').click(function () 
{
    let j = $('.jumbotron');
    if (j.hasClass('d-none')) {
        j.removeClass('d-none');
        $('#hide').html("Hide");
    } else {
        j.addClass('d-none');
        $('#hide').html("Show");
    }
});
