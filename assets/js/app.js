var app = angular.module('app', ['ui.router', '$q-spread']);

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
                views: {
                    'content': {
                        templateUrl: 'partials/signup.html',
                        controller: 'AuthCtrl'
                    }
                },
                require: { noAuth: true }
            })
            .state('login', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: 'partials/login.html',
                        controller: 'AuthCtrl'
                    }
                },
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
            .state('settings', {
                url: '/settings',
                views: {
                    'content': {
                        templateUrl: 'partials/settings.html'
                    }
                },
                require: { auth: true }
            })
            .state('team', {
                url: '/team/:team',
                views: {
                    'side-menu': {
                        templateUrl: 'partials/side_menu.html',
                        controller: 'sideMenuCtrl'
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
            .state('teams_invite', {
                url: '/team/:team/invite',
                views: {
                    'content': {
                        templateUrl: 'partials/teams/team_invite.html',
                        controller: 'teamsCtrl'
                    }
                },
                require: { auth: true }
            })
            .state('channel', {
                url: '/channel/:channel',
                views: {
                    'side-menu': {
                        templateUrl: 'partials/side_menu.html',
                        controller: 'sideMenuCtrl'
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
            .state('call', {
                url: '/call/:channel',
                views: {
                    'content': {
                        templateUrl: 'partials/sip/call.html',
                        controller: 'sipCtrl'
                    }
                }
            })
            .state('videocall', {
                url: '/videocall/:channel',
                views: {
                    'content': {
                        templateUrl: 'partials/licode/videocall.html',
                        controller: 'licodeCtrl'
                    }
                },
                require: { auth: true }
            });

        /*
         * Interceptor de respuestas HTTP
         * 
         * Para adaptar las respuestas del servidor al formato definido en la API,
         * descrito en responses/api_error.js y responses/api_ok.js
         */
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
    }]
);

app.run(['$rootScope', '$http', '$state',
    function ($rootScope, $http, $state) {
        /*
         * $rootScope.user = undefined -> No sé aún nada sobre el usuario.
         * $rootScope.user = null -> No hay usuario ni sesión en el lado del servidor.
         * $rootScope.user = something -> Este es nuestro usuario actual.
         */
        $rootScope.user = undefined;
        /*
         * --- TODO: Subscribe to all rooms ---
         *
         * $rootScope.rooms = [];
         * $rootScope.rooms
         * .then(function (rooms) {
         *     var tokens = [];
         *     rooms.forEach(function (room) {
         *         tokens.push($http.post('/api/licode/token/create/' + room, {
         *             role: 'viewer'
         *         }));
         *     });
         *     return $q.all([rooms, tokens]);
         * })
         * .spread(function (rooms, tokens) {
         *     rooms.forEach(function (room, idx) {
         *         room = Erizo.Room({ token: tokens[idx] });
         * 
         *         room.connect();
         *     })
         * })
         *
         * ------------------------------------
         */

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
        });

        // $rootScope.rooms = $http.get('/api/licode/rooms');
    }]
);

app.controller('appCtrl', ['$scope', '$state', 
    function ($scope, $state) {
        // DEBUG
        // window.$scope = $scope;
        $state.go('teams');
    }
]);

app.controller('profileCtrl', ['$scope', '$http',
    function ($scope, $http) {

    }]
);

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
                    console.error(err);
                    if (err.code == 1)
                        sweetAlert("Error!", "A user with email " + email + " already exist!", "error");
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
                });
            })
            .catch(function (err) {
                if (err.code == 6)
                    sweetAlert("Error!", err.message, "error");
                else
                    console.log(err);
            });
        }
    }]
);

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
                console.error("Error al obtener los equipos del usuario: " + err);
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

                //$state.go('team');
            })
            .catch(function (err) {
                console.error("Error al obtener el equipo solicitado: " + err);
            });
        };

        $scope.invite = function(user, team) {
            $http.put('/api/team/' + team + '/join', {
                user: user
            })
            .then(function (team) {
                swal({
                    title: 'Good!',
                    text: 'A new user joined the team!',
                    type: 'success',
                    confirmButton: 'Ok'
                }, function () {
                    $state.go('teams');
                })
            })
            .catch(function (err) {
                sweetAlert("Error!", err.message, "error");
            });
        }

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
                    $state.go('teams');
                })
            })
            .catch(function (err) {
                sweetAlert("Error!", err.message, "error");
            });
        };

        init();
    }]
);

app.controller('channelsCtrl', ['$rootScope', '$scope', '$state', '$http', '$stateParams', '$q',
    function ($rootScope, $scope, $state, $http, $stateParams, $q) {
        
        window.$scope = $scope;
        $scope.data = null;
        $scope.channel = null;
        $scope.channelCreatedAt = null;
        $scope.team = null;
        $scope.teamName = null;
        $scope.users = null;
        $scope.msgHistory = [];
        
        /*
         * --- TODO: FILTER LIMIT ---
         * 
         * $scope.msgLimit = 10;
         * $scope.limitBegin = 0;
         *
         * document.getElementById('board').addEventListener("scroll", function (event) {
         *     if (event.srcElement.scrollTop == 0) {
         *         setTimeout(function () { 
         *             $scope.msgLimit += 10;
         *             $scope.limitBegin = ($scope.limitBegin > $scope.msgLimit)? ($scope.limitBegin - 10) : 0;
         *             $scope.$apply();
         *         }, 1000);
         *     }
         * });
         * 
         * --------------------------
         */

        var init = function() {
            if ($stateParams.channel) {
                getChannel($stateParams.channel)
                .then(function (channel) {

                    $http.post('/api/licode/sipsession', {
                        room: channel.room
                    });

                    createToken(channel.room, 'presenter', function (token) {
                        var localStream = Erizo.Stream({
                            audio: false,
                            video: false,
                            data: true,
                            attributes: {
                                type: 'sipstream'
                            }
                        });

                        room = Erizo.Room({ token: token });

                        localStream.addEventListener("access-accepted", function () {
                            var stream;

                            var subscribeToStreams = function(streams) {
                                for (var i in streams) {
                                    room.subscribe(streams[i]);
                                }
                            }
                            
                            room.addEventListener("room-connected", function (roomEvent) {
                                room.publish(localStream);
                                subscribeToStreams(roomEvent.streams);
                            });

                            room.addEventListener("stream-subscribed", function (streamEvent) {
                                stream = streamEvent.stream;
                                stream.addEventListener("stream-data", function (streamEvent) {
                                    $scope.msgHistory.push({
                                        author: streamEvent.msg.author,
                                        data: streamEvent.msg.text,
                                        time: moment(streamEvent.msg.timestamp).format("HH:mm:ss"),
                                        day: moment(streamEvent.msg.timestamp).format('Do MMMM'),
                                        createdAt: streamEvent.msg.timestamp
                                    });
                                    /*
                                     * --- TODO: notify messages ---
                                     *
                                     * if (streamEvent.msg.authorID != $rootScope.user.id) {
                                     *     var ch = 'ch' + streamEvent.msg.channelID;
                                     *     document.getElementById(ch).style.display = 'inline';
                                     * }
                                     *
                                     * -----------------------------
                                     */
                                    $scope.$apply();
                                    document.getElementById('board').scrollTop = document.getElementById('board').scrollHeight;
                                });
                            });
                            
                            room.addEventListener("stream-attributes-update", function (streamEvent) {
                                stream = streamEvent.stream;
                            });

                            room.addEventListener("stream-added", function (streamEvent) {
                                var streams = [];
                                streams.push(streamEvent.stream);
                                subscribeToStreams(streams);
                                if (streamEvent.stream.hasVideo() || streamEvent.stream.hasAudio()) {
                                    swal({
                                        title: "Incoming call",
                                        text:'In channel ' + $scope.channel.name + '. Enter?',
                                        type: "info",
                                        showCancelButton: true,
                                        confirmButtonText: "Yes",
                                        cancelButtonText: "No",
                                        closeOnConfirm: true,
                                        closeOnCancel: true,
                                        showLoaderOnConfirm: true
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            $scope.videocall($stateParams.channel);
                                        }
                                    });
                                }
                            });

                            $scope.sendMsg = function (msg) {
                                if (msg && msg.length) {
                                    $http.post('/api/message/push/' + $stateParams.channel, {
                                        data: msg
                                    })
                                    .then(function (message) {
                                        localStream.sendData({
                                            text: msg,
                                            timestamp: new Date(),
                                            author: $rootScope.user.name,
                                            authorID: $rootScope.user.id,
                                            channelID: $stateParams.channel
                                        });
                                        $scope.chatMsg = null;
                                    })
                                    .catch(function (err) {
                                        sweetAlert("Error!", err.message, "error");
                                    });
                                }
                            }

                            $scope.videocall = function(channelID) {
                                room.unsubscribe(stream);
                                room.unpublish(localStream);
                                localStream.close();
                                room.disconnect();
                                $state.go('videocall', { channel: channelID });
                            }

                            $scope.call = function(channelID) {
                                room.unsubscribe(stream);
                                room.unpublish(localStream);
                                localStream.close();
                                room.disconnect();
                                $state.go('call', { channel: channelID });
                            }
                            room.connect();
                        });
                        // FILTER LIMIT
                        // $scope.limitBegin = (($scope.msgHistory.length - $scope.msgLimit) > 0)? ($scope.msgHistory.length - $scope.msgLimit) : 0;
                        localStream.init();
                        document.getElementById('board').scrollTop = document.getElementById('board').scrollHeight;
                    });


                })
                .catch(function (err) {
                    sweetAlert("Error!", err.message, "error");
                });
            }
        }

        var getChannel = function(channelID) {
            return $http.get('/api/channel/' + channelID)
            .then(function (data) {
                $scope.data = data;
                $scope.channel = data.channel;
                $scope.channelCreatedAt = moment(data.channel.createdAt).format("Do MMMM, YYYY");
                $scope.team = data.team;
                $scope.teamName = data.team.name;
                $scope.users = data.team.users;

                var messages = $http.get('/api/messages/' + channelID);

                return $q.all([data.channel, messages]);
            })
            .spread(function (channel, messages) {
                messages.forEach(function (msg) {
                    $scope.msgHistory.push({
                        author: msg.author.name,
                        data: msg.data,
                        time: moment(msg.createdAt).format('HH:mm:ss'),
                        day: moment(msg.createdAt).format('Do MMMM'),
                        year: moment(msg.createdAt).format('YYYY'),
                        createdAt: msg.createdAt
                    });
                });
                return channel; 
            });
        }
        
        var createToken = function(room, role, cb) {
            return $http.post('/api/licode/token/create/' + room, {
                role: role
            })
            .then(cb)
            .catch(function (err) {
                sweetAlert("Error!", err.message, "error");
            });
        }

        $scope.create = function(channelName, description) {
            $http.post('/api/licode/room/create', {
                name: (channelName + 'Room').replace(' ', '_')
            })
            .then(function (room) {
                //$rootScope.rooms.push(room);
                var channelBody = {
                    name: channelName,
                    team: $stateParams.team,
                    room: room,
                    desc: description
                };
                var channel = $http.post('/api/channel/create', channelBody);

                return $q.all([room, channel]);
            })
            .spread(function (room, channel) {
                swal({
                    title: 'Good!',
                    text: 'Channel created successfully',
                    type: 'success',
                    confirmButton: 'Ok'
                }, function () {
                    $state.go('team', { team: $stateParams.team });
                });
            })
            .catch(function (err) {
                sweetAlert("Error!", err.message, "error");
            });
        };

        init();
    }]
);

app.controller('sideMenuCtrl', ['$scope', '$state', '$stateParams', '$http',
    function ($scope, $state, $stateParams, $http) {
        $scope.users = null;
        $scope.team = null;
        $scope.teamName = null;
        $scope.channel = null;
        $scope.channels = null;

        var init = function() {
            if ($stateParams.team) {
                getTeam($stateParams.team);
            }
            if ($stateParams.channel) {
                getChannel($stateParams.channel);
            }
        }

        var getTeam = function(teamID) {
            $http.get('/api/team/' + teamID)
            .then(function (data) {
                $scope.teamName = data.name;

                if (data.channels.length)
                    $scope.channels = data.channels;

                if (data.users.length)
                    $scope.users = data.users;

                //$state.go('team');
            })
            .catch(function (err) {
                console.error("Error al obtener el equipo solicitado: " + err);
            });
        };

        var getChannel = function(channelID) {
            $http.get('/api/channel/' + channelID)
            .then(function (data) {
                $scope.channel = data.channel;
                $scope.team = data.team;
                $scope.users = data.team.users;
                
                var team = $http.get('/api/team/' + data.team.id);
                return team;
            })
            .then(function (team) {
                $scope.channels = team.channels;
            })
            .catch(function (err) {
                sweetAlert("Error!", err.message, "error");
            });
        }
        init();
    }]
);

app.controller('licodeCtrl', ['$scope', '$state', '$stateParams', '$http',
    function ($scope, $state, $stateParams, $http) {
        window.$scope = $scope;
        $scope.streams = [];
        $scope.stream = null;
        $scope.localStream = null;
        $scope.endCall = null;
        $scope.isRecording = false;
        $scope.record = null;
        $scope.stopRecord = null;
        $scope.recordID = null;
        $scope.loadingLocal = true;
        $scope.loadingFirst = true;

        var init = function () {
            document.getElementById('container-side').style.display = "none";
            document.getElementById('content-side').style.display = "none";
            $http.get('/api/channel/' + $stateParams.channel)
            .then(function (data) {
                var roomID = data.channel.room;
                var room = $http.get('/api/licode/room/' + roomID);
                return room;
            })
            .then(function (room) {
                var token = $http.post('/api/licode/token/create/' + room._id, { role: 'presenter' });
                return token;
            })
            .then(startCall)
            .catch(function (err) {
                sweetAlert("Error!", "Something went wrong", "error");
                console.error(err);
            });
        }

        var startCall = function (token) {
            var localStream;
            var config = { audio: true, video: true, data: true };

            localStream = Erizo.Stream(config);
            var room = Erizo.Room({ token: token });

            localStream.addEventListener("access-accepted", function () {
                var stream = null;
                $scope.localStream = localStream;

                var timeOut = setTimeout(function () {
                    swal({
                        title: "You seem to be alone",
                        text:'Try again?',
                        type: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }, function (isConfirm) {
                        room.unsubscribe(stream);
                        room.unpublish(localStream, function (result, err) {
                            if (result === undefined)
                                console.error("Error unpublishing: ", err);
                            else
                                console.log("Stream unpublished!");
                            console.log("Stream unpublished:", result)
                        });
                        localStream.close();
                        room.disconnect();

                        if (isConfirm)
                            init();
                        else
                            $state.go('channel', { channel: $stateParams.channel });
                    });
                }, 20000);

                $scope.endCall = function () {
                    clearTimeout(timeOut);
                    swal({
                        title: "End call?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }, function (isConfirm) {
                        if (isConfirm) {
                            room.unsubscribe(stream);
                            room.unpublish(localStream, function (result, err) {
                                if (result === undefined)
                                    console.error("Error unpublishing: ", err);
                                else
                                    console.log("Stream unpublished!");
                                console.log("Stream unpublished:", result)
                            });
                            localStream.close();
                            room.disconnect();
                            document.getElementById('container-side').style.display = "block";
                            document.getElementById('content-side').style.display = "block";
                            $state.go('channel', { channel: $stateParams.channel });
                        }
                    });
                }

                $scope.record = function () {
                    room.startRecording(stream, function (recordingId, error) {
                        if (recordingId === undefined)
                            sweetAlert("Error!", error, "error");
                        else {
                            $http.post('/api/video/record', {
                                channel: $stateParams.channel,
                                url: '/tmp/',
                                recordId: recordingId
                            })
                            .then(function (video) {
                                console.log('Video:', video);
                                Materialize.toast('Recording...', 5000);
                                $scope.recordID = video.recordId;
                                $scope.isRecording = true;
                                console.log("Recording started, the id of the recording is ", $scope.recordID);
                            });
                        }
                    });
                }

                $scope.stopRecord = function () {
                    room.stopRecording($scope.recordID, function (result, error) {
                        if (result === undefined)
                            sweetAlert("Error!", error, "error");
                        else {
                            $scope.isRecording = false;
                            $scope.$apply();
                            console.log("Stopped recording!");
                        }
                    });
                }

                var subscribeToStreams = function(streams) {
                    for (var i in streams) {
                        var stream = streams[i];
                        room.subscribe(stream);
                    }
                }

                room.addEventListener("room-connected", function (roomEvent) {
                    room.publish(localStream, { maxVideoBW: 300 });
                    roomEvent.streams.forEach(function (stream) {
                        $scope.streams.push(stream);
                    });
                    subscribeToStreams(roomEvent.streams);
                });

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    stream = streamEvent.stream;
                    $scope.stream = stream;
                    if (stream.getID() == localStream.getID()) {
                        $scope.loadingLocal = false;
                        $scope.$apply();
                        stream.show("my-video");
                    }
                    else if (stream.pc) {
                        console.log("awfqfqef");
                        clearTimeout(timeOut);
                        $scope.loadingFirst = false;
                        $scope.$apply();
                        stream.show("video" + stream.getID());
                    }
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    $scope.streams.push(streamEvent.stream);
                    subscribeToStreams($scope.streams);
                });

                room.addEventListener("stream-removed", function (streamEvent) {

                });

                room.addEventListener("stream-failed", function (streamEvent){
                    console.log("STREAM FAILED, DISCONNECTION");
                    room.disconnect();
                });

                room.connect();
            });
            localStream.init();
        }

        var getParameterByName = function (name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            var results = regex.exec(location.search);
            return (results == null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        init();
    }]
);

app.controller('sipCtrl', ['$scope', '$state', '$stateParams', '$http',
    function ($scope, $state, $stateParams, $http) {
        
        console.log("Iniciando sesión SIP...");

        var room;

        var init = function() {
            $http.get('/api/channel/' + $stateParams.channel)
            .then(function (data) {
                var roomID = data.channel.room;
                var ch_room = $http.get('/api/licode/room/' + roomID);
                return ch_room;
            })
            .then(function (room) {
                var token = $http.post('/api/licode/token/create/' + room._id, { role: 'presenter' });
                return token;
            })
            .then(startSipCall)
            .catch(function (err) {
                sweetAlert("Error!", "Something went wrong", "error");
                console.error(err);
            });
        }

        var startSipCall = function(token) {
            var config = {
                audio: false,
                video: false,
                data: true,
                attributes: {
                    type: 'sipstream'
                }
            };

            var localStream = Erizo.Stream(config);

            room = Erizo.Room({ token: token });

            room.addEventListener("stream-added", function (event) {
                console.log('New stream added:', event.stream.getID());
                //TODO: Currently we only subscribe when we have established a publish call
                var streams = [];

                streams.push(event.stream);
                subscribeToStreams(streams);
                /*
                if (localId!==undefined && localId!==event.stream.getID()){ 
                console.log("Disparando subscribe desde erizo");
                theSession.subscribeFromErizo({}, event.stream)
                };
                */
            });
            
            $http.post('/api/sipsession/', { spec: { room: room } })
            .then(function () {
                console.log("Trying to connect to room...");
                room.addEventListener("room-connected", function (event) {
                    console.log("stream:", localStream);
                    $http.post('/api/sipsession/publishconf', {
                        stream: localStream
                    })
                    .then(function() {
                        console.log("\nSubscribing\n");
                        subscribeToStreams(event.streams);
                    })
                    .catch(console.log  );
                });
                room.connect();
            })
            .catch(console.log);
        }

        var subscribeToStreams = function (streams) {
            // for (var stream in streams) {
            //     var theStream = streams[stream];
            //     console.log("Stream:", theStream);
            //     if (localStream.getID() !== theStream.getID()) {
            //         $http.post('/api/sipsession/subscribe', {
            //             stream: theStream
            //         })
            //         .catch(console.log);
            //     }
            //}
        };

        init();
    }]
);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});