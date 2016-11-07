/**
 * SipController
 *
 * @description :: Server-side logic for managing SIP session
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Licode = require('./LicodeController');
var Erizo = require('../services/erizofc.js');
var sipMgr = require('../services/SipSession.js');
var fs_cli = require('../services/fs_cli_adaptor.js');


module.exports = {

    setSipSession: function (req, res) {
        var room = req.body.room;
        var spec = {};
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

        console.log("Room:\n", room);

        var createToken = function(room, role, cb) {

        }

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

        createToken("user", "presenter", function (token) {
            room = Erizo.Room({ token: token });
            
            room.addEventListener("room-connected", function (event) {
                console.log("Connected to room", room._id);

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

            try {
                spec = { room: room };
                session = sipMgr.SipErizoSession(spec);

                session.createSession({}, function() {
                    console.log("Session created");
                    room.connect();
                    //res.api_ok();
                });
            } catch(e) {
                res.api_error({ code: 50, message: "Error getting SipSession: " + e});
            }
        });
    }
    // ,
    // publishConf: function (req, res) {
    //     try {
    //         session.publishConfToErizo({}, localStream, function (id) {
    //             console.log("\nPublishCall established\n", id);
    //             localID = id;
    //             setTimeout(function() {
    //                 fs_cli.update_fs();
    //             }, 2000);
    //             res.api_ok();
    //         });
    //     } catch(e) {
    //         res.api_error({ code: 51, message: "Error publishing configuration to Erizo: " + e});
    //     }
    // },
    // subscribe: function (req, res) {
    //     try {
    //         session.subscribeFromErizo({}, localStream, function (streamId) {
    //             console.log("\nNew stream added to SIP\n", streamId);
    //             setTimeout( function(){
    //                 fs_cli.update_fs();
    //             }, 2000);
    //             res.api_ok();
    //         })
    //     } catch(e) {
    //         res.api_error({ code: 52, message: "Error subscribing from Erizo: " + e});
    //     }
    // }
};
