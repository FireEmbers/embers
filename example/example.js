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
  U: 1.5,
  alpha: 115,
  std: 10,
  moisture: 15,
  rows: 100,
  cols: 100,
  height: 6000,
  width: 6000
}

embers(opts, function(err, kmlMaps, pathArrays){

  if (err) throw err;

  fs.writeFileSync(path.join(__dirname, 'worstCase.kml'), 
    kmlMaps['worstCase'], {encoding: 'utf8'});

  fs.writeFileSync(path.join(__dirname, 'bestCase.kml'), 
    kmlMaps['bestCase'], {encoding: 'utf8'});

  fs.writeFileSync(path.join(__dirname, 'averageCase.kml'), 
    kmlMaps['averageCase'], {encoding: 'utf8'});

  writePathArray('worstCaseArray.dat', pathArrays['worstCase']);
  writePathArray('bestCaseArray.dat', pathArrays['bestCase']);
  writePathArray('averageCaseArray.dat', pathArrays['averageCase']);

});

function writePathArray(filename, array){

  var file = fs.createWriteStream(path.join(__dirname, filename));
  file.on('error', function(err){ 
    return console.log('Error on writing path coordinates file')
  });
  array.forEach( function(v){
    file.write(v.join(',')+'\n');
  });
  file.end();
}





