//Test Case conditions
// 50x50 cells;
// 2x2 km;
// 5% moisture
// forecast for 2h

var path = require('path');
var embers = require('./../index');
var write2D = require('embersutils').write2D;
var fs = require('fs');

var opts = {
  ignitionPt: [41.7718400422817, -7.9167833239285],
  u: 1.5,
  alpha: 115,
  std: 10,
  moisture: 5,
  rows: 100,
  cols: 100,
  height: 6000,
  width: 6000
};

embers(opts, function(err, kmlMaps){

  if (err) throw err;

  fs.writeFileSync(path.join(__dirname, 'avg1h.kml'), kmlMaps['avg1h'], {encoding: 'utf8'});
  fs.writeFileSync(path.join(__dirname, 'udev1h.kml'), kmlMaps['udev1h'], {encoding: 'utf8'});
  fs.writeFileSync(path.join(__dirname, 'ldev1h.kml'), kmlMaps['ldev1h'], {encoding: 'utf8'});

});