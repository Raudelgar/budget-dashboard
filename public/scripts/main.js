const snapshotData = [];
const allReports = [];
const userMetaData = {};
const body = document.body;
const contentEl = body.querySelector(`body content`);
const tilesEl = contentEl.querySelector(`tiles`);
const headerEl = body.querySelector(`body header`);
const userBarEl = headerEl.querySelector(`userbar`);
const userEl = userBarEl.querySelector(`user userid`);
const clientEl = userBarEl.querySelector(`client`);


const main = {
    init: function(){
        loader.init();
        ajax.loadData();
    },
    renderComplete: function(arrayOfChartReports){
        resizer.init(arrayOfChartReports);
        header.init();
    }
};

main.init();