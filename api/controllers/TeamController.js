/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 * Obtiene el equipo solicitado
	 */
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
	/*
	 *
	 */
	create: function (req, res) {
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
	/*
	 * Permite a un usuario unirse a un equipo existente.
	 */
	join: function() {
		var user = req.user;
		var team = req.params.team;

		Team.findOne({
			id: team
		})
		.then(function (team) {
			team.users.add(user.id);
			team.save( console.log );
		})
		.catch( res.api_error );

	},
	/*
	 * Obtiene los usuarios asociados a un equipo.
	 */
	getUsers: function(req, res) {
		var team = req.params.team;

		Team.findOne({
			id: team
		})
		.populate('users')
		.then( res.api_ok )
		.catch( res.api_error )
	}
};

