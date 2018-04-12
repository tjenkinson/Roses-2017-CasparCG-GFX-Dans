var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General',
            url: '/general',
            type: 'link',
            icon: 'settings',
        });

        $scope.menu.push({
            name: 'Top Right',
            url: '/topright',
            type: 'link',
            icon: 'violet list layout'
        });

        $scope.menu.push({
            name: 'Bottom Right',
            url: '/bottomright',
            type: 'link',
            icon: 'teal grid layout',
        });

        $scope.menu.push({
            name: 'Bottom Left',
            url: '/bottomleft',
            type: 'link',
            icon: 'yellow trophy',
        });

        $scope.menu.push({
            name: 'Bottom Center',
            url: '/bottomcenter',
            type: 'link',
            icon: 'olive users',
        });

        $scope.menu.push({
            name: 'Ticker',
            url: '/ticker',
            type: 'link',
            icon: 'soccer',
        });

    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('la1tv');

        $routeProvider
            .when("/general", {
                templateUrl: '/admin/templates/general.tmpl.html',
                controller: 'generalCGController'
            })
            .when("/topright", {
                templateUrl: '/admin/templates/topRight.tmpl.html',
                controller: 'topRightCGController'
            })
            .when("/bottomright", {
                templateUrl: '/admin/templates/bottomRight.tmpl.html',
                controller: 'bottomRightCGController'
            })
            .when("/bottomleft", {
                templateUrl: '/admin/templates/bottomLeft.tmpl.html',
                controller: 'bottomLeftCGController'
            })
            .when("/bottomcenter", {
                templateUrl: '/admin/templates/bottomCenter.tmpl.html',
                controller: 'bottomCenterCGController'
            })
            .when("/ticker", {
                templateUrl: '/admin/templates/ticker.tmpl.html',
                controller: 'tickerCGController'
            })
            .otherwise({redirectTo: '/general'});
    }
]);


app.controller('generalCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("bug", function (msg) {
            $scope.general = msg;
        });

        $scope.$watch('general', function() {
            if ($scope.general) {
                socket.emit("bug", $scope.general);
            } else {
                getBugData();
            }
        }, true);
        
        socket.on("bug", function (msg) {
            $scope.bug = msg;
        });
        
        function getBugData() {
            socket.emit("bug:get");
        }
    }
]);

app.controller('topRightCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });

        $scope.$watch('topRight', function() {
            if ($scope.topRight) {
                socket.emit("topRight", $scope.topRight);
            } else {
                getTopRightData();
            }
        }, true);
        
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });
        
        function getTopRightData() {
            socket.emit("topRight:get");
        }
    }
]);

app.controller('bottomRightCGController', ['$scope', 'socket', '$http', 'localStorageService',
    function($scope, socket, $http, localStorageService) {
        socket.on("bottomRight", function (msg) {
            $scope.bottomRight = msg;
            if(msg.rows == null){
                $scope.getFromStored();
                $scope.updateSelectables();
            }
        });

        $scope.$watch('bottomRight', function() {
            if ($scope.bottomRight) {
                // This will make the thing update live, which we don't want
                // socket.emit("bottomRight", $scope.bottomRight);
            } else {
                getbottomRightData();
            }
        }, true);
        
        socket.on("bottomRight", function (msg) {
            $scope.bottomRight = msg;
        });
        
        function getbottomRightData() {
            socket.emit("bottomRight:get");
        }
        
        function countDownbottomRight() {
       	    console.log("countDownbottomRight");

       	    setInterval(function(){
				var end = $scope.bottomRight.nextonTime;
				var now = new Date();
				var timeBetween = end - now;
				var hours = timeBetween.getHours();
				var minutes = timeBetween.getMinutes();
				var seconds = timeBetween.getSeconds();
				$scope.bottomRight.nextonCountdown = hours + ":" + minutes + " : " + seconds;
			}, 1000);
        }
        
        $scope.getFromStored = function() {
            var stored = localStorageService.get('bottomRight.rows');
            $scope.bottomRight.rows = stored;
            if(stored == null){
                console.log("Nothing to get from local storage.");
            } else {
                console.log("Getting data from store");
            }
        }
        
        $scope.add = function() {
            if(!$scope.bottomRight.rows){
                $scope.bottomRight.rows = [];
            }
            $scope.bottomRight.rows.push({left:'', right:'', change: '', color: ''});
        };

        $scope.remove = function(index){
            $scope.bottomRight.rows.splice(index, 1);
            return localStorageService.set('bottomRight.rows',$scope.bottomRight.rows);  
        };

        $scope.showbottomRight = function() {
            $scope.bottomRight.show = true;
            socket.emit('bottomRight', $scope.bottomRight);
            console.log($scope.bottomRight);
        };

        $scope.hidebottomRight = function() {
            $scope.bottomRight.show = false;
            socket.emit('bottomRight', $scope.bottomRight);
            console.log("Hide bottomRight");
        };
        
        $scope.locationChosen = function() {
            $scope.updateSelectables($scope.bottomRight.chosenLocation)
        }
        $scope.sportChosen = function() {
            $scope.updateSelectables($scope.bottomRight.chosenLocation,$scope.bottomRight.chosenSport)
        }
        $scope.groupChosen = function() {
            console.log("Group Chosen");
        }
        $scope.broadcastChosen = function() {
            console.log("Broadcast Chosen");
        }
        
        $scope.updateSelectables = function (location,sport,group,broadcast) {
            if(!location){
                console.log('Getting Selectable Values');
            }
            var fetchData = function () {
                var config = {headers:  {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
            };
            $http.get('/data/fixtures.json', config).then(function (response) {
						$scope.bottomRight.livebottomRight = response.data;   
				   	    
				   	    $scope.bottomRight.options = ["sport","group","points","location","time","broadcast","none"];
				   	    
				   	    // Sort out locations
				   	    if(!location || location == "All"){
                            var locations = Array(); 
                            for(var i = 0; i < $scope.bottomRight.livebottomRight.length; i++){
                                if(locations.indexOf($scope.bottomRight.livebottomRight[i].location) == -1){
                                    locations.push($scope.bottomRight.livebottomRight[i].location);
                                }
                            }
                            locations.sort();
                            locations.unshift("All");
                            $scope.bottomRight.locations = locations;
                            console.log("Loading Locations");
                        }
				   	    if(!$scope.bottomRight.chosenLocation){
				   	        $scope.bottomRight.chosenLocation = "All";
				   	     }
				   	    
				   	    // Sort out Sports
				   	    if(!sport || sport == "All"){
                            var sports = Array();
                            for(var i = 0; i < $scope.bottomRight.livebottomRight.length; i++){
                                var oktopush = false;
                                if(location){
                                    if($scope.bottomRight.livebottomRight[i].location == location){
                                        var oktopush = true;
                                    }
                                } else { 
                                    var oktopush = true;
                                }
                                if(oktopush == true){
                                   if(sports.indexOf($scope.bottomRight.livebottomRight[i].sport) == -1){
                                        sports.push($scope.bottomRight.livebottomRight[i].sport);
                                    }
                                }
                            }
                            sports.sort();
                            sports.unshift("All");
                            $scope.bottomRight.sports = sports;
                            console.log("Loading Sports");
                        }
                        if(!$scope.bottomRight.chosenSport){
                             $scope.bottomRight.chosenSport = "All";
                        }
                        
                        // Sort out Groups
                        var groups = Array(); 
                        for(var i = 0; i < $scope.bottomRight.livebottomRight.length; i++){ 
                           var oktopush = false;
                           if(location){
                                if($scope.bottomRight.livebottomRight[i].location == location){
                                    var oktopush = true;
                                }
                            } else { 
                                var oktopush = true;
                            }
                            if(sport){
                                if(!location || location == "All"){
                                    if($scope.bottomRight.livebottomRight[i].sport == sport){
                                        var oktopush = true;
                                    } else {
                                        var oktopush = false;
                                    }
                                } else {
                                    if(oktopush == true && $scope.bottomRight.livebottomRight[i].sport == sport){
                                        var oktopush = true;
                                    } else {
                                        var oktopush = false;
                                    }
                                }
                            }                             
                            if(oktopush == true){
                                if(groups.indexOf($scope.bottomRight.livebottomRight[i].group) == -1){
                                    groups.push($scope.bottomRight.livebottomRight[i].group);
                                }
                            }
                        }
                        groups.sort();
                        groups.unshift("All");
                        $scope.bottomRight.groups = groups;
                        $scope.bottomRight.chosenGroup = "All";
                        console.log("Loading Groups");
                        var broadcasts = Array(); 
                        for(var i = 0; i < $scope.bottomRight.livebottomRight.length; i++){
                            if(broadcasts.indexOf($scope.bottomRight.livebottomRight[i].broadcast) == -1){
                                broadcasts.push($scope.bottomRight.livebottomRight[i].broadcast);
                            }
                        }
                        broadcasts.sort();
                        broadcasts.unshift("All");
                        $scope.bottomRight.broadcasts = broadcasts;
                        $scope.bottomRight.chosenBroadcast = "All";
                        console.log("Loading Broadcasts");
                        
                        
					 });    
				};
				fetchData();	      
				            
        }
    }
]);
app.controller('bottomLeftCGController', ['$scope', 'socket', 'localStorageService',
    function($scope, socket, localStorageService){
        socket.on("bottomLeft", function (msg) {
            $scope.bottomLeft = msg;
        });

        $scope.$watch('bottomLeft', function() {
            if ($scope.bottomLeft) {
                socket.emit("bottomLeft", $scope.bottomLeft);
            } else {
                getBottomLeftData();
            }
        }, true);
        
        socket.on("bottomLeft", function (msg) {
            $scope.bottomLeft = msg;
        });
        
        function getBottomLeftData() {
            socket.emit("bottomLeft:get");
        }

    }
]);

app.controller('bottomCenterCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("bottomCenter", function (msg) {
            $scope.bottomCenter = msg;
        });

        $scope.$watch('bottomCenter', function() {
            if ($scope.bottomCenter) {
                socket.emit("bottomCenter", $scope.bottomCenter);
            } else {
                getBottomCenterData();
            }
        }, true);
        
        socket.on("bottomCenter", function (msg) {
            $scope.bottomCenter = msg;
        });
        
        function getBottomCenterData() {
            socket.emit("bottomCenter:get");
        }
    }
]);

app.controller('tickerCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("ticker", function (msg) {
            $scope.ticker = msg;
        });

        $scope.$watch('ticker', function() {
            if ($scope.ticker) {
                socket.emit("ticker", $scope.ticker);
            } else {
                getTickerData();
            }
        }, true);
        
        socket.on("ticker", function (msg) {
            $scope.ticker = msg;
        });
        
        function getTickerData() {
            socket.emit("ticker:get");
        }
    }
]);