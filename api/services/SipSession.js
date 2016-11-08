var SIP = require ('sip.js');
var Erizo = require('./erizofc.js');
var config = require('../../config/licode');

exports.SipErizoSession = function(spec) {
    var that = {},
        userAgent ,
        ready = false;

    var room = spec.room;

    var sipUser = config.sip_session.erizo_user;
    var DOMAIN = config.sip_session.domain;

    var setDescriptionErizo = function(msg, session) {
        console.log("Es un invite y me llega el answer");
        var theMsg = {};
        theMsg.type = 'offer';
        theMsg.sdp = msg;
        session.data.erizoStream.pc.sendSignalingMessage(theMsg);
    };

    var getDescriptionErizo = function(mediaHints, session, callback) {
        console.log("gettingDescription from Erizo to Invite");
        session.data.erizoStream = mediaHints.erizoStream;
        if (mediaHints.type === 'publish') {
            theMsg = {}
            room.publish(session.data.erizoStream, { createOffer: true }, function(data) {
                console.log("callback del publish", session.data.erizoStream.getID());
                session.data.erizoStream.pc.setSignalingCallback(function(message) {
                    if (message.type==='offer') {
                        console.log("Obtained Offer");
                        callback(message);
                    }
                });
            });
        } else if (mediaHints.type ==='subscribe') {
            // subscribe con createOffer!!!!
            room.subscribe(session.data.erizoStream, {
                video: false,
                audio: true,
                createOffer: true
            }, function(data) {
                console.log("callback del subscribe");
                session.data.erizoStream.pc.setSignalingCallback(function(message) {
                    if (message.type==='offer'){
                        console.log("Obtained Offer");
                        callback(message);
                    }
                });
            });
        } else {
            console.log("unsupported mediaHints.type:", mediaHints.type);
        }
    };


    var ErizoMediaHandler = require('./ErizoMediaHandler.js')(SIP, setDescriptionErizo, getDescriptionErizo);

    that.createSession = function (options, readyCallback) {
        var config = {
            uri: sipUser+'@' + DOMAIN,
            register: true,
            wsServers: 'ws://' + DOMAIN + ':5066',
            authorizationUser: sipUser,
            password: '9999',
            mediaHandlerFactory: ErizoMediaHandler.defaultFactory,
            log:{ level: "debug" }
        };

        console.log("\nConfiguring SIP User Agent...\n");
        userAgent = new SIP.UA (config);

        userAgent.on('connected', function() {
            console.log("I'm connected, this is great!");
        });

        userAgent.on('registered', function() {
            console.log("I'm registered, this is better!");
            ready = true;
            readyCallback();
        });

        userAgent.on('registrationFailed', function (cause) {
            console.log("Registration failed:\n", cause);
        });

        userAgent.on('invite', function (session) {
            console.log("Receiving Invite, not implemented");
            session.reject({});
        });

        userAgent.start();
    };

    that.publishConfToErizo = function (options, stream, callback) {
        if (ready){
            console.log("Inviting");
            //3001 conf
            var session = userAgent.invite('3001@' + DOMAIN, {
                media: {
                    erizoStream: stream,
                    type: 'publish'
                }
            });

            session.on('accepted', function(){
                callback(session.data.erizoStream.getID());
            });
        }
    };

    that.subscribeFromErizo = function (options, stream, callback) {
        console.log("Trying to subscribe from Erizo");
        var session = userAgent.invite('3001@' + DOMAIN, {media:{erizoStream:stream, type:'subscribe'}});
        session.on('accepted', function() {
            callback(session.data.erizoStream.getID());
        });
    };

    that.removeCall = function(streamId) {

    };

    return that;
};