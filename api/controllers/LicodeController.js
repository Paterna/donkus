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
    getRooms: function(req, res) {
        "use strict";

        N.API.getRooms(function (rooms) {
            res.api_ok(rooms);
        }, function (err) {
        	res.api_error({ code: 10, message: err });
        });
    },
    getRoom: function(req, res) {
    	"use strict";
    	var room = req.params.room;

    	N.API.getRoom(room, function (room) {
    		res.api_ok(room);
    	}, function (err) {
    		res.api_error({ code: 11, message: err });
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
    		res.api_error({ code: 12, message: err });
    	}, options);
    },
    deleteRoom: function(req, res) {
    	"use strict";
    	var room = req.params.room;

    	N.API.deleteRoom(room, function (result) {
    		res.api_ok(result);
    	}, function (err) {
    		res.api_error({ code: 13, message: err });
    	});
    },
    createToken: function(req, res) {
        "use strict";
        var room = req.params.room || myRoom;
        var username = req.user.name;
        var role = req.body.role || '';

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