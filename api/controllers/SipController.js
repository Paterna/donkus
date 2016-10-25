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
            theSession = sipMgr.SipErizoSession(spec);
            theSession.createSession({}, function() {
                console.log("Session created");
                res.api_ok();
            });
        } catch(e) {
            res.api_error({ code: 50, msg: "Error getting SipSession: " + e});
        }

        // res.api_error({ code: 50, msg: "Error getting SIP session"});
    },
    publishConf: function (req, res) {
        console.log("\nPublishConf\n");
        var spec = req.body.spec;
        var localStream = req.body.stream;

        try {
            theSession = sipMgr.SipErizoSession(spec);
            theSession.publishConfToErizo({}, localStream, function(id) {
                console.log("\nPublishCall established\n", id);
                localID = id;
                setTimeout(function() {
                    fs_cli.update_fs();
                }, 2000);
                res.api_ok();
            });
        } catch(e) {
            res.api_error({ code: 51, msg: "Error publishing configuration to Erizo: " + e});
        }
    },
    subscribe: function (req, res) {
        var spec = req.body.spec;
        var theStream = req.body.theStream;
        try {
            theSession.subscribeFromErizo({}, theStream, function (streamId) {
                console.log("\nNew stream added to SIP\n", streamId);
                setTimeout( function(){
                    fs_cli.update_fs();
                }, 2000);
                res.api_ok();
            })
        } catch(e) {
            res.api_error({ code: 52, msg: "Error subscribing from Erizo: " + e});
        }
    }
};
