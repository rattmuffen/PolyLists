/* jslint node: true */
'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var request = require('request');
var uuid = require('node-uuid');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 7845;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

//TODO change datatype for faster data retrieval.
var lists = [
	{'id': uuid.v4(),
	 'description': 'Welcome to PolyLists',
	 'title': 'PolyLists',
	 'checkable': true,
	 'color': 'green',
	 'image': '',
	 'items': [{'id': uuid.v4(), 'text': 'Add a new list via the navbar', 'checked': false}]}
];

io.on('connection', function (socket) {
	console.log('Client connected from: ' + socket.handshake.address);
});

// Get current lists.
app.get('/get/lists', function (req, res) {
	res.send(JSON.stringify(lists));
});

// Create a new list.
app.post('/create/list', function (req, res) {
	// Get data from request body.
	var title = req.body.title != null ? req.body.title : 'Untitled';
	var description = req.body.description;
	var color = req.body.color;
	var image = req.body.image != null ? req.body.image : '';
	var checkable = req.body.checkable == 'true';
	
	console.log('Create list ' + title);

	// Create new list and push to lists array.
	lists.push({
		'id': uuid.v4(),
		'title': title,
		'image': image,
		'color': color,
		'checkable': checkable,
		'description': description,
		'items': []
	});
	
	// Send updated data and end.
	sendDataUpdate('List \'' + title + '\' was created.');
	res.end();
});

// Remove a list.
app.post('/remove/list', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	
	console.log('Remove list ' + id);

	// Remove list.
	var list = getList(id);
	lists.splice(getItemIndex(lists, id), 1);
	
	// Send updated data and end.
	sendDataUpdate('\'' + list.title + '\' was removed.');
	res.end();
});

// Update a list.
app.post('/update/list', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var title = req.body.title != null ? req.body.title : 'Untitled';
	var description = req.body.description;
	var color = req.body.color;
	var image = req.body.image != null ? req.body.image : '';
	var checkable = req.body.checkable == 'true';
	
	console.log('Update list ' + title);

	var list = getList(id);
	
	list.title = title;
	list.description = description;
	list.color = color;
	list.image = image;
	list.checkable = checkable;
	
	// Send updated data and end.
	sendDataUpdate('List \'' + title + '\' was updated.');
	res.end();
});

// Add an item to a list.
app.post('/add/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var text = req.body.text;
	
	console.log('Add ' + text + ' to list ' + id);
	
	// Get list and push item.
	var list = getList(id);
	list.items.push({'id': uuid.v4(), 'text': text, 'checked': false});
	
	// Send updated data and end.
	sendDataUpdate('\'' + text + '\' was added to \'' + list.title + '\'.');
	res.end();
});

// Remove an item from a list.
app.post('/remove/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var text = req.body.text;
	var listid = req.body.listid;
	
	console.log('Remove item ' + id + ' from list ' + listid);
	
	// Get list and remove item.
	var list = getList(listid);
	list.items.splice(getItemIndex(list.items, id), 1);
	
	// Send updated data and end.
	sendDataUpdate('\'' + text + '\' was removed from \'' + list.title + '\'.');
	res.end();
});

// Toggle checked for an item in a list.
app.post('/check/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var listid = req.body.listid;
	
	console.log('Toggle check for item ' + id + ' in list ' + listid);
	
	// Get list and toggle item check.
	var list = getList(listid);
	var item = list.items[getItemIndex(list.items, id)];
	item.checked = !item.checked;
	
	// Send updated data and end.
	sendDataUpdate('\'' + item.text + '\' was toggled in \'' + list.title + '\'');
	res.end();
});

// Emits update event with list data to all connected clients.
function sendDataUpdate(event) {
	var data = {'lists': lists, 'event': event};
	io.emit('update-data', JSON.stringify(data));
}

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

var server = http.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});