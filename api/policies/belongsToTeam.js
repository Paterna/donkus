/*
 * Middleware de comprobación de pertenencia a un grupo.
 */
module.exports = function belongsToTeam (req, res, next) {
	var user = req.user;
	var team = (req.params && req.params.team)? req.params.team :
		((req.body && req.body.team)? req.body.team :
		((req.query && req.query.team)? req.query.team : 0));

	console.log('Checking if user belongs to the team', team);

	User.findOne({
		id: user.id
	})
	.populate('teams')
	.then(function (user) {
		var teams = user.teams;
		for (var i in teams) {
			if (teams[i].id == team) {
				console.log('Team checked! Moving on...')
				return next();
			}
		}
		console.error('Not allowed!');
		res.api_error({ code: 4, message: "User doesn't belong to this team" });
	})
	.catch( res.api_error );
}