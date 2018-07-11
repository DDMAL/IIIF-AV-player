// Manifest stuff
var manifestObject; 
$('#getURL').click(function () {
    let url = $('#urlBox').val();
    manifestObject = new ManifestObject(url); 
    manifestObject.fetchManifest(function () {
        // callback once manifest is fetched
        // set title
        let title = manifestObject.manifest.item_title;
        if (typeof title !== 'string')  
            title = title.en[0];
        $('#title').html(title);

        // link score
        renderVerovio();
        trackVideo();
    });
});

// Verovio stuff
var toolkit = new verovio.toolkit();
async function renderVerovio () {
    await $.ajax({
        url: "static/mei/demo.mei", 
        dataType: "text", 
        success: function(data) {
            var svg = toolkit.renderData(data, {});
            $("#score").html(svg);
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
$('#hide').click(function() {
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
    }, 1000);
}

function fillMeasure (measure) 
{
    $(measure).attr('fill', '#d00');
    $('.measure').not(measure).removeAttr('fill');
}








