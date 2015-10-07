/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		channel: {
			model: 'channel',
			required: true
		},
		data: {
			type: 'string',
			required: true
		},
		author: {
			model: 'user',
			required: true
		}
	}
};

