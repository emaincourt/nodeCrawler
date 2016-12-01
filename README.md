nodeCrawler
===================
**Easily setup a webcrawler with node.js**
----------------------------------------------------


**nodeCrawler ** is a very **generic** and **easy-to-setup** structure for developing a website crawler with **node.js**.

----------


Configuration
-------------

There is only a JSON configuration file that nodeCrawler needs to start **crawling a webpage.** The conf variable should at least contain  ```model```and ```attrs``` fields to be configured.

####JSON Configuration :
```javascript
var conf = {
	"model" : {
		"type" : String,
		"struct" : {
			"field" : value
		}
	},
	"attrs" : {
		"attribute" : {
			"type" : value,
			"format" : value,
			"selector" : value,
			"iterate" : value,
			"postmod" : {
				"task" : parameters
			},
			"value" : value
		}
	}
}
```
***
####Model :
```javascript
 type : String
```
 > The type field contains the way data will be returned. You can either choose "text" if you want to get it back without being formatted, or "html" if you want to add some html template
```javascript
 struct : JSON
```
 > The struct field contains the way data should be structured after being collected. We can illustrate it with the following code :
```javascript
"struct" : {
      "artist" : "",
      "release" : [
	      "style" : "",
	      "format" : "",
	      "category" : "",
	      "tracklist" : []
	],
}
```
> This way you can later merge data you got from different URLs refering to the same purpose without any modifications after. Each field needs to be instanciated with empty String or table.

***

####Attrs

```javascript
attribute : JSON
```
> The attribute field must have the same name as the field it refers to in the "struct" definition. This field must be described in JSON as follows :
```javascript
"attribute" : {
	"type" : value,
	"format" : value,
	"selector" : value,
	"iterate" : value,
	"postmod" : {
		"task" : parameters
	},
	"value" : value
}
```
```javascript
type : String
```
> The type field should be either ```text()``` or ```html()```. It refers to the method that should be used for extracting data from selection. If nothing has been declared, ```text``` will be used as the default value.
```javascript
format : String
```
> The type field should be either ```"text"``` or ```"array"```. It refers to the way collected values should be stored.
```javascript
selector : String
```
> This field is mandatory and must contain the jQuery selector that will be used to extract data from document.
```javascript
iterate : Array
```
> The iterate field allows to define multiple iterations of selection for the same selector that will be dynamically generated with values contained. Here is the code of an exemple :
```javascript
"tracklist" : {
    "format" : "array",
    "iterate" : [
      [2,3],[1,2]
    ],
    "selector" : "table:nth-child($0) > tbody > tr > td:nth-child(3)"
}
```
> In this example, the selector will successively be :
> ```table:nth-child(2) > tbody > tr > td:nth-child(1)```
> ```table:nth-child(2) > tbody > tr > td:nth-child(2)```
> ```table:nth-child(3) > tbody > tr > td:nth-child(1)```
> ```table:nth-child(3) > tbody > tr > td:nth-child(2)```
>
> and results will be saved in an array. You must declare your format field with ```"array"```value or only the first scrapped value will be saved.
```javascript
postmod : JSON
```
> The postmod field contains all the modifications needed to be performed on the output of our selection. Each task must be of type ```
"methodName" : "parameters"```. Let's see it with an example :
```javascript
"postmod" : {
    "match" : "/Format: ([0-9\"]+)/",
    "replace" : "\"Format: \",\"\"",
	"trim" : ""
}
```
> As here defined and considering ```value```as our selection output, the following operations will be performed :
> ```javascript
> value = value.match(/Format: ([0-9"]+/);
> value = value.replace("Format: ","");
> value = value.trim();
> ```

```javascript
value : String or Array
```
> The value field will contain the output. It doesn't need to be declared.

***

Examples
--------
####Most basic example of configuration
> This configuration file would fetch data contained in the selector field and store it in ```model.struct``` as a text field.
```javascript
var nodeCrawler = require('nodecrawler');
var express = require('express');
var conf = {
  "model" : {
    "type" : "text",
    "struct" : {
      "artist" : "",
      "release" : ""
    }
  },
  "attrs" : {
    "artist" : {
      "selector" : ".product-artist > h2 > a"
    },
    "release" : {
      "selector" : ".product-title > h2",
    }
  }
}

app.get('/parser',function(req,res){
  nodeCrawler.crawl(anyURL,conf,function(model){
    res.send(model);
  });
})
.listen(process.env.PORT || 3000);
```
####Example without HTML template

> Our configuration file should look like these.
```javascript
var nodeCrawler = require('nodecrawler');
var express = require('express');

var conf = {
  "model" : {
    "type" : "text",
    "struct" : {
      "artist" : "",
      "release" : "",
      "style" : "",
      "format" : "",
      "category" : "",
      "tracklist" : []
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

app.get('/parser',function(req,res){
  nodeCrawler.crawl(anyURL,conf,function(model){
    res.send(model);
  });
})
.listen(process.env.PORT || 3000);
```
####Example with HTML template

> Our configuration file should look like these. You may notice the way data will be injected into templates. Since tracklist has been declared as an ```Array```, the template will be repeated for all values stored inside.
>
```javascript
var nodeCrawler = require('nodecrawler');
var express = require('express');

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

app.get('/parser',function(req,res){
  nodeCrawler.crawl(anyURL,conf,function(model){
    res.send(model);
  });
})
.listen(process.env.PORT || 3000);
```
