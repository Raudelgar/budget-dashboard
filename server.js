const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');

//Adding JSON Middleware
app.use(express.json());


//Listen Port
app.listen(port,()=>console.log(`Server listening on port ${port}...`));