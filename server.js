const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var bodyParser = require('body-parser')

let localConfig = {};
let serverConfig = {};

let radarData = {};

try {
  localConfig = require('./.localdev.config.json');
  } catch(err) {
    console.error(err);
}

const express = require('express')
const app = express();

let clientPort = localConfig.webserver_port;
// if (process.env.NODE_ENV == 'production' && serverConfig.host) {
//   clientPort = serverConfig.webserver_port;
// }
if (!clientPort) {
  throw new Error('No client port!');
}

console.log('Starting on ' + process.env.NODE_ENV );
console.log('');

var cors = require('cors');
var corsOptions = {
  origin: 'http://localhost:' + clientPort,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cors(corsOptions));
app.use(express.static('public'))

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

const sheetData = {};

// Load client secrets from a local file.
fs.readFile('credentials.json', 'utf8', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), exposeData);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  //console.log('credentials', credentials);
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function exposeData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1for2g1noawHabskVr42EaBChgB8J-8m02x4SA1zn6UA',
    range: 'Radar!A1:F',
  }, (err, res) => {

    let rows = res.data.values;
    let headers = rows.splice(0,1)[0];


 
    let DEFAULT_BAND = 'Hold';
    let bands = [...new Set(rows.map(item => item[2] ? item[2] : DEFAULT_BAND))];
    let formattedBands = [];
    var bandId = 0;
    bands.forEach ( bandName => {
      let band = {id: bandId, value: bandId, name: bandName};
      formattedBands.push(band);
      bandId++;
    });

    let DEFAULT_SLICE = 'Blockchain';
    let slices = [...new Set(rows.map(item => item[1] ? item[1] : DEFAULT_SLICE))];
    let formattedSlices = [];
    var sliceId = 0;
    slices.forEach ( sliceName => {
      let slice = {id: sliceId, value: sliceId, name: sliceName};
      formattedSlices.push(slice);
      sliceId++;
    });
  
    let formattedRows = [];
    formattedSlices.forEach ( slice => {
      let bandData = [];
      res.data.values.forEach ( data => {
        let row = null;
        if (!data[1]) {
          data[1] = DEFAULT_SLICE;
        }
        if (!data[2]) {
          data[2] = DEFAULT_BAND;
        }
        headers.forEach ( (header, k) => {
          if (slice.name == data[1]) {
            if (data[k] && header) {
              if (!row) {
                row = {};
              }
              row[header] = data[k]
            }
          }
        });
        if (row) {
          formattedBands.forEach ( band => {
            if (band.name == data[2]) {
              row.band = band;
            }
          });
          if (!row.name && row.technology) {
            row.name = row.technology;
          }
          bandData.push(row);
        }
      });

      formattedRows.push({
        name: slice.name,
        points: bandData
      })
    });



    radarData = {
      headers: headers,
      bands: formattedBands,
      slices: formattedSlices,
      radar: formattedRows, 
    }

    if (err) return console.log('The API returned an error: ' + err);
    if (typeof rows != 'undefined' && rows.length > 1) {
      console.log('Importing columns: ', headers.join(', '), '\n');
      console.log(rows.length.toString(), 'rows imported.\n');

      const sheetData = res.data.values;
    } else {
      console.log('No data found.', typeof rows);
    }
  });
}

app.get('/data', (req, res) => {
  let response = radarData;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 3))
});

var server = app.listen(clientPort, () => console.log('Radar chart service listening on port ' + clientPort + '!\n'));
