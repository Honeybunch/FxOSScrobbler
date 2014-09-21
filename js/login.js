// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  window.onload = start;

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
    
    var params = [{'key':'user', 'value':name},
                  {'key':'limit', 'value':5}];
    
    var request = craftRequest('library.getArtists', params);
    var topArtists = document.querySelector('#topArtists');
    
    //Gather all the user stats
    httpPost(request.url, request.params, function()
      {
        if(this.readyState == 4)
        {
          var artists = JSON.parse(this.responseText);
          
          var artistsArray = artists['artists']['artist'];
          
          for(i=0; i<artistsArray.length; i++)
           {
             console.log(artistsArray[i]);
             
             var artist = artistsArray[i];              
             
             var images = artist['image'];
             var image = images[2];
      
             var artistHTML = '<div id="topArtist'+(i+1)+'" class="topArtist">';
             artistHTML += '<image src="'+image['#text']+'"/>';
             artistHTML += '<p>'+artist['name']+'</p>';
             artistHTML += '<p>Play Count:'+artist['playcount']+'</p>'
             artistHTML += '<p>Tag Count: '+artist['tagcount']+'</p>'
             artistHTML += '</div>';
             
             topArtists.innerHTML += artistHTML;
           }
        }
      }
    );
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
    
    //Create an array of parameters to craft the request with
    var params = [{'key':'password', 'value':password},
                  {'key':'username','value':username}];
    
    var request = craftRequest('auth.getMobileSession', params);
    
    httpPost(request.url, request.params, onResponse);
    
  }

  function onResponse()
  {
    if(this.readyState == 4)
    {
      var response = JSON.parse(this.responseText)

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
      
      //And change the block
      setupNowPlaying();
    }
  }
  
  
});
