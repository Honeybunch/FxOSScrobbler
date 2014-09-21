// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---
  var loginButton;
  var usernameField;
  var passwordField;
  
  var apiKey = "10379ce465238e42fbc1a7aef57b49cd";
  var apiSecret = "4db90ca38c72a8b2e855ba19f1328f0d";
  
  var name;
  var sessionKey;
  
  function start() 
  {
    //Read in a previous session if it exists
    var previousSession = hasPreviousSession();
    
    //If it has one, jump to the next activity
    if(previousSession)
    {
      
    }
    //If it doesn't, we'll setup the login screen
    else
    {
      setupLogin();
    }
  }
  
  function hasPreviousSession()
  {
    var sdcard = navigator.getDeviceStorage('sdcard');
    var request = sdcard.get('session.json');
    
    //If we open the file, load settings
    request.onsuccess = function()
    {
      var file = this.result;
      
      var reader = new FileReader();
      reader.onload = function(e)
      {
        var result = reader.result;
        
        var session = JSON.parse(reader.result);
      
        //Read in the session to variables we can pass to the next WebActivity
        name = session['name'];
        sessionKey = session['key'];
        
        console.log(session);
      }
      
      reader.readAsText(file);
      
      return true;
    }
    
    //Otherwise we'll have to log in
    request.onerror = function()
    {
      return false;
    }
  }
  
  function setupLogin()
  {
    loginButton = document.querySelector('#loginButton');
    usernameField = document.querySelector('#usernameField');
    passwordField = document.querySelector('#passwordField');
    
    loginButton.onclick = function(e){loginClick(e)};
  }
  
  function loginClick(e)
  {
    var username = usernameField.value;
    var password = passwordField.value;
    
    var apiSig = CryptoJS.MD5('api_key'+apiKey+'methodauth.getMobileSession'+'password'+password+'username'+username+apiSecret);
    console.log(apiSig.toString());
   
    var url = 'https://ws.audioscrobbler.com/2.0/?method=auth.getMobileSession';
    var params = 'password='+password+
                 '&username='+username+
                 '&api_key='+apiKey+
                 '&api_sig='+apiSig+
                 '&format=json';
    
    var response = JSON.parse(httpPost(url, params));
    
    var session = response['session'];
    
    //If there is no session, we had a bad login
    if(!session)
    {
      var error = response['error'];
      var message = response['message'];
      
      console.log(error + ': ' + message);
      alert('Error logging in: ' + message);
      return;
    }
   
    //If we have the session, save it out
    saveSession(session);
1  }
  
  function saveSession(session)
  {
    name = session['name'];
    sessionKey = session['key'];
    
    var sessionToSave = new Blob([JSON.stringify(session)], {type:'text/plain'});
    var sdcard = navigator.getDeviceStorage('sdcard');
    
    //If we have a previous session, delete it so we can overwrite it
    sdcard.delete('session.json');
    
    //Write out our session
    var request = sdcard.addNamed(sessionToSave, 'session.json');
    request.onsuccess=function(){console.log('Wrote out: ' + this.result);}
    
    //If we fail to write out, toast to the user
    request.onerror=function(){console.log("Error writing settings, did you give permission?");console.log(this.error);}  
  }

});
