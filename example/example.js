//Test Case conditions
// 50x50 cells;
// 2x2 km;
// 5% moisture
// forecast for 2h

var path = require('path');
var embers = require('./../index');
var write2D = require('embersutils').write2D;
var credentials = require('./../credentials');
var fs = require('fs');

var opts = {
  ignitionPt: [41.7718400422817, -7.9167833239285],
  u: 2, //mid flame wind speed
  alpha: 0,
  std: 30,
  moisture: 5,
  rows: 250,
  cols: 250,
  height: 10000,
  width: 10000,
  n: 100,
  credentials: credentials
};

embers(opts, function(err, kmlMaps){

  if (err) throw err;

  for ( var param in kmlMaps ) {

    fs.writeFileSync(path.join(__dirname, param + '.kml'), kmlMaps[param], {encoding: 'utf8'});
  }

});
