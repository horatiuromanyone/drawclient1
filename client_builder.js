// serve index.html
const express = require('express');
const app = express();
const port = (process.env.PORT || 8080);;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    }
);
app.get('/script.js', function(req, res) {
    res.sendFile(__dirname + '/script.js');
    }
);
