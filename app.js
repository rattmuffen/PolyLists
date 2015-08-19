/* jslint node: true */
'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var app = express();
var fs = require('fs');
var request = require('request');
var uuid = require('node-uuid');

var port = process.env.PORT || 7845;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

//TODO change datatype for faster data retrieval.
var lists = [{'id': '-1',
			  'description': 'Welcome to PolyLists',
			  'title': 'PolyLists',
			  'image': '',
			  'items': [{'text': 'Add a new list via the navbar'}]}];

// Get current lists.
app.get('/get/lists', function (req, res) {
	res.send(JSON.stringify(lists));
});

// Create a new list.
app.post('/create/list', function (req, res) {
	// Get data from request body.
	var title = req.body.title;
	var description = req.body.description;
	var image = req.body.image != null ? req.body.image : '';
	
	console.log('Create list ' + title);

	// Create new list and push to lists array.
	lists.push({
		'id': uuid.v4(),
		'title': title,
		'image': image,
		'description': description,
		'items': []
	});
	
	// TODO send update request to all connected clients.
	
	// Return all lists.
	res.send(JSON.stringify(lists));
});

// Add an item to a list.
app.post('/add/list', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var text = req.body.text;
	
	console.log('Add ' + text + ' to ' + id);

	// TODO change lists datatype for faster data retrieval.
	// Iterate over lists and add item to list from request.
	for (var i = 0; i <= lists.length; i++) {
		var list = lists[i];
		
		if (list && list.id == id) {
			list.items.push({'text': text})
		}
	}
	
	//TODO send update request to all connected clients.

	// Return all lists.
	res.send(JSON.stringify(lists));
});


var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});