'use strict';


cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource',
  function($scope, $routeParams,$resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

    var userId = $routeParams.userId;


    var User = $resource('/user/:id');
    var user = User.get({id:userId},function(){
        $scope.main.toolbarRight = "Photos of " + user.first_name +" "+ user.last_name;
    });

    var Photos = $resource('/photosOfUser/:id');
    var photos = Photos.query({id:userId},function(){
        $scope.main.photolist = photos;
    });

    $scope.main.newcomment = "";
    $scope.addComment = function(photo){
        var res= $resource('/commentsOfPhoto/'+photo._id);
        res.save({comment: $scope.main.newcomment},function(data){
            Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
            $scope.main.newcomment = "";
        },function errorHandling(err){
            console.log("Add new comment failed, please try again.");
        });
    };

     $scope.$on('newPhoto', function() {
        Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
    });

}]);
