'use strict';
// What I commented out is the code for problem 1

cs142App.controller('UserDetailController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.curUser ={};
    // $scope.curUser = window.cs142models.userModel(userId);
    console.log('UserDetail of ', userId);
    $scope.FetchModel('/user/'+userId,function(data){
            $scope.$apply(function(){
                $scope.curUser = data;
                $scope.main.toolbarRight = $scope.curUser.first_name +" "+ $scope.curUser.last_name;
            });
        });
    // $scope.main.toolbarRight = $scope.curUser.first_name +" "+ $scope.curUser.last_name 
    // console.log('window.cs142models.userModel($routeParams.userId)',
    //     window.cs142models.userModel(userId));

  }]);
