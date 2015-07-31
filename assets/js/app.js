var app = angular.module('app', [
	'ui.router'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
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
			controller: 'appCtrl'
		})
		.state('profile', {
			url: '/profile',
			templateUrl: 'partials/profile.html'
		})
		.state('test-licode', {
			url: '/test-licode',
			templateUrl: 'partials/test_licode.html',
			controller: 'licodeCtrl'
		})
		.state('login', {
			url: '/login',
			templateUrl: 'partials/login.html',
			controller: 'AuthCtrl'
		})
		.state('logout', {
			url: '/logout',
			controller: 'AuthCtrl'
		})

});

app.controller('appCtrl', ['$scope', '$http', '$state',
	function ($scope, $http, $state) {

		// DEBUG
		// window.$scope = $scope;
		// window.$state = $state;

		$scope.email = "";
		$scope.password1 = "";
		$scope.password2 = "";
		$scope.error = "";

		var validate = function (email, password1, password2) {
			/* TODO */
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

		$scope.signUp = function (email, password1, password2) {
			if (validate(email, password1, password2)) {
				$http.post('/api/users/new', {
					email: email,
					password1: password1,
					password2: password2
				})
				.success(function (user) {
					if (user.code == 0) {
						swal({
							title: 'Done!',
							text: 'You signed up as ' + email,
							type: 'success',
							confirmButton: 'Ok'
						}, function () {
							$state.go('login');
						});
					}
					else if (user.code == 1)
						sweetAlert("Oops...", "A user with email " + email + " already exist!", "error");
				})
				.error(function (err) {
					if (user.code > 1)
						sweetAlert("Error!", err, "error");
				});
			}
		}
	}
]);

app.controller('AuthCtrl', ['$scope', '$http', '$state',
	function ($scope, $http, $state) {

		$scope.email = "";
		$scope.password = "";

		$scope.login = function (email, password) {
			$http.post('/api/users/login', {
				email: email,
				password: password
			})
			.success(function (user) {
				console.log(user);
				swal({
					title: 'Good!',
					text: 'You logged in as ' + email,
					type: 'success',
					confirmButton: 'Ok'
				}, function () {
					$state.go('home');
				});
			})
			.error(function (err) {
				sweetAlert("Error!", err, "error");
			});
		}
	}
]);

app.controller('licodeCtrl', ['$scope', '$state',
	function ($scope, $state) {
		// var serverUrl = "/";
		// var localStream;
		// var room;

		// var getParameterByName = function (name) {
		// 	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		// 	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
		// 	var results = regex.exec(location.search);

		// 	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		// }

		// var printText = function (text) {
		// 	$scope.messages += '- ' + text + '\n';
		// }

		// var init = function () {
		// 	var config = {
		// 		audio: true,
		// 		video: true,
		// 		data: true,
		// 		videoSize: [640, 480, 640, 480]
		// 	};

		// 	localStream = Erizo.Stream(config);

		// 	var createToken = function (username, role, callback) {

		// 		var req = new XMLHttpRequest();
		// 		var url = serverUrl + 'createToken/';
		// 		var body = {
		// 			username: username,
		// 			role: role
		// 		};

		// 		req.onreadystatechange = function () {
		// 			if (req.readyState === 4)
		// 				callback(req.responseText);
		// 		};

		// 		req.open('POST', url, true);
		// 		req.setRequestHeader('Content-Type', 'application/json');
		// 		req.send(JSON.stringify(body));
		// 	};

		// 	createToken("user", "presenter", function (response) {
		// 		var token = response;
		// 		console.log(token);
		// 		room = Erizo.Room({ token: token });

		// 		localStream.addEventListener("access-accepted", function () {
		// 		printText('Mic and Cam OK');

		// 		var subscribeToStreams = function (streams) {
		// 			for (var i in streams) {
		// 				var stream = streams[i];
		// 				room.subscribe(stream);
		// 			}
		// 		};

		// 		room.addEventListener("room-connected", function (roomEvent) {
		// 			printText('Connected to the room OK');
		// 			room.publish(localStream, { maxVideoBW: 300 });
		// 		});

		// 		room.addEventListener("stream-subscribed", function (streamEvent) {
		// 			printText('Subscribed to your local stream OK');
		// 			var stream = streamEvent.stream;
		// 			stream.show("my_subscribed_video");
		// 		});

		// 		room.addEventListener("stream-added", function (streamEvent) {
		// 			printText('Local stream published OK');
		// 			var streams = [];
		// 			streams.push(streamEvent.stream);
		// 			subscribeToStreams(streams);
		// 		});

		// 		room.addEventListener("stream-removed", function (streamEvent) {
		// 			// Remove stream from DOM
		// 			var stream = streamEvent.stream;
		// 			if (stream.elementID !== undefined) {
		// 				var element = document.getElementById(stream.elementID);
		// 				document.body.removeChild(element);
		// 			}
		// 		});

		// 		room.addEventListener("stream-failed", function (streamEvent) {
		// 			console.log("STREAM FAILED, DISCONNECTION");
		// 			printText('STREAM FAILED, DISCONNECTION');
		// 			room.disconnect();
		// 		});

		// 		room.connect();

		// 		localStream.show("my_local_video");

		// 		});
		// 		localStream.init();
		// 	});
		// };
	}
]);