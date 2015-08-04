var app = angular.module('app', [
	'ui.router'
]);

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'partials/index.html',
			controller: 'appCtrl'
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
			templateUrl: 'partials/profile.html',
			controller: 'profileCtrl',
			require: { auth: true }
		})
		.state('teams', {
			url: '/teams',
			temapleUrl: 'partials/teams.html',
			controlle: 'teamsCtrl',
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

		if (serverResponse.code !== 0)
			throw serverResponse;

		response.data = serverResponse.data;
		return response.data;
	}

	$httpProvider.interceptors.push(function() {
		return { response: transformResponse }
	});

});

app.run(['$rootScope', '$http', '$state',
	function ($rootScope, $http, $state) {
    	/*
        $rootScope.user = undefined -> No se aun nada sobre el usuario.
        $rootScope.user = null -> No hay usuario ni sesion en el lado del servidor.
        $rootScope.user = something -> Ese es nuestro user actual.
        */
        $rootScope.user = undefined;

        $rootScope.logout = function () {
			$http.delete('/api/users')
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

            $http.get('/api/users')
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

app.controller('appCtrl', ['$scope', '$http', '$state', 
	function ($scope, $http, $state) {
		// DEBUG
		window.$scope = $scope;
		// window.$state = $state;
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
			if (!password1 || password1 <1) {
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
				$http.post('/api/users/new', {
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
			$http.post('/api/users', {
				email: email,
				password: password
			})
			.then(function (user) {
				console.log("Usuario: " + JSON.stringify(user));
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

app.controller('profileCtrl', ['$scope', '$http',
	function ($scope, $http) {

	}
]);

app.controller('teamsCtrl', ['$scope', '$http',
	function ($scope, $http) {
		
		$scope.teams = {};

		var getTeams = function() {
			$http.get('/api/user/teams')
			.then(function (teams) {
				$scope.teams = teams;
			})
			.catch(function (err) {
				console.log("Error al obtener los equipos del usuario: " + err);
			})
		}
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