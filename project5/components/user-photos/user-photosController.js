'use strict';
// What I commented out is the code for problem 1

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.main.photolist={};
    // var user = $scope.main.userList(userId);
    // $scope.main.photolist = window.cs142models.photoOfUserModel(userId);
    // $scope.main.toolbarRight = "Photos of " + user.first_name +" " + user.last_name;

    // console.log('window.cs142models.photoOfUserModel($routeParams.userId)',
    //    window.cs142models.photoOfUserModel(userId));
    $scope.FetchModel('/user/'+userId,function(user){
          $scope.$apply(function(){
            $scope.main.toolbarRight = "Photos of " + user.first_name +" " + user.last_name;
          });
      });

    $scope.FetchModel('/photosOfUser/'+userId,function(data){
          $scope.$apply(function(){
              $scope.main.photolist = data;
          });
      });
  }]);
