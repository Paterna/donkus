/*
 * Middleware de comprobación de sesión de usuario.
 */

module.exports = function requireSession (req, res, next) {
	console.log("Checking session...");
	var user = req.user;

	if (user) {
		console.log('Session checked!');
		next();
	}
	else
		res.api_error({ code: 2, message: "User not logged in" });
}