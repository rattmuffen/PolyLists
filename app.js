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

var port = process.env.PORT || 7845;

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));


var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});