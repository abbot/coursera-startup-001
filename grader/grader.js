#!/usr/bin/env node

/*
References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var cheerio = require('cheerio');
var restler = require('restler');
var Q = require('q');

var readFile = function(filename) {
    "use strict";
    var d = Q.defer();
    fs.readFile(filename, function(err, data) {
        if(err) {
            d.reject(new Error(err));
        }
        d.resolve(data);
    });
    return d.promise;
}

var readUrl = function(url) {
    "use strict";
    var d = Q.defer();
    restler.get(url).on("success", function(data, response) {
        d.resolve(cheerio.load(data));
    });
    return d.promise;
}

var assertFileExists = function(infile) {
    "use strict";
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    "use strict";
    return readFile(htmlfile).then(function(data) {
        return cheerio.load(data);
    });
};

var loadChecks = function(checksfile) {
    "use strict";
    return readFile(checksfile).then(function(data) {
        return JSON.parse(data).sort();
    });
};

var checkFile = function(input, checks) {
    "use strict";
    return Q.spread([input, checks], (function($, checks) {
        var ii, present, out = {};
        for(ii in checks) {
            if(checks.hasOwnProperty(ii)) {
                present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
            }
        }
        return out
    }));
};

var checkUrl = function(url, checks) {
    "use strict";
    restler.get(url).on('success', function(data, response) {
        console.log(data);
    });
};

/*jshint multistr: true */
var doc = "\n\
Usage: grader.js [options]\n\
\n\
Options:\n\
  -h, --help                 output usage information\n\
  -c, --checks <check_file>  Path to checks.json [default: checks.json]\n\
  -f, --file <html_file>     Path to index.html [default: index.html]\n\
  -u, --url <URL>            URL to check (overrides --file)";
var docopt = require("docopt");

if(require.main === module) {
    var opts = docopt.docopt(doc);
    var checks = loadChecks(opts['--checks']);
    var input;
    if(opts['--url']) {
        input = readUrl(opts['--url']);
    } else {
        input = cheerioHtmlFile(opts['--file']);
    }
    checkFile(input, checks).then(function(checkJson) {
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    });
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
