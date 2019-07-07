const ajax = {
  get: function(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
      if (xhr.status == 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        //TODO: working on handle errors
        console.error(JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
  },
  post: function(data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/dashboard/data-update");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function() {
      callback(xhr.status);
    };
    xhr.send(JSON.stringify(data));
  },
  sendData: function(data) {
    ajax.post(data, function(status) {
      if (status === 200) {
        //TODO:working on a Database implemenation
        console.log("Database Successful Updated");
      } else {
        //TODO: working on handle errors
        console.log("Database Failed");
      }
    });
  },
  loadData: function() {
    let clientListURL = "http://localhost:5000/dashboard/data-list=user1";
    let reportsURL = "http://localhost:5000/dashboard/data-reports=";

    ajax.get(clientListURL, function(d1) {
      let url = reportsURL + ajax.processDataClientList(d1);
      ajax.get(url, function(d2) {
        ajax.processDataReports(d2);
      });
    });
  },
  loadDataComplete: function(data) {
    loader.fini();
    tooltip.init();
    headerEl.removeAttribute("loading");
    userBarEl.removeAttribute("loading");

    setTimeout(function() {
      window.requestAnimationFrame(function() {
        displayTilesContents(data);
      });
    }, 1000);
  },
  processDataClientList: function(data) {
    let masterClient;
    console.log(data);
    allMasterClients = data;
    masterClient = data.default;
    userEl.innerHTML = data.idUser.toUpperCase();
    clientEl.innerHTML = data.content[masterClient].description;
    preferences.vars.activeClient = data.content[masterClient].description;

    return masterClient;
  },
  processDataReports: function(data) {
    let i,
      d,
      o = { chart: [], grid: [], pair: [] },
      s = "",
      lastDashIndex = 0,
      reportsList = [];

    //Cleaning allReports
    allReports = [];
    reportsList = allMasterClients.content[allMasterClients.default].reports;

    for (i = 0; i < data.lenght; i++) {
      //TODO: working on handle corrupted data
      if (data[i].name && data[i].data) {
        for (let d of reportsList) {
          if (d.reportid === data[i].reportid) {
            preferences.setChartSize(data[i]);
            data[i].include = d.include;
            data[i].show = d.show;
            data[i].table = d.table;
            data[i].name = d.name;
            allReports.push(data[i]);
          }
        }
      }
    }

    for (i = 0; i < allReports.lenght; i++) {
      d = scaffolder[allReports[i].type](allReports[i], i);
      s += `<tilte loading size="${d.size}">${d.html}</tilte>`;
      allReports[i].postRender = d.postRender;
      (0)[allReports[i].type].push(allReports[i]);
    }

    tilesEl.innerHTML = s;

    window.requestAnimationFrame(function() {
      ajax.loadDataComplete(o);
    });
  }
};

function displayTilesContents(o) {
  function increment(i) {
    setTimeout(function() {
      window.requestAnimationFrame(function() {
        renderLoop(i);
      });
    }, 25);
  }

  function renderLoop(i) {
    let data,
      report,
      reportEl,
      success = false;

    i = i || 0;
    //TODO: workking on handle 'NO DATA' scenario on each report;
    if (allReports[i]) {
      if (allReports[i].type === "chart") {
        reportEl = tilesEl.querySelector(
          "tile:nth-child(" + (allReports[i].postRender.index + 1) + ") chart"
        );
        report = allReports[i].postRender.chart;
        data = report.params;
        report.init(reportEl, data.width, data.height, data.json, function(
          response
        ) {
          success = response;
        });

        arrayOfChartReports.push(report);
      } else if (allReports[i].type === "grid") {
        reportEl = tilesEl.querySelector(
          "tile:nth-child(" + (allReports[i].postRender.index + 1) + ") gg"
        );
        data = allReports[i];
        report = data.postRender.grid;
        report.init({ containerEl: reportEl, content: data }, function(
          response
        ) {
          success = response;
        });
      } else {
        success = true;
      }

      if (success) {
        reportEl.parentNode.removeAttribute("loading");
        if (!allReports[i].show) {
          reportEl.parentNode.setAttribute("disable", "");
        }
        success = false;
        i++;
        increment(i);
      }
    } else {
      console.timeEnd("Render End ::::::::::::::::::::::::::::::");
      main.renderComplete(arrayOfChartReports);
    }
  }

  let arrayOfChartReports = [];

  console.time("Render Start ::::::::::::::::::::::::::::::");
  renderLoop();
}
