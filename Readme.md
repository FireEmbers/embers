#Embers demo API 

##Install 

```
npm install github repo
```

##Usage

```
var embers = require('embers');

var ignitionPt = [42.99982, -8.112345]; //[latitude, longitude]

var U = 5 // average wind speed at 10 meters above ground

var std = standard deviation in percentage of average speed

var alpha = 135 //wind direction, degrees clockwise from north


embers(ignitionPt, U, std, alpha, callback);

function callback(maps){

  //maps is an object with the contour array of 3 different forecast cases:

  var worstCase = maps['worstCase'] ;

  var bestCase = maps['bestCase'] ;

  var averageCase = maps['averageCase'] ;
}

```



