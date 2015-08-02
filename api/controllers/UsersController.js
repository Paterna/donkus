/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/* Create a new user inserting it into the DB collection */
	newUser: function(req, res, next) {
		var name = req.body.name;
		var email = req.body.email;
		var password1 = req.body.password1;
		var password2 = req.body.password2;

		var validate = function(name, email, password1, password2) {
			if (!name || name.length < 1) {
				return false;
			}
			if (!email || email.length < 1) {
				return false;
			}
			if (!password1 || password1 <1) {
				return false;
			}
			if (password1 != password2) {
				return false;
			}
		}

		if (validate) {
			Users.findOne({
				email: email
			})
			.then(function (user) {
				if (user)
					throw { code: 1, msg: "User already exists", user: user };

				return Users.create( {
					name: name,
					email: email,
					password: password1
				} )	
			})
			.then( res.api_ok )
			.catch( res.api_error );
		}
	}
};