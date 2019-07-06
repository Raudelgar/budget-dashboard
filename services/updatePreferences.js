const fs = require('fs');
const path = require('path');
const user1 = JSON.parse(fs.readFileSync(path.join(__dirname,'./../mockData/user1.json'),'utf8'));

//Temporary servics to update Files instead of calling a database
module.exports = {
    init: function(data){
        for(let d of data){
            switch(d.idUser){
                case 'user1':
                    module.exports.updateFile(d,user1);
                    break;
            }
        }
    },
    updateFile: function(data,user){
        if(data.default){
            user.default = data.idMasterClient;
        }

        user.content[data.idMasterClient].reportLocks = data.reportLocks;
        for(let report of user.content[data.idMasterClient].reports){
            for(let i =0;i < data.reports.length; i++){
                if(report.reportid === data.reports[i].reportid){
                    report.include = data.reports[i].include;
                    report.show = data.reports[i].show;
                    report.table = data.reports[i].table;
                }
            }
        }

        module.exports.writeFile(user);
    },
    writeFile: function(user){
        switch(user.idUser){
            case 'user1':
                fs.writeFileSync(path.join(__dirname,'./../mockData/user1.json'),JSON.stringify(user,null,'     '));
                break;
        }
    }
}
