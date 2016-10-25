"use strict";
var SIP = require ('sip.js');
var Promise = require('promiscuous');
/**
 * @fileoverview MediaHandler
 */

/* MediaHandler
 * @class PeerConnection helper Class.
 * @param {SIP.Session} session
 * @param {Object} [options]
 */
module.exports = function (SIP, setDescCallback, getDescCallback) {
var callback = setDescCallback;
var getCallback = getDescCallback;
var MediaHandler = function(session, options) {
  // keep jshint happy
  options = options || {};
  this.session = session;
};

MediaHandler.defaultFactory = function defaultFactory (session, options) {
  console.log("MediaHandler Factory called to create a new one");
  return new MediaHandler(session, options);
};
MediaHandler.defaultFactory.isSupported = function () {
  return true;
};

MediaHandler.prototype = Object.create(SIP.EventEmitter.prototype, {
  isReady: {value: function isReady () {
      console.log("isReady MediaHandler");
      return true;
  }},

  close: {value: function close () {
      console.log("Closing MediaHandler");
  
  }},

  /**
   * @param {Object} [mediaHint] A custom object describing the media to be used during this session.
   */
  getDescription: {value: function getDescription (mediaHint) {
      var self = this;
    // keep jshint happy
    console.log("*********************************Get Description", mediaHint);
    mediaHint = mediaHint;
    return new Promise(function (resolve, reject){
        getDescCallback(mediaHint, self.session, function(description){;
            if (description!==undefined){
                console.log("Passing it", description.sdp);
                resolve(description.sdp);
            }else{
                reject("Description not ready");
            }

        });
    });
  }},

  /**
  * Message reception.
  * @param {String} type
  * @param {String} description
  */
  setDescription: {value: function setDescription (description) {
      var self = this;
      console.log("******************************Set Description", description);
    // keep jshint happy
    description = description;
    callback(description, self.session);
    return new Promise (function (resolve, reject){
        resolve(true);
    });
  }},

  render: {value: function render (){
      console.log("Render: I'm not doing anything");
  }},


 getReferMedia: {writable: true, value: function getReferMedia () {
    function hasTracks (trackGetter, stream) {
      return stream[trackGetter]().length > 0;
    }

    function bothHaveTracks (trackGetter) {
      /* jshint validthis:true */
      return this.getLocalStreams().some(hasTracks.bind(null, trackGetter)) &&
             this.getRemoteStreams().some(hasTracks.bind(null, trackGetter));
    }

    return {
      constraints: {
        audio: bothHaveTracks.call(this, 'getAudioTracks'),
        video: bothHaveTracks.call(this, 'getVideoTracks')
      }
    };
  }},

// Functions the session can use, but only because it's convenient for the application
  isMuted: {writable: true, value: function isMuted () {
      console.log("I'm not doing anything Ismuted");
      return false;
  }},

  mute: {writable: true, value: function mute (options) {
      console.log("I'm not doing anything mute");
  }},

  unmute: {writable: true, value: function unmute (options) {
      console.log("I'm not doing anything unmute");
  }},

  hold: {writable: true, value: function hold () {
      console.log("I'm not doing anything hold");
  }},

  unhold: {writable: true, value: function unhold () {
      console.log("I'm not doing anything unhold");
  }}
});

return MediaHandler;
};

