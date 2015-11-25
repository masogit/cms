module.exports = function(app) {
	var SSH = require('simple-ssh');
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

	app.post('/ssh', function(req, res) {
		console.log("req.body.cmd: "+req.body.cmd);
		var ssh = new SSH({
		    host: req.body.host,
		    user: req.body.user,
		    pass: req.body.pass
		});
		 
		ssh.exec(req.body.cmd, {
		    out: function(stdout) {
		        console.log("stdout: " + stdout);
		    	res.send(stdout);
		    },

		    err: function(stderr) {
		    	res.send(stderr);
		        console.log("stderr: " + stderr); // this-does-not-exist: command not found 
		    }
		}).start();
	});

	app.get('/ssh', function(req, res) {
		res.sendfile('./public/ssh.html'); // load the single view file (angular will handle the page changes on the front-end)
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