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
            when('/login-register',{
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'Login-registerController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$mdSidenav','$resource','$rootScope','$location','$http',
    function ($scope,$mdSidenav,$resource,$rootScope,$location,$http) {
        $scope.main = {};
        $scope.main.login_user = {};
        $scope.main.title = 'Users';
        $scope.main.greeting = "Please login";
        $scope.main.isLoggedIn = false;
        $scope.main.login_name = "";
        $scope.main.login_password = "";
        $scope.main.login_message = "";

        $scope.toggleLeft = function () {
            $mdSidenav("left").toggle();
        };
    
        $scope.getVersion = function(){
            var Info = $resource('/test/info');
            var info = Info.get({},function(){
                $scope.main.VersionNumber = info.version;
            }); 
        };
       
        $scope.$on('logged_in',function(){
            $scope.getVersion();
        });  

        $scope.$on('logged_out',function(){
            $scope.main.VersionNumber = "";
        }); 

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if (!$scope.main.isLoggedIn) {
                // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            } 
         });

         $scope.main.logout = function(){
            var res = $resource('/admin/logout');
            res.save({},function(){
                $scope.main.isLoggedIn = false;
                $scope.main.greeting = "Please login";
                $scope.main.login_user = {};
                $scope.main.login_name = "";
                $scope.main.login_password = "";
                $location.path("/login-register");
                $rootScope.$broadcast("logged_out");
            },function errorHandling(err){
                $scope.main.login_message = "Logout failed";
                console.log("Logout failed");
            });
        };

         var selectedPhotoFile;   // Holds the last file selected by the user
         // Called on file selection - we simply save a reference to the file in selectedPhoto File
         $scope.inputFileNameChanged = function (element) {
             selectedPhotoFile = element.files[0];
         };
         // Has the user selected a file?
         $scope.inputFileNameSelected = function () {
             return !!selectedPhotoFile;
         };
         // Upload the photo file selected by the user using a post request to the URL /photos/new
         $scope.uploadPhoto = function () {
             if (!$scope.inputFileNameSelected()) {
                 console.error("uploadPhoto called will no selected file");
                 return;
             }
             console.log('fileSubmitted', selectedPhotoFile);
             // Create a DOM form and add the file to it under the name uploadedphoto
             var domForm = new FormData();
             domForm.append('uploadedphoto', selectedPhotoFile);
             // Using $http to POST the form
             $http.post('/photos/new', domForm, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             }).then(function successCallback(response){
                 // The photo was successfully uploaded. XXX - Do whatever you want on success
                 $rootScope.$broadcast("newPhoto");
                 $rootScope.$broadcast("new_activity");
                 $location.path("/photos/"+$scope.main.login_user._id);
             }, function errorCallback(response){
                 // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                 console.error('ERROR uploading photo', response);
             });
        };

    }]);




