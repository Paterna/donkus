/**
 * LicodeController
 *
 * @description :: Server-side logic for managing licodes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var N = require('../services/nuve.min.js');
var config = require('../../config/licode');
var Erizo = require('../services/erizofc.js');
var chCtrl = require('./ChannelController');
var sipMgr = require('../services/SipSession.js');
var fs_cli = require('../services/fs_cli_adaptor.js');

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
                    console.log('Created room', myRoom);
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
            res.api_ok(JSON.parse(rooms));
        }, function (err) {
            res.api_error({ code: 11, message: err });
        });
    },
    getRoom: function(req, res) {
        "use strict";
        var room = req.params.room;

        N.API.getRoom(room, function (room) {
            res.api_ok(JSON.parse(room));
        }, function (err) {
            res.api_error({ code: 12, message: err });
        });
    },
    createRoom: function(req, res) {
        "use strict";
        var roomName = req.body.name;
        // See Create Rooms documentation in http://lynckia.com/licode/server-api.html
        var options = req.body.options || {};

        N.API.createRoom(roomName, function (room) {
            console.log("Room created correctly:", room);
            res.api_ok(room);
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
    },
    setSipSession: function (req, res) {
        var roomID = req.body.roomID;
        var room;
        var session;
        var localID;

        var localStream = Erizo.Stream({
            audio: false,
            video: false,
            data: true,
            attributes: {
                type: 'sipstream'
            }
        });

        console.log("RoomID for SIP channel:", roomID);
        N.API.createToken(roomID, "SIP_GW", "presenter", function (token) {
            console.log("Token created for SIP session:", token);
            console.log("In room: ", roomID);

            room = Erizo.Room({ token: token });

            room.addEventListener("room-connected", function (event) {
                console.log("Connected to room");

                session.publishConfToErizo({}, localStream, function (id) {
                    console.log("\nPublishCall established\n", id);
                    localID = id;
                    setTimeout(function() {
                        fs_cli.update_fs();
                    }, 2000);
                    subscribeToStreams(event.streams);
                });
            });

            room.addEventListener("stream-added", function (event) {
                console.log('Stream added:', event.stream.getID());

                var streams = [];
                streams.push(event.stream);
                subscribeToStreams(streams);
            });

            session = sipMgr.SipErizoSession({ room: room });

            session.createSession({}, function() {
                console.log("Trying to connect to SIP room...");
                room.connect();
            });
        }, function (err) {
            console.log(err);
        });

        var subscribeToStreams = function (streams) {
            for (var s in streams) {
                if (localStream.getID() !== s.getID()) {
                    session.subscribeFromErizo({}, s, function (streamID) {
                        console.log("New stream added to SIP:", streamId);
                        setTimeout( function(){
                            fs_cli.update_fs();
                        }, 2000);
                    })
                }
            }
        }
    }
};