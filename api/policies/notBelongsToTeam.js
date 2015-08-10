/*
 * Middleware de comprobación de pertenencia a un grupo.
 */
module.exports = function notBelongsToTeam (req, res, next) {
	var user = req.user;
	var team = req.params.team || req.body.team;

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