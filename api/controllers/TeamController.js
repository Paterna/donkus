/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getTeam: function(req, res) {
		var team = req.params.team;

		Team.findOne({
			id: team
		})
		.populate('users')
		.populate('channels')
		.then( res.api_ok )
		.catch( res.api_error );
	},
	create: function(req, res) {
		var user = req.user;
		var teamName = req.body.name;

		Team.create({
			name: teamName
		})
		.then(function (team) {
			team.users.add(user.id);
			team.save( console.log );
			res.api_ok(team);
		})
		.catch( res.api_error );

	},
	getUsers: function (req, res) {
		var team = req.params.team;

		Team.findOne({
			id: team
		})
		.populate('users')
		.then( res.api_ok )
		.catch( res.api_error )
	}
};

