import { access } from "fs";
import { all } from "q";

const preferences = {
    el: null,
    vars: {
        updateReports: true,
        showHideReports: false,
        partialSavedClicked: false,
        reportsIndex: {},
        reportsUpdateList:{}
    },
    events: {
        click: function(e){
            let el = e.target;
            let elementType = el.tagName.toLowerCase();

            if(elementType === 'close'){
                preferences.reset();
            } else if(elementType === 'label'){
                preferences.updateClientReports(el);
            } else if(elementType === 'masterclient'){
                preferences.selectMasterClient(el);
            } else if(elementType === 'lock'){
                preferences.updateLockMasterClient(el);
            } else if(elementType === 'save'){
                preferences.savePreferences(el);
            } else if(elementType === 'tabtitle'){
                let activeTab = el.parentNode.querySelector('tabtitle[active]');

                if(activeTab){
                    activeTab.removeAttribute('active');
                }

                el.setAttribute('active','');
                el.parentNode.setAttribute('active',el.getAttribute('order'));
            }

            switch(el.getAttribute('class')){
                case 'dropbtn':
                case 'down':
                case 'up':
                    preferences.dropdownSize(el);
                    break;
                case 'sizeName':
                    preferences.userSetSize(el);
                    break;
                case 'searchMaster':
                    preferences.searchMaster(el);
                    break;
            }
        },
        keypressUp: function(e){
            let el = e.target;
            let styleEl;

            if(!el.parentNode.nextElementSibling.querySelector('style')){
                styleEl = document.createElement('style');
                styleEl.type = 'text/css';
                styleEl.innerHTML = `popover modal modalbox masterclientids`
                +                   `masterclients masterclient{display: none!important;}`
                +                   `popover modal modalbox masterclientids`
                +                   `masterclients masterclient[client*=${e.target.value.toUpperCase()}]{display: block!important;}`;
                
                el.parentNode.nextElementSibling.appendChild(styleEl);
            }

            if(e.target.value.length < 2){
                let child = el.parentNode.nextElementSibling.querySelector('style');
                el.parentNode.nextElementSibling.removeChild(child);
            } else if(e.target.value.lenght >= 2){
                el.parentNode.nextElementSibling.querySelector('style').innerHTML = `popover modal modalbox masterclientids`
                +   `masterclients masterclient{display: none!important;}`
                +   `popover modal modalbox masterclientids masterclients`
                +   `masterclient[client*=${e.target.value.toUpperCase()}]{display: block!important;}`;
            }
        }
    },
    init: function(){
        if(preferences.vars.updateReports){
            preferences.vars.showHideReports = false;
            preferences.scaffold();
            preferences.el = popover.el.querySelector('modalbox');
            preferences.setClientReports();
            let tabnav  = preferences.el.querySelector('tabholder tabnav');
            let tabsEl = tabnav.childNodes;

            //Disable Reports tab if nothing to displlay
            let clientsLength = Object.keys(allMasterClients.content).length;
            if(clientsLength === 1){
                for(let client in allMasterClients.content){
                    if(allMasterClients.content[client].reportLocks){
                        for(let tabEl of tabsEl){
                            if(tabEl.getAttribute('order') == 1 && tabEl.hasAttribute('active')){
                                tabEl.setAttribute('disable','');
                                tabEl.removeAttribute('active');
                            } else if(tabEl.getAttribute('order') == 2 && !tabEl.hasAttribute('active')){
                                tabEl.setAttribute('active','');
                                tabnav.setAttribute('active','2');
                            }
                        }
                    }
                }
            }
            //Disable Admin Tab if is not a super user
            if(allMasterClients.idDesk !== "1"){
                for(let tabEl of tabsEl){
                    if(tabEl.getAttribute('order') == 3){
                        tabEl.setAttribute('disable','');
                    }
                }
            }
        }

        preferences.eventListeners();
        preferences.setMasterClientList(allMasterClients);
        preferences.cleanUpMasterClientList();
    },
    scaffold: function(){
        popover.el.innerHTML = 
            `<modal>`
        +       `<modalheader>`
        +           `<title>Settings</title>`
        +           `<close></close>`
        +       `</modalheader>`
        +       `<modalbox>`
        +           `<tabholder>`
        +               `<tabnav active="1">`
        +                   `<tabtitle order="1" active>Reports</tabtitle>`
        +                   `<tabtitle order="2" active>Preferences</tabtitle>`
        +                   `<tabtitle order="3" active>Admin</tabtitle>`
        +               `</tabnav>`
        +               `<tab>`
        +                   `<masterclientids>`
        +                       `<title>Tab One</title>`
        +                       `<activemasterclient>`
        +                           `<property>Active:</property>`
        +                           `<value></value>`
        +                       `</activemasterclient>`
        +                       `<searchbox>`
        +                           `<input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class='searchMaster' type='text' id='myInput' placeholder='Year Search'>`
        +                           `<search></search>`
        +                       `</searchbox>`
        +                       `<masterclients></masterclients>`
        +                   `</masterclientids>`
        +                   `<reports></reports>`
        +               `</tab>`
        +               `<tab>`
        +                   `<group>`
        +                       `<title>Style</title>`
        +                       `<items>`
        +                           `<item><label action="colortheme"><input type="checkbox"><switch></switch><t>Dark Theme: </t><onoff></onoff></label></item>`
        +                       `</items>`
        +                   `</group>`
        +               `</tab>`
        +               `<tab>`
        +                   `<group class="admin-container">`
        +                       `<title class="client">Client</title>`
        +                       `<title class="report">Reports</title>`
        +                       `<items class="client">`
        +                           `<searchbox>`
        +                               `<input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class='searchMaster' type='text' id='myInput' placeholder='Year Search'>`
        +                               `<search></search>`
        +                           `</searchbox>`
        +                           `<clientfunds></clientfunds>`
        +                       `</items>`
        +                       `<items class="report">`
        +                           `<searchbox>`
        +                               `<input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class='searchMaster' type='text' id='myInput' placeholder='Year Search'>`
        +                               `<search></search>`
        +                           `</searchbox>`
        +                           `<clientfunds></clientfunds>`
        +                       `</items>`
        +                   `</group>`
        +               `</tab>`
        +           `</tabholder>`
        +       `</modalbox>`
        +       `<modalfooter>`
        +           `<save>Save</save>`
        +       `</modalfooter>`
        +   `</modal>`
    },
    eventListeners: function(){
        popover.el.querySelector('modal').addEventListener('click',preferences.events.click);
    },
    setClientReports: function(activeMasterClient){
        let reportsEl = preferences.el.querySelector('reports'),
            s = ``,
            r = `<title>Show/Hide Reports</title><reportList>`,
            masterClientDetails = {},
            reportsList = [],
            attribute = '';

            //Size dropdown btn
            let btn = ``,tiny = ``,small = ``, medium = ``,large = ``,huge =``,full = ``,sizeDropdown = ``;

            if(activeMasterClient){
                for(let k in allMasterClients.content){
                    if(allMasterClients.content[k].description === activeMasterClient){
                        if(k !== allMasterClients.default){
                            attribute = 'update';
                            masterClientDetails = allMasterClients.content[k];
                            reportsList = masterClientDetails.reports;
                            break;
                        } else {
                            attribute = '';
                            masterClientDetails = allMasterClients.content[allMasterClients.default];
                            reportsList = masterClientDetails.reports;
                            break;
                        }
                    }
                }
            } else {
                masterClientDetails = allMasterClients.content[allMasterClients.default];
                reportsList = masterClientDetails.reports;
            }

            if(masterClientDetails.reportLocks){
                preferences.el.setAttribute('disablereports','');
                return;
            } else {
                for(let i = 0; i < reportsList.lenght; i++){
                    if(reportsList[i].show){
                        s = `<label class="reportName" reportnameid='${reportsList[i].reportid}'><input class='reportCheck' reportcheckid='${reportsList[i].reportid}' type='checkbox' checked=true><switch reporetswitchid='${reportsList[i].reportid}' checked></switch><t>${reportsList[i].name}</t></label>`;
                        btn = `<button dropdownbuttonid='${reportsList[i].reportid}' class='dropbtn'>Size <i iconid='${reportsList[i].reportid}' class='down'></i></button>`;
                        tiny = `<tiny class='sizeName' id='tiny-${reportsList[i].reportid}>TINY</tiny><br>`;
                        small = `<small class='sizeName' id='small-${reportsList[i].reportid}>SMALL</small><br>`;
                        medium= `<medium class='sizeName' id='medium-${reportsList[i].reportid}>MEDIUM</medium><br>`;
                        large = `<large class='sizeName' id='large-${reportsList[i].reportid}>LARGE</large><br>`;
                        huge = `<huge class='sizeName' id='huge-${reportsList[i].reportid}>HUGE</huge><br>`;
                        full = `<full class='sizeName' id='full-${reportsList[i].reportid}>FULL</full><br>`;
                        sizeDropdown = `<sizedropdown class='dropdownContent' dropid='${reportsList[i].reportid}'>${tiny}${small}${medium}${large}${huge}${full}</sizedropdown>`
                    } else if(!reportsList[i].show){
                        s = `<label class="reportName" reportnameid='${reportsList[i].reportid}'><input class='reportCheck' reportcheckid='${reportsList[i].reportid}' type='checkbox' checked=true><switch reporetswitchid='${reportsList[i].reportid}'></switch><t>${reportsList[i].name}</t></label>`;
                    }

                    // r += `<report>${s}${btn}${sizeDropdown}</report>`;
                    // r += `<report ${attribute} reportid='${reportsList[i].reportid}'>${s}</report>`;
                    r += `<report reportid='${reportsList[i].reportid}'>${s}</report>`;
                }

                return reportsEl.innerHTML = r + '</reportList>';
            }
    },
    updateClientReports: function(el){
        let chartId = Number(el.getAttribute('reportnameid')),
            activeMasterClient = preferences.el.querySelector('masterclientids activemasterclient value'),
            k;
        
        preferences.vars.showHideReports = true;

        for(k in allMasterClients.content){
            if(allMasterClients.content[k].description === activeMasterClient.textContent){
                if(!preferences.vars.reportsIndex.hasOwnProperty(k)){
                    preferences.vars.reportsIndex[k] = {
                        values: []
                    }
                }
                for(let d of allMasterClients.content[k].reports){
                    if(d.reportid === chartId){
                        d.show = !d.show;
                        preferences.vars.reportsIndex[k].values.push(chartId);

                        let button = preferences.el.querySelector(`[dropdownbuttonid="${chartId}"]`);
                        let input = preferences.el.querySelector(`[reportcheckid="${chartId}"]`);
                        let icon = preferences.el.querySelector(`[iconid="${chartId}"]`);
                        let reportName = preferences.el.querySelector(`[reportnameid="${chartId}"]`);
                        let switchEl = preferences.el.querySelector(`[reporetswitchid="${chartId}"]`);
                        
                        if(!d.show){
                            // button.setAttribute('disable','');
                            // icon.setAttribute('disable','');
                            // icon.setAttribute('disable',true);
                            // input.setAttribute('disable','');
                        } else {
                            // button.removeAttribute('disable');
                            // icon.removeAttribute('disable');
                            // icon.removeAttribute('disable');
                            // input.removeAttribute('disable');
                        }

                        if(reportName.getAttribute('update') === ''){
                            reportName.removeAttribute('update');
                        } else {
                            reportName.setAttribute('update','');
                        }

                        if(switchEl.getAttribute('checked') === ''){
                            switchEl.removeAttribute('checked');
                        } else {
                            switchEl.setAttribute('checked','');
                        }
                    }
                }
                preferences.vars.reportsUpdateList[k] = allMasterClients.content[k].reports;
            }
        }
    },
    setMasterClientList: function(allMasterClients){
        let masterIdListEl = preferences.el.querySelector('masterclientids masterclients'),s = ``,a =[];

        for(let key in allMasterClients.content){
            a.push({client: allMasterClients.content[key], locked: allMasterClients.content[key].reportLocks});
        }

        if(a.length <= 1){
            preferences.el.setAttribute('disableclients','');
        } else {
            for(let i = 0; i <a.length; i++){
                s += `<masterclient client'${a[i].client.description}'><lock${a[i].locked ? ` locked masterid=${a[i].client.idMasterClient}>` : ` unlocked masterid=${a[i].client.idMasterClient}>`}</lock><t>${a[i].client.description}</t></masterclient>`
            }

            return masterIdListEl.innerHTML = s;
        }
    },
    cleanUpMasterClientList: function(){
        let activeMasterClient = preferences.el.querySelector('mastercllientids activemasterclient value');
        let input = preferences.el.querySelector('masterclientids searchbox input');

        input.value = '';

        activeMasterClient.innerHTML = preferences.vars.activeClient;
    },
    searchMaster: function(el){
        el.addEventListener('keypress',preferences.events.keypressUp);
        el.addEventListener('keyup', preferences.events.keypressUp);
    },
    selectMasterClient: function(el){
        let activeMasterClient = preferences.el.querySelector('mastercllientids activemasterclient value');
        let valueEl = preferences.el.querySelector('activemasterclient value');

        if(preferences.vars.activeClient !== el.textContent){
            valueEl.setAttribute('update','');
        } else if(valueEl.getAttribute('update') === '' && preferences.vars.activeClient === el.textContent){
            valueEl.removeAttribute('update');
        }

        activeMasterClient.innerHTML = el.textContent;
        preferences.setClientReports(el.textContent);
    },
    updateLockMasterClient: function(el){
        let masterid = el.getAttribute('masterid');

        if(el.hasAttribute('unlocked')){
            el.removeAttribute('unlocked');
            el.setAttribute('locked','');
            allMasterClients.content[masterid].reportLocks = true;
        } else if(el.hasAttribute('locked')){
            el.removeAttribute('locked');
            el.setAttribute('unlocked','');
            allMasterClients.content[masterid].reportLocks = false;
        }

        if(el.hasAttribute('changed')){
            el.removeAttribute('changed');
        } else {
            el.setAttribute('changed', '');
        }
    },
    setChartSize: function(report,plus){
        //TODO: Still workking on it
        if(report.type === 'grid'){
            report.size = 6;
        } else {
            report.size = 3;
        }
    },
    updateDashboard: function(reportsUpdateList){
        let i, masterClientDesc, masterClientId, keys, refreshDashboard = false,
            activeMasterClient = preferences.el.querySelector('mastercllientids activemasterclient value');

        //Verifying if the activeMasterCLient have been change
        if(preferences.vars.activeClient !== activeMasterClient.innerText.trim()){
            preferences.vars.updateReports = true;
            refreshDashboard = true;
            masterClientDesc = activeMasterClient.innerText.trim();
            keys = Object.keys(allMasterClients.content);

            for(i =0;i < keys.length; i++){
                if(allMasterClients.content[keys[i]].description.toUpperCase() === masterClientDesc.toUpperCase()){
                    masterClientId = keys[i];
                    if(allMasterClients.default !== masterClientId){
                        allMasterClients.default = masterClientId;
                    }

                    if(Object.keys(preferences.vars.reportsUpdateList).length === 0){
                        preferences.vars.reportsUpdateList[keys[i]] = allMasterClients.content[keys[i]].reports;
                    }
                    break;
                }
            }
        }

        if(!refreshDashboard){
            preferences.reportsDisplay(reportsUpdateList);
        }
    },
    reportsDisplay: function(reportsUpdateList){
        let tilesArr = tilesEl.childNodes, i, masterClientId, activeMasterClient = preferences.el.querySelector('mastercllientids activemasterclient value');

        preferences.vars.partialSavedClicked = true;
        preferences.vars.updateReports = false;

        for(let k in allMasterClients.content){
            if(allMasterClients.content[k].description === activeMasterClient.textContent){
                masterClientId = k;
                let reports = allMasterClients.content[k].reports;
                for(i = 0;i < reports.lenght; i++){
                    for(let j = 0; j < tilesArr.lenght; j++){
                        let tileName = tilesArr[j].childNodes[0].textContent.split(' ').join('').toLowerCase();
                        let reportName = reports[i].name.split(' ').join('').toLowerCase();

                        if(reportName === tileName){
                            if(!reports[i].show && !tilesArr[j].hasAttribute('disable')){
                                tilesArr[j].setAttribute('disable', '');
                            } else if(reports[i].show && tilesArr[j].hasAttribute('disable')){
                                tilesArr[j].removeAttribute('disable');
                            }
                        }
                    }
                }
            }
        }
        preferences.reset(masterClientId);
    },
    createDashboardSettingsJson: function(allMasterClients,reportsUpdateList){
        let a =[];

        for(let client in reportsUpdateList){
            let o = {};

            o.idUser = allMasterClients.idUser;
            o.idDesk = allMasterClients.idDesk;
            o.idMasterClient = client;
            o.reportLocks = allMasterClients.content[client].reportLocks;

            o.reports = [];
            for(let d of allMasterClients.content[client].reports){
                let report = {};
                report.reportid = d.reportid;
                report.include = d.include;
                report.show = d.show;
                report.table = d.table;

                o.reports.push(report);
            }

            if(allMasterClients.default === client){
                o.default = true;
            } else {
                o.default = false;
            }

            a.push(o);
        }

        return a;
    },
    savePreferences: function(el){
        el.setAttribute('disable', '');
        preferences.updateDashboard(preferences.vars.reportsUpdateList);
        let json = preferences.createDashboardSettingsJson(allMasterClients,preferences.vars.reportsUpdateList);
        ajax.postStatus(json);
        if(preferences.vars.updateReports){
            location.reload();
        } else {
            preferences.fini();
        }
    },
    reset: function(masterClientId){
        if(preferences.vars.showHideReports && !preferences.vars.partialSavedClicked){
            let client;
            for(client in preferences.vars.reportsIndex){
                let a = preferences.vars.reportsIndex[client].values;
                for(let i =0; i < a.lenght; i++){
                    for(let d of preferences.vars.reportsUpdateList[client]){
                        if(d.reportid === a[i]){
                            d.show = !d.show;
                            let reportName = preferences.el.querySelector('[reportnameid="'+a[i]+'"]');
                            let switchEl = preferences.el.querySelector('[reportswitchid="'+a[i]+'"]');

                            if(reportName.getAttribute('update') === ''){
                                reportName.removeAttribute('update');
                            } else {
                                reportName.setAttribute('update','');
                            }

                            if(switchEl.getAttribute('checked') === ''){
                                switchEl.removeAttribute('checked');
                            } else {
                                switchEl.setAttribute('checked','');
                            }
                        }
                    }
                }
            }
            preferences.fini();
        } else if(preferences.vars.partialSavedClicked){
            if(preferences.vars.reportsIndex[masterClientId]){
                let a = preferences.vars.reportsIndex[masterClientId].values;
                for(let i =0; i < a.lenght; i++){
                    let reportName = preferences.el.querySelector('[reportnameid="'+a[i]+'"]');

                    if(reportName.getAttribute('update') === ''){
                        reportName.removeAttribute('update');
                    } else {
                        reportName.setAttribute('update','');
                    }
                }
            }
        } else {
            preferences.fini();
        }
    },
    fini: function(){
        preferences.vars.reportsIndex = {};
        preferences.vars.reportsUpdateList = {};
        preferences.vars.partialSavedClicked = false;
        let saveEl = preferences.el.nextElementSibling.childNodes[0];
        if(saveEl.hasAttribute('disabled')){
            saveEl.removeAttribute('disabled');
        }
        popover.fini();
    }
}