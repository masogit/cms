module.exports = function(app) {

	var Client = require('node-rest-client').Client;
	client = new Client();

	// application -------------------------------------------------------------
	app.post('/rest/topology', function(req, res) {
		var server = "http://" + req.body.server;
		var args = {
		  data: req.body.view, //"queryNodes",
		  headers:{"Content-Type": "text/plain"} 
		};
		 
		client.post(server + "/rest/topology/", args, function(data,response) {
		    res.json(data);
		});

	});

	app.post('/rest/container', function(req, res) {
		var server = "http://" + req.body.server;
		var args = {
		  data: req.body.container, //"queryNodes",
		  headers:{"Content-Type": "text/plain"} 
		};
		 
		client.post(server + "/rest/topology/", args, function(data,response) {
		    res.json(data);
		});

	});

	app.get('/dashboard1', function(req, res) {
		res.sendfile('./public/dashboard1.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
	
	app.get('/dashboard2', function(req, res) {
		res.sendfile('./public/dashboard2.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

	app.get('/', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});



};