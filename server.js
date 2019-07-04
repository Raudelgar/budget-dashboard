const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');

//Mock Data
const data17 = require('./mockData/data-2017.json');


app.get('/dashboard/health',(req,res)=>{
    res.send('Hello World!!');
});

//Adding JSON Middleware
app.use(express.json());



//Listen Port
app.listen(port,()=>console.log(`Server listening on port ${port}...`));