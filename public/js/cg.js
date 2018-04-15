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

// Bottom Right Fixtures
app.controller('bottomRightCtrl', ['$scope', '$interval', '$http', 'socket',
    function($scope, $interval, $http, socket){
        $scope.fixturesTickInterval = 60000; //ms
        $scope.fixturesOnScreen = 10000; //ms    
        if($scope.bottomRight == undefined){
            $scope.bottomRight = [];
        }
        
        socket.on("bottomRight", function (msg) {
            $scope.bottomRight = msg;
        });        
        
        socket.on("bottomRight", function (msg) {
            $scope.bottomRight = msg;
            if ($scope.bottomRight) {
                if($scope.bottomRight.location) {
                    var location = $scope.bottomRight.location;
                } else {
                    var location = "";
                }
                if($scope.bottomRight.sport) {
                    var sport = $scope.bottomRight.sport;
                } else {
                    var sport = "";
                }if($scope.bottomRight.group) {
                    var group = $scope.bottomRight.group;
                } else {
                    var group = "";
                }if($scope.bottomRight.broadcast) {
                    var broadcast = $scope.bottomRight.broadcast;
                } else {
                    var boardcast = "";
                }
                updateFixtures(location,sport,group,broadcast);
            }
        }, true);
           
        var updateFixtures = function(location,sport,group,broadcast) {
          	
            var fetchData = function () {
                var config = { headers:  {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
            };
            
            $http.get('/data/timetable_entries_example.json', config).then(function (response) {
                    console.log('Updating fixtures');
                    var newLivebottomRight = {"rows" : []}; 
                    var daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    
                    for(var i = 0; i < response.data.length; i++){
                        var buildArray = {};  
                            
                        dateTimeString = response.data[i].start;
                        dateTime = new Date(dateTimeString);
                          var day = daysOfWeek[dateTime.getDay()];
                          var hours = dateTime.getHours();
                          var minutes = dateTime.getMinutes();
                          // var ampm = hours >= 12 ? 'pm' : 'am';
                          // hours = hours % 12;
                          // hours = hours ? hours : 12; // the hour '0' should be '12'
                          hours = hours < 10 ? '0'+hours : hours;
                          minutes = minutes < 10 ? '0'+minutes : minutes;
                          var strTime = '' + hours + ':' + minutes;
                        response.data[i].time = strTime;                     
                        
                        buildArray["id"] = response.data[i].id;
                        buildArray["sport"] = response.data[i].team.sport.title;
                        buildArray["time"] = strTime; 
                        buildArray["day"] = day;
                        buildArray["group"] = response.data[i].team.title;
                        buildArray["location"] = response.data[i].location.name;
                        buildArray["la1tv"] = response.data[i].la1tv_coverage_level;
                        buildArray["points"] = response.data[i].point.amount;
                        newLivebottomRight["rows"].push(buildArray);
        
                    }                            
                    $scope.bottomRight.chosenSport = newLivebottomRight["rows"][0].sport;
                    $scope.bottomRight.rows = newLivebottomRight["rows"];                 
                    console.log($scope.bottomRight);
                    
                    
                    // Change the sports every so often
                    if($scope.bottomRight.chosenSportSwitching !== true) {
                        $interval(changeSport,$scope.fixturesOnScreen);
                        // console.log('Starting the cycle');
                    } else {
                        // console.log('Cycle already peddling');
                    }
                 });    
            };
            
            fetchData();	         		     						
        };
        
        
        var changeSport = function(){
            var i = 0;
            if($scope.bottomRight.rows !== undefined){
            
                // Make a unique sports array
                
                var allSports = [];
                for(j=0; j < $scope.bottomRight.rows.length; j++){
                    allSports.push($scope.bottomRight.rows[j].sport);
                }
                uniqueSports = [...new Set(allSports)];
                if($scope.bottomRight.currenti == undefined){
                    $scope.bottomRight.currenti = uniqueSports.findIndex(function(element){ return element == $scope.bottomRight.chosenSport});
                }

                if($scope.bottomRight.currenti !== undefined){ 
                   $scope.bottomRight.currenti = $scope.bottomRight.currenti+1;
                   if($scope.bottomRight.currenti >= uniqueSports.length) {
                    $scope.bottomRight.currenti = 0;
                   }
                } else {
                    $scope.bottomRight.currenti = 0;
                }
            
                $scope.bottomRight.chosenSport = uniqueSports[$scope.bottomRight.currenti];
                // console.log('Chosen Sport = '+ $scope.bottomRight.chosenSport);
                $scope.bottomRight.chosenSportSwitching = true;
            } else {
                // console.log('No sport changes');
            }
        }
        // First fetch plz
        updateFixtures();
        
        // Start the timer
        $interval(updateFixtures, $scope.fixturesTickInterval);
        
        
    }    
]);


// Bottom Left Moments
app.controller('bottomLeftCtrl', ['$scope', '$interval', '$http', 'socket', '$sce',
    function($scope, $interval, $http, socket, $sce){
        $scope.moments = {"moments":[]};
        $scope.momentsTickInterval = 30000;
        $scope.latestMomentId = "";
        
        socket.on("pleaseSendMoments", function(){
            if($scope.moments){
                socket.emit('momentsUpdated', $scope.moments);
            } else {
                socket.emit('momentsUpdated',"No Moments Sorry");
            }
        });
        
        socket.on("bottomLeft", function (msg) {
            $scope.bottomLeft = msg;       
        });
        
        var fetchMoments = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('data/feed_example.json', config)
            .success(function(data) {
            
              if(isNaN(data[0].id) || isNaN(data[0].id)){
                console.log("Roses live is giving us nonsense");
                return;
              } else { 
                 // Sort Array so we're getting the most recent
                 
                // Check the latest moment's ID
                if($scope.latestMomentId !== data[0].id){
          
                    var buildArray = {};  
                    var moments = [];
                               
                    for(i=0; i<data.length; i++){
                        var buildArray = {};  
                        buildArray["text"] = data[i].text;
                        buildArray["updated_at"] = data[i].updated_at;
                        buildArray["id"] = data[i].id;
                        buildArray["type"] = data[i].live_moment_type.name;
                        buildArray["author"] = data[i].author;
                        buildArray["team_name"] = data[i].team_name;
                    
                        moments[i] = buildArray;
                            
                        // Allow the user to set how many moments we cycle through later
                        if(i == 4) {
                            break;
                        }
                    }
                    
                    // This is where I need to do more stuff to do with content
                    // For now we'll just return the most recent moment
                    $scope.moments = moments;
                    socket.emit('momentsUpdated', moments);
                    $scope.latestMomentId = moments[0].id;
                    
                    if(moments[0].type == "Tweet"){
                        $scope.momentsHeader = moments[0].author;
                    } else  if (moments[0].type == "Score Update"){
                        
                    } else {
                        $scope.momentsHeader = moments[0].type;
                    }
                    $scope.momentsContent = $sce.trustAsHtml(moments[0].text);
                
                } else {
                    // console.log("nothing's changed");
                }               
               
              }              
        
            }
          );
        };
                
        // First fetch plz
        fetchMoments();
        
        // Start the timer
        $interval(fetchMoments, $scope.momentsTickInterval);
        
        
    }
]);

app.controller('tickerCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("ticker", function (msg) {
            $scope.ticker = msg;
        });
    }
]);
