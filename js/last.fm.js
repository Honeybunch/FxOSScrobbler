var apiKey = "10379ce465238e42fbc1a7aef57b49cd";
var apiSecret = "4db90ca38c72a8b2e855ba19f1328f0d";

var name;
var sessionKey;

function saveSession(session, onsuccess)
{
  name = session['name'];
  sessionKey = session['key'];
  
  var sessionToSave = new Blob([JSON.stringify(session)], {type:'text/plain'});
  var sdcard = navigator.getDeviceStorage('sdcard');
  
  //If we have a previous session, delete it so we can overwrite it
  sdcard.delete('session.json');
  
  //Write out our session
  var request = sdcard.addNamed(sessionToSave, 'session.json');
  request.onsuccess=function(){
    console.log('Wrote out: ' + this.result);
    
    onsuccess;
  }
  
  //If we fail to write out, toast to the user
  request.onerror=function(){console.log("Error writing settings, did you give permission?");console.log(this.error);}  
}

function loadSession(onsuccess, onerror)
{
  //Try to get the session 
  var sdcard = navigator.getDeviceStorage('sdcard');
  var request = sdcard.get('session.json');
  
  //If the session file is loaded, read it 
  request.onsuccess = function()
  {
    var file = this.result;
    
    var reader = new FileReader();
    reader.onload = function(e)
    {
      var result = reader.result;
      
      var session = JSON.parse(reader.result);
         
      name = session['name'];
      sessionKey = session['key'];
      
      //We've loaded everything, continue as normal
      onsuccess();
    }
    
    reader.readAsText(file);
  }
  
  //Otherwise lets handle the error
  request.onerror = onerror;
}

function craftRequest(functionName, params)
{
  var sigBase = 'api_key'+apiKey+functionName
  
  
  var apiSig = CryptoJS.MD5('api_key'+apiKey+func+'password'+password+'username'+username+apiSecret);
  console.log(apiSig.toString());
  
  var url = 'https://ws.audioscrobbler.com/2.0/?method=auth.getMobileSession';
  var params = 'password='+password+
               '&username='+username+
               '&api_key='+apiKey+
               '&api_sig='+apiSig+
               '&format=json';
  
  var response = JSON.parse(httpPost(url, params));
  
  var session = response['session'];
  console.log(session);
  
  //If there is no session, we had a bad login
  if(!session)
  {
    var error = response['error'];
    var message = response['message'];
    
    console.log(error + ': ' + message);
    alert('Error logging in: ' + message);
    return;
  }
}

function httpPost(url, params)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open('POST', url, false);
  xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlHttp.send(params);
  return xmlHttp.responseText;
}