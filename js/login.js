// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  navigator.mozL10n.ready();
  
  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---
  //Enum for determining what's being viewed on this page
  var PageState = {
    LOGIN:0,
    SETTINGS: 1,
    NOW_PLAYING: 2,
    STATS: 3,
    PROFILE: 4
  }
  
  var currentState = PageState.LOGIN;
  
  var loginBlock;
  var settingsBlock
  var nowPlayingBlock;
  var statsBlock;
  var profileBlock;
  var footer;
  
  var settingsButton;
  var nowPlayingButton;
  var statsButton;
  var profileButton;
  
  var loginButton;
  var usernameField;
  var passwordField;
  
  function start() 
  {
    loginBlock = document.querySelector('#loginBlock');
    settingsBlock = document.querySelector('#settingsBlock');
    nowPlayingBlock = document.querySelector('#nowPlayingBlock');
    statsBlock = document.querySelector('#statsBlock');
    profileBlock = document.querySelector('#profileBlock');
    footer = document.querySelector('footer');

    settingsButton = document.querySelector('#settingsButton');
    nowPlayingButton = document.querySelector('#nowPlayingButton');
    statsButton = document.querySelector('#statsButton');
    profileButton = document.querySelector('#profileButton');
    
    settingsButton.onclick = function(e){settingsClick(e)};
    nowPlayingButton.onclick = function(e){nowPlayingClick(e)};
    statsButton.onclick = function(e){statsClick(e)};
    profileButton.onclick = function(e){profileClick(e)};
    
    loadSession(setupNowPlaying, setupLogin);
  }
  
  function hideOthers(visible)
  {
    switch(visible)
    {
      case PageState.LOGIN:
        loginBlock.style.display='inline';
        
        settingsBlock.style.display='none';
        nowPlayingBlock.style.display='none';
        statsBlock.style.display='none';
        profileBlock.style.display='none';
        footer.style.display='none';
        break;
      case PageState.SETTINGS:
        settingsBlock.style.display='inline';
        footer.style.display='inline';
        
        loginBlock.style.display='none';
        nowPlayingBlock.style.display='none';
        statsBlock.style.display='none';
        profileBlock.style.display='none';
        break;
      case PageState.NOW_PLAYING:
        nowPlayingBlock.style.display='inline';
        footer.style.display='inline';
        
        loginBlock.style.display='none';
        settingsBlock.style.display='none';
        statsBlock.style.display='none';
        profileBlock.style.display='none';
        break;
      case PageState.STATS:
        statsBlock.style.display='inline';
        footer.style.display='inline';
        
        loginBlock.style.display='none';
        settingsBlock.style.display='none';
        nowPlayingBlock.style.display='none';
        profileBlock.style.display='none';
        break;
      case PageState.PROFILE:
        profileBlock.style.display='inline';
        footer.style.display='inline';
        
        loginBlock.style.display='none';
        settingsBlock.style.display='none';
        nowPlayingBlock.style.display='none';
        statsBlock.style.display='none';
        break;
    }
  }
  
  /*
   Setup Functions
  */
  
  function setupLogin()
  {
    hideOthers(PageState.LOGIN);
    
    loginButton = document.querySelector('#loginButton');
    usernameField = document.querySelector('#usernameField');
    passwordField = document.querySelector('#passwordField');
    
    loginButton.onclick = function(e){loginClick(e)};
  }
  
  function setupSettings()
  {
    hideOthers(PageState.SETTINGS);
  }
  
  function setupNowPlaying()
  {
    hideOthers(PageState.NOW_PLAYING);
  }
  
  function setupStats()
  {
    hideOthers(PageState.STATS);
    
    
  }
  
  function setupProfile()
  {
    hideOthers(PageState.PROFILE);
  }
  
  /*
   Button Event
  */
  
  function settingsClick(e)
  {
    setupSettings();
  }
  
  function nowPlayingClick(e)
  {
    setupNowPlaying();
  }
  
  function statsClick(e)
  {
    setupStats();
  }
  
  function profileClick(e)
  {
    setupProfile();
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
   
    //If we have the session, save it out
    saveSession(session, setupNowPlaying);
    
  }

  
  
});
