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
            $scope.main.friendList= $scope.main.userList.filter(function(each){
                return each._id !== $scope.main.login_user._id;
            });
        });

        $scope.$on('new_activity',function(){
            var User = $resource('/user/:id');
            var user = User.get({id:$scope.main.login_user._id},function(){
                $scope.main.login_user = user;
            });
        }); 

    }]);

