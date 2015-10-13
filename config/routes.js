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
  'get /api/user': 'AuthController.getUserSession',
  'post /api/user': 'AuthController.login',
  'delete /api/user': 'AuthController.logout',
  'get /api/user/teams': 'UserController.getTeams',
  'get /api/user/:user': 'UserController.getUser',
  'post /api/user/new': 'UserController.newUser',

  /* Team API routes */
  'get /api/team/:team': 'TeamController.getTeam',
  'post /api/team/create': 'TeamController.create',
  'put /api/team/:team/join': 'TeamController.join',

  /* Channel API routes */
  'get /api/channel/:channel': 'ChannelController.getChannel',
  'post /api/channel/create': 'ChannelController.create',

  /* Message API routes */
  'get /api/messages/:channel': 'MessageController.getMessages',
  'post /api/message/push/:channel': 'MessageController.push',

  /* Video recording API routes */
  'get /api/video/:recordid': 'VideoController.getVideo',
  'post /api/video/record': 'VideoController.record',

  /* Licode API routes */
  // Rooms
  'get /api/licode/rooms': 'LicodeController.getRooms',
  'get /api/licode/room/current': 'LicodeController.getCurrentRoom',
  'get /api/licode/room/:room': 'LicodeController.getRoom',
  'post /api/licode/room/create': 'LicodeController.createRoom',
  'delete /api/licode/room/:room/delete': 'LicodeController.deleteRoom',
  // Users
  'post /api/licode/token/create/:room': 'LicodeController.createToken',
  'get /api/licode/users/:room': 'LicodeController.getUsers'
};
