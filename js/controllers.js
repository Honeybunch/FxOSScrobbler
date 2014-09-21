'use strict';

// $(function() {
//     loadSession(setupNowPlaying, setupLogin);
//     //If it has one, jump to the next activity
//     if(previousSession)
//     {
      
//     }
// });

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
        }).state('settings', {
          url: '/settings',
          templateUrl: 'settings.html',
          controller: 'SettingsCtrl'
        }).state('statistics', {
          url: '/statistics',
          templateUrl: 'statistics.html',
          controller: 'StatisticsCtrl'
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
    var paramsString = '';
    var sigBase = '';

    //add other data to the params
    params.push({'key': 'method','value': methodName});
    params.push({'key': 'api_key','value': apiKey});

    //Gotta sort params alphabetically
    params.sort(sortParams);

    //Craft signature base and parameters strings
    for(i = 0; i < params.length; i++)
    {
      var param = params[i];
      var paramName = param.key;
      var paramValue = param.value;

      sigBase += paramName + paramValue;

      if (i > 0)
      {
        paramsString += '&';
      }

      paramsString += paramName +'='+ paramValue;
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
  
  return dataFactory;
  
}]);

scrobblerApp.controller('AppCtrl', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
  $rootScope.user = {name: '', password: ''};
    
  $scope.toggleOffCanvas = function()
  {
      $('#wrapper').toggleClass('move-right');
  };
  
  $scope.logOff = function()
  {
    $('#navbar').toggle();
    $('#wrapper').removeClass('move-right');
    $('#loginview').show();
    $state.go('index');
  }
  
  $scope.login = function(e)
  {
    $('#navbar').toggle();
    $('#loginview').hide();
    $state.go('profile');
    return;
1  };
  
  $scope.saveSession = function(session)
  {
    var sessionToSave = new Blob([JSON.stringify(session)], {type:'text/plain'});
    var sdcard = navigator.getDeviceStorage('sdcard');

    var name = session['name'];
    var sessionKey = session['key'];
    
    //If we have a previous session, delete it so we can overwrite it
    sdcard.delete('session.json');
    
    //Write out our session
    var request = sdcard.addNamed(sessionToSave, 'session.json');
    request.onsuccess = function()
    {
      console.log('Wrote out: ' + this.result);
    }
    
    //If we fail to write out, toast to the user
    request.onerror = function()
    {
      console.log("Error writing settings, did you give permission?");
      console.log(this.error);
    }  
  };
}]);

scrobblerApp.controller('NowPlayingCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('ProfileCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('SettingsCtrl', ['$scope', function ($scope) {  
  
}]);

scrobblerApp.controller('StatisticsCtrl', ['$scope', 'apiFactory', function ($scope, apiFactory) {
    $scope.artists = [];
  
    console.log('Username in statsctrl');
    console.log($scope.user.name);
    var params = [{'key':'user', 'value': $scope.user.name},
                  {'key':'limit', 'value':5}];
    
    apiFactory.craftRequest('library.getArtists', params).success(function(data) {
          console.log(data);
          $scope.artists = data.artists.artist;
    }).error(function(error) {
          console.log(error);
          console.log('Network error retrieving statistics.');
    });
}]);