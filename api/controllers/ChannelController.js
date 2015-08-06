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
		var team = req.params.team;

		Channel.findOne({
			id: channel,
			team: team
		})
		.then( res.api_ok )
		.catch( res.api_error );
	},
	/*
	 * Permite a un usuario crear un canal que será visible para el resto de usuarios del equipo.
	 */
	create: function(req, res) {
		var user = req.user;
		var team = req.params.team;
		var channelName = req.body.name;

		Channel.create({
			name: teamName,
			team: team
		})
		.then(function (channel) {
			/* TODO:
			 * team.users.add(user.id);
			 * team.save( console.log );
			 */
			res.api_ok(channel);
		})
		.catch( res.api_error );

	},
};

