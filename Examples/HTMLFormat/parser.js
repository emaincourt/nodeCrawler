var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var request = require('request');
var path = require('path');
var nodeCrawler = require('nodecrawler');

var jsdom = require("jsdom").jsdom;
var doc = jsdom();
var window = doc.defaultView;
var $ = require('jquery')(window);

var app = express();
var jsonParser = bodyParser.json();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Accept-Encoding,DNT');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})
.use(bodyParser.json({}));

app.get('/parser',function(req,res){
  nodeCrawler.crawl("http://www.juno.co.uk/products/mike-huckaby-the-versatility-ep/470042-01/",conf,function(model){
    res.send(model);
  });
})
.use(function(req, res){
  res.sendFile(__dirname + '/404.html');
})
.listen(process.env.PORT || 3000);

var conf = {
  "model" : {
    "type" : "html",
    "struct" : {
      "artist" : "<div>$</div>",
      "release" : "<span>$</span>",
      "style" : "<div>$</div>",
      "format" : "<div>$</div>",
      "category" : "<div>$</div>",
      "tracklist" : ["<tr><td>$</td></tr>"]
    }
  },
  "attrs" : {
    "artist" : {
      "selector" : ".product-artist > h2 > a"
    },
    "release" : {
      "selector" : ".product-title > h2",
      "postmod" : {
        "trim" : ""
      }
    },
    "style" : {
      "selector" : ".product-label > h2",
      "postmod" : {
        "trim" : ""
      }
    },
    "format" : {
      "selector" : ".product-meta",
      "postmod" : {
        "match" : "/Format: ([0-9\"]+)/",
        "replace" : "\"Format: \",\"\"",
        "trim" : ""
      }
    },
    "category" : {
      "selector" : ".product-meta",
      "postmod" : {
        "match" : "/Cat: ([A-Z0-9 \"]+)/",
        "replace" : "\"Cat: \",\"\"",
        "trim" : ""
      }
    },
    "tracklist" : {
      "format" : "array",
      "iterate" : [
        [
          2,3
        ]
      ],
      "selector" : "[ua_location='tracklist'] > table:nth-child($0) > tbody > tr > td:nth-child(3)"
    }
  }
}
