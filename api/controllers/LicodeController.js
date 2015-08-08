/**
 * LicodeController
 *
 * @description :: Server-side logic for managing licodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var N = require('../services/nuve.min.js');
var config = require('../../config/licode');

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');

module.exports = {
    getCurrentRoom: function(req, res) {
        var myRoom;

        N.API.getRooms(function (roomlist) {
            "use strict";
            var rooms = JSON.parse(roomlist);
            for (var room in rooms) {
                if (rooms[room].name === 'donkusRoom')
                myRoom = rooms[room]._id;
            }
            if (!myRoom) {
                N.API.createRoom('donkusRoom', function (roomID) {
                    myRoom = roomID._id;
                    console.log('Created room ', myRoom);
                });
            }
            else
                console.log('Using room', myRoom);
            res.api_ok(myRoom);
        }, function (err) {
            res.api_error({ code: 10, message: err });
        });
    },
    getRooms: function(req, res) {
        "use strict";

        N.API.getRooms(function (rooms) {
            res.api_ok(rooms);
        }, function (err) {
        	res.api_error({ code: 11, message: err });
        });
    },
    getRoom: function(req, res) {
    	"use strict";
    	var room = req.params.room;

    	N.API.getRoom(room, function (room) {
    		res.api_ok(room);
    	}, function (err) {
    		res.api_error({ code: 12, message: err });
    	});
    },
    createRoom: function(req, res) {
    	"use strict";
    	var roomName = req.body.roomName;
    	// See Create Rooms documentation in http://lynckia.com/licode/server-api.html
    	var options = req.body.options || {};

    	N.API.createRoom(roomName, function (room) {
    		res.api.ok(room);
    	}, function (err) {
    		res.api_error({ code: 13, message: err });
    	}, options);
    },
    deleteRoom: function(req, res) {
    	"use strict";
    	var room = req.params.room;

    	N.API.deleteRoom(room, function (result) {
    		res.api_ok(result);
    	}, function (err) {
    		res.api_error({ code: 14, message: err });
    	});
    },
    createToken: function(req, res) {
        "use strict";
        var room = req.params.room;
        var username = req.user.name;
        var role = req.body.role || '';

        console.log("Creating token with role", role, "in room", room);
        N.API.createToken(room, username, role, function(token) {
            res.api_ok(token);
        }, function (err) {
            res.api_error({ code: 20, message: err });
        });
    },
    getUsers: function(req, res) {
        "use strict";
        var room = req.params.room;
        N.API.getUsers(room, function (userslist) {
        	var users = JSON.parse(userslist);
        	if (users.length < 1)
        		res.api_error({ code:21, message: "There are not users in this room" });
        	else
            	res.api_ok(users);
        }, function (err) {
        	res.api_error({ code: 22, message: err });
        });
    }
};