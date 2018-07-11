// Manifest stuff
var manifestObject; 
$('#getURL').click(function () {
    let url = $('#urlBox').val();
    manifestObject = new ManifestObject(url); 
    manifestObject.fetchManifest(function () {
        // callback once manifest is fetched, link score
        let increment = manifestObject.manifest.canvases[0].duration / $('.measure').length;
        let time = 0;
        // assign a time to every measure
        $('.measure').each(function () {
            $(this).attr('time', time);
            time += increment;
        });
        // fill red and goto time in video 
        $('.measure').click(function () {
            $(this).attr('fill', '#d00');
            $('.measure').not(this).removeAttr('fill');
            $('video')[0].currentTime = $(this).attr('time');
            $('video')[0].play();
        });
    });
});

// Verovio stuff
var toolkit = new verovio.toolkit();
$.ajax({
    url: "static/mei/demo.mei", 
    dataType: "text", 
    success: function(data) {
        var svg = toolkit.renderData(data, {});
        $(".score").html(svg);
        $('svg').width("100%");
        $('svg').height("100%");
    }
});