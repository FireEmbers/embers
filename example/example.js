//Test Case conditions
// 50x50 cells;
// 2x2 km;
// 5% moisture
// forecast for 2h

var path = require('path');
var embers = require('./../index');
var write2D = require('embersutils').write2D;
var fs = require('fs');

var ignitionPt = //[ 41 + 47 / 60 + 6.39/3600,- (8 + 8/60 + 26.43/3600)];
[41.7718400422817, -7.9167833239285];

var U = 1;
var alpha= 135;
var std = 10;

embers(ignitionPt, U, std, alpha, function(kmlMaps, pathArrays){

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





