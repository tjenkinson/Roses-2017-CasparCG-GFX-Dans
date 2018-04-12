var express 	= require('express'),
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var bug = {livetext: "Live", locationtext: ''};
var topRight = {};
var bottomRight = {};
var bottomLeft = {header: "Header Text"};
var bottomCenter = {};
var ticker = {};

//Clock Functions
var stopwatch = new Stopwatch();

stopwatch.on('tick:stopwatch', function(time) {
	io.sockets.emit("clock:tick", time);
});



io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	/*
	 * 		Clock functions
	 */
	socket.on("clock:pause", function() {
		stopwatch.pause();
	});

	socket.on("clock:reset", function() {
		stopwatch.reset();
	});

	socket.on("clock:up", function() {
		stopwatch.countUp();
	});

	socket.on("clock:down", function() {
		stopwatch.countDown();
	});

	socket.on("clock:set", function(msg) {
		stopwatch.setValue(msg);
	});

    socket.on("clock:get", function() {
        io.sockets.emit("clock:tick", stopwatch.getTime());
    });


	/*
	 * 		General Functions
	 */
	socket.on("bug", function(msg) {
        bug = msg;
		io.sockets.emit("bug", msg);
	});

    socket.on("bug:get", function(msg) {
		io.sockets.emit("bug", bug);
	});
	
	/*
	 * 		Bottom Left Functions
	 */
	socket.on("bottomLeft", function(msg) {
        bottomLeft = msg;
		io.sockets.emit("bottomLeft", msg);
	});

    socket.on("bottomLeft:get", function(msg) {
		io.sockets.emit("bottomLeft", bug);
	});
	
});
	

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
console.log("Now listening on port 3000. Go to http://127.0.0.1:3000/admin to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG to start the graphics")
