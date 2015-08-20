/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 *
	 */
	getMessages: function (req, res) {
		var channel = req.params.channel;

		Message.find()
		.where({
			channel: channel
		})
		.populate('author')
		.then(res.api_ok)
		.catch(res.api_error)
	},
	/*
	 *
	 */
	push: function (req, res) {
		var channel = req.params.channel;
		var data = req.body.data;
		var author = req.user.id;

		Message.create({
			channel: channel,
			data: data,
			author: author
		})
		.then(res.api_ok)
		.catch(res.api_error);
	}
};

