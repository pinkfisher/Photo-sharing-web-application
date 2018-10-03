'use strict';


cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource','$rootScope',
  function($scope, $routeParams,$resource,$rootScope) {
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
        res.save({comment: $scope.main.newcomment},function(){
            Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
            $scope.main.newcomment = "";
            $rootScope.$broadcast("new_activity");
        },function errorHandling(err){
            console.log("Add new comment failed, please try again.");
        });
    };

    $scope.deletePhoto = function(photo){
        alert('Are you sure you want to delete this photo?');
        var res = $resource('/deletePhoto/'+photo._id);
        res.save({},function(){
            Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
        },function errorHandling(err){
            console.log("Delete photo failed, please try again.");
        });
    };

    $scope.deleteComment = function(photo,comment){
        alert('Are you sure you want to delete this comment?');
        var res = $resource('/deleteComment/'+photo._id);
        res.save({comment:comment},function(){
            Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
        },function errorHandling(err){
            console.log("Delete comment failed, please try again.");
        });
    };

    $scope.likePhoto = function(photo){
        var res = $resource('/like/'+photo._id);
        res.save({},function(){
            Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
        },function errorHandling(err){
            console.log("Like management failed, please try again.");
        });
    };

    $scope.hasliked = function(photo){
        return photo.likes_ids.indexOf($scope.main.login_user._id) >= 0;
    };

    $scope.$on('newPhoto', function() {
        Photos.query({id:userId},function(photos){
                $scope.main.photolist = photos;
            });
    });

}]);
