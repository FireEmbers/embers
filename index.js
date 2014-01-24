var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');
var credentials = require('./credentials');
var CrowdProcess = require('crowdprocess')(credentials);
var fs = require('fs');
var join = require('path').join;
var DataUnitStream = require('./src/dataUnitStream');
var postProcessing = require('./src/post-processing.js');

var write2D = require('./../utils/src/write2D');

var programString = fs.readFileSync(join(__dirname, 'src', 'program.min.js'));

module.exports = function(opts, callback){

  var ignitionPt = opts.ignitionPt;
  var u = opts.u;
  var std = opts.std;
  var moisture = opts.moisture;
  var alpha = opts.alpha;
  var rows = opts.rows;
  var cols = opts.cols;
  var height = opts.height;
  var width = opts.width;

  console.log('Embers start...');

  console.log('Resolution: %dx%d',rows,cols, 'Size:', height,'[km]');

  //var moisture = 5; //percentage 

  //compute boundaries in ETRS89 LAEA (srid 3035)
  //to pass to the postgis client 
  var boundaries = computeBoundaries(ignitionPt, rows, cols, height, width);
  function computeBoundaries(cA, rows, cols, height, width){

    var sridA = 4258;
    var sridB = 3035;

    var f = true;

    cB = cconv(sridA, sridB, cA, f);

    var W = cB[0] - width/2;
    var E = cB[0] + width/2;
    var N = cB[1] + height/2;
    var S = cB[1] - height/2;

    var boundaries = {
      north: N,
      south: S,
      east: E,
      west: W,
      r: rows,
      c: cols
    };

    return boundaries;
  }

  var clcMap;
  var aspectMap;
  var slopeMap;

  getClcMap();
  function getClcMap(){

    getGisMap(boundaries, 'postgis', onClcMap);

    function onClcMap(err, map){

      if (err) return callback(err, null);

      console.log('Got clc maps...');

      clcMap = JSON.parse(map);

      getTerrainMap();
    }
  }

  function getTerrainMap(){
    getGisMap(boundaries, 'grass',onTerrainMap);

    function onTerrainMap(err, terrainMaps){

      if (err) return callback(err, null);

      console.log('Got terrain maps...');

      terrainMaps = JSON.parse(terrainMaps);

      aspectMap = terrainMaps["aspect"];
      slopeMap = terrainMaps["slope"];

      computeIgnMaps();

    }
  }

  function computeIgnMaps(){

    //Build Run function string from browserify code
    var RunString = getProgram();
    //fs.writeFileSync('Run.js', RunString, {encoding: 'utf8'});
    var job = CrowdProcess(RunString, postProcessMaps);
    function getProgram(){

      function Run(dataUnit){

        //never mind the path inside the req(), is just a reference for the 
        //browserified module in program.js
        var engine = req('/home/fsousa/src/crp/embers/engine/src/program.js');

        return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);

      }

      var
       string = Run.toString() + ';' + programString +
      'var rows =' + rows.toString() + ';' +
      'var cols =' + cols.toString() + ';' +
      'var height =' + height.toString() + ';' +
      'var width =' + width.toString() + ';' +
      'var slopeMap =' + JSON.stringify(slopeMap) + ';' +
      'var aspectMap =' + JSON.stringify(aspectMap) + ';' +
      'var clcMap =' + JSON.stringify(clcMap) + ';';

      return string;
    }

    //create data unit stream
    //console.log(moisture, u, alpha, std);
    var dataStream = DataUnitStream(moisture, u, alpha, std, 2);
    console.log('Running simulations...');

    dataStream.pipe(job);

    //dataStream.on('data', function (data) {console.log(data)});

    var resultCounter = 0;
    job.on('data', function (map) {
      console.log(resultCounter++, 'Maps done...');
      postProcessing.addMap(map);
      var mapPP = ignToKml(map, 60, ignitionPt, rows, cols, height, width);
      fs.writeFileSync('./map_' + resultCounter + '.kml', mapPP['kml'], {encoding: 'utf8'});
      
      write2D(JSON.parse(map), rows, cols, './testmap_'+resultCounter+'.map');
    });

    job.on('error', function (err) {
      console.log('-->error:', err);
    });
  }

  function postProcessMaps(allMaps){

    console.log('Post-processing...');

    var finalMaps = postProcessing.process();

    var tf = 60;

    var avg = ignToKml(finalMaps['avg'], tf, ignitionPt, rows, cols, height, width);
    var udev = ignToKml(finalMaps['udev'], tf, ignitionPt, rows, cols, height, width);
    var ldev = ignToKml(finalMaps['ldev'], tf, ignitionPt, rows, cols, height, width);

    var kmlMaps = {
      'avg1h': avg['kml'],
      'udev1h': udev['kml'],
      'ldev1h': ldev['kml']
    };

    callback(null, kmlMaps);
  }
};