#Embers demo API 

Embers is a stochastic fire model that runs on top of [CrowdProcess](http://crowdprocess.com) and is written in node.
We use existing fire models (ie, [firelib](http://www.frames.gov/rcs/0/935.html), [farsite](https://collab.firelab.org/software/projects/farsite/repository/revisions/72/show/branches/api/c++)) which require deterministic input parameters and run monte carlo simulations with probability distribution functions for the input data. This method allows for uncertainty quantification of the solution and, much like probabilistic weather forecast, you end up with a probabilistic fire front forecast.


You can install this demo and run it using node. Get started by trying the example below.

The output of this demo are kml files that can be imported to google earth.

##Install


```
git clone git@github.com:FireEmbers/demoAPI.git; cd demoAPI; npm install
```

##Usage

you skip ahead and run a fully functional example with `node example/example.js`.


To use the API you have to do something like this:

###Require

```
var embers = require('demoAPI');
```
###Define main parameter

```
var ignitionPt = [41 + 47 / 60 + 6.39/3600,- (8 + 8/60 + 26.43/3600)]; //[latitude, longitude]

var U = 5 // average wind speed at 10 meters above ground

var std = 10 //standard deviation in percentage of average speed

var alpha = 135 //wind direction, degrees clockwise from north
```

###Call API
```
embers(ignitionPt, U, std, alpha, onIgnitionMaps);

function onIgnitionMaps(kmlMaps, pathArray){

  //kmlMaps is an object with the contour array of 3 different forecast cases:

  fs.writeFileSync('worstCase.kml', kmlMaps['worstCase'], {encoding: 'utf8'});
  fs.writeFileSync('bestCase.kml', kmlMaps['bestCase'], {encoding: 'utf8'});
  fs.writeFileSync('averageCase.kml', kmlMaps['averageCase'], {encoding: 'utf8'});

  //pathArray contains the coordinates array of the three scenarios.
}

```

##Results

The following image show average case, worst case and best case scenarios regarding wind speed variability

![embersDemo!](https://raw.github.com/FireEmbers/demoAPI/master/example/embersDemo.png)

