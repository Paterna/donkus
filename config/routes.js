/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  '/': {
    view: 'index'
  },

  /* User API routes */
  'get /api/user': ['AccessController.requireSession', 'AuthController.getUserSession'],
  'post /api/user': ['AccessController.requireNotSession', 'AuthController.login'],
  'delete /api/user': ['AccessController.requireSession', 'AuthController.logout'],
  'post /api/user/new': ['AccessController.requireNotSession', 'UserController.newUser'],
  'get /api/user/teams': ['AccessController.requireSession', 'UserController.getTeams'],

  /* Team API routes */
  'get /api/team/:team': ['AccessController.requireSession', 'AccessController.belongsToTeam', 'TeamController.getTeam'],
  'get /api/team/:team/users': ['AccessController.requireSession', 'AccessController.belongsToTeam', 'TeamController.getUsers'],
  'post /api/team/create': ['AccessController.requireSession', 'TeamController.create'],
  'post /api/team/:team/join': ['AccessController.requireSession', 'AccessController.notBelongsToTeam', 'TeamController.join'],

  /* Channel API routes */
  'get /api/channel/:channel/team/:team': ['AccessController.requireSession', 'AccessController.belongsToTeam', 'ChannelController.getChannel'],

  /* Licode API routes */
  // Rooms
  'get /api/licode/get_rooms': 'LicodeController.getRooms',
  'get /api/licode/get_room/:room': 'LicodeController.getRoom',
  'post /api/licode/create_room': 'LicodeController.createRoom',
  'delete /api/licode/delete_room/:room': 'LicodeController.deleteRoom',
  // Users
  'post /api/licode/create_token/:room': 'LicodeController.createToken',
  'get /api/licode/get_users/:room': 'LicodeController.getUsers'

};
