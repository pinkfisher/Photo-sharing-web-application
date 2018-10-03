'use strict';   

cs142App.controller('Login-registerController', ['$scope','$resource','$location','$rootScope',
    function ($scope,$resource,$location,$rootScope) {
        $scope.register={};
        $scope.register.message="";
        $scope.register.newName = "";
        $scope.register.password1 = "";
        $scope.register.password2 = "";
        $scope.register.first_name = "";
        $scope.register.last_name = "";
        $scope.register.location = "";
        $scope.register.description = "";
        $scope.register.occupation = "";
        $scope.register.toRegister = false;
     

        $scope.login = function(){
            var res= $resource('/admin/login');
            res.save({login_name: $scope.main.login_name,password: $scope.main.login_password},function(user){
                $scope.main.isLoggedIn = true;
                $scope.main.greeting = "Hi, "+ user.first_name;
                $scope.main.login_user = user;
                $scope.main.login_message = "Welcome!";
                $location.path("/users/" + user._id);
                $rootScope.$broadcast("logged_in");
            },function errorHandling(err){
                $scope.main.login_message = "Login failed! Please try again!";
                console.log("login failed, please try again.");
        });
        };
        $scope.potentialUser = function(){
            $scope.register.toRegister = !$scope.register.toRegister;
        };
        $scope.register = function(){
            if($scope.register.password1 !== $scope.register.password2){
                $scope.register.message = "Two passwords are different!";
                
            }else{
            var res = $resource('/user');
            res.save({login_name:$scope.register.newName, password:$scope.register.password1,
            first_name:$scope.register.first_name,last_name:$scope.register.last_name,location:$scope.register.location,
            description:$scope.register.description,occupation:$scope.register.occupation,activity:"Registered as a user"},function(user){
                $scope.register.message = "Register successfully!";
                //clear register form input
                $scope.register.toRegister = false;
                $scope.register.newName = "";
                $scope.register.password1 = "";
                $scope.register.password2 = "";
                $scope.register.first_name = "";
                $scope.register.last_name = "";
                $scope.register.location = "";
                $scope.register.description = "";
                $scope.register.occupation = "";

            },function errorHandling(err){
                $scope.register.message = "Register failed because " + err.data;
                console.log("Register failed because " + err.data);
            });
            }
        };


    }]);

