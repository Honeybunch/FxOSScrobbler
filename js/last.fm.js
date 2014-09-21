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

function craftRequest(methodName, params)
{
  var paramsString = '';
  var sigBase = '';
  
  //add other data to the params
  params.push({'key':'method','value':methodName});
  params.push({'key':'api_key','value':apiKey});
  
  //Gotta sort params alphabetically
  params.sort(sortParams);
  
  //Craft signiture base and paramaters strings
  for(i =0; i < params.length; i++)
  {
    var param = params[i];
    var paramName = param.key;
    var paramValue = param.value;
    
    sigBase += paramName + paramValue;
    
    if(i > 0)
      paramsString += '&';
    
    paramsString += paramName +'='+ paramValue;
  }
  
  sigBase += apiSecret;
  
  //Create the signature
  var apiSig = CryptoJS.MD5(sigBase);
  
  //Add the api_sig onto the params
  paramsString += '&api_sig=' + apiSig + "&format=json";
  
  var url = 'https://ws.audioscrobbler.com/2.0/?method=' + methodName;
  
  return {'url':url, 'params':paramsString};
}

function sortParams(a,b)
{
  var aKey = a.key.toLowerCase();
  var bKey = b.key.toLowerCase(); 
  return ((aKey < bKey) ? -1 : ((aKey > bKey) ? 1 : 0));
}

function httpPost(url, params, onsuccess)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open('POST', url, true);
  xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlHttp.onreadystatechange = onsuccess;
  xmlHttp.send(params);
}