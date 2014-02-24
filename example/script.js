// Code goes here
var demoApp = angular.module('demoApp',['ez.datedropdowns']);

function demoController($scope) {
  $scope.model = {};
  $scope.model.fullExpiryDate = new Date(2013,0,1);
  $scope.model.fullExpiryDateNoDay = "";
  $scope.model.birthDay = new Date(1800,0,1);
}