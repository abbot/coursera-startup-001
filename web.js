"use strict";

var express = require('express');
var fs = require('fs');
var app = express();

app.use("/img", express.static('img'));
app.use("/css", express.static('css'));

app.get('/', function (request, response) {
    fs.readFile("index.html", function (err, data) {
        var contents = data.toString();
        response.send(contents);
    });
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Listening on " + port);
});
