# scattered
Scattered Scattergraph Visualization

![Example chart](https://github.com//xmuskrat/scattered/blob/master/scattered.png?raw=true)

Install instructions

* Setup credentials.json
* In a console, `npm run build`
*  In a console,`npm start`
* Open a web browser on port 8080

Local Scatterchart Editor

* Coming Soon

For Google Sheets support

* Create a credentials.json using the https://github.com/xmuskrat/scattered/blob/master/credentials.json.example template.
* How to get spreadsheet id for sheets.json
** https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id
* Create a Google Sheets Api and a new project called tech radar, stating you will be accessing application data.
** https://console.developers.google.com/flows/enableapi?apiid=sheets.googleapis.com&pli=1
*** Request access to application data
*** Service account name of tech-radar and a role of project owner.   Request key type of JSON.
* Visit the Google Sheets console
** https://console.developers.google.com/apis/api/sheets.googleapis.com/overview
*** Go to the credentials tab
**** Copy your credentials id and paste it into credentials.json
**** Drill into Tech Radar Web client and get the client secret, also put that into credentials.json
* Your project id will be in the url.  It will be tech-radar- followed by a series of numbers.  Put that into your credentials.json.
