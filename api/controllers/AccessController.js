/**
 * AccessController
 *
 * @description :: Server-side logic for managing accesses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	/*
	 * Middleware de comprobación de sesión de usuario.
	 */
	requireSession: function (req, res, next) {
		var user = req.user;
		if (user)
			next();
		else
			res.api_error({ code: 2, message: "User not logged in" });
	},

	/*
	 * Middleware que comprueba que no hay ningún usuario con sesión iniciada.
	 */
	requireNotSession: function (req, res, next) {
		var user = req.user;
		if (user)
			res.api_error({ code: 3, message: "User already logged in" });
		else
			next();
	},

	/*
	 * Middleware de comprobación de pertenencia a un grupo.
	 */
	belongsToTeam: function (req, res, next) {
		var user = req.user;
		var team = req.params.team;

		User.findOne({
			id: user.id
		})
		.populate('teams')
		.then(function (user) {
			var teams = user.teams;
			for (var i in teams) {
				if (teams[i].id == team)
					return next();
			}
			res.api_error({ code: 4, message: "User doesn't belongs to this team" });
		})
		.catch( res.api_error );
	},

	/*
	 * Middleware de comprobación de pertenencia a un grupo.
	 */
	notBelongsToTeam: function (req, res, next) {
		var user = req.user;
		var team = req.params.team;

		User.findOne({
			id: user.id
		})
		.populate('teams')
		.then(function (user) {
			var teams = user.teams;
			for (var i in teams) {
				if (teams[i].id == team)
					return next();
			}
			res.api_error({ code: 5, message: "User already belongs to this team" });
		})
		.catch( res.api_error );
	}
};