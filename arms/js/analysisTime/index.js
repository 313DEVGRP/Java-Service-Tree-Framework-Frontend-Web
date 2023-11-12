$(function(){
    /* Sparklines can also take their values from the first argument
     passed to the sparkline() function */
    function randomValue(){
        return Math.floor( Math.random() * 40 );
    }
    var values = [[],[],[],[],[],[],[],[],[],[]],
        options = {
            width: '150px',
            height: '30px',
            lineColor: $white,
            lineWidth: '2',
            spotRadius: '2',
            highlightLineColor: $gray,
            highlightSpotColor: $gray,
            spotColor: false,
            minSpotColor: false,
            maxSpotColor: false
        };
    for (var i = 0; i < values.length; i++){
        values[i] = [10 + randomValue(), 15 + randomValue(), 20 + randomValue(), 15 + randomValue(), 25 + randomValue(),
            25 + randomValue(), 30 + randomValue(), 30 + randomValue(), 40 + randomValue()];

        console.log("value : " + values[i]);
    }

    function drawSparkLines(){
        options.lineColor = $green;
        options.fillColor = 'rgba(86, 188, 118, 0.1)';
        $('#direct_trend').sparkline(values[0], options );
        options.lineColor = $orange;
        options.fillColor = 'rgba(234, 200, 94, 0.1)';
        $('#refer_trend').sparkline(values[1], options );
        options.lineColor = $blue;
        options.fillColor = 'rgba(106, 141, 167, 0.1)';
        $('#social_trend').sparkline(values[2], options );
        options.lineColor = $red;
        options.fillColor = 'rgba(229, 96, 59, 0.1)';
        $('#search_trend').sparkline(values[3], options );
        options.lineColor = $white;
        options.fillColor = 'rgba(255, 255, 255, 0.1)';
        $('#internal_trend').sparkline(values[4], options );
    }
    var sparkResize;

    $(window).resize(function(e) {
        clearTimeout(sparkResize);
        sparkResize = setTimeout(drawSparkLines, 200);
    });

    drawSparkLines();
});

