#Embers demo API 

##Install 

```
npm install github repo
```

##Usage

```
var embers = require('embers');

var ignitionPt = [42.99982, -8.112345]; //[latitude, longitude]

var U = 5 // wind speed at 10 meters above ground

var alpha = 135 //wind direction, degrees clockwise from north


embers(ignitionPt, U, alpha, callback);

function callback(maps){

  //maps is an object with the contour array of 3 diferente forecast cases:

  var worstCase = maps['wrostCase'] ;

  var bestCase = maps['bestCase'] ;

  var averageCase = maps['averageCase'] ;
}

```



