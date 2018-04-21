var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

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
                    // console.log('Updating fixtures');
                    
                    var daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    
                    // Need to do a check here to see if the data has changed, if so then carry on cowboy. 
                    var fixturesFileUpdated = new Date(response.headers('Last-Modified'));
                                        
                    if(fixturesFileUpdated >= $scope.bottomRight.fixturesFileUpdated) {
                        // console.log('No new fixtures');
                    } else {
                        $scope.bottomRight.fixturesFileUpdated = fixturesFileUpdated;
                        // console.log('New fixtures');
                        var newLivebottomRight = {"rows" : []}; 
                    
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
                    
                        if($scope.bottomRight.chosenSport == undefined){
                            $scope.bottomRight.chosenSport = newLivebottomRight["rows"][0].sport;
                        }
                        $scope.bottomRight.rows = newLivebottomRight["rows"];                 
                        // console.log($scope.bottomRight);
                    
                    
                        // Change the sports every so often
                        if($scope.bottomRight.chosenSportSwitching !== true) {
                            $interval(changeSport,$scope.fixturesOnScreen);
                            // console.log('Starting the cycle');
                        } else {
                            // console.log('Cycle already peddling');
                        }
                    }

                 });    
            };
            
            fetchData();	         		     						
        };
        
        // Function that cycles fixtures sports. 
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
        
        // Start the timer to update fixtures
        $interval(updateFixtures, $scope.fixturesTickInterval);
        
        
    }    
]);


// Bottom Left Moments
app.controller('bottomLeftCtrl', ['$scope', '$interval', '$http', 'socket', '$sce',
    function($scope, $interval, $http, socket, $sce){
        
        if($scope.moments == undefined){
            $scope.moments = {"rows":[]};
        } else {
            $scope.moments.rows  = [];
        }
        $scope.moments.momentsCheckTickInterval = 30000;
        $scope.moments.momentsSwapTickInterval = 6000;
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
            //console.log(msg);      
        });
        
        var fetchMoments = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('data/feed_example.json', config).then(function(response) {
              if(isNaN(response.data[0].id) || isNaN(response.data[0].id)){
                console.log("Roses live is giving us nonsense");
                return;
              } else { 
                 
                 // Sort Array so we're getting the most recent content
                 
                 response.data.sort(function(a, b){
                    var keyA = new Date(a.updated_at),
                        keyB = new Date(b.updated_at);
                    // Compare the 2 dates
                    if(keyA < keyB) return -1;
                    if(keyA > keyB) return 1;
                    return 0;
                });
                
                var momentsFileUpdated = new Date(response.headers('Last-Modified'));
                // Check the latest moment's ID
                if($scope.latestMomentId !== response.data[0].id){
                    $scope.latestMomentId = response.data[0].id;
                    var moments = {"rows" : [], "momentsFileUpdated" : momentsFileUpdated};                           
                    for(i=0; i<response.data.length; i++){
                        var buildArray = {};  
                        buildArray["id"] = response.data[i].id;
                        response.data[i].text = response.data[i].text.replace('<Strong>Lancs','<Strong class="teamLancs"> Lancs');
                        
                        response.data[i].text = response.data[i].text.replace('<Strong>York','<Strong class="teamYork"> York');
                        buildArray["text"] = response.data[i].text
                        buildArray["updated_at"] = response.data[i].updated_at;
                        buildArray["type"] = response.data[i].live_moment_type.name;
                        buildArray["author"] = response.data[i].author;
                        buildArray["team_name"] = response.data[i].team_name;
                        moments.rows.push(buildArray);
                    }

                    $scope.moments.rows = moments.rows;
                    $scope.moments.momentsFileUpdated = moments.momentsFileUpdated;
                    socket.emit('momentsUpdated', moments);
                    $scope.latestMomentId = moments.rows[0].id;
                    if($scope.moments.grabThisMany){
                        //console.log($scope.moments.grabThisMany);
                    }
                    
                    
                    for(i=0; i<moments.rows.length; i++){
                        // Here we add any moment type specific info
                        if(moments.rows[i].type == "Tweet"){
                            $scope.moments.rows[i].header = moments.rows[i].author;
                            if(moments.rows[i].text.indexOf('https://t.co/') > -1){
                                var text = moments.rows[i].text.substr(0, moments.rows[i].text.indexOf('https://t.co/'));
                                $scope.moments.rows[i].content = $sce.trustAsHtml(text);
                            } else {
                                $scope.moments.rows[i].content = $sce.trustAsHtml(moments.rows[i].text);
                            }
                            
                        } else  if (moments.rows[i].type == "Score Update"){
                            var team = moments.rows[i].text.substr(0, moments.rows[i].text.indexOf(',')); 
                            $scope.moments.rows[i].header = team;
                            $scope.moments.rows[i].content = $sce.trustAsHtml(moments.rows[i].text);
                        } else {
                            $scope.moments.rows[i].header = moments.rows[i].type;
                            $scope.moments.rows[i].content = $sce.trustAsHtml(moments.rows[i].text);
                        }
                          
                    }
                
                    //console.log($scope.moments);
                    rotateMoments();
                    $interval(rotateMoments, $scope.moments.momentsSwapTickInterval);

                } else {
                    //console.log("No new Moments");
                }               
               
              }              
        
            }
          );
        };
         
         
        var rotateMoments = function(){
            if($scope.moments.rows.length > 0){
                if($scope.currentMomentId  == undefined){
                    $scope.currentMomentId = $scope.moments.rows[0].id;
                    // console.log("Setting first moment");
                } else {
                    for(i=0; i<$scope.moments.rows.length; i++){
                        if($scope.moments.rows[i].id == $scope.currentMomentId){
                            currenti = i + 1;
                            if(currenti == $scope.moments.rows.length){
                                currenti = 0;
                            }
                        }
                    }
                    $scope.currentMomentId = $scope.moments.rows[currenti].id;
                }
            } 
            // console.log($scope.currentMomentId);  
        }       
        
        // First fetch plz
        fetchMoments();
        
        // Start the timer
        $interval(fetchMoments, $scope.moments.momentsCheckTickInterval); 
        
    }
]);

app.controller('tickerCtrl', ['$scope', '$interval', '$http', 'socket', '$sce',
    function($scope, $interval, $http, socket, $sce){
        $scope.fixturesLookup = {};
        
        $scope.ticker = {"ticker":[]};
        $scope.tickerCheckTickInterval = 10000;
        
        socket.on("ticker", function (msg) {
            $scope.ticker = msg;
        });
        
        $scope.$watch('ticker', function() {
            if (!$scope.ticker) {
                getTickerData();
            }
        }, true);

        function getTickerData() {
            socket.emit("ticker:get");
        }
        
        var fetchTickerScores = function () {
            var config = {headers:  {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
            };

            Promise.all([$http.get('data/results_example.json', config), $http.get('data/timetable_entries_example.json', config)]).then(function(values) {
 
                var response = values[0];  
                var timetable = values[1];  

              if(isNaN(response.data[0].id) || isNaN(response.data[0].id)){
                console.log("Roses live is giving us nonsense. Typical.");
                return;
              } else { 
                 
                 // Sort Array so we're getting the most recent content
                 
                 response.data.sort(function(a, b){
                    var keyA = new Date(a.updated_at),
                        keyB = new Date(b.updated_at);
                    // Compare the 2 dates
                    if(keyA < keyB) return -1;
                    if(keyA > keyB) return 1;
                    return 0;
                });
                
                var tickerFileUpdated = new Date(response.headers('Last-Modified'));      
                if($scope.ticker.tickerFileUpdated == undefined){
                    $scope.ticker.tickerFileUpdated = tickerFileUpdated;
                }

                if(tickerFileUpdated >= $scope.ticker.tickerFileUpdated){
                    var ticker = {"rows" : [], "tickerFileUpdated" : tickerFileUpdated }; 
                    for(i=0; i<response.data.length; i++){
                        var buildArray = {};  
                        buildArray["id"] = response.data[i].id;
                        buildArray["lancs_score"] = response.data[i].lancs_score;
                        buildArray["york_score"] = response.data[i].york_score;
                        if(response.data[i].winner == "L"){
                            response.data[i].winner = '<span class="teamLancsInverse">Lancs</span>';
                        } else if (response.data[i].winner == "Y") {
                            response.data[i].winner = '<span class="teamYorkInverse">York</span>';
                        } else {
                            // Leave it be.
                        }
                        buildArray["winner"] = response.data[i].winner;
                        buildArray["timetable_entry_id"] = response.data[i].timetable_entry_id;
                        buildArray["confirmed"] = response.data[i].confirmed;
                        var gamePoints = parseInt(response.data[i].lancs_points) + parseInt(response.data[i].york_points);
                        buildArray["points"] = gamePoints;
                        ticker.rows.push(buildArray);
                    }

                    $scope.ticker.rows = ticker.rows;
                    socket.emit('tickerUpdated', ticker);
                    
                    $scope.ticker.tickerText = "";
                    
                    for(i=0; i<2; i++){

                        var timetableIndex = timetable.data.findIndex(function(element){ return element.id == ticker.rows[i].timetable_entry_id});
                        
                        var timetableInfo = timetable.data[timetableIndex];
                        
                        if(i == 0){
                            borderThing = "";
                        } else {
                            borderThing = '<span style="border-right: 3px solid white; margin-right: 12px; padding-right: 12px;"></span>';
                        }
                        
                        var iScoreString = borderThing + timetableInfo.team.sport.title + " " + timetableInfo.team.title + ticker.rows[i].winner + " " + ticker.rows[i].lancs_score + '-' +  ticker.rows[i].york_score + " (" + ticker.rows[i].points + "pts)";
                        
                        $scope.ticker.tickerText =  $sce.trustAsHtml($scope.ticker.tickerText + iScoreString);
                        
                    }

                    $scope.ticker.tickerHeader = "Latest Scores";

                    // $scope.currentMomentId = 9816;
                } else {
                    // console.log("nothing's changed");
                }               
               
              }              
        
            }
          );
        };
        
            
        // First fetch plz
        fetchTickerScores();
        
        // Start the timer
        $interval(fetchTickerScores, $scope.tickerCheckTickInterval);
    }
]);
