const snapshotData = [];
const allReports = [];
const allMasterClients = {};
const body = document.body;
const contentEl = body.querySelector(`body content`);
const tilesEl = contentEl.querySelector(`tiles`);
const headerEl = body.querySelector(`body header`);
const userBarEl = body.querySelector(`body header userbar`);
const userEl = body.querySelector(`body header userbar user userid`);
const clientEl = body.querySelector(`body header userbar client`);

const main = {
  init: function() {
    loader.init();
    ajax.loadData();
  },
  renderComplete: function(arrayOfChartReports) {
    resizer.init(arrayOfChartReports);
    header.init();
  }
};

main.init();
