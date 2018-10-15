
console.log('Starting on ' + process.env.NODE_ENV );
console.log('');


let radarData = require('./chart.json');

var cors = require('cors');
let clientPort = 8080;

var corsOptions = {
  origin: 'http://localhost:' + clientPort,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const express = require('express')
const app = express();
const bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cors(corsOptions));
app.use(express.static('public'));

app.get('/data', (req, res) => {
    let response = radarData;
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response, null, 3))
});

var server = app.listen(clientPort, () => console.log('Radar chart service listening on port ' + clientPort + '!\n'));
