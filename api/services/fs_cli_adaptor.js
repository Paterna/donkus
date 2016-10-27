var exec = require('child_process').exec;
var config = require('../../config/licode');

var CONTAINER_ID = "9cd3d9f112d9";
var DOCKER_COMMAND = "docker";
var DOMAIN = config.sip_session.domain;
var ERIZO_CALL = "1002@" + DOMAIN;
var ERIZO_CONFERENCE = "3001-" + DOMAIN;

var get_list = DOCKER_COMMAND + ' exec ' + CONTAINER_ID + ' fs_cli -x "conference list"';

var relate = function (conf, id1, id2)  {
    var relate_cmd = DOCKER_COMMAND + ' exec ' + CONTAINER_ID + ' fs_cli -x "conference ' + conf + ' relate ' + id1 + ' ' + id2 + ' nohear"';
    console.log("Executing", relate_cmd);
    exec(relate_cmd, function(error, stdout, stderr) {
        console.log(stdout);
    })
}

var deaf = function (conf, id1) {
    var deaf_cmd = DOCKER_COMMAND + ' exec ' + CONTAINER_ID + ' fs_cli -x "conference ' + conf + ' deaf ' + id1 + '"';
    console.log("Executing", deaf_cmd);
    exec(deaf_cmd, function(error, stdout, stderr) {
        console.log(stdout);
    })
}


var prevConferences;
var publisherId = 0;

var getConferences = function(resultCallback){
    exec(get_list, function(error, stdout, stderr) {
        var conferences = {};
        var lines = stdout.split("\n");
        if (lines[0] == "No active conferences.") {
            console.log("No active conferences.");
        } else {
            var last_conference;

            for (var l = 0; l < lines.length-2; l++) {
                var info = lines[l].split(" ");
                if (info[0] == "Conference") {
                    last_conference = info[1];
                    conferences[last_conference] = {};
                } else {
                    var user_info = lines[l].split(";");
                    var user_id = user_info[0];
                    var user_address = user_info[1].split("/")[2];
                    if (user_address === ERIZO_CALL){                        
                        conferences[last_conference][user_id] = user_address;
                    }
                }
            }
        }

        console.log("Conferences:", conferences);
        resultCallback(conferences);
    })
};

var diffConferences = function(thePrevConference, theNewConference){
    if (Object.keys(thePrevConference).length == Object.keys(theNewConference).length){
        return {};
    }
    var diff = function(b,a) {
        return b.filter(function(i) {return a.indexOf(i) < 0;});
    };

    return (diff (Object.keys(theNewConference),(Object.keys(thePrevConference))));
}

exports.update_fs = function () {
    getConferences(function(newConferences){
        if (newConferences[ERIZO_CONFERENCE]){
            if (!prevConferences){
                for (var user in newConferences[ERIZO_CONFERENCE]){
                    if(!publisherId){
                        publisherId = user;
                        console.log("The publisher ID is", publisherId);
                        continue;
                    }
                    relate(ERIZO_CONFERENCE, publisherId, user);
                    deaf(ERIZO_CONFERENCE, user);
                }
                prevConferences = newConferences[ERIZO_CONFERENCE];
            } else {
                var theDiff = diffConferences(prevConferences, newConferences[ERIZO_CONFERENCE]);
                for (var i in theDiff){
                    relate(ERIZO_CONFERENCE, publisherId, theDiff[i]);
                    deaf(ERIZO_CONFERENCE, theDiff[i]);
                }
            }
        }

    });
};

