/**
 * ChannelController
 *
 * @description :: Server-side logic for managing channels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 * Obtiene el canal solicitado mediante su ID.
	 */
	getChannel: function(req, res) {
		var channel = req.params.channel;

		Channel.findOne({
			id: channel
		})
		.then(function (channel) {
			var teamPromise = Team.findOne({
				id: channel.team
			})
			.populate('users');

			return [channel, teamPromise]
		})
		.spread(function (channel, team) {
			res.api_ok({
				channel: channel,
				team: team
			});
		})
		.catch( res.api_error );
	},
	/*
	 * Permite a un usuario crear un canal que será visible para el resto de usuarios del equipo.
	 */
	create: function(req, res) {
		var team = req.params.team || req.body.team;
		var channelName = req.body.name;
		var desc = req.body.desc;
		var room = req.body.room;

		Channel.create({
			name: channelName,
			team: team,
			description: desc,
			room: room
		})
		.then(function (channel) {
			res.api_ok(channel);
		})
		.catch( res.api_error );

	},
};

