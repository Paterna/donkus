/*
 * Middleware de comprobación de sesión de usuario.
 */

module.exports = function requireSession (req, res, next) {
	var user = req.user;

	if (user)
		next();
	else
		res.api_error({ code: 2, message: "User not logged in" });
}