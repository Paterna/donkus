/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');

module.exports = {
	attributes: {	
		name: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true,
			unique: true
		},
		teams: {
			type: 'json'
		},
		password: {
			type: 'string',
			required: true
		},
		toJSON: function() {
			var obj = this.toObject();
			delete obj.password;
			return obj;
		}
	},

	beforeCreate: function (user, cb) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
          cb(err);
        }
        else {
          user.password = hash;
          cb(null, user);
        }
      });
    });
  }
};

