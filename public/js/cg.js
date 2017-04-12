var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('lowerThirdsCtrl', ['$scope', 'socket',
    function($scope, socket){
        $scope.showLeft = false;

        socket.on("lowerthird:hide", function (msg) {
            $scope.showLeft = false;
            $scope.showRight = false;
        });

        socket.on("lowerthird:left", function (msg) {
            if($scope.showLeft) {
                $scope.showLeft = false;
            }
            $scope.left = msg;
            $scope.showLeft = true;
        });

        socket.on("lowerthird:right", function (msg) {
            if($scope.showRight) {
                $scope.showRight = false;
            }
            $scope.right = msg;
            $scope.showRight = true;
        });
    }
]);

app.controller('archeryCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("archery", function (msg) {
            $scope.archery = msg;
        });
    }
]);

app.controller('boxingCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("boxing", function (msg) {
            $scope.boxing = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('boxing', function() {
            if (!$scope.boxing) {
                getBoxingData();
            }
        }, true);

        function getBoxingData() {
            socket.emit("boxing:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('bugCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("bug", function (state) {
            $scope.state = state;
        });

        $scope.$watch('bug', function() {
            if (!$scope.state) {
                getBugData();
            }
        }, true);

        function getBugData() {
            socket.emit("bug:get");
        }

        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, $scope.tickInterval);
    }
]);

app.controller('scoringCtrl', ['$scope', '$interval', '$http', 'socket',
    function($scope, $interval, $http, socket){
        $scope.tickInterval = 5000;
        $scope.yorkScore = "";
        $scope.lancScore = "";

        var fetchScore = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('https://roseslive.co.uk/score.json', config)
            .success(function(data) {
                $scope.yorkScore = data.york;
                $scope.lancScore = data.lancs;
            }
          );
        };

        socket.on("score", function (state) {
            $scope.showScore = state.showScore;
        });

        $scope.$watch('score', function() {
            if (!$scope.score) {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }

        //Intial fetch
        fetchScore();
        // Start the timer
        $interval(fetchScore, $scope.tickInterval);
    }
]);

app.controller('footballCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("football", function (msg) {
            $scope.football = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('football', function() {
            if (!$scope.football) {
                getFootballData();
            }
        }, true);

        function getFootballData() {
            socket.emit("football:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('dartsCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("dart", function (msg) {
            $scope.darts = msg;
        });

        $scope.$watch('dart', function() {
            if (!$scope.dart) {
                getDartData();
            }
        }, true);

        function getDartData() {
            socket.emit("dart:get");
        }
    }
]);

app.controller('socialmediaCtrl', ['$scope', '$http', 'socket', '$sce',
    function($scope, $http, socket, $sce){
        var showTweet = false;
        socket.on("socialmedia", function (msg) {
            tweetUrl = msg.tweet;
            $scope.socialmedia = msg;
            showTweet = msg.show;
            if (!showTweet) {
                $scope.showTweet = false;
            }
            fetchTweetHTML(msg.tweet);
        });

		$scope.twitterurl = 'https://api.twitter.com/1/statuses/oembed.json?url=';
		$scope.instaurl = 'http://api.instagram.com/oembed?url=';
		$scope.tweethtml = '';
		
		if ($scope.socialmedia) {
            $scope.tweetfetchurl = $scope.twitterurl + $scope.tweet;
		} else {
            $scope.tweetfetchurl = $scope.twitterurl + $scope.tweet;
		}
		
		var fetchTweetHTML = function (tweetUrl) {
          var config = {headers:  {
              'Accept': 'application/jsonp',
              'Content-Type': 'application/jsonp',
            }
          };

          $http.jsonp('https://api.twitter.com/1/statuses/oembed.json?url='+tweetUrl+'&callback=JSON_CALLBACK', config)
            .success(function(data) {
                $scope.tweetHTML = $sce.trustAsHtml(data.html);
                $scope.tweetAuthor = data.author_name;
                $scope.tweetType = data.type;
                setTimeout(function() {
                    twttr.widgets.load();
                    if (showTweet) {
                        $scope.showTweet = showTweet;
                    }
                });
             }
          );
        };
        			
        $scope.$watch('socialmedia', function() {
            if (!$scope.socialmedia) {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }
    }

]);

app.controller('gridCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("grid", function (payload) {
            if (payload === "hide") {
                //We first remove every element with a delay
                $scope.grid = {};
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.grid = payload;
            }
        });
    }
]);

app.controller('swimmingCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("swimming", function (msg) {
            $scope.swimming = msg;
        });

        $scope.clockMin = "0";
        $scope.clockSec = "00";
        $scope.clockDec = "0";

        socket.on("clock:tick", function (msg) {
            $scope.clockMin = msg.slice(0,msg.indexOf(":")).replace(/^0/, '');
            $scope.clockSec = msg.slice(msg.indexOf(":")+1,msg.indexOf("."));
            $scope.clockDec = msg.slice(msg.indexOf(".")+1);
        });

        $scope.$watch('swimming', function() {
            if (!$scope.swimming) {
                getSwimmingData();
            }
        }, true);

        function getSwimmingData() {
            socket.emit("swimming:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('basketballCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("basketball", function (msg) {
            $scope.basketball = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('basketball', function() {
            if (!$scope.basketball) {
                getBasketballData();
            }
        }, true);

        function getBasketballData() {
            socket.emit("basketball:get");
            socket.emit("clock:get");
        }
    }
]);
