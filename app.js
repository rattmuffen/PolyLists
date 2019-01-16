/* jslint node: true */
'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var request = require('request');
var uuid = require('node-uuid');
var mongo = require('mongodb');
var monk = require('monk');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 7845;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/PolyLists';
var db = monk(mongoUri);
var listDB = db.get('lists');

io.on('connection', function (socket) {
	console.log('Client connected from: ' + socket.handshake.address);
});

// Get current lists.
app.get('/get/lists', function (req, res) {
    listDB.find({}, {}, function(err, lists) {
		// TODO Handle errors.

		// Send all lists.
		res.send(JSON.stringify(lists));
    });
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

	// Create new list.
	var now = new Date();
	var list = {
		'title': title,
		'image': image,
		'color': color,
		'checkable': checkable,
		'description': description,
		'created': now,
		'updated': now,
		'items': []
	};

	// Add it to DB
	listDB.insert(list).then((data) => {
		sendDataUpdate('List \'' + title + '\' was created.');
		res.end();
	});
});

// Remove a list.
app.post('/remove/list', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var title = req.body.title;

	console.log('Remove list ' + id);

	// Remove list from DB.
	listDB.remove({'_id': id}).then((data) => {
		// Send updated data and end.
		sendDataUpdate('\'' + title + '\' was removed.');
		res.end();
	});
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
	var created = req.body.created;

	console.log('Update list ID: ' + id);

	// Get list and update fields.
	listDB.findOne({_id: id}).then((list) => {
		// TODO Handle errors.

		// Set values.
		list.title = title;
		list.description = description;
		list.color = color;
		list.image = image;
		list.checkable = checkable;
		list.created = created;
		list.updated = new Date();

		// Update in DB.
		listDB.update({_id: id}, list).then((data) => {
			// Send updated data and end.
			sendDataUpdate('List \'' + title + '\' was updated.');
			res.end();
		});
	});
});

// Add an item to a list.
app.post('/add/item', function (req, res) {
	// Get data from request body.
	var id = req.body.id;
	var text = req.body.text;

	console.log('Add ' + text + ' to list ' + id);

	// Get list and push item.
	listDB.findOne({_id: id}).then((list) => {
		// TODO Handle errors.

		// Push item to list items.
		var items = list.items ? list.items : [];
		items.push({'id': uuid.v4(), 'text': text, 'checked': false});

		console.log(items);

		// Set values.
		var updatedList = {
			'title': list.title,
			'description':  list.description,
			'color': list.color,
			'image': list.image,
			'checkable': list.checkable,
			'created': list.created,
			'updated': new Date(),
			'items': items
		}

		// Update in DB.
		listDB.update({_id: id}, updatedList).then((data) => {
			// Send updated data and end.
			sendDataUpdate('\'' + text + '\' was added to \'' + list.title + '\'.');
			res.end();
		});
	});
});

// Remove an item from a list.
app.post('/remove/item', function (req, res) {
	// Get data from request body.
	var itemid = req.body.id;
	var text = req.body.text;
	var listid = req.body.listid;

	console.log('Remove item ' + itemid + ' from list ' + listid);

	// Get list and remove item.
	listDB.findOne({_id: listid}).then((list) => {
		// TODO Handle errors.

		// Remove item from list items.
		list.items.splice(getItemIndex(list.items, itemid), 1);

		// Update in DB.
		listDB.update({_id: listid}, list).then((data) => {
			// Send updated data and end.
			sendDataUpdate('\'' + text + '\' was remoced from \'' + list.title + '\'.');
			res.end();
		});
	});
});

// Toggle checked for an item in a list.
app.post('/check/item', function (req, res) {
	// Get data from request body.
	var itemid = req.body.id;
	var listid = req.body.listid;

	console.log('Toggle check for item ' + itemid + ' in list ' + listid);

	// Get list and toggle item check.
	listDB.findOne({_id: listid}).then((list) => {
		// TODO Handle errors.

		// Toggle checked.
		var item = list.items[getItemIndex(list.items, itemid)];
		item.checked = !item.checked;

		// Update in DB.
		listDB.update({_id: listid}, list).then((data) => {
			// Send updated data and end.
			sendDataUpdate('\'' + item.text + '\' was toggled in \'' + list.title + '\'');
			res.end();
		});
	});
});

// Emits update event with list data to all connected clients.
function sendDataUpdate(event) {
    listDB.find({}, {}, function(err, lists) {
			// TODO Handle errors.
			var data = {'lists': lists, 'event': event};
			io.emit('update-data', JSON.stringify(data));
    });
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
