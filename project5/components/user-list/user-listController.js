'use strict';
// What I commented out is the code for problem 1

cs142App.controller('UserListController', ['$scope',
    function ($scope) {
        $scope.main.title = 'Users';
        $scope.main.userList = {};
        // $scope.main.userList = window.cs142models.userListModel();
       	$scope.main.toolbarRight = "View All Users";
        // console.log('window.cs142models.userListModel()', window.cs142models.userListModel());
        $scope.FetchModel('/user/list',function(data){
            $scope.$apply(function(){
                $scope.main.userList = data;
            });
        });
        
    }]);

