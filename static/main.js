// Manifest stuff
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
    });
});

// Verovio stuff
var toolkit = new verovio.toolkit();
async function renderVerovio () 
{
    await $.ajax({
        url: "static/mei/demo.mei", 
        dataType: "text", 
        success: function (data) 
        {
            $('.score').empty(); // clear previous verovio renderings
            var mei = toolkit.renderData(data, {});
            for (var i = 1; i <= toolkit.getPageCount(); i++) 
            {
                let svg = toolkit.renderPage(i, {});
                $('.score').append(svg);
            }
            $('svg').width("100%");
            $('svg').height("100%");
        }
    });
    linkScore();
};

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

// track video progress
function trackVideo ()
{
    setInterval(function () 
    {
        let time = $('video')[0].currentTime;
        $('.measure').each(function () {
            if (time > $(this).attr('time')) {
                fillMeasure(this);
            }
        });
    }, 300);
}

function fillMeasure (measure) 
{
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
}

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
	$('video')[0].currentTime += -5;
}

function buttonForwardPress()
{
	$('video')[0].currentTime += 5;
}
