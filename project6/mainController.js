'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial','ngResource']);

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

cs142App.controller('MainController', ['$scope', '$mdSidenav','$resource',
    function ($scope,$mdSidenav,$resource) {
        $scope.main = {};
        $scope.main.title = 'Users';

        $scope.toggleLeft = function () {
            $mdSidenav("left").toggle();
        };

        var Info = $resource('/test/info');
        var info = Info.get({},function(){
            $scope.main.VersionNumber = info.version;
        });
    }]);


