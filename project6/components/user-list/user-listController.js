'use strict';   

cs142App.controller('UserListController', ['$scope','$resource',
    function ($scope,$resource) {
        $scope.main.title = 'Users';
        $scope.main.userList = {};
       	$scope.main.toolbarRight = "View All Users";
        // console.log('window.cs142models.userListModel()', window.cs142models.userListModel());
        var userList = $resource('user/list');
        var users = userList.query({},function(){
            $scope.main.userList = users;
        });
    }]);

