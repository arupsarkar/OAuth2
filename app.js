var express = require('express');
var app = express();
var jsforce = require('jsforce');
var db = require('./db');
global.__root   = __dirname + '/'; 

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

//
// OAuth2 client information can be shared with multiple connections.
//
var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : 'https://login.salesforce.com',
  clientId : '3MVG9vrJTfRxlfl6.9Upr1O8slMibVd3G1F5RlhmnogXRkjm1MqMJhatonREOl_nqyDiaPk3iuJdXuhAC.f89',
  clientSecret : '2744620778573943675',
  redirectUri : 'http://oauth-sfdc.herokuapp.com/oauth2/callback'
});
//
// Get authorization url and redirect to it.
//
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});

//
// Pass received authorization code and get access token
//
app.get('/oauth2/callback', function(req, res) {
  var conn = new jsforce.Connection({ oauth2 : oauth2 });
  var code = req.param('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
      // Now you can get the access token, refresh token, and instance URL information.
      // Save them to establish connection next time.
      console.log(conn.accessToken);
      console.log(conn.refreshToken);
      console.log(conn.instanceUrl);
      console.log("User ID: " + userInfo.id);
      console.log("Org ID: " + userInfo.organizationId);
      // ...
      res.send('success'); // or your desired response
  });
});


app.get('/oauth2/logout', function(req, res){
  console.log('>>>>> Session id : ', req.query.accessToken);
  console.log('>>>>> instance url : ', req.query.instanceUrl);  

  var conn = new jsforce.Connection({
    sessionId : req.query.accessToken,
    serverUrl : req.query.instanceUrl
  });
  conn.logout(function(err) {
    if (err) { return console.error(err); }
    // now the session has been expired.
  });
})


var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

module.exports = app;