var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');

module.exports = function(opts, callback){

  var ignitionPt = opts.ignitionPt;
  var U = opts.U;
  var std = opts.std;
  var moisture = opts.moisture;
  var alpha = opts.alpha;
  var rows = opts.rows;
  var cols = opts.cols;
  var height = opts.height;
  var width = opts.width;

  console.log('Embers demo start...');

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
  var ignMaps = new Array(3);

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

    console.log('Running simulations...');


    //dataUnits array has 3 sub arrays, each for a different cenario of wind speed
    //Each data Unit is [% moisture, Wind Speed in m/s, wind direction degrees clockwise from north]

    Uavg = U;
    Umax = U*(1+std/100);
    Umin = (U*(1-std/100) >= 0) ? U*(1-std/100): 0;
    var dataUnits = [
      [moisture, Uavg, alpha], //Average speed
      [moisture, Umin, alpha], //Min speed
      [moisture, Umax, alpha]  //Max speed
    ];

    //This is done in sync
    
    for (n = 0; n < dataUnits.length; n++){
      var ignMap = Run(dataUnits[n]);
      if ( ignMap === null ) {
        return callback('Ignition Map came out null', null);
      }
      ignMaps[n] = JSON.parse(ignMap);
    }

    function Run(dataUnit){

      return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);
    }

    postProcessMaps();
  }

  function postProcessMaps(){

    console.log('Post-processing...');
    var maps = {
      'averageCase': ignMaps[0],
      'bestCase': ignMaps[1], 
      'worstCase': ignMaps[2],
      'clc': clcMap
    }

    var tf = 60*13;

    var worstCase = ignToKml(maps['worstCase'], tf, ignitionPt, rows, cols, height, width);
    var bestCase = ignToKml(maps['bestCase'], tf, ignitionPt, rows, cols, height, width);    
    var averageCase = ignToKml(maps['averageCase'], tf, ignitionPt, rows, cols, height, width);

    var kmlMaps = {
      'worstCase': worstCase['kml'],
      'bestCase': bestCase['kml'],
      'averageCase': averageCase['kml']
    };

    var pathArrays = {
      'worstCase': worstCase['path'],
      'bestCase': bestCase['path'],
      'averageCase': averageCase['path']
    }

    callback(null, kmlMaps, pathArrays);
  }



}