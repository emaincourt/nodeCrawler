var request = require('request');

// Creation of a virtual DOM to allow elements manipulation with JQuery
var jsdom = require("jsdom").jsdom;
var doc = jsdom();
var window = doc.defaultView;
var $ = require('jquery')(window);

/*
  Input :
    - url   : the url to crawl
    - conf  : the JSON configuration file
    - cb    : callback function to execute after asynchronous request achievement
  Output :
    null
Main function that performs the url request and crawls the answer's DOM content.
*/
var crawl = function(url,conf,cb){
  request(url, {headers: {'user-agent': 'node.js'}}, function (error, response, body) {
      if (error || response.statusCode != 200)
        return -1;

      conf.model.type = conf.model.type || "text";

      for(var attr in conf.attrs){
        parseAttribute(conf.attrs[attr],body);
      }
      var model = buildStructure(conf);
      cb(model);
  });
}

/*
  Input :
    - attr    : the attribute that will be parsed
    - dom     : the virtual DOM
  Output :
    null
This function initializes the attribute attributes and will then search for the needed element inside of the virtual DOM.
Post modifications will also be performed here.
*/
var parseAttribute = function(attr,dom){

  attr.type       = attr.type     || "text()";
  attr.format     = attr.format   || "text";
  attr.selector   = attr.selector || null;
  attr.iterate    = attr.iterate  || [0];
  attr.postmod    = attr.postmod  || {};

  attr.value      = (attr.format == "array") ? [] : "";
  attr.type       = attr.type.toLowerCase();
  attr.format     = attr.format.toLowerCase();

  if(attr.selector == null)
    return -1;

  for(var i=0;  i<attr.iterate.length;  i++)
  {
    var loop = attr.iterate[i].length || 1;
    for(var j = 0; j < loop; j++)
    {
      var element = $(dom).find(attr.selector.replace("$"+i,attr.iterate[i][j]));
      var parser  = 'element' + '.' + attr.type;

      if(attr.format === "array")
        attr.value.push(applyPostModifications(attr.postmod,eval(parser)));
      else
        attr.value = applyPostModifications(attr.postmod,eval(parser));
    }
  }

}

/*
  Input :
    - postmod       : the JSON table of post modifications that need to be performed on our attribute
    - element       : the attribute that will be modified
  Output :
    null
This function parses and executes the needed post modification on element
*/
var applyPostModifications = function(postmod,element){
  for(var key in postmod)
  {
    var ev = 'element.' + key + '(' + postmod[key] + ')';
    if(typeof element === 'object')
      element = element[0];
    element = eval(ev);
  }
  return element;
}

var buildTextStructure = function(conf){
  for(var key in conf.model.struct)
    if(conf.attrs[key] != "undefined")
      if(typeof conf.model.struct[key] == "object")
        for(var i = 0; i < conf.attrs[key].value.length; i++)
          conf.model.struct[key].push(conf.attrs[key].value[i]);
      else
        conf.model.struct[key] = conf.attrs[key].value;
    else
      conf.model.struct[key] = undefined;
  return conf.model.struct;
}

/*
  Input :
    - conf  : the JSON configuration file
  Output :
    null
This function adds an hypothetical template to data that have been fetched according to the configuration file.
*/
var buildStructure = function(conf){

  for(var key in conf.model.struct)
    if(conf.attrs[key] != "undefined"){
      var template = (conf.model.type.toLowerCase() === "html") ? ((typeof conf.model.struct[key] === "object") ? conf.model.struct[key][0] || "<p>$</p>" : conf.model.struct[key] || "<p>$</p>") : "$";

      if(typeof conf.model.struct[key] === "object"){
        for(var i = 0; i < conf.attrs[key].value.length; i++)
          if(conf.model.struct[key].length <= i)
            conf.model.struct[key].push(template.replace('$',conf.attrs[key].value[i]));
          else
            conf.model.struct[key][i] = template.replace('$',conf.attrs[key].value[i]);
      }
      else
        conf.model.struct[key] = template.replace('$',conf.attrs[key].value);
    }
    else
      conf.model.struct[key] = undefined;
  return conf.model.struct;
}

/*  James Padolsey
    JQuery Expression extension for RegEx
    http://james.padolsey.com/javascript/regex-selector-for-jquery/
*/
$.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test($(elem)[attr.method](attr.property));
}

exports.crawl = crawl;
