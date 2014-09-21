var scrobblerApp = angular.module('scrobblerApp', []);

scrobblerApp.controller('AppCtrl', ['$scope', function ($scope) {
  $scope.active = false;
  $scope.test = "kdjflkdj";
  console.log("test");
}]);