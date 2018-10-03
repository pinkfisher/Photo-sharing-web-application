'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$mdSidenav',
    function ($scope,$mdSidenav) {
        $scope.main = {};
        $scope.main.title = 'Users';

        $scope.toggleLeft = function () {
            $mdSidenav("left").toggle();
        };

        $scope.FetchModel = function(url,doneCallback){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(this.readyState!== 4){
                    return;
                } 
                if(this.status !== 200) {
                    return;
                }
                doneCallback(JSON.parse(this.responseText));
            };
            xhr.open("GET",url);
            xhr.send();
        };

        $scope.FetchModel('/test/info',function(data){
            $scope.$apply(function(){
                $scope.main.VersionNumber = data.__v;
            });
            console.log($scope.main.VersionNumber);
        });
    }]);


