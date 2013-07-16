"use strict";

var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

app.get('/', function (request, response) {
    fs.readFile("index.html", function (err, data) {
        var contents = data.toString();
        response.send(contents);
    });
});

app.get('/styles.css', function (request, response) {
    fs.readFile("styles.css", function (err, data) {
        var contents = data.toString();
        response.contentType('text/css');
        response.send(contents);
    });
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Listening on " + port);
});
