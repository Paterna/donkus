/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
c
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

