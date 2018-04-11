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
                socket.emit("bug", $scope.topRight);
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

app.controller('bottomRightCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });

        $scope.$watch('topRight', function() {
            if ($scope.topRight) {
                socket.emit("bug", $scope.topRight);
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

app.controller('bottomLeftCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });

        $scope.$watch('topRight', function() {
            if ($scope.topRight) {
                socket.emit("bug", $scope.topRight);
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

app.controller('bottomCenterCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });

        $scope.$watch('topRight', function() {
            if ($scope.topRight) {
                socket.emit("bug", $scope.topRight);
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

app.controller('tickerCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("topRight", function (msg) {
            $scope.topRight = msg;
        });

        $scope.$watch('topRight', function() {
            if ($scope.topRight) {
                socket.emit("bug", $scope.topRight);
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