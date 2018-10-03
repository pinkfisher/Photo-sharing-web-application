"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var fs = require('fs');


var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    // response.status(200).send(cs142models.userListModel());
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    User.find({},function(err,usersDB) {
        if(err){
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }if(usersDB.length === 0){
            response.status(500).send('Missing SchemaInfo');
            return;
        }
        var users = JSON.parse(JSON.stringify(usersDB));
        var userList = [];
        for (var i = 0; i < users.length; i++){
            var userObj = {};
            userObj._id = users[i]._id;
            userObj.first_name = users[i].first_name;
            userObj.last_name = users[i].last_name;
            userList.push(userObj);
        }
        response.status(200).send(userList);
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    var id = request.params.id;
    User.findOne({_id:id},function(err,userDB){
        if(err){
            console.log('Invalid ID');
            response.status(400).send('Invalid ID');
            return;
        }if(userDB === null){
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        var userDetail = JSON.parse(JSON.stringify(userDB));
        var user = {};
        user._id = userDetail._id;
        user.first_name = userDetail.first_name;
        user.last_name = userDetail.last_name;
        user.location = userDetail.location;
        user.description = userDetail.description;
        user.occupation = userDetail.occupation;
        response.status(200).send(user);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    var id = request.params.id;
    Photo.find({user_id:id},function(err,photoDB){
        if(err){
            console.log('Invalid ID');
            response.status(400).send('Invalid ID');
            return;
        }if(photoDB.length === 0){
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        var photos= JSON.parse(JSON.stringify(photoDB));
        async.each(photos,function(photo,callback){
            async.each(photo.comments, function(com, done_callback) {
                User.findOne({_id:com.user_id},function(err,userDB){
                    if(err){
                        console.log(JSON.stringify(err));
                        return;
                    }if(userDB === null){
                        console.log('User with _id:' + id + ' not found.');
                        return;
                    }
                    var userDetail = JSON.parse(JSON.stringify(userDB));
                    var user = {};
                    user._id = userDetail._id;
                    user.first_name = userDetail.first_name;
                    user.last_name = userDetail.last_name;
                    com.user = user;
                    delete com.user_id;
                    done_callback(err);
                });
            },function(err){
                if(err){
                    response.status(500).send(JSON.stringify(err));
                }else{
                    delete photo.__v;
                    callback(err);
                }
                });
        },function(err){
            if(err){
                response.status(500).send(JSON.stringify(err));
            }else{
                response.status(200).send(photos);
            }
            });
        });
});




app.post('/admin/login',function(request,response){
    var login_name = request.body.login_name;
    User.findOne({login_name:login_name},function(err,userDB){
        if(err){
            console.log(login_name+'is not a valid account.');
            response.status(400).send(JSON.stringify(err));
            return;
        }if(userDB === null){
            console.log(login_name+'is not a valid account.');
            response.status(400).send('Not found');
            return;
        }if(request.body.password !== userDB.password){
            console.log('Password is not correct.');
            response.status(400).send('Password is not correct.');
            return;
        }
        request.session.isLoggedIn = true;
        request.session.login_name = login_name;
        request.session.user_id = userDB._id;
        response.status(200).send(userDB);
    });
});

app.post('/admin/logout',function(request,response){
    if(!request.session.isLoggedIn){
        console.log("No user currenty logged in.");
        response.status(400).send("No user currenty logged in.");
        return;
    }
    delete request.session.isLoggedIn;
    delete request.session.login_name;
    delete request.session.user_id;
    request.session.destroy(function(err){ 
        if(err){
            console.log("Logged out failed.");
            response.status(400).send('Logged out failed.');
            return;
        }
        response.status(200).send('Logged out succeed.');
    });
});
app.post('/user',function(request,response){
    var newName = request.body.login_name;
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var password = request.body.password;
    var location = request.body.location;
    var description = request.body.description;
    var occupation = request.body.occupation;
    if(!newName || newName === ""){
        console.log('No new login name specified.');
        response.status(400).send("No new login name specified.");
        return;
    }
    User.findOne({login_name:newName},function(err,user){
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user !== null){
            console.log("This user already exists.");
            response.status(400).send("This user already exists.");
            return;
        }
        if(!first_name || first_name === ""){
            console.log("<first name> can not be empty!");
            response.status(400).send('<first name> can not be empty!');
            return;
        }
        if(!last_name || last_name === ""){
            console.log("<last name> can not be empty!");
            response.status(400).send('<last name> can not be empty!');
            return;
        }
        if(!password || password === ""){
            console.log("<password> can not be empty!");
            response.status(400).send('<password> can not be empty!');
            return;
        }
        User.create({login_name:newName,password:password,first_name:first_name,last_name:last_name,
        location:location,description:description,occupation:occupation},function(err,newUser){
            if(err){
                response.status(400).send(JSON.stringify(err));
                return;
            }
            console.log('New user: '+newUser.login_name +'created.');
            newUser.save();
            response.status(200).send(newUser);
         });
    });
});

app.post('/commentsOfPhoto/:photo_id',function(request,response){
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    var photoId = request.params.photo_id;
    var userId = request.session.user_id;
    var comment = request.body.comment;
    if (!comment || comment ===""){
        console.log('Can not send empty comment!');
        response.status(400).send('Can not send empty comment!');
        return;
    }
    Photo.findOne({_id:photoId},function(err,photo){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }if(photo === null){
            console.log('Photo not found.');
            response.status(400).send('Photo not found.');
            return;
        }
        var newComment = {comment:comment,user_id:userId};
        photo.comments = photo.comments.concat([newComment]);
        photo.save();
        response.status(200).send(photo);
    });
});

app.post('/photos/new',function(request,response){
    if(!request.session.isLoggedIn){
        console.log("Please logged in first!");
        response.status(401).send("Please logged in first!");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("Error: No file specified!");
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        if(request.file.size === 0){
            //The file is not an image or it's empty
            response.status(400).send("Not an image file or file empty!");
            return;
        }
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
            if (err) {
                response.status(500).end('Saving file failed.');
                return;
            }
            Photo.create({file_name:filename,user_id: request.session.user_id, comments: []},function(err,newPhoto){
            if(err){
                response.status(400).send(JSON.stringify(err));
                return;
            }
            console.log('New photo added.');
            newPhoto.save();
            response.status(200).send(newPhoto);
            });
        });
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});