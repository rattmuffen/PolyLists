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
var lists = [
	{'id': '-1',
	 'description': 'Welcome to PolyLists',
	 'title': 'PolyLists',
	 'image': '',
	 'items': [{'id': uuid.v4(), 'text': 'Add a new list via the navbar'}]}
];

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

// Remove a list.
app.post('/remove/list', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	
	console.log('Remove list ' + id);

	// Remove list.
	lists.splice(getItemIndex(lists, id), 1)
	
	// TODO send update request to all connected clients.
	
	// Return all lists.
	res.send(JSON.stringify(lists));
});

// Add an item to a list.
app.post('/add/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var text = req.body.text;
	
	console.log('Add ' + text + ' to ' + id);
	
	// Get list and push item.
	var list = getList(id);
	list.items.push({'id': uuid.v4(), 'text': text})
	
	//TODO send update request to all connected clients.

	// Return all lists.
	res.send(JSON.stringify(lists));
});

// Remove an item from a list.
app.post('/remove/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var listid = req.body.listid;
	
	console.log('Remove ' + id + ' from ' + listid);
	
	// Get list and remove item.
	var list = getList(listid);
	list.items.splice(getItemIndex(list.items, id), 1);
	
	//TODO send update request to all connected clients.

	// Return all lists.
	res.send(JSON.stringify(lists));
});

// Get list with specified id. {} if no match.
function getList(id) {
	for (var i = 0; i <= lists.length; i++) {
		var list = lists[i];
		
		if (list && list.id == id) {
			return list;
		}
	}
	return {};
}

// Returns index of item in list of items. -1 if no match.
function getItemIndex(items, id) {
	for (var i = 0; i <= items.length; i++) {
		var item = items[i];
		
		if (item && item.id == id) {
			return i;
		}
	}
	return -1;
}

var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});