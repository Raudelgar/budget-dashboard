const resizer = {
    chartsToResize: null,
    dimensions : {
        height: null,
        width: null
    },
    events: {
        resize : function(e){
            if(resizer.timeout){
                clearTimeout(resizer.timeout);
            }

            //Only resize if there is a horizonatl change
            if(resizer.dimensions.width !== window.innerWidth){
                for(let i = 0; i < resizer.chartsToResize.length; i++){
                    resizer.chartsToResize[i].upadate();
                }
            }

            resizer.dimensions.height = window.innerHeight;
            resizer.dimensions.width = window.innerWidth;
        }
    },
    init: function(arrayOfChartReports){
        resizer.chartsToResize = arrayOfChartReports;
        resizer.dimensions.height = window.innerHeight;
        resizer.dimensions.width = window.innerWidth;
        window.addEventListener('resize',resizer.events.resize);
    },
    timeout: null
}