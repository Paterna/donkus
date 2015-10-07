/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  AuthController: {
    getUserSession: 'requireSession',
    login: 'requireNotSession',
    logout: 'requireSession'
  },
  UserController: {
    newUser: 'requireNotSession',
    getUser: 'requireSession',
    getTeams: 'requireSession'
  },
  TeamController: {
    getTeam: 'requireSession',
    /* getTeam: ['requireSession', 'belongsToTeam'], */
    create: 'requireSession',
    join: 'requireSession',
    /* join: ['requireSession', 'belongsToTeam'] */
  },
  ChannelController: {
    getChannel: 'requireSession',
    /* getChannel: ['requireSession', 'belongsToTeam'], */
    create: 'requireSession'
    /* create: ['requireSession', 'belongsToTeam'] */
  },
  MeesageController: {
    getMessages: 'requireSession',
    push: 'requireSession'
  },
  VideoController: {
    getVideo: 'requireSession',
    save: 'requireSession'
  },
  LicodeController: {
    getCurrentRoom: 'requireSession',
    getRooms: 'requireSession',
    getRoom: 'requireSession',
    createRoom: 'requireSession',
    deleteRoom: 'requireSession',
    createToken: 'requireSession',
    getUsers: 'requireSession'
  }

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
