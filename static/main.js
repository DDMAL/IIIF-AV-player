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
var pageTurned = false;
function trackVideo ()
{
    setInterval(function () 
    {
        let time = $('video')[0].currentTime;
        $('.measure').each(function () {
            if (time >= $(this).attr('time') && time != 0) {
                currentMeasure = $(this);
                fillMeasure(this);
            }
        });
        // check if first measure
        let firstMeasure = currentMeasure.parent().parent().find('.measure').first();
        if (currentMeasure.is(firstMeasure) && !pageTurned)
        {
            nextPage();
            pageTurned = true;
            setTimeout(function() {
                pageTurned = false;
            }, 3000);
        }
    }, 300);
}
function fillMeasure (measure) 
{
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
}


// video and score control 
function buttonPlayPress()
{
	if ($('video')[0].paused) {
		$('video')[0].play();
		d3.select("#button_play i").attr('class', "fa fa-pause");    
	} else {
		$('video')[0].pause();
		d3.select("#button_play i").attr('class', "fa fa-play");
	}
}
function buttonStopPress()
{
	d3.select("#button_play i").attr('class', "fa fa-play");

	$('video')[0].pause();
	$('video')[0].currentTime = 0;

	$('.measure').removeAttr('fill');
}
function buttonBackPress()
{
	let measureFound = false;
	let time = $('video')[0].currentTime;
    $($('.measure').get().reverse()).each(function () {
        if ($(this).attr('time') < time) {
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
    let time = $('video')[0].currentTime;
    $('.measure').each(function () {
        if ($(this).attr('time') > time) {
            $('video')[0].currentTime = $(this).attr('time');
            return false;
        }
    });
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

