var app = angular.module('app', [
	'ui.router'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
	function ($stateProvider, $urlRouterProvider, $httpProvider) {
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				views: {
					'content': {
						templateUrl: 'partials/index.html',
						controller: 'appCtrl'
					}
				}
			})
			.state('signup', {
				url: '/signup',
				templateUrl: 'partials/signup.html',
				controller: 'AuthCtrl',
				require: { noAuth: true }
			})
			.state('login', {
				url: '/login',
				templateUrl: 'partials/login.html',
				controller: 'AuthCtrl',
				require: { noAuth: true }
			})
			.state('logout', {
				url: '/logout',
				controller: 'AuthCtrl',
				require: { auth: true }
			})
			.state('profile', {
				url: '/profile',
				views: {
					'content': {
						templateUrl: 'partials/profile.html',
					}
				},
				controller: 'profileCtrl',
				require: { auth: true }
			})
			.state('team', {
				url: '/team/:team',
				views: {
					'side-menu': {
						templateUrl: 'partials/teams/team_menu.html',
						controller: 'teamsCtrl'
					},
					'content': {
						templateUrl: 'partials/teams/team.html',
						controller: 'teamsCtrl'
					}
				},
				require: { auth: true }
			})
			.state('teams', {
				url: '/teams',
				views: {
					'side-menu': {
						templateUrl: 'partials/teams/teams_menu.html',
						controller: 'teamsCtrl'
					},
					'content': {
						templateUrl: 'partials/teams/teams.html',
						controller: 'teamsCtrl'
					}
				},
				require: { auth: true }
			})
			.state('teams_new', {
				url: '/teams/new',
				views: {
					'content': {
						templateUrl: 'partials/teams/teams_new.html',
						controller: 'teamsCtrl'
					}
				},
				require: { auth: true }
			})
			.state('channel', {
				url: '/channel/:channel',
				views: {
					'side-menu': {
						templateUrl: 'partials/channels/channel_menu.html',
						controller: 'channelsCtrl'
					},
					'content': {
						templateUrl: 'partials/channels/channel.html',
						controller: 'channelsCtrl'
					}
				},
				require: { auth: true }
			})
			.state('channel_new', {
				url: '/channels/new/:team',
				views: {
					'content': {
						templateUrl: 'partials/channels/channels_new.html',
						controller: 'channelsCtrl'
					}
				},
				require: { auth: true }
			})
			.state('test-licode', {
				url: '/test-licode',
				templateUrl: 'partials/test_licode.html',
				controller: 'licodeCtrl',
				require: { auth: true }
			});


		
		var transformResponse = function(response) {
			var serverResponse = response.data;

			if (serverResponse === undefined || serverResponse.code === undefined)
				return response;

			if (serverResponse.code !== 0) {
				throw serverResponse;
			}

			response.data = serverResponse.data;
			return response.data;
		}

		$httpProvider.interceptors.push( function() {
			return { response: transformResponse }
		});
	}
]);

app.run(['$rootScope', '$http', '$state',
	function ($rootScope, $http, $state) {
    	/*
         * $rootScope.user = undefined -> No sé aún nada sobre el usuario.
         * $rootScope.user = null -> No hay usuario ni sesión en el lado del servidor.
         * $rootScope.user = something -> Este es nuestro usuario actual.
        */
        $rootScope.user = undefined;

        $rootScope.logout = function () {
			$http.delete('/api/user')
			.then(function (obj) {
				$rootScope.user = null;
				$state.go('home');
			})
			.catch(function (err) {
				sweetAlert("Error!", err.message, "error");
			});
		}

        $rootScope.$on('$stateChangeStart', function (e, toState , toParams, fromState, fromParams) {

            var hasRequireAuth = toState.require &&
                (toState.require.auth !== undefined || toState.require.noAuth !== undefined);
            var requiresAuth = hasRequireAuth && toState.require.auth;
            var requiresNoAuth = hasRequireAuth && toState.require.noAuth;

            var currentUser = $rootScope.user;

            if (requiresAuth && requiresNoAuth)
                console.error("Lógica de estado incongruente. Estado requiere autenticación y no autenticación.");

            if (!requiresNoAuth && !requiresAuth && currentUser !== undefined) // No se fuerza un estado con autenticación
                return;

            if (requiresAuth && currentUser)
                return;

            if (requiresNoAuth && currentUser === null)
                return;

            if (requiresAuth && currentUser === null) {
                e.preventDefault();
                $state.go('login', toParams);
                return;
            }

            if (requiresNoAuth && currentUser) {
                e.preventDefault();
                $state.go(fromState || 'home', fromParams);
                return;
            }

            e.preventDefault();

            $http.get('/api/user')
            .then(function (user) {

                $rootScope.user = user;

                if (requiresNoAuth) {
                    $state.go(fromState || 'home', fromParams);
                    return;
                }

                // if (requiresAuth) o es un estado que no impone tipo de auth
                $state.go(toState, toParams);
            })
            .catch(function () {

                $rootScope.user = null;

                if (requiresAuth) {
                    $state.go('login', toParams);
                    return;
                }

                // if (requiresNoAuth) o es un estado que no impone tipo de auth
                $state.go(toState, toParams);
            });
        })
	}
]);

app.controller('appCtrl', ['$scope', '$state', 
	function ($scope, $state) {
		// DEBUG
		window.$scope = $scope;
		// window.$state = $state;
	}
]);

app.controller('profileCtrl', ['$scope', '$http',
	function ($scope, $http) {

	}
]);

app.controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$state',
	function ($scope, $rootScope, $http, $state) {

		if ($rootScope.user)
			return $state.go('home');

		$scope.name = "";
		$scope.email = "";
		$scope.password = "";
		$rootScope.user = null;
		$scope.password1 = "";
		$scope.password2 = "";
		$scope.error = "";

		var validate = function (name, email, password1, password2) {
			/* TODO */
			if (!name || name.length < 1) {
				$scope.error = "name";
				return false;
			}
			if (!email || email.length < 1) {
				$scope.error = "email";
				return false;
			}
			if (!password1 || password1 < 1) {
				$scope.error = "password1";
				return false;
			}
			if (password1 != password2) {
				$scope.error = "password2";
				return false;
			}
			$scope.error = "";
			return true;
		}

		$scope.signUp = function (name, email, password1, password2) {
			if (validate(name, email, password1, password2)) {
				$http.post('/api/user/new', {
					name: name,
					email: email,
					password1: password1,
					password2: password2
				})
				.then(function (user) {
					console.log(user);
					swal({
						title: 'Done!',
						text: 'You signed up as ' + name,
						type: 'success',
						confirmButton: 'Ok'
					}, function () {
						$state.go('login');
					});
				})
				.catch(function (err) {
					console.log(err);
					if (err.code == 1)
						sweetAlert("Oops...", "A user with email " + email + " already exist!", "error");
					else
						sweetAlert("Error!", err.message, "error");
				});
			}
		}

		$scope.login = function (email, password) {
			$http.post('/api/user', {
				email: email,
				password: password
			})
			.then(function (user) {
				swal({
					title: 'Good!',
					text: 'You logged in as ' + email,
					type: 'success',
					confirmButton: 'Ok'
				}, function () {
					$rootScope.user = user;
					$state.go('home');
				})
			})
			.catch(function (err) {
				sweetAlert("Error!", err.message, "error");
			});
		}
	}
]);


app.controller('teamsCtrl', ['$scope', '$http', '$state', '$stateParams',
	function ($scope, $http, $state, $stateParams) {
		
		window.$scope = $scope;
		$scope.teams = null;
		$scope.team = null;
		$scope.teamName = null;
		$scope.channels = null;
		$scope.users = null;

		var init = function() {
			getTeams();

			if ($stateParams.team)
				getTeam($stateParams.team);
		}

		var getTeams = function() {
			$http.get('/api/user/teams')
			.then(function (data) {
				if (data.length)
					$scope.teams = data;
			})
			.catch(function (err) {
				console.log("Error al obtener los equipos del usuario: " + err);
			});
		};

		var getTeam = function(teamID) {
			$http.get('/api/team/' + teamID)
			.then(function (data) {
				$scope.team = data.id;
				$scope.teamName = data.name;

				if (data.channels.length)
					$scope.channels = data.channels;

				if (data.users.length)
					$scope.users = data.users;

				$state.go('team');
			})
			.catch(function (err) {
				console.log("Error al obtener el equipo solicitado: " + err);
			});
		};

		// var getUsers = function(teamID) {
		// 	$http.get('/api/team/' + teamID + '/users')
		// 	.then(function (data) {
		// 		if (data.users.length)
		// 			$scope.users = data.users;
		// 		else
		// 			$scope.users = null;
		// 	})
		// 	.catch(function (err) {
		// 		console.log("Error al obtener los usuarios del equipo: " + err);
		// 	});
		// };

		$scope.create = function(teamName) {
			$http.post('/api/team/create', {
				name: teamName
			})
			.then(function (team) {
				swal({
					title: 'Good!',
					text: 'Team created successfully',
					type: 'success',
					confirmButton: 'Ok'
				}, function () {
					//$scope.team = team;
					$state.go('teams');
				})
			})
			.catch(function (err) {
				sweetAlert("Error!", err.message, "error");
			});
		};

		init();
	}
]);

app.controller('channelsCtrl', ['$scope', '$state', '$http', '$stateParams',
	function ($scope, $state, $http, $stateParams) {
		
		window.$scope = $scope;

		/* var init = function() {
			if ($stateParams.channel)
				getChannel($stateParams.channel);
		} */

		var getChannel = function(channelID) {
			$http.get('/api/channel/' + channelID)
			.then(function (data) {
				console.log(data)
			})
			.catch(function (err) {
				sweetAlert("Error!", err.message, "error");
			});
		}

		$scope.create = function(channelName) {

			$http.post('/api/channel/create', {
				name: channelName,
				team: $stateParams.team
			})
			.then(function (team) {
				swal({
					title: 'Good!',
					text: 'Channel created successfully',
					type: 'success',
					confirmButton: 'Ok'
				}, function () {
					//$scope.team = team;
					$state.go('team', { team: $stateParams.team });
				})
			})
			.catch(function (err) {
				sweetAlert("Error!", err.message, "error");
			})
		};
	}
]);

app.controller('licodeCtrl', ['$scope', '$state', '$http',
	function ($scope, $state, $http) {
		// var localStream;

		// var createToken = function(role, cb) {
		// 	$http.post('/api/licode/create_token', {
		// 		role: role
		// 	})
		// 	.then()
		// 	.catch();
		// }

		// localStream.addEventListener("access-accepted", function () {
		// 	console.log("Access accepted");
		// 	var subscribeToStreams = function(streams) {
		// 		for (var i in streams) {
		// 			var stream = streams[i];
		// 			room.subscribe(stream);
		// 		}
		// 	}
		// });

		// localStream.init();
	}
]);