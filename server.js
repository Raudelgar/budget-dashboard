const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');

//Mock Data
const data17 = require('./mockData/data-2017.json');

//Services
const updatePreferences = require('./services/updatePreferences');

//Adding JSON Middleware
app.use(express.json());

//Allowing CORS
app.all('*',function(req,send,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET','POST','OPTIONS','PUT','PATCH','DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type');

    if('OPTIONS' == req.method){
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/dashboard/health',(req,res)=>{
    res.send('Hello World!!');
});

app.get('dashboard/data-list=user1',(req,res)=>{
    let user1 = JSON.parse(fs.readFileSync(path.join(__dirname,'./mockData/user1.json')).toString());
    res.send(user1); 
});

app.get('dashboard/data-reports=2017',(req,res)=>{
    res.send(data17);
});

app.post('dashboard/data-update', (req,send)=>{
    updatePreferences.init(req.body);
    res.send(res.statusCode);
});

//Listen Port
app.listen(port,()=>console.log(`Server listening on port ${port}...`));