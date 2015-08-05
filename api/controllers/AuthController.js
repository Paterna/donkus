/**
 * AuthController
 *
 */
var passport = require('passport');

module.exports = {

  checkSession: function (req, res) {
    if (req.user)
      return res.api_ok(req.user);
    else
      return res.api_error();
  },

  login: function (req, res) {
    passport.authenticate('local', function(err, user, info) {
      if (err)
        return res.api_error(err);
      if (!user)
        return res.api_error({ code: 3, message: 'Wrong email or password' });
      req.logIn(user, function(err) {
        if (err) res.send(err);
        return res.api_ok(user);
      });
    })(req, res);
  },
  logout: function (req,res){
    req.logout();
    return res.api_ok();
  }
};
 
/**
 * Sails controllers expose some logic automatically via blueprints.
 *
 * Blueprints are enabled for all controllers by default, and they can be turned on or off
 * app-wide in `config/controllers.js`. The settings below are overrides provided specifically
 * for AuthController.
 *
 * NOTE:
 * REST and CRUD shortcut blueprints are only enabled if a matching model file
 * (`models/Auth.js`) exists.
 *
 * NOTE:
 * You may also override the logic and leave the routes intact by creating your own
 * custom middleware for AuthController's `find`, `create`, `update`, and/or
 * `destroy` actions.
 */
 
module.exports.blueprints = {
 
  // Expose a route for every method,
  // e.g.
  // `/auth/foo` =&gt; `foo: function (req, res) {}`
  actions: true,
 
  // Expose a RESTful API, e.g.
  // `post /auth` =&gt; `create: function (req, res) {}`
  rest: true,
 
  // Expose simple CRUD shortcuts, e.g.
  // `/auth/create` =&gt; `create: function (req, res) {}`
  // (useful for prototyping)
  shortcuts: true
 
};