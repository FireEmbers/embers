#Embers demo API 

##Install

###clone git repository 

git clone git@github.com:FireEmbers/demoAPI.git

###Run npm install
```
npm install
```

##Usage example (see also [example.js](https://github.com/FireEmbers/demoAPI/blob/master/example/example.js))

```
var embers = require('./../index');

var ignitionPt = [42.99982, -8.112345]; //[latitude, longitude]

var U = 5 // average wind speed at 10 meters above ground

var std = 10 //standard deviation in percentage of average speed

var alpha = 135 //wind direction, degrees clockwise from north


embers(ignitionPt, U, std, alpha, callback);

function callback(maps){

  //maps is an object with the contour array of 3 different forecast cases:

  var worstCase = maps['worstCase'] ;

  var bestCase = maps['bestCase'] ;

  var averageCase = maps['averageCase'] ;
}

```



