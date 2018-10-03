'use strict';


cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource',
  function($scope, $routeParams,$resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.main.photolist={};

    var User = $resource('/user/:id',{idkey: "value", });
    var user = User.get({id:userId},function(){
        $scope.main.toolbarRight = "Photos of " + user.first_name +" "+ user.last_name;
    });

    var Photos = $resource('photosOfUser/:id',{id:'@id'});
    var photos = Photos.query({id:userId},function(){
        $scope.main.photolist = photos;
    });
    // $scope.FetchModel('/user/'+userId,function(user){
    //       $scope.$apply(function(){
    //         $scope.main.toolbarRight = "Photos of " + user.first_name +" " + user.last_name;
    //       });
    //   });

    // $scope.FetchModel('/photosOfUser/'+userId,function(data){
    //       $scope.$apply(function(){
    //           $scope.main.photolist = data;
    //       });
    //   });
  }]);
