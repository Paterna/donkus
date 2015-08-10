/*
 * Middleware que comprueba que no hay ningún usuario con sesión iniciada.
 */
module.exports = function requireNotSession (req, res, next) {
	var user = req.user;
	if (user)
		res.api_error({ code: 3, message: "User already logged in" });
	else
		next();
}