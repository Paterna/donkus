/**
 * SipController
 *
 * @description :: Server-side logic for managing sips
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var sipMgr = require('../../api/services/SipSession.js');
var fs_cli = require('../../api/services/fs_cli_adaptor.js');

module.exports = {

    getSession: function (req, res) {
        var spec = req.body.spec;

        try {
            session = sipMgr.SipErizoSession(spec);
            global.session = session;
            session.createSession({}, function() {
                console.log("Session created");
                res.api_ok();
            });
        } catch(e) {
            res.api_error({ code: 50, message: "Error getting SipSession: " + e});
        }
    },
    publishConf: function (req, res) {
        var localStream = req.body.stream;

        console.log("localStream:", localStream);

        try {
            session.publishConfToErizo({}, localStream, function(id) {
                console.log("\nPublishCall established\n", id);
                localID = id;
                setTimeout(function() {
                    fs_cli.update_fs();
                }, 2000);
                res.api_ok();
            });
        } catch(e) {
            res.api_error({ code: 51, message: "Error publishing configuration to Erizo: " + e});
        }
    },
    subscribe: function (req, res) {
        var stream = req.body.stream;

        try {
            session.subscribeFromErizo({}, stream, function (streamId) {
                console.log("\nNew stream added to SIP\n", streamId);
                setTimeout( function(){
                    fs_cli.update_fs();
                }, 2000);
                res.api_ok();
            })
        } catch(e) {
            res.api_error({ code: 52, message: "Error subscribing from Erizo: " + e});
        }
    }
};
