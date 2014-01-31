#Embers

Embers is a stochastic fire model that runs on top of [CrowdProcess](http://crowdprocess.com) and is written in node.
We use existing fire models (ie, [firelib](http://www.frames.gov/rcs/0/935.html), [farsite](https://collab.firelab.org/software/projects/farsite/repository/revisions/72/show/branches/api/c++)) which require deterministic input parameters and run monte carlo simulations with probability distribution functions for the input data. This method allows for uncertainty quantification of the solution and, much like probabilistic weather forecast, you end up with a probabilistic fire front forecast.

You can install this demo and run it using node. Get started by trying the example below.

The output of this demo are kml files that can be imported to google earth.

##Install

```
git clone git@github.com:FireEmbers/embers.git; cd embers; npm install
```

##Usage

You can skip ahead and run a fully functional example with `node example/example.js`. You will be producing worst case and best case forecasts based on a 95% confidence interval. Just import the resulting `.kml` files with google earth.

##Credentials 
You'll need to register your email in CrowdProcess in order to run the module. Then, just put the registered email and password in the credentials.json file, in the root of the module with the following format:

```
{
    "email": "your@email.com",
    "password": "yourpassword1"
}
```

###Require

```
var embers = require('embers');
```
###Define parameters

Every parameter bellow is only an example. Go ahead and you can fidle with the values 

```
var opts = {
  ignitionPt: [41.7718400422817, -7.9167833239285], //[latitude, longitude]
  u: 2, //mid flame higth
  alpha: 115, //wind direction in degrees, clockwise from north
  std: 50, //standard deviation in percentage of average speed
  moisture: 5, // fuel moisture in percentage 
  height: 10000, // Computational domain dimentions in km
  width: 10000,
  rows: 200, //Computational resolution size
  cols: 200,
  n: 100 //
};
```

###Call Embers
```
embers(opts, function(err, kmlMaps){

  if (err) throw err;

  for ( var param in kmlMaps ) {

    fs.writeFileSync( '' + param + '.kml'), kmlMaps[param], {encoding: 'utf8'});
  }

});

```

##Results

The following image show worst case and best case scenarios, repectvely in red and orange.

![embersDemo!](https://raw.github.com/FireEmbers/embers/master/example/embers.png)

