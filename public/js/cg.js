var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('archeryCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("archery", function (msg) {
            $scope.archery = msg;
        });
    }
]);

app.controller('topRightCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });
        
        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };
        
        // Start the timer
        $timeout(tick, $scope.tickInterval);
    }
]);


app.controller('bugCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("bug", function (state) {
            $scope.state = state;
        });
        
        $scope.$watch('bug', function() {
            if (!$scope.bug) {
                getBugData();
            }
        }, true);
		
		socket.on("bug", function (msg) {
            $scope.bug = msg;
        });
        
        function getBugData() {
            socket.emit("bug:get");
        };
        
        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, $scope.tickInterval);
    }
]);

app.controller('bottomRightCtrl', ['$scope', 'socket',
    function($scope, socket){
        $scope.tickInterval = 15000; //ms      
        
        // Function for forcing certain sports to show
        

        
        var updateFixtures = function() {
          	
            var fetchData = function () {
                var config = { headers:  {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
            };
            
            $http.get('/data/fixtures.json', config).then(function (response) {
                    console.log('Updating fixtures');
                    $scope.bottomRight.livebottomRight = response.data;
                    
                    var newLivebottomRight = {"rows": [], "nextup": []};     
                                       
                    var numberofbottomRight = 0;
                    var daysOfWeek = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
                    for(var i = 0; i < $scope.bottomRight.livebottomRight.length; i++){
                        var buildArray = {};  
                    
                    // If dates, sports or locations are selected
                        
                        if(($scope.bottomRight.chosenLocation == $scope.bottomRight.livebottomRight[i].location || $scope.bottomRight.chosenLocation == "All") && ($scope.bottomRight.chosenSport == $scope.bottomRight.livebottomRight[i].sport || $scope.bottomRight.chosenSport == "All") && ($scope.bottomRight.chosenGroup == $scope.bottomRight.livebottomRight[i].group || $scope.bottomRight.chosenGroup == "All") && ($scope.bottomRight.chosenBroadcast == $scope.bottomRight.livebottomRight[i].broadcast || $scope.bottomRight.chosenBroadcast == "All")){
                            
                            if($scope.bottomRight.livebottomRight[i].score.lancs !== "" && whichGraphic !== "nextup"){
                                var lancScore = $scope.bottomRight.livebottomRight[i].score.lancs;
                                var yorkScore = $scope.bottomRight.livebottomRight[i].score.york;
                                
                                // Home team shows first. To be changed in future years!
                                var strScore = lancScore + ' - ' + yorkScore;
                                $scope.bottomRight.livebottomRight[i].time = strScore;
                            } else {
                                dateTimeString = $scope.bottomRight.livebottomRight[i].date + "T" + $scope.bottomRight.livebottomRight[i].time;
                                dateTime = new Date(dateTimeString);
                                  var day = daysOfWeek[dateTime.getDay()];
                                  var hours = dateTime.getHours();
                                  var minutes = dateTime.getMinutes();
                                  var ampm = hours >= 12 ? 'pm' : 'am';
                                  hours = hours % 12;
                                  hours = hours ? hours : 12; // the hour '0' should be '12'
                                  minutes = minutes < 10 ? '0'+minutes : minutes;
                                  var strTime = day + ' ' + hours + ':' + minutes + ' ' + ampm;
                                if(whichGraphic == "nextup"){
                                	$scope.bottomRight.livebottomRight[i].time = dateTime;
                                } else {
                                	$scope.bottomRight.livebottomRight[i].time = strTime;
                                }
                            }
                            
                            $scope.bottomRight.livebottomRight[i].points = $scope.bottomRight.livebottomRight[i].points + 'pts';
                            
                           
                            if(whichGraphic == "nextup"){                          	
								buildArray["sport"] = $scope.bottomRight.livebottomRight[i].sport;
								buildArray["group"] = $scope.bottomRight.livebottomRight[i].group;  
								buildArray["points"] = $scope.bottomRight.livebottomRight[i].points;
								buildArray["broadcast"] = $scope.bottomRight.livebottomRight[i].broadcast;
								buildArray["time"] = $scope.bottomRight.livebottomRight[i].time;
								newLivebottomRight["nextup"].push(buildArray);
								$scope.bottomRight.nextup = newLivebottomRight["nextup"];
								break;
                            } else {
                            	buildArray["one"] = $scope.bottomRight.livebottomRight[i][$scope.bottomRight.colone];
								buildArray["two"] = $scope.bottomRight.livebottomRight[i][$scope.bottomRight.coltwo];  
								buildArray["three"] = $scope.bottomRight.livebottomRight[i][$scope.bottomRight.colthree];
								buildArray["four"] = $scope.bottomRight.livebottomRight[i][$scope.bottomRight.colfour];
								newLivebottomRight["rows"].push(buildArray);
								var numberofbottomRight = numberofbottomRight + 1;
							}
                        }                            
                        if ($scope.bottomRight.numberofbottomRight == numberofbottomRight){
                            break;
                        }
                    }
                    if(whichGraphic == "nextup"){
                    	console.log(newLivebottomRight);
                    	$scope.bottomRight.nextonSport = newLivebottomRight["nextup"][0]["sport"];
                    	$scope.bottomRight.nextonGroup = newLivebottomRight["nextup"][0]["group"];
                    	$scope.bottomRight.nextonPoints = newLivebottomRight["nextup"][0]["points"];
                    	$scope.bottomRight.nextonBroadcast = newLivebottomRight["nextup"][0]["broadcast"];
                    	$scope.bottomRight.nextonTime = newLivebottomRight["nextup"][0]["time"]
                    	countDownbottomRight();
                    	return localStorageService.set('bottomRight.nextup',newLivebottomRight["nextup"]);	
                    } else {
						$scope.bottomRight.rows = newLivebottomRight["rows"];				
						return localStorageService.set('bottomRight.rows',newLivebottomRight["rows"]);   
					}
                 });    
            };
            
            fetchData();	         		     						
        };
        
]);

app.controller('bottomLeftCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("bottomLeft", function (msg) {
            $scope.bottomLeft = msg;
        });
    }
]);

app.controller('bottomCenterCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("bottomCenter", function (msg) {
            $scope.bottomCenter = msg;
        });
    }
]);

app.controller('tickerCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("ticker", function (msg) {
            $scope.ticker = msg;
        });
    }
]);
