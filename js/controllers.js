'use strict';

$(function() {
  var sdcard = navigator.getDeviceStorage('sdcard');
  var request = sdcard.get('settings.json');
  window.sdcard = {};
  
  //If the session file is loaded, read it
  request.onsuccess = function()
  {
    var file = this.result;
    var reader = new FileReader();
    
    //If we load successfully, save the settings into the cache object
    reader.onload = function(e)
    {
      var result = reader.result;
      window.sdcard = JSON.parse(reader.result);
    }
    reader.readAsText(file);
  }
  
  //Otherwise log that there was an issue
  request.onerror = function()
  {
    console.log('Error reading settings!')
  };
});

var scrobblerApp = angular.module('scrobblerApp', ['ui.router']).config(['$stateProvider', '$urlRouterProvider', '$compileProvider',
    function($stateProvider, $urlRouterProvider, $compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
        
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('index', {
          url: '/',
          templateUrl: 'login.html',
          controller: 'AppCtrl'
        }).state('nowplaying', {
          url: '/nowplaying',
          templateUrl: 'nowplaying.html',
          controller: 'NowPlayingCtrl'
        }).state('profile', {
          url: '/profile',
          templateUrl: 'profile.html',
          controller: 'ProfileCtrl'
        }).state('artists', {
          url: '/artists',
          templateUrl: 'artists.html',
          controller: 'ArtistsCtrl'
        }).state('tracks', {
          url: '/tracks',
          templateUrl: 'tracks.html',
          controller: 'TracksCtrl'
        }).state('settings', {
          url: '/settings',
          templateUrl: 'settings.html',
          controller: 'SettingsCtrl'
        });
    }
]);


scrobblerApp.factory('apiFactory', ['$http', function ($http) {
  var dataFactory = {};
  var urlBase = 'https://ws.audioscrobbler.com/2.0/?method=';
  var apiKey = "10379ce465238e42fbc1a7aef57b49cd";
  var apiSecret = "4db90ca38c72a8b2e855ba19f1328f0d";
  var sortParams = function (a,b)
  {
    var aKey = a.key.toLowerCase();
    var bKey = b.key.toLowerCase();
    return ((aKey < bKey) ? -1 : ((aKey > bKey) ? 1 : 0));
  };
  
  dataFactory.craftRequest = function(methodName, params)
  {
    var i;
    var sigBase = '';
    var prms = $.extend(true, [], params);
    var paramsString = '';

    //add other data to the params
    prms.push({'key': 'method','value': methodName});
    prms.push({'key': 'api_key','value': apiKey});

    //Gotta sort params alphabetically
    prms.sort(sortParams);

    //Craft signature base and parameters strings
    for(i = 0; i < prms.length; i++)
    {
      var param = prms[i];
      var paramName = param.key;
      var paramValue = param.value;

      sigBase += paramName + paramValue;
      
      if (i > 0)
      {
        paramsString += '&';    
      }
      
      paramsString += paramName + '=' + paramValue;
    }

    sigBase += apiSecret;

    //Create the signature
    var apiSig = CryptoJS.MD5(sigBase);

    //Add the api_sig onto the params
    paramsString += '&api_sig=' + apiSig + "&format=json";

    console.log(urlBase + methodName);
    console.log(paramsString);
    
    return $http.post(urlBase + methodName + "&" + paramsString);
  };
  
  dataFactory.saveSession = function()
  {
    var sessionToSave = new Blob([JSON.stringify(window.sdcard)], {type:'text/plain'});
    var sdcard = navigator.getDeviceStorage('sdcard');
    
    //If we have a previous session, delete it so we can overwrite it
    sdcard.delete('session.json');
    
    //Write out our session
    var request = sdcard.addNamed(sessionToSave, 'session.json');
    request.onsuccess = function()
    {
      console.log('Wrote out: ' + this.result);
    };
    
    //If we fail to write out, toast to the user
    request.onerror = function()
    {
      console.log("Error writing settings, did you give permission?");
      console.log(this.error);
    };
  };
  
  return dataFactory;
  
}]);

scrobblerApp.controller('AppCtrl', ['$scope', '$rootScope', '$state', 'apiFactory', function ($scope, $rootScope, $state, apiFactory) {
  $rootScope.user = {name: '', password: ''};
    
  $scope.toggleOffCanvas = function()
  {
      $('#wrapper').toggleClass('move-right');
  };
  
  $scope.logOff = function()
  {
    $rootScope.user = {name: '', password: ''};
    $('#navbar').toggle();
    $('#wrapper').removeClass('move-right');
    $('#loginview').show();
    $state.go('index');
  }
  
  $scope.login = function()
  {
    $('#navbar').toggle();
    $('#loginview').hide();
    $state.go('artists');
//     var params = [{'key':'password', 'value': $scope.user.password},
//                   {'key':'username', 'value': $scope.user.name}];
//     var postRequest = { 'username': $scope.user.name, 'password': $scope.user.password }
    
//     apiFactory.craftRequest('auth.getMobileSession', params, postRequest).success(function(data) {
//       console.log(data);
//       var session = data.session;
           
//       //If there is no session, we had a bad login
//       if(!session)
//       {
//         var error = response['error'];
//         var message = response['message'];
//         console.log(error + ': ' + message);
//         alert('Error logging in: ' + message);
//         return;
//       }
      
//       //If we have the session, save it out
//       saveSession();
//     }).error(function(error) {
//       console.log(error);
//       console.log('Error signing in.');
//     });
  };
}]);

scrobblerApp.controller('NowPlayingCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('ProfileCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('SettingsCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('ArtistsCtrl', ['$scope', 'apiFactory', function ($scope, apiFactory) {
    $scope.artists = [];
  
    if (typeof window.sdcard !== 'undefined')
    {
        if (typeof window.sdcard.artists !== 'undefined')
        {
            $scope.artists = window.sdcard.artists;
        }
    }
  
    var params = [{'key':'user', 'value': $scope.user.name},
                  {'key':'limit', 'value':5}];
    
    apiFactory.craftRequest('library.getArtists', params).success(function(data) {
          if (typeof data.error === 'undefined')
          {
            console.log(data);
            $scope.artists = data.artists.artist;
            window.sdcard.artists = $scope.artists;
            apiFactory.saveSession();
            console.log('ok');
          }
          else
          {
             alert("Unable to retrieve artists. Did you specify a valid user?");
          }
    }).error(function(error) {
          console.log(error);
          console.log('Network error retrieving artists.');
    });
  
    $scope.$on('$destroy', function()
    {
      $scope.artists = [];
    });
}]);

scrobblerApp.controller('TracksCtrl', ['$scope', 'apiFactory', function ($scope, apiFactory) {
    $scope.tracks = [];
  
    if (typeof window.sdcard !== 'undefined')
    {
        if (typeof window.sdcard.tracks !== 'undefined')
        {
            $scope.tracks = window.sdcard.tracks;
        }
    }
  
    var params = [{'key':'user', 'value': $scope.user.name},
                  {'key':'limit', 'value':5}];
  
    apiFactory.craftRequest('library.getTracks', params).success(function(data) {
          if (typeof data.error === 'undefined')
          {
            console.log(data);
            $scope.tracks = data.tracks.track;
            window.sdcard.tracks = $scope.tracks;
            apiFactory.saveSession();
          }
          else
          {
            alert("Unable to retrieve tracks. Did you specify a valid user?");
          }
    }).error(function(error) {
          console.log(error);
          console.log('Network error retrieving tracks.');
          alert('Network error.');
    });
  
  $scope.$on('$destroy', function()
  {
    $scope.tracks = [];
  });
}]);