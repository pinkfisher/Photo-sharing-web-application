'use strict';


cs142App.controller('UserDetailController', ['$scope', '$routeParams','$resource','$rootScope',"$location",
  function ($scope, $routeParams,$resource,$rootScope,$location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.main.curUser ={};
    console.log('UserDetail of ', userId);
    var User = $resource('/user/:id');
    var user = User.get({id:userId},function(){
        $scope.main.curUser = user;
        $scope.main.toolbarRight = user.first_name +" "+ user.last_name;
    });

    var Photos = $resource('/photosOfUser/:id');
    var photos = Photos.query({id:userId},function(){
        var mostRecent = photos[0].date_time;
        var mostRecentPhoto = photos[0];
        for(var i = 1; i < photos.length; i ++){
          var curDate = photos[i].date_time;
          if (curDate > mostRecent){
             mostRecent = curDate;
             mostRecentPhoto = photos[i];
          }
        }
        $scope.main.recentPhoto = "images/"+ mostRecentPhoto.file_name;
        $scope.main.recentPhotoDate = mostRecent;

        var mostComment = photos[0].comments.length;
        var mostCommentPhoto = photos[0];
        for(var j = 1; j < photos.length; j ++){
          var curComment = photos[j].comments.length;
          if (curComment > mostComment){
             mostComment = curComment;
             mostCommentPhoto = photos[j];
          }
        }
        $scope.main.comment_count = mostComment;
        $scope.main.mostCommentPhoto = "images/"+ mostCommentPhoto.file_name;
    });

    $scope.deleteUser = function(){
      alert('Are you sure you want to delete this account?');
      var res = $resource('/delete/'+userId);
      res.save({},function(){
          $scope.main.isLoggedIn=false;
          $scope.main.greeting = "Please login";
          $scope.main.login_name ='';
          $scope.main.login_password='';
          $rootScope.$broadcast("logged_out");
          $location.path("/login-register");
      },function errorHandling(err){
          console.log("Delete user failed, please try again.");
      });
    };
 }]);

