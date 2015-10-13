/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 *
	 */
	getVideo: function (req, res) {

	},
	/*
	 *
	 */
	record: function (req, res) {
		var channel = req.body.channel;
		var url = req.body.url;
		var recordId = req.body.recordId;

		Video.create({
			channel: channel,
			url: url,
			recordId: recordId
		})
		.then(res.api_ok)
		.catch(res.api_error);
	}

};

