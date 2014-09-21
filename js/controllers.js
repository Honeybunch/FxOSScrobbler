var scrobblerApp = angular.module('scrobblerApp', []).config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
    }
]);

scrobblerApp.controller('AppCtrl', ['$scope', function ($scope) {  
  $scope.user = {name: '', password: ''};
    
  $scope.login = function(e)
  {
    var apiKey = "10379ce465238e42fbc1a7aef57b49cd";
    var apiSecret = "4db90ca38c72a8b2e855ba19f1328f0d";

    var apiSig = CryptoJS.MD5('api_key'+apiKey+'methodauth.getMobileSession'+'password'+$scope.user.password+'username'+$scope.user.name+apiSecret);

    var url = 'https://ws.audioscrobbler.com/2.0/?method=auth.getMobileSession';
    var params = 'password='+$scope.user.password+
                 '&username='+$scope.user.name+
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
    $scope.saveSession(session);
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
    request.onsuccess=function(){console.log('Wrote out: ' + this.result);}
    
    //If we fail to write out, toast to the user
    request.onerror=function(){console.log("Error writing settings, did you give permission?");console.log(this.error);}  
  };
}]);