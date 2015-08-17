/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 * Create a new user inserting it into the DB collection
	 */
	newUser: function(req, res) {
		var name = req.body.name;
		var email = req.body.email;
		var password1 = req.body.password1;
		var password2 = req.body.password2;

		var validate = function(name, email, password1, password2) {
			// TODO
			if (!name || name.length < 1) {
				return false;
			}
			if (!email || email.length < 1) {
				return false;
			}
			if (!password1 || password1 < 1) {
				return false;
			}
			if (password1 != password2) {
				return false;
			}
		}

		if (validate) {
			User.findOne({
				email: email
			})
			.then(function (user) {
				if (user)
					throw { code: 1, message: "User already exists" };

				return User.create({
					name: name,
					email: email,
					password: password1
				})	
			})
			.then(res.api_ok)
			.catch(res.api_error);
		}
	},
	/*
	 * Obtiene el usuario solicitado
	 */
	 getUser: function (req, res) {
	 	var userid = req.params.user;

	 	User.findOne({
	 		id: userid
	 	})
	 	.then(res.api_ok)
	 	.catch(res.api_error);
	 },
	/*
	 * Obtiene los equipos asociados al usuario
	 */
	getTeams: function (req, res) {
		var user = req.user;

		User.findOne({
			id: user.id
		})
		.populate('teams')
		.then(function (user) {
			res.api_ok(user.teams);
		})
		.catch(res.api_error);
	}
};